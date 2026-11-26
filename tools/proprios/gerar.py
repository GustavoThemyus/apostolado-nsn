#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import collections, importlib.util, io, json, os, pathlib, re, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extrair import extrair


def _ferramentaDeEstampas():
    caminho = os.path.join(os.path.dirname(os.path.dirname(
        os.path.abspath(__file__))), "folhetos", "gerar.py")
    spec = importlib.util.spec_from_file_location("ferramentaDeEstampas", caminho)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo

ESTAMPAS = _ferramentaDeEstampas()

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
SAIDA = os.path.join(RAIZ, "src", "data", "folhetos.json")

INDICE = os.path.join(RAIZ, "src", "data", "proprios-no-ordo.json")

DRIVE = "https://drive.google.com/file/d/%s/view"

PROPRIOS = [
    dict(
        id="proprio-advento-i",
        pdf="advento-1.pdf",
        drive="1KfjXhKd9HzUDQpJai-4vj1mMaDwWuRlk",
        no_ordo="106fV_2yxCCsJnGiM7Wz4KdjqOpNsAuAZ",
        titulo="I Domingo do Advento",
        cabecalho=dict(nome="I Domingo do Advento",
                       grau="Semiduples de 1ª classe – roxo",
                       estacao="Estação em Santa Maria Maior"),
        resumo="O próprio da Missa, em latim e em português. Semiduples de 1ª classe, roxo.",
    ),
    dict(
        id="proprio-advento-ii",
        pdf="advento-2.pdf",
        drive="1eUpQdrnq6v0vYE1NexX-mB4PKRHeWo3S",
        no_ordo="1H9wbaf4Q6raUAfxsZkzs3Nx3_6DIXYPy",
        titulo="II Domingo do Advento",
        cabecalho=dict(nome="II Domingo do Advento",
                       grau="Semiduples de 2ª classe – roxo",
                       estacao="Estação em Santa Cruz de Jerusalém"),
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, roxo.",
    ),
    dict(
        id="proprio-imaculada-conceicao",
        pdf="imaculada.pdf",
        drive="1BxKk9W07CglcpdjVxrNSvtdDwXTXgfl3",
        no_ordo="1X0dSaMVDRHR1a2MzaNmzhMPtTtK0JmnU",
        titulo="Imaculada Conceição da Bem-aventurada Virgem Maria",
        cabecalho=dict(data="8 de Dezembro",
                       nome="Imaculada Conceição da Bem-aventurada Virgem Maria",
                       grau="Duples de 1ª classe com Oitava comum – branco"),
        resumo="O próprio da Missa de 8 de dezembro, em latim e em português. "
               "Duples de 1ª classe com Oitava comum, branco.",
    ),
    dict(
        id="proprio-guadalupe",
        pdf="guadalupe.pdf",
        drive="1N-ef3DlJq-K5Di_sd8jr-CZZi8ovHa5_",
        no_ordo="1ibAEJPRUEvURuBcWYL1KZBEyr-dW0g_V",
        titulo="Nossa Senhora de Guadalupe",
        cabecalho=dict(data="12 de Dezembro",
                       nome="Bem-aventurada Virgem Maria de Guadalupe",
                       grau="Duples de 1ª classe com Oitava comum – branco",
                       estacao="Padroeira principal da América Latina"),
        resumo="O próprio da Missa de 12 de dezembro, padroeira principal da América "
               "Latina, em latim e em português. Duples de 1ª classe com Oitava comum, branco.",
    ),
    dict(
        id="proprio-advento-iii",
        pdf="advento-3.pdf",
        drive="1tFvqt723b1iCpNr-pleQuxNbwWKDSVmG",
        titulo="III Domingo do Advento",
        cabecalho=dict(nome="III Domingo do Advento",
                       grau="Semiduples de 2ª classe – róseo (ou roxo)"),
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, "
               "róseo ou roxo.",
    ),
    dict(
        id="proprio-advento-iv",
        pdf="advento-4.pdf",
        drive="1nsQzcNloI5dieoT1Sm_gDfXg1DOaHGIs",
        titulo="IV Domingo do Advento",
        cabecalho=dict(nome="IV Domingo do Advento",
                       grau="Semiduples de 2ª classe – roxo"),
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, roxo.",
    ),
    dict(
        id="proprio-vigilia-do-natal",
        pdf="vigilia-natal.pdf",
        drive="1erpfMkC2Ev2xra0bceRyzr8r91_hUWPB",
        titulo="Vigília do Natal do Senhor",
        cabecalho=dict(nome="Vigília do Natal do Senhor",
                       grau="Privilegiada de 1ª classe – roxo"),
        resumo="O próprio da Missa de 24 de dezembro, em latim e em português. "
               "Privilegiada de 1ª classe, roxo.",
    ),
]

ERRATAS = [
    ("Fílium tumm", "Fílium tuum", 9),
    ("Fatres:", "Fratres:", 2),
    ("discípu lis", "discípulis", 1),
    ("(ls XL,5)", "(Is XL,5)", 1),
]

TINTAS = [
    ("[i]N.[/i]", "[tinta][i]N.[/i][/tinta]", 24),
]


def substituir(blocos, tabela):
    contagem = collections.Counter()

    def nos(bloco):
        for chave in ("texto",):
            if chave in bloco:
                for antes, depois, _ in tabela:
                    if antes in bloco[chave]:
                        contagem[antes] += bloco[chave].count(antes)
                        bloco[chave] = bloco[chave].replace(antes, depois)
        for lado in ("latim", "portugues"):
            for dentro in bloco.get(lado, []):
                nos(dentro)

    for bloco in blocos:
        nos(bloco)
    return contagem


def corrigir(blocos):
    return substituir(blocos, ERRATAS)

ABERTURA = re.compile(r"^((?:Leitura|Lectio|Léctio|Seq[uü]ência|Sequéntia)[^.:]*[.:])\s+(\S.*)$", re.S)


def partirAberturas(blocos):
    feitas = 0
    for n, bloco in enumerate(blocos):
        if bloco["tipo"] != "subtitulo" or not re.match(r"(Epístola|Evangelho)\b", bloco["texto"]):
            continue
        par = blocos[n + 1]
        if par["tipo"] != "bilingue":
            raise SystemExit("%s: depois do subtítulo não vem o bilíngue" % bloco["texto"])
        for lado in ("portugues", "latim"):
            if len(par[lado]) != 1 or par[lado][0]["tipo"] != "paragrafo":
                raise SystemExit("%s (%s): esperado um parágrafo só" % (bloco["texto"], lado))
            achado = ABERTURA.match(par[lado][0]["texto"])
            if not achado:
                raise SystemExit("%s (%s): a abertura não casa: %r"
                                 % (bloco["texto"], lado, par[lado][0]["texto"][:80]))
            par[lado] = [{"tipo": "paragrafo", "texto": achado.group(1)},
                         {"tipo": "paragrafo", "texto": achado.group(2)}]
        feitas += 1
    return feitas


def numerarSalmo(blocos):
    feitas = 0
    for n, bloco in enumerate(blocos):
        if bloco["tipo"] != "subtitulo" or not bloco["texto"].startswith("Intróito"):
            continue
        par = blocos[n + 1]
        if re.search(r"\[i\]Sl\. ?\S", par["portugues"][0]["texto"]):
            feitas += 1
            continue
        latim = re.findall(r"\[i\]Ps\. ([^\[]*?)\[/i\]", par["latim"][0]["texto"])
        if len(latim) != 1 or par["portugues"][0]["texto"].count("[i]Sl.[/i]") != 1:
            raise SystemExit("Intróito: esperada uma referência de salmo de cada lado")
        ref = latim[0].strip().rstrip(".")
        if ref.startswith("ibid."):
            salmo = re.match(r"Intróito \(Sl ([^,)]+)", bloco["texto"])
            if not salmo:
                raise SystemExit("Intróito: 'ibid.' sem salmo no título")
            ref = salmo.group(1) + "," + ref[len("ibid.,"):].strip()
        par["portugues"][0]["texto"] = par["portugues"][0]["texto"].replace(
            "[i]Sl.[/i]", "[i]Sl. %s.[/i]" % ref)
        feitas += 1
    return feitas


def comIds(blocos, ident):
    for n, bloco in enumerate(blocos, 1):
        bloco["id"] = "%s-%02d" % (ident, n)
        if bloco["tipo"] == "bilingue":
            for lado, sigla in (("latim", "la"), ("portugues", "pt")):
                for m, dentro in enumerate(bloco[lado], 1):
                    dentro["id"] = "%s-%02d-%s-%02d" % (ident, n, sigla, m)
    return blocos


def estampa(caminho, ident):
    pdf = pathlib.Path(caminho)
    todas = ESTAMPAS.listar(pdf)
    figuras = [f for f in todas if f["tipo"] != "smask"]
    paginas = int(subprocess.run(["pdfinfo", str(pdf)], capture_output=True,
                                 check=True).stdout.decode().split("Pages:")[1].split()[0])
    if len(figuras) != 2:
        raise SystemExit("%s: %d figuras, e não 2. O PDF mudou; releia antes de gravar."
                         % (pdf.name, len(figuras)))
    if figuras[0]["pagina"] != 1:
        raise SystemExit("%s: a primeira figura está na página %d, e não na 1."
                         % (pdf.name, figuras[0]["pagina"]))
    if figuras[1]["pagina"] != paginas:
        raise SystemExit("%s: a segunda figura está na página %d, e não na última (%d)."
                         % (pdf.name, figuras[1]["pagina"], paginas))

    with tempfile.TemporaryDirectory() as tmp:
        bruta = ESTAMPAS.extrair(pdf, 0, pathlib.Path(tmp))
        if len(todas) > 1 and todas[1]["tipo"] == "smask":
            figura = ESTAMPAS.Image.open(bruta).convert("RGBA")
            figura.putalpha(ESTAMPAS.Image.open(
                ESTAMPAS.extrair(pdf, 1, pathlib.Path(tmp))).convert("L"))
            papel = ESTAMPAS.Image.new("RGBA", figura.size, "white")
            bruta = pathlib.Path(tmp) / "sobre-branco.png"
            ESTAMPAS.Image.alpha_composite(papel, figura).save(bruta)
        destino = ESTAMPAS.gravar(bruta, ident)
    with ESTAMPAS.Image.open(destino) as figura:
        return {"imagem": "/folhetos/%s" % destino.name,
                "largura": figura.width, "altura": figura.height}


def conferirCabecalho(caminho, cabecalho):
    pagina = subprocess.run(["pdftotext", "-f", "1", "-l", "1", "-raw", caminho, "-"],
                            capture_output=True, check=True).stdout.decode("utf-8")
    achatado = " ".join(pagina.split())
    for campo in ("data", "nome", "grau", "estacao"):
        linha = cabecalho.get(campo)
        if linha and " ".join(linha.split()) not in achatado:
            raise SystemExit("%s: a linha %s do cabeçalho não está na 1ª página: %r"
                             % (os.path.basename(caminho), campo, linha))


def folheto(ficha, pasta, contagem):
    caminho = os.path.join(pasta, ficha["pdf"])
    extrato = extrair(caminho)
    contagem.update(corrigir(extrato["blocos"]))
    contagem.update(substituir(extrato["blocos"], TINTAS))
    contagem["aberturas"] += partirAberturas(extrato["blocos"])
    contagem["salmos"] += numerarSalmo(extrato["blocos"])
    conferirCabecalho(caminho, ficha["cabecalho"])
    return {
        "id": ficha["id"],
        "chapeu": "Próprio da Missa",
        "titulo": ficha["titulo"],
        "resumo": ficha["resumo"],
        "categoria": "proprio",
        "cabecalho": ficha["cabecalho"],
        **estampa(caminho, ficha["id"]),
        "arquivo": DRIVE % ficha["drive"],
        "blocos": comIds(extrato["blocos"], ficha["id"]),
    }


def indice():
    saida = {}
    for ficha in PROPRIOS:
        for chave in ("drive", "no_ordo"):
            if chave in ficha:
                saida[ficha[chave]] = ficha["id"]
    return saida


def main(pasta):
    with io.open(SAIDA, encoding="utf-8") as f:
        colecao = json.load(f)

    presentes = [f for f in PROPRIOS if os.path.exists(os.path.join(pasta, f["pdf"]))]
    if not presentes:
        raise SystemExit("nenhum dos PDFs da tabela está em %s" % pasta)
    completo = len(presentes) == len(PROPRIOS)
    for f in PROPRIOS:
        if f not in presentes:
            print("sem o PDF, fica como está: %s (%s)" % (f["id"], f["pdf"]))

    novos = {}
    contagem = collections.Counter()
    for ficha in presentes:
        novos[ficha["id"]] = folheto(ficha, pasta, contagem)

    if completo:
        for errado, _, quantas in ERRATAS:
            if contagem[errado] != quantas:
                raise SystemExit(
                    "errata %r: esperadas %d ocorrências, achadas %d. O PDF mudou; "
                    "releia antes de gravar." % (errado, quantas, contagem[errado]))

        for antes, _, quantas in TINTAS:
            if contagem[antes] != quantas:
                raise SystemExit(
                    "tinta %r: esperadas %d ocorrências, achadas %d. O PDF mudou; "
                    "releia antes de gravar." % (antes, quantas, contagem[antes]))
    else:
        print("remessa parcial: as contagens de errata e de tinta só se conferem com os sete")
    for chave, por_folha in (("aberturas", 2), ("salmos", 1)):
        if contagem[chave] != por_folha * len(presentes):
            raise SystemExit("%s: esperadas %d, feitas %d"
                             % (chave, por_folha * len(presentes), contagem[chave]))

    saida = []
    for f in colecao["folhetos"]:
        saida.append(novos.pop(f["id"]) if f["id"] in novos else f)
    for ficha in presentes:
        if ficha["id"] in novos:
            saida.append(novos.pop(ficha["id"]))
    colecao["folhetos"] = saida

    with io.open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(colecao, f, ensure_ascii=False, indent=1)
        f.write("\n")

    with io.open(INDICE, "w", encoding="utf-8") as f:
        json.dump(indice(), f, ensure_ascii=False, indent=1)
        f.write("\n")

    blocos = sum(len(x["blocos"]) for x in saida if x["categoria"] == "proprio")
    print("próprios: %d | blocos: %d | folhetos no arquivo: %d | erratas: %d" % (
        len(presentes), blocos, len(saida), sum(contagem[e] for e, _, _ in ERRATAS)))
    print("gravado em", os.path.normpath(SAIDA),
          "(%d KB)" % (os.path.getsize(SAIDA) // 1024))


if __name__ == "__main__":
    main(sys.argv[1])
