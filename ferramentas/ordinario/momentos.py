#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Os momentos do Ordinário: voz, postura do fiel e condição de cada parte.

    python3 ferramentas/ordinario/momentos.py            aplica sobre os JSON gravados

O PDF não diz isto: diz "em voz submissa" e "todos de pé" no meio de rubricas,
e às vezes diz errado. Quem classificou cada momento foi o Perez, na "Revisão
dos momentos da Missa" (nov/2026), e é o que está nas duas tabelas abaixo.

  EMENDAS  corrigem o texto do impresso onde a revisão o contradiz, e mudam
           blocos de lugar. Cada uma procura o bloco pelo começo do texto, e
           para se não o achar: uma remessa nova do PDF que já venha corrigida
           quebra aqui, em vez de passar calada.
  MOMENTOS marcam os blocos. Cada marca vale do bloco em que ancora até a
           marca seguinte da mesma seção.

Idempotente: pode rodar sobre o que já está gravado, e `gerar.py` a chama
antes de gravar, para uma remessa nova do PDF sair já marcada.
"""
import io, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PASTA = os.path.join(RAIZ, "src", "data", "ordinario")

MARCACAO = re.compile(r"\[/?[a-z]+(?::[^\]]*)?\]")


def plano(texto):
    """O texto sem marcação e com o espaço achatado, que é como se compara."""
    return " ".join(MARCACAO.sub("", texto).split())


# Quem fala, no começo do parágrafo: ℣ e S. são do sacerdote, ℟ e M. são da
# resposta. Na tela eles saem (ver `rotular`), e por isso não entram na busca:
# a âncora é a mesma antes e depois, e as emendas continuam idempotentes.
ROTULO = re.compile(r"^(?:℣\.?|℟\.?|S\.|M\.)\s*")


def achatado(bloco):
    """O que o bloco diz, numa linha só, para procurar o começo dele."""
    if bloco["tipo"] == "bilingue":
        partes = [ROTULO.sub("", plano(p.get("texto", ""))) for lado in ("latim", "portugues")
                  for p in bloco[lado]]
        return " | ".join(partes)
    if bloco["tipo"] == "proprio":
        return plano(bloco["nome"])
    return plano(bloco.get("texto", ""))


def achar(blocos, ancora, secao):
    """
    O índice do único bloco que começa por `ancora`.

    `tipo:texto` restringe o tipo — "subtitulo:Glória" não pega o hino que
    começa por "Glória in excélsis". Nenhum ou mais de um para a execução.
    """
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


# --------------------------------------------------------------------- emendas
#
# ("reescrever", seção, âncora, texto novo)        troca o texto inteiro do bloco
# ("trocar", seção, âncora, de, para)              troca um trecho dele
# ("mover", origem, âncora, destino, depois-de)    muda o bloco de lugar
#                                                  (depois-de vazio: no começo)
# ("inserir", seção, depois-de, bloco)             acrescenta um bloco novo
# ("dividir", seção, âncora, n, já-dividido)       parte o bilíngue depois de n parágrafos
#
# As frases novas são as da revisão do Perez, na ordem em que ele as deu.
EMENDAS = [
    # "Tocou a sineta, de pé; quando o padre começar as orações ao pé do altar,
    # se ajoelham e se benzem. E coloca isso antes do Asperges." (rezada e
    # cantada são iguais, e o PDF só dava a rezada.)
    ("reescrever", "asperges", "rubrica:Todos de pé, para a entrada do sacerdote",
     "[i]Toca a sineta e todos se levantam para a entrada do sacerdote com os "
     "ministros. Quando ele começa as orações ao pé do altar, todos se ajoelham "
     "e se benzem ao mesmo tempo que ele. É igual na Missa rezada e na cantada.[/i]"),
    ("mover", "asperges", "rubrica:Toca a sineta", "asperges", ""),

    # A rubrica sobre a aspersão estava na Oração preparatória, e é daqui.
    ("mover", "preparacao", "rubrica:Nos domingos é costume o rito de aspersão",
     "asperges", "subtitulo:ASPERSÃO"),
    ("reescrever", "asperges", "rubrica:Nos domingos é costume o rito de aspersão",
     "[i]Nos domingos é costume o rito de aspersão da água benta sobre o povo. "
     "Esse rito nos rememora nosso Batismo e afasta de nós o maligno. Quando o "
     "padre chega e se ajoelha para entoar o Asperges (ou o Vidi aquam), os fiéis "
     "também se ajoelham, e se levantam quando ele se levanta. Os fiéis se benzem "
     "ao serem aspergidos. O Vidi aquam se diz do Domingo de Páscoa ao Domingo de "
     "Pentecostes; no domingo seguinte, da Santíssima Trindade, volta o Asperges.[/i]"),

    # "O Benedícite é depois das orações ao pé do altar. O PDF tá errado."
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

    # "Tá certo, mas nós não tocamos a sineta aqui, os fiéis se sentam após o Oremus."
    ("reescrever", "ofertorio", "rubrica:Após o toque da sineta, todos se sentam",
     "[i]Após o Oremus, todos se sentam.[/i]"),
    ("inserir", "ofertorio", "subtitulo:Incensação",
     rubrica("Em ambas as Missas os fiéis ficam sentados. Na Missa cantada, "
             "levantam-se para serem incensados.")),
    ("trocar", "ofertorio", "rubrica:O sacerdote purifica os dedos",
     "Nas Missas de Defuntos, se omite o[/i] Gloria Patri[i].",
     "Nas Missas de Defuntos e do Tempo da Paixão, se omite o[/i] Gloria Patri[i]."),
    # "De pé durante todo o Sanctus, benze-se ao Benedictus. Nas cantadas,
    # ajoelham quando o padre terminar o Sanctus."
    ("reescrever", "ofertorio", "rubrica:Confessando a magnificência divina",
     "[i]Confessando a magnificência divina, a Igreja repete a confissão feita "
     "pelos Serafins. Todos ficam de pé durante o Sanctus e se benzem ao Benedictus. "
     "Terminado o Sanctus, os fiéis se ajoelham.[/i]"),

    # "O que vale é ficar de joelhos desde o Te igitur até a Comunhão."
    ("trocar", "canon", "rubrica:O sacrifício já se ofereceu",
     "Terminado o Canon, todos de pé.",
     "Os fiéis permanecem de joelhos até a Comunhão."),

    # "Eu não conheço nenhum lugar que faz isso [a assembleia rezar o Pai-nosso],
    # melhor omitir. De joelhos. Na rezada e na cantada se responde o Sed libera."
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
    # Ite, Missa est, Benedicámus ou Requiéscant: um só, e o calendário diz qual.
    # O diálogo e o Ite vinham num bloco só, e a divisão é o que deixa o Ite
    # sair sozinho nos dias em que não se diz.
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

# -------------------------------------------------------------------- momentos
#
# (seção, âncora, marca). Postura é "pe", "sentado", "joelhos", ou o par
# {rezada, cantada} onde a revisão separa as duas. A voz média do sacerdote
# na Missa rezada conta como alta, "para deixar o fiel mais ambientado". A
# oração preparatória e a ação de graças são do próprio fiel, e não silêncio do
# celebrante: contam como alta, para não sumirem do modo "só voz alta".
RJ = dict(rezada="joelhos", cantada="pe")   # a rezada de joelhos, a cantada de pé

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
# A bênção do Santíssimo não tem voz nem postura marcadas (é fora da Missa), mas
# tem ℣ e ℟ como o resto, e sai rotulada do mesmo jeito.
SECOES_ROTULADAS = SECOES_MARCADAS + ("bencao",)


def emendar(secoes):
    """Aplica as EMENDAS. `secoes` é {id: [blocos]}, alterado no lugar."""
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
    """
    Tira do parágrafo quem fala, e põe a resposta em negrito.

    No impresso o ℣ e o S. marcam o sacerdote e o ℟ e o M. a resposta, porque
    papel não tem outro jeito de dizer quem é quem. No site a resposta vem em
    negrito e o resto é do sacerdote: "Dóminus vobíscum" é dele, "**℟. Et cum
    spíritu tuo**" é de quem responde. O M. do ministro vira ℟., como pediu o
    Perez, e o ℟ já escrito fica, só em negrito.
    """
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


def marcar(secoes):
    """Aplica os MOMENTOS: cada marca vale até a seguinte da mesma seção."""
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
