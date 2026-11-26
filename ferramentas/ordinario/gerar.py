#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extrair import extrair
from momentos import SECOES_ROTULADAS, aplicar

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, "src", "data", "ordinario")

SECOES = [
    ("capa", "Ordinário da Missa", "ORDINÁRIO DA MISSA", False),
    ("magisterio", "A voz do Magistério", "A VOZ DO MAGISTÉRIO", False),
    ("preparacao", "Oração preparatória",
     "ORAÇÃO PREPARATÓRIA PARA A SANTA MISSA", False),
    ("asperges", "Aspersão", "ASPERSÃO", True),
    ("pe-altar", "Orações ao pé do altar", "ORAÇÕES AO PÉ DO ALTAR", True),
    ("catecumenos", "Missa dos catecúmenos",
     "ANTE-MISSA: MISSA DOS CATECÚMENOS", True),
    ("ofertorio", "Ofertório", "SACRIFÍCIO: MISSA DOS FIEIS", True),
    ("canon", "Canon da Missa", "Canon da Missa", True),
    ("comunhao", "Comunhão", "Oração dominical", True),
    ("conclusao", "Conclusão e Último Evangelho",
     "[i]Oscula o Altar e volta-se para o povo.[/i]", True),
    ("leoninas", "Orações no fim da Missa rezada",
     "ORAÇÕES NO FIM DA MISSA REZADA", True),
    ("acao-de-gracas", "Ação de graças depois da Missa",
     "ORAÇÕES DE AÇÃO DE GRAÇAS APÓS A SANTA MISSA", False),
    ("bencao", "Exposição e bênção do Santíssimo",
     "EXPOSIÇÃO E BÊNÇÃO DO SANTÍSSIMO SACRAMENTO", False),
]

PROPRIOS = [
    ("Antífona do Intróito", "Intróito", ["Intróito"]),
    ("Oração Coleta", "Oração", ["Oração"]),
    ("Epístola", "Epístola", ["Epístola"]),
    ("Gradual. Aleluia ou Tracto. Sequencia", "Gradual, Aleluia ou Tracto",
     ["Gradual", "Aleluia", "Tracto"]),
    ("Evangelho", "Evangelho", ["Evangelho"]),
    ("Antífona do Ofertório", "Ofertório", ["Ofertório"]),
    ("Oração Secreta", "Secreta", ["Secreta"]),
    ("Prefácio", "Prefácio", ["Prefácio"]),
    ("Antífona da Comunhão", "Comunhão", ["Comunhão"]),
    ("Oração Pós-comunhão", "Pós-comunhão", ["Pós-Comunhão"]),
]

CABECA = "// Gerado por ferramentas/ordinario/gerar.py. Não edite à mão.\n"


def nomearProprios(blocos):
    vistos = 0
    ultimoTitulo = ""
    for bloco in blocos:
        if bloco["tipo"] == "titulo":
            ultimoTitulo = bloco["texto"]
        elif bloco["tipo"] == "proprio":
            if vistos >= len(PROPRIOS):
                raise SystemExit("o PDF tem mais de %d lugares de próprio" % len(PROPRIOS))
            esperado, nome, subtitulos = PROPRIOS[vistos]
            if ultimoTitulo != esperado:
                raise SystemExit(
                    "o %dº lugar do próprio vem depois de %r, e não de %r"
                    % (vistos + 1, ultimoTitulo, esperado))
            bloco["nome"] = nome
            bloco["subtitulos"] = subtitulos
            vistos += 1
    if vistos != len(PROPRIOS):
        raise SystemExit("o PDF tem %d lugares de próprio, e não %d"
                         % (vistos, len(PROPRIOS)))


def comoBlocoDoSite(bloco):
    if bloco["tipo"] == "titulo":
        return {"tipo": "subtitulo", "texto": bloco["texto"]}
    return bloco


def repartir(blocos):
    aberturas = {}
    for i, bloco in enumerate(blocos):
        texto = bloco.get("texto")
        for id_, _, abre, _ in SECOES:
            if texto == abre and id_ not in aberturas:
                aberturas[id_] = i

    faltando = [id_ for id_, _, _, _ in SECOES if id_ not in aberturas]
    if faltando:
        raise SystemExit("o PDF não abre a(s) seção(ões) %s" % ", ".join(faltando))

    cortes = [aberturas[id_] for id_, _, _, _ in SECOES]
    if cortes != sorted(cortes):
        raise SystemExit("as seções não estão na ordem do impresso: %s" % cortes)

    fins = cortes[1:] + [len(blocos)]
    return [(SECOES[i], blocos[cortes[i]:fins[i]]) for i in range(len(SECOES))]


def main(pdf):
    blocos = extrair(pdf)
    nomearProprios(blocos)
    partes = repartir(blocos)

    if not os.path.isdir(SAIDA):
        os.makedirs(SAIDA)

    sites = {s[0]: [comoBlocoDoSite(b) for b in crus] for s, crus in partes}
    aplicar({id_: sites[id_] for id_ in SECOES_ROTULADAS})

    for (id_, titulo, _, _), _crus in partes:
        dentro = sites[id_]
        caminho = os.path.join(SAIDA, "%s.json" % id_)
        with io.open(caminho, "w", encoding="utf-8") as f:
            json.dump({"id": id_, "titulo": titulo, "blocos": dentro},
                      f, ensure_ascii=False, indent=1)
            f.write("\n")
        print("%-16s %3d blocos" % (id_, len(dentro)))

    linhas = [
        CABECA,
        "\n",
        "export interface SecaoDoOrdinario {\n",
        "  id: string;\n",
        "  titulo: string;\n",
        "  /** Reza-se acompanhando o celebrante, e não antes nem depois da Missa. */\n",
        "  naMissa: boolean;\n",
        "}\n",
        "\n",
        "export const SECOES: SecaoDoOrdinario[] = [\n",
    ]
    for id_, titulo, _, naMissa in SECOES:
        linhas.append('  { id: "%s", titulo: "%s", naMissa: %s },\n'
                      % (id_, titulo, "true" if naMissa else "false"))
    linhas += [
        "];\n",
        "\n",
        "export const ARQUIVOS: Record<string, () => Promise<{ default: unknown }>> = {\n",
    ]
    for id_, _, _, _ in SECOES:
        linhas.append('  "%s": () => import("./%s.json"),\n' % (id_, id_))
    linhas.append("};\n")

    with io.open(os.path.join(SAIDA, "indice.ts"), "w", encoding="utf-8") as f:
        f.writelines(linhas)

    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
