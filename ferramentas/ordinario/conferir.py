#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import collections, io, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar import SAIDA, SECOES, comoBlocoDoSite, nomearProprios, repartir
from extrair import extrair
from momentos import SECOES_ROTULADAS, emendar

PALAVRA = re.compile(r"[\wÀ-ɏ'’]+")
MARCACAO = re.compile(r"\[/?(?:b|i|lat|r|tinta|nota|elo|botao|mapa)(?::[^\]]*)?\]")

FORA = ("Ver a Missa do dia.", "Ver a Missa do dia")


def palavras(texto, marcado=True):
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


def contaDeBlocos(secoes):
    conta = collections.Counter()
    for blocos in secoes.values():
        conta += palavras("\n".join(t for b in blocos for t in textosDo(b)))
    return conta


def efeitoDasEmendas(pdf):
    blocos = extrair(pdf)
    nomearProprios(blocos)
    secoes = {s[0]: [comoBlocoDoSite(b) for b in crus] for s, crus in repartir(blocos)}
    antes = contaDeBlocos(secoes)
    emendar({id_: secoes[id_] for id_ in SECOES_ROTULADAS})
    depois = contaDeBlocos(secoes)
    return antes - depois, depois - antes


def main(pdf):
    cru = subprocess.run(["pdftotext", "-raw", pdf, "-"],
                         capture_output=True, check=True).stdout.decode("utf-8")
    for frase in FORA:
        cru = cru.replace(frase, " ")
    noPdf = palavras(cru, marcado=False)
    sairam, entraram = efeitoDasEmendas(pdf)
    noPdf = (noPdf - sairam) + entraram

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
