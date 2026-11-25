#!/usr/bin/env python3
"""
Grava em `public/fontes/` a EB Garamond do site: a do Google Fonts sem a forma
localizada (`locl`).

A EB Garamond troca u por v em texto marcado como latim ("Totvs tvvs"), a
ortografia das inscrições. Desligar isso por CSS não vale no Safari do iPhone,
então o site serve uma cópia em que a troca não existe.

    python3 ferramentas/fontes/gerar.py <pasta>

A pasta tem de trazer, de github.com/google/fonts, em ofl/ebgaramond:
`EBGaramond[wght].ttf` como ebg.ttf, `EBGaramond-Italic[wght].ttf` como
ebg-italico.ttf, e `OFL.txt`. Pede `fonttools` e `brotli` instalados.

Reescreve o bloco de @font-face em `src/styles/tema.css`. Se a troca sobrar na
fonte gerada, ou se faltar um caractere que o conteúdo do site usa, nada é
gravado.
"""

import hashlib
import io
import pathlib
import re
import shutil
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "public/fontes"
TEMA = RAIZ / "src/styles/tema.css"
FAMILIA = "Garamond do Site"
PESOS = (400, 600)
INICIO, FIM = "/* fontes: início (ferramentas/fontes/gerar.py) */", "/* fontes: fim */"

# latim e português com folga, grego, pontuação, ℣ ℟, setas e ligaduras
FAIXAS = [(0x0000, 0x024F), (0x02B0, 0x03FF), (0x1E00, 0x1FFF), (0x2000, 0x218F),
          (0x2190, 0x22FF), (0x25A0, 0x27BF), (0x2C60, 0x2C7F), (0xA720, 0xA7FF),
          (0xFB00, 0xFB06), (0xFEFF, 0xFEFF)]


def usados() -> set[int]:
    """Os caracteres que o conteúdo do site escreve."""
    texto = ""
    for caminho in (RAIZ / "src").rglob("*"):
        if caminho.suffix in (".json", ".tsx"):
            texto += caminho.read_text(encoding="utf-8")
    return {ord(c) for c in texto if ord(c) > 31}


def gerar(origem: pathlib.Path) -> bytes:
    fonte = TTFont(origem)
    antes = set(fonte.getBestCmap())
    fonte = instancer.instantiateVariableFont(fonte, {"wght": PESOS})
    # gravar e reler: o recorte tropeça nas tabelas que o passo acima deixa
    # pela metade na memória
    meio = io.BytesIO()
    fonte.save(meio)
    meio.seek(0)
    fonte = TTFont(meio)

    opcoes = subset.Options()
    marcas = {r.FeatureTag for t in ("GSUB", "GPOS") for r in fonte[t].table.FeatureList.FeatureRecord}
    opcoes.layout_features = sorted(marcas - {"locl"})
    opcoes.name_IDs = ["*"]
    opcoes.name_languages = ["*"]
    recorte = subset.Subsetter(opcoes)
    recorte.populate(unicodes=[c for a, b in FAIXAS for c in range(a, b + 1)])
    recorte.subset(fonte)

    for registro in fonte["name"].names:
        if registro.nameID in (1, 3, 4, 6, 16, 25):
            novo = str(registro).replace("EB Garamond", FAMILIA).replace(
                "EBGaramond", FAMILIA.replace(" ", ""))
            registro.string = novo

    sobrou = {r.FeatureTag for r in fonte["GSUB"].table.FeatureList.FeatureRecord}
    if "locl" in sobrou:
        raise SystemExit(f"{origem.name}: a forma localizada sobrou")
    faltam = (usados() & antes) - set(fonte.getBestCmap())
    if faltam:
        raise SystemExit(f"{origem.name}: faltam caracteres: {[hex(c) for c in sorted(faltam)]}")

    fonte.flavor = "woff2"
    saida = io.BytesIO()
    fonte.save(saida)
    return saida.getvalue()


def main(pasta: str) -> None:
    pasta = pathlib.Path(pasta)
    prontas = [(nome, estilo, gerar(pasta / f"{origem}.ttf")) for origem, nome, estilo in
               (("ebg", "garamond", "normal"), ("ebg-italico", "garamond-italico", "italic"))]

    DESTINO.mkdir(parents=True, exist_ok=True)
    for velha in DESTINO.glob("garamond*.woff2"):
        velha.unlink()
    faces = []
    for nome, estilo, dados in prontas:
        arquivo = f"{nome}-{hashlib.sha1(dados).hexdigest()[:8]}.woff2"
        (DESTINO / arquivo).write_bytes(dados)
        faces.append(f'''@font-face {{
  font-family: "{FAMILIA}";
  font-style: {estilo};
  font-weight: {PESOS[0]} {PESOS[1]};
  font-display: swap;
  src: url("/fontes/{arquivo}") format("woff2");
}}''')
        print(f"public/fontes/{arquivo}  {len(dados) // 1024} KB")
    shutil.copy(pasta / "OFL.txt", DESTINO / "OFL-garamond.txt")

    tema = TEMA.read_text(encoding="utf-8")
    bloco = "\n".join([INICIO, *faces, FIM])
    if INICIO in tema:
        tema = re.sub(re.escape(INICIO) + r".*?" + re.escape(FIM), bloco, tema, flags=re.S)
    elif tema.count(":root {") >= 1:
        tema = tema.replace(":root {", bloco + "\n\n:root {", 1)
    else:
        raise SystemExit("não achei onde pôr as fontes no tema.css")
    TEMA.write_text(tema, encoding="utf-8")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
