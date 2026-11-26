#!/usr/bin/env python3
"""
    python3 ferramentas/quo-primum/gerar.py <bula.pdf>
"""

import json
import pathlib
import re
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "src/data/missa-canonica.json"
MEIO = 297
NUMERADOS = 13

FECHO = {
    "latim": ["Si quis autem", "Datum Romæ", "H. Cumin", "Anno a Nativitate", "Scipio de Octavianis"],
    "portugues": ["Se alguém, contudo", "Dado em Roma", "H. Cumin", "No ano do Nascimento", "Cipião de Otaviani"],
}


def coluna(pdf: str, x: int) -> list[str]:
    paginas = int(re.search(r"Pages:\s+(\d+)", subprocess.run(
        ["pdfinfo", pdf], capture_output=True, text=True, check=True).stdout).group(1))
    linhas: list[str] = []
    for p in range(1, paginas + 1):
        saida = subprocess.run(
            ["pdftotext", "-f", str(p), "-l", str(p), "-x", str(x), "-y", "0",
             "-W", str(MEIO if x == 0 else MEIO + 2), "-H", "842", "-layout", pdf, "-"],
            capture_output=True, text=True, check=True).stdout
        linhas += [l.strip() for l in saida.split("\n")]
    return [l for l in linhas if l and not re.fullmatch(r"\d{1,2}", l)]


def juntar(linhas: list[str]) -> str:
    texto = ""
    for l in linhas:
        texto += l if texto.endswith("-") and not texto.endswith(" -") else f" {l}"
    return re.sub(r"\s+", " ", texto).strip()


def saudacao(linhas: list[str], lingua: str) -> str:
    marca = {"latim": "PIUS EPISCOPUS", "portugues": "PIO, BISPO"}[lingua]
    comeco = next((i for i, l in enumerate(linhas) if l.startswith(marca)), None)
    fim = next((i for i, l in enumerate(linhas) if l.startswith("1 - ")), None)
    if comeco is None or fim is None or comeco >= fim:
        raise SystemExit(f"{lingua}: não achei a saudação")
    return "\n".join(linhas[comeco:fim])


def paragrafos(linhas: list[str], lingua: str) -> list[str]:
    comecos = [i for i, l in enumerate(linhas) if re.match(r"1 - ", l)]
    if len(comecos) != 1:
        raise SystemExit(f"{lingua}: não achei o começo do parágrafo 1")
    linhas = linhas[comecos[0]:]
    cortes, esperado, fecho = [], 1, list(FECHO[lingua])
    for i, l in enumerate(linhas):
        if esperado <= NUMERADOS and re.match(rf"{esperado} - ", l):
            cortes.append(i)
            esperado += 1
        elif esperado > NUMERADOS and fecho and l.startswith(fecho[0]):
            cortes.append(i)
            fecho.pop(0)
    if esperado != NUMERADOS + 1 or fecho:
        raise SystemExit(f"{lingua}: parei no parágrafo {esperado}; faltou do fecho: {fecho}")
    return [juntar(linhas[a:b]) for a, b in zip(cortes, cortes[1:] + [len(linhas)])]


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    esquerda, direita = coluna(sys.argv[1], 0), coluna(sys.argv[1], MEIO)
    latim = [saudacao(esquerda, "latim")] + paragrafos(esquerda, "latim")
    portugues = [saudacao(direita, "portugues")] + paragrafos(direita, "portugues")
    if len(latim) != len(portugues):
        raise SystemExit(f"colunas desiguais: {len(latim)} e {len(portugues)}")

    blocos = [{
        "id": f"qp-{n:03d}",
        "tipo": "bilingue",
        "latim": [{"id": f"qp-{n:03d}-la", "tipo": "paragrafo", "texto": la}],
        "portugues": [{"id": f"qp-{n:03d}-pt", "tipo": "paragrafo", "texto": pt}],
    } for n, (la, pt) in enumerate(zip(latim, portugues))]

    doc = json.loads(DESTINO.read_text(encoding="utf-8"))
    secao = {
        "id": "quo-primum",
        "titulo": "Bula Quo primum tempore",
        "resumo": "São Pio V, 14 de julho de 1570.",
        "blocos": blocos,
    }
    doc["secoes"] = [secao] + [s for s in doc["secoes"]
                               if s["id"] not in ("quo-primum", "em-preparacao")]
    DESTINO.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(blocos)} parágrafos em {DESTINO.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
