"""
    python3 ferramentas/padroeiros/gerar.py <imagem> <nome> [ancora|inteira]
"""

import hashlib
import pathlib
import sys
import tempfile

from PIL import Image, ImageFilter

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "public" / "padroeiros"

LARGURA, ALTURA = 480, 640

NITIDEZ = dict(radius=0.8, percent=80, threshold=2)

QUALIDADE = 78


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


def encaixar(figura: Image.Image) -> Image.Image:
    escala = min(LARGURA / figura.width, ALTURA / figura.height)
    menor = figura.resize(
        (round(figura.width * escala), round(figura.height * escala)), Image.LANCZOS)
    menor = menor.filter(ImageFilter.UnsharpMask(**NITIDEZ)).convert("RGBA")
    quadro = Image.new("RGBA", (LARGURA, ALTURA), (0, 0, 0, 0))
    quadro.paste(menor, ((LARGURA - menor.width) // 2, (ALTURA - menor.height) // 2))
    return quadro


def gerar(origem: pathlib.Path, nome: str, ancora: float | None) -> pathlib.Path:
    figura = Image.open(origem).convert("RGB")
    if ancora is None:
        figura = encaixar(figura)
    else:
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
    pedido = sys.argv[3] if len(sys.argv) > 3 else "0,5"
    ancora = None if pedido == "inteira" else float(pedido.replace(",", "."))

    destino = gerar(origem, sys.argv[2], ancora)
    print(f"{destino.relative_to(RAIZ)}  {destino.stat().st_size // 1024} KB")
    print(f'  "imagem": "/padroeiros/{destino.name}"')
    print("  atualizar em: src/data/inicio.json, src/data/postagens.json"
          + (", src/data/site.json" if sys.argv[2] == "neves" else ""))


if __name__ == "__main__":
    principal()
