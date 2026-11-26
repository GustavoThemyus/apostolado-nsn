#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
    python3 ferramentas/capas/gerar.py <EBGaramond[wght].ttf>
"""
import hashlib, os, sys
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
SAIDA = os.path.join(RAIZ, "public", "capas")

L, A = 480, 640
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
    x = (L - largura(desenho, texto, f, espaco)) / 2
    for c in texto:
        desenho.text((x, y), c, font=f, fill=cor)
        x += desenho.textlength(c, font=f) + espaco


def maior_que_cabe(desenho, ttf, linhas, limite, espaco, teto=46):
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

    for y in range(A):
        t = y / (A - 1)
        pintor.line(
            [(0, y), (L, y)],
            fill=tuple(round(FUNDO_ALTO[i] + (FUNDO_BAIXO[i] - FUNDO_ALTO[i]) * t)
                       for i in range(3)))

    pintor.rectangle([16, 16, L - 17, A - 17], outline=OURO, width=1)
    pintor.rectangle([22, 22, L - 23, A - 23], outline=(0x4A, 0x40, 0x28), width=1)

    brasao = Image.open(os.path.join(RAIZ, "public", "brasao.png")).convert("RGBA")
    largura_brasao = 118
    brasao = brasao.resize(
        (largura_brasao, round(brasao.height * largura_brasao / brasao.width)),
        Image.LANCZOS)
    folha.paste(brasao, ((L - brasao.width) // 2, 78), brasao)

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
