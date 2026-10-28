"""
Tira as estampas de um folheto em PDF e grava em public/folhetos/.

O Perez manda os folhetos prontos em PDF, e o que interessa deles aqui é a
figura: o resto — moldura, títulos, orações — vira texto no site, que é o
ponto de hospedar nativo em vez de servir o PDF.

Uso:

    python3 ferramentas/folhetos/gerar.py <pdf>                   lista as imagens
    python3 ferramentas/folhetos/gerar.py <pdf> <indice> [nome]   grava aquela

Lista primeiro, de propósito. Num folheto de duas páginas há sempre três
imagens, e duas delas são a mesma moldura repetida; adivinhar qual é a figura
daria errado no dia em que o folheto tiver duas.

O nome leva a impressão do conteúdo, como as outras estampas: o cache é de um
ano, e trocar a imagem tem de trocar o nome.
"""

import hashlib
import pathlib
import subprocess
import sys
import tempfile

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "public" / "folhetos"

# Sem reamostrar para cima: a figura do PDF é o único original que existe, e
# ampliá-la só inventaria pixel. 1000 é o teto para o que vier grande demais.
LARGURA_MAXIMA = 1000


def listar(pdf: pathlib.Path) -> list[dict]:
    saida = subprocess.run(
        ["pdfimages", "-list", str(pdf)], capture_output=True, text=True, check=True
    ).stdout.splitlines()
    imagens = []
    for linha in saida[2:]:
        campos = linha.split()
        if len(campos) < 4:
            continue
        imagens.append(
            {"pagina": int(campos[0]), "num": int(campos[1]),
             "largura": int(campos[3]), "altura": int(campos[4])}
        )
    return imagens


def extrair(pdf: pathlib.Path, indice: int, pasta: pathlib.Path) -> pathlib.Path:
    subprocess.run(
        ["pdfimages", "-png", str(pdf), str(pasta / "img")], check=True
    )
    achados = sorted(pasta.glob("img-*.png"))
    if indice >= len(achados):
        raise SystemExit(f"índice {indice} não existe: o PDF tem {len(achados)} imagens")
    return achados[indice]


def gravar(origem: pathlib.Path, base: str) -> pathlib.Path:
    figura = Image.open(origem).convert("RGB")
    if figura.width > LARGURA_MAXIMA:
        altura = round(figura.height * LARGURA_MAXIMA / figura.width)
        figura = figura.resize((LARGURA_MAXIMA, altura), Image.LANCZOS)

    DESTINO.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        provisorio = pathlib.Path(tmp) / "saida.webp"
        figura.save(provisorio, "WEBP", quality=88, method=6)
        bruto = provisorio.read_bytes()

    caminho = DESTINO / ("%s-%s.webp" % (base, hashlib.sha1(bruto).hexdigest()[:8]))
    caminho.write_bytes(bruto)
    return caminho


def principal() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    pdf = pathlib.Path(sys.argv[1])
    if not pdf.exists():
        raise SystemExit(f"não achei {pdf}")

    imagens = listar(pdf)
    if len(sys.argv) < 3:
        print(f"{pdf.name}: {len(imagens)} imagens")
        for i, im in enumerate(imagens):
            print(f"  [{i}] página {im['pagina']}  {im['largura']}x{im['altura']}")
        print("\nescolha uma e rode de novo com o índice")
        return

    with tempfile.TemporaryDirectory() as pasta:
        bruta = extrair(pdf, int(sys.argv[2]), pathlib.Path(pasta))
        figura = Image.open(bruta)
        nome_base = sys.argv[3] if len(sys.argv) > 3 else pdf.stem.lower().replace(" ", "-")
        destino = gravar(bruta, nome_base)
    gravada = Image.open(destino)
    print(f"{destino.relative_to(RAIZ)}  {figura.size[0]}x{figura.size[1]}"
          f"  {destino.stat().st_size // 1024} KB")
    # as tres linhas juntas, e nao so a do caminho: o navegador tira a
    # proporcao das medidas, e copiar o caminho sem elas deixa a folha com a
    # proporcao da estampa anterior ate a imagem chegar
    print(f'  "imagem": "/folhetos/{destino.name}",')
    print(f'  "largura": {gravada.width},')
    print(f'  "altura": {gravada.height},')


if __name__ == "__main__":
    principal()
