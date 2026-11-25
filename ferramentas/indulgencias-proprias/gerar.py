#!/usr/bin/env python3
"""
Gera `src/data/indulgencias-ordens.json` do PDF do Perez, "Calendário de
Indulgências Próprias das Associações de fiéis".

    python3 ferramentas/indulgencias-proprias/gerar.py <tabela.pdf>

O PDF é lido pelas posições (`pdftohtml -xml`): a prosa se corta pelo recuo da
primeira linha, e os quadros, de duas colunas (data e festa) ou de três (os
três tipos de associação), pela posição horizontal de cada trecho. No fim as
palavras do PDF e as do site são contadas uma a uma; se faltar ou sobrar
alguma, nada é gravado. **Não edite o JSON à mão.**
"""

import collections
import html
import io
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

RAIZ = pathlib.Path(__file__).resolve().parents[2]
SAIDA = RAIZ / "src/data/indulgencias-ordens.json"

MARGEM = 106          # a margem esquerda do texto
MEIO = 480            # entre a coluna da data e a da festa
TITULOS = {"Introdução:": "Introdução", "Observações:": "Observações", "Conclusão:": "Conclusão"}
ASSOCIACAO = re.compile(r"^(\d)\. (\S.*)$")
FIM_DE_QUADRO = ("Nota:", "Além disso", "Para concluir", "De forma", "É possível")

# o Perez deixou no texto o recado de ligar os dois calendários: vira elo
TROCAS = [
    ("no Calendário de indulgências e no Enchiridion Indulgentiarum (linkar ambos)",
     "no [elo:/indulgencias/calendario]Calendário de indulgências[/elo] e no "
     "[elo:/indulgencias/enchiridion]Enchiridion Indulgentiarum[/elo]"),
]


def linhas(pdf):
    xml = subprocess.run(["pdftohtml", "-xml", "-i", "-stdout", pdf],
                         capture_output=True, check=True).stdout.decode("utf-8")
    for n, pagina in enumerate(re.findall(r"<page .*?</page>", xml, re.S)):
        pedacos = []
        for m in re.finditer(r'<text top="(\d+)" left="(\d+)" width="(\d+)"[^>]*>(.*?)</text>', pagina):
            texto = html.unescape(re.sub(r"<[^>]+>", "", m.group(4)))
            if texto.strip():
                pedacos.append((int(m.group(1)), int(m.group(2)), int(m.group(3)), texto))
        pedacos.sort()
        grupo = []
        for p in pedacos + [(10 ** 6, 0, 0, "")]:
            if grupo and p[0] - grupo[0][0] > 5:
                grupo.sort(key=lambda x: x[1])
                texto = ""
                fim = None
                for _, esq, larg, t in grupo:
                    if fim is not None and esq - fim > 3 and not texto.endswith(" "):
                        texto += " "
                    texto += t
                    fim = esq + larg
                texto = " ".join(texto.split())
                if not re.fullmatch(r"\d{1,2}", texto):
                    yield n * 10000 + grupo[0][0], grupo[0][1], texto, grupo
                grupo = []
            grupo.append(p)


def junta(a, b):
    if not a:
        return b
    return a + b if a.endswith("-") and not a.endswith(" -") else a + " " + b


def apelido(texto):
    cru = unicodedata.normalize("NFD", texto)
    cru = "".join(c for c in cru if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", cru.lower()).strip("-")


def montar(pdf):
    secoes = []
    quadro = None          # (colunas, [(altura, coluna, texto)])
    aberto = None          # parágrafo ou item que ainda recebe linhas
    antes = 0

    def secao(titulo):
        secoes.append({"id": apelido(titulo), "titulo": titulo, "blocos": []})

    def por(bloco):
        if not secoes:
            raise SystemExit("texto antes do primeiro título: %r" % bloco)
        secoes[-1]["blocos"].append(bloco)

    def fechar_quadro():
        nonlocal quadro
        if quadro is None:
            return
        colunas, celulas = quadro
        tabela, anterior = [], None
        for altura, partes in celulas:
            if len(colunas) == 2:
                nova = anterior is None or altura - anterior > 31
            else:
                nova = anterior is None or any(t[:1].isupper() for t in partes if t)
            if nova:
                tabela.append([""] * len(colunas))
            for i, t in enumerate(partes):
                if t:
                    tabela[-1][i] = junta(tabela[-1][i], t)
            anterior = altura
        por({"tipo": "tabela", "colunas": colunas, "linhas": tabela})
        quadro = None

    for altura, esq, texto, pedacos in linhas(pdf):
        numerada = ASSOCIACAO.match(texto)
        if texto in TITULOS or (numerada and esq <= MARGEM + 5):
            fechar_quadro()
            secao(TITULOS.get(texto) or numerada.group(2))
            aberto = None
        elif texto.startswith("Data ") and "Festividade" in texto:
            quadro, aberto = (["Data", "Festividade litúrgica"], []), None
        elif texto.startswith("Pias uniões Confrarias"):
            quadro, aberto = (["Pias uniões", "Confrarias", "Ordens terceiras"], []), None
        elif quadro is not None and not (esq <= MARGEM + 40 and texto.startswith(FIM_DE_QUADRO)):
            n = len(quadro[0])
            partes = [""] * n
            for _, e, larg, t in sorted(pedacos, key=lambda x: x[1]):
                centro = e + larg / 2
                i = (0 if centro < MEIO else 1) if n == 2 else min(2, int((centro - MARGEM) / 351))
                partes[i] = junta(partes[i], " ".join(t.split()))
            quadro[1].append((altura, partes))
        elif secoes:
            fechar_quadro()
            if texto.startswith("•"):
                item = texto.lstrip("• ").strip()
                blocos = secoes[-1]["blocos"]
                if not blocos or blocos[-1]["tipo"] != "lista":
                    por({"tipo": "lista", "itens": []})
                secoes[-1]["blocos"][-1]["itens"].append(item)
                aberto = ("item", esq)
            elif aberto and aberto[0] == "item" and esq > MARGEM + 30:
                itens = secoes[-1]["blocos"][-1]["itens"]
                itens[-1] = junta(itens[-1], texto)
            elif (aberto and aberto[0] == "p" and altura - antes <= 31
                  and (esq <= MARGEM + 5 or abs(esq - aberto[1]) <= 3 and aberto[1] > MARGEM + 30)):
                secoes[-1]["blocos"][-1]["texto"] = junta(secoes[-1]["blocos"][-1]["texto"], texto)
            elif (aberto and aberto[0] == "p" and esq <= MARGEM + 5
                  and altura // 10000 != antes // 10000):
                secoes[-1]["blocos"][-1]["texto"] = junta(secoes[-1]["blocos"][-1]["texto"], texto)
            else:
                por({"tipo": "paragrafo", "texto": texto})
                aberto = ("p", esq)
        antes = altura
    fechar_quadro()
    return secoes


def palavras(texto):
    texto = re.sub(r"\[/?(?:elo:[^\]]*|elo|b|i)\]", "", texto)
    return collections.Counter(re.findall(r"\w+", texto.lower()))


def main(pdf):
    secoes = montar(pdf)

    visto = collections.Counter()
    for s in secoes:
        visto += palavras(s["titulo"])
        for b in s["blocos"]:
            if b["tipo"] == "paragrafo":
                visto += palavras(b["texto"])
            elif b["tipo"] == "lista":
                visto += palavras(" ".join(b["itens"]))
            else:
                visto += palavras(" ".join(b["colunas"] + [c for l in b["linhas"] for c in l]))
    cru = " ".join(t for _, _, t, _ in linhas(pdf))
    cru = re.sub(r"(\w)- (\w)", r"\1-\2", cru)
    esperado = palavras(cru)
    # o que é do alto da folha (título) e os números das associações não viram texto
    topo = cru[:cru.index("Introdução:")]
    esperado -= palavras(topo)
    esperado -= collections.Counter(str(n) for n in range(1, len(secoes) - 2))
    faltando, sobrando = esperado - visto, visto - esperado
    for p in ("data", "festividade", "litúrgica"):
        faltando.pop(p, None); sobrando.pop(p, None)
    if faltando or sobrando:
        raise SystemExit("conta não bate. faltando %s | sobrando %s" % (dict(faltando), dict(sobrando)))

    for antes, depois in TROCAS:
        achados = [b for s in secoes for b in s["blocos"]
                   if b["tipo"] == "paragrafo" and antes in b["texto"]]
        if len(achados) != 1:
            raise SystemExit("troca não encontrada: %r" % antes)
        achados[0]["texto"] = achados[0]["texto"].replace(antes, depois)

    for s in secoes:
        for n, b in enumerate(s["blocos"], 1):
            b["id"] = "%s-%03d" % (s["id"], n)
    doc = {
        "titulo": "Indulgências próprias",
        "descricao": "As concedidas a ordens, confrarias e associações de fiéis.",
        "secoes": secoes,
    }
    with io.open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
        f.write("\n")
    for s in secoes:
        print(s["titulo"], [b["tipo"][0] + (str(len(b["linhas"])) if "linhas" in b else "") for b in s["blocos"]])


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
