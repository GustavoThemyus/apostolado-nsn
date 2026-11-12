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
# As marcas do texto rico, uma a uma, e não `[a-z]+`: o impresso põe entre
# colchetes as palavras que o tradutor acrescentou — "[fieis]", "[vindo]" —,
# e uma regra larga as apagaria do lado do site, acusando como perdidas
# palavras que estão nos dois lados.
MARCACAO = re.compile(r"\[/?(?:b|i|lat|r|tinta|nota|elo|botao|mapa)(?::[^\]]*)?\]")


def palavras(texto, marcado=True):
    """
    As palavras de um texto, em minúsculas.

    `marcado` falso para o que vem do PDF, que marcação nenhuma tem. Tirar a
    marcação dos dois lados parece zelo e não é: "[fieis]" tem a mesma cara
    de um "[i]", e do lado do PDF a palavra sumiria da conta inteira.
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


def casarQuebras(faltando, sobrando):
    """
    Uma palavra que o PDF quebra entre duas páginas e o site tem inteira.

    O `pdftotext -raw` entrega uma coluna de cada vez, e a quebra no meio de
    uma página emenda por vizinhança (ver `main`). A que cai no fim da coluna
    de uma página e continua na seguinte não: no meio delas vem a outra
    coluna. Para essas vale o contrário: cada palavra que sobra no site e que
    se parte em duas — uma delas faltando — é uma quebra de linha, e a metade
    que faltava sai da conta. O que resta em `faltando` é palavra que sumiu.

    A outra metade pode ser palavra comum ("de|vemos"), que não aparece em
    `faltando` por ter ficado equilibrada, e por isso basta que uma das duas
    esteja lá.
    """
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
        # o número da página, que o extrator também descarta
        cru = re.sub(r"(?m)^\s*\d{1,2}\s*$", "", cru)
        # as gralhas conhecidas saem corrigidas no site; aqui se corrigem
        # também no PDF, senão a conferência acusaria a correção como perda
        for errado, certo, _ in ERRATAS:
            cru = cru.replace(errado, certo)

        # o cabeçalho do PDF (nome da festa, data, grau e cor) não vira bloco:
        # vira título e resumo do folheto, e por isso entra na conta por eles
        noSite = palavras("\n".join(
            [folheto["titulo"], folheto["resumo"], *folheto.get("cabecalho", {}).values()]
            + [t for b in folheto["blocos"] for t in textosDo(b)]))
        # A quebra de linha em hífen no meio de uma coluna emenda com a linha
        # seguinte. Emenda sem hífen quando o site tem a palavra inteira ("sé-" e
        # "culos" são "séculos"), e com ele quando não tem ("ver-" e "se"). É o
        # site que desempata: se o extrator manteve um hífen que não devia, esta
        # conta não vê — quem vê é a lista de hífens mantidos que o gerador
        # imprime, para ser lida.
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
