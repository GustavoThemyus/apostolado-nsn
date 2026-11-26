#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import collections, io, json, re, subprocess, sys, xml.etree.ElementTree as ET

MEIO = 450

JUNTO = 13

CENTRADO = 140

VAO = 4

GOTEIRA = 60

TRANSBORDO = 20

PARAGRAFO = 36

NOVO_PARAGRAFO = "\x00"

COLADOS = {
    "Cordeiro  de  Deus,  que  tirais  os  Agnus  Dei,  qui  tollis  peccáta ":
        "Agnus  Dei,",
}

usoDosColados = collections.Counter()

CRUZ = "✠"
WINGDINGS_CRUZ = ""

VER_A_MISSA = re.compile(r"^Ver a Missa do dia\.?$")

ABRE_FALA = re.compile(r"^(S\.|M\.|T\.|C\.|P\.|℣\.|℟\.)")

FALA_NO_MEIO = re.compile(r"(?<=[.!?])\s+(?=(?:S\.|M\.|T\.|C\.|P\.|℣\.|℟\.)\s)")

CORPO = ("Times", "MS Gothic", "MS Mincho", "Lucida Sans Unicode", "Calibri",
         "Wingdings")


def fragmentos(pdf):
    xml = subprocess.run(["pdftohtml", "-xml", "-i", "-stdout", pdf],
                         capture_output=True, check=True).stdout.decode("utf-8")
    raiz = ET.fromstring(xml)
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
    junto = re.sub(r"\[/i\](\s*)\[i\]", r"\1", "".join(partes))
    return re.sub(r"\s+", " ", junto).strip()


def costurar(linhas_):
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
    anterior = None

    def fechar():
        if not pt and not la:
            return
        portugues, latim = costurar(pt), costurar(la)
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
            if (colado and blocos and blocos[-1]["tipo"] == "rubrica"
                    and not pt and not la):
                anterior = blocos[-1]["texto"]
                emenda = anterior + ("" if anterior.endswith("-") else " ") + texto
                blocos[-1]["texto"] = re.sub(r"\[/i\] ?\[i\]", " ", emenda)
            else:
                fechar()
                blocos.append({"tipo": "rubrica", "texto": texto})
            continue

        if centrada and linha[0]["negrito"]:
            fechar()
            blocos.append({"tipo": "titulo", "texto": juntar(linha)})
            continue

        umaColuna = any(f["esq"] < MEIO < f["esq"] + f["largura"] - TRANSBORDO
                        for f in linha)
        if umaColuna:
            if (colado and any(f["rubrica"] for f in linha) and not pt and not la
                    and blocos and blocos[-1]["tipo"] == "rubrica"):
                anterior = blocos[-1]["texto"]
                emenda = anterior + ("" if anterior.endswith("-") else " ") + juntar(linha)
                blocos[-1]["texto"] = re.sub(r"\[/i\] ?\[i\]", " ", emenda)
                continue
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
