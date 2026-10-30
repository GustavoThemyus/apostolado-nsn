# Estampas dos folhetos

Todas tiradas dos **PDFs que o Perez manda**, com `ferramentas/folhetos/gerar.py`.
Não são escolha nossa: é a figura que ele pôs na folha impressa, e o site a
mostra porque o folheto nativo tem de ser a mesma folha.

Por isso a procedência de cada uma é a dele, e não nossa — nenhuma foi
pesquisada aqui nem conferida quanto a licença. Se alguma tiver de sair, a
decisão é do Perez; esta tabela existe para que o pedido tenha onde chegar.

| arquivo | o que mostra | PDF de origem | medidas |
| --- | --- | --- | --- |
| `cristo-rei-*` | Cristo Rei entronizado, com cetro e orbe | *OBRA INDULGENCIADA CRISTO REI* | 692x800 |
| `quinta-feira-santa-*` | A Última Ceia, ícone | *Indulgência — Quinta-feira Santa* | 640x359 |
| `sextas-feiras-da-quaresma-*` | A Crucifixão, ícone | *Indulgência — Todas as Sextas-feiras da Quaresma* | 720x347 |
| `sacratissimo-coracao-*` | O Sacratíssimo Coração nas mãos do Senhor | *Indulgência — Sacratíssimo Coração de Jesus* | 500x318 |
| `pedro-e-paulo-*` | São Pedro e São Paulo, ícone | *Indulgência — São Pedro e São Paulo, Apóstolos* | 532x768 |
| `ultimo-dia-do-ano-*` | A corte celeste em louvor à Trindade | *Indulgência — Último dia do ano civil* | 756x1008 |

Duas anotações que não se deduzem do arquivo:

- O folheto das **sextas-feiras da Quaresma** traz duas figuras: Cristo no
  Horto, na primeira página, e a Crucifixão, na segunda, ao lado da oração.
  Aqui entrou a segunda, porque a obra prescrita é rezar *diante da imagem de
  Jesus Cristo crucificado* — num celular, a estampa da página é a imagem que
  o fiel tem diante de si.
- A estampa do **último dia do ano** traz a marca d'água `Legião de Maria.com`
  gravada no canto inferior. Ela veio assim do PDF e não foi apagada: apagar
  marca de origem de imagem alheia é pior do que exibi-la.

O folheto do **primeiro dia do ano / Pentecostes** não tem estampa. O que o
PDF traz como imagem ali é a primeira estrofe do *Veni Creator* em notação
gregoriana; no site ela virou texto, como o resto do hino. O mesmo vale para a
primeira estrofe do *Tantum Ergo*, na Quinta-feira Santa.

## Os PDFs, no Drive do Apostolado

As sete folhas estão publicadas na pasta **Indulgências** do Drive do
Apostolado, partilhadas para quem tiver o link:

    https://drive.google.com/drive/folders/15Jb716KgLMlgKpNyyOsaVQ9JtAHJWGtR

O endereço de cada uma está no campo `arquivo` do folheto, em
`src/data/folhetos.json`, e é o que o site oferece no fim da página para quem
quiser imprimir. Conferidos os catorze endereços, os sete daqui e os sete dos
próprios: todos abrem sem login.

Dois nomes de arquivo não batem com o título da folha, e não é erro — a folha
manda:

- *Indulgência - Domingo de Pentecostes.pdf* é a do **primeiro dia do ano ou
  Domingo de Pentecostes**; o cabeçalho impresso traz os dois.
- *Indulgência - Nosso Senhor Jesus Cristo Rei.pdf* é a que a tabela acima
  chama de *OBRA INDULGENCIADA CRISTO REI*, renomeada no Drive desde então.

## Como gerar

Ver `COMO-GERAR.md`, ao lado deste arquivo.
