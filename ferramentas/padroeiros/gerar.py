"""
Estampas dos padroeiros, a partir do original.

A receita estava descrita em public/padroeiros/COMO-GERAR.md e nunca tinha
virado código: refazer uma estampa exigia reler a prosa e reconstruir os
números à mão. Agora os números estão aqui, e a prosa explica por quê.

Uso:

    python3 ferramentas/padroeiros/gerar.py <imagem> <nome> [ancora]

`ancora` é de 0 a 1 e diz de onde vem o corte 3:4 na dimensão que sobra —
0 é topo (ou esquerda), 1 é a base. Sem ela, 0,5.

O nome de saída leva a impressão do conteúdo, porque o cache é de um ano:
trocar a imagem tem de trocar o nome, senão quem já visitou fica com a
antiga.
"""

import hashlib
import pathlib
import sys
import tempfile

from PIL import Image, ImageFilter

RAIZ = pathlib.Path(__file__).resolve().parents[2]
DESTINO = RAIZ / "public" / "padroeiros"

# 480 cobre o pior caso medido: o quadro para de crescer em 9rem, o que num
# celular a 3x pede 432 pixels de tela.
LARGURA, ALTURA = 480, 640

# Medido contra o original reduzido direto ao tamanho de tela: devolve 99% da
# energia de borda dele. 110% de força já ultrapassa o original e cria halo.
NITIDEZ = dict(radius=0.8, percent=80, threshold=2)

# Depois de afiar, 78 mede o mesmo que 86 na tela e pesa bem menos.
QUALIDADE = 78


def cortar(figura: Image.Image, ancora: float) -> Image.Image:
    """Recorte 3:4, tirando a sobra do lado que a âncora escolher."""
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
    print(f'  "imagem": "/padroeiros/{destino.name}"')
    print("  atualizar em: src/data/inicio.json, src/data/postagens.json"
          + (", src/data/site.json" if sys.argv[2] == "neves" else ""))


if __name__ == "__main__":
    principal()
