import type { Secao } from "./tipos";

/** Seções 5 a 7: do Asperges ao Credo, a primeira metade da Missa. */
export const secoesDosCatecumenos: Secao[] = [
  {
    id: "asperges",
    numero: 5,
    titulo: "Rito preparatório: Asperges",
    resumo:
      "Aos domingos, antes da Missa principal. Rito autônomo de purificação, anterior à Missa e distinto dela, com o sacerdote paramentado de pluvial.",
    blocos: [
      {
        tipo: "passo",
        numero: 1,
        etiqueta: "variavel",
        titulo: "Aspersão com água benta",
        tituloLatim: "Asperges me",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Antífona tirada do Salmo 50: [lat]Asperges me, Domine, hyssopo, et mundabor[/lat], «Aspergir-me-eis, Senhor, com o hissopo, e ficarei limpo». Segue o versículo [lat]Miserere mei, Deus[/lat], o [lat]Gloria Patri[/lat], a repetição da antífona, o versículo [lat]Ostende nobis[/lat] e a oração [lat]Exaudi nos[/lat].",
          },
          {
            tipo: "rubrica",
            texto:
              "No Tempo Pascal, do Domingo da Páscoa a Pentecostes, o Asperges é substituído pelo [lat]Vidi aquam[/lat], com Aleluia, evocando a água que saía do lado do templo em Ezequiel.",
          },
        ],
      },
    ],
  },
  {
    id: "pe-altar",
    numero: 6,
    titulo: "Orações ao pé do altar",
    resumo:
      "O sacerdote ainda não subiu ao altar. Este bloco inteiro é diálogo entre ele e o acólito, e é uma preparação de indignidade: antes de tocar o altar, confessa-se pecador.",
    blocos: [
      {
        tipo: "passo",
        numero: 2,
        etiqueta: "ordinario",
        titulo: "Sinal da cruz e antífona",
        tituloLatim: "Introibo ad altare Dei",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              { latim: "V. Introibo ad altare Dei.", portugues: "Subirei ao altar de Deus." },
              {
                latim: "R. Ad Deum qui laetificat juventutem meam.",
                portugues: "Ao Deus que alegra a minha juventude.",
              },
            ],
          },
        ],
      },
      {
        tipo: "passo",
        numero: 3,
        etiqueta: "variavel",
        titulo: "Salmo 42",
        tituloLatim: "Judica me, Deus",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Rezado alternadamente com o acólito, terminando no [lat]Gloria Patri[/lat] e na repetição da antífona.",
          },
          {
            tipo: "rubrica",
            texto:
              "Omite-se do Domingo da Paixão até o Sábado Santo e em todas as Missas de defuntos.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 4,
        etiqueta: "ordinario",
        titulo: "Versículo",
        tituloLatim: "Adjutorium nostrum",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              {
                latim: "V. Adjutorium nostrum in nomine Domini. R. Qui fecit caelum et terram.",
                portugues: "O nosso auxílio está no nome do Senhor. R. Que fez o céu e a terra.",
              },
            ],
          },
        ],
      },
      {
        tipo: "passo",
        numero: 5,
        etiqueta: "ordinario",
        titulo: "Confissão dupla",
        tituloLatim: "Confiteor",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Primeiro o sacerdote se confessa, profundamente inclinado; o acólito responde com o [lat]Misereatur tui[/lat]. Depois o acólito, em nome do povo, reza o mesmo [lat]Confiteor[/lat], acrescentando [lat]et tibi, pater[/lat] e [lat]et te, pater[/lat]; o sacerdote responde com o [lat]Misereatur vestri[/lat] e a absolvição [lat]Indulgentiam, absolutionem et remissionem peccatorum nostrorum[/lat].",
          },
          {
            tipo: "rubrica",
            texto:
              "Bate-se três vezes no peito ao dizer [lat]mea culpa, mea culpa, mea maxima culpa[/lat]. A absolvição dada aqui é deprecativa, isto é, um pedido, e não dispensa a confissão sacramental de pecado grave.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 6,
        etiqueta: "ordinario",
        titulo: "Versículos finais e subida ao altar",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Seguem-se [lat]Deus, tu conversus vivificabis nos[/lat], [lat]Ostende nobis[/lat], [lat]Domine, exaudi orationem meam[/lat], [lat]Dominus vobiscum[/lat]. Então o [lat]Oremus[/lat] e, subindo os degraus, a oração [lat]Aufer a nobis[/lat], «afastai de nós, Senhor, as nossas iniquidades». Beijando o altar sobre as relíquias, reza o [lat]Oramus te, Domine[/lat].",
          },
          {
            tipo: "rubrica",
            texto:
              "Na Missa solene ou cantada, incensa-se aqui a cruz e o altar. É o primeiro dos cinco momentos de incensação da Missa.",
          },
        ],
      },
    ],
  },
  {
    id: "catecumenos",
    numero: 7,
    titulo: "Missa dos Catecúmenos",
    resumo:
      "Do Introito ao Credo. O sacerdote já está no altar; alterna entre o lado da Epístola (à direita de quem olha) e o lado do Evangelho (à esquerda).",
    blocos: [
      {
        tipo: "passo",
        numero: 7,
        etiqueta: "proprio",
        titulo: "Introito",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Antífona de entrada, quase sempre um versículo de salmo, seguida de um versículo salmódico, do [lat]Gloria Patri[/lat] e da repetição da antífona. Dá o tom do dia inteiro: [lat]Gaudete[/lat], [lat]Laetare[/lat], [lat]Requiem aeternam[/lat], [lat]Rorate caeli[/lat] são nomes de domingos justamente porque são as primeiras palavras do Introito.",
          },
          {
            tipo: "rubrica",
            texto:
              "Nas Missas de defuntos, omite-se o [lat]Gloria Patri[/lat] e substitui-se por [lat]Et lux perpetua luceat eis[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 8,
        etiqueta: "ordinario",
        titulo: "Kyrie eleison",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Nove invocações em grego, em três grupos de três: [lat]Kyrie eleison[/lat] (três vezes, ao Pai), [lat]Christe eleison[/lat] (três, ao Filho), [lat]Kyrie eleison[/lat] (três, ao Espírito Santo). É o único resíduo grego do rito romano, sobrevivente da época em que a liturgia de Roma era celebrada nessa língua.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 9,
        etiqueta: "variavel",
        titulo: "Glória",
        tituloLatim: "Gloria in excelsis Deo",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Hino de louvor de origem antiquíssima, chamado «doxologia maior». Começa com o canto dos anjos em Belém e se desenvolve em louvor trinitário.",
          },
          {
            tipo: "rubrica",
            texto:
              "Omite-se no Advento, na Septuagésima, na Quaresma e no Tempo da Paixão, nas ferias, nas vigílias, nas Missas de defuntos e na maior parte das votivas. Quando o Glória é omitido, o fim da Missa também muda: diz-se [lat]Benedicamus Domino[/lat] em vez de [lat]Ite, missa est[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 10,
        etiqueta: "proprio",
        titulo: "Colecta",
        tituloLatim: "Oratio",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Precedida do [lat]Dominus vobiscum[/lat] e do [lat]Oremus[/lat]. É a oração oficial do dia, curta, densa e construída sempre no mesmo molde romano: invocação a Deus Pai, motivo, pedido, conclusão pelo Filho. «Colecta» porque [i]recolhe[/i] as intenções da assembleia numa só voz.",
          },
          {
            tipo: "rubrica",
            texto:
              "Podem seguir-se comemorações: colectas de outras festas ou orações impostas pelo bispo. Elas voltarão no mesmo número na Secreta e na Pós-comunhão. As rubricas de 1960 reduziram muito essas comemorações; nos missais anteriores, o número de orações era sempre ímpar: três, cinco, sete.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 11,
        etiqueta: "proprio",
        titulo: "Epístola",
        tituloLatim: "Lectio",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Lida no lado da Epístola. O nome é convenção: a leitura pode vir dos profetas, do Apocalipse, dos Atos ou dos livros sapienciais. O acólito responde [lat]Deo gratias[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 12,
        etiqueta: "proprio",
        titulo: "Gradual, Aleluia, Trato, Sequência",
        corpo: [
          { tipo: "paragrafo", texto: "O canto interlecional, que muda conforme o tempo litúrgico:" },
          {
            tipo: "lista",
            itens: [
              "[b]Gradual[/b], sempre presente fora do Tempo Pascal. O nome vem de [lat]gradus[/lat], o degrau do ambão de onde era cantado.",
              "[b]Aleluia[/b] com versículo, no tempo festivo.",
              "[b]Trato[/b], que substitui o Aleluia da Septuagésima ao Sábado Santo e nas Missas de defuntos; canto contínuo, sem refrão, de tom penitencial.",
              "[b]Sequência[/b], poema litúrgico mantido em apenas cinco casos no missal: [lat]Victimae paschali laudes[/lat] (Páscoa), [lat]Veni Sancte Spiritus[/lat] (Pentecostes), [lat]Lauda Sion[/lat] (Corpus Christi), [lat]Stabat Mater[/lat] (Sete Dores de Nossa Senhora) e [lat]Dies irae[/lat] (defuntos).",
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "No Tempo Pascal há dois Aleluias no lugar do Gradual. Do Sábado Santo a Pentecostes, a palavra «Aleluia» invade praticamente todas as antífonas.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 13,
        etiqueta: "ordinario",
        titulo: "Preparação do Evangelho",
        tituloLatim: "Munda cor meum",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Inclinado no meio do altar, o sacerdote pede a purificação dos lábios com a imagem do carvão em brasa de Isaías: [lat]Munda cor meum ac labia mea[/lat]. Na Missa solene, o diácono pede a bênção: [lat]Jube, domne, benedicere[/lat].",
          },
          {
            tipo: "rubrica",
            texto:
              "O missal é transferido para o lado do Evangelho. Na Missa solene, procissão com turíbulo e círios.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 14,
        etiqueta: "proprio",
        titulo: "Evangelho",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              { latim: "V. Dominus vobiscum. R. Et cum spiritu tuo." },
              {
                latim: "V. Sequentia sancti Evangelii secundum N. R. Gloria tibi, Domine.",
                portugues: "Continuação do santo Evangelho segundo N. R. Glória a Vós, Senhor.",
              },
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "Todos de pé. Sacerdote e fiéis fazem três pequenas cruzes: na testa, nos lábios e no peito, pela fé na mente, na confissão e no coração. No fim, [lat]Laus tibi, Christe[/lat], e o sacerdote beija o livro dizendo [lat]Per evangelica dicta deleantur nostra delicta[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 15,
        etiqueta: "variavel",
        titulo: "Homilia e avisos",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Em vernáculo. Aqui também se leem, quando é o caso, o Evangelho traduzido, os avisos paroquiais e os anúncios de casamento. Não pertence estritamente ao rito: o sacerdote pode até retirar o manípulo, sinal de que interrompe a ação litúrgica.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 16,
        etiqueta: "variavel",
        titulo: "Credo",
        tituloLatim: "Credo in unum Deum",
        corpo: [
          {
            tipo: "paragrafo",
            texto: "O Símbolo Niceno-Constantinopolitano, resposta da fé à Palavra ouvida.",
          },
          {
            tipo: "rubrica",
            texto:
              "Todos se ajoelham nas palavras [lat]Et incarnatus est de Spiritu Sancto ex Maria Virgine: et homo factus est[/lat]. Reza-se aos domingos, nas festas de I classe, nas do Senhor e de Nossa Senhora, dos Apóstolos, Evangelistas e Doutores da Igreja, e na dedicação de igreja. Numa feria comum, não há Credo.",
          },
        ],
      },
    ],
  },
];
