#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera a estampa da postagem do Enchiridion.

    python3 ferramentas/capas/gerar.py <EBGaramond[wght].ttf>

Não é a capa do livro: é uma folha de rosto nossa, no desenho do site e com o
brasão do Apostolado, para a postagem não ficar sem estampa na faixa do
início. Se o Perez mandar a capa de verdade, ela entra no lugar — é trocar o
arquivo e o caminho em src/data/postagens.json.

O nome leva a impressão do conteúdo, como as estampas dos padroeiros: o cache
é de um ano, e trocar a imagem tem de trocar o nome.
"""
import hashlib, os, sys
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
SAIDA = os.path.join(RAIZ, "public", "capas")

L, A = 480, 640
# Na faixa do início o quadro mede 7rem por toda a altura do cartão, e o
# cartão cresce com o resumo: medido, deu 112 por 276, que é bem mais
# estreito do que 3:4. Com `object-fit: cover` o navegador corta as laterais,
# e a primeira versão desta folha perdeu as pontas de INDULGENTIARUM. Tudo o
# que precisa ser lido cabe nesta faixa do meio; a moldura fica para quem
# abrir a postagem, onde a estampa aparece inteira. A faixa é mais estreita
# do que os 262 medidos: o cartão cresce se um resumo crescer, e quanto mais
# alto o cartão, mais estreita a fatia que sobra.
SEGURA = 232
FUNDO_ALTO, FUNDO_BAIXO = (0x1B, 0x1B, 0x25), (0x0D, 0x0D, 0x13)
OURO = (0xBA, 0xA3, 0x5E)
OURO_CLARO = (0xCA, 0xB5, 0x77)
TINTA = (0xC9, 0xC3, 0xB4)


def fonte(caminho, tamanho, peso="Regular"):
    f = ImageFont.truetype(caminho, tamanho)
    try:
        f.set_variation_by_name(peso)
    except Exception:
        pass
    return f


def largura(desenho, texto, f, espaco=0):
    total = 0
    for c in texto:
        total += desenho.textlength(c, font=f) + espaco
    return total - espaco if texto else 0


def centrado(desenho, y, texto, f, cor, espaco=0):
    """Desenha centrado na largura da folha, com espaçamento entre letras."""
    x = (L - largura(desenho, texto, f, espaco)) / 2
    for c in texto:
        desenho.text((x, y), c, font=f, fill=cor)
        x += desenho.textlength(c, font=f) + espaco


def maior_que_cabe(desenho, ttf, linhas, limite, espaco, teto=46):
    """O maior corpo em que a linha mais longa ainda cabe dentro da moldura."""
    tamanho = teto
    while tamanho > 12:
        f = fonte(ttf, tamanho, "SemiBold")
        if max(largura(desenho, t, f, espaco) for t in linhas) <= limite:
            return f
        tamanho -= 1
    return fonte(ttf, 12, "SemiBold")


def fio(desenho, y, meia_largura, cor, espessura=1):
    desenho.rectangle(
        [L / 2 - meia_largura, y, L / 2 + meia_largura, y + espessura - 1], fill=cor)


def gerar(ttf):
    folha = Image.new("RGB", (L, A))
    pintor = ImageDraw.Draw(folha)

    # fundo: leve degradê de cima para baixo, como o papel escuro do site
    for y in range(A):
        t = y / (A - 1)
        pintor.line(
            [(0, y), (L, y)],
            fill=tuple(round(FUNDO_ALTO[i] + (FUNDO_BAIXO[i] - FUNDO_ALTO[i]) * t)
                       for i in range(3)))

    # moldura dupla, como a do brasão impresso
    pintor.rectangle([16, 16, L - 17, A - 17], outline=OURO, width=1)
    pintor.rectangle([22, 22, L - 23, A - 23], outline=(0x4A, 0x40, 0x28), width=1)

    brasao = Image.open(os.path.join(RAIZ, "public", "brasao.png")).convert("RGBA")
    largura_brasao = 118
    brasao = brasao.resize(
        (largura_brasao, round(brasao.height * largura_brasao / brasao.width)),
        Image.LANCZOS)
    folha.paste(brasao, ((L - brasao.width) // 2, 78), brasao)

    # a linha mais longa é INDULGENTIARUM, e ela tem de caber dentro da
    # moldura interna com folga: fixar o corpo deixava a palavra sangrando
    titular = maior_que_cabe(pintor, ttf, ["ENCHIRIDION", "INDULGENTIARUM"],
                             SEGURA, espaco=2.2)
    miudo = fonte(ttf, 19, "Regular")
    marca = fonte(ttf, 15, "Medium")

    y = 78 + brasao.height + 40
    fio(pintor, y, 46, OURO)

    y += 30
    centrado(pintor, y, "ENCHIRIDION", titular, OURO_CLARO, espaco=2.2)
    y += round(titular.size * 1.3)
    centrado(pintor, y, "INDULGENTIARUM", titular, OURO_CLARO, espaco=2.2)

    y += round(titular.size * 1.7)
    fio(pintor, y, 46, OURO)

    y += 26
    centrado(pintor, y, "Quarta edição", miudo, TINTA)
    y += 30
    centrado(pintor, y, "16 de julho de 1999", miudo, TINTA)

    centrado(pintor, A - 96, "APOSTOLADO", marca, OURO, espaco=2.2)
    centrado(pintor, A - 74, "NOSSA SENHORA", marca, OURO, espaco=2.2)
    centrado(pintor, A - 52, "DAS NEVES", marca, OURO, espaco=2.2)

    bruto = folha.tobytes()
    nome = "enchiridion-%s.webp" % hashlib.sha1(bruto).hexdigest()[:8]
    caminho = os.path.join(SAIDA, nome)
    folha.save(caminho, "WEBP", quality=88, method=6)
    print("%s  %d bytes" % (os.path.relpath(caminho, RAIZ), os.path.getsize(caminho)))
    return nome


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    gerar(sys.argv[1])
