#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lê um PDF de próprio da Missa e devolve o folheto em JSON.

    python3 ferramentas/proprios/extrair.py <pdf>

O PDF do Perez é bilíngue em duas colunas: português à esquerda, latim à
direita. O que separa as duas aqui não é adivinhação de layout, é a posição
de cada fragmento na página, que o `pdftohtml -xml` entrega junto com o
negrito e o itálico:

    negrito              título de seção     ("Intróito (Sl XXIV,1-3)")
    itálico na esquerda  rubrica             ("Faz-se a comemoração...")
    redondo à esquerda   português
    redondo à direita    latim

O resultado é **rascunho**: sai daqui para ser conferido contra o PDF, não
para ir direto ao site. Hifenização de fim de linha, abreviatura em itálico
no meio da frase e comemoração que muda de forma são coisas que só o olho
pega.
"""
import io, json, re, subprocess, sys, xml.etree.ElementTree as ET

# o meio da página, em pixels do pdftohtml: a coluna da esquerda começa em 42
# e a da direita em 455, numa página de 892
MEIO = 446


def fragmentos(pdf):
    xml = subprocess.run(["pdftohtml", "-xml", "-i", "-stdout", pdf],
                         capture_output=True, check=True).stdout.decode("utf-8")
    # o DTD não existe no disco; o parser não o busca, mas o declara
    raiz = ET.fromstring(xml)
    for pagina in raiz.iter("page"):
        for texto in pagina.iter("text"):
            cru = "".join(texto.itertext())
            if not cru.strip():
                continue
            marcas = {filho.tag for filho in texto}
            yield {
                "pagina": int(pagina.get("number")),
                "topo": int(texto.get("top")),
                "esq": int(texto.get("left")),
                "largura": int(texto.get("width")),
                "texto": cru,
                "negrito": "b" in marcas,
                "italico": "i" in marcas,
            }


# As linhas do corpo ficam a 29px uma da outra; o ℣ e o ℟ vêm de outra fonte
# e sobem até 3px dentro da própria linha. 8px separa um caso do outro.
JUNTO = 8


def linhas(pdf):
    """
    Junta os fragmentos de mesma altura numa linha só, da esquerda para a direita.

    Por vizinhança, e não por arredondamento: o ℣ do meio do versículo sobe
    três pixels, e com faixa fixa ele caía na linha de cima — entrava no
    texto antes da palavra que ele precede, e o versículo saía embaralhado.
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
    vem do PDF como " Sl." — com o espaço dentro —, e marcar o fragmento
    inteiro colava a abreviatura na palavra anterior, "confundidos.Sl.".
    """
    partes = []
    fim = None
    for f in fs:
        t = re.sub(r"\s+", " ", f["texto"])
        # Dois fragmentos a 3px ou mais um do outro têm um espaço entre eles, que
        # o PDF não escreveu: "Deo" e "grátias." do "℟.Deo grátias." vêm cada um
        # no seu, e coladas saíam "Deográtias". Menos de 3px é a mesma palavra
        # ("Ecclési" e o "æ", que vem de outra fonte).
        if (partes and fim is not None and f["esq"] - fim >= 3
                and not partes[-1][-1:].isspace() and not t[:1].isspace()
                and not re.match(r"[.,;:!?)»\]]", t)):
            partes.append(" ")
        fim = f["esq"] + f["largura"]
        if f["italico"] and t.strip():
            t = "%s[i]%s[/i]%s" % (
                " " if t[:1] == " " else "", t.strip(), " " if t[-1:] == " " else "")
        partes.append(t)
    # fragmentos em itálico colados, sem espaço entre eles, são uma palavra só: o
    # "æ" de "Ecclési|æ" vem de outra fonte, e é fragmento à parte
    texto = re.sub(r"\s+", " ", "".join(partes).replace("[/i][i]", "")).strip()
    # o espaço que o PDF deixou no fim de um fragmento, antes do ponto que vem
    # em outro: "grátias" + "." saía "grátias ."
    return re.sub(r"\s+(?=(?:\[i\])?[.,;)»])", "", texto)


# O que se cola a um verbo com hífen, em português: "aproxima-se", "Mostrai-nos",
# "salvar-nos-á", "Louvar-Vos-ei". Na segunda palavra de uma quebra de linha,
# qualquer destes é hífen de verdade; qualquer outra coisa é sílaba.
CLITICOS = {"me", "te", "se", "lhe", "lhes", "nos", "vos", "o", "a", "os", "as",
            "no", "na", "nas", "ei", "á", "ás", "ão", "emos", "eis"}
# "dizê-lo", "levá-la": só depois de vogal acentuada. Sem acento, "discípu-los" e
# "mu-la" são sílabas.
CLITICOS_DE_ACENTO = {"lo", "la", "los", "las"}

# O que ficou com hífen, para quem gera conferir de olho: é a parte do trabalho
# que nenhuma contagem de palavras pega.
HIFENS_MANTIDOS = []


def hifenDeVerdade(proxima, lingua, anterior=""):
    """
    O hífen no fim da linha é do texto, ou é separação silábica do Word?

    Até os primeiros PDFs o Word não hifenizava, e toda quebra em hífen era
    hífen de verdade. Os PDFs revistos pelo Perez são hifenizados, e "sé-" /
    "culos" não leva hífen nenhum. Em latim nunca há hífen de verdade. Em
    português há quando o que vem depois é um pronome ou terminação ligada ao
    verbo; a lista é fechada e curta, e erra para o lado de tirar o hífen só
    quando a palavra seguinte não é nenhuma delas.
    """
    if lingua == "la":
        return False
    palavra = re.match(r"[A-Za-zÀ-ÿ]+", re.sub(r"^\[/?i\]", "", proxima))
    if not palavra:
        return False
    segunda = palavra.group(0).lower()
    antes = re.search(r"[A-Za-zÀ-ÿ]+-$", re.sub(r"\[/?i\]", "", anterior))
    radical = antes.group(0)[:-1] if antes else ""
    # fragmento de uma ou duas letras antes do hífen é sílaba: "po-vos", "Fi-lho"
    if len(radical) < 3:
        return False
    if segunda in CLITICOS_DE_ACENTO:
        return radical[-1] in "áéíóúâêôàã"
    return segunda in CLITICOS


def costurar(linhas_, lingua="pt"):
    """
    As linhas de uma coluna viram um parágrafo.

    Linha que termina em hífen emenda na seguinte sem espaço. O hífen fica ou
    sai conforme `hifenDeVerdade`: nos PDFs revistos o Word hifeniza sozinho,
    e a maior parte das quebras é separação silábica.
    """
    texto = ""
    for linha in linhas_:
        if not texto:
            texto = linha
        elif texto.endswith("-"):
            if hifenDeVerdade(linha, lingua, texto):
                HIFENS_MANTIDOS.append(re.sub(r"\[/?i\]", "", texto.split()[-1] + linha.split()[0]))
                texto += linha
            else:
                texto = texto[:-1] + linha
        else:
            # o ponto que cai sozinho no começo da linha seguinte cola na palavra
            texto += ("" if re.match(r"(?:\[i\])?[.,;)»]", linha) else " ") + linha
    # o itálico que se fecha e reabre na emenda de duas linhas vira um só
    return re.sub(r"\[/i\] ?\[i\]", " ", texto).strip()


# Onde nenhuma linha de coluna começa.
#
# A coluna da esquerda abre em 42 — 51 na Vigília do Natal —, e toda linha de
# corpo que cruza a divisa nasce ali: são as 948 em que a frase portuguesa
# chega ao fim da largura e o latim continua do outro lado. O texto centrado
# que mais à esquerda começa, nos sete PDFs, é o nome da festa da Vigília, em
# 260. Daqui para a direita, portanto, só há centrado.
CENTRADO = 200


# a maiúscula que o PDF deixou do lado de cá: ver `separarNoMeio`
INICIAL_SOLTA = re.compile(r"^(.*\s)([A-ZÀ-Ý])$")


def separarNoMeio(fs):
    """
    O fragmento que atravessa a divisa das colunas.

    No II Domingo do Advento o "O" de "Oblátis" vem no mesmo fragmento que o
    fim da linha portuguesa — "das  O" —, e pela posição do fragmento inteiro
    ele cairia no português, deixando o latim a começar em "blátis". É o
    único caso nos sete próprios.

    O que o denuncia é a caixa, não o texto: o fragmento começa à esquerda da
    divisa e termina à direita dela, e acaba numa maiúscula sozinha. A
    primeira tentativa olhava só o texto — maiúscula no fim do português,
    minúscula no começo do latim — e mudava de lado o "E" de "E respondendo
    Jesus", que estava onde devia.
    """
    saida = []
    for f in fs:
        casado = INICIAL_SOLTA.match(f["texto"].strip())
        if casado and f["esq"] < MEIO < f["esq"] + f["largura"]:
            saida.append(dict(f, texto=casado.group(1)))
            saida.append(dict(f, texto=casado.group(2), esq=MEIO))
        else:
            saida.append(f)
    return saida


# Onde acaba o cabeçalho e começa o próprio. Nos sete PDFs o corpo abre
# sempre no Intróito; o que vem antes é nome da festa, data e grau, e cada
# folha os arruma à sua maneira — o domingo começa pelo nome, a festa começa
# pela data. Por isso o cabeçalho sai daqui como lista, para ser lido por
# quem escreve a ficha do folheto, e não adivinhado.
ABRE_O_CORPO = re.compile(r"^Intróito\b")


def extrair(pdf):
    cabecalho = []
    blocos = []
    pt, la, rubrica = [], [], []

    def fechar():
        if rubrica:
            juntas = costurar(rubrica, "pt")
            tipo = ("subtitulo" if re.match(r"^\[i\](Ou )?\d+\.", juntas) else "rubrica")
            limpo = re.sub(r"^\[i\]|\[/i\]$", "", juntas)
            blocos.append({"tipo": tipo, "texto": limpo}
                          if tipo == "rubrica"
                          else {"tipo": tipo, "texto": limpo, "menor": True})
            rubrica.clear()
        if pt or la:
            blocos.append({
                "tipo": "bilingue",
                "latim": [{"tipo": "paragrafo", "texto": costurar(la, "la")}],
                "portugues": [{"tipo": "paragrafo", "texto": costurar(pt, "pt")}],
            })
            pt.clear()
            la.clear()

    for linha in linhas(pdf):
        # o número da página, sozinho no pé: não é texto do próprio, e se ficasse
        # cortaria no meio a oração que atravessa a página
        if len(linha) == 1 and re.fullmatch(r"\d{1,2}", linha[0]["texto"].strip()):
            continue
        linha = separarNoMeio(linha)
        esquerda = [f for f in linha if f["esq"] < MEIO]
        direita = [f for f in linha if f["esq"] >= MEIO]

        # Título é linha centrada, isto é, que cruza a divisa das colunas, e
        # em negrito. Só o negrito não bastava: no IV Domingo o "Laus tibi,
        # Christe." do fim do Evangelho vem em negrito na coluna do latim, e
        # virava um título solto no meio do próprio. Texto centrado cruza o
        # meio da página por definição; texto de coluna, nunca.
        #
        # Em negrito, e não toda em negrito: o "Prefácio (galicano)" de cinco
        # dos sete próprios traz o "Prefácio" em negrito e o "(galicano)"
        # redondo, e pela regra antiga não era título nenhum — caía no corpo
        # e emendava o Prefácio inteiro no fim da oração anterior, que é o
        # que o Perez viu na Vigília do Natal. Numa linha que já é centrada,
        # basta ela começar em negrito; o que a exigência inteira defendia
        # eram as linhas de coluna que acabam em "℟. Amen.", e essas nascem
        # na margem.
        extremos = (min(f["esq"] for f in linha),
                    max(f["esq"] + f["largura"] for f in linha))
        centrada = extremos[0] < MEIO < extremos[1]
        if centrada and (all(f["negrito"] for f in linha)
                         or (extremos[0] >= CENTRADO and linha[0]["negrito"])):
            fechar()
            cabeca = juntar(linha)
            if blocos or ABRE_O_CORPO.match(cabeca):
                blocos.append({"tipo": "subtitulo", "texto": cabeca})
            else:
                cabecalho.append(cabeca)
            continue

        if not blocos:
            # ainda no cabeçalho: "Semiduples de 1ª classe – roxo", que o
            # travessão parte em três fragmentos, um deles do lado direito
            cabecalho.append(juntar(linha))
            continue

        # A rubrica de largura inteira ("Após a Coleta, fazem-se as Orações
        # segundo o tempo…") nos PDFs revistos: tudo em itálico, a linha toda,
        # de uma margem à outra. A segunda linha dela vem em dois fragmentos,
        # um de cada lado da divisa, e iria uma metade para cada coluna.
        larga = bool(direita and esquerda and all(f["italico"] for f in linha)
                     and extremos[1] - extremos[0] > 600)
        if larga or (not direita and esquerda and all(f["italico"] for f in esquerda)):
            texto = juntar(linha if larga else esquerda)
            # "2. Santíssima Virgem Maria" abre comemoração nova: não é
            # continuação da rubrica que manda fazê-la
            if pt or la or (rubrica and re.match(r"^\[i\](Ou )?\d+\.", texto)):
                fechar()
            rubrica.append(texto)
            continue

        if rubrica and not direita and esquerda:
            # a cauda curta de uma rubrica, que cabe só na coluna da esquerda
            rubrica.append(juntar(esquerda))
            continue

        if rubrica:
            fechar()
        if esquerda:
            pt.append(juntar(esquerda))
        if direita:
            la.append(juntar(direita))

    fechar()
    return {"cabecalho": cabecalho, "blocos": blocos}


if __name__ == "__main__":
    saida = extrair(sys.argv[1])
    io.open(sys.stdout.fileno(), "w", encoding="utf-8").write(
        json.dumps(saida, ensure_ascii=False, indent=1) + "\n")
