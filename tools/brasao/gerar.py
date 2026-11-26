#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
    python3 tools/brasao/gerar.py <colorido.png> <branco.png> <preto.png>
"""
import hashlib, os, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
PUBLICO = os.path.join(RAIZ, "public")

LARGURA_DO_SELO = 200


def recortar(caminho):
    im = Image.open(caminho).convert("RGBA")
    caixa = im.getchannel("A").getbbox()
    if caixa is None:
        raise SystemExit(f"{caminho}: imagem sem nada opaco")
    return im.crop(caixa)


def gravar(im, prefixo, formato="WEBP", **opcoes):
    impressao = hashlib.sha1(im.tobytes()).hexdigest()[:8]
    extensao = "webp" if formato == "WEBP" else "png"
    nome = f"{prefixo}-{impressao}.{extensao}"
    im.save(os.path.join(PUBLICO, nome), formato, **opcoes)
    print(f"  public/{nome}  {im.width}x{im.height}  "
          f"{os.path.getsize(os.path.join(PUBLICO, nome)) // 1024} KB")
    return nome


def reduzir(im, largura):
    if im.width <= largura:
        return im
    return im.resize((largura, round(im.height * largura / im.width)), Image.LANCZOS)


def main(colorido, branco, preto):
    saida = {}

    print("colorido (barra, cabeçalho, menu, página do brasão):")
    cor = recortar(colorido)
    saida["colorido"] = gravar(cor, "brasao", quality=90, method=6)

    cor.save(os.path.join(PUBLICO, "brasao.png"), "PNG", optimize=True)
    print(f"  public/brasao.png  {cor.width}x{cor.height}  "
          f"{os.path.getsize(os.path.join(PUBLICO, 'brasao.png')) // 1024} KB")

    pequeno = reduzir(cor, 66)
    pequeno.save(os.path.join(PUBLICO, "brasao-pequeno.png"), "PNG", optimize=True)
    print(f"  public/brasao-pequeno.png  {pequeno.width}x{pequeno.height}")

    print("selo do rodapé:")
    for nome, caminho in (("claro", branco), ("escuro", preto)):
        im = reduzir(recortar(caminho), LARGURA_DO_SELO)
        saida[nome] = gravar(im, f"brasao-{nome}", quality=88, method=6)

    print("\nCaminhos para o código:")
    for chave, nome in saida.items():
        print(f"  {chave:9s} /{nome}")
    return saida


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
