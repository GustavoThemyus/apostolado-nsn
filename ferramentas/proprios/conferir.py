#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere os próprios já gravados contra os PDFs de onde saíram.

    python3 ferramentas/proprios/conferir.py <pasta com os PDFs>

Conta as palavras do PDF e as do folheto e compara as duas contagens. É
grosseiro de propósito: não julga ordem nem pontuação, só responde a única
pergunta que uma transcrição automática precisa responder antes de ir ao ar
— **alguma palavra sumiu, ou apareceu alguma que não estava lá?**

Foi assim que apareceram as três coisas que o olho não pegaria num texto
litúrgico de mil palavras: a linha que termina em hífen e emenda na seguinte,
o "O" de "Oblátis" que o PDF deixou no fragmento da coluna portuguesa, e a
abreviatura em itálico que colava na palavra anterior.

Sai com código 1 se alguma divergir, para poder entrar numa conferência
automática no dia em que os próprios forem muitos.
"""
import collections, io, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar import ERRATAS, PROPRIOS, SAIDA

PALAVRA = re.compile(r"[\wÀ-ɏ'’]+")
MARCACAO = re.compile(r"\[/?[a-z]+(?::[^\]]*)?\]")


def palavras(texto):
    return collections.Counter(PALAVRA.findall(MARCACAO.sub(" ", texto).lower()))


def textosDo(bloco):
    if bloco["tipo"] == "bilingue":
        for lado in ("latim", "portugues"):
            for dentro in bloco[lado]:
                yield from textosDo(dentro)
    elif "texto" in bloco:
        yield bloco["texto"]


def main(pasta):
    with io.open(SAIDA, encoding="utf-8") as f:
        porId = {x["id"]: x for x in json.load(f)["folhetos"]}

    problemas = 0
    for ficha in PROPRIOS:
        folheto = porId.get(ficha["id"])
        if not folheto:
            print("%-30s FALTA no folhetos.json" % ficha["id"])
            problemas += 1
            continue

        caminho = os.path.join(pasta, ficha["pdf"])
        cru = subprocess.run(["pdftotext", "-raw", caminho, "-"],
                             capture_output=True, check=True).stdout.decode("utf-8")
        # as gralhas conhecidas saem corrigidas no site; aqui se corrigem
        # também no PDF, senão a conferência acusaria a correção como perda
        for errado, certo, _ in ERRATAS:
            cru = cru.replace(errado, certo)

        # o cabeçalho do PDF (nome da festa, data, grau e cor) não vira bloco:
        # vira título e resumo do folheto, e por isso entra na conta por eles
        noSite = palavras("\n".join(
            [folheto["titulo"], folheto["resumo"]]
            + [t for b in folheto["blocos"] for t in textosDo(b)]))
        noPdf = palavras(cru)

        faltando = noPdf - noSite
        if faltando:
            print("%-30s FALTANDO %s" % (ficha["id"], dict(sorted(faltando.items()))))
            problemas += 1
        else:
            print("%-30s %d palavras, nenhuma perdida" % (ficha["id"], sum(noPdf.values())))

    if problemas:
        print("\n%d próprio(s) divergem do PDF" % problemas)
    return 1 if problemas else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
