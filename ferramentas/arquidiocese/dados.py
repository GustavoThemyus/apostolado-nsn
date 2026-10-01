# -*- coding: utf-8 -*-
"""
A transcrição do PDF "Tabela Calendário de Indulgências Arquidiocesano",
do Perez, em forma revisável.

Só dados. Quem monta o JSON do site é `gerar.py`, que numera as notas e
constrói as consultas de mapa a partir do nome e do endereço.

As marcas seguem a legenda do próprio documento:

    §   nota do autor          ~   data diferente no calendário novo
    ^   falta de consenso      *   festa nova, ou canonização posterior

`marca=("~", "texto")` põe a marca no nome da festa e guarda o texto como
nota. `marca=("^", None)` é a marca sem texto próprio: vale a legenda.
"""

# --------------------------------------------------------------- 1. Paróquias

def igreja(nome, endereco=None, forania=None, ano=None, marca=None):
    return dict(nome=nome, endereco=endereco, forania=forania, ano=ano, marca=marca)


PAROQUIAS = [
    dict(
        data="Domingo dentro da Oitava da Epifania",
        festa="Sagrada família de Jesus, Maria e José",
        marca=("~", "No Calendário pós-Conciliar a festa mudou a data para o Domingo dentro da Oitava do Natal"),
        igrejas=[
            igreja("Jesus, Maria e José em São José dos Ramos", "Praça Noé Rodrigues de Lima, s/n, Centro - São José Dos Ramos (Paraíba), 58339-000", "Forania Agreste", 2012),
            igreja("Sagrada Família em João Pessoa", "Rua Vitaliano Barbosa de Albuquerque, s/n, Mangabeira - João Pessoa (Paraíba), 58057-322", "Forania Conjuntos", 2021),
        ],
    ),
    dict(
        data="15 de Janeiro",
        festa="Maria Virgem Mãe dos Pobres",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Virgem Mãe dos Pobres em João Pessoa", "Rua Compositor Rosil Cavalcanti, 130, Oitizeiro - João Pessoa (Paraíba), 58088-000", "Forania Urbana Sul", 1997),
        ],
    ),
    dict(
        data="20 de Janeiro",
        festa="São Sebastião",
        igrejas=[
            igreja("Titular da Paróquia São Sebastião em Bayeux", "Av. da Liberdade, 2799, Sesi - Bayeux (Paraíba), 58306-000", "Forania Urbana Sul", 1960),
            igreja("Co-Titular da Paróquia Nossa Senhora da Soledade e São Sebastião em Juripiranga", "Av. Brasil, s/n, Centro - Juripiranga (Paraíba), 58330-000", "Forania Agreste", 2007),
        ],
    ),
    dict(
        data="30 de Janeiro",
        festa="Sagrado Coração de Jesus Menino",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Sagrado Coração de Jesus Menino em Lucena", "Rua Américo Falcão, 998, Centro - Lucena (Paraíba), 58315-000", "Forania Várzea", 2000),
        ],
    ),
    dict(
        data="02 de Fevereiro",
        festa="Nossa Senhora da Penha",
        marca=("^", "É uma data que sempre foi diferente nas diversas localidades onde se celebra Nossa Senhora da Penha, mesmo no Calendário Tradicional local. Pode-se variar desde essa data, 1 de Setembro, 8 de Setembro, algum domingo de Outubro, Novembro, entre outras datas. A presente paróquia celebra em 2 de Fevereiro, recomendo se ater a esse dia."),
        igrejas=[
            igreja("Paróquia Nossa Senhora da Penha de França em Pitimbu", "Largo da Matriz, s/n, Centro - Pitimbu (Paraíba), 58324-000", "Forania Litoral", 1765),
        ],
    ),
    dict(
        data="11 de Fevereiro",
        festa="Nossa Senhora de Lourdes",
        igrejas=[
            igreja("Paróquia Nossa Senhora de Lourdes em João Pessoa", "Avenida João Machado, 51, Centro - João Pessoa (Paraíba), 58013-520", "Forania Centro", 1913),
        ],
    ),
    dict(
        data="19 de Março",
        festa="São José, Esposo de Nossa Senhora",
        igrejas=[
            igreja("Paróquia São José em João Pessoa", "Rua Rosa Paula Barbosa, 460, José Américo De Almeida - João Pessoa (Paraíba), 58073-370", "Forania Conjuntos", 2004),
        ],
    ),
    dict(
        data="Domingo de Páscoa",
        festa="Jesus Ressuscitado",
        igrejas=[
            igreja("Paróquia Jesus Ressuscitado em João Pessoa", "Rua dos Eucalíptos, 100, Anatólia - João Pessoa (Paraíba), 58052-060", "Forania Praia Sul", 2002),
        ],
    ),
    dict(
        data="01 de Maio",
        festa="São José Operário",
        marca=("*", "Festa instituída por Pio XII em 1955"),
        igrejas=[
            igreja("Paróquia São José Operário em João Pessoa", "Avenida Cruz das Armas, s/n, Cruz Das Armas - João Pessoa (Paraíba), 58085-000", "Forania Urbana Sul", 1959),
        ],
    ),
    dict(
        data="13 de Maio",
        festa="Nossa Senhora Mãe dos Homens",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Santuário Mãe dos Homens em João Pessoa", "Rua Monsenhor Walfredo Leal, 41, Tambiá - João Pessoa (Paraíba), 58020-540", "Forania Centro", 2019),
        ],
    ),
    dict(
        data="13 de Maio",
        festa="Nossa Senhora de Fátima",
        igrejas=[
            igreja("Nossa Senhora de Fátima em João Pessoa", "Rua Nevinha Cavalcanti, s/n, Miramar - João Pessoa (Paraíba), 58043-000", "Forania Praia Sul", 1961,
                   marca=("§", "Nota: Esta paróquia também comemora a festa em 13 de Outubro")),
            igreja("Nossa Senhora de Fátima em Pedro Régis", "Av. Senador Ruy Carneiro, 188, Centro - Pedro Régis (Paraíba), 58273-000", "Forania Vale do Mamanguape", 2010,
                   marca=("§", "Nota: Esta paróquia também comemora a festa em 13 de Novembro")),
            igreja("Co-Titular da Paróquia Nossa Senhora de Fátima e São João Batista em Riachão do Poço", "Rua João Ferreira Alves, s/n, Centro - Riachão Do Poço (Paraíba), 58348-000", "Forania Várzea", 2013),
        ],
    ),
    dict(
        data="18 de Maio",
        festa="São Félix de Cantalice",
        igrejas=[
            igreja("Paróquia São Félix de Cantalice em Salgado de São Félix", "Rua Francelina Paz de Araújo, s/n, Centro - Salgado De São Félix (Paraíba), 58370-000", "Forania Agreste", 2002),
        ],
    ),
    dict(
        data="22 de Maio",
        festa="Santa Júlia",
        igrejas=[
            igreja("Paróquia Santa Júlia em João Pessoa", "Avenida Júlia Freire, s/n, Torre - João Pessoa (Paraíba), 58040-040", "Forania Centro", 1953),
        ],
    ),
    dict(
        data="22 de Maio",
        festa="Santa Rita de Cássia",
        igrejas=[
            igreja("Santuário Santa Rita em Santa Rita", "Praça Getúlio Vargas, 129, Centro - Santa Rita (Paraíba), 58300-130", "Forania Várzea", 1839),
            igreja("Santa Rita em Rio Tinto", "Praça João Pessoa, 15, Centro - Rio Tinto (Paraíba), 58297-000", "Forania Vale do Mamanguape", 1994),
        ],
    ),
    dict(
        data="24 de Maio",
        festa="Nossa Senhora Auxiliadora",
        igrejas=[
            igreja("Paróquia Nossa Senhora Auxiliadora em João Pessoa", "Rua Valdemar Chianca, 330, Jardim Oceania - João Pessoa (Paraíba), 58037-255", "Forania Praia Norte", 1994),
        ],
    ),
    dict(
        data="Domingo de Pentecostes",
        festa="Divino Espírito Santo",
        igrejas=[
            igreja("Paróquia Divino Espírito Santo em Cruz do Espírito Santo", "Rua Pe. Herculano, 6, Centro - Cruz Do Espírito Santo (Paraíba), 58337-000", "Forania Várzea", 1904),
        ],
    ),
    dict(
        data="Segunda-feira após Pentecostes",
        festa="Maria Mãe da Igreja",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Maria Mãe da Igreja em João Pessoa", "Rua Maria José Miranda do Amaral, 344, Jardim Veneza - João Pessoa (Paraíba), 58084-160", "Forania Urbana Sul", 2021),
        ],
    ),
    dict(
        data="Domingo após Pentecostes",
        festa="Santíssima Trindade",
        igrejas=[
            igreja("Paróquia Santíssima Trindade em João Pessoa", "Rua Inspetora Emília Mendonça Gomes, 240, Valentina De Figueiredo - João Pessoa (Paraíba), 58064-360", "Forania Conjuntos", 1994),
        ],
    ),
    dict(
        data="Primeiro Domingo de Junho",
        festa="Menino Jesus de Praga",
        marca=("^", "A presente festa possui como data mundial o primeiro Domingo de Junho, mas em diversas localidades pode assumir outras datas, como o Natal do Senhor e demais datas no final de Dezembro e início de Janeiro. Aparentemente a Paróquia não comemora a festa do Titular, então optamos pela data mundialmente associada"),
        igrejas=[
            igreja("Paróquia Menino Jesus de Praga em João Pessoa", "Rua Venâncio José Neto, s/n, Bancários - João Pessoa (Paraíba), 58051-140", "Forania Praia Sul", 1994),
        ],
    ),
    dict(
        data="13 de Junho",
        festa="Santo Antônio de Pádua",
        igrejas=[
            igreja("Santo Antônio de Pádua em João Pessoa", "Rua Maria das Graças Oliveira Cartaxo, s/n, Geisel - João Pessoa (Paraíba), 58075-332", "Forania Conjuntos", 1994),
            igreja("Santo Antônio de Lisboa em João Pessoa", "Avenida Olinda, s/n, Tambaú - João Pessoa (Paraíba), 58039-120", "Forania Praia Sul", 2001),
            igreja("Santo Antônio em Itatuba", "Praça Andrade Lima, s/n, Centro - Itatuba (Paraíba), 58378-000", "Forania Agreste", 2002),
            igreja("Santo Antônio de Pádua em Alhandra", "Rua Silvino Bezerra de Lima, s/n, Mata Redonda (Zona Urbana) - Alhandra (Paraíba), 58320-000", "Forania Litoral", 2008),
            igreja("Santo Antônio em Santa Rita", "Rua Doutor Francisco Retumba, s/n, Marcos Moura - Santa Rita (Paraíba), 58302-485", "Forania Várzea", 2009),
            igreja("Santo Antônio do Menino Deus em João Pessoa", "Rua Rejane Freire Correia, 2015, Jardim Cidade Universitária - João Pessoa (Paraíba), 58052-197", "Forania Praia Sul", 2010),
        ],
    ),
    dict(
        data="24 de Junho",
        festa="São João Batista",
        igrejas=[
            igreja("São João Batista em João Pessoa", "Rua Jornalista José Ramalho, s/n, Costa E Silva - João Pessoa (Paraíba), 58081-110", "Forania Conjuntos", 1994),
            igreja("São João Batista em Itapororoca", "Rua São João, s/n, Centro - Itapororoca (Paraíba), 58275-000", "Forania Vale do Mamanguape", 1998),
            igreja("São João Batista em Bayeux", "Rua Júlio César, 150, Conjunto Mário Andreazza - Bayeux (Paraíba), 58309-700", "Forania Urbana Sul", 2006),
            igreja("São João Batista no Conde", "Rua Ilza Ribeiro, s/n, Jacumã - Conde (Paraíba), 58322-000", "Forania Litoral", 2008),
            igreja("Co-Titular da Paróquia Nossa Senhora de Fátima e São João Batista em Riachão do Poço", "Rua João Ferreira Alves, s/n, Centro - Riachão Do Poço (Paraíba), 58348-000", "Forania Várzea", 2013),
        ],
    ),
    dict(
        data="27 de Junho",
        festa="Nossa Senhora do Perpétuo Socorro",
        igrejas=[
            igreja("Paróquia Nossa Senhora do Perpétuo Socorro em João Pessoa", "Rua Emílio de Araújo Chaves, s/n, Altiplano Cabo Branco - João Pessoa (Paraíba), 58046-150", "Forania Praia Sul", 2006),
        ],
    ),
    dict(
        data="29 de Junho",
        festa="São Pedro e São Paulo",
        igrejas=[
            igreja("São Pedro e São Paulo em Mamanguape", "Praça Padre João, 32, Centro - Mamanguape (Paraíba), 58280-000", "Forania Vale do Mamanguape", 1630),
            igreja("São Pedro em Serra Redonda", "Rua Pedro de Azevedo Cruz, 94, Centro - Serra Redonda (Paraíba), 58385-000", "Forania Agreste", 1971),
            igreja("São Pedro e São Paulo em Santa Rita", "Rua Patos, s/n, Municípios - Santa Rita (Paraíba), 58302-290", "Forania Várzea", 1995),
            igreja("São Pedro e São Paulo em João Pessoa", "Rua Newton Timóteo de Souza, 25, Brisamar - João Pessoa (Paraíba), 58033-510", "Forania Praia Norte", 1998),
            igreja("São Pedro Pescador em João Pessoa", "Avenida Maria Rosa, 1124, Manaíra - João Pessoa (Paraíba), 58038-460", "Forania Praia Norte", 2001),
            igreja("São Pedro Apóstolo em Bayeux", "Rua Daura Saraiva, 559, Jardim Aeroporto - Bayeux (Paraíba), 58308-130", "Forania Urbana Sul", 2007),
        ],
    ),
    dict(
        data="Sexta após a Oitava de Corpus Christi",
        festa="Sagrado Coração de Jesus",
        igrejas=[
            igreja("Sagrado Coração de Jesus em Cabedelo", "Rua Aderbal Piragibe, 05, Centro - Cabedelo (Paraíba), 58100-110", "Forania Praia Norte", 1951),
            igreja("Sagrado Coração de Jesus em João Pessoa", "Rua Celerina Paiva, s/n, Mandacaru - João Pessoa (Paraíba), 58027-390", "Forania Centro", 1992),
            igreja("Sagrado Coração de Jesus em Santa Rita", "Praça Antônio Ribeiro Pessoa, s/n, Popular - Santa Rita (Paraíba), 58301-460", "Forania Várzea", 2007,
                   marca=("§", "Nota: Essa paróquia comemora o titular em um domingo na metade do mês de Agosto ou de Setembro")),
            igreja("Sagrado Coração de Jesus em Bayeux", "Rua Engenheiro de Carvalho, 192, Centro - Bayeux (Paraíba), 58307-150", "Forania Urbana Sul", 2009),
        ],
    ),
    dict(
        data="16 de Julho",
        festa="Nossa Senhora do Carmo",
        igrejas=[
            igreja("Paróquia Nossa Senhora do Carmo em Mamanguape", "Praça Augusto Nemésio de Meireles, s/n, Centro - Mamanguape (Paraíba), 58280-000", "Forania Vale do Mamanguape", 2012),
        ],
    ),
    dict(
        data="26 de Julho",
        festa="Santa Ana Mãe de Nossa Senhora",
        marca=("~", "No Calendário pós-Conciliar a festa se celebra juntamente com São Joaquim"),
        igrejas=[
            igreja("Titular da Paróquia Sant'Anna em João Pessoa", "Rua José Lúcio dos Santos, s/n, Funcionários - João Pessoa (Paraíba), 58078-220", "Forania Conjuntos", 2002),
            igreja("Co-Titular da Paróquia Sant'Anna e São Joaquim em João Pessoa", "Rua Adália Suassuna Barreto, s/n, Pedro Gondim - João Pessoa (Paraíba), 58031-112", "Forania Centro", 2010),
        ],
    ),
    dict(
        data="31 de Julho",
        festa="Santo Inácio de Loyola",
        igrejas=[
            igreja("Paróquia Santo Inácio de Loyola", "Rua João de Brito Lima Moura, s/n, Alto Do Céu - João Pessoa (Paraíba), 58027-695", "Forania Centro", 2021),
        ],
    ),
    dict(
        data="02 de Agosto",
        festa="Nossa Senhora dos Anjos",
        igrejas=[
            igreja("Paróquia Nossa Senhora dos Anjos em São Miguel de Taipú", "Praça Elias Cavalcante, 23, Centro - São Miguel De Taipu (Paraíba), 58334-000", "Forania Agreste", 1745),
        ],
    ),
    dict(
        data="05 de Agosto",
        festa="Nossa Senhora das Neves",
        igrejas=[
            igreja("Paróquia Nossa Senhora das Neves em João Pessoa", "Praça Dom Ulrico, s/n, Centro - João Pessoa (Paraíba), 58010-740", "Forania Centro", 1586),
        ],
    ),
    dict(
        data="12 de Agosto",
        festa="Santa Clara",
        marca=("~", "No Calendário pós-Conciliar a festa mudou a data para 11 de Agosto"),
        igrejas=[
            igreja("Paróquia Santa Clara em João Pessoa", "Rua Luiz de França Pereira, s/n, Alto Do Mateus - João Pessoa (Paraíba), 58090-580", "Forania Urbana Sul", 2004),
        ],
    ),
    dict(
        data="15 de Agosto",
        festa="Assunção de Nossa Senhora",
        igrejas=[
            igreja("Nossa Senhora da Assunção em Alhandra", "Rua Nossa Senhora da Assunção, 66, Centro - Alhandra (Paraíba), 58320-000", "Forania Litoral", 1758),
            igreja("Nossa Senhora da Assunção em João Pessoa", "Rua Frei Antônio Gonçalves, s/n, Funcionários - João Pessoa (Paraíba), 58079-300", "Forania Conjuntos", 2012,
                   marca=("§", "Nota: Nesta Paróquia celebra-se no Domingo mais próximo ao dia 22 de Agosto")),
            igreja("Nossa Senhora da Assunção em Cabedelo", "Rua Santa Luzia, 69, Renascer - Cabedelo (Paraíba), 58108-288", "Forania Praia Norte", 2014),
        ],
    ),
    dict(
        data="16 de Agosto",
        festa="São Joaquim Pai de Nossa Senhora",
        marca=("~", "No Calendário pós-Conciliar a festa mudou a data para 26 de Julho, juntamente com Santa Ana"),
        igrejas=[
            igreja("Co-Titular da Paróquia Sant'Anna e São Joaquim em João Pessoa", "Rua Adália Suassuna Barreto, s/n, Pedro Gondim - João Pessoa (Paraíba), 58031-112", "Forania Centro", 2010),
        ],
    ),
    dict(
        data="08 de Setembro",
        festa="Nossa Senhora de Nazaré",
        igrejas=[
            igreja("Paróquia de Nossa Senhora de Nazaré em Cabedelo", "Rua Carolino Cardoso, 15, Poço - Cabedelo (Paraíba), 58101-502", "Forania Praia Norte", 2018,
                   marca=("§", "Nota: Há também outra paróquia na Arquidiocese com a mesma titular, mas celebra-se em 15 de Outubro")),
        ],
    ),
    dict(
        data="08 de Setembro",
        festa="Nossa Senhora do Livramento",
        igrejas=[
            igreja("Paróquia Nossa Senhora do Livramento em Santa Rita", "Rua São José, s/n, Nossa Senhora Do Livramento - Santa Rita (Paraíba), 58304-000", "Forania Várzea", 1813),
        ],
    ),
    dict(
        data="15 de Setembro",
        festa="Nossa Senhora das Dores",
        igrejas=[
            igreja("Nossa Senhora das Dores em Mogeiro", "Praça Otaviano Joaquim da Silveira, s/n, Centro - Mogeiro (Paraíba), 58375-000", "Forania Agreste", 1874),
            igreja("Nossa Senhora das Dores em João Pessoa", "Avenida Coronel Calixto, s/n, Mangabeira - João Pessoa (Paraíba), 58059-000", "Forania Conjuntos", 2009),
            igreja("Co-Titular da Paróquia São Miguel Arcanjo e Nossa Senhora das Dores em Curral de Cima", "Rua Antônio Fernandes, 189, Centro - Curral De Cima (Paraíba), 58291-000", "Forania Vale do Mamanguape", 2012),
        ],
    ),
    dict(
        data="15 de Setembro",
        festa="Maria Mãe do Redentor",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Mãe do Redentor em João Pessoa", "Rua dos Milagres, 2520, Cristo Redentor - João Pessoa (Paraíba), 58071-260", "Forania Urbana Sul", 2002),
        ],
    ),
    dict(
        data="15 de Setembro",
        festa="Nossa Senhora da Soledade",
        marca=("^", None),
        igrejas=[
            igreja("Co-Titular da Paróquia Nossa Senhora da Soledade e São Sebastião em Juripiranga", "Av. Brasil, s/n, Centro - Juripiranga (Paraíba), 58330-000", "Forania Agreste", 2007),
        ],
    ),
    dict(
        data="29 de Setembro",
        festa="São Miguel Arcanjo",
        igrejas=[
            igreja("São Miguel em Baía da Traição", "Rua Dom Pedro II, s/n, Centro - Baía Da Traição (Paraíba), 58295-000", "Forania Vale do Mamanguape", 1762),
            igreja("São Miguel Arcanjo em João Pessoa", "Rua Renato de Souza Maciel, 335, Bessa - João Pessoa (Paraíba) 58035-150", "Forania Praia Norte", 2002),
            igreja("Co-Titular da Paróquia São Miguel Arcanjo e Nossa Senhora das Dores em Curral de Cima", "Rua Antônio Fernandes, 189, Centro - Curral De Cima (Paraíba), 58291-000", "Forania Vale do Mamanguape", 2012),
        ],
    ),
    dict(
        data="03 de Outubro",
        festa="Santa Teresinha do Menino Jesus",
        marca=("~", "No Calendário pós-Conciliar a festa mudou a data para 01 de Outubro"),
        igrejas=[
            igreja("Santa Teresinha", "Rua Carlos Pessoa, s/n, Roger - João Pessoa (Paraíba), 58020-050", "Forania Centro", 1962),
            igreja("Santa Teresinha em Sapé", "Rua Lauro da Silva Torres, s/n, Centro - Sapé (Paraíba), 58340-000", "Forania Várzea", 2007),
        ],
    ),
    dict(
        data="04 de Outubro",
        festa="São Francisco de Assis",
        igrejas=[
            igreja("São Francisco de Assis em João Pessoa", "Rua da Importação, s/n, Indústrias - João Pessoa (Paraíba), 58083-100", "Forania Urbana Sul", 1983),
            igreja("São Francisco das Chagas em João Pessoa", "Avenida Dois de Fevereiro, 546, Varjão - João Pessoa (Paraíba), 58070-000", "Forania Urbana Sul", 1999),
            igreja("São Francisco de Assis em João Pessoa", "Rua Renato Gomes de Oliveira, s/n, Mangabeira - João Pessoa (Paraíba), 58058-232", "Forania Conjuntos", 2002),
            igreja("São Francisco de Assis em João Pessoa", "Rua Joaquim Borba Filho, 413, Jardim São Paulo - João Pessoa (Paraíba), 58053-110", "Forania Praia Sul", 2013),
        ],
    ),
    dict(
        data="07 de Outubro",
        festa="Nossa Senhora do Rosário",
        igrejas=[
            igreja("Paróquia Nossa Senhora do Rosário em João Pessoa", "Rua Frei Martinho, s/n, Jaguaribe - João Pessoa (Paraíba), 58015-100", "Forania Centro", 1929),
        ],
    ),
    dict(
        data="11 de Outubro",
        festa="Maternidade de Nossa Senhora",
        marca=("~", "No Calendário pós-Conciliar a festa mudou o nome para “Solenidade de Santa Maria Mãe de Deus” e foi fixada em 1 de Janeiro"),
        igrejas=[
            igreja("Paróquia Maria Mãe de Deus em Cabedelo", "Rua Golfo de Aden, s/n, Intermares - Cabedelo (Paraíba), 58102-023", "Forania Praia Norte", 2000,
                   marca=("§", "Nota: A Paróquia celebra sua Festa Patronal no dia 31 de Maio.")),
        ],
    ),
    dict(
        data="12 de Outubro",
        festa="Nossa Senhora Aparecida",
        igrejas=[
            igreja("Nossa Senhora Aparecida em João Pessoa", "Rua Carteiro Francisco Marques, s/n, Treze De Maio - João Pessoa (Paraíba), 58025-160", "Forania Centro", 1997),
            igreja("Nossa Senhora Aparecida em João Pessoa", "Rua Horácio Trajano de Oliveira, 630, Cristo Redentor - João Pessoa (Paraíba), 58070-450", "Forania Urbana Sul", 2006),
            igreja("Nossa Senhora da Conceição Aparecida em João Pessoa", "Rua Prefeito Severino Alves da Silveira, s/n, Gramame - João Pessoa (Paraíba), 58069-015", "Forania Conjuntos", 2010),
            igreja("Nossa Senhora da Conceição Aparecida em João Pessoa", "Rua Mariângela Lucena Peixoto, s/n, Valentina De Figueiredo - João Pessoa (Paraíba), 58063-300", "Forania Conjuntos", 2012),
        ],
    ),
    dict(
        data="12 de Outubro",
        festa="Nossa Senhora do Pilar",
        igrejas=[
            igreja("Paróquia Nossa Senhora do Pilar em Pilar", "Praça João José Maroja, s/n, Centro - Pilar (Paraíba), 58338-000", "Forania Agreste", 1765),
        ],
    ),
    dict(
        data="15 de Outubro",
        festa="Nossa Senhora de Nazaré",
        igrejas=[
            igreja("Paróquia de Nossa Senhora de Nazaré em João Pessoa", "Rua Oceano Antártico, 200, Jardim Oceania - João Pessoa (Paraíba), 58037-655", "Forania Praia Norte", 2003,
                   marca=("§", "Nota: Há também outra paróquia na Arquidiocese com a mesma titular, mas celebra-se em 08 de Setembro")),
        ],
    ),
    dict(
        data="16 de Outubro",
        festa="Santa Edwiges",
        igrejas=[
            igreja("Paróquia Santa Edwiges em João Pessoa", "Rua Jaguatirica, s/n, Paratibe - João Pessoa (Paraíba), 58062-288", "Forania Conjuntos", 2018),
        ],
    ),
    dict(
        data="18 de Outubro",
        festa="Nossa Senhora Mãe Rainha",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Santuário Nossa Senhora Mãe Rainha em João Pessoa", "Rua Francisco Leocádio Ribeiro Coutinho, s/n, Aeroclube - João Pessoa (Paraíba), 58036-450", "Forania Praia Norte", 2012),
        ],
    ),
    dict(
        data="24 de Outubro",
        festa="São Rafael Arcanjo",
        marca=("~", "No Calendário pós-Conciliar a festa mudou a data para 29 de Setembro, juntamente com São Miguel e São Gabriel"),
        igrejas=[
            igreja("Paróquia São Rafael em João Pessoa", "Rua Hermenegildo de Almeida, s/n, Castelo Branco - João Pessoa (Paraíba), 58050-290", "Forania Praia Sul", 1998),
        ],
    ),
    dict(
        data="28 de Outubro",
        festa="São Judas Tadeu",
        igrejas=[
            igreja("Santuário São Judas Tadeu", "Avenida Nossa Senhora de Fátima, s/n, Torre - João Pessoa (Paraíba), 58040-380", "Forania Centro", 2007),
            igreja("São Judas Tadeu em Cabedelo", "Rua Nilo Montenegro, 626, Jardim Camboinha - Cabedelo (Paraíba), 58103-676", "Forania Praia Norte", 2018),
        ],
    ),
    dict(
        data="Último Domingo de Outubro",
        festa="Cristo Rei",
        marca=("~", "No Calendário pós-Conciliar a festa mudou a data para o Último Domingo do Ano Litúrgico"),
        igrejas=[
            igreja("Paróquia de Cristo Rei em João Pessoa", "Rua Ana Leal Correia, s/n, Mangabeira - João Pessoa (Paraíba), 58056-190", "Forania Conjuntos", 1994),
        ],
    ),
    dict(
        data="27 de Novembro",
        festa="Nossa Senhora da Medalha Milagrosa",
        igrejas=[
            igreja("Paróquia Nossa Senhora das Graças em Santa Rita", "Rua João Gomes Vieira, s/n, Várzea Nova - Santa Rita (Paraíba), 58304-500", "Forania Várzea", 2005),
        ],
    ),
    dict(
        data="08 de Dezembro",
        festa="Nossa Senhora da Conceição",
        igrejas=[
            igreja("Nossa Senhora da Conceição no Conde", "Rua Nossa Senhora da Conceição, 59, Centro - Conde (Paraíba), 58322-000", "Forania Litoral", 1768),
            igreja("Nossa Senhora da Conceição em Ingá", "Rua Getúlio Vargas, 27, Centro - Ingá (Paraíba), 58380-000", "Forania Agreste", 1841),
            igreja("Nossa Senhora da Conceição em Gurinhém", "Rua Senador Humberto Lucena, 02, Centro - Gurinhém (Paraíba), 58356-000", "Forania Agreste", 1873),
            igreja("Nossa Senhora da Conceição em Itabaiana", "Praça Mons. Francisco Coelho, s/n, Centro - Itabaiana (Paraíba), 58360-000", "Forania Agreste", 1903),
            igreja("Nossa Senhora da Conceição em Sapé", "Praça da Matriz, s/n, Centro - Sapé (Paraíba), 58340-000", "Forania Várzea", 1926),
            igreja("Nossa Senhora da Conceição em Jacaraú", "Rua São João, 11, Centro - Jacaraú (Paraíba), 58278-000", "Forania Vale do Mamanguape", 1948),
            igreja("Santuário Nossa Senhora da Conceição em João Pessoa", "Rua São Miguel, s/n, Varadouro - João Pessoa (Paraíba), 58010-270", "Forania Centro", 1963),
            igreja("Santuário Nossa Senhora da Conceição em Pedras de Fogo", "Av. Dom Vital, 01, Centro - Pedras De Fogo (Paraíba), 58328-000", "Forania Agreste", 1994),
            igreja("Imaculada Conceição em Cuité de Mamanguape", "Rua da Matriz, 04, Centro - Cuité De Mamanguape (Paraíba), 58289-000", "Forania Vale do Mamanguape", 2002),
            igreja("Nossa Senhora da Conceição em Caaporã", "Rua Salomão Veloso, s/n, Centro - Caaporã (Paraíba), 58326-000", "Forania Litoral", 2005),
            igreja("Imaculada Conceição de Bayeux em Bayeux", "Rua Plácido de Oliveira Lima, s/n, Imaculada - Bayeux (Paraíba), 58305-000", "Forania Urbana Sul", 2012),
        ],
    ),
    dict(
        data="12 de Dezembro",
        festa="Nossa Senhora de Guadalupe",
        igrejas=[
            igreja("Paróquia Nossa Senhora de Guadalupe em João Pessoa", "Avenida Monsenhor Odilon Coutinho, 115, Cabo Branco - João Pessoa (Paraíba), 58045-120", "Forania Praia Sul", 1998),
        ],
    ),
    dict(
        data="31 de Dezembro",
        festa="Senhor Bom Jesus",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Senhor Bom Jesus em Mataraca", "Rua Daniel Toscano, 272, Centro - Mataraca (Paraíba), 58292-000", "Forania Vale do Mamanguape", 1994),
        ],
    ),
]

# -------------------------------------------------------------- 2. Santuários

SANTUARIOS = [
    dict(
        data="13 de Maio",
        festa="Nossa Senhora Mãe dos Homens",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Santuário Mãe dos Homens em João Pessoa", "Rua Monsenhor Walfredo Leal, 41, Tambiá - João Pessoa (Paraíba), 58020-540", "Forania Centro", 2019),
        ],
    ),
    dict(
        data="22 de Maio",
        festa="Santa Rita de Cássia",
        igrejas=[
            igreja("Paróquia Santuário Santa Rita em Santa Rita", "Praça Getúlio Vargas, 129, Centro - Santa Rita (Paraíba), 58300-130", "Forania Várzea", 1839,
                   marca=("§", "Nota: A principal romaria se faz no dia 22 de Maio")),
        ],
    ),
    dict(
        data="1 de Setembro",
        festa="Nossa Senhora da Penha",
        igrejas=[
            igreja("Santuário Nossa Senhora da Penha em João Pessoa", "Praia da Penha, s/n, Penha - João Pessoa (Paraíba), 58047-000", "Forania Praia Sul", 2019,
                   marca=("§", "Nota: A principal romaria se faz no último Sábado do mês de Novembro")),
        ],
    ),
    dict(
        data="18 de Outubro",
        festa="Nossa Senhora Mãe Rainha",
        marca=("^", None),
        igrejas=[
            igreja("Paróquia Santuário Nossa Senhora Mãe Rainha em João Pessoa", "Rua Francisco Leocádio Ribeiro Coutinho, s/n, Aeroclube - João Pessoa (Paraíba), 58036-450", "Forania Praia Norte", 2012),
        ],
    ),
    dict(
        data="28 de Outubro",
        festa="São Judas Tadeu",
        igrejas=[
            igreja("Paróquia Santuário São Judas Tadeu", "Avenida Nossa Senhora de Fátima, s/n, Torre - João Pessoa (Paraíba), 58040-380", "Forania Centro", 2007),
        ],
    ),
    dict(
        data="8 de Dezembro",
        festa="Nossa Senhora da Guia",
        marca=("^", None),
        igrejas=[
            igreja("Santuário Nossa Senhora da Guia em Lucena", "Planta de Lucena, s/n, - Lucena (Paraíba), 58315-000", "Forania Várzea", None,
                   marca=("§", "Nota: A principal romaria se faz no dia 12 de Outubro")),
        ],
    ),
    dict(
        data="8 de Dezembro",
        festa="Nossa Senhora da Conceição",
        igrejas=[
            igreja("Paróquia Nossa Senhora da Conceição em João Pessoa", "Rua São Miguel, s/n, Varadouro - João Pessoa (Paraíba), 58010-270", "Forania Centro", 1963),
            igreja("Paróquia Nossa Senhora da Conceição em Pedras de Fogo", "Av. Dom Vital, 01, Centro - Pedras De Fogo (Paraíba), 58328-000", "Forania Agreste", 1994),
            igreja("Imaculada Conceição em João Pessoa", "Rua Estudante Carlos Henrique Braga, s/n, Tambauzinho - João Pessoa (Paraíba), 58042-070", "Forania Praia Sul", 2024),
        ],
    ),
]

# ---------------------------------------------------------------- 3. Basílica

BASILICA = [
    dict(
        data="05 de Agosto",
        festa="Nossa Senhora das Neves",
        igrejas=[
            igreja("Basílica Paroquial Nossa Senhora das Neves em João Pessoa", "Praça Dom Ulrico, s/n, Centro - João Pessoa (Paraíba), 58010-740", "Forania Centro", 1586),
        ],
    ),
]

# --------------------------------------------------------- 4. Ordens religiosas
#
# Aqui a coluna do meio é o santo fundador e a terceira traz a instituição a
# que ele deu origem, e só depois a casa ou igreja que se visita. Por isso
# cada linha tem `instituicao`, que as outras três seções não têm.

ORDENS = [
    dict(
        data="09 de Janeiro",
        festa="Beata Alice Le Clerc",
        instituicao="Fundadora das Cônegas de Santo Agostinho da Congregação de Nossa Senhora",
        igrejas=[igreja("Casa Das Irmãs De Nossa Senhora")],
    ),
    dict(
        data="31 de Janeiro",
        festa="São João Bosco",
        instituicao="Fundador da Sociedade São Francisco de Sales (Salesianos)",
        igrejas=[
            igreja("Paróquia Nossa Senhora Das Dores em João Pessoa", "Avenida Coronel Calixto, s/n, Mangabeira - João Pessoa (Paraíba), 58059-000", "Forania Conjuntos", 2009),
        ],
    ),
    dict(
        data="03 de Abril",
        festa="São Luis Scrosoppi",
        marca=("*", "A Canonização foi proclamada em 2001"),
        instituicao="Fundador das irmãs da Providência de São Caetano de Thiene",
        igrejas=[
            igreja("Irmãs da Providência de São Caetano de Thiene", "Rua Cassiano Ribeiro Coutinho, 195, Marcos Moura - Santa Rita (Paraíba), 58300-970"),
        ],
    ),
    dict(
        data="18 de Abril",
        festa="Beata Savina Petrilli",
        marca=("*", "A Beatificação foi proclamada em 1988"),
        instituicao="Fundadora das irmãs dos Pobres de Santa Catarina de Sena",
        igrejas=[
            igreja("Lar da Providência Carneiro da Cunha", "Av. Santa Catarina, 05, Estados - João Pessoa (Paraíba), 58030-070"),
        ],
    ),
    dict(
        data="11 de Junho",
        festa="Santa Paula Frassinetti",
        marca=("*", "A Canonização foi proclamada em 1984"),
        instituicao="Fundadora das irmãs de Santa Dorotéia",
        igrejas=[
            igreja("Colégio Santa Dorotéia", "Rua Eduardo Medeiros, 89, Castelo Branco - João Pessoa (Paraíba), 58050-080"),
        ],
    ),
    dict(
        data="31 de Julho",
        festa="Santo Inácio de Loyola",
        instituicao="Fundador da Companhia de Jesus (Jesuítas)",
        igrejas=[
            igreja("Paróquia Sagrado Coração de Jesus em João Pessoa", "Rua Celerina Paiva, s/n, Mandacaru - João Pessoa (Paraíba), 58027-390", "Forania Centro", 1992),
        ],
    ),
    dict(
        data="28 de Agosto",
        festa="Santo Agostinho",
        instituicao="Fundador da Ordem dos Cônegos Regulares Lateranenses",
        marca_instituicao=("§", "Nota: Certamente S. Agostinho não fundou a referida Ordem, por mais que seus membros lhe tenham como Pai espiritual e carregam seu nome, mas não sabemos se S. Agostinho é tido como “Santo Fundador” da Ordem para os fins que a Indulgência requer."),
        igrejas=[
            igreja("Paróquia Santa Clara", "Rua Luís de França Pereira, 103, Alto do Mateus - João Pessoa (Paraíba), 58090-580"),
        ],
    ),
    dict(
        data="17 de Setembro",
        festa="São Zygmunt Szczęsny Feliński",
        marca=("*", "A Canonização foi proclamada em 2009"),
        instituicao="Fundador das irmãs da Sagrada Família",
        igrejas=[
            igreja("Comunidade Sagrada Família", "Rua Frei Martinho, 335, Jaguaribe - João Pessoa (Paraíba), 58015-100"),
        ],
    ),
    dict(
        data="04 de Outubro",
        festa="São Francisco de Assis",
        instituicao="Fundador das três Ordens Seráficas (Franciscanos)",
        igrejas=[
            igreja("Ordem dos Frades Menores (OFM): Paróquia Nossa Senhora do Rosário em João Pessoa", "Rua Frei Martinho, s/n, Jaguaribe - João Pessoa (Paraíba), 58015-100", "Forania Centro", 1929),
            igreja("Ordem dos Frades Menores Capuchinhos (OFMCap): Santuário Nossa Senhora da Conceição em João Pessoa", "Rua Estudante Carlos Henrique Braga, s/n, Tambauzinho - João Pessoa (Paraíba), 58042-070", "Forania Praia Sul", 2024),
            igreja("Ordem dos Frades Menores Conventuais (OFMConv): Paróquia Nossa Senhora Aparecida em João Pessoa", "Rua Horácio Trajano de Oliveira, 630, Cristo Redentor - João Pessoa (Paraíba), 58070-450", "Forania Urbana Sul", 2006),
            igreja("Ordem dos Frades Menores Conventuais (OFMConv): Paróquia Mãe do Redentor em João Pessoa", "Rua dos Milagres, 2520, Cristo Redentor - João Pessoa (Paraíba), 58071-260", "Forania Urbana Sul", 2002),
            igreja("Ordem Terceira Regular Franciscanas de Dillingen: Fraternidade Do Instituto João XXIII", "Rua Professor Batista Leite, 151, Roger - João Pessoa (Paraíba), 58020-245"),
        ],
    ),
    dict(
        data="10 de Outubro",
        festa="São Daniel Comboni",
        marca=("*", "A Canonização foi proclamada em 2003"),
        instituicao="Fundador dos Missionários Combonianos",
        igrejas=[
            igreja("Paróquia Santo Antônio", "Rua Dr. Francisco Retumba, s/n, Marcos Moura - Santa Rita (Paraíba), 58302-485"),
        ],
    ),
    dict(
        data="15 de Outubro",
        festa="Santa Teresa D'Ávila",
        instituicao="Fundadora da Ordem dos Carmelitas Descalços",
        igrejas=[
            igreja("Carmelo Santa Maria Mãe de Deus", "Estrada de Caxitú, s/n, Zona Rural - Conde (Paraíba), 58322-000"),
        ],
    ),
    dict(
        data="06 de Novembro",
        festa="Beata Maria Bárbara da Santíssima Trindade",
        marca=("*", "A Beatificação foi proclamada em 2010"),
        instituicao="Fundadora das irmãs do Imaculado Coração de Maria",
        igrejas=[
            igreja("Comunidade Margarida Maria Alves", "Rua Manoel Vicente Rodrigues, 78, Jardim Veneza - João Pessoa (Paraíba), 58084-133"),
            igreja("Comunidade Nossa Senhora Aparecida", "Rua José Carlos da Silva, 114, José Américo de Almeida - João Pessoa (Paraíba), 58074-635"),
        ],
    ),
    dict(
        data="09 de Dezembro",
        festa="São Pedro Fourier",
        instituicao="Fundador das Cônegas de Santo Agostinho da Congregação de Nossa Senhora",
        igrejas=[igreja("Casa Das Irmãs De Nossa Senhora")],
    ),
]
