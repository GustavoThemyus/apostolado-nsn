# Guia NSN

Guia do Rito Romano na forma do Missal de São Pio V, do Apostolado NSN.

Aplicação React em Vite, escrita para ser lida principalmente no celular:
layout de coluna única a partir de 320px, tabelas que viram fichas empilhadas
em tela estreita, sumário em folha deslizante, tema claro/escuro e alvos de
toque de 44px.

## Design system

As cores saíram por amostragem das imagens em `design_system/`: o brasão
(campo azul estrelado, borda e fita douradas, lírio branco) e o impresso em
papel damasco.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--papel` | `#F0ECE1` | `#14142C` | fundo; papel damasco / campo do escudo |
| `--painel` | `#F8F5EC` | `#1D1D3D` | caixas, sumário |
| `--tinta` | `#1F1E3A` | `#ECE7D8` | corpo do texto |
| `--tinta-suave` | `#5A5670` | `#A8A2BB` | texto secundário |
| `--ouro-tinta` | `#7A6026` | `#E9DA93` | numeração, etiquetas, títulos de apoio |
| `--ouro` | `#A3863F` | `#D0BA74` | filetes e bordas (decorativo) |
| `--rubrica` | `#A32220` | `#E08A80` | rubricas do missal |
| `--elo` | `#2E3A70` | `#9FB6E2` | links e etiqueta Ordinário |

Todo par de texto sobre fundo passa de 5:1 nos dois temas. `--ouro` fica em
2.95:1 no claro e por isso só entra em filete e borda, nunca em texto; para
texto dourado existe `--ouro-tinta`.

O vermelho não vem do brasão, mas continua no sistema porque é conteúdo: a
rubrica impressa é vermelha por definição, e o guia explica isso na seção 1.
Foi só reaquecido para conviver com o creme e o dourado. Como consequência, o
vermelho passou a ser exclusivo de rubrica, e a numeração e as etiquetas que
antes eram vermelhas foram para o dourado.

### Tipografia

| Papel | Fonte | De onde veio |
| --- | --- | --- |
| Títulos | Playfair Display | o display azul do impresso da Epifania |
| Corpo | EB Garamond | a página de novena |
| Etiquetas e interface | Inter | a assinatura institucional no rodapé do impresso |

### Ornamentos

`src/styles/damasco.svg` é a fonte do padrão damasco, embutido em `tema.css`
como data URI e aplicado por `mask-image` na classe `.damasco`. A cor vem de
`--damasco-cor`, então ele fica azul sobre creme e dourado sobre azul. Só
aparece no cabeçalho e no sumário flutuante, nunca atrás do texto corrido.

O brasão está em `public/brasao.png` (cabeçalho, favicon) e
`public/brasao-pequeno.png` (barra), recortados do original com fundo
transparente. A estrela de oito pontas do campo do escudo vira ornamento no
componente `Estrela`.

## Comandos

```bash
npm install
npm run dev            # servidor de desenvolvimento
npm run build          # checagem de tipos e build de produção em dist/
npm run preview        # serve o build de produção
npm run checar-tipos   # só a checagem de tipos
```

## Como o projeto está organizado

```
src/
  components/    peças de interface, uma por arquivo
  data/          o conteúdo do guia, separado da apresentação
  hooks/         tema, seção ativa e progresso de leitura
  styles/        tokens em tema.css, layout em base.css, damasco.svg
public/          brasão recortado, usado como marca e favicon
design_system/   as imagens de referência da identidade
legado/          o arquivo HTML único que deu origem ao projeto
```

### Componentes

| Componente        | O que faz                                                  |
| ----------------- | ---------------------------------------------------------- |
| `BarraSuperior`   | barra fixa com marca, seção atual e barra de progresso      |
| `Cabecalho`       | brasão, chamada, título, descrição e epígrafe latina         |
| `Brasao`          | brasão do Apostolado, em dois tamanhos                       |
| `Estrela`         | estrela de oito pontas usada como ornamento                  |
| `Sumario`         | índice, embutido na página ou em folha deslizante           |
| `SeletorDeTema`   | alterna entre sistema, claro e escuro                       |
| `Secao`           | uma seção numerada do guia                                  |
| `Bloco`           | escolhe o componente certo para cada bloco de conteúdo      |
| `Passo`           | uma peça da Missa, com número e etiqueta litúrgica          |
| `Rubrica`         | texto vermelho de rubrica                                   |
| `Oracao`          | citação com latim e tradução                                |
| `Nota`            | caixa de observação, normal ou de alerta                    |
| `Tabela`          | tabela responsiva, com nome da coluna em tela estreita      |
| `Legenda`         | lista de chaves de leitura                                  |
| `Etiqueta`        | Ordinário, Próprio, Variável ou Comum                       |
| `TextoRico`       | interpreta a marcação mínima do conteúdo                    |
| `Rodape`          | nota final e assinatura do Apostolado                       |

### Marcação do conteúdo

O texto fica em `src/data/` como string, com uma marcação curta que o
`TextoRico` converte em elementos React (nunca em HTML cru):

| Marca            | Vira                        |
| ---------------- | --------------------------- |
| `[lat]...[/lat]` | latim, em itálico           |
| `[b]...[/b]`     | destaque forte              |
| `[i]...[/i]`     | itálico comum               |
| `[r]...[/r]`     | rubrica no meio do parágrafo |

Quebra de linha dentro de uma célula ou parágrafo: `\n`.

### Como acrescentar conteúdo

Cada seção é um objeto `Secao` com `id`, `numero`, `titulo`, `resumo` opcional
e uma lista de `blocos`. Os tipos estão em `src/data/tipos.ts`, e as seções
são reunidas em `src/data/guia.ts`. O sumário se monta sozinho a partir dessa
lista, então basta acrescentar a seção no arquivo do grupo correspondente.
