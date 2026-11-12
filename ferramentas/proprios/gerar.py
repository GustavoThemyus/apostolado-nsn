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
import collections, importlib.util, io, json, os, pathlib, re, subprocess, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extrair import extrair


def _ferramentaDeEstampas():
    """
    `ferramentas/folhetos/gerar.py`, carregado pelo caminho.

    Pelo caminho, e não por `import gerar`: o módulo de lá tem o mesmo nome
    deste, e um `import` simples devolveria este mesmo arquivo. Quem grava a
    estampa é ele, para que a folha de próprio e a de indulgência saiam com
    a mesma régua — o teto de 1000px, o webp, e o nome com a impressão do
    conteúdo, de que depende o cache de um ano.
    """
    caminho = os.path.join(os.path.dirname(os.path.dirname(
        os.path.abspath(__file__))), "folhetos", "gerar.py")
    spec = importlib.util.spec_from_file_location("ferramentaDeEstampas", caminho)
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


ESTAMPAS = _ferramentaDeEstampas()

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
#
# `cabecalho` são as linhas que o impresso põe entre a estampa e o Intróito,
# transcritas dele e conferidas contra ele por `conferirCabecalho`. Nem toda
# folha tem data, e o nome impresso nem sempre é o `titulo`: o de Guadalupe
# traz o padroado inteiro, e o título é curto porque vai para a aba do
# navegador e para o WhatsApp.
PROPRIOS = [
    dict(
        id="proprio-advento-i",
        pdf="advento-1.pdf",
        drive="106fV_2yxCCsJnGiM7Wz4KdjqOpNsAuAZ",
        titulo="I Domingo do Advento",
        cabecalho=dict(nome="I Domingo do Advento",
                       grau="Semiduples de 1ª classe – roxo",
                       estacao="Estação em Santa Maria Maior"),
        resumo="O próprio da Missa, em latim e em português. Semiduples de 1ª classe, roxo.",
    ),
    dict(
        id="proprio-advento-ii",
        pdf="advento-2.pdf",
        drive="1H9wbaf4Q6raUAfxsZkzs3Nx3_6DIXYPy",
        titulo="II Domingo do Advento",
        cabecalho=dict(nome="II Domingo do Advento",
                       grau="Semiduples de 2ª classe – roxo",
                       estacao="Estação em Santa Cruz de Jerusalém"),
        resumo="O próprio da Missa, em latim e em português. Semiduples de 2ª classe, roxo.",
    ),
    dict(
        id="proprio-imaculada-conceicao",
        pdf="imaculada.pdf",
        drive="1X0dSaMVDRHR1a2MzaNmzhMPtTtK0JmnU",
        titulo="Imaculada Conceição da Bem-aventurada Virgem Maria",
        cabecalho=dict(data="8 de dezembro",
                       nome="Imaculada Conceição da Bem-aventurada Virgem Maria",
                       grau="Duples de 1ª classe com Oitava comum – branco"),
        resumo="O próprio da Missa de 8 de dezembro, em latim e em português. "
               "Duples de 1ª classe com Oitava comum, branco.",
    ),
    dict(
        id="proprio-guadalupe",
        pdf="guadalupe.pdf",
        drive="1ibAEJPRUEvURuBcWYL1KZBEyr-dW0g_V",
        titulo="Nossa Senhora de Guadalupe",
        cabecalho=dict(data="12 de dezembro",
                       nome="Nossa Senhora de Guadalupe, Padroeira Principal da América Latina",
                       grau="Duples de 1ª classe com Oitava comum – branco"),
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


# A segunda tinta em trechos soltos, com a mesma regra das erratas: o texto
# exato, e quantas vezes ele tem de aparecer. O N. é o do Papa, nas orações
# do Advento (3 orações x 2 línguas x 4 domingos); o missal o põe em vermelho.
TINTAS = [
    ("[i]N.[/i]", "[tinta][i]N.[/i][/tinta]", 24),
]


def substituir(blocos, tabela):
    """Aplica uma tabela de substituições e devolve quantas vezes cada uma pegou."""
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
    """Aplica as erratas e devolve quantas vezes cada uma pegou."""
    return substituir(blocos, ERRATAS)


# A fórmula que abre a Epístola e o Evangelho, nas duas línguas: "Lectio
# Epístolæ beati Pauli… Romános." / "Leitura da Epístola… Romanos:". Vai até o
# primeiro ponto ou dois-pontos, e nenhuma das catorze tem ponto antes disso.
ABERTURA = re.compile(r"^((?:Leitura|Lectio|Léctio|Seq[uü]ência|Sequéntia)[^.:]*[.:])\s+(\S.*)$", re.S)


def partirAberturas(blocos):
    """
    Separa a fórmula de abertura do texto, na Epístola e no Evangelho.

    No impresso as duas andam no mesmo parágrafo. A folha precisa delas
    separadas: a fórmula só se identifica ("Lectio Epístolæ…"), e a capitular
    é do texto que vem depois ("Fratres", "In illo témpore"). Quem recebe a
    capitular, e quem recebe só a inicial vermelha, é CSS; aqui só se parte.

    Se alguma não casar, o gerador para: uma fórmula nova pede que alguém a
    leia, e não que a capitular caia na palavra errada.
    """
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
    """
    Põe o número do salmo no "Sl." do Intróito português.

    O PDF traz a referência inteira só no latim ("Ps. LXXIX,2"); a tradução
    diz apenas "Sl.". É o mesmo versículo, e o número vem do lado latino:
    nada é inventado, só passado de um lado para o outro. Quando o latim diz
    "ibid.", o salmo é o do próprio título do Intróito ("Sl XXIV,1-3").
    """
    feitas = 0
    for n, bloco in enumerate(blocos):
        if bloco["tipo"] != "subtitulo" or not bloco["texto"].startswith("Intróito"):
            continue
        par = blocos[n + 1]
        # nos PDFs revistos a tradução já traz a referência ("Sl. Ibid.,4."), e
        # o que o Perez escreveu vale: não se mexe
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
    """Cada bloco com id estável, na ordem: é por ele que o painel compara."""
    for n, bloco in enumerate(blocos, 1):
        bloco["id"] = "%s-%02d" % (ident, n)
        if bloco["tipo"] == "bilingue":
            for lado, sigla in (("latim", "la"), ("portugues", "pt")):
                for m, dentro in enumerate(bloco[lado], 1):
                    dentro["id"] = "%s-%02d-%s-%02d" % (ident, n, sigla, m)
    return blocos


def estampa(caminho, ident):
    """
    A figura da primeira página, gravada em `public/folhetos`.

    Cada um dos sete PDFs traz duas figuras e só duas: a estampa, na primeira
    página, e o selo do Apostolado, na última. O selo fica de fora — o brasão
    já está em toda página do site, e repeti-lo dentro da folha seria enfeite.

    A forma é conferida, e não adivinhada. Se uma remessa nova trouxer outro
    número de figuras, ou a estampa fora da primeira página, isto **para**:
    gravar a figura errada na folha é pior que não gravar nenhuma, e é o tipo
    de coisa que ninguém repara até o Perez abrir a página.
    """
    pdf = pathlib.Path(caminho)
    figuras = ESTAMPAS.listar(pdf)
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
        destino = ESTAMPAS.gravar(bruta, ident)
    with ESTAMPAS.Image.open(destino) as figura:
        return {"imagem": "/folhetos/%s" % destino.name,
                "largura": figura.width, "altura": figura.height}


def conferirCabecalho(caminho, cabecalho):
    """
    Confere, contra a primeira página, as linhas transcritas do impresso.

    Data, nome e grau não viram bloco: o extrator começa no Intróito, e estas
    três linhas ficariam de fora se não estivessem na tabela. Transcritas à
    mão, podem envelhecer caladas — uma remessa nova que mude o grau, ou que
    acerte "róseo (ou roxo)", passaria batida. Por isso cada linha é
    procurada no texto da página, com o espaço em branco achatado, porque o
    `pdftotext` quebra o nome de Guadalupe em duas linhas.
    """
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


def main(pasta):
    with io.open(SAIDA, encoding="utf-8") as f:
        colecao = json.load(f)

    # Os PDFs chegam aos poucos: o Perez corrige cada um à mão. Gera os que
    # estão na pasta, e os outros ficam como estão no arquivo.
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

    # As contagens esperadas são do conjunto dos sete. Com a remessa pela metade
    # elas não valem, e conferir seria acusar a falta dos que ainda não vieram.
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
    # duas peças por folha (Epístola e Evangelho) e um Intróito por folha
    for chave, por_folha in (("aberturas", 2), ("salmos", 1)):
        if contagem[chave] != por_folha * len(presentes):
            raise SystemExit("%s: esperadas %d, feitas %d"
                             % (chave, por_folha * len(presentes), contagem[chave]))

    # substitui o que já existe, no lugar em que está; o resto entra no fim,
    # na ordem da tabela
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
        json.dump({x["drive"]: x["id"] for x in PROPRIOS}, f, ensure_ascii=False, indent=1)
        f.write("\n")

    blocos = sum(len(x["blocos"]) for x in saida if x["categoria"] == "proprio")
    print("próprios: %d | blocos: %d | folhetos no arquivo: %d | erratas: %d" % (
        len(presentes), blocos, len(saida), sum(contagem[e] for e, _, _ in ERRATAS)))
    print("gravado em", os.path.normpath(SAIDA),
          "(%d KB)" % (os.path.getsize(SAIDA) // 1024))


if __name__ == "__main__":
    main(sys.argv[1])
