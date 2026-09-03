import type { Secao } from "./tipos";

/** Seções 8 a 12: do Ofertório às Orações Leoninas. */
export const secoesDosFieis: Secao[] = [
  {
    id: "ofertorio",
    numero: 8,
    titulo: "Missa dos Fiéis: Ofertório",
    resumo:
      "Começa a segunda metade. As orações deste bloco são de origem medieval e antecipam em linguagem sacrifical o que só se realizará no Cânon. Por isso falam da hóstia como «vítima imaculada» antes da consagração.",
    blocos: [
      {
        tipo: "passo",
        numero: 17,
        etiqueta: "proprio",
        titulo: "Antífona do Ofertório",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Precedida do [lat]Dominus vobiscum[/lat] e do [lat]Oremus[/lat]. Curiosidade: esse [lat]Oremus[/lat] ficou sem a oração que o seguia, vestígio de uma oração dos fiéis que desapareceu do rito romano há mais de mil anos.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 18,
        etiqueta: "ordinario",
        titulo: "Oblação da hóstia",
        tituloLatim: "Suscipe, sancte Pater",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              {
                latim:
                  "Suscipe, sancte Pater, omnipotens aeterne Deus, hanc immaculatam hostiam…",
                portugues:
                  "Recebei, Pai santo, Deus onipotente e eterno, esta hóstia imaculada que eu, vosso indigno servo, vos ofereço…",
              },
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "O sacerdote eleva a patena com a hóstia à altura do peito e a traça em cruz sobre o corporal.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 19,
        etiqueta: "ordinario",
        titulo: "Mistura da água e do vinho",
        tituloLatim: "Deus, qui humanae substantiae",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Ao lado da Epístola, deitam-se algumas gotas de água no vinho, com a oração que compara essa mistura à união das duas naturezas em Cristo.",
          },
          { tipo: "rubrica", texto: "A água é abençoada, mas não nas Missas de defuntos." },
        ],
      },
      {
        tipo: "passo",
        numero: 20,
        etiqueta: "ordinario",
        titulo: "Oblação do cálice",
        tituloLatim: "Offerimus tibi, Domine",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Note o plural: [lat]offerimus[/lat], «oferecemos». Na Missa solene, o diácono segura o cálice com o sacerdote.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 21,
        etiqueta: "ordinario",
        titulo: "[lat]In spiritu humilitatis[/lat] e [lat]Veni, Sanctificator[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Duas orações curtas: a primeira, do coração contrito de Daniel; a segunda, invocação do Espírito Santo sobre as oblatas, o equivalente romano do que os orientais chamam epiclese.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 22,
        etiqueta: "variavel",
        titulo: "Incensação das oblatas",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "Só na Missa solene ou cantada. Quatro fórmulas em sequência: [lat]Per intercessionem beati Michaelis[/lat] ao abençoar o incenso, [lat]Incensum istud[/lat] ao incensar as oblatas, [lat]Dirigatur, Domine, oratio mea[/lat] ao incensar o altar, [lat]Accendat in nobis Dominus ignem sui amoris[/lat] ao devolver o turíbulo. Depois são incensados o celebrante, os ministros e o povo, em ordem hierárquica rigorosa.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 23,
        etiqueta: "ordinario",
        titulo: "Lavabo",
        tituloLatim: "Lavabo inter innocentes manus meas",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Salmo 25, versículos 6 a 12, enquanto lava as pontas dos dedos. Gesto originalmente prático, hoje simbólico: pureza exigida de quem vai tocar o Corpo do Senhor.",
          },
          {
            tipo: "rubrica",
            texto:
              "Omite-se o [lat]Gloria Patri[/lat] nas Missas de defuntos e no Tempo da Paixão.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 24,
        etiqueta: "ordinario",
        titulo: "[lat]Suscipe, sancta Trinitas[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Oferecimento explícito do sacrifício em memória da Paixão, Ressurreição e Ascensão, e em honra dos santos.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 25,
        etiqueta: "ordinario",
        titulo: "[lat]Orate, fratres[/lat]",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              {
                latim:
                  "Orate, fratres, ut meum ac vestrum sacrificium acceptabile fiat apud Deum Patrem omnipotentem.",
                portugues:
                  "Orai, irmãos, para que o meu e vosso sacrifício seja aceito por Deus Pai onipotente.",
              },
              {
                latim:
                  "R. Suscipiat Dominus sacrificium de manibus tuis, ad laudem et gloriam nominis sui, ad utilitatem quoque nostram, totiusque Ecclesiae suae sanctae.",
                portugues:
                  "Receba o Senhor de tuas mãos este sacrifício, para louvor e glória do seu nome, para nosso bem e de toda a sua santa Igreja.",
              },
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "É o único momento em que o sacerdote se volta para o povo e o povo responde algo longo. A distinção «meu e vosso» é precisa: o sacerdote oferece em sentido próprio; os fiéis, em sentido derivado, pelo sacerdócio comum.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 26,
        etiqueta: "proprio",
        titulo: "Secreta",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "A oração sobre as oblatas, rezada inteiramente em silêncio, daí o nome. É a peça do Próprio que quase ninguém ouve. Só a conclusão é cantada em voz alta, servindo de rampa para o Prefácio: [lat]Per omnia saecula saeculorum. R. Amen.[/lat]",
          },
        ],
      },
    ],
  },
  {
    id: "canon",
    numero: 9,
    titulo: "Prefácio e Cânon",
    resumo:
      "O coração da Missa. O Cânon Romano é substancialmente o mesmo desde o século VI e, salvo pequenas variações, não muda em dia nenhum do ano, daí o nome: [lat]canon[/lat], regra fixa.",
    blocos: [
      {
        tipo: "passo",
        numero: 27,
        etiqueta: "variavel",
        titulo: "Prefácio",
        tituloLatim: "Praefatio",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              { latim: "V. Dominus vobiscum. R. Et cum spiritu tuo." },
              {
                latim: "V. Sursum corda. R. Habemus ad Dominum.",
                portugues: "Corações ao alto. R. Já os temos no Senhor.",
              },
              {
                latim: "V. Gratias agamus Domino Deo nostro. R. Dignum et justum est.",
                portugues: "Demos graças ao Senhor nosso Deus. R. É digno e justo.",
              },
            ],
          },
          {
            tipo: "paragrafo",
            texto:
              "Segue-se o [lat]Vere dignum et justum est[/lat], que termina sempre unindo a voz da Igreja à dos anjos. O missal de 1962 tem quinze prefácios: o Comum e mais os da Trindade, Natal, Epifania, Quaresma, Santa Cruz, Páscoa, Ascensão, Espírito Santo, Sagrado Coração, Cristo Rei, Nossa Senhora, São José, Apóstolos e Defuntos.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 28,
        etiqueta: "ordinario",
        titulo: "Sanctus e Benedictus",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Junção de duas aclamações bíblicas: o trissagion de Isaías 6 e o [lat]Benedictus qui venit[/lat] do Domingo de Ramos.",
          },
          {
            tipo: "rubrica",
            texto:
              "Toca-se a campainha três vezes. Na Missa solene, o [lat]Benedictus[/lat] é cantado depois da consagração.",
          },
        ],
      },
      {
        tipo: "nota",
        alerta: true,
        titulo: "Daqui até o Pater noster, tudo é rezado em silêncio",
        paragrafos: [
          "A rubrica manda [lat]secreto[/lat]. O fiel acompanha pelo missal, pelos gestos e pelas campainhas. As únicas palavras audíveis do Cânon são o [lat]Nobis quoque peccatoribus[/lat], dito em voz um pouco mais alta, e a conclusão final.",
        ],
      },
      {
        tipo: "passo",
        numero: 29,
        etiqueta: "ordinario",
        titulo: "1. [lat]Te igitur[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Súplica de aceitação do sacrifício, pela Igreja, pelo Papa nomeado, pelo bispo diocesano nomeado e por todos os que professam a fé católica.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 30,
        etiqueta: "ordinario",
        titulo: "2. [lat]Memento, Domine[/lat], dos vivos",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "O sacerdote faz uma pausa e recorda mentalmente aqueles por quem quer rezar. É o momento próprio para o fiel apresentar as suas intenções.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 31,
        etiqueta: "ordinario",
        titulo: "3. [lat]Communicantes[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Enumeração de Nossa Senhora, São José, os doze Apóstolos e doze mártires romanos: comunhão com a Igreja triunfante.",
          },
          {
            tipo: "rubrica",
            texto:
              "Tem forma própria no Natal, Epifania, Páscoa, Ascensão e Pentecostes, uma das poucas variações do Cânon.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 32,
        etiqueta: "ordinario",
        titulo: "4. [lat]Hanc igitur[/lat]",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "O sacerdote estende as mãos sobre as oblatas, gesto do bode expiatório do Levítico. Toca-se a campainha: é o aviso de que a consagração se aproxima. Também tem forma própria na Páscoa e em Pentecostes.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 33,
        etiqueta: "ordinario",
        titulo: "5. [lat]Quam oblationem[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Pedido para que a oferta se torne para nós o Corpo e o Sangue de Cristo. É a última oração antes das palavras da instituição.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 34,
        etiqueta: "ordinario",
        titulo: "6. [lat]Qui pridie[/lat]: Consagração do pão",
        corpo: [
          {
            tipo: "oracao",
            versos: [{ latim: "Hoc est enim Corpus meum.", portugues: "Isto é o meu Corpo." }],
          },
          {
            tipo: "rubrica",
            texto:
              "Genuflexão, elevação da Hóstia, genuflexão. Três toques de campainha. Na Missa solene, incensa-se a Hóstia elevada. Os fiéis adoram em silêncio; a fórmula devocional tradicional deste momento é o [lat]Dominus meus et Deus meus[/lat] de São Tomé.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 35,
        etiqueta: "ordinario",
        titulo: "7. [lat]Simili modo[/lat]: Consagração do vinho",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              {
                latim:
                  "Hic est enim Calix Sanguinis mei, novi et aeterni testamenti: mysterium fidei: qui pro vobis et pro multis effundetur in remissionem peccatorum.",
                portugues:
                  "Este é o Cálice do meu Sangue, do novo e eterno testamento: mistério da fé: que por vós e por muitos será derramado para a remissão dos pecados.",
              },
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "Genuflexão, elevação do Cálice, genuflexão, campainha. Segue-se [lat]Haec quotiescumque feceritis, in mei memoriam facietis[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 36,
        etiqueta: "ordinario",
        titulo: "8. [lat]Unde et memores[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "A anamnese romana: a Igreja recorda a Paixão, a Ressurreição e a Ascensão e oferece ao Pai a hóstia pura, santa e imaculada, agora no sentido próprio.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 37,
        etiqueta: "ordinario",
        titulo: "9. [lat]Supra quae[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto: "Invoca os sacrifícios de Abel, Abraão e Melquisedec como figuras aceitas por Deus.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 38,
        etiqueta: "ordinario",
        titulo: "10. [lat]Supplices te rogamus[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Pede que a oblação seja levada pelas mãos do anjo ao altar celeste. Uma das passagens mais discutidas e mais belas do Cânon.",
          },
          {
            tipo: "rubrica",
            texto:
              "O sacerdote se inclina profundamente e beija o altar; a campainha toca ao [lat]ex hac altaris participatione[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 39,
        etiqueta: "ordinario",
        titulo: "11. [lat]Memento etiam[/lat], dos mortos",
        corpo: [
          { tipo: "rubrica", texto: "Segunda pausa silenciosa, agora pelas almas do purgatório." },
        ],
      },
      {
        tipo: "passo",
        numero: 40,
        etiqueta: "ordinario",
        titulo: "12. [lat]Nobis quoque peccatoribus[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Segunda lista de santos, aberta a mártires e virgens. O sacerdote bate no peito e ergue um pouco a voz nas primeiras palavras, «a nós, pecadores», único ponto audível do Cânon.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 41,
        etiqueta: "ordinario",
        titulo: "13. [lat]Per quem haec omnia[/lat] e 14. [lat]Per ipsum[/lat]",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              {
                latim:
                  "Per ipsum, et cum ipso, et in ipso, est tibi Deo Patri omnipotenti, in unitate Spiritus Sancti, omnis honor et gloria.",
                portugues:
                  "Por Ele, com Ele e nEle, a Vós, Deus Pai onipotente, na unidade do Espírito Santo, toda honra e glória.",
              },
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "Pequena Elevação: o sacerdote ergue ligeiramente a Hóstia sobre o Cálice, traçando cruzes. Conclui em voz alta: [lat]Per omnia saecula saeculorum. R. Amen.[/lat] Esse é o «Amém» mais importante da Missa, o que ratifica todo o Cânon.",
          },
        ],
      },
    ],
  },
  {
    id: "comunhao",
    numero: 10,
    titulo: "Comunhão",
    blocos: [
      {
        tipo: "passo",
        numero: 42,
        etiqueta: "ordinario",
        titulo: "Pai-Nosso",
        tituloLatim: "Pater noster",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "O sacerdote reza ou canta sozinho, precedido do [lat]Oremus. Praeceptis salutaribus moniti[/lat]. Só a última petição é do acólito ou do povo: [lat]Sed libera nos a malo[/lat]. No rito antigo, o Pai-Nosso cabe ao sacerdote.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 43,
        etiqueta: "ordinario",
        titulo: "Embolismo",
        tituloLatim: "Libera nos, quaesumus",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Desenvolvimento silencioso da última petição do Pai-Nosso, pedindo a intercessão de Nossa Senhora, dos Apóstolos Pedro, Paulo e André. Termina em voz alta.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 44,
        etiqueta: "ordinario",
        titulo: "Fração e mistura",
        tituloLatim: "Pax Domini",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "O sacerdote parte a Hóstia em três, canta [lat]Pax Domini sit semper vobiscum[/lat] e deixa cair uma partícula no Cálice, dizendo [lat]Haec commixtio et consecratio[/lat]. Rito antigo que significa a unidade do Corpo e do Sangue no Cristo ressuscitado.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 45,
        etiqueta: "ordinario",
        titulo: "Agnus Dei",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Três invocações; nas duas primeiras, [lat]miserere nobis[/lat]; na terceira, [lat]dona nobis pacem[/lat].",
          },
          {
            tipo: "rubrica",
            texto:
              "Nas Missas de defuntos: [lat]dona eis requiem[/lat] e, na terceira, [lat]dona eis requiem sempiternam[/lat]. Bate-se três vezes no peito.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 46,
        etiqueta: "ordinario",
        titulo: "Três orações de preparação",
        corpo: [
          {
            tipo: "lista",
            ordenada: true,
            itens: [
              "[lat]Domine Jesu Christe, qui dixisti Apostolis tuis: Pacem relinquo vobis[/lat], pela paz e unidade da Igreja. [r]Omitida nas Missas de defuntos.[/r]",
              "[lat]Domine Jesu Christe, Fili Dei vivi[/lat], pela libertação de todo mal.",
              "[lat]Perceptio Corporis tui[/lat], para que a comunhão não seja julgamento e condenação.",
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "Na Missa solene, depois da primeira oração vem o beijo da paz, transmitido do celebrante ao diácono, do diácono ao subdiácono, e assim pelo coro, com a fórmula [lat]Pax tecum[/lat]. O gesto corre entre os ministros: é a paz que desce hierarquicamente do altar.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 47,
        etiqueta: "ordinario",
        titulo: "Comunhão do sacerdote",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "[lat]Panem caelestem accipiam[/lat], e então, batendo no peito três vezes:",
          },
          {
            tipo: "oracao",
            versos: [
              {
                latim:
                  "Domine, non sum dignus, ut intres sub tectum meum: sed tantum dic verbo, et sanabitur anima mea.",
                portugues:
                  "Senhor, não sou digno de que entreis em minha morada, mas dizei uma só palavra e a minha alma será salva.",
              },
            ],
          },
          {
            tipo: "paragrafo",
            texto:
              "Comunga o Corpo com [lat]Corpus Domini nostri Jesu Christi custodiat animam meam in vitam aeternam[/lat], faz pausa de recolhimento, reza [lat]Quid retribuam Domino[/lat] e comunga o Sangue.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 48,
        etiqueta: "ordinario",
        titulo: "Comunhão dos fiéis",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "Ordem: o acólito reza o [lat]Confiteor[/lat] em nome do povo; o sacerdote responde [lat]Misereatur vestri[/lat] e [lat]Indulgentiam[/lat]; volta-se com a Hóstia e diz [lat]Ecce Agnus Dei, ecce qui tollit peccata mundi[/lat]; todos repetem três vezes [lat]Domine, non sum dignus[/lat]. Os fiéis comungam ajoelhados na balaustrada, na língua, com o acólito segurando a patena sob o queixo. A fórmula é individual: [lat]Corpus Domini nostri Jesu Christi custodiat animam tuam in vitam aeternam. Amen.[/lat] Quem diz o «Amém» aqui é o próprio sacerdote.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 49,
        etiqueta: "ordinario",
        titulo: "Abluções",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Purificação do cálice e dos dedos com vinho e água, acompanhada de [lat]Quod ore sumpsimus, Domine, pura mente capiamus[/lat] e [lat]Corpus tuum, Domine, quod sumpsi[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 50,
        etiqueta: "proprio",
        titulo: "Antífona da Comunhão",
        corpo: [
          {
            tipo: "rubrica",
            texto:
              "Lida no lado da Epístola, para onde o missal foi transferido de volta. Resto de um salmo inteiro que antigamente se cantava durante a distribuição.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 51,
        etiqueta: "proprio",
        titulo: "Pós-comunhão",
        tituloLatim: "Postcommunio",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Precedida do [lat]Dominus vobiscum[/lat] e do [lat]Oremus[/lat]. Oração de ação de graças e de pedido de fruto. Repete as comemorações feitas na Colecta.",
          },
          {
            tipo: "rubrica",
            texto:
              "Nas ferias de Quaresma acrescenta-se aqui a [lat]Oratio super populum[/lat], precedida de [lat]Humiliate capita vestra Deo[/lat].",
          },
        ],
      },
    ],
  },
  {
    id: "conclusao",
    numero: 11,
    titulo: "Conclusão e Último Evangelho",
    blocos: [
      {
        tipo: "passo",
        numero: 52,
        etiqueta: "variavel",
        titulo: "Despedida",
        tituloLatim: "Ite, missa est",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "É desta fórmula que vem a palavra «Missa». Resposta: [lat]Deo gratias[/lat].",
          },
          {
            tipo: "rubrica",
            texto:
              "Quando não houve Glória, diz-se [lat]Benedicamus Domino[/lat]. Nas Missas de defuntos: [lat]Requiescant in pace. R. Amen.[/lat] Na Missa solene, quem canta é o diácono.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 53,
        etiqueta: "ordinario",
        titulo: "[lat]Placeat tibi, sancta Trinitas[/lat]",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "Última oração pessoal do sacerdote antes de abençoar: que o obséquio da sua servidão agrade à Trindade.",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 54,
        etiqueta: "variavel",
        titulo: "Bênção",
        corpo: [
          {
            tipo: "oracao",
            versos: [
              { latim: "Benedicat vos omnipotens Deus, Pater, et Filius, et Spiritus Sanctus." },
            ],
          },
          {
            tipo: "rubrica",
            texto:
              "Omitida nas Missas de defuntos. O bispo dá bênção tríplice, precedida dos versículos [lat]Sit nomen Domini benedictum[/lat] e [lat]Adjutorium nostrum[/lat].",
          },
        ],
      },
      {
        tipo: "passo",
        numero: 55,
        etiqueta: "variavel",
        titulo: "Último Evangelho",
        tituloLatim: "In principio erat Verbum",
        corpo: [
          {
            tipo: "paragrafo",
            texto:
              "O prólogo de São João (Jo 1, 1-14), lido no lado do Evangelho. Entrou no rito tardiamente, como oração de ação de graças do sacerdote, e acabou fixado por São Pio V.",
          },
          {
            tipo: "rubrica",
            texto:
              "Todos se ajoelham em [lat]Et Verbum caro factum est[/lat]. Resposta final: [lat]Deo gratias[/lat]. Em certos dias lê-se um Último Evangelho próprio: por exemplo, no terceiro Natal, o Evangelho da Epifania; no Domingo de Ramos, o da bênção dos ramos.",
          },
        ],
      },
    ],
  },
  {
    id: "leoninas",
    numero: 12,
    titulo: "Orações Leoninas",
    resumo:
      "Depois das Missas rezadas, ajoelhado ao pé do altar. São orações prescritas por Leão XIII em 1884, acrescentadas depois do rito da Missa.",
    blocos: [
      {
        tipo: "lista",
        ordenada: true,
        itens: [
          "Três [b]Ave-Marias[/b];",
          "[b]Salve Rainha[/b], com o versículo [lat]Ora pro nobis, sancta Dei Genitrix[/lat];",
          "Oração [lat]Deus, refugium nostrum et virtus[/lat], pela liberdade e exaltação da Igreja;",
          "Oração a [b]São Miguel Arcanjo[/b], [lat]Sancte Michael Archangele, defende nos in proelio[/lat];",
          "Invocação, três vezes: «Coração Sacratíssimo de Jesus, tende piedade de nós», acrescentada por São Pio X.",
        ],
      },
      {
        tipo: "paragrafo",
        texto:
          "Pio XI, em 1929, determinou que fossem oferecidas pela conversão da Rússia. Foram suprimidas pela instrução [lat]Inter Oecumenici[/lat], de 1964, mas continuam em uso costumeiro em quase todas as capelas onde se celebra o rito antigo.",
      },
    ],
  },
];
