# O Ordinário da Missa, do PDF ao modo missa

As treze seções de `src/data/ordinario` não foram digitadas: saem do PDF do
Ordinário da Missa que o Perez montou, 52 páginas, uma tabela do Word de duas
colunas com o português à esquerda e o latim à direita.

```
python3 ferramentas/ordinario/gerar.py    <pdf>   grava
python3 ferramentas/ordinario/conferir.py <pdf>   confere
python3 ferramentas/ordinario/extrair.py  <pdf>   só mostra o rascunho
```

O PDF é de quem roda: ele não mora no repositório. Rodar de novo é seguro —
as seções são reescritas inteiras a partir dele, e nada do que está lá é lido
antes.

Hoje: **12 871 palavras**, treze seções, nenhuma perdida.

## Uma seção por arquivo

`src/data/folhetos.json` tem 170 KB num arquivo só, e quem abre um folheto
baixa os catorze. O Ordinário é maior. Por isso ele sai partido, uma seção por
arquivo, com `indice.ts` carregando cada uma só quando o leitor chega nela —
o mesmo arranjo de `src/data/ordo/indice.ts`.

Os oito ids do meio — `asperges`, `pe-altar`, `catecumenos`, `ofertorio`,
`canon`, `comunhao`, `conclusao`, `leoninas` — são os mesmos itens 5 a 12 do
guia prático, de propósito: é a mesma Missa contada duas vezes, uma explicando
e outra para rezar junto, e quem for de uma à outra cai no lugar certo.

O corte de cada seção é o **texto** do bloco que a abre, e não um número de
bloco: uma remessa nova do PDF que mude um título quebra o gerador em vez de
cortar a Missa no lugar errado.

## Os dez lugares do próprio

O impresso não inventa nada ali: escreve "Ver a Missa do dia" e segue. São
dez, e o extrator os reconhece pela frase. Quem lhes dá nome é a tabela
`PROPRIOS` do gerador, que confere o título logo acima de cada um — se o PDF
mudar de ordem ou perder um lugar, o gerador para.

| lugar | subtítulos do folheto |
| --- | --- |
| Intróito | Intróito |
| Oração | Oração |
| Epístola | Epístola |
| Gradual, Aleluia ou Tracto | Gradual, Aleluia, Tracto |
| Evangelho | Evangelho |
| Ofertório | Ofertório |
| Secreta | Secreta |
| Prefácio | Prefácio |
| Comunhão | Comunhão |
| Pós-comunhão | Pós-Comunhão |

Dez lugares para os onze subtítulos que os sete folhetos de próprio trazem,
porque no impresso o Gradual e o Aleluia são um só.

## Como as colunas se separam

Pela posição que o `pdftohtml -xml` dá a cada fragmento, e não por adivinhação
de layout. A tabela do Word sai dali célula a célula — a portuguesa inteira,
depois a latina —, e é a junção por altura que remonta a linha com os dois
lados lado a lado.

| no PDF | vira |
| --- | --- |
| Arial, de qualquer corte, sem fonte de corpo na linha | rubrica |
| centrado, começando em negrito, sem goteira no meio | título |
| "Ver a Missa do dia", em Arial | lugar do próprio |
| redondo à esquerda / à direita | português / latim do mesmo bloco |
| um fragmento que passa do meio e não para | prosa de largura inteira |

`extrair.py` é parente de `ferramentas/proprios/extrair.py` e de propósito
separado dele: as regras de lá foram afinadas contra sete folhas de próprio, e
este é outro impresso, com outras armadilhas.

## As armadilhas, que estão comentadas uma a uma no código

- **A fonte que o poppler só declara uma vez.** Cada `<fontspec>` aparece na
  primeira página em que a fonte é usada, e dali por diante o arquivo a cita
  pelo id. Lendo as declarações página a página, da página 6 em diante **toda**
  rubrica caía como texto de corpo.
- **O Calibri no meio de uma palavra latina.** A página 19 recorre a ele para
  desenhar o "í" de "incéndere" e o "ó" de "odórem". Tratar toda fonte que não
  é Times como rubrica partia a palavra em "cere" e "in od"; e as duas vogais
  descem dez pixels dentro da linha, o que, com a folga antiga de 8px, fazia
  delas uma linha só, solta noutro lugar.
- **A linha de corpo que cruza o meio da página.** O português que chega ao
  fim da largura vai de 43 a 858 e começa num "S." em negrito: pela regra
  "centrada e em negrito", o Kyrie inteiro saía como nove títulos. O que
  separa um caso do outro é onde a linha **começa** — nenhuma linha de coluna
  nasce adentro das margens 43 e 455.
- **As palavras da consagração.** Vêm em versalete recuado, em negrito, e
  cruzam o meio como um título cruzaria. Quem as denuncia é a goteira entre as
  colunas: nos títulos de verdade o maior vão interno é zero, e ali é 242.
- **A rubrica que mora dentro da coluna.** "(três vezes)", "(Todos se
  inclinam)", "(Três vezes)" — a primeira palavra cabe na linha do corpo e o
  resto transborda para a linha seguinte, que é Arial inteira e passava por
  rubrica nova: saía "inclinam) inclinam)" de bloco, com um "(Todos se"
  pendurado no corpo. Quem as denuncia é o parêntese sem fecho, e no impresso
  inteiro só estas três linhas o têm aberto.
- **A fala que começa no meio da linha.** O "℟. Amém." do fim do Asperges vem
  emendado na oração do lado português e em linha só sua do lado latino, e os
  dois lados ficavam com números de parágrafo diferentes, que
  `conteudo.teste.ts` reprova. Partindo pelos dois lados com a mesma régua —
  fala depois de ponto final —, eles voltam a casar. Conferidas as onze
  ocorrências, todas são fala de verdade: nenhum "S. Pedro" é partido.
- **A oração que só tem português.** Três são assim no impresso: a de Santo
  Ambrósio, a de Santo Tomás de Aquino e a "Deus e Senhor nosso, protegei a
  vossa Igreja". Saem como parágrafo, e não como bilíngue de latim vazio.
- **A cruz da bênção.** O Word a escreveu em Wingdings, código 0x58, que o
  `pdftohtml` entrega como U+F058, na área de uso privado, que nenhuma fonte
  do site desenharia. Desenhando o glifo em 150dpi vê-se uma cruz de quatro
  braços que alargam nas pontas, simétrica nos dois eixos: é a cruz pátea,
  U+2720, e não a latina nem um xis.
- **A prosa que não é tabela.** Nem tudo no impresso tem duas colunas: a
  epígrafe e as quatro citações do Magistério, a oração preparatória, as de
  ação de graças e a "Deus e Senhor nosso, protegei a vossa Igreja" correm na
  largura inteira. São 102 linhas, e o corte no meio da página as picava — a
  epígrafe saía com "lex credendi" do lado latino e o resto embaralhado do
  português. Quem as denuncia é o fragmento que passa do meio e não para:
  numa linha de coluna o texto acaba em 446, com três exceções que vão a 453;
  na prosa ele vai a 858.
- **O parágrafo da prosa, que não tem célula.** Na tabela o parágrafo é a
  célula, e quem o parte é a fala; na prosa corrida não há nem uma coisa nem
  outra, e as quatro citações do Magistério saíam num parágrafo só de
  trezentas palavras. Quem as separa é o salto entre as linhas: dentro de um
  parágrafo elas andam de 30 a 32 pixels, e entre dois o salto nunca é menor
  que 46. A mesma régua vale para duas rubricas seguidas, que andam de 27 a
  31 por dentro e saltam 43 ou mais entre uma e outra.
- **Os dois lados colados num fragmento só.** O `pdftohtml` entrega cada
  célula em seu fragmento, salvo uma vez: na terceira invocação do Agnus Dei
  da página 34 ele junta as duas num fragmento de 43 a 858, e o português ia
  ao ar com o latim pendurado no fim. As outras duas invocações, de texto
  igual, vêm separadas como todas. A tabela `COLADOS` as separa pelo texto
  exato, e cada entrada tem de servir uma vez: uma remessa nova que arrume a
  colagem **quebra** o extrator em vez de passar calada.
- **A rubrica que explica a palavra latina dentro de si.** Três há na página
  35, sobre o que muda no Agnus Dei nas Missas de Defuntos e na Quinta-feira
  Santa: a rubrica em Arial e, no meio dela, a palavra a dizer em letra de
  corpo. A linha não é toda Arial, então não entra pela rubrica, e é de uma
  coluna só, então não é tabela — mas é a continuação da rubrica de cima, e
  com ela emenda.
- **O título centrado sem espaços.** Chega em fragmentos — "ORDINÁRIO", "DA",
  "MISSA" —, nenhum deles com espaço: colados davam "ORDINÁRIODAMISSA".

## A conferência

`conferir.py` conta as palavras do PDF e as das treze seções e compara. É
grosseiro de propósito — não julga ordem nem pontuação —, mas responde a única
pergunta que uma transcrição automática precisa responder antes de ir ao ar:
**sumiu alguma palavra, ou apareceu alguma que não estava lá?** As armadilhas
acima apareceram quase todas por aí.

Duas coisas custaram uma rodada na própria conferência, e valiam para
`ferramentas/proprios/conferir.py` também, onde já estão corrigidas:

- A marcação do texto rico não se tira do lado do PDF, que marcação nenhuma
  tem.
- E não se tira por `\[/?[a-z]+\]`, porque o impresso põe entre colchetes as
  palavras que o tradutor acrescentou — "[fieis]", "[vindo]", "[celestes]" —,
  e a regra larga as apagava. A lista de marcas é fechada.

Contar palavras responde se alguma sumiu, não se ela está onde devia: isso
quem vê é o Perez, lendo.

## O que ficou de fora

- **Correção de latim.** Nada sai corrigido em silêncio; este gerador não tem
  tabela de erratas porque, lido o impresso, não apareceu gralha. Se aparecer,
  entra numa tabela `ERRATAS` como em `ferramentas/proprios/gerar.py`, para ir
  ao Perez e para que uma remessa corrigida **quebre** o gerador em vez de
  passar calada.
- **A quebra em versículos.** O impresso traz cada oração num parágrafo de
  cada lado, salvo onde há diálogo, e é assim que ela fica.
