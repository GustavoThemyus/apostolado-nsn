#!/usr/bin/env python3
import io, re, sys

ARQUIVO = "src/styles/base.css"
s = io.open(ARQUIVO, encoding="utf-8").read()
sem_comentario = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), s, flags=re.S)
problemas = []

if sem_comentario.count("{") != sem_comentario.count("}"):
    problemas.append(
        f"chaves desequilibradas: {sem_comentario.count('{')} abre, {sem_comentario.count('}')} fecha"
    )

for m in re.finditer(r"([^\n{};]*)/\*", s):
    antes = m.group(1).strip()
    if antes and not antes.startswith("*") and not antes.endswith((";", "}", "{")):
        problemas.append(f"seletor grudado num comentário: {antes[:60]!r}")

profundidade = 0
for n, linha in enumerate(sem_comentario.splitlines(), 1):
    t = linha.strip()
    profundidade += t.count("{") - t.count("}")
    if profundidade == 0 and re.match(r"^[a-z-]+\s*:\s*[^;]+;$", t):
        problemas.append(f"declaração solta na linha {n}: {t[:50]!r}")

for m in re.finditer(r"([^\n{}]+)\{\s*\}", sem_comentario):
    problemas.append(f"regra vazia: {m.group(1).strip()[:50]!r}")

SABIDOS = {
    ".tabela td", ".tabela th", ".tabela thead", ".tabela tr", ".tabela tr:first-child",
    ".brasao-pagina__fecho", '.brasao-comentado__numero[aria-expanded="true"]',
}

contextos = {}
pilha = []
linha = 1
fim = 0
for m in re.finditer(r"([^{}]*)([{}])", sem_comentario):
    linha += sem_comentario.count("\n", fim, m.end())
    fim = m.end()
    if m.group(2) == "}":
        if pilha:
            pilha.pop()
        continue
    cru = m.group(1).strip()
    if cru.startswith("@"):
        pilha.append(cru)
        continue
    for sel in cru.split(","):
        sel = " ".join(sel.split())
        if sel:
            contextos.setdefault((" | ".join(pilha), sel), []).append(linha)
    pilha.append("")

for (contexto, sel), linhas in sorted(contextos.items()):
    if len(linhas) > 1 and sel not in SABIDOS:
        onde = contexto or "topo"
        problemas.append(f"seletor repetido em {onde}: {sel} nas linhas {linhas}")

print(f"{ARQUIVO}: {len(problemas)} problema(s)")
for x in problemas[:20]:
    print("   ", x)
sys.exit(1 if problemas else 0)
