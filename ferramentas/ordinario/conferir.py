#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Confere o Ordinário já gravado contra o PDF de onde saiu.

    python3 ferramentas/ordinario/conferir.py <pdf>

Conta as palavras do PDF e as das treze seções e compara as duas contagens.
É grosseiro de propósito: não julga ordem nem pontuação, só responde a única
pergunta que uma transcrição automática precisa responder antes de ir ao ar
— **alguma palavra sumiu, ou apareceu alguma que não estava lá?**

Foi assim que apareceram as coisas que o olho não pegaria num impresso de
cinquenta páginas: a fonte que o poppler só declara uma vez e que fazia toda
rubrica virar texto de corpo da página 6 em diante, o Calibri que o arquivo
usa para desenhar um "í" no meio de uma palavra latina, e o título centrado
que chegava como "ORDINÁRIODAMISSA".

Sai com código 1 se divergir, para entrar na conferência automática.
"""
import collections, io, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar import SAIDA, SECOES

PALAVRA = re.compile(r"[\wÀ-ɏ'’]+")
# As marcas do texto rico, uma a uma, e não `[a-z]+`: o impresso põe entre
# colchetes as palavras que o tradutor acrescentou — "[fieis]", "[vindo]",
# "[celestes]" —, e uma regra larga as apagava do lado do site, acusando
# cinco palavras perdidas que estavam lá.
MARCACAO = re.compile(r"\[/?(?:b|i|lat|r|tinta|nota|elo|botao|mapa)(?::[^\]]*)?\]")

# O que está no PDF e não vai para os dados.
#
# "Ver a Missa do dia" vira o lugar do próprio, que no site se preenche com o
# folheto do dia em vez de repetir a frase; e a numeração de página do Word
# sai do `pdftotext` como palavra solta.
FORA = ("Ver a Missa do dia.", "Ver a Missa do dia")


def palavras(texto, marcado=True):
    """
    As palavras de um texto, em minúsculas.

    `marcado` falso para o que vem do PDF, que marcação nenhuma tem. A
    diferença não é zelo: o impresso escreve "[celestes]" entre colchetes, no
    Sanctus, e tirar a marcação do lado do PDF apagava a palavra inteira —
    "[celestes]" tem a mesma cara de um "[i]" do texto rico. A conferência
    acusava uma palavra sobrando que estava nos dois lados.
    """
    if marcado:
        texto = MARCACAO.sub(" ", texto)
    return collections.Counter(PALAVRA.findall(texto.lower()))


def textosDo(bloco):
    if bloco["tipo"] == "bilingue":
        for lado in ("latim", "portugues"):
            for dentro in bloco[lado]:
                yield from textosDo(dentro)
    elif "texto" in bloco:
        yield bloco["texto"]


def main(pdf):
    cru = subprocess.run(["pdftotext", "-raw", pdf, "-"],
                         capture_output=True, check=True).stdout.decode("utf-8")
    for frase in FORA:
        cru = cru.replace(frase, " ")
    noPdf = palavras(cru, marcado=False)

    noSite = collections.Counter()
    for id_, _, _, _ in SECOES:
        caminho = os.path.join(SAIDA, "%s.json" % id_)
        if not os.path.exists(caminho):
            print("%-16s FALTA o arquivo" % id_)
            return 1
        with io.open(caminho, encoding="utf-8") as f:
            secao = json.load(f)
        conta = palavras("\n".join(t for b in secao["blocos"] for t in textosDo(b)))
        noSite += conta
        print("%-16s %3d blocos, %5d palavras" % (id_, len(secao["blocos"]),
                                                  sum(conta.values())))

    # A numeração de página é a única coisa que o `pdftotext` entrega e que
    # não é texto do impresso: números soltos, de 1 ao número de páginas.
    faltando = noPdf - noSite
    for n in list(faltando):
        if n.isdigit():
            del faltando[n]
    sobrando = noSite - noPdf

    print()
    if faltando:
        print("FALTANDO %s" % dict(sorted(faltando.items())))
    if sobrando:
        print("SOBRANDO %s" % dict(sorted(sobrando.items())))
    if not faltando and not sobrando:
        print("%d palavras, nenhuma perdida" % sum(noSite.values()))
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
