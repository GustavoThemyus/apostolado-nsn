import json, os, re, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
AGENDA = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--agenda=")), "ordo")

ICS = os.path.join(AQUI, f"{AGENDA}.ics")

BASE = {
    "ordo-2027": "69b23a6c838c00407047267174ead1681f293ee619475fb22f3ee5736862b7ec"
                 "@group.calendar.google.com",
}
PASTA = os.path.join(RAIZ, "src", "data", "ordo")

CORES = {"⚪": "branco", "🟡": "branco", "🔴": "vermelho",
         "🟢": "verde", "🟣": "roxo", "⚫": "preto", "🩷": "rosa"}

ESCRITA = {"branco": "branc", "vermelho": "vermelh", "verde": "verde",
           "roxo": "rox", "preto": "pret", "rosa": "róse"}


def id_do_ordo():
    if AGENDA in BASE:
        return BASE[AGENDA]
    with open(os.path.join(RAIZ, "src", "data", "site.json"), encoding="utf-8") as f:
        for agenda in json.load(f)["agendas"]:
            if agenda["id"] == AGENDA:
                return agenda["google"]
    raise SystemExit(f"não achei a agenda {AGENDA!r} em src/data/site.json")


def baixar():
    url = (f"https://calendar.google.com/calendar/ical/"
           f"{urllib.parse.quote(id_do_ordo())}/public/basic.ics")
    with urllib.request.urlopen(url, timeout=60) as r:
        dados = r.read().decode("utf-8")
    with open(ICS, "w", encoding="utf-8") as f:
        f.write(dados)
    return dados


def desdobrar(texto):
    return re.sub(r"\r?\n[ \t]", "", texto)


def desescapar(texto):
    return re.sub(r"\\([\\,;nN])",
                  lambda m: "\n" if m.group(1) in "nN" else m.group(1), texto)


def ler_anexos(evento):
    anexos = []
    for parametros, url in re.findall(r"\r?\nATTACH([^:]*):(\S+)", evento):
        nome = re.search(r"FILENAME=([^;:]+)", parametros)
        anexos.append({
            "nome": desescapar(nome.group(1)).removesuffix(".pdf") if nome else "Próprio da Missa",
            "url": url.strip(),
        })
    return anexos


def campo(evento, nome):
    achado = re.search(rf"\r?\n{nome}[^:\r\n]*:(.*?)(?=\r?\n[A-Z][A-Z0-9-]*[;:])",
                       evento, re.S)
    return desescapar(achado.group(1)).strip() if achado else ""

PENITENCIA = [
    (re.compile(r"dispensada a abstinência", re.I), "dispensada"),
    (re.compile(r"jejum e abstinência", re.I), "jejum-e-abstinencia"),
    (re.compile(r"dia de abstinência", re.I), "abstinencia"),
]


def cabeca_e_resto(corpo):
    linhas = corpo.split("\n")
    i = next((n for n, l in enumerate(linhas) if "–" in l), 0)
    antes = [l.strip() for l in linhas[:i] if l.strip()]
    return ", ".join([*antes, linhas[i].strip()]), "\n".join(linhas[i + 1:])


def ler_penitencia(partes):
    texto = " ".join(partes)
    for padrao, nome in PENITENCIA:
        if padrao.search(texto):
            return nome
    return None

SEPARADOR = re.compile(r"^[ \t]*(É possível também celebrar|Na Igreja universal):[ \t]*$", re.M)
CAMPOS = {"Subtítulo": "subtitulo", "Grau": "grau", "Rito": "rito", "Cor": "cor"}
SO_PENITENCIA = re.compile(r"^(Dia de (jejum e )?abstinência|Hoje é dispensada a Abstinência de carne)$", re.I)


def eh_formato_novo(corpo):
    return re.search(r"^Cor: ", corpo, re.M) is not None


def paragrafos(linhas):
    blocos, atual = [], []
    for linha in [*linhas, ""]:
        limpa = linha.strip()
        if atual and (not limpa or limpa.startswith("➢")):
            blocos.append(" ".join(atual))
            atual = []
        if limpa:
            atual.append(limpa)
    return [re.sub(r"\s+", " ", b) for b in blocos]


def ler_missa(linhas, onde, problemas):
    missa, i = {}, 0
    while i < len(linhas):
        linha = linhas[i].strip()
        if not linha:
            if "cor" in missa:
                break
        elif (m := re.match(r"(Subtítulo|Grau|Rito|Cor):\s*(.+)$", linha)):
            missa[CAMPOS[m.group(1)]] = m.group(2).strip()
        elif linha.lower() == "dia santo de guarda":
            missa["guarda"] = True
        elif linha.endswith(":"):
            missa["proprio"] = linha.rstrip(":").strip()
        else:
            problemas.append(f"{onde}: linha desconhecida na cabeça: {linha!r}")
        i += 1

    if "rito" not in missa or "cor" not in missa:
        problemas.append(f"{onde}: falta Rito ou Cor")
        return None
    escrita = missa["cor"]
    achada = next((c for c, raiz in ESCRITA.items()
                   if escrita.lower().startswith((raiz, c))), None)
    if achada is None:
        problemas.append(f"{onde}: cor desconhecida: {escrita!r}")
        return None
    missa["cor"] = achada
    if not re.fullmatch(r"\w+", escrita):
        missa["cores"] = escrita

    missa["partes"] = [p for p in paragrafos(linhas[i:]) if not SO_PENITENCIA.match(p)]
    return missa


def ler_dia_novo(nome, corpo, data, problemas):
    pedacos = SEPARADOR.split(corpo)
    dia = ler_missa(pedacos[0].split("\n"), data, problemas)
    if dia is None:
        return None
    dia = {"nome": nome, **dia}
    outras = []
    for abertura, texto in zip(pedacos[1::2], pedacos[2::2]):
        linhas = texto.strip("\n").split("\n")
        while linhas and not linhas[0].strip():
            linhas.pop(0)
        titulo = linhas.pop(0).strip() if linhas else ""
        missa = ler_missa(linhas, f"{data} ({titulo})", problemas)
        if missa is None:
            continue
        if missa.pop("guarda", False):
            dia["guarda"] = True
        quem = ({"rotulo": abertura} if abertura == "Na Igreja universal"
                else {"alternativa": True})
        outras.append({**quem, "nome": titulo, **missa})
    if outras:
        dia["outras"] = outras
    penitencia = ler_penitencia(
        [p for p in paragrafos(corpo.split("\n")) if SO_PENITENCIA.match(p)])
    if penitencia:
        dia["penitencia"] = penitencia
    return dia


def eh_lembrete(evento):
    titulo = campo(evento, "SUMMARY")
    return bool(titulo) and not (titulo[0] in CORES or campo(evento, "DESCRIPTION")
                                 or "\nATTACH" in evento)


def ler(dados):
    dias, problemas = {}, []
    for evento in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", desdobrar(dados), re.S):
        if eh_lembrete(evento):
            continue
        quando = re.search(r"DTSTART[^:]*:(\d{8})", evento)
        titulo = campo(evento, "SUMMARY")
        if not (quando and titulo):
            problemas.append(f"evento sem data ou título: {evento[:60]!r}")
            continue
        d = quando.group(1)
        data = f"{d[:4]}-{d[4:6]}-{d[6:]}"

        corpo = campo(evento, "DESCRIPTION").replace("\r", "")
        if eh_formato_novo(corpo):
            dia = ler_dia_novo(titulo.strip(), corpo, data, problemas)
            if dia:
                anexos = ler_anexos(evento)
                if anexos:
                    dia["anexos"] = anexos
                dias[data] = dia
            continue

        cor = CORES.get(titulo[0])
        if cor is None:
            problemas.append(f"{data}: círculo de cor desconhecido em {titulo[:40]!r}")
            continue
        nome = titulo[1:].strip()

        cabeca, resto = cabeca_e_resto(corpo)
        grau, _, frase = cabeca.partition("–")
        grau, frase = grau.strip().rstrip(","), frase.strip()

        if ESCRITA[cor] not in frase.lower():
            problemas.append(f"{data}: círculo {cor!r} não bate com {frase!r}")

        dia = {"nome": nome, "cor": cor, "grau": grau}
        frase, _, cauda = frase.partition(":")
        if cauda.strip():
            dia["guarda"] = cauda.strip() == "dia santo de guarda"
        if not re.fullmatch(r"cor \w+", frase.strip()):
            dia["cores"] = frase.strip()

        partes = [p.strip() for p in re.split(r"\n\s*\n", resto) if p.strip()]
        if partes:
            dia["partes"] = partes
        penitencia = ler_penitencia(partes)
        if penitencia:
            dia["penitencia"] = penitencia
        anexos = ler_anexos(evento)
        if anexos:
            dia["anexos"] = anexos
        dias[data] = dia
    return dias, problemas


def conferir_anexos(caminho, dias):
    if not os.path.exists(caminho):
        return
    with open(caminho, encoding="utf-8") as f:
        publicado = json.load(f)["dias"]
    antes = sum(len(d.get("anexos") or []) for d in publicado.values())
    agora = sum(len(d.get("anexos") or []) for d in dias.values())
    if agora < antes and "--sem-anexos" not in sys.argv:
        raise SystemExit(
            f"{caminho}: o publicado tem {antes} anexos e esta importação traz "
            f"{agora}. Reanexar os PDF no calendário, ou repetir com "
            "--sem-anexos para gravar assim mesmo."
        )


def principal():
    if "--baixar" in sys.argv or not os.path.exists(ICS):
        dados = baixar()
    else:
        with open(ICS, encoding="utf-8") as f:
            dados = f.read()

    dias, problemas = ler(dados)
    for p in problemas[:20]:
        print("  !", p)
    if problemas:
        raise SystemExit(f"{len(problemas)} problema(s) na leitura do Ordo")

    anos = sorted({d[:4] for d in dias})
    os.makedirs(PASTA, exist_ok=True)
    print(f"{len(dias)} dias, anos {', '.join(anos)}")
    for ano in anos:
        doAno = {d: v for d, v in sorted(dias.items()) if d.startswith(ano)}
        saida = {
            "fonte": "Ordo Litúrgico diário de São Pio X",
            "descricao": ("O Ordo de São Pio X, anterior à reforma de 1955. "
                          "Copiado do calendário publicado pelo Apostolado, não calculado."),
            "ano": int(ano),
            "dias": doAno,
        }
        conferir_anexos(os.path.join(PASTA, f"{ano}.json"), doAno)
        with open(os.path.join(PASTA, f"{ano}.json"), "w", encoding="utf-8") as f:
            json.dump(saida, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print(f"  {ano}: {len(doAno)} dias, de {min(doAno)} a {max(doAno)}")

    escrever_indice()


def escrever_indice():
    anos, ate = [], {}
    for nome in sorted(os.listdir(PASTA)):
        if re.fullmatch(r"\d{4}\.json", nome):
            with open(os.path.join(PASTA, nome), encoding="utf-8") as f:
                anos.append(nome[:4])
                ate[nome[:4]] = max(json.load(f)["dias"])
    linhas = [
        "// Gerado por ferramentas/ordo/importar.py. Não edite à mão.",
        "",
        f"export const ANOS: number[] = [{', '.join(anos)}];",
        "",
        "export const ATE: Record<number, string> = {",
        *[f'  {ano}: "{ate[ano]}",' for ano in anos],
        "};",
        "",
        "export const ARQUIVOS: Record<number, () => Promise<{ default: unknown }>> = {",
        *[f"  {ano}: () => import(\"./{ano}.json\")," for ano in anos],
        "};",
        "",
    ]
    with open(os.path.join(PASTA, "indice.ts"), "w", encoding="utf-8") as f:
        f.write("\n".join(linhas))


if __name__ == "__main__":
    principal()
