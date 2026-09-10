# -*- coding: utf-8 -*-
"""
Converte o .docx do Enchiridion no JSON de conteúdo do site.

Três coisas que não são transcrição literal, e por quê:
  - Os parágrafos 4 a 7 do original são recados do Perez para mim ("Inserir
    link no texto", "Essa parte quero em destaque"). Viram o que ele pediu, e
    não texto publicado.
  - As notas saem do fim do capítulo e viram um mapa, para a chamada poder
    mostrá-las onde são lidas.
  - O asterisco vermelho vira a chamada de uma nota chamada "*", e o texto que
    estava no fim do documento vira o conteúdo dela. O Perez pediu justamente
    que ele não ficasse mais solto no fim.
"""
import json, io, re, unicodedata

ps = json.load(io.open("paragrafos.json", encoding="utf-8"))
SUP = {"⁰":"0","¹":"1","²":"2","³":"3","⁴":"4","⁵":"5","⁶":"6","⁷":"7","⁸":"8","⁹":"9"}
RE_SUP = re.compile("[" + "".join(SUP) + "]+")

def limpar(t):
    t = t.replace("\xa0", " ").replace("​", "")
    return re.sub(r"[ \t]+", " ", t)

def marcar(pedacos, notas_como_texto=False):
    """
    Junta as runs numa string com a marcação do site.

    Os sobrescritos saem das runs antes de qualquer formatação, e não depois:
    o Word parte "³⁸" em duas runs quando só o "³" está em negrito, e marcar
    primeiro produzia [nota]3[/nota][nota]8[/nota] — duas chamadas existentes,
    porém erradas, que nenhuma checagem de link quebrado pegaria.
    """
    itens = []
    for texto, negrito, italico, cor in pedacos:
        t = limpar(texto)
        if not t:
            continue
        if cor == "C00000" and t.strip() == "*":
            itens.append(("nota", "*"))
            continue
        if notas_como_texto:
            itens.append(("texto", t, negrito, italico))
            continue
        resto = t
        while True:
            m = RE_SUP.search(resto)
            if not m:
                if resto:
                    itens.append(("texto", resto, negrito, italico))
                break
            if m.start():
                itens.append(("texto", resto[:m.start()], negrito, italico))
            itens.append(("nota", "".join(SUP[c] for c in m.group())))
            resto = resto[m.end():]

    # sobrescritos vizinhos são um número só, partido pelo Word
    juntos = []
    for item in itens:
        if item[0] == "nota" and juntos and juntos[-1][0] == "nota" and item[1] != "*":
            juntos[-1] = ("nota", juntos[-1][1] + item[1])
        else:
            juntos.append(item)

    saida = []
    for item in juntos:
        if item[0] == "nota":
            saida.append(f"[nota]{item[1]}[/nota]")
            continue
        _, t, negrito, italico = item
        # o espaço fica fora da marcação: "[b] 1.[/b]" vira " [b]1.[/b]"
        antes = t[: len(t) - len(t.lstrip())]
        depois = t[len(t.rstrip()) :]
        miolo = t.strip()
        if miolo:
            if italico:
                miolo = f"[i]{miolo}[/i]"
            if negrito:
                miolo = f"[b]{miolo}[/b]"
        saida.append(antes + miolo + depois)

    s = "".join(saida)
    s = re.sub(r"\[(i|b)\]\s*\[/\1\]", "", s)
    s = re.sub(r"\[/(i|b)\]\s*\[\1\]", " ", s)
    if not notas_como_texto:
        s = re.sub(r"[  ]+(\[nota\])", r"\1", s)
    return s.strip()

def so_texto(p):
    return limpar(p["cru"]).strip()

# ------------------------------------------------------------------ notas
NOTAS = {}
def colher_notas(a, b):
    """Tira as definições de nota da faixa e devolve os índices consumidos."""
    consumidos = set()
    for i in range(a, b + 1):
        p = ps[i]
        if p["tipo"] != "p":
            continue
        c = so_texto(p)
        if re.match(r"^Notas?\s+d[aoe]s?\b.*:$", c):
            consumidos.add(i)
            continue
        m = RE_SUP.match(c)
        if not m:
            continue
        chave = "".join(SUP[ch] for ch in m.group())
        # o corpo da nota mantém a formatação, menos o número da frente
        corpo = marcar(p["pedacos"], notas_como_texto=True)
        corpo = RE_SUP.sub("", corpo, count=1).strip()
        corpo = re.sub(r"^\[i\]\s*\[/i\]", "", corpo).strip()
        NOTAS[chave] = corpo
        consumidos.add(i)
    return consumidos

# a nota do asterisco: o texto que o Perez pôs no fim do documento
# o asterisco vermelho abre o próprio parágrafo da nota; deixá-lo faria a
# nota chamar a si mesma, e o navegador entra em recursão até cair
asterisco = marcar(ps[1066]["pedacos"], notas_como_texto=True)
asterisco = re.sub(r"^\s*(?:\[nota\]\*\[/nota\]|\*)\s*", "", asterisco).strip()
rodapes = " ".join(so_texto(ps[i]) for i in (1067, 1068))
NOTAS["*"] = asterisco + "\n\n[i]" + rodapes + "[/i]"

# ------------------------------------------------------- âncoras e títulos
CONCESSOES = {}   # numero -> (ancora, titulo)
ORACOES = {}      # nome normalizado -> ancora

def chave(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", t).strip()

def talho(t, limite=60):
    s = chave(t).replace(" ", "-")
    return s[:limite].rstrip("-")

# ----------------------------------------------------------- corpo comum
def e_titulo_menor(p):
    """Cabeçalho de oração ou de parte, dentro de uma seção."""
    if p["tipo"] != "p" or not p["negrito"]:
        return False
    c = so_texto(p)
    if len(c) > 95 or p["alinhamento"] == "right":
        return False
    if re.match(r"^Prot\.|^L\. \+ S\.|^In PA tab", c):
        return False
    return True

def blocos_da_faixa(a, b, pular=(), titulos_menores=None, ancoras=None):
    """
    Converte uma faixa de parágrafos em blocos.

    `ancoras` mapeia índice -> (ancora, titulo, menor) para os subtítulos que
    o sumário e o índice analítico precisam alcançar.
    """
    ancoras = ancoras or {}
    saida = []
    fila = []          # itens de lista a fechar
    fila_formato = None

    def fechar():
        nonlocal fila, fila_formato
        if fila:
            saida.append({"tipo": "lista", "ordenada": fila_formato == "decimal",
                          "itens": fila})
            fila, fila_formato = [], None

    i = a
    while i <= b:
        if i in pular:
            i += 1
            continue
        p = ps[i]
        if p["tipo"] == "tabela":
            fechar()
            saida.append({"tipo": "tabela", "colunas": p["linhas"][0],
                          "linhas": [[limpar(c).strip() for c in l] for l in p["linhas"][1:]]})
            i += 1
            continue

        c = so_texto(p)
        if re.fullmatch(r"[_\s]+", c):
            fechar()
            saida.append({"tipo": "separador"})
            i += 1
            continue

        if i in ancoras:
            fechar()
            ancora, titulo, menor = ancoras[i]
            bloco = {"tipo": "subtitulo", "texto": titulo, "ancora": ancora}
            if menor:
                bloco["menor"] = True
            saida.append(bloco)
            i += 1
            continue

        texto = marcar(p["pedacos"])
        if not texto:
            i += 1
            continue

        if p.get("formato") in ("bullet", "decimal"):
            if fila and fila_formato != p["formato"]:
                fechar()
            fila_formato = p["formato"]
            fila.append(texto)
            i += 1
            continue

        fechar()
        if titulos_menores and i in titulos_menores:
            saida.append({"tipo": "subtitulo", "texto": c, "menor": True})
        else:
            saida.append({"tipo": "paragrafo", "texto": texto})
        i += 1

    fechar()
    return saida

# ------------------------------- as 33 concessões: número e título em pares
anc_outras = {}
i = 300
while i <= 684:
    p, q = ps[i], ps[i + 1] if i + 1 <= 684 else None
    if (p["tipo"] == "p" and p["negrito"] and p["alinhamento"] == "center"
            and re.fullmatch(r"\d{1,2}", so_texto(p)) and q is not None
            and q["tipo"] == "p" and q["negrito"]):
        n = int(so_texto(p))
        titulo = RE_SUP.sub("", so_texto(q)).strip()
        ancora = f"concessao-{n}"
        # a chamada de nota mora no título, como no impresso, e vai junto para
        # dentro do subtítulo: deixá-la de fora perderia a nota
        marca = RE_SUP.search(so_texto(q))
        chamada = ("[nota]" + "".join(SUP[c] for c in marca.group()) + "[/nota]") if marca else ""
        # o número entra no título: é assim que o índice analítico o chama
        anc_outras[i] = (ancora, f"{n}. {titulo}{chamada}", False)
        anc_outras[i + 1] = None            # o título já foi consumido
        CONCESSOES[n] = (ancora, titulo)
        i += 2
        continue
    i += 1
pular_outras = {k for k, v in anc_outras.items() if v is None}
anc_outras = {k: v for k, v in anc_outras.items() if v}

# cabeçalhos de oração dentro das concessões: viram âncora, fora do sumário
for i in range(300, 685):
    if i in anc_outras or i in pular_outras:
        continue
    p = ps[i]
    if e_titulo_menor(p) and p["alinhamento"] != "center":
        nome = so_texto(p)
        a = f"oracao-{talho(nome)}"
        anc_outras[i] = (a, nome, True)
        ORACOES[chave(nome)] = a

anc_outras[283] = ("oc-introducao", "Introdução", False)
anc_outras[300] = None
anc_outras = {k: v for k, v in anc_outras.items() if v}

# ------------------------------------------ as quatro concessões de caráter geral
ROMANOS = {204: ("concessao-geral-i", "Primeira concessão"),
           222: ("concessao-geral-ii", "Segunda concessão"),
           242: ("concessao-geral-iii", "Terceira concessão"),
           260: ("concessao-geral-iv", "Quarta concessão")}
anc_quatro = {192: ("qc-introducao", "Introdução", False)}
for i, (a, t) in ROMANOS.items():
    anc_quatro[i] = (a, t, False)

# ------------------------------------------------------ a constituição apostólica
anc_const = {820: ("id-i", "I. A doutrina", False),
             828: ("id-ii", "II. A comunhão dos santos", False),
             836: ("id-iii", "III. A prática da Igreja", False),
             841: ("id-iv", "IV. O uso das indulgências", False),
             861: ("id-v", "V. As mudanças da disciplina", False),
             869: ("id-normas", "Normas", False)}

anc_apendice = {723: ("piedosas-invocacoes", "Piedosas invocações", False),
                729: ("invocacoes-em-uso", "Invocações em uso", False)}
anc_indice = {953: ("indice-oracoes", "A. Orações", False),
              1017: ("indice-plenarias", "B. Indulgências plenárias", False),
              1018: ("indice-plenarias-diarias", "1. Lucradas todos os dias", True),
              1025: ("indice-plenarias-dias", "2. Em determinados dias", True),
              1044: ("indice-plenarias-casos", "3. Em circunstâncias particulares", True)}

# ------------------------------------------------------- índice analítico
def entrada_do_indice(c):
    """'Rosário de Maria (con. 17, §1)' -> link para a concessão exata."""
    m = re.match(r"^(.*?)\s*\((con\.|conc\.|com\.)\s*(\d+)(.*)\)\s*$", c)
    if not m:
        if "Domingo da Misericórdia" in c:
            return f"[elo:urbis-et-orbis]{c}[/elo]"
        if c.startswith("Decreto:"):
            return f"[elo:ecclesia-cathedralis]{c}[/elo]"
        return c
    nome, _, numero, resto = m.groups()
    n = int(numero)
    # a oração tem âncora própria? então o link cai nela, não na concessão
    destino = ORACOES.get(chave(nome)) or CONCESSOES.get(n, (None,))[0]
    if not destino:
        return c
    return f"[elo:{destino}]{nome}[/elo] [i](concessão {numero}{resto})[/i]"

# ---------------------------------------------------------------- seções
FAIXAS = [
    ("apresentacao", "Apresentação", 0, 12, {}, {4, 5, 6, 7, 8, 11}),
    ("indice-geral", "Índice geral", 13, 67, {}, set(range(13, 68))),
    ("aprovacao", "Aprovação da Penitenciaria Apostólica", 68, 79, {}, {68}),
    ("decreto-iesu", "Decreto Iesu humani generis", 80, 97, {}, {80}),
    ("abreviaturas", "Abreviaturas e siglas", 98, 99, {}, {98}),
    ("introducao-geral", "Introdução geral", 100, 120, {}, {100}),
    ("normas", "Normas sobre as indulgências", 121, 190, {}, {121}),
    ("quatro-concessoes", "Quatro concessões de caráter geral", 191, 281,
     anc_quatro, {191, 203}),
    ("outras-concessoes", "Outras concessões", 282, 721, anc_outras, {282, 300} | pular_outras),
    ("apendice", "Apêndice", 722, 771, anc_apendice, {722}),
    ("urbis-et-orbis", "Decreto Deus cuius misericordiae", 772, 797, {}, {772, 773}),
    ("ecclesia-cathedralis", "Decreto Ecclesia Cathedralis", 798, 814, {}, {798, 799}),
    ("indulgentiarum-doctrina", "Constituição apostólica Indulgentiarum doctrina",
     815, 951, anc_const, {815, 816}),
    ("indice-analitico", "Índice analítico", 952, 1065, anc_indice, {952}),
]

secoes = []
for ident, titulo, a, b, ancoras, pular in FAIXAS:
    consumidos = colher_notas(a, b) | set(pular)
    if ident == "indice-geral":
        blocos = [{"tipo": "indice"}]
    elif ident == "indice-analitico":
        blocos = []
        fila = []
        for i in range(a, b + 1):
            if i in consumidos:
                continue
            if i in ancoras:
                if fila:
                    blocos.append({"tipo": "lista", "itens": fila}); fila = []
                anc, t, menor = ancoras[i]
                blocos.append({"tipo": "subtitulo", "texto": t, "ancora": anc,
                               **({"menor": True} if menor else {})})
                continue
            c = so_texto(ps[i])
            if c:
                fila.append(entrada_do_indice(c))
        if fila:
            blocos.append({"tipo": "lista", "itens": fila})
    else:
        blocos = blocos_da_faixa(a, b, pular=consumidos, ancoras=ancoras)
    secao = {"id": ident, "titulo": titulo, "blocos": blocos}
    # A apresentação é do apostolado, não do Enchiridion: fica no corpo, fora
    # do índice e sem número, para não passar por parte do material original.
    # O índice geral fica fora pelo mesmo motivo do impresso, onde o SUMÁRIO
    # também não se lista: um índice que aponta para si mesmo não leva a lugar
    # nenhum. Assim a numeração passa a ser a das onze partes do livro.
    if ident in ("apresentacao", "indice-geral"):
        secao["foraDoIndice"] = True
    secoes.append(secao)

# a apresentação: os recados do Perez viram o que ele pediu
apres = secoes[0]["blocos"]
SANTA_SE = ("https://www.vatican.va/roman_curia/tribunals/apost_penit/documents/"
            "rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html")
DRIVE = "https://drive.google.com/file/d/1D8VRquKNmY4UwpXo05EKYTi0mtZZB26_/view?usp=sharing"
for bloco in apres:
    if bloco["tipo"] == "paragrafo" and "Serviram de fontes" in bloco["texto"]:
        bloco["texto"] = (bloco["texto"]
            .replace("[i]Enchiridion Indulgentiarum quatro editur[/i]",
                     f"[elo:{SANTA_SE}][i]Enchiridion Indulgentiarum quatro editur[/i][/elo]")
            .replace('"[i]Indulgências orientações litúrgico-pastorais[/i]"',
                     f'[elo:{DRIVE}]"[i]Indulgências orientações litúrgico-pastorais[/i]"[/elo]'))
# a caixa destacada, no lugar dos dois fios e do recado. Os itens vêm como
# parágrafos começando por hífen, e não como lista do Word.
itens = [b["texto"].lstrip("- ").strip() for b in apres
         if b["tipo"] in ("paragrafo", "lista") and b.get("texto", "").lstrip().startswith("-")]
itens += [i.lstrip("- ").strip() for b in apres if b["tipo"] == "lista" for i in b["itens"]]
apres[:] = [b for b in apres
            if not (b["tipo"] == "paragrafo" and b["texto"].lstrip().startswith("-"))
            and b["tipo"] != "lista"]
apres.insert(len(apres) - 1,
             {"tipo": "nota", "titulo": "Modificações feitas no texto", "paragrafos": itens})

saida = {
    "titulo": "Enchiridion Indulgentiarum",
    "descricao": ("Orientações litúrgico-pastorais: a quarta edição do Enchiridion "
                  "Indulgentiarum, publicada por João Paulo II em 16 de julho de 1999, "
                  "na tradução aprovada pela CNBB."),
    "notas": NOTAS,
    "secoes": secoes,
}
io.open("enchiridion.json", "w", encoding="utf-8").write(
    json.dumps(saida, ensure_ascii=False, indent=1) + "\n")

print(f"{len(secoes)} seções, {sum(len(s['blocos']) for s in secoes)} blocos, {len(NOTAS)} notas")
for s in secoes:
    print(f"  {s['id']:26} {len(s['blocos']):4} blocos")
