import type { Secao } from "./tipos";

/** Seções 13 a 16: comparações, cores, distinções doutrinais e fontes. */
export const secoesDeReferencia: Secao[] = [
  {
    id: "cenarios",
    numero: 13,
    titulo: "O mesmo rito em cinco cenários",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "O esqueleto é sempre o mesmo; o dia decide o que entra e o que sai.",
      },
      {
        tipo: "tabela",
        colunas: [
          "Peça",
          "Domingo depois de Pentecostes",
          "Feria comum",
          "Festa de santo",
          "Quaresma",
          "Requiem",
        ],
        linhas: [
          [
            "Origem do Próprio",
            "Próprio do Tempo",
            "Do domingo anterior",
            "Próprio dos Santos, ou Comum",
            "Próprio do Tempo",
            "Missas de defuntos",
          ],
          [
            "Salmo 42",
            "sim",
            "sim",
            "sim",
            "sim, até o Domingo da Paixão",
            "não",
          ],
          ["Glória", "sim", "não", "sim", "não", "não"],
          [
            "Canto interlecional",
            "Gradual e Aleluia",
            "Gradual e Aleluia",
            "Gradual e Aleluia",
            "Gradual e Trato",
            "Gradual, Trato e [lat]Dies irae[/lat]",
          ],
          ["Credo", "sim", "não", "depende do grau", "sim aos domingos", "não"],
          [
            "Prefácio",
            "Trindade",
            "Comum ou do tempo",
            "próprio ou comum",
            "da Quaresma",
            "dos Defuntos",
          ],
          ["Beijo da paz", "sim", "sim", "sim", "sim", "não"],
          ["Bênção final", "sim", "sim", "sim", "sim", "não"],
          [
            "Cor",
            "[verde]verde[/verde]",
            "[verde]verde[/verde]",
            "[branco]branco[/branco] ou [vermelho]vermelho[/vermelho]",
            "[roxo]roxo[/roxo]",
            "[preto]preto[/preto]",
          ],
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Quem ganha quando o dia e o santo se chocam",
      },
      {
        tipo: "paragrafo",
        texto:
          "O calendário de 1962 classifica todas as celebrações em quatro graus: [b]I, II, III e IV classe[/b]. Domingos de Advento, Quaresma, Paixão e Páscoa são de I classe e nunca cedem a santo nenhum. Domingos depois de Pentecostes são de II classe e podem ser preteridos por festas maiores. Quando uma celebração de grau inferior é impedida, ela costuma sobreviver como [b]comemoração[/b]: acrescenta-se apenas a sua Colecta, Secreta e Pós-comunhão à Missa do dia.",
      },
      {
        tipo: "rubrica",
        texto:
          "Nos missais anteriores a 1960, a nomenclatura era outra: duplo de I classe, duplo de II classe, duplo maior, duplo, semiduplo e simples. É neste ponto que um missal anterior diverge de um de 1962.",
      },
    ],
  },
  {
    id: "cores",
    numero: 14,
    titulo: "Cores litúrgicas",
    blocos: [
      {
        tipo: "tabela",
        colunas: ["Cor", "Quando"],
        linhas: [
          [
            "[branco]Branco[/branco]",
            "Natal, Páscoa, festas do Senhor não relacionadas à Paixão, de Nossa Senhora, dos anjos, dos confessores e das virgens.",
          ],
          [
            "[vermelho]Vermelho[/vermelho]",
            "Pentecostes, festas da Cruz e da Paixão, Apóstolos e mártires.",
          ],
          ["[verde]Verde[/verde]", "Tempo depois da Epifania e depois de Pentecostes."],
          [
            "[roxo]Roxo[/roxo]",
            "Advento, Septuagésima, Quaresma, vigílias, Têmporas, rogações, Missas votivas penitenciais.",
          ],
          ["[preto]Preto[/preto]", "Sexta-feira Santa e Missas de defuntos."],
          [
            "[rosa]Rosa[/rosa]",
            "Apenas dois dias no ano: domingo [lat]Gaudete[/lat] (3.º do Advento) e domingo [lat]Laetare[/lat] (4.º da Quaresma).",
          ],
        ],
      },
    ],
  },
  {
    id: "distincoes",
    numero: 15,
    titulo: "Dogma, disciplina e opinião",
    blocos: [
      {
        tipo: "paragrafo",
        texto:
          "Esta distinção é indispensável, e vale a pena fixá-la com precisão, porque muita confusão nasce de embaralhar os três níveis.",
      },
      { tipo: "subtitulo", texto: "Doutrina definida" },
      {
        tipo: "paragrafo",
        texto:
          "É de fé definida que a Missa é verdadeiro e próprio sacrifício, propiciatório pelos vivos e pelos defuntos, e que nela se oferece o mesmo Cristo que se ofereceu na Cruz, agora de modo incruento (Concílio de Trento, sessão XXII, 1562). É de fé definida a transubstanciação, a presença real, verdadeira e substancial de Cristo sob cada espécie e sob cada partícula, e a legitimidade da comunhão sob uma só espécie (sessão XIII, 1551, e sessão XXI). É de fé que o sacerdócio ministerial é distinto em essência, e não apenas em grau, do sacerdócio comum dos fiéis (sessão XXIII).",
      },
      { tipo: "subtitulo", texto: "Disciplina e rito" },
      {
        tipo: "paragrafo",
        texto:
          "A forma concreta do rito (a ordem das orações do Ofertório, o Último Evangelho, o número de genuflexões, o silêncio do Cânon, o latim, as Orações Leoninas) pertence à disciplina eclesiástica. É venerável, antiquíssima em boa parte, e tem razão de ser: a lei da oração exprime a lei da fé. Ainda assim, permanece matéria de disciplina, que se distingue do dogma. Trento definiu a doutrina do sacrifício; não canonizou uma rubrica. Prova disso está no próprio Missal: São Pio V permitiu expressamente a permanência dos ritos com mais de duzentos anos de uso, como o ambrosiano, o moçárabe e o dominicano.",
      },
      {
        tipo: "paragrafo",
        texto:
          "Isso não relativiza nada. Uma coisa é dizer «a forma tridentina é superior em reverência, clareza doutrinal e disciplina», juízo defensável e defendido por muita gente séria. Outra é dizer «é a única válida», o que é falso, e falso de modo que compromete a própria posição de quem argumenta. Argumento ruim em favor de causa boa continua sendo argumento ruim, e derruba a causa junto.",
      },
      { tipo: "subtitulo", texto: "Opinião teológica e de escola" },
      {
        tipo: "paragrafo",
        texto:
          "As interpretações alegóricas da Missa (a Missa como representação passo a passo da Paixão, muito difundidas desde Amalário de Metz e retomadas por Inocêncio III) são piedosas e legítimas, mas não vinculantes; a escola litúrgica histórica as considera, em geral, exegese posterior sobreposta ao rito. Também é opinião de escola boa parte das reconstruções históricas sobre a origem do Ofertório e do Cânon. Onde as fontes são escassas, o certo é dizer «é assim que se reza» com firmeza, e «foi assim que surgiu» com cautela.",
      },
    ],
  },
  {
    id: "fontes",
    numero: 16,
    titulo: "Fontes",
    blocos: [
      { tipo: "subtitulo", texto: "Fontes primárias" },
      {
        tipo: "lista",
        itens: [
          "[b][lat]Missale Romanum[/lat][/b], edição típica de 1962, em especial as seções [lat]Rubricae generales Missalis[/lat], [lat]Ritus servandus in celebratione Missae[/lat] e [lat]De defectibus in celebratione Missarum occurrentibus[/lat]. É o documento a consultar antes de qualquer manual: descreve gesto por gesto o que este guia resume.",
          "[b]São Pio V, bula [lat]Quo primum tempore[/lat][/b] (14 de julho de 1570), impressa no início dos missais tradicionais.",
          "[b]Concílio de Trento[/b], sessão XIII (1551), sessão XXI (1562) e sessão XXII (1562), com os cânones sobre a Eucaristia e sobre o sacrifício da Missa. Nos [i]Denzinger-Hünermann[/i], para localizar o que é definido e o que não é.",
          "[b]Pio XII, [lat]Mediator Dei[/lat][/b] (1947), a encíclica sobre a sagrada liturgia; o texto magisterial de referência sobre o que é e o que não é participação litúrgica.",
        ],
      },
      { tipo: "subtitulo", texto: "Manuais e estudos de apoio" },
      {
        tipo: "lista",
        itens: [
          "[b]Nicholas Gihr, [i]O Santo Sacrifício da Missa: dogmática, litúrgica e asceticamente explicado[/i][/b] (1877). O manual clássico, que comenta o rito oração por oração.",
          "[b]Dom Prosper Guéranger, [i]Explicação das orações e cerimônias da Santa Missa[/i][/b], e o monumental [i]O Ano Litúrgico[/i], para o Próprio do Tempo e dos Santos.",
          "[b]Adrian Fortescue, [i]The Mass: A Study of the Roman Liturgy[/i][/b] (1912), história do rito, sólida e ainda insuperada em muitos pontos. Do mesmo autor, com J. B. O'Connell, [i]The Ceremonies of the Roman Rite Described[/i], que é o manual prático de cerimônias.",
          "[b]Josef A. Jungmann, [i]Missarum Sollemnia[/i][/b], a história mais detalhada do Cânon e do Ordinário. Leia sabendo que é obra de escola: várias das suas teses sobre «decadência» e «acréscimos medievais» continuam sendo hipóteses em discussão.",
        ],
      },
      { tipo: "subtitulo", texto: "Para consultar o Próprio de cada dia" },
      {
        tipo: "lista",
        itens: [
          "[b]Divinum Officium[/b]. Reproduz online o Missal e o Breviário de qualquer data, em latim e vernáculo, com opção de rubricas de 1570, 1910, 1955 ou 1962. Útil justamente para comparar as versões.",
          "[b]Sancta Missa[/b], dos Cônegos Regulares de São João Cantius. Traz fac-símiles do Missal de 1962, vídeos de cerimônias e o [lat]Ritus servandus[/lat] comentado.",
          "[b]Church Music Association of America[/b]. Disponibiliza gratuitamente o [lat]Liber Usualis[/lat] e outros livros de canto, onde estão as melodias do Próprio e do Ordinário.",
        ],
      },
    ],
  },
];
