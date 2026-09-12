"""
Confere `src/data/ordo/<ano>.json` contra o `.ics` de onde saiu.

Não basta o importador ter rodado sem erro: ele pode ter lido certo e escrito
de menos. Aqui se exige que cada dia do Ordo tenha chegado inteiro, que o
círculo de cor concorde com a cor escrita por extenso, e que nenhum dia do ano
tenha ficado sem celebração. Sai != 0 se falhar.
"""
import json, os, re, sys, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importar import ICS, PASTA, CORES, ESCRITA, desdobrar, desescapar, campo

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

for data, dia in sorted(publicado.items()):
    fonte = origem.get(data)
    if not fonte:
        continue
    titulo = fonte["titulo"]

    if CORES.get(titulo[0]) != dia["cor"]:
        problemas.append(f"{data}: cor {dia['cor']!r} não é a do círculo {titulo[0]!r}")
    if titulo[1:].strip() != dia["nome"]:
        problemas.append(f"{data}: nome difere do título do Ordo")

    cabeca = fonte["descricao"].partition("\n")[0]
    if not cabeca.startswith(dia["grau"]):
        problemas.append(f"{data}: grau {dia['grau']!r} não abre a cabeça {cabeca[:50]!r}")
    if ESCRITA[dia["cor"]] not in cabeca.lower():
        problemas.append(f"{data}: a cor escrita não confirma o círculo — {cabeca[:60]!r}")

    # todo parágrafo do Ordo chegou, e nenhum foi inventado
    doOrdo = [p.strip() for p in re.split(r"\n\s*\n", fonte["descricao"].partition("\n")[2])
              if p.strip()]
    if doOrdo != dia.get("partes", []):
        problemas.append(f"{data}: as partes não batem ({len(doOrdo)} no Ordo, "
                         f"{len(dia.get('partes', []))} publicadas)")

# --- nenhum buraco no ano ---------------------------------------------------
for arquivo in anos:
    ano = int(arquivo.removesuffix(".json"))
    dia = datetime.date(ano, 1, 1)
    while dia.year == ano:
        if dia.isoformat() not in publicado:
            problemas.append(f"{dia.isoformat()}: dia sem celebração no Ordo")
        dia += datetime.timedelta(days=1)

print(f"dias no Ordo: {len(origem)} | publicados: {len(publicado)}")
print(f"PROBLEMAS: {len(problemas)}")
for p in problemas[:20]:
    print("   ", p)
sys.exit(1 if problemas else 0)
