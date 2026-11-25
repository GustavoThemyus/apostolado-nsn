"""
Confere `src/data/ordo/<ano>.json` contra o `.ics` de onde saiu.

Não basta o importador ter rodado sem erro: ele pode ter lido certo e escrito
de menos. Aqui se exige que cada dia do Ordo tenha chegado inteiro, que o
círculo de cor concorde com a cor escrita por extenso, e que nenhum dia do ano
tenha ficado sem celebração. Sai != 0 se falhar.
"""
import json, os, re, sys, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importar import (ICS, PASTA, CORES, ESCRITA, SEPARADOR, cabeca_e_resto, desdobrar,
                      campo, eh_formato_novo)

with open(ICS, encoding="utf-8") as f:
    bruto = desdobrar(f.read())

# --- o que está no .ics -----------------------------------------------------
origem = {}
for evento in re.findall(r"BEGIN:VEVENT(.*?)END:VEVENT", bruto, re.S):
    d = re.search(r"DTSTART[^:]*:(\d{8})", evento)
    if not d:
        continue
    data = f"{d.group(1)[:4]}-{d.group(1)[4:6]}-{d.group(1)[6:]}"
    origem[data] = {"titulo": campo(evento, "SUMMARY"),
                    "descricao": campo(evento, "DESCRIPTION")}

# --- o que foi publicado ----------------------------------------------------
publicado = {}
anos = sorted(a for a in os.listdir(PASTA) if a.endswith(".json"))
# só os anos que esta agenda traz: cada uma se confere com o que é dela
anos = [a for a in anos if any(d.startswith(a[:4]) for d in origem)]
for arquivo in anos:
    with open(os.path.join(PASTA, arquivo), encoding="utf-8") as f:
        publicado.update(json.load(f)["dias"])

problemas = []

sobrando = set(publicado) - set(origem)
faltando = set(origem) - set(publicado)
if sobrando:
    problemas.append(f"dias publicados que não estão no Ordo: {sorted(sobrando)[:5]}")
if faltando:
    problemas.append(f"dias do Ordo que não foram publicados: {sorted(faltando)[:5]}")

def conferir_formato_novo(data, dia, titulo, corpo):
    """
    Tira do texto do Ordo tudo o que foi publicado. O que sobrar só pode ser
    rótulo de campo, separador de Missa ou o anúncio da penitência.
    """
    def juntar(t):
        return re.sub(r"\s+", " ", t).strip()

    if titulo.strip() != dia["nome"]:
        problemas.append(f"{data}: nome difere do título do Ordo")
    missas = [dia, *dia.get("outras", [])]
    abertas = len(SEPARADOR.findall(corpo))
    if abertas != len(missas) - 1:
        problemas.append(f"{data}: o Ordo abre {abertas} Missas extras, "
                         f"publicadas {len(missas) - 1}")
    sobra = juntar(SEPARADOR.sub("", corpo))
    publicadas = []
    for i, m in enumerate(missas):
        publicadas += m.get("partes", [])
        publicadas += [f"{r}: {m[c]}" for r, c in (("Subtítulo", "subtitulo"),
                       ("Grau", "grau"), ("Rito", "rito")) if c in m]
        publicadas.append(f"Cor: {m.get('cores', m['cor'])}")
        if "proprio" in m:
            publicadas.append(f"{m['proprio']}:")
        if i:
            publicadas.append(m["nome"])
    # os maiores primeiro, para um trecho curto não comer o meio de um longo
    for trecho in sorted(map(juntar, publicadas), key=len, reverse=True):
        achado = re.search(re.escape(trecho), sobra, re.I)
        if not achado:
            problemas.append(f"{data}: não está no Ordo: {trecho[:50]!r}")
            continue
        sobra = sobra[:achado.start()] + " " + sobra[achado.end():]
    sobra = re.sub(r"Dia santo de guarda|Dia de (jejum e )?abstinência|"
                   r"Hoje é dispensada a Abstinência de carne", "", sobra, flags=re.I)
    if sobra.strip():
        problemas.append(f"{data}: ficou de fora: {juntar(sobra)[:80]!r}")


for data, dia in sorted(publicado.items()):
    fonte = origem.get(data)
    if not fonte:
        continue
    titulo = fonte["titulo"]
    corpo = fonte["descricao"].replace("\r", "")

    if eh_formato_novo(corpo):
        conferir_formato_novo(data, dia, titulo, corpo)
        continue

    if CORES.get(titulo[0]) != dia["cor"]:
        problemas.append(f"{data}: cor {dia['cor']!r} não é a do círculo {titulo[0]!r}")
    if titulo[1:].strip() != dia["nome"]:
        problemas.append(f"{data}: nome difere do título do Ordo")

    cabeca, resto = cabeca_e_resto(fonte["descricao"])
    if not cabeca.startswith(dia["grau"]):
        problemas.append(f"{data}: grau {dia['grau']!r} não abre a cabeça {cabeca[:50]!r}")
    if ESCRITA[dia["cor"]] not in cabeca.lower():
        problemas.append(f"{data}: a cor escrita não confirma o círculo — {cabeca[:60]!r}")

    # todo parágrafo do Ordo chegou, e nenhum foi inventado
    doOrdo = [p.strip() for p in re.split(r"\n\s*\n", resto) if p.strip()]
    if doOrdo != dia.get("partes", []):
        problemas.append(f"{data}: as partes não batem ({len(doOrdo)} no Ordo, "
                         f"{len(dia.get('partes', []))} publicadas)")

# --- os PDF do próprio da Missa não podem sumir -----------------------------
#
# Em 28/09/2026 o Perez passou os calendários para o e-mail do Apostolado. O
# texto dos 365 dias veio igualzinho, e os 92 anexos não vieram: mover eventos
# no Google não leva os anexos junto, e o .ics novo saiu sem uma linha ATTACH.
# Uma importação distraída teria apagado do site os links de "Confira o próprio
# da Missa", que é coisa que ele mesmo pediu.
#
# Daí esta conferência olhar para trás: se o Ordo novo traz menos anexos do que
# o já publicado, ela para. Quem decide o que fazer é gente, não o script.
noIcs = sum(len(d.get("anexos") or []) for d in publicado.values())
naOrigem = len(re.findall(r"\r?\nATTACH", bruto))
if naOrigem < noIcs:
    problemas.append(
        f"o Ordo publicado tem {noIcs} anexos e o .ics traz {naOrigem}: "
        "reanexar os PDF no calendário novo, ou manter o JSON como está")

# --- nenhum buraco no ano ---------------------------------------------------
for arquivo in anos:
    ano = int(arquivo.removesuffix(".json"))
    dia = datetime.date(ano, 1, 1)
    # o ano em preparação vai até onde o calendário vai, sem buraco no meio
    while dia.year == ano and dia.isoformat() <= max(origem):
        if dia.isoformat() not in publicado:
            problemas.append(f"{dia.isoformat()}: dia sem celebração no Ordo")
        dia += datetime.timedelta(days=1)

print(f"dias no Ordo: {len(origem)} | publicados: {len(publicado)}")
print(f"PROBLEMAS: {len(problemas)}")
for p in problemas[:20]:
    print("   ", p)
sys.exit(1 if problemas else 0)
