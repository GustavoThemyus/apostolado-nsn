#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Monta src/data/indulgencias-arquidiocese.json a partir de `dados.py`.

    python3 ferramentas/arquidiocese/gerar.py

O que este arquivo faz que não é transcrever:

- **numera as notas.** No PDF a marca (§, ~, ^, *) vem seguida do texto ali
  mesmo, na própria célula. Aqui ela vira chamada clicável, como no
  Enchiridion, e o texto vai para o mapa de notas do documento. Como a mesma
  marca aparece dezenas de vezes com textos diferentes, cada uma ganha um
  número: §1, §2, ~1... A exceção é o ^ sem texto próprio, que é um só,
  porque o que ele quer dizer está na legenda.
- **constrói a consulta do mapa** a partir do nome da igreja e do endereço.
  O "Clique para conferir a localização" do PDF não tinha destino; aqui ele
  abre as opções de Google Maps e Waze.
- **liga as concessões ao Enchiridion**, que já está publicado com âncora em
  cada uma das 33.
"""
import io, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dados

SAIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..",
                     "src", "data", "indulgencias-arquidiocese.json")

# ------------------------------------------------------------------- notas

notas = {}
contador = {}

# O ^ sem texto próprio: as duas linhas da legenda do documento, juntas.
GENERICAS = {
    "^": "Falta de consenso quanto à data; e, nas festas propriamente "
         "particulares, usar-se-á a data que a paróquia comemora.",
}


def nota(marca, texto):
    """Registra a nota e devolve a chamada pronta para o texto."""
    if texto is None:
        notas.setdefault(marca, GENERICAS[marca])
        return "[nota]%s[/nota]" % marca
    contador[marca] = contador.get(marca, 0) + 1
    chave = "%s%d" % (marca, contador[marca])
    notas[chave] = texto
    return "[nota]%s[/nota]" % chave


def com_marca(texto, marca):
    return texto + " " + nota(*marca) if marca else texto


def concessao(numero, resto):
    """A referência a uma concessão vira elo para a âncora dela."""
    return "[elo:/indulgencias/enchiridion#concessao-%d]Concessão N° %d[/elo]%s" % (
        numero, numero, resto)


# -------------------------------------------------------------- localização

def consulta_de(ig):
    """O que se procura no mapa: o nome da igreja e o endereço dela."""
    nome = re.sub(r"^(Titular|Co-Titular) da ", "", ig["nome"])
    nome = re.sub(r"^[^:]+: ", "", nome)
    endereco = ig["endereco"].replace(" (Paraíba)", " - PB")
    return "%s, %s" % (nome, endereco)


def linha_da_igreja(ig, com_marcador):
    cabeca = ig["nome"]
    if ig.get("forania"):
        cabeca += " (%s)" % ig["forania"]
    if ig.get("ano"):
        cabeca += " (%d)" % ig["ano"]
    if ig.get("marca"):
        cabeca += " " + nota(*ig["marca"])
    if com_marcador:
        cabeca = "• " + cabeca

    if not ig.get("endereco"):
        return cabeca

    consulta = consulta_de(ig)
    assert "]" not in consulta, consulta
    return "%s\n%s\n[mapa:%s]Conferir a localização[/mapa]" % (
        cabeca, ig["endereco"], consulta)


def celula_das_igrejas(linha):
    partes = []
    if linha.get("instituicao"):
        instituicao = linha["instituicao"]
        if linha.get("marca_instituicao"):
            instituicao += " " + nota(*linha["marca_instituicao"])
        partes.append(instituicao)
    varias = len(linha["igrejas"]) > 1
    partes.extend(linha_da_igreja(ig, varias) for ig in linha["igrejas"])
    return "\n\n".join(partes)


def tabela(grupo, coluna_igreja, coluna_festa="Festa Patronal"):
    return {
        "tipo": "tabela",
        "colunas": ["Data", coluna_festa, coluna_igreja],
        "linhas": [
            [l["data"], com_marca(l["festa"], l.get("marca")), celula_das_igrejas(l)]
            for l in grupo
        ],
    }


def p(texto, ident=None):
    bloco = {"tipo": "paragrafo", "texto": texto}
    return dict(id=ident, **bloco) if ident else bloco


def lista(itens, ordenada=False):
    bloco = {"tipo": "lista", "itens": itens}
    if ordenada:
        bloco["ordenada"] = True
    return bloco


def aviso(paragrafos):
    return {"tipo": "nota", "titulo": "Nota", "paragrafos": paragrafos}


# ------------------------------------------------------------------- seções
# A ordem importa: é ela que numera as notas na ordem de leitura.

secoes = []

secoes.append({
    "id": "introducao",
    "titulo": "Introdução",
    "foraDoIndice": True,
    "blocos": [
        p("O presente calendário visa reunir em um único lugar os dias em que é "
          "possível lucrar Indulgências Plenárias por todo o território pertencente "
          "à Arquidiocese da Paraíba, abrangendo os dias dos Santos Titulares de "
          "cada Paróquia criada na presente diocese, bem como a reunião de todos os "
          "Santuários arquidiocesanos, os dias de indulgências da própria Basílica e "
          "os dias festivos de comemoração dos santos Fundadores das diversas Ordens "
          "e Congregações religiosas que atualmente se encontram residentes nesta "
          "arquidiocese."),
        p("A listagem de todas as Paróquias e Foranias da Arquidiocese foi obtida "
          "diretamente no [elo:http://162.241.101.195/~lumenpastoral/anuario/home]"
          "Anuário Digital 2026[/elo] e as festas correspondentes aos Santos "
          "Titulares das referidas paróquias foram obtidos pela pesquisa nos "
          "calendários litúrgicos e pela pesquisa paróquia por paróquia em suas "
          "respectivas mídias sociais. Se encontrar qualquer erro, favor entrar em "
          "contato."),
    ],
})

secoes.append({
    "id": "legenda",
    "titulo": "Legenda",
    "foraDoIndice": True,
    "blocos": [
        p("As marcas do documento acompanham a festa ou a igreja a que se referem. "
          "Toque numa delas para ler a observação do autor."),
        {
            "tipo": "tabela",
            "colunas": ["Marca", "O que quer dizer"],
            "linhas": [
                ["§", "Nota"],
                ["~", "Data diferente no calendário novo"],
                ["^", "Falta de consenso"],
                ["^", "Festas propriamente particulares, usar-se-á a data que a paróquia comemora"],
                ["*", "Festas do calendário novo"],
                ["*", "Santos que foram canonizados posteriormente"],
            ],
        },
    ],
})

secoes.append({
    "id": "observacoes",
    "titulo": "Observações",
    "foraDoIndice": True,
    "blocos": [
        p("Por ser o Apostolado um grupo de fiéis ligados ao Rito Tradicional, assim "
          "como foi dito no [elo:/indulgencias/calendario]Calendário das Indulgências "
          "Universais[/elo], seguimos ordinariamente o calendário tradicional, em "
          "especial associado às rubricas de S. Pio X, portanto todos os dias de "
          "indulgência associados às festas que possuem lugar no calendário do Rito "
          "Tradicional serão representados aqui segundo o calendário tradicional. "
          "Quanto às festas instituídas [i]a posteriori[/i], bem como os títulos que "
          "são próprios e não constam em qualquer calendário, serão atribuídas as "
          "datas popularmente conhecidas."),
        p("Todas as indulgências aqui dispostas têm por obra indulgenciada a cumprir "
          "a visita à referida igreja. Vale, portanto, lembrar as determinações que "
          "regem as disposições para poder lucrar essas indulgências:"),
        lista([
            "[b]A obra prescrita[/b] para alcançar a Indulgência Plenária, quando anexa "
            "à igreja ou oratório, [b]é sempre a visita[/b], não é preciso assistir a "
            "Missa na igreja ou participar de qualquer cerimônia. Na igreja se deve "
            "recitar a oração dominical e o símbolo aos apóstolos (Pai-nosso e Credo), "
            "a não ser caso especial em que se estabeleça outra coisa."
            + nota("§", "ID, n. 16; EI 1999, n. 19."),

            "Para ganhar a indulgência anexa a algum dia, quando de exige a visita à "
            "igreja ou oratório, esta pode fazer-se [b]desde o meio-dia precedente até "
            "a meia-noite do dia determinado.[/b]"
            + nota("§", "CIC 1917, cân. 923; EI 1999, n. 14."),

            "A indulgência anexa à visita à igreja ainda pode ser lucrada mesmo se o "
            "edifício se demolir completamente e seja reconstruído dentro de cinquenta "
            "anos no mesmo lugar ou em local bem próximo, desde que conserve o mesmo "
            "título."
            + nota("§", "EI 1999, n. 16, §1."),
        ], ordenada=True),
        p("Além disso, convém de início relembrar quais são as condições ordinárias "
          "que sempre são exigidas para obter qualquer Indulgência Plenária:"),
        lista([
            "Confessar-se sacramentalmente em um período de até 14 dias (uma única "
            "confissão pode lucrar diversas Indulgências Plenárias)."
            + nota("§", "EI 1999, n. 20."),

            "Receber a comunhão em um período de até 8 dias (cada comunhão pode lucrar "
            "uma Indulgência Plenária, somente. Precisando comungar novamente para "
            "lucrar outra Indulgência)."
            + nota("§", "EI 1999, n. 20."),

            "Rezar nas intenções do Sumo Pontífice"
            + nota("§",
                   "(cada Indulgência Plenária requer uma oração nas intenções do Papa, "
                   "preferencialmente se fazem no mesmo dia da obra).\n\n"
                   "Rezar nas intenções do Papa não é rezar pela pessoa do Papa, mas "
                   "trata-se de intenções predefinidas em prol da Igreja e da Fé (por "
                   "exemplo: a exaltação da Santa Igreja, a propagação da Fé, a "
                   "extirpação das heresias, a conversão dos pecadores, etc). Essas "
                   "orações são livres, podendo-se rezar diversas orações, mas bastam um "
                   "Pai-nosso e Ave-Maria.\n\nEI 1999, n. 20."),

            "Ter o profundo desapego de todo pecado, mesmo venial."
            + nota("§", "EI 1999, n. 20."),

            "Cumprir a obra indulgenciada prescrita (visitar uma igreja, um cemitério, "
            "cantar o [lat]Veni Creator[/lat], etc)."
            + nota("§", "EI 1999, n. 20."),
        ], ordenada=True),
        p("Segundo a normativa geral da nova disciplina para as indulgências, convém "
          "também relembrar que para lucrar Indulgência Plenária é necessário ser "
          "batizado e não estar impedido canonicamente pela excomunhão ou pena "
          "análoga, bem como lembramos que só se pode obter uma Indulgência Plenária "
          "por dia, exceto [lat]in articulo mortis[/lat]."),
    ],
})

secoes.append({
    "id": "paroquias",
    "titulo": "Paróquias",
    "blocos": [
        p("A nossa Arquidiocese possui 93 Paróquias que se dividem em 9 Foranias e "
          "abrangem 38 municípios. A seguir, o calendário apresenta a respectiva "
          "Paróquia, seguida por sua Forania e o ano de criação da mesma. Dispor-se-á "
          "o endereço por escrito das paróquias e a respectiva localização."),
        p("É possível lucrar Indulgências na Igreja Paroquial nas seguintes "
          "circunstâncias:"),
        lista([
            "Ao visitar a igreja no dia de seu Titular"
            + nota("§", concessao(33, ", §1, 5°, a) do Enchiridion Indulgentiarum.")),
            "No dia 02 de Agosto para a Indulgência da Porciúncula"
            + nota("§", concessao(33, ", §1, 5°, b) do Enchiridion Indulgentiarum.")),
        ]),
        aviso(["Para todos os casos, cumpre-se visitando somente a IGREJA PAROQUIAL e "
               "não qualquer outra igreja ou capela dependente da Paróquia e lá se deve "
               "recitar o Pai-nosso e o Credo, além de cumprir as condições ordinárias."]),
        tabela(dados.PAROQUIAS, "Paróquia"),
    ],
})

secoes.append({
    "id": "santuarios",
    "titulo": "Santuários",
    "blocos": [
        p("Além das paróquias supra listadas, existem ainda 9 santuários erigidos "
          "pela autoridade diocesana, alguns dos quais são também paróquias e já "
          "foram citadas anteriormente."),
        p("É possível lucrar Indulgências nos Santuários nas seguintes "
          "circunstâncias:"),
        lista([
            "Ao visitar a igreja no dia de seu Titular"
            + nota("§", concessao(33, ", §1, 4°, a) do Enchiridion Indulgentiarum.")),
            "Em algum dos dias do ano, à escolha do fiel, mediante visita"
            + nota("§", concessao(33, ", §1, 4°, b) do Enchiridion Indulgentiarum.")),
            "Todas as vezes que, junto a um grupo, fizer peregrinação ao Santuário"
            + nota("§", concessao(33, ", §1, 4°, c) do Enchiridion Indulgentiarum.")),
        ]),
        aviso(["Para todos os casos, se deve recitar no Santuário o Pai-nosso e o "
               "Credo, além de cumprir as condições ordinárias."]),
        tabela(dados.SANTUARIOS, "Santuário", coluna_festa="Titular"),
    ],
})

secoes.append({
    "id": "basilica",
    "titulo": "Basílica",
    "blocos": [
        p("A nossa Catedral, além de Catedral e Paróquia, é também Basílica Menor."),
        p("É possível lucrar Indulgências na Catedral arquidiocesana nas seguintes "
          "circunstâncias:"),
        lista([
            "Ao visitar a igreja no dia de seu Titular"
            + nota("§", "%s e %s" % (
                concessao(33, ", §1, 2°, b)"),
                concessao(33, ", §1, 3°, b) do Enchiridion Indulgentiarum."))),

            "Na festa de São Pedro e São Paulo em 29 de Junho"
            + nota("§", "%s e %s" % (
                concessao(33, ", §1, 2°, a)"),
                concessao(33, ", §1, 3°, a) do Enchiridion Indulgentiarum."))),

            "Nos dias da Cátedra de São Pedro em 18 de Janeiro e 22 de Fevereiro"
            + nota("§", concessao(33, ", §1, 3°, c) do Enchiridion Indulgentiarum.")),

            "Na festa da Dedicação de São Salvador (São João de Latrão) em 09 de Novembro"
            + nota("§", concessao(33, ", §1, 3°, d) do Enchiridion Indulgentiarum.")),

            "No dia 02 de Agosto para a Indulgência da Porciúncula"
            + nota("§", "%s e %s" % (
                concessao(33, ", §1, 2°, c)"),
                concessao(33, ", §1, 3°, e) do Enchiridion Indulgentiarum."))),

            "Em algum dos dias do ano, à escolha do fiel, mediante visita"
            + nota("§", concessao(33, ", §1, 2°, d) do Enchiridion Indulgentiarum.")),
        ]),
        aviso(["Para todos os casos, se deve recitar na Catedral Basílica o Pai-nosso "
               "e o Credo, além de cumprir as condições ordinárias."]),
        tabela(dados.BASILICA, "Basílica", coluna_festa="Titular"),
    ],
})

secoes.append({
    "id": "ordens",
    "titulo": "Ordens Religiosas",
    "blocos": [
        p("A Arquidiocese abriga dezenas de Ordens, Institutos e Congregações "
          "religiosas."),
        p("É possível lucrar Indulgências nas casas/igrejas religiosas na seguinte "
          "circunstância:"),
        lista([
            "Na visita das igrejas ou oratórios desses Institutos de vida consagrada "
            "ou Sociedades de vida apostólica no dia dedicado ao seu Fundador"
            + nota("§", concessao(33, ", §1, 7° do Enchiridion Indulgentiarum.")),
        ]),
        aviso(["No caso, se deve recitar na igreja o Pai-nosso e o Credo, além de "
               "cumprir as condições ordinárias."]),
        tabela(dados.ORDENS, "Instituição / Paróquia Relacionada",
               coluna_festa="Festa Litúrgica / Santo Fundador"),
    ],
})

secoes.append({
    "id": "conclusao",
    "titulo": "Conclusão",
    "foraDoIndice": True,
    "blocos": [
        p("É sabido que a quantidade de indulgências foi drasticamente reduzida por "
          "Paulo VI em 1967, deixando os fiéis em sua maioria desassistidos dessa "
          "grande e inestimável graça, que a Igreja sempre se preocupou em explicar e "
          "instigar ardentemente seus filhos a terem a mais alta estima às "
          "indulgências."),
        p("Contudo, por mais que sejam poucas as indulgências anuais (pouco mais que "
          "10 indulgências), podemos ajuntar as festividades locais para agregar ao "
          "nosso calendário para poder lucrar mais e mais indulgências para satisfazer "
          "os males que produzimos com nossos pecados, bem como excitar a caridade e "
          "aplicar esses benefícios para alguma alma do purgatório."),
        p("Esperamos pois, que assim possamos ter cada vez mais apreço a essas graças, "
          "que isto nos excite s contrição dos nossos pecados e s perseverança na "
          "graça de Deus, além do benefício de poder conhecer novas igrejas e rezar "
          "nelas, que comunica também nosso vínculo com a nossa Arquidiocese."),
    ],
})

# ------------------------------------------------------------------ gravação

documento = {
    "titulo": "Calendário de Indulgências Arquidiocesano",
    "descricao": "Os dias em que se pode lucrar indulgência plenária visitando uma "
                 "igreja da Arquidiocese da Paraíba: paróquias, santuários, a Basílica "
                 "e as casas religiosas.",
    "notas": notas,
    "secoes": secoes,
}

# Um id estável por bloco, para o painel saber o que mudou.
for secao in secoes:
    for n, bloco in enumerate(secao["blocos"], 1):
        bloco.setdefault("id", "%s-%03d" % (secao["id"], n))

with io.open(SAIDA, "w", encoding="utf-8") as f:
    json.dump(documento, f, ensure_ascii=False, indent=2)
    f.write("\n")

igrejas = sum(len(l["igrejas"]) for g in (dados.PAROQUIAS, dados.SANTUARIOS,
                                          dados.BASILICA, dados.ORDENS) for l in g)
print("seções: %d | linhas de tabela: %d | igrejas: %d | notas: %d" % (
    len(secoes),
    sum(len(g) for g in (dados.PAROQUIAS, dados.SANTUARIOS, dados.BASILICA, dados.ORDENS)),
    igrejas, len(notas)))
print("gravado em", os.path.normpath(SAIDA))
