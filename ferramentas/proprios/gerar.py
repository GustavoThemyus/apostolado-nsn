#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Põe os próprios da Missa em `src/data/folhetos.json`.

    python3 ferramentas/proprios/gerar.py <pasta com os PDFs>

Os PDFs são os que o Ordo do Apostolado já anexa a cada dia — os mesmos do
"Confira o próprio da Missa" no calendário. O endereço de cada um está na
tabela abaixo, ao lado do nome do arquivo, porque é dele que vem o campo
`arquivo` do folheto: a folha no site e o PDF no Drive são a mesma coisa, e
quem quiser imprimir tem de poder chegar ao segundo.

Rodar de novo é seguro: cada folheto é substituído pelo id, e os que não
estão nesta tabela ficam onde estão.

O que não é transcrever está em `extrair.py`. O que é decisão está aqui: o
título, o resumo e a ordem. O resumo guarda a linha de grau e cor que vem no
alto do impresso ("Semiduples de 1ª classe – roxo"), que de outro modo se
perderia: ela não é parágrafo do próprio, mas é informação do dia.
"""
import collections, io, json, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extrair import extrair

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
SAIDA = os.path.join(RAIZ, "src", "data", "folhetos.json")

# O índice que liga o anexo do Ordo ao folheto: o calendário precisa dele e
# não pode importar a coleção inteira, que são 138 KB para descobrir um id.
#
# A chave é o id do arquivo no Drive, e não o endereço inteiro: o Ordo traz
# o mesmo arquivo com "?usp=drivesdk" no fim, e comparar endereços faria o
# calendário não reconhecer nenhum dos sete.
INDICE = os.path.join(RAIZ, "src", "data", "proprios-no-ordo.json")

DRIVE = "https://drive.google.com/file/d/%s/view"

# Na ordem do Advento, que é a ordem em que o fiel vai precisar deles.
PROPRIOS = [
    dict(
        id="proprio-advento-i",
        pdf="advento-1.pdf",
        drive="106fV_2yxCCsJnGiM7Wz4KdjqOpNsAuAZ",
        titulo="I Domingo do Advento",
        resumo="O próprio da Missa, em latim e em português. Semiduples de 1ª classe, roxo.",
    ),
    dict(
        id="proprio-advento-ii",
        pdf="advento-2.pdf",
        drive="1H9wbaf4Q6raUAfxsZkzs3Nx3_6DIXYPy",
        titulo="II Domingo do Advento",
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, roxo.",
    ),
    dict(
        id="proprio-imaculada-conceicao",
        pdf="imaculada.pdf",
        drive="1X0dSaMVDRHR1a2MzaNmzhMPtTtK0JmnU",
        titulo="Imaculada Conceição da Bem-aventurada Virgem Maria",
        resumo="O próprio da Missa de 8 de dezembro, em latim e em português. "
               "Duples de 1ª classe com Oitava comum, branco.",
    ),
    dict(
        id="proprio-guadalupe",
        pdf="guadalupe.pdf",
        drive="1ibAEJPRUEvURuBcWYL1KZBEyr-dW0g_V",
        titulo="Nossa Senhora de Guadalupe",
        resumo="O próprio da Missa de 12 de dezembro, padroeira principal da América "
               "Latina, em latim e em português. Duples de 1ª classe com Oitava comum, branco.",
    ),
    dict(
        id="proprio-advento-iii",
        pdf="advento-3.pdf",
        drive="1tFvqt723b1iCpNr-pleQuxNbwWKDSVmG",
        titulo="III Domingo do Advento",
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, "
               "róseo ou roxo.",
    ),
    dict(
        id="proprio-advento-iv",
        pdf="advento-4.pdf",
        drive="1nsQzcNloI5dieoT1Sm_gDfXg1DOaHGIs",
        titulo="IV Domingo do Advento",
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, roxo.",
    ),
    dict(
        id="proprio-vigilia-do-natal",
        pdf="vigilia-natal.pdf",
        drive="1erpfMkC2Ev2xra0bceRyzr8r91_hUWPB",
        titulo="Vigília do Natal do Senhor",
        resumo="O próprio da Missa de 24 de dezembro, em latim e em português. "
               "Privilegiada de 1ª classe, roxo.",
    ),
]


# ---------------------------------------------------------------- erratas
#
# O que está errado nos PDFs e sai certo no site.
#
# São gralhas de digitação, não variantes: "Fílium tumm" não existe, e
# "Fatres" tampouco. Ficam aqui, contadas uma a uma, por três motivos: para
# que a lista possa ir ao Perez e ele corrigir o original; para que a
# conferência continue exata, já que ela sabe destas e só destas; e para que
# uma remessa nova que as conserte **quebre** este gerador em vez de passar
# calada — se a conta não bater, é porque o PDF mudou, e aí se relê.
#
# Nada de correção silenciosa de latim: o que não estiver nesta lista vai ao
# ar exatamente como o Perez escreveu.
ERRATAS = [
    ("Fílium tumm", "Fílium tuum", 9),
    ("Fatres:", "Fratres:", 2),
    ("discípu lis", "discípulis", 1),
    ("(ls XL,5)", "(Is XL,5)", 1),
]


def corrigir(blocos):
    """Aplica as erratas e devolve quantas vezes cada uma pegou."""
    contagem = collections.Counter()

    def nos(bloco):
        for chave in ("texto",):
            if chave in bloco:
                for errado, certo, _ in ERRATAS:
                    if errado in bloco[chave]:
                        contagem[errado] += bloco[chave].count(errado)
                        bloco[chave] = bloco[chave].replace(errado, certo)
        for lado in ("latim", "portugues"):
            for dentro in bloco.get(lado, []):
                nos(dentro)

    for bloco in blocos:
        nos(bloco)
    return contagem


def comIds(blocos, ident):
    """Cada bloco com id estável, na ordem: é por ele que o painel compara."""
    for n, bloco in enumerate(blocos, 1):
        bloco["id"] = "%s-%02d" % (ident, n)
        if bloco["tipo"] == "bilingue":
            for lado, sigla in (("latim", "la"), ("portugues", "pt")):
                for m, dentro in enumerate(bloco[lado], 1):
                    dentro["id"] = "%s-%02d-%s-%02d" % (ident, n, sigla, m)
    return blocos


def folheto(ficha, pasta, contagem):
    extrato = extrair(os.path.join(pasta, ficha["pdf"]))
    contagem.update(corrigir(extrato["blocos"]))
    return {
        "id": ficha["id"],
        "chapeu": "Próprio da Missa",
        "titulo": ficha["titulo"],
        "resumo": ficha["resumo"],
        "categoria": "proprio",
        "arquivo": DRIVE % ficha["drive"],
        "blocos": comIds(extrato["blocos"], ficha["id"]),
    }


def main(pasta):
    with io.open(SAIDA, encoding="utf-8") as f:
        colecao = json.load(f)

    novos = {}
    contagem = collections.Counter()
    for ficha in PROPRIOS:
        novos[ficha["id"]] = folheto(ficha, pasta, contagem)

    for errado, _, quantas in ERRATAS:
        if contagem[errado] != quantas:
            raise SystemExit(
                "errata %r: esperadas %d ocorrências, achadas %d. O PDF mudou; "
                "releia antes de gravar." % (errado, quantas, contagem[errado]))

    # substitui o que já existe, no lugar em que está; o resto entra no fim,
    # na ordem da tabela
    saida = []
    for f in colecao["folhetos"]:
        saida.append(novos.pop(f["id"]) if f["id"] in novos else f)
    for ficha in PROPRIOS:
        if ficha["id"] in novos:
            saida.append(novos.pop(ficha["id"]))
    colecao["folhetos"] = saida

    with io.open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(colecao, f, ensure_ascii=False, indent=1)
        f.write("\n")

    with io.open(INDICE, "w", encoding="utf-8") as f:
        json.dump({x["drive"]: x["id"] for x in PROPRIOS}, f, ensure_ascii=False, indent=1)
        f.write("\n")

    blocos = sum(len(x["blocos"]) for x in saida if x["categoria"] == "proprio")
    print("próprios: %d | blocos: %d | folhetos no arquivo: %d | erratas: %d" % (
        len(PROPRIOS), blocos, len(saida), sum(contagem.values())))
    print("gravado em", os.path.normpath(SAIDA),
          "(%d KB)" % (os.path.getsize(SAIDA) // 1024))


if __name__ == "__main__":
    main(sys.argv[1])
