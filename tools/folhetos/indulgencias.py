#!/usr/bin/env python3
"""
    python3 tools/folhetos/indulgencias.py <pasta com visitas.pdf, cordao.pdf e escapulario.pdf>
"""

import collections
import html
import json
import pathlib
import re
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "src/data/folhetos.json"
DRIVE = "https://drive.google.com/file/d/%s/view"

CORRECOES = {
    "visitas-de-igrejas": [("no céu. santificado", "no céu, santificado")],
    "renovacao-do-cordao": [
        ("fazer ou renovar", "fizer ou renovar"),
        ("destas promessa,", "destas promessas,"),
        ("lucrar.a", "lucrar a"),
    ],
}
CORRECOES["renovacao-do-escapulario"] = CORRECOES["renovacao-do-cordao"] + [
    ("Pai da Ordem Carmelita;", "Pai da Ordem Carmelita em 20 de Julho;"),
]


def linhas(pdf):
    xml = subprocess.run(["pdftohtml", "-xml", "-i", "-stdout", str(pdf)],
                         capture_output=True, check=True).stdout.decode("utf-8")
    for pagina, miolo in enumerate(re.findall(r"<page .*?</page>", xml, re.S), 1):
        for m in re.finditer(r'<text top="(\d+)" left="(\d+)" width="(\d+)"[^>]*>(.*?)</text>', miolo):
            texto = html.unescape(re.sub(r"<[^>]+>", "", m.group(4)))
            if texto.strip():
                yield pagina, int(m.group(1)), int(m.group(2)), int(m.group(3)), texto


def fundir(pedacos):
    saida = []
    for p in sorted(pedacos):
        if saida and saida[-1][0] == p[0] and abs(saida[-1][1] - p[1]) <= 4:
            saida[-1][2].append(p)
        else:
            saida.append([p[0], p[1], [p]])
    for pagina, topo, grupo in saida:
        texto, fim = "", None
        for _, _, esquerda, largura, t in sorted(grupo, key=lambda x: x[2]):
            if fim is not None and esquerda - fim > 3:
                texto += " "
            texto += t
            fim = esquerda + largura
        yield pagina, topo, " ".join(texto.split())


def juntar(textos):
    saida = ""
    for t in textos:
        if saida.endswith("-") and not saida.endswith(" -"):
            fica = re.search(r"(Pai|Bem|Todo)-$", saida)
            saida = (saida if fica else saida[:-1]) + t
        else:
            saida = f"{saida} {t}".strip()
    return saida


def trecho(todas, de, ate=None):
    i = next((n for n, (_, _, t) in enumerate(todas) if t.startswith(de)), None)
    if i is None:
        raise SystemExit("não achei a linha que começa em %r" % de)
    if ate is None:
        return todas[i:]
    f = next((n for n in range(i + 1, len(todas)) if todas[n][2].startswith(ate)), None)
    if f is None:
        raise SystemExit("não achei a linha que começa em %r" % ate)
    return todas[i:f]


def numerados(textos, marca):
    itens = []
    for t in textos:
        if re.match(marca, t):
            itens.append([t])
        elif not itens:
            raise SystemExit("texto solto antes da lista: %r" % t)
        else:
            itens[-1].append(t)
    return itens


def paragrafo(ident, texto):
    return {"tipo": "paragrafo", "texto": texto, "id": ident}


def visitas(pdf):
    ident = "visitas-de-igrejas"
    tudo = list(linhas(pdf))
    corridas = list(fundir(tudo))
    obra = juntar([t for _, _, t in trecho(corridas, "Concede-se", "Concessão")])

    def coluna(pagina, de, ate, direita):
        return [t for _, _, t in fundir(
            p for p in tudo
            if p[0] == pagina and de <= p[1] < ate and (p[2] >= 440) == direita)]

    orar = {}
    for lado, direita in (("la", False), ("pt", True)):
        orar[lado] = [juntar(coluna(1, 840, 9999, direita)), juntar(coluna(2, 0, 570, direita))]
    blocos = [{
        "tipo": "bilingue", "id": f"{ident}-{nome}",
        "latim": [paragrafo(f"{ident}-{nome}-la", orar["la"][n])],
        "portugues": [paragrafo(f"{ident}-{nome}-pt", orar["pt"][n])],
    } for n, nome in enumerate(("pai-nosso", "creio"))]

    casos = []
    for direita in (False, True):
        casos += numerados(coluna(2, 570, 9999, direita), r"[1-7]\.")
    casos.sort(key=lambda c: int(c[0][0]))
    if [int(c[0][0]) for c in casos] != list(range(1, 8)):
        raise SystemExit("os sete casos não saíram inteiros")
    itens = []
    for caso in casos:
        cabeca, resto = [], []
        for t in caso:
            if re.match(r"[a-e]\)", t):
                resto.append([t])
            elif resto:
                resto[-1].append(t)
            else:
                cabeca.append(t)
        primeira = re.sub(r"^[1-7]\.\s*", "", juntar(cabeca))
        itens.append("\n".join([primeira] + [juntar(r) for r in resto]))
    blocos.append({"tipo": "subtitulo", "texto": "As igrejas e os dias", "menor": True,
                   "id": f"{ident}-casos"})
    blocos.append({"tipo": "lista", "ordenada": True, "itens": itens, "id": f"{ident}-lista"})

    folheto = {
        "id": ident,
        "chapeu": "Obra indulgenciada",
        "titulo": "Visita de igrejas",
        "resumo": "O Pai-nosso e o Creio da visita a uma igreja, e os dias em que cada igreja dá a indulgência.",
        "categoria": "indulgencia",
        "obra": obra,
        "concessao": "[elo:/indulgencias/enchiridion#concessao-33-1]Concessão N° 33, §1 do Enchiridion Indulgentiarum[/elo]",
        "condicoes": True,
        "arquivo": DRIVE % "1g-mLSWN-9E1V9MvMTidOyDNCwUID5uC2",
        "blocos": blocos,
    }
    fim = next(n for n, (_, _, t) in enumerate(corridas) if t.startswith("CONDIÇÕES"))
    usadas = corridas[:fim]
    fora = ("OBRA INDULGENCIADA", "QUANDO REQUER")
    esperado = " ".join(juntar(c) for c in (
        [coluna(1, 840, 9999, False), coluna(2, 0, 570, False),
         coluna(1, 840, 9999, True), coluna(2, 0, 570, True),
         coluna(2, 570, 9999, False), coluna(2, 570, 9999, True)]))
    topo = juntar([t for p, y, t in usadas if p == 1 and y < 840 and not t.startswith(fora)])
    return folheto, f"{topo} {esperado}", ["As igrejas e os dias"]


def renovacao(pdf, ident, titulo, resumo, drive):
    corridas = list(fundir(linhas(pdf)))
    obra = juntar([t for _, _, t in trecho(corridas, "Concede-se", "Não existe")])
    primeira = next(t for _, _, t in trecho(corridas, "Não existe")
                    if not t.startswith(("Não existe", "podendo-se", "manual")))
    instrucao = juntar([t for _, _, t in trecho(corridas, "Não existe", primeira)])
    oracao = juntar([t for _, _, t in trecho(corridas, primeira, "Quero ainda")])
    fecho = juntar([t for _, _, t in trecho(corridas, "Quero ainda", "OS DIAS")])
    lista = [t for _, _, t in trecho(corridas, "1.")]
    itens = [re.sub(r"^\d\.\s*", "", juntar(i)) for i in numerados(lista, r"\d\.")]
    if len(itens) != 8:
        raise SystemExit(f"{ident}: esperava 8 dias, achei {len(itens)}")
    dias = juntar([t for _, _, t in trecho(corridas, "OS DIAS", "1.")])
    if dias != "OS DIAS DETERMINADOS PARA LUCRAR AS INDULGÊNCIAS SÃO:":
        raise SystemExit(f"{ident}: o título dos dias mudou: {dias!r}")
    subtitulo = "Os dias determinados para lucrar as indulgências"
    folheto = {
        "id": ident,
        "chapeu": "Obra indulgenciada",
        "titulo": titulo,
        "resumo": resumo,
        "categoria": "indulgencia",
        "obra": obra,
        "condicoes": True,
        "arquivo": DRIVE % drive,
        "blocos": [
            paragrafo(f"{ident}-instrucao", instrucao),
            paragrafo(f"{ident}-oracao-1", oracao),
            paragrafo(f"{ident}-oracao-2", fecho),
            {"tipo": "subtitulo", "texto": subtitulo, "menor": True, "id": f"{ident}-dias"},
            {"tipo": "lista", "ordenada": True, "itens": itens, "id": f"{ident}-lista"},
        ],
    }
    esperado = juntar([t for _, _, t in trecho(corridas, "Concede-se")])
    esperado = re.sub(r"(^|\s)[1-8]\.(?=\s)", " ", esperado).replace(dias, subtitulo)
    return folheto, esperado, []


def palavras(texto):
    texto = re.sub(r"\[/?(?:elo:[^\]]*|elo|b|i)\]", "", texto)
    return collections.Counter(re.findall(r"\w+", texto.lower()))


def textos(folheto):
    yield folheto["obra"]
    for b in folheto["blocos"]:
        if b["tipo"] == "bilingue":
            for p in b["latim"] + b["portugues"]:
                yield p["texto"]
        elif b["tipo"] == "lista":
            yield from b["itens"]
        else:
            yield b["texto"]


def corrigir(folheto):
    caixas = [(folheto, "obra")]
    for b in folheto["blocos"]:
        if b["tipo"] == "bilingue":
            caixas += [(p, "texto") for p in b["latim"] + b["portugues"]]
        elif b["tipo"] == "lista":
            caixas += [(b["itens"], i) for i in range(len(b["itens"]))]
        else:
            caixas.append((b, "texto"))
    for errado, certo in CORRECOES[folheto["id"]]:
        achadas = [(c, k) for c, k in caixas if errado in c[k]]
        if len(achadas) != 1:
            raise SystemExit("%s: a correção %r casou %d vezes" % (folheto["id"], errado, len(achadas)))
        caixa, chave = achadas[0]
        caixa[chave] = caixa[chave].replace(errado, certo)


def main(pasta):
    pasta = pathlib.Path(pasta)
    feitos = [
        visitas(pasta / "visitas.pdf"),
        renovacao(pasta / "cordao.pdf", "renovacao-do-cordao",
                  "Renovação na Arquiconfraria do Cordão de São Francisco",
                  "A promessa de guardar os Estatutos, com uma fórmula sugerida, e os dias em que o associado lucra a indulgência.",
                  "1nxU0HJ5nX4gAe9G1fuw62mlUDls1vlGu"),
        renovacao(pasta / "escapulario.pdf", "renovacao-do-escapulario",
                  "Renovação na Confraria do Escapulário do Carmo",
                  "A promessa de guardar os Estatutos, com uma fórmula sugerida, e os dias em que o associado lucra a indulgência.",
                  "1wR63a9wWFJ7VFe7VkFQ-rS7FHMbmuFN8"),
    ]
    with open(SAIDA, encoding="utf-8") as f:
        colecao = json.load(f)
    figuras = {p.name.rsplit("-", 1)[0]: p.name for p in (RAIZ / "public/folhetos").glob("*.webp")}
    medidas = {"visitas-de-igrejas": (800, 450), "renovacao-do-cordao": (720, 1280),
               "renovacao-do-escapulario": (480, 524)}

    for folheto, esperado, a_mais in feitos:
        visto = palavras(" ".join(textos(folheto)))
        quer = palavras(esperado) + palavras(" ".join(a_mais))
        if folheto["id"] == "visitas-de-igrejas":
            quer -= palavras("Concessão N° 33, §1 do Enchiridion Indulgentiarum")
            quer -= palavras(" ".join(f"{n}." for n in range(1, 8)))
        faltando, sobrando = quer - visto, visto - quer
        if faltando or sobrando:
            raise SystemExit("%s: a conta não bate. faltando %s | sobrando %s"
                             % (folheto["id"], dict(faltando), dict(sobrando)))
        corrigir(folheto)
        largura, altura = medidas[folheto["id"]]
        completo = {}
        for chave, valor in folheto.items():
            completo[chave] = valor
            if chave == "categoria":
                completo.update(imagem="/folhetos/" + figuras[folheto["id"]],
                                largura=largura, altura=altura)
        achado = [i for i, x in enumerate(colecao["folhetos"]) if x["id"] == folheto["id"]]
        if achado:
            colecao["folhetos"][achado[0]] = completo
        else:
            ultimo = max(i for i, x in enumerate(colecao["folhetos"])
                         if x["categoria"] == "indulgencia")
            colecao["folhetos"].insert(ultimo + 1, completo)

    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(colecao, f, ensure_ascii=False, indent=1)
        f.write("\n")
    for folheto, _, _ in feitos:
        print(folheto["id"])
        for t in textos(folheto):
            print("   ", t)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
