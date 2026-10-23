"""
Estampas de seção e de cartão, a partir do original.

A receita estava descrita em public/cartoes/PROVENIENCIA.md e nunca tinha
virado código. Os números vivem aqui; o porquê de cada um, lá.

Uso:

    python3 ferramentas/cartoes/gerar.py <imagem> <nome> [ancora]

`ancora` vai de 0 a 1 e diz de onde sai o corte 16:9 na dimensão que sobra.
0 é o topo (ou a esquerda), 1 é a base. Sem ela, 0,5.

Antes de trocar uma estampa, ler a seção de licença do PROVENIENCIA.md: até
agora todas eram de domínio público, e isso foi critério, não acaso.
"""

import hashlib
import pathlib
import sys
import tempfile

from PIL import Image, ImageFilter

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "public" / "cartoes"

# 1100 cobre o pior caso: o cartão mede 353px no celular, o que a 3x pede 1059.
LARGURA, ALTURA = 1100, 619

NITIDEZ = dict(radius=0.8, percent=70, threshold=2)
QUALIDADE = 76


def cortar(figura: Image.Image, ancora: float) -> Image.Image:
    alvo = LARGURA / ALTURA
    atual = figura.width / figura.height
    if abs(atual - alvo) < 1e-6:
        return figura
    if atual > alvo:
        larga = round(figura.height * alvo)
        x = round((figura.width - larga) * ancora)
        return figura.crop((x, 0, x + larga, figura.height))
    alta = round(figura.width / alvo)
    y = round((figura.height - alta) * ancora)
    return figura.crop((0, y, figura.width, y + alta))


def gerar(origem: pathlib.Path, nome: str, ancora: float) -> pathlib.Path:
    figura = Image.open(origem).convert("RGB")
    figura = cortar(figura, ancora)
    figura = figura.resize((LARGURA, ALTURA), Image.LANCZOS)
    figura = figura.filter(ImageFilter.UnsharpMask(**NITIDEZ))

    DESTINO.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        provisorio = pathlib.Path(tmp) / "saida.webp"
        figura.save(provisorio, "WEBP", quality=QUALIDADE, method=6)
        bruto = provisorio.read_bytes()

    caminho = DESTINO / ("%s-%s.webp" % (nome, hashlib.sha1(bruto).hexdigest()[:8]))
    caminho.write_bytes(bruto)
    return caminho


def principal() -> None:
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    origem = pathlib.Path(sys.argv[1])
    if not origem.exists():
        raise SystemExit(f"não achei {origem}")
    ancora = float(sys.argv[3].replace(",", ".")) if len(sys.argv) > 3 else 0.5

    destino = gerar(origem, sys.argv[2], ancora)
    print(f"{destino.relative_to(RAIZ)}  {destino.stat().st_size // 1024} KB")
    print(f'  "imagem": "/cartoes/{destino.name}"   atualizar em src/data/paginas.json')


if __name__ == "__main__":
    principal()
