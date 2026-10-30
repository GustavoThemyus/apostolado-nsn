# Próprios da Missa, do PDF ao folheto

Os próprios que estão em `src/data/folhetos.json` com `"categoria": "proprio"`
não foram digitados: saem dos PDFs que o Ordo do Apostolado já anexa a cada
dia — os mesmos do "Confira o próprio da Missa", no calendário.

```
python3 ferramentas/proprios/gerar.py   <pasta com os PDFs>   grava
python3 ferramentas/proprios/conferir.py <pasta com os PDFs>  confere
```

A pasta é de quem roda: os PDFs não moram no repositório. O endereço de cada
um está na tabela `PROPRIOS` do gerador, ao lado do nome do arquivo, e é dele
que sai também o campo `arquivo` do folheto — a folha no site e o PDF no
Drive são a mesma coisa, e quem quiser imprimir tem de chegar ao segundo.

Rodar de novo é seguro: cada folheto é substituído pelo id, no lugar em que
está, e o que não está na tabela não é tocado.

## Como as duas colunas se separam

O PDF é bilíngue em duas colunas, português à esquerda e latim à direita. O
que as separa aqui não é adivinhação de layout: é a posição de cada fragmento
na página, que o `pdftohtml -xml` entrega junto com o negrito e o itálico.

| no PDF | vira |
| --- | --- |
| negrito, cruzando o meio da página | título de seção |
| itálico, só na coluna da esquerda | rubrica, ou subtítulo de comemoração |
| redondo à esquerda / à direita | português / latim do mesmo bloco |

Três armadilhas, que estão comentadas no código porque cada uma custou uma
rodada:

- **A linha que termina em hífen** emenda na seguinte sem espaço e **com** o
  hífen. Conferidas as sete folhas, todas as quebras assim são hífen de
  verdade — "aproxima-se", "Mostrai-nos", "salvar-nos-á" —, nenhuma é
  separação silábica: o Word não hifeniza sozinho.
- **O fragmento que atravessa a divisa.** No II Domingo o "O" de "Oblátis"
  vem no mesmo fragmento que o fim da linha portuguesa, "das  O", e cairia
  do lado de cá. Quem o denuncia é a caixa dele, que começa à esquerda da
  divisa e acaba à direita.
- **O itálico come os espaços de fora.** " Sl." marcado inteiro vira
  "confundidos.[i]Sl.[/i]", colado na palavra anterior.

## A conferência

`conferir.py` conta as palavras do PDF e as do folheto e compara. É grosseiro
de propósito — não julga ordem nem pontuação —, mas responde a única pergunta
que uma transcrição automática precisa responder antes de ir ao ar: **sumiu
alguma palavra?** As três armadilhas acima apareceram todas por aí, e nenhuma
delas o olho pegaria num texto litúrgico de mil palavras.

Hoje: 11 397 palavras nos sete próprios, nenhuma perdida.

## As erratas

Quatro gralhas dos PDFs saem corrigidas no site, e estão listadas uma a uma em
`ERRATAS`, no gerador:

| no PDF | no site | vezes |
| --- | --- | --- |
| `Fílium tumm` | `Fílium tuum` | 9 |
| `Fatres:` | `Fratres:` | 2 |
| `discípu lis` | `discípulis` | 1 |
| `(ls XL,5)` | `(Is XL,5)` | 1 |

São gralhas de digitação, não variantes. A lista existe para ir ao Perez, para
que a conferência continue exata, e para que uma remessa nova que as conserte
**quebre** o gerador em vez de passar calada: se a conta não bater, o PDF
mudou, e aí se relê. Fora desta lista, nada de correção silenciosa de latim —
o que não estiver aqui vai ao ar exatamente como ele escreveu.

## O que ficou de fora

- **A estampa.** Estes PDFs não trazem figura como os folhetos de indulgência;
  se trouxerem, é `ferramentas/folhetos/gerar.py` que a extrai.
- **O cabeçalho.** Nome da festa, data e grau não viram bloco: viram título e
  resumo do folheto, escritos à mão na tabela `PROPRIOS`, porque cada folha os
  arruma à sua maneira — o domingo começa pelo nome, a festa começa pela data.
- **Um bloco por seção, por língua.** O impresso traz o Intróito inteiro num
  parágrafo de cada lado, e é assim que ele fica. Quebrar o Evangelho em
  versículos casados linha a linha seria outro trabalho, e `conteudo.teste.ts`
  exige que os dois lados tenham o mesmo número de parágrafos.
