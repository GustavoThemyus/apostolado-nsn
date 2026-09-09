"""Confere a transcrição contra o .docx. Roda depois de cada conversão."""
import json, io, re, unicodedata, sys
ps = json.load(io.open("paragrafos.json", encoding="utf-8"))
d = json.load(io.open("enchiridion.json", encoding="utf-8"))
SUPS = "⁰¹²³⁴⁵⁶⁷⁸⁹"

def limpo(t):
    t = re.sub(r"\[nota\][^\[]*\[/nota\]", "", t)      # chamada inteira
    t = re.sub(r"\[/?(?:i|b|lat|r|elo)(?::[^\]]*)?\]", "", t)
    t = t.replace("\xa0", " ")
    t = "".join(c for c in t if c not in SUPS)
    t = re.sub(r"\s+", " ", unicodedata.normalize("NFC", t)).strip(" .*:")
    return re.sub(r"^-\s*", "", t)   # o hífen manual virou item de lista

def textos(b):
    for k in ("texto", "titulo"):
        if k in b: yield b[k]
    for k in ("itens", "paragrafos"):
        for x in b.get(k, []):
            if isinstance(x, str): yield x
    for l in b.get("linhas", []):
        for c in l: yield c
    for c in b.get("colunas", []): yield c

partes = [limpo(s["titulo"]) for s in d["secoes"]]
for s in d["secoes"]:
    for b in s["blocos"]:
        partes += [limpo(t) for t in textos(b)]
partes += [limpo(v) for v in d["notas"].values()]
saco, grande = set(partes), " ¦ ".join(partes)

# omissões deliberadas, cada uma com o motivo
TITULOS = {68, 80, 98, 100, 121, 191, 203, 282, 300, 722, 772, 773, 798, 799, 815, 816, 952}
SUBTITULOS = {192, 283, 723, 729, 953, 1017, 1018, 1025, 1044, 820, 828, 836, 841, 861, 869}
INSTRUCOES = {4, 5, 6, 7, 8, 11}
SUMARIO = set(range(13, 68))
ROMANOS = {204, 222, 242, 260}

ausentes = []
for i, p in enumerate(ps):
    if p["tipo"] != "p": continue
    c = limpo(p["cru"])
    if not c or re.fullmatch(r"[_ ]+", c): continue
    if c in saco or c in grande: continue
    ausentes.append((i, c))

def rotular(i, c):
    if i in INSTRUCOES: return "recado do Perez, atendido em vez de publicado"
    if i in SUMARIO: return "sumário impresso, agora derivado das seções"
    if i in TITULOS: return "virou título de seção"
    if i in SUBTITULOS or i in ROMANOS: return "virou subtítulo"
    if re.match(r"^Notas?\s+d", c): return "cabeçalho de bloco de notas, dispensado"
    if i >= 1066: return "nota do asterisco, agora no balão"
    if 953 <= i <= 1065: return "entrada do índice analítico, conferida à parte"
    return None

restos = []
for i, c in ausentes:
    r = rotular(i, c)
    if r is None: restos.append((i, c))

# --- o índice analítico, conferido entrada por entrada ---------------------
import unicodedata as _u
def _ch(t):
    t = _u.normalize("NFD", t.lower())
    t = "".join(c for c in t if _u.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", t).strip()

indice = [x for x in d["secoes"] if x["id"] == "indice-analitico"][0]
saidas = [i for b in indice["blocos"] if b["tipo"] == "lista" for i in b["itens"]]
fonte = [ps[i]["cru"].strip() for i in range(953, 1066)
         if ps[i]["tipo"] == "p" and ps[i]["cru"].strip()]
fonte = [f for f in fonte if not re.match(r"^[AB] - |^\d\. ", f)]
problemas = []
if len(fonte) != len(saidas):
    problemas.append(f"contagem: original {len(fonte)}, saída {len(saidas)}")
for orig, saiu in zip(fonte, saidas):
    m = re.match(r"^(.*?)\s*\((?:con|conc|com)\.\s*(\d+)", orig)
    nome = m.group(1) if m else orig
    if _ch(nome) not in _ch(saiu):
        problemas.append(f"nome perdido: {orig[:60]!r} -> {saiu[:60]!r}")
    if m:
        destino = re.search(r"\[elo:([^\]]+)\]", saiu)
        n = m.group(2)
        if not destino:
            problemas.append(f"sem link: {orig[:60]!r}")
        elif destino.group(1) not in (f"concessao-{n}",) and not destino.group(1).startswith("oracao-"):
            problemas.append(f"link errado: {orig[:60]!r} -> {destino.group(1)}")
        elif destino.group(1).startswith("oracao-") and f"concessão {n}" not in saiu:
            problemas.append(f"número perdido: {orig[:60]!r} -> {saiu[:70]!r}")
print(f"índice analítico: {len(saidas)} entradas, {len(problemas)} problemas")
for p in problemas[:12]: print("   ", p)
print()

print(f"parágrafos do original: {sum(1 for p in ps if p['tipo']=='p')}")
print(f"ausentes explicados: {len(ausentes) - len(restos)}")
print(f"AUSENTES SEM EXPLICAÇÃO: {len(restos)}")
for i, c in restos[:20]:
    print(f"   ¶{i}: {c[:110]!r}")
sys.exit(1 if (restos or problemas) else 0)
