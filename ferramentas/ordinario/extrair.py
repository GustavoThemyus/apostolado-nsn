#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lê o PDF do Ordinário da Missa e devolve os blocos em JSON.

    python3 ferramentas/ordinario/extrair.py <pdf>

Parente de `ferramentas/proprios/extrair.py`, e de propósito separado dele:
as regras de lá foram afinadas contra sete folhas de próprio, e este é outro
impresso, com outras armadilhas. O que as duas têm em comum é o método —
separar as colunas pela posição que o `pdftohtml -xml` dá a cada fragmento,
e não por adivinhação de layout.

O impresso é uma tabela do Word de duas colunas, português à esquerda e
latim à direita, com as rubricas em Arial itálico atravessando a largura
inteira:

    Arial, de qualquer corte                 rubrica
    centrado e começando em negrito          título
    "Ver a Missa do dia", em Arial           lugar do próprio
    redondo à esquerda / à direita           português / latim

O resultado é **rascunho**: sai daqui para `gerar.py` conferir e arrumar,
não para ir direto ao site.
"""
import collections, io, json, re, subprocess, sys, xml.etree.ElementTree as ET

# O meio da página, em pixels do pdftohtml: a coluna da esquerda vai de 43 a
# 446 e a da direita de 455 a 858, numa página de 892.
MEIO = 450

# As linhas do corpo ficam a 31px uma da outra; o ℣, o ℟ e as vogais
# acentuadas que o arquivo desenha em Calibri vêm de outra fonte e se
# deslocam dentro da própria linha.
#
# 13, e não 8: na página 19 o "í" de "incéndere" e o "ó" de "odórem" descem
# dez pixels, e com a folga antiga viravam uma linha só deles, que o extrator
# soltava noutro lugar — as duas palavras iam ao ar sem o acento, partidas em
# "d cere" e "od rem". Medidos os deslocamentos do impresso inteiro, eles vão
# até 13px e a linha seguinte nunca vem antes de 15.
JUNTO = 13

# Onde nenhuma linha de coluna começa. Toda linha de corpo nasce na margem
# da sua coluna, 43 à esquerda e 455 à direita; o texto centrado da página,
# esse, começa bem adentro. Sem este piso, qualquer linha de corpo cujo
# português chegasse ao fim da largura cruzaria o meio da página e passaria
# por título — e passava: o Kyrie inteiro saía como nove títulos.
#
# 140, e não 150: os dois títulos de apêndice são os que mais à esquerda
# começam, em 149 e 145, e um piso de 150 deixava os dois de fora. Abaixo
# deles, a linha de corpo que mais adentro nasce é a da consagração, em 52.
CENTRADO = 140

# O vão entre dois fragmentos que vale por um espaço, em pixels.
VAO = 4

# O vão que denuncia duas colunas, e não uma linha centrada. Nos títulos de
# verdade os fragmentos são contíguos: o maior vão interno deles é zero. As
# palavras da consagração vêm em versalete recuado, em negrito, e cruzam o
# meio da página como um título cruzaria — o que as separa é a goteira entre
# as colunas, 242 pixels na página 30.
GOTEIRA = 60

# O quanto um fragmento pode passar do meio da página e ainda ser coluna.
#
# A coluna da esquerda vai de 43 a 446, mas três linhas do impresso chegam a
# 453 — três pixels adiante do meio. A prosa de uma coluna só, essa, passa
# dos 850. Medido o impresso inteiro, nenhuma linha transborda entre 20 e
# 220 pixels: ou é coluna e para logo ali, ou é largura inteira.
TRANSBORDO = 20

# O salto que, na prosa de largura inteira, vale por parágrafo novo.
#
# A tabela de duas colunas não precisa disto: ali o parágrafo é a célula, e
# quem o parte é a fala. A prosa corrida não tem célula nenhuma — as quatro
# citações do Magistério e as orações de ação de graças saíam num parágrafo
# só, de trezentas palavras. Medidas as páginas 2, 3, 45, 46 e 50, dentro de
# um parágrafo as linhas andam de 30 a 32 pixels e entre dois parágrafos o
# salto nunca é menor que 46.
PARAGRAFO = 36

# A marca que abre parágrafo na prosa. Não sai daqui: `costurar` a consome.
NOVO_PARAGRAFO = "\x00"

# Os dois lados colados num fragmento só.
#
# O pdftohtml entrega cada célula da tabela em seu fragmento, salvo uma vez:
# na terceira invocação do Agnus Dei da página 34 ele junta as duas num
# fragmento de 43 a 858, e o português sai com o latim pendurado no fim. As
# outras duas invocações, de texto igual, vêm separadas como todas.
#
# A chave é o texto exato, e cada entrada tem de servir uma vez: uma remessa
# nova do PDF que arrume a colagem **quebra** o extrator em vez de passar
# calada.
COLADOS = {
    "Cordeiro  de  Deus,  que  tirais  os  Agnus  Dei,  qui  tollis  peccáta ":
        "Agnus  Dei,",
}

# Quantas vezes cada entrada de COLADOS serviu, para conferir ao fim.
usoDosColados = collections.Counter()

# A cruz da bênção. O Word a escreveu em Wingdings, código 0x58, que o
# pdftohtml entrega como U+F058, na área de uso privado, e que nenhuma fonte
# do site desenharia. Desenhando o glifo do PDF em 150dpi vê-se uma cruz de
# quatro braços que alargam nas pontas, simétrica nos dois eixos: é a cruz
# pátea, U+2720, e não a latina nem um xis.
CRUZ = "✠"
WINGDINGS_CRUZ = ""

# Onde o impresso manda buscar o próprio do dia em vez de imprimir o texto.
# São dez: Intróito, Coleta, Epístola, Gradual, Evangelho, Ofertório,
# Secreta, Prefácio, Comunhão e Pós-comunhão.
VER_A_MISSA = re.compile(r"^Ver a Missa do dia\.?$")

# Quem abre fala nova dentro de uma célula. O impresso alterna sacerdote e
# ministro na mesma linha da tabela, e sem isto o diálogo inteiro sairia num
# parágrafo só, de um lado e do outro.
ABRE_FALA = re.compile(r"^(S\.|M\.|T\.|C\.|P\.|℣\.|℟\.)")

# A fala que começa no meio da linha, depois de ponto final. É o que
# desencontrava os dois lados: o "℟. Amém." do fim do Asperges e das orações
# pelo Papa vem emendado na oração, do lado português, e em linha só sua do
# lado latino; e na página 38 é o "M. Amém." que vem emendado. Partindo
# pelos dois lados com a mesma régua, os parágrafos voltam a casar.
# Conferidas as onze ocorrências do impresso, todas são fala de verdade:
# não há "S. Pedro" nem abreviatura nenhuma que esta régua parta ao meio.
FALA_NO_MEIO = re.compile(r"(?<=[.!?])\s+(?=(?:S\.|M\.|T\.|C\.|P\.|℣\.|℟\.)\s)")

# As fontes que são corpo de texto, e não rubrica. Entram aqui porque o
# arquivo recorre a elas para desenhar um glifo que a Times não tem — o ℣ e
# o ℟ em MS Gothic, MS Mincho e Lucida Sans Unicode, e, na página 19, as
# vogais acentuadas "í" e "ó" em Calibri, no meio de uma palavra latina.
# Tratar Calibri como rubrica partia "incénsere" em "cere" e "in od".
CORPO = ("Times", "MS Gothic", "MS Mincho", "Lucida Sans Unicode", "Calibri",
         "Wingdings")


def fragmentos(pdf):
    xml = subprocess.run(["pdftohtml", "-xml", "-i", "-stdout", pdf],
                         capture_output=True, check=True).stdout.decode("utf-8")
    raiz = ET.fromstring(xml)
    # O poppler só declara cada fonte na primeira página em que ela aparece,
    # e dali por diante a reaproveita pelo id. Lendo as declarações página a
    # página, da página 6 em diante toda rubrica caía como texto de coluna.
    fontes = {}
    for pagina in raiz.iter("page"):
        for fs in pagina.findall("fontspec"):
            fontes[fs.get("id")] = fs.get("family", "")
        for texto in pagina.iter("text"):
            familia = fontes.get(texto.get("font"), "")
            cru = "".join(texto.itertext()).replace(WINGDINGS_CRUZ, CRUZ)
            if not cru.strip():
                continue
            marcas = {filho.tag for filho in texto}
            fragmento = {
                "pagina": int(pagina.get("number")),
                "topo": int(texto.get("top")),
                "esq": int(texto.get("left")),
                "largura": int(texto.get("width")),
                "texto": cru,
                "negrito": "b" in marcas or "Bold" in familia,
                "italico": "i" in marcas or "Italic" in familia,
                "rubrica": "Arial" in familia,
                "corpo": any(f in familia for f in CORPO),
            }
            for lado in descolar(fragmento):
                yield lado


def descolar(fragmento):
    """Devolve o fragmento, ou os dois lados dele se vier colado."""
    inicio = COLADOS.get(fragmento["texto"])
    if inicio is None:
        return [fragmento]
    usoDosColados[fragmento["texto"]] += 1
    corte = fragmento["texto"].index(inicio)
    esquerda = dict(fragmento, texto=fragmento["texto"][:corte],
                    largura=MEIO - fragmento["esq"] - 4)
    direita = dict(fragmento, texto=fragmento["texto"][corte:], esq=455,
                   largura=fragmento["esq"] + fragmento["largura"] - 455)
    return [esquerda, direita]


def linhas(pdf):
    """
    Junta os fragmentos de mesma altura numa linha só, da esquerda para a
    direita, por vizinhança e não por arredondamento.

    A tabela do Word sai do pdftohtml célula a célula — a portuguesa inteira,
    depois a latina —, e é esta junção por altura que remonta a linha da
    tabela com os dois lados lado a lado.
    """
    porPagina = {}
    for f in fragmentos(pdf):
        porPagina.setdefault(f["pagina"], []).append(f)

    for pagina in sorted(porPagina):
        atual, topo = [], None
        for f in sorted(porPagina[pagina], key=lambda f: f["topo"]):
            if topo is None or f["topo"] - topo <= JUNTO:
                topo = topo if topo is not None else f["topo"]
                atual.append(f)
            else:
                yield sorted(atual, key=lambda f: f["esq"])
                atual, topo = [f], f["topo"]
        if atual:
            yield sorted(atual, key=lambda f: f["esq"])


def juntar(fs):
    """
    O texto de um lado da linha, com o itálico preservado.

    Os espaços de fora da marca ficam de fora dela: o fragmento em itálico
    vem do PDF com o espaço dentro, e marcar o fragmento inteiro colaria a
    palavra seguinte na anterior.

    Entre dois fragmentos afastados na página entra um espaço, mesmo que
    nenhum dos dois o traga: o título centrado vem partido em pedaços sem
    espaço nenhum — "ORDINÁRIO", "DA", "MISSA" —, e colados davam
    "ORDINÁRIODAMISSA".
    """
    partes = []
    fim = None
    for f in fs:
        t = re.sub(r"\s+", " ", f["texto"])
        if f["italico"] and t.strip():
            t = "%s[i]%s[/i]%s" % (
                " " if t[:1] == " " else "", t.strip(), " " if t[-1:] == " " else "")
        if (partes and fim is not None and f["esq"] - fim >= VAO
                and not partes[-1].endswith(" ") and not t.startswith(" ")):
            partes.append(" ")
        partes.append(t)
        fim = f["esq"] + f["largura"]
    # O itálico que fecha e reabre entre dois fragmentos vizinhos vira um só,
    # e **sem** espaço no lugar: dentro de uma linha o espaço já veio do PDF
    # ou do vão. Pondo um aqui, "recebe-l’O" — que o arquivo escreve em três
    # fragmentos, por causa do apóstrofo tipográfico — saía "recebe-l ’ O".
    junto = re.sub(r"\[/i\](\s*)\[i\]", r"\1", "".join(partes))
    return re.sub(r"\s+", " ", junto).strip()


def costurar(linhas_):
    """
    As linhas de uma célula viram parágrafos, um por fala.

    A quebra de página não interrompe nada: a oração que começa numa folha e
    acaba na outra chega aqui como duas linhas seguidas da mesma coluna, e
    emenda como qualquer outra. Linha que termina em hífen emenda sem espaço
    e **com** o hífen, que neste impresso é sempre hífen de verdade.
    """
    pars = []
    for linha in linhas_:
        if linha.startswith(NOVO_PARAGRAFO):
            pars.append(linha[len(NOVO_PARAGRAFO):])
        elif not pars or ABRE_FALA.match(linha):
            pars.append(linha)
        elif pars[-1].endswith("-"):
            pars[-1] += linha
        else:
            pars[-1] += " " + linha
    inteiros = [re.sub(r"\[/i\] ?\[i\]", " ", p).strip() for p in pars if p.strip()]
    return [parte for p in inteiros for parte in FALA_NO_MEIO.split(p) if parte.strip()]


def extrair(pdf):
    blocos = []
    pt, la = [], []
    usoDosColados.clear()
    # A página e a altura da linha anterior, para medir o salto até a
    # próxima: é ele que separa dois parágrafos de prosa, e duas rubricas.
    anterior = None

    def fechar():
        if not pt and not la:
            return
        portugues, latim = costurar(pt), costurar(la)
        # O bloco de uma coluna só não é bilíngue: três orações do impresso
        # vêm em português e mais nada — a de Santo Ambrósio, a de Santo
        # Tomás de Aquino e a "Deus e Senhor nosso, protegei a vossa Igreja".
        # Emitidas como bilíngue com o latim vazio, `conteudo.teste.ts` as
        # reprovaria, que exige o mesmo número de parágrafos dos dois lados.
        if not portugues or not latim:
            for t in portugues or latim:
                blocos.append({"tipo": "paragrafo", "texto": t})
        else:
            blocos.append({
                "tipo": "bilingue",
                "portugues": [{"tipo": "paragrafo", "texto": t} for t in portugues],
                "latim": [{"tipo": "paragrafo", "texto": t} for t in latim],
            })
        pt.clear()
        la.clear()

    for linha in linhas(pdf):
        # O salto desde a linha anterior, que diz se as duas se emendam.
        # Dentro de um parágrafo, ou de uma rubrica de várias linhas, as
        # linhas andam de 27 a 32 pixels; entre dois parágrafos, ou entre
        # duas rubricas, o salto nunca é menor que 43. A quebra de página
        # não diz nada: ali a conta não vale, e as duas linhas emendam.
        topo = min(f["topo"] for f in linha)
        mesmaPagina = anterior is not None and anterior[0] == linha[0]["pagina"]
        colado = not mesmaPagina or topo - anterior[1] < PARAGRAFO
        abreParagrafo = not mesmaPagina or topo - anterior[1] >= PARAGRAFO
        anterior = (linha[0]["pagina"], topo)

        esquerda = [f for f in linha if f["esq"] < MEIO]
        direita = [f for f in linha if f["esq"] >= MEIO]
        extremos = (min(f["esq"] for f in linha),
                    max(f["esq"] + f["largura"] for f in linha))
        vaos = [linha[i + 1]["esq"] - (linha[i]["esq"] + linha[i]["largura"])
                for i in range(len(linha) - 1)]
        centrada = (CENTRADO <= extremos[0] < MEIO < extremos[1]
                    and max(vaos, default=0) < GOTEIRA)

        # A rubrica atravessa a largura inteira e vem em Arial, em qualquer
        # corte: o itálico é o normal dela, mas há incisos redondos dentro —
        # "Iube, Domine", "Gloria Patri" — e uma em negrito itálico na
        # página 38. Basta um fragmento Arial na linha, porque os outros são
        # sempre os incisos dela.
        # O parêntese que a célula deixou aberto na linha anterior. Três
        # rubricas curtas do impresso moram dentro da coluna, e não entre
        # elas: "(três vezes)" na Ave-Maria das leoninas, "(Todos se
        # inclinam)" no Tantum ergo e "(Três vezes)" no fim da bênção. A
        # primeira palavra cabe na linha do corpo e o resto transborda para
        # a linha seguinte, que é Arial inteira e passava por rubrica nova —
        # saía "inclinam) inclinam)" de bloco, e o corpo ficava com um
        # "(Todos se" pendurado. Quem as denuncia é o parêntese sem fecho:
        # conferido o impresso inteiro, só estas três linhas o têm aberto.
        pendente = ((pt and pt[-1].count("(") > pt[-1].count(")"))
                    or (la and la[-1].count("(") > la[-1].count(")")))

        if (any(f["rubrica"] for f in linha) and not any(f["corpo"] for f in linha)
                and not pendente):
            texto = juntar(linha)
            nu = re.sub(r"\[/?i\]", "", texto).strip()
            if VER_A_MISSA.match(nu):
                fechar()
                blocos.append({"tipo": "proprio"})
                continue
            # as linhas seguidas de uma rubrica longa são a mesma rubrica
            if (colado and blocos and blocos[-1]["tipo"] == "rubrica"
                    and not pt and not la):
                anterior = blocos[-1]["texto"]
                emenda = anterior + ("" if anterior.endswith("-") else " ") + texto
                blocos[-1]["texto"] = re.sub(r"\[/i\] ?\[i\]", " ", emenda)
            else:
                fechar()
                blocos.append({"tipo": "rubrica", "texto": texto})
            continue

        # Título é linha centrada que começa em negrito. Centrada, e não só
        # negrita: o "Amen." do fim de uma oração vem em negrito na coluna,
        # e viraria título solto. Começando em negrito, e não toda negrita:
        # há títulos com o complemento redondo.
        if centrada and linha[0]["negrito"]:
            fechar()
            blocos.append({"tipo": "titulo", "texto": juntar(linha)})
            continue

        # A linha de uma coluna só.
        #
        # Nem tudo no impresso é tabela de duas colunas: a epígrafe e as
        # citações do Magistério, a oração preparatória, as orações de ação
        # de graças e a "Deus e Senhor nosso, protegei a vossa Igreja" vêm
        # em prosa de largura inteira, e três rubricas da página 35 trazem
        # a palavra latina explicada dentro da própria linha. São 102 linhas
        # nas páginas 2, 3, 35, 45, 46 e 50, e o corte no meio da página as
        # picava: a epígrafe saía com "lex credendi" do lado latino e o
        # resto embaralhado do português.
        #
        # Quem as denuncia é o fragmento que passa do meio e não para: numa
        # linha de coluna o texto acaba em 446, com três exceções que vão a
        # 453; na prosa ele vai a 858.
        umaColuna = any(f["esq"] < MEIO < f["esq"] + f["largura"] - TRANSBORDO
                        for f in linha)
        if umaColuna:
            # A rubrica que explica a palavra latina dentro da própria
            # linha. Três há na página 35, sobre o que muda no Agnus Dei
            # nas Missas de Defuntos e na Quinta-feira Santa: a rubrica em
            # Arial e, no meio dela, a palavra a dizer em letra de corpo.
            # A linha não é toda Arial, então não entra pela rubrica, e é
            # de uma coluna só, então não é tabela — mas é a continuação da
            # rubrica de cima, e com ela emenda.
            if (colado and any(f["rubrica"] for f in linha) and not pt and not la
                    and blocos and blocos[-1]["tipo"] == "rubrica"):
                anterior = blocos[-1]["texto"]
                emenda = anterior + ("" if anterior.endswith("-") else " ") + juntar(linha)
                blocos[-1]["texto"] = re.sub(r"\[/i\] ?\[i\]", " ", emenda)
                continue
            # Fechar antes: um lado só não casa com o bilíngue que vinha.
            if la:
                fechar()
            pt.append((NOVO_PARAGRAFO if abreParagrafo else "") + juntar(linha))
            continue

        if esquerda:
            pt.append(juntar(esquerda))
        if direita:
            la.append(juntar(direita))

    fechar()

    naoServiram = [t for t in COLADOS if not usoDosColados[t]]
    if naoServiram:
        raise SystemExit("o PDF já não cola %s" % naoServiram)

    return blocos


if __name__ == "__main__":
    io.open(sys.stdout.fileno(), "w", encoding="utf-8").write(
        json.dumps(extrair(sys.argv[1]), ensure_ascii=False, indent=1) + "\n")
