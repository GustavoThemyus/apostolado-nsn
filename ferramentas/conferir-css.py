#!/usr/bin/env python3
"""
Validação estrutural de src/styles/base.css.

Existe por causa de um estrago real: uma remoção de bloco duplicado feita por
substituição de texto deixou um seletor solto grudado no comentário seguinte,
e `.atalhos` virou `.cabecalho--estampado .atalhos`. O CSS continuou válido,
o build passou, os testes passaram, e a regra simplesmente nunca casou. O que
denuncia isso não é o compilador nem a tela: é esta conferência.

    python3 ferramentas/conferir-css.py
"""
import io, re, sys

ARQUIVO = "src/styles/base.css"
s = io.open(ARQUIVO, encoding="utf-8").read()
sem_comentario = re.sub(r"/\*.*?\*/", "\n", s, flags=re.S)
problemas = []

if sem_comentario.count("{") != sem_comentario.count("}"):
    problemas.append(
        f"chaves desequilibradas: {sem_comentario.count('{')} abre, {sem_comentario.count('}')} fecha"
    )

# seletor encostado num comentário vira descendente sem ninguém perceber
for m in re.finditer(r"([^\n{};]*)/\*", s):
    antes = m.group(1).strip()
    if antes and not antes.startswith("*") and not antes.endswith((";", "}", "{")):
        problemas.append(f"seletor grudado num comentário: {antes[:60]!r}")

# declaração fora de qualquer bloco
profundidade = 0
for n, linha in enumerate(sem_comentario.splitlines(), 1):
    t = linha.strip()
    profundidade += t.count("{") - t.count("}")
    if profundidade == 0 and re.match(r"^[a-z-]+\s*:\s*[^;]+;$", t):
        problemas.append(f"declaração solta na linha {n}: {t[:50]!r}")

for m in re.finditer(r"([^\n{}]+)\{\s*\}", sem_comentario):
    problemas.append(f"regra vazia: {m.group(1).strip()[:50]!r}")

print(f"{ARQUIVO}: {len(problemas)} problema(s)")
for x in problemas[:20]:
    print("   ", x)
sys.exit(1 if problemas else 0)
