import re, io, json, unicodedata
from xml.etree import ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
RAIZ = "docx"

SUP = {"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9"}


def texto_da_run(r):
    partes = []
    for filho in r:
        if filho.tag == W+"t":
            partes.append(filho.text or "")
        elif filho.tag == W+"tab":
            partes.append("\t")
        elif filho.tag == W+"br":
            partes.append("\n")
    return "".join(partes)


def props(r):
    rpr = r.find(W+"rPr")
    if rpr is None: return (False, False, None)
    cor = rpr.find(W+"color")
    return (rpr.find(W+"b") is not None,
            rpr.find(W+"i") is not None,
            cor.get(W+"val") if cor is not None else None)


def ler_paragrafo(p):
    pedacos = []
    for r in p.iter(W+"r"):
        t = texto_da_run(r)
        if not t: continue
        b, i, cor = props(r)
        pedacos.append([t, b, i, cor])
    if not pedacos: return None
    juntos = []
    for pedaco in pedacos:
        if juntos and juntos[-1][1:] == pedaco[1:]:
            juntos[-1][0] += pedaco[0]
        else:
            juntos.append(pedaco[:])
    ppr = p.find(W+"pPr")
    alinhamento = None
    lista = None
    recuo = 0
    if ppr is not None:
        jc = ppr.find(W+"jc")
        if jc is not None: alinhamento = jc.get(W+"val")
        npr = ppr.find(W+"numPr")
        if npr is not None:
            nid = npr.find(W+"numId")
            if nid is not None: lista = nid.get(W+"val")
        ind = ppr.find(W+"ind")
        if ind is not None:
            try: recuo = int(ind.get(W+"left") or ind.get(W+"start") or "0")
            except ValueError: recuo = 0
    cru = "".join(x[0] for x in juntos)
    if not cru.strip(): return None
    todo_b = all(x[1] for x in juntos if x[0].strip())
    todo_i = all(x[2] for x in juntos if x[0].strip())
    return {"pedacos": juntos, "alinhamento": alinhamento, "cru": cru,
            "negrito": todo_b, "italico": todo_i, "lista": lista, "recuo": recuo}

_n = ET.parse(f"{RAIZ}/word/numbering.xml").getroot()
_abs = {}
for _a in _n.findall(W+"abstractNum"):
    _l = _a.find(W+"lvl")
    _abs[_a.get(W+"abstractNumId")] = (
        _l.find(W+"numFmt").get(W+"val") if _l is not None else "?")
FORMATO = {}
for _num in _n.findall(W+"num"):
    FORMATO[_num.get(W+"numId")] = _abs.get(_num.find(W+"abstractNumId").get(W+"val"), "?")

arvore = ET.parse(f"{RAIZ}/word/document.xml")
corpo = arvore.getroot().find(W+"body")

saida = []
corrida = 0
grupo = 0
recuado_antes = False
branco_antes = False
for filho in corpo:
    if filho.tag == W+"p":
        p = ler_paragrafo(filho)
        if p is None:
            branco_antes = True
            continue
        if p["recuo"] > 0:
            if not recuado_antes:
                corrida += 1
                grupo += 1
            elif branco_antes:
                grupo += 1
            p["corrida"] = corrida
            p["grupo"] = grupo
            recuado_antes = True
        else:
            recuado_antes = False
        branco_antes = False
        if p["lista"]: p["formato"] = FORMATO.get(p["lista"], "?")
        saida.append({"tipo": "p", **p})
    elif filho.tag == W+"tbl":
        linhas = []
        for tr in filho.findall(W+"tr"):
            celulas = []
            for tc in tr.findall(W+"tc"):
                partes = []
                for p in tc.findall(W+"p"):
                    lido = ler_paragrafo(p)
                    if lido: partes.append(lido["cru"])
                celulas.append(" ".join(partes))
            linhas.append(celulas)
        saida.append({"tipo": "tabela", "linhas": linhas})

io.open("paragrafos.json", "w", encoding="utf-8").write(
    json.dumps(saida, ensure_ascii=False, indent=1))
print(f"{len(saida)} blocos, sendo {sum(1 for x in saida if x['tipo']=='tabela')} tabela")
