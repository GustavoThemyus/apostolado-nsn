#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io, json, re, subprocess, sys, xml.etree.ElementTree as ET

MEIO = 446


def fragmentos(pdf):
    xml = subprocess.run(["pdftohtml", "-xml", "-i", "-stdout", pdf],
                         capture_output=True, check=True).stdout.decode("utf-8")
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

JUNTO = 8


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
        if (partes and fim is not None and f["esq"] - fim >= 3
                and not partes[-1][-1:].isspace() and not t[:1].isspace()
                and not re.match(r"[.,;:!?)»\]]", t)):
            partes.append(" ")
        fim = f["esq"] + f["largura"]
        if f["italico"] and t.strip():
            t = "%s[i]%s[/i]%s" % (
                " " if t[:1] == " " else "", t.strip(), " " if t[-1:] == " " else "")
        partes.append(t)
    texto = re.sub(r"\s+", " ", "".join(partes).replace("[/i][i]", "")).strip()
    return re.sub(r"\s+(?=(?:\[i\])?[.,;)»])", "", texto)

CLITICOS = {"me", "te", "se", "lhe", "lhes", "nos", "vos", "o", "a", "os", "as",
            "no", "na", "nas", "ei", "á", "ás", "ão", "emos", "eis"}
CLITICOS_DE_ACENTO = {"lo", "la", "los", "las"}

HIFENS_MANTIDOS = []


def hifenDeVerdade(proxima, lingua, anterior=""):
    if lingua == "la":
        return False
    palavra = re.match(r"[A-Za-zÀ-ÿ]+", re.sub(r"^\[/?i\]", "", proxima))
    if not palavra:
        return False
    segunda = palavra.group(0).lower()
    antes = re.search(r"[A-Za-zÀ-ÿ]+-$", re.sub(r"\[/?i\]", "", anterior))
    radical = antes.group(0)[:-1] if antes else ""
    if len(radical) < 3:
        return False
    if segunda in CLITICOS_DE_ACENTO:
        return radical[-1] in "áéíóúâêôàã"
    return segunda in CLITICOS


def costurar(linhas_, lingua="pt"):
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
            texto += ("" if re.match(r"(?:\[i\])?[.,;)»]", linha) else " ") + linha
    return re.sub(r"\[/i\] ?\[i\]", " ", texto).strip()

CENTRADO = 200

INICIAL_SOLTA = re.compile(r"^(.*\s)([A-ZÀ-Ý])$")


def separarNoMeio(fs):
    saida = []
    for f in fs:
        casado = INICIAL_SOLTA.match(f["texto"].strip())
        if casado and f["esq"] < MEIO < f["esq"] + f["largura"]:
            saida.append(dict(f, texto=casado.group(1)))
            saida.append(dict(f, texto=casado.group(2), esq=MEIO))
        else:
            saida.append(f)
    return saida

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
        if len(linha) == 1 and re.fullmatch(r"\d{1,2}", linha[0]["texto"].strip()):
            continue
        linha = separarNoMeio(linha)
        esquerda = [f for f in linha if f["esq"] < MEIO]
        direita = [f for f in linha if f["esq"] >= MEIO]

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
            cabecalho.append(juntar(linha))
            continue

        larga = bool(direita and esquerda and all(f["italico"] for f in linha)
                     and extremos[1] - extremos[0] > 600)
        if larga or (not direita and esquerda and all(f["italico"] for f in esquerda)):
            texto = juntar(linha if larga else esquerda)
            if pt or la or (rubrica and re.match(r"^\[i\](Ou )?\d+\.", texto)):
                fechar()
            rubrica.append(texto)
            continue

        if rubrica and not direita and esquerda:
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
