#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import collections, io, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar import ERRATAS, PROPRIOS, SAIDA

PALAVRA = re.compile(r"[\wÀ-ɏ'’]+")
MARCACAO = re.compile(r"\[/?(?:b|i|lat|r|tinta|nota|elo|botao|mapa)(?::[^\]]*)?\]")


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


def casarQuebras(faltando, sobrando):
    for inteira in list(sobrando):
        achou = True
        while achou and sobrando[inteira] > 0:
            achou = False
            for k in range(1, len(inteira)):
                x, y = inteira[:k], inteira[k:]
                metades = [m for m in (x, y) if faltando.get(m)]
                if not metades:
                    continue
                for metade in metades:
                    faltando[metade] -= 1
                    if faltando[metade] <= 0:
                        del faltando[metade]
                sobrando[inteira] -= 1
                achou = True
                break


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
        if not os.path.exists(caminho):
            print("%-30s sem o PDF na pasta, não conferido" % ficha["id"])
            continue
        cru = subprocess.run(["pdftotext", "-raw", caminho, "-"],
                             capture_output=True, check=True).stdout.decode("utf-8")
        cru = re.sub(r"(?m)^\s*\d{1,2}\s*$", "", cru)
        for errado, certo, _ in ERRATAS:
            cru = cru.replace(errado, certo)

        noSite = palavras("\n".join(
            [folheto["titulo"], folheto["resumo"], *folheto.get("cabecalho", {}).values()]
            + [t for b in folheto["blocos"] for t in textosDo(b)]))
        doSite = set(noSite)
        cru = re.sub(
            r"(\w+)-\n(\w+)",
            lambda m: (m.group(1) + m.group(2)
                       if (m.group(1) + m.group(2)).lower() in doSite
                       else m.group(1) + "-" + m.group(2)),
            cru)
        noPdf = palavras(cru, marcado=False)

        faltando = noPdf - noSite
        casarQuebras(faltando, noSite - noPdf)
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
