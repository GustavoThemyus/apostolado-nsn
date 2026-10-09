#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera os arquivos do brasão a partir dos originais que o Perez mandou.

    python3 ferramentas/brasao/gerar.py <colorido.png> <branco.png> <preto.png>

Três versões, e cada uma tem um lugar:

- **colorido** — a marca do site. Barra, cabeçalho de toda página, menu e a
  página do brasão, que é onde ele aparece maior.
- **branco** e **preto** — o selo do rodapé, em silhueta. O branco serve o
  tema escuro e o preto o claro; quem troca é o CSS, pelo mesmo seletor que
  o `tema.css` usa, para acompanhar também o botão de tema e não só a
  preferência do sistema.

Os três originais vêm numa folha A4 com muita margem. O gerador recorta pela
caixa do alfa, que é o desenho de verdade, e não por medida escolhida a olho.

O nome leva a impressão do conteúdo, como as estampas: o cache é de um ano,
e trocar a imagem tem de trocar o nome, senão o navegador de quem já visitou
continua com a antiga.
"""
import hashlib, os, sys
from PIL import Image

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
PUBLICO = os.path.join(RAIZ, "public")

# O selo do rodapé vai a 3,75rem. O pior caso real é o celular a 3x, onde a
# raiz mede 17px: 3,75rem dão 64, e 3x pedem 192. No computador a raiz chega
# a 20px, mas ali a densidade é 2x e o pedido cai para 150. Então 200 cobre.
#
# Não adianta comprimir mais: o peso está no alfa do campo estrelado, e sem
# perdas mede o mesmo que com. Medido, 280px custavam 19 KB e 200px custam 12.
LARGURA_DO_SELO = 200


def recortar(caminho):
    """O desenho, sem a margem da folha. A caixa vem do alfa."""
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

    # O PNG serve o ícone de toque do iOS e o gerador das folhas de rosto,
    # que precisa de alfa de verdade e não lê WebP tão bem.
    cor.save(os.path.join(PUBLICO, "brasao.png"), "PNG", optimize=True)
    print(f"  public/brasao.png  {cor.width}x{cor.height}  "
          f"{os.path.getsize(os.path.join(PUBLICO, 'brasao.png')) // 1024} KB")

    # Ícone da aba: 66px bastam, e é o único lugar onde bastam.
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
