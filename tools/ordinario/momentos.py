#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import io, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PASTA = os.path.join(RAIZ, "src", "data", "ordinario")

MARCACAO = re.compile(r"\[/?[a-z]+(?::[^\]]*)?\]")

PAUSA_POSTA = re.compile(r"([,;:.]) — ")


def plano(texto):
    return " ".join(PAUSA_POSTA.sub(r"\1 ", MARCACAO.sub("", texto)).split())

ROTULO = re.compile(r"^(?:℣\.?|℟\.?|S\.|M\.)\s*")


def achatado(bloco):
    if bloco["tipo"] == "bilingue":
        partes = [ROTULO.sub("", plano(p.get("texto", ""))) for lado in ("latim", "portugues")
                  for p in bloco[lado]]
        return " | ".join(partes)
    if bloco["tipo"] == "proprio":
        return plano(bloco["nome"])
    return plano(bloco.get("texto", ""))


def achar(blocos, ancora, secao):
    tipo, _, resto = ancora.partition(":")
    if tipo in ("subtitulo", "rubrica", "bilingue", "proprio", "paragrafo") and resto:
        texto = plano(resto)
    else:
        tipo, texto = None, plano(ancora)
    achados = [i for i, b in enumerate(blocos)
               if (tipo is None or b["tipo"] == tipo) and achatado(b).startswith(texto)]
    if len(achados) != 1:
        raise SystemExit("%s: a âncora %r casa com %d blocos, e devia casar com 1"
                         % (secao, ancora, len(achados)))
    return achados[0]


def existe(blocos, ancora):
    tipo, _, resto = ancora.partition(":")
    if tipo in ("subtitulo", "rubrica", "bilingue", "proprio", "paragrafo") and resto:
        return any(b["tipo"] == tipo and achatado(b).startswith(plano(resto)) for b in blocos)
    return any(achatado(b).startswith(plano(ancora)) for b in blocos)


def rubrica(texto):
    return {"tipo": "rubrica", "texto": "[i]%s[/i]" % texto}

EMENDAS = [
    ("reescrever", "asperges", "rubrica:Todos de pé, para a entrada do sacerdote",
     "[i]Toca a sineta e todos se levantam para a entrada do sacerdote com os "
     "ministros. Quando ele começa as orações ao pé do altar, todos se ajoelham "
     "e se benzem ao mesmo tempo que ele. É igual na Missa rezada e na cantada.[/i]"),
    ("mover", "asperges", "rubrica:Toca a sineta", "asperges", ""),

    ("mover", "preparacao", "rubrica:Nos domingos é costume o rito de aspersão",
     "asperges", "subtitulo:ASPERSÃO"),
    ("reescrever", "asperges", "rubrica:Nos domingos é costume o rito de aspersão",
     "[i]Nos domingos é costume o rito de aspersão da água benta sobre o povo. "
     "Esse rito nos rememora nosso Batismo e afasta de nós o maligno. Quando o "
     "padre chega e se ajoelha para entoar o Asperges (ou o Vidi aquam), os fiéis "
     "também se ajoelham, e se levantam quando ele se levanta. Os fiéis se benzem "
     "ao serem aspergidos. O Vidi aquam se diz do Domingo de Páscoa ao Domingo de "
     "Pentecostes; no domingo seguinte, da Santíssima Trindade, volta o Asperges.[/i]"),

    ("mover", "asperges", "rubrica:Quando há incenso, ao impor incenso", "pe-altar", "fim"),
    ("mover", "asperges", "bilingue:Benedícite, pater reverénde", "pe-altar", "fim"),

    ("trocar", "catecumenos", "rubrica:O celebrante resume e apresenta a Deus",
     "Nas Missas de roxo ou preto, todos ficam de joelhos, a menos que seja domingo.",
     "Nas Missas penitenciais de roxo ou de preto, de joelhos, exceto aos domingos."),
    ("trocar", "catecumenos", "rubrica:Grande Doxologia",
     "Às partes destacadas, se faz uma reverência com a cabeça.",
     "Às partes destacadas, se faz uma reverência com a cabeça. Todos se benzem ao final."),
    ("trocar", "catecumenos", "rubrica:Início da instrução pela Igreja",
     "Todos se sentam.",
     "Todos se sentam, e também para as lições, quando as há."),
    ("trocar", "catecumenos", "rubrica:O Credo confessa a divindade de Cristo",
     "(nas Missas cantadas e da Encarnação e do Natal se ajoelha com os dois joelhos, quando indicado)",
     "(ajoelha-se quando indicado)"),
    ("trocar", "catecumenos", "rubrica:O Credo confessa a divindade de Cristo",
     "Todos de pé.", "Todos de pé. Todos se benzem ao final."),

    ("reescrever", "ofertorio", "rubrica:Após o toque da sineta, todos se sentam",
     "[i]Após o Oremus, todos se sentam.[/i]"),
    ("inserir", "ofertorio", "subtitulo:Incensação",
     rubrica("Em ambas as Missas os fiéis ficam sentados. Na Missa cantada, "
             "levantam-se para serem incensados.")),
    ("trocar", "ofertorio", "rubrica:O sacerdote purifica os dedos",
     "Nas Missas de Defuntos, se omite o[/i] Gloria Patri[i].",
     "Nas Missas de Defuntos e do Tempo da Paixão, se omite o[/i] Gloria Patri[i]."),
    ("reescrever", "ofertorio", "rubrica:Confessando a magnificência divina",
     "[i]Confessando a magnificência divina, a Igreja repete a confissão feita "
     "pelos Serafins. Todos ficam de pé durante o Sanctus e se benzem ao Benedictus. "
     "Terminado o Sanctus, os fiéis se ajoelham.[/i]"),

    ("trocar", "canon", "rubrica:O sacrifício já se ofereceu",
     "Terminado o Canon, todos de pé.",
     "Os fiéis permanecem de joelhos até a Comunhão."),

    ("reescrever", "comunhao", "rubrica:Nas Missas dialogadas, a assembleia diz o Pai-nosso",
     "[i]O sacerdote reza o Pai-nosso, e os fiéis respondem Sed líbera nos a malo. "
     "Ficam de joelhos.[/i]"),
    ("reescrever", "comunhao", "rubrica:À reposição do Santíssimo",
     "[i]O Santíssimo é reposto no Tabernáculo antes das abluções, e convém "
     "ajoelhar-se em respeito ao Senhor eucarístico. O sacerdote recita as seguintes "
     "orações durante as abluções dos sagrados vasos. Terminada a ação de graças, "
     "os fiéis podem se sentar.[/i]"),
    ("trocar", "comunhao", "rubrica:A Antífona da Comunhão exprime",
     "participaram do Santo Sacrifício.",
     "participaram do Santo Sacrifício. Os fiéis ficam sentados; quem quiser pode "
     "permanecer de joelhos, em ação de graças."),
    ("dividir", "conclusao", "bilingue:Dóminus vobíscum. | Et cum spíritu tuo. | Ite, missa est", 2,
     "bilingue:Ite, missa est"),
    ("reescrever", "conclusao", "rubrica:Se alguma ação litúrgica se segue à Missa",
     "[i]Nas Missas em que não se diz o[/i] Ite, missa est[i] (sem Glória, ou quando se "
     "segue alguma ação litúrgica), diz-se:[/i]"),

    ("trocar", "comunhao", "rubrica:Nesta oração pedimos os frutos",
     "dos dons recebidos.",
     "dos dons recebidos. Vale a mesma regra da Coleta: nas Missas penitenciais de "
     "roxo ou de preto, de joelhos, exceto aos domingos."),
]

RJ = dict(rezada="joelhos", cantada="pe")

MOMENTOS = [
    ("preparacao", "subtitulo:ORAÇÃO PREPARATÓRIA", dict(voz="alta", postura="joelhos", grupo="preparacao")),

    ("asperges", "rubrica:Toca a sineta", dict(voz="alta", postura="pe")),
    ("asperges", "subtitulo:ASPERSÃO", dict(voz="alta", grupo="aspersao")),
    ("asperges", "rubrica:Nos domingos é costume", dict(voz="alta", postura="joelhos", grupo="aspersao")),
    ("asperges", "rubrica:Fora do Tempo Pascal", dict(voz="alta", grupo="aspersao", quando="asperges")),
    ("asperges", "rubrica:No Tempo da Páscoa", dict(voz="alta", grupo="aspersao", quando="vidi-aquam")),

    ("pe-altar", "subtitulo:ORAÇÕES AO PÉ DO ALTAR", dict(voz="alta", postura="joelhos")),
    ("pe-altar", "rubrica:Sl XLII,1-5", dict(voz="alta", quando="salmo-42")),
    ("pe-altar", "rubrica:Humildemente o sacerdote", dict(voz="alta")),
    ("pe-altar", "rubrica:Neste momento o sacerdote sobe ao altar", dict(voz="baixa", postura=RJ)),
    ("pe-altar", "rubrica:Quando há incenso", dict(voz="baixa", postura="pe", quando="incenso", grupo="incenso-inicial")),

    ("catecumenos", "subtitulo:ANTE-MISSA", dict(voz="alta", postura=RJ)),
    ("catecumenos", "subtitulo:Glória", dict(voz="alta", postura="pe", quando="gloria")),
    ("catecumenos", "rubrica:O celebrante beija o altar e se volta ao povo", dict(voz="alta")),
    ("catecumenos", "subtitulo:Epístola", dict(voz="alta", postura="sentado")),
    ("catecumenos", "subtitulo:Evangelho", dict(voz="baixa")),
    ("catecumenos", "rubrica:Antes de ouvi-lo", dict(voz="alta", postura="pe")),
    ("catecumenos", "rubrica:Terminado o Evangelho", dict(voz="baixa")),
    ("catecumenos", "subtitulo:Homilia", dict(voz="alta", postura="sentado")),
    ("catecumenos", "subtitulo:Credo", dict(voz="alta", postura="pe", quando="credo")),

    ("ofertorio", "subtitulo:SACRIFÍCIO: MISSA DOS FIEIS", dict(voz="alta", postura="pe")),
    ("ofertorio", "subtitulo:Antífona do Ofertório", dict(voz="alta", postura="sentado")),
    ("ofertorio", "rubrica:Agora se prepara a matéria", dict(voz="baixa")),
    ("ofertorio", "subtitulo:Incensação", dict(voz="baixa", quando="incenso", grupo="incensacao")),
    ("ofertorio", "subtitulo:Lavabo", dict(voz="baixa")),
    ("ofertorio", "rubrica:Beija o altar e voltado ao povo", dict(voz="alta", postura="pe")),
    ("ofertorio", "subtitulo:Oração Secreta", dict(voz="baixa")),
    ("ofertorio", "subtitulo:Prefácio", dict(voz="alta")),

    ("canon", "subtitulo:Canon da Missa", dict(voz="baixa", postura="joelhos")),
    ("canon", "rubrica:Os fieis, confiantes", dict(voz="alta")),

    ("comunhao", "subtitulo:Oração dominical", dict(voz="alta", postura="joelhos")),
    ("comunhao", "rubrica:Durante esta oração, o sacerdote fraciona", dict(voz="baixa")),
    ("comunhao", "rubrica:Conclui em voz alta", dict(voz="alta")),
    ("comunhao", "rubrica:Depõe a partícula", dict(voz="baixa")),
    ("comunhao", "rubrica:Aqui se bate no peito a cada invocação", dict(voz="alta")),
    ("comunhao", "bilingue:Dómine Iesu Christe, qui dixísti", dict(voz="baixa")),
    ("comunhao", "rubrica:Então todos fazem a confissão", dict(voz="alta")),
    ("comunhao", "rubrica:Comunhão dos ministros e fieis", dict(voz="baixa")),
    ("comunhao", "subtitulo:Antífona da Comunhão", dict(voz="alta", postura="sentado")),
    ("comunhao", "rubrica:Beija o Altar e volta-se ao povo", dict(voz="alta", postura="pe")),

    ("conclusao", "rubrica:Oscula o Altar e volta-se para o povo", dict(voz="alta", postura="pe")),
    ("conclusao", "bilingue:Ite, missa est", dict(voz="alta", quando="ite")),
    ("conclusao", "rubrica:Nas Missas em que não se diz", dict(voz="alta", quando="benedicamus")),
    ("conclusao", "rubrica:Nas Missas dos Defuntos", dict(voz="alta", quando="requiescant")),
    ("conclusao", "rubrica:O sacerdote, profundamente inclinado", dict(voz="baixa", postura="joelhos")),
    ("conclusao", "rubrica:Depois oscula o Altar", dict(voz="alta")),
    ("conclusao", "subtitulo:ÚLTIMO EVANGELHO", dict(voz="alta", postura="pe")),

    ("leoninas", "subtitulo:ORAÇÕES NO FIM DA MISSA REZADA", dict(voz="alta", postura="joelhos", grupo="leoninas")),
    ("acao-de-gracas", "subtitulo:ORAÇÕES DE AÇÃO DE GRAÇAS", dict(voz="alta", postura="joelhos", grupo="acao-de-gracas")),
]

SECOES_MARCADAS = ("preparacao", "asperges", "pe-altar", "catecumenos", "ofertorio",
                   "canon", "comunhao", "conclusao", "leoninas", "acao-de-gracas")
SECOES_ROTULADAS = SECOES_MARCADAS + ("bencao",)


def emendar(secoes):
    for e in EMENDAS:
        op = e[0]
        if op == "reescrever":
            _, s, ancora, novo = e
            if any(achatado(b) == plano(novo) for b in secoes[s]):
                continue
            secoes[s][achar(secoes[s], ancora, s)]["texto"] = novo
        elif op == "trocar":
            _, s, ancora, de, para = e
            i = achar(secoes[s], ancora, s)
            if para in secoes[s][i]["texto"]:
                continue
            if de not in secoes[s][i]["texto"]:
                raise SystemExit("%s: o trecho %r não está no bloco %r" % (s, de, ancora))
            secoes[s][i]["texto"] = secoes[s][i]["texto"].replace(de, para)
        elif op == "mover":
            _, origem, ancora, destino, depois = e
            if origem != destino and existe(secoes[destino], ancora):
                continue
            if origem == destino and depois == "" and achar(secoes[origem], ancora, origem) == 0:
                continue
            bloco = secoes[origem].pop(achar(secoes[origem], ancora, origem))
            if depois == "":
                secoes[destino].insert(0, bloco)
            elif depois == "fim":
                secoes[destino].append(bloco)
            else:
                secoes[destino].insert(achar(secoes[destino], depois, destino) + 1, bloco)
        elif op == "dividir":
            _, s, ancora, n, ja = e
            if existe(secoes[s], ja):
                continue
            i = achar(secoes[s], ancora, s)
            b = secoes[s][i]
            resto = {"tipo": "bilingue", "latim": b["latim"][n:], "portugues": b["portugues"][n:]}
            b["latim"], b["portugues"] = b["latim"][:n], b["portugues"][:n]
            secoes[s].insert(i + 1, resto)
        elif op == "inserir":
            _, s, depois, bloco = e
            if any(achatado(b) == achatado(bloco) for b in secoes[s]):
                continue
            secoes[s].insert(achar(secoes[s], depois, s) + 1, bloco)
        else:
            raise SystemExit("emenda desconhecida: %r" % (op,))
    rotular(secoes)


def rotular(secoes):
    for s in SECOES_ROTULADAS:
        for b in secoes[s]:
            if b["tipo"] != "bilingue":
                continue
            for lado in ("latim", "portugues"):
                for p in b[lado]:
                    m = ROTULO.match(p["texto"])
                    if not m:
                        continue
                    resto = p["texto"][m.end():]
                    quem = m.group(0).strip()
                    p["texto"] = ("[b]℟. %s[/b]" % resto) if quem[0] in "℟M" else resto

PAUSA = re.compile(r"((?<!T\.P)(?<!T)[,;:.](?:\[/\w+\])*) +(?!—)(?=[^\s—])")

DO_SACERDOTE = re.compile(r"(?=Orémus|Orêmus|Oremos|Oremus)")


def pausar(secoes):
    for s in SECOES_MARCADAS:
        for b in secoes[s]:
            if b["tipo"] != "bilingue":
                continue
            for p in b["latim"]:
                if p["texto"].startswith("[b]℟. "):
                    resto = p["texto"][len("[b]℟. "):]
                    povo, *resto_dele = DO_SACERDOTE.split(resto, maxsplit=1)
                    p["texto"] = "[b]℟. " + PAUSA.sub(r"\1 — ", povo) + "".join(resto_dele)


def marcar(secoes):
    por_secao = {}
    for s, ancora, marca in MOMENTOS:
        por_secao.setdefault(s, []).append((achar(secoes[s], ancora, s), ancora, marca))

    for s, marcas in por_secao.items():
        indices = [i for i, _, _ in marcas]
        if indices != sorted(indices) or len(set(indices)) != len(indices):
            raise SystemExit("%s: as marcas não estão na ordem do impresso" % s)
        if indices[0] != 0:
            raise SystemExit("%s: o primeiro bloco (%r) fica sem marca" % (s, achatado(secoes[s][0])[:40]))

        for n, (inicio, _, marca) in enumerate(marcas):
            fim = marcas[n + 1][0] if n + 1 < len(marcas) else len(secoes[s])
            for k in range(inicio, fim):
                b = secoes[s][k]
                for campo in ("voz", "postura", "quando", "grupo"):
                    b.pop(campo, None)
                for campo in ("voz", "quando", "grupo"):
                    if campo in marca:
                        b[campo] = marca[campo]
                if k == inicio and "postura" in marca:
                    b["postura"] = marca["postura"]


def aplicar(secoes):
    emendar(secoes)
    pausar(secoes)
    marcar(secoes)


def main():
    secoes = {}
    for s in SECOES_ROTULADAS:
        with io.open(os.path.join(PASTA, "%s.json" % s), encoding="utf-8") as f:
            secoes[s] = json.load(f)
    blocos = {s: d["blocos"] for s, d in secoes.items()}
    aplicar(blocos)
    for s, d in secoes.items():
        d["blocos"] = blocos[s]
        with io.open(os.path.join(PASTA, "%s.json" % s), "w", encoding="utf-8") as f:
            json.dump(d, f, ensure_ascii=False, indent=1)
            f.write("\n")
    marcados = sum(1 for d in blocos.values() for b in d if "voz" in b)
    print("momentos: %d blocos marcados em %d seções" % (marcados, len(blocos)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
