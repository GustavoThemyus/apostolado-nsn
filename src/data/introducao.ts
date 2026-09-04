import type { Secao } from "./tipos";

/** Seções 1 a 4: as chaves de leitura, o missal, as formas e o mapa geral. */
export const secoesDeIntroducao: Secao[] = [
  {
    id: "chaves",
    numero: 1,
    titulo: "Chaves de leitura",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "Uma Missa é feita de dois tipos de texto misturados: o que se repete sempre e o que muda todo dia. Esta é a divisão que organiza o missal e este guia.",
      },
      {
        tipo: "legenda",
        itens: [
          {
            chave: "Ordinário",
            etiqueta: "ordinario",
            texto:
              "Texto fixo, igual em todas as Missas do ano. Fica no meio do missal, entre as duas metades.",
          },
          {
            chave: "Próprio",
            etiqueta: "proprio",
            texto:
              "Texto que muda conforme o dia. Vem do Próprio do Tempo (domingos e tempos litúrgicos) ou do Próprio dos Santos (festas de santos).",
          },
          {
            chave: "Comum",
            etiqueta: "comum",
            texto:
              "Formulário reaproveitável para santos que não têm Missa própria: mártires, confessores, virgens, etc.",
          },
          {
            chave: "Variável",
            etiqueta: "variavel",
            texto:
              "Peça fixa que às vezes é omitida, substituída ou trocada: o Glória, o Credo, o Prefácio, o Último Evangelho.",
          },
        ],
      },
      { tipo: "subtitulo", texto: "Os três volumes de voz" },
      {
        tipo: "paragrafo",
        texto:
          "No rito antigo o sacerdote não fala tudo do mesmo jeito. O volume de voz vem prescrito na rubrica:",
      },
      {
        tipo: "lista",
        itens: [
          "[b]Voz clara[/b], para o que é dirigido ao povo ou cantado: saudações, orações, leituras, Prefácio.",
          "[b]Voz média (secreta)[/b], audível só perto do altar: boa parte das orações do Ofertório.",
          "[b]Silêncio[/b], no Cânon inteiro, incluindo as palavras da consagração. A rubrica manda calar. É o [lat]sacrum silentium[/lat] romano, que sublinha que ali quem age é o sacerdote em nome de Cristo.",
        ],
      },
      { tipo: "subtitulo", texto: "Postura do fiel" },
      {
        tipo: "paragrafo",
        texto:
          "As posturas variam por região e por forma da Missa, e o costume local manda. Como regra prática: na [b]Missa cantada[/b], de pé para Introito, Glória, Evangelho, Credo, Prefácio e bênção; sentado para Epístola, sermão e Ofertório; de joelhos do Sanctus até a Comunhão. Na [b]Missa rezada[/b], em muitos lugares o costume é ficar de joelhos quase o tempo todo, levantando-se para o Evangelho e o Último Evangelho.",
      },
      {
        tipo: "rubrica",
        texto:
          "Neste guia, o texto em vermelho e itálico é rubrica: descreve gesto, posição, quem faz o quê. O texto preto é o que se reza. É a mesma convenção do missal impresso: [lat]rubrica[/lat] vem de [lat]ruber[/lat], vermelho.",
      },
    ],
  },
  {
    id: "pecas",
    numero: 2,
    titulo: "Onde cada texto mora no Missal",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "O missal se consulta em três ou quatro lugares ao mesmo tempo, e não de capa a capa. Daí as fitas. As seções são estas:",
      },
      {
        tipo: "tabela",
        colunas: ["Seção", "O que contém", "Quando se usa"],
        linhas: [
          [
            "[lat]Proprium de Tempore[/lat]\nPróprio do Tempo",
            "As Missas do Advento, Natal, Septuagésima, Quaresma, Paixão, Páscoa, Pentecostes e dos domingos e ferias depois de Pentecostes.",
            "Todo domingo e nos dias sem festa de santo.",
          ],
          [
            "[lat]Proprium Sanctorum[/lat]\nPróprio dos Santos",
            "As Missas das festas de santos, em ordem de calendário civil (de 29 de novembro a 26 de novembro).",
            "Quando a festa do santo tem precedência sobre o dia do Tempo.",
          ],
          [
            "[lat]Commune Sanctorum[/lat]\nComum dos Santos",
            "Formulários genéricos por categoria: um mártir, muitos mártires, confessor pontífice, confessor não pontífice, virgem, virgem e mártir, Nossa Senhora, doutores.",
            "Quando o santo do dia não tem formulário próprio; o Próprio dos Santos remete ao Comum e só dá a oração particular.",
          ],
          [
            "[lat]Ordo Missae[/lat] e [lat]Canon[/lat]",
            "Tudo o que é fixo, das orações ao pé do altar ao Último Evangelho.",
            "Sempre.",
          ],
          [
            "Missas votivas e de defuntos",
            "Missas da Santíssima Trindade, do Espírito Santo, da Cruz, de Nossa Senhora, pelos noivos; e as Missas de Requiem.",
            "Em dias de grau inferior, conforme as rubricas.",
          ],
          [
            "Orações diversas",
            "[lat]Orationes ad diversa[/lat]: pelo Papa, pela paz, pela chuva, por um enfermo, etc.",
            "Como comemoração ou em Missas votivas.",
          ],
        ],
      },
      { tipo: "subtitulo", texto: "As nove peças do Próprio" },
      {
        tipo: "paragrafo",
        texto:
          "Todo formulário de Missa própria tem, no máximo, estas peças, e elas aparecem sempre na mesma ordem:",
      },
      {
        tipo: "lista",
        ordenada: true,
        itens: [
          "[b]Introito[/b], antífona de entrada;",
          "[b]Colecta[/b], a oração do dia;",
          "[b]Epístola[/b], leitura nem sempre de São Paulo (pode ser profeta, Atos, Apocalipse);",
          "[b]Gradual[/b], mais [b]Aleluia[/b], ou [b]Trato[/b], ou [b]Sequência[/b];",
          "[b]Evangelho[/b];",
          "[b]Ofertório[/b], antífona;",
          "[b]Secreta[/b], oração sobre as oblatas, rezada em silêncio;",
          "[b]Comunhão[/b], antífona;",
          "[b]Pós-comunhão[/b], oração final.",
        ],
      },
      {
        tipo: "rubrica",
        texto:
          "Em alguns dias há uma décima peça: o Prefácio próprio. E nas ferias de Quaresma acrescenta-se a Oração sobre o povo ([lat]Oratio super populum[/lat]), depois da Pós-comunhão.",
      },
      {
        tipo: "nota",
        titulo: "A divisão musical do rito",
        paragrafos: [
          "Cinco dessas peças (Introito, Gradual, Aleluia, Ofertório e Comunhão) são [b]cantos do coro[/b]. As outras quatro são [b]orações e leituras do sacerdote[/b]. Por isso, na Missa cantada, o coro canta o Próprio e a assembleia canta o Ordinário (Kyrie, Glória, Credo, Sanctus, Agnus Dei). Essa divisão de tarefas é o esqueleto musical do rito.",
        ],
      },
    ],
  },
  {
    id: "formas",
    numero: 3,
    titulo: "As formas da Missa",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "É a mesma Missa em todos os casos. Muda o grau de solenidade e o número de ministros.",
      },
      {
        tipo: "tabela",
        colunas: ["Forma", "Como é"],
        linhas: [
          [
            "[lat]Missa lecta[/lat]\nMissa rezada ou baixa",
            "Um sacerdote e um acólito. Nada é cantado; o sacerdote diz tudo, inclusive as partes que num rito cantado caberiam ao coro. É a forma da Missa diária.",
          ],
          [
            "[lat]Missa cantata[/lat]\nMissa cantada",
            "Um sacerdote, sem diácono nem subdiácono, mas com canto, coro e incenso. Forma dominical mais comum hoje.",
          ],
          [
            "[lat]Missa solemnis[/lat]\nMissa solene",
            "Sacerdote, diácono e subdiácono. O diácono canta o Evangelho e o [lat]Ite, missa est[/lat]; o subdiácono canta a Epístola. É a forma plena, da qual as outras são simplificações.",
          ],
          [
            "Missa pontifical",
            "Celebrada por bispo, com cerimonial próprio: bênção tríplice no fim, uso da mitra e do báculo, sete acólitos no ideal.",
          ],
          [
            "Missa de Requiem",
            "Pelos defuntos. Paramento [preto]preto[/preto], sem Salmo 42, sem Glória, sem Aleluia (há Trato e a sequência [lat]Dies irae[/lat]), sem beijo da paz, sem bênção final. Termina com [lat]Requiescant in pace[/lat].",
          ],
          [
            "Missa votiva",
            "Escolhida por devoção ou necessidade, e não pelo calendário; só é permitida em dias de grau inferior.",
          ],
        ],
      },
    ],
  },
  {
    id: "mapa",
    numero: 4,
    titulo: "O mapa geral",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "A Missa romana tem duas metades, com nomes que vêm da Antiguidade, quando os catecúmenos ainda não batizados eram dispensados no meio da celebração:",
      },
      {
        tipo: "lista",
        itens: [
          "[b]Missa dos Catecúmenos[/b], do sinal da cruz ao Credo. É a parte da instrução: salmos, orações, leituras, pregação.",
          "[b]Missa dos Fiéis[/b], do Ofertório ao fim. É a parte do sacrifício propriamente dito: oferecimento, consagração, comunhão.",
        ],
      },
      {
        tipo: "paragrafo",
        texto:
          "Dentro da segunda metade, três blocos: [b]Ofertório[/b] (preparação da matéria), [b]Cânon[/b] (a ação sacrifical) e [b]Comunhão[/b] (participação na vítima).",
      },
    ],
  },
];
