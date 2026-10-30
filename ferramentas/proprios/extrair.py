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
    for f in fs:
        t = re.sub(r"\s+", " ", f["texto"])
        if f["italico"] and t.strip():
            t = "%s[i]%s[/i]%s" % (
                " " if t[:1] == " " else "", t.strip(), " " if t[-1:] == " " else "")
        partes.append(t)
    return re.sub(r"\s+", " ", "".join(partes)).strip()


def costurar(linhas_):
    """
    As linhas de uma coluna viram um parágrafo.

    Linha que termina em hífen emenda na seguinte sem espaço, e **com** o
    hífen: conferidos os sete próprios, todas as sete quebras assim são
    hífen de verdade — "aproxima-se", "Mostrai-nos", "salvar-nos-á",
    "bem-aventurados" —, nenhuma é separação silábica. O Word não hifeniza
    sozinho, e é por isso que não há nenhuma.
    """
    texto = ""
    for linha in linhas_:
        if not texto:
            texto = linha
        elif texto.endswith("-"):
            texto += linha
        else:
            texto += " " + linha
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
            juntas = costurar(rubrica)
            tipo = ("subtitulo" if re.match(r"^\[i\](Ou )?\d+\.", juntas) else "rubrica")
            limpo = re.sub(r"^\[i\]|\[/i\]$", "", juntas)
            blocos.append({"tipo": tipo, "texto": limpo}
                          if tipo == "rubrica"
                          else {"tipo": tipo, "texto": limpo, "menor": True})
            rubrica.clear()
        if pt or la:
            blocos.append({
                "tipo": "bilingue",
                "latim": [{"tipo": "paragrafo", "texto": costurar(la)}],
                "portugues": [{"tipo": "paragrafo", "texto": costurar(pt)}],
            })
            pt.clear()
            la.clear()

    for linha in linhas(pdf):
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

        if not direita and esquerda and all(f["italico"] for f in esquerda):
            texto = juntar(esquerda)
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
