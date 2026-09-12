"""
Importa o Ordo da capela para `src/data/ordo-pre55.json`.

O calendário anterior à reforma de 1955 não é calculado como o de 1962: ele é
copiado do Ordo que a própria capela publica, dia a dia, num calendário do
Google. A razão é simples — esse Ordo traz o que motor nenhum produziria: o
grau no vocabulário pré-55, a Missa, as comemorações, o Prefácio, as rubricas
do dia, as Missas permitidas, o próprio da Arquidiocese da Paraíba e as
transferências que o redator anotou à mão.

Cobre o ano que a capela publicou. Fora dele o site diz que não há Ordo, em
vez de adivinhar.

    python3 importar.py            # usa ordo.ics se existir, senão baixa
    python3 importar.py --baixar   # busca de novo, para o ano novo
    python3 conferir.py            # confere o JSON contra o .ics
"""
import json, os, re, sys, urllib.request

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
ICS = os.path.join(AQUI, "ordo.ics")
# Um arquivo por ano, e não um só: são 27 KB comprimidos por ano, e a página
# só baixa o ano que o leitor está vendo — e só se ele pedir o pré-55.
PASTA = os.path.join(RAIZ, "src", "data", "ordo")

# O Ordo marca a cor com um círculo colorido no começo do título. O amarelo é
# o ouro, que a rubrica permite no lugar do branco nas solenidades; o site tem
# seis cores litúrgicas e não tem ouro, então ele entra como branco — que é o
# que a própria cabeça do dia diz, e isso é conferido adiante.
CORES = {"⚪": "branco", "🟡": "branco", "🔴": "vermelho",
         "🟢": "verde", "🟣": "roxo", "⚫": "preto", "🩷": "rosa"}

# Para conferir o círculo contra a cor escrita por extenso na cabeça do dia.
ESCRITA = {"branco": "branc", "vermelho": "vermelh", "verde": "verde",
           "roxo": "rox", "preto": "pret", "rosa": "róse"}


def id_do_ordo():
    """O id do calendário mora no site.json, que é onde ele já era usado."""
    with open(os.path.join(RAIZ, "src", "data", "site.json"), encoding="utf-8") as f:
        for agenda in json.load(f)["agendas"]:
            if agenda["id"] == "ordo":
                return agenda["google"]
    raise SystemExit("não achei a agenda 'ordo' em src/data/site.json")


def baixar():
    url = (f"https://calendar.google.com/calendar/ical/"
           f"{urllib.parse.quote(id_do_ordo())}/public/basic.ics")
    with urllib.request.urlopen(url, timeout=60) as r:
        dados = r.read().decode("utf-8")
    with open(ICS, "w", encoding="utf-8") as f:
        f.write(dados)
    return dados


def desdobrar(texto):
    """
    O iCalendar corta linhas longas e continua na seguinte com um espaço. Já
    tropecei aqui: procurei a dobra como "\\r\\n " e este arquivo usa "\\n ",
    de modo que nada se desdobrava e os nomes chegavam cortados no meio.
    """
    return re.sub(r"\r?\n[ \t]", "", texto)


def desescapar(texto):
    return re.sub(r"\\([\\,;nN])",
                  lambda m: "\n" if m.group(1) in "nN" else m.group(1), texto)


def campo(evento, nome):
    achado = re.search(rf"\r?\n{nome}[^:\r\n]*:(.*?)(?=\r?\n[A-Z][A-Z0-9-]*[;:])",
                       evento, re.S)
    return desescapar(achado.group(1)).strip() if achado else ""


def ler(dados):
    dias, problemas = {}, []
    for evento in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", desdobrar(dados), re.S):
        quando = re.search(r"DTSTART[^:]*:(\d{8})", evento)
        titulo = campo(evento, "SUMMARY")
        if not (quando and titulo):
            problemas.append(f"evento sem data ou título: {evento[:60]!r}")
            continue
        d = quando.group(1)
        data = f"{d[:4]}-{d[4:6]}-{d[6:]}"

        cor = CORES.get(titulo[0])
        if cor is None:
            problemas.append(f"{data}: círculo de cor desconhecido em {titulo[:40]!r}")
            continue
        nome = titulo[1:].strip()

        corpo = campo(evento, "DESCRIPTION")
        cabeca, _, resto = corpo.partition("\n")
        grau, _, frase = cabeca.partition("–")
        grau, frase = grau.strip().rstrip(","), frase.strip()

        if ESCRITA[cor] not in frase.lower():
            problemas.append(f"{data}: círculo {cor!r} não bate com {frase!r}")

        dia = {"nome": nome, "cor": cor, "grau": grau}
        # "dia santo de guarda" vem colado na cor; é dado, não enfeite
        frase, _, cauda = frase.partition(":")
        if cauda.strip():
            dia["guarda"] = cauda.strip() == "dia santo de guarda"
        # a cor só entra escrita quando ela não é uma palavra só: os dias de
        # duas cores e o róseo com o roxo por falta dele
        if not re.fullmatch(r"cor \w+", frase.strip()):
            dia["cores"] = frase.strip()

        partes = [p.strip() for p in re.split(r"\n\s*\n", resto) if p.strip()]
        if partes:
            dia["partes"] = partes
        dias[data] = dia
    return dias, problemas


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
            "descricao": ("O Ordo que a capela segue, anterior à reforma de 1955. "
                          "Copiado do calendário publicado pelo Apostolado, não calculado."),
            "ano": int(ano),
            "dias": doAno,
        }
        with open(os.path.join(PASTA, f"{ano}.json"), "w", encoding="utf-8") as f:
            json.dump(saida, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print(f"  {ano}: {len(doAno)} dias, de {min(doAno)} a {max(doAno)}")

    escrever_indice(anos)


def escrever_indice(anos):
    """
    O índice dos anos, gerado junto.

    Podia ser `import.meta.glob`, que o Vite entende sozinho. Não é, porque o
    `npm test` empacota os mesmos módulos com o esbuild puro, que não conhece
    essa extensão: o teste quebraria por causa de uma comodidade de build.
    Um módulo gerado é ESM comum e serve aos dois.
    """
    linhas = [
        "// Gerado por ferramentas/ordo/importar.py. Não edite à mão.",
        "",
        "/** Os anos que a capela já publicou. */",
        f"export const ANOS: number[] = [{', '.join(anos)}];",
        "",
        "/**",
        " * Um arquivo por ano, carregado só quando o leitor pede o pré-55.",
        " *",
        " * O tipo aqui é `unknown` de propósito: o que o JSON garante é o",
        " * importador, e quem confere é ferramentas/ordo/conferir.py. Declarar",
        " * a forma aqui seria uma promessa que este arquivo não cumpre.",
        " */",
        "export const ARQUIVOS: Record<number, () => Promise<{ default: unknown }>> = {",
        *[f"  {ano}: () => import(\"./{ano}.json\")," for ano in anos],
        "};",
        "",
    ]
    with open(os.path.join(PASTA, "indice.ts"), "w", encoding="utf-8") as f:
        f.write("\n".join(linhas))


if __name__ == "__main__":
    principal()
