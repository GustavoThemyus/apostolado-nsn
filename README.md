# Apostolado Nossa Senhora das Neves

O site do Apostolado Nossa Senhora das Neves, em <https://ansn.com.br>: o guia
da Missa no Rito Romano na forma do Missal de São Pio V, o calendário
litúrgico calculado, as indulgências e as publicações da capela.

Aplicação React em Vite, servida por um Worker da Cloudflare. Escrita para ser
lida principalmente no celular, em dados móveis: coluna única a partir de
320px, tabelas que viram fichas empilhadas em tela estreita, sumário em folha
deslizante, tema claro e escuro, e alvos de toque de 44px.

Nada aqui é genérico por acaso. O vocabulário do código é português — classes,
funções, tipos e comentários —, porque é a língua de quem escreve o conteúdo e
de quem vai manter isto depois.

## O que o site faz

| | |
| --- | --- |
| **Guia da Missa** | as cinquenta e cinco peças da Missa em ordem, com rubricas, latim e tradução |
| **Calendário** | o calendário de 1962 **calculado**, não tabelado: computo da Páscoa, precedência, transferências, Têmporas e Rogações |
| **Ordo pré-55** | o Ordo da capela, importado do calendário do Google, dia a dia |
| **Indulgências** | o Enchiridion de 1999 inteiro, os dias de plenária presos ao calendário, e o calendário arquidiocesano com 129 igrejas |
| **Postagens** | vidas de santos e escritos sobre a liturgia |
| **Painel** | `/admin`, atrás do Cloudflare Access, onde o conteúdo se edita sem tocar em código |

O calendário é o que só este código faz: uma indulgência presa a uma festa
acompanha a transferência dela sozinha, porque o motor sabe para onde a festa
foi. Um segundo calendário, tabelado, divergiria do primeiro na primeira
exceção.

## Comandos

```bash
npm install
npm run dev            # servidor de desenvolvimento, já exposto na rede local
npm test               # calendário, rotas, iCal, Ordo, indulgências, conteúdo e CSS
npm run build          # checagem de tipos e build de produção em dist/
npm run preview        # serve o build de produção
npm run checar-tipos   # só a checagem de tipos
npm run publicar       # build e publicação à mão (normalmente não é preciso)
```

`npm test` roda sete suítes sem dependência de teste: as verificações do
calendário em catorze anos, o casamento de rotas, a leitura de iCal, o Ordo, as
indulgências, a integridade do conteúdo e a conferência estrutural do CSS.
**Rode antes de publicar qualquer coisa que toque no calendário** — o Corpus
Christi já saiu verde uma vez, e quem denunciou foi o teste.

## Ver no celular durante o desenvolvimento

`vite.config.ts` está com `host: true`, então `npm run dev` já escuta na rede
local e imprime o endereço:

```
➜  Network: http://192.168.x.x:5173/
```

Abra no celular, na mesma Wi-Fi. Se não carregar, o firewall está bloqueando:

```bash
sudo ufw allow 5173/tcp
```

## Publicação

**Cada `git push` no `main` publica sozinho.** O repositório está ligado ao
Workers Builds, na conta da Cloudflare do Apostolado, que roda `npm run build`
e `npx wrangler deploy`. Não é preciso rodar comando nenhum.

Isso vale também para o painel: quando o Perez salva um texto em `/admin`, o
Worker grava um commit no repositório, o Builds vê o push e republica. O
histórico do git é o histórico das edições, com autor e possibilidade de
voltar atrás.

Para publicar à mão — útil quando a esteira está fora do ar:

```bash
npx wrangler@4.85.0 login
npm run publicar
```

A versão está presa em 4.85.0 porque a 4.86 em diante exige Node 22. O
`.nvmrc` já pede 22; depois de confirmar que tudo roda nele, a trava pode sair.

### Como o Worker serve o site

`wrangler.toml` na raiz. Três decisões que não são óbvias:

- **`account_id`** aponta para a conta do Apostolado, e não para uma conta
  pessoal. Domínio personalizado de Worker só alcança zona da mesma conta.
- **`workers_dev = false`**: o site tem domínio próprio, e um segundo endereço
  servindo o mesmo conteúdo só dividiria o que os buscadores veem.
- **`run_worker_first = true`**: sem isso, todo caminho que casa com um arquivo
  de verdade é servido sem chamar o Worker — e o redirecionamento de `www`
  funcionava em `/missa/guia` e falhava em `/`, que é o endereço que as pessoas
  compartilham.

`www.ansn.com.br` é domínio do próprio Worker e volta ao apex com 301.

### O endereço antigo

`redirecionador/` é um Worker de nove linhas, publicado numa conta separada,
que manda `apostolado-nsn.gustavothemyus.workers.dev` para `ansn.com.br`
preservando caminho e busca. **Não apague esse Worker:** o endereço antigo está
impresso na página 2 do PDF do calendário arquidiocesano que o Apostolado
distribui, e apagá-lo liberaria o nome e transformaria aqueles links em erro.

### Cache

`public/_headers` define o cache: os arquivos de `assets/` levam impressão do
conteúdo no nome e ficam guardados para sempre, enquanto o HTML nunca fica em
cache, para que uma correção apareça na hora para quem já visitou. É também por
isso que trocar uma imagem exige trocar o nome do arquivo.

## O painel

`/admin` lista os dezessete documentos editáveis e abre cada um em
`/admin/<id>`. Um deles é `paginas.json`, que guarda o título, a descrição
e a chamada de cada página: a estrutura das rotas é código, mas o que se lê
no alto delas é conteúdo. Quem traduz um id em caminho de arquivo é `src/data/registro.ts`,
**no servidor**: aceitar um caminho vindo do navegador daria escrita em
qualquer arquivo do repositório, e o repositório publica sozinho.

A autenticação é do **Cloudflare Access**, com política de e-mails. O Worker
confere o token de novo por conta própria, para que a API não fique aberta se
um dia a rota for exposta por engano. `/api/agenda` é a exceção deliberada:
fica pública, porque é ela que deixa o visitante vincular os calendários ao
próprio celular.

Ao criar um bloco, a paleta mostra **o bloco de verdade**, renderizado pelo
mesmo componente do site e sob o mesmo `base.css`. Amostra pintada à mão
começaria certa e terminaria mentindo.

## Design system

As cores saíram por amostragem das imagens em `design_system/`: o brasão
(campo azul estrelado, borda e fita douradas, lírio branco) e o impresso em
papel damasco.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--papel` | `#f0ece1` | `#181821` | fundo |
| `--painel` | `#f8f5ec` | `#21222c` | caixas, sumário |
| `--tinta` | `#1f1e3a` | `#e8e3d6` | corpo do texto |
| `--tinta-suave` | `#5a5670` | `#a6a2a0` | texto secundário |
| `--ouro-tinta` | `#7a6026` | `#cab577` | numeração, etiquetas, títulos de apoio |
| `--ouro` | `#a3863f` | `#baa35e` | filetes e bordas (decorativo) |
| `--rubrica` | `#a32220` | `#e08a80` | rubricas do missal |
| `--elo` | `#2e3a70` | `#9fb6e2` | elos e etiqueta Ordinário |

Todo par de texto sobre fundo passa de 5:1 nos dois temas. `--ouro` fica em
2.95:1 no claro e por isso só entra em filete e borda, nunca em texto; para
texto dourado existe `--ouro-tinta`.

O vermelho não vem do brasão, mas continua no sistema porque é conteúdo: a
rubrica impressa é vermelha por definição. Como consequência, o vermelho é
exclusivo de rubrica, e a numeração e as etiquetas que antes eram vermelhas
foram para o dourado.

### Tipografia

| Papel | Fonte | De onde veio |
| --- | --- | --- |
| Títulos | Playfair Display | o display azul do impresso da Epifania |
| Corpo | EB Garamond | a página de novena |
| Etiquetas e interface | Inter | a assinatura institucional no rodapé do impresso |

O EB Garamond troca todo `u` por `v` em texto marcado como latim — é a forma
localizada que a fonte traz. `base.css` desliga isso com
`font-feature-settings: "locl" 0`, senão o lema do site aparece como
"ITER PARA TVTVM" em toda página.

### Ornamentos e o brasão

`src/styles/damasco.svg` é a fonte do padrão damasco, embutido em `tema.css`
como data URI e aplicado por `mask-image`. Só aparece no cabeçalho e no sumário
flutuante, nunca atrás do texto corrido.

O brasão vem em três artes, geradas por `ferramentas/brasao/gerar.py`:

| Arquivo | Onde |
| --- | --- |
| `brasao-9ea57f61.webp` | colorido: cabeçalho, menu e a página do brasão |
| `brasao-claro-*.webp` / `brasao-escuro-*.webp` | silhueta: barra do alto e selo do rodapé |
| `brasao-pequeno.png` | ícone da aba |
| `brasao.png` | ícone de toque do iOS e as folhas de rosto |

Qual silhueta aparece é decidido por `--brasao-mono`, no `tema.css`, junto do
resto que muda com o tema: repetido em cada regra, o nome do arquivo escaparia
de uma delas um dia, e a regra esquecida ficaria invisível num dos temas sem
erro nenhum para denunciar.

## Como o projeto está organizado

```
src/
  pages/         uma por rota; quase todas são cinco linhas sobre PaginaDeDocumento
  components/    peças de interface, uma por arquivo
  calendario/    o motor de 1962, o Ordo, as indulgências e as suítes
  routes/        roteador escrito à mão: tabela, casamento, Elo, Roteador
  admin/         o painel de edição
  data/          o conteúdo, em JSON, separado da apresentação
  hooks/         tema, seção ativa e progresso de leitura
  styles/        tokens em tema.css, layout em base.css, damasco.svg
worker/          o Worker: API do painel, Access, GitHub, agendas
ferramentas/     importadores e geradores (Ordo, Enchiridion, brasão, retratos)
redirecionador/  o Worker do endereço antigo
public/          imagens e _headers
legado/          o HTML único que deu origem ao projeto
```

O roteador é escrito à mão de propósito: não há loaders, revalidação nem dados
presos à rota, então o que sobra é casar uma string e renderizar. Pagar 10 a 15
KB comprimidos por isso, num orçamento de 82 KB e para quem lê em dados móveis,
não se sustenta.

## O conteúdo

Tudo em `src/data/`, em JSON, com um identificador por bloco para o painel
alterar um sem reescrever o resto. Os tipos estão em `src/data/tipos.ts`.

### Marcação

O texto é string com uma marcação curta que o `TextoRico` converte em elementos
React — nunca em HTML cru:

| Marca | Vira |
| --- | --- |
| `[lat]...[/lat]` | latim, em itálico e marcado para o leitor de tela |
| `[b]...[/b]` | destaque forte |
| `[i]...[/i]` | itálico comum |
| `[r]...[/r]` | rubrica no meio do parágrafo |
| `[nota]12[/nota]` | chamada de nota; o texto vem de `Conteudo.notas` |
| `[elo:ancora]...[/elo]` | outro ponto da mesma página |
| `[elo:/rota]...[/elo]` | outra página do site |
| `[elo:https://...]...[/elo]` | endereço externo, abre em outra aba |
| `[botao:/rota]...[/botao]` | o mesmo, com cara de botão: para o elo que é o destino da página |
| `[mapa:consulta]...[/mapa]` | abre as opções de Maps e Waze para um endereço |
| `[vermelho]...[/vermelho]` | as seis cores litúrgicas, escritas na própria cor |

Quebra de linha dentro de uma célula ou parágrafo: `\n`.

### Acrescentar conteúdo

Pelo painel, em `/admin`, que é como o Apostolado edita. Mexendo no JSON
direto, cada seção é um objeto `Secao` com `id`, `titulo`, `resumo` opcional e
uma lista de `blocos`; o número da seção **não se guarda**, é derivado da
posição, porque valor derivado que se guarda volta a divergir a cada mudança.

Dois documentos não se editam à mão: `src/data/ordo/` vem de
`ferramentas/ordo/` e `indulgencias-arquidiocese.json` vem de
`ferramentas/arquidiocese/`. Os dois têm LEIA-ME explicando por quê.

`src/data/conteudo.teste.ts` confere o que quebra calado: chamada de nota sem
nota, elo sem destino, nota que se cita dentro de si mesma, e a etiqueta "em
preparação" da rota contra o que cada página diz de si.

## Licença

O código está sob a licença MIT, em [LICENSE](LICENSE).

O conteúdo publicado e as imagens **não estão**: os textos são do Apostolado,
a tradução do Enchiridion é da CNBB, e o brasão é a identidade da instituição.
[LICENCA-DO-CONTEUDO.md](LICENCA-DO-CONTEUDO.md) diz o que é de quem e o que
precisa ser trocado por quem quiser reaproveitar o código.
