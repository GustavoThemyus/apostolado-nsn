/**
 * Modelo de conteúdo do guia.
 *
 * O texto corrido usa uma marcação mínima, interpretada por <TextoRico>:
 *   [lat]...[/lat]        termo ou citação em latim
 *   [b]...[/b]            destaque forte
 *   [i]...[/i]            itálico comum (títulos de obras, ênfase)
 *   [r]...[/r]            rubrica embutida no meio de outro texto
 *   [nota]12[/nota]       chamada de nota; o texto vem de `Conteudo.notas`
 *   [elo:ancora]...[/elo] link para outro ponto da mesma página
 *   [elo:/rota]...[/elo]  link para outra página do site
 *   [elo:https://...]     link externo, que abre em outra aba
 *   [botao:/rota]...[/botao]   o mesmo, com cara de botão: para o elo que é o
 *                              destino da página, e não uma nota de rodapé
 *   [mapa:consulta]...[/mapa]  abre as opções de Maps e Waze para um endereço
 */

/** Classificação litúrgica de cada peça da Missa. */
export type Etiqueta = "ordinario" | "proprio" | "variavel" | "comum";

export const NOME_DA_ETIQUETA: Record<Etiqueta, string> = {
  ordinario: "Ordinário",
  proprio: "Próprio",
  variavel: "Variável",
  comum: "Comum",
};

/** Um versículo citado, com o latim e a tradução de trabalho. */
export interface Verso {
  latim?: string;
  portugues?: string;
}

export interface ItemDeLegenda {
  chave: string;
  etiqueta: Etiqueta;
  texto: string;
}

/** Identificador estável de um bloco, usado pelo painel de edição. */
export interface ComId {
  id?: string;
}

export type Bloco = ComId &
  (
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "rubrica"; texto: string }
    | { tipo: "assembleia"; texto: string }
  | { tipo: "subtitulo"; texto: string; ancora?: string; menor?: boolean }
  /** Fio que separa o latim da tradução, como no impresso. */
  | { tipo: "separador" }
  /**
   * Oração nas duas línguas, lado a lado.
   *
   * No impresso o latim vem antes e a tradução depois, separados por um fio,
   * porque a página de livro não comporta duas colunas. A tela larga comporta,
   * e é como um missal bilíngue se lê. Abaixo do ponto de quebra volta a ser
   * empilhado: em 390px cada coluna teria dezoito caracteres de largura.
   */
  | { tipo: "bilingue"; latim: Bloco[]; portugues: Bloco[] }
  /** O índice completo do documento, derivado das seções. */
  | { tipo: "indice" }
  | { tipo: "lista"; ordenada?: boolean; itens: string[] }
  | { tipo: "oracao"; versos: Verso[] }
  | { tipo: "nota"; titulo: string; paragrafos: string[]; alerta?: boolean }
  | { tipo: "tabela"; colunas: string[]; linhas: string[][] }
  | { tipo: "legenda"; itens: ItemDeLegenda[] }
    | {
        tipo: "passo";
        /** @deprecated Derivado da posição. Continua nos dados antigos, e é ignorado. */
        numero?: number;
        etiqueta: Etiqueta;
        titulo: string;
        tituloLatim?: string;
        corpo: Bloco[];
      });

export interface Secao {
  id: string;
  /**
   * Fica no corpo, mas fora do índice e sem número.
   *
   * É para o que o apostolado escreve em torno de um documento oficial: a
   * apresentação é nossa, e listá-la junto das partes do Enchiridion daria a
   * entender que faz parte do material original.
   */
  foraDoIndice?: boolean;
  /** @deprecated Derivado da posição. Continua nos dados antigos, e é ignorado. */
  numero?: number;
  titulo: string;
  /** Linha em itálico logo abaixo do título. */
  resumo?: string;
  blocos: Bloco[];
}

/**
 * A forma comum das páginas de conteúdo. O guia e as indulgências já a
 * satisfaziam, então não houve migração de dados.
 */
export interface Conteudo {
  titulo: string;
  descricao?: string;
  /** @deprecated A chamada é do site inteiro e vive em site.json. */
  chamada?: string;
  /**
   * Antífona de abertura, em latim, no alto do documento.
   *
   * Tem lugar próprio, e não o do lema: o lema é do brasão e é o mesmo em
   * toda página, enquanto a antífona é daquele texto. Quando as duas
   * dividiam a mesma linha, a antífona ganhava e o "Iter para tutum" sumia
   * justamente das páginas mais longas.
   */
  epigrafe?: string;
  /** Marca a página como ainda por escrever, para o aviso aparecer. */
  emPreparacao?: boolean;
  /** Texto provisório, a ser substituído pelo definitivo. */
  rascunho?: boolean;
  /**
   * As notas do documento, da chamada para o texto.
   *
   * Ficam num mapa à parte, e não no meio do texto, porque a mesma nota é
   * citada de vários pontos e porque a chamada precisa mostrá-la onde ela é
   * lida, e não no fim do capítulo.
   */
  notas?: Record<string, string>;
  secoes: Secao[];
}

/**
 * Uma postagem: vida de santo ou escrito sobre a liturgia.
 *
 * `blocos` são os mesmos dez tipos do guia, então o corpo já sabe renderizar
 * rubrica, citação e latim sem nada novo.
 */
export interface Postagem {
  /** Vai na URL. Imutável depois de publicada, senão os links quebram. */
  id: string;
  titulo: string;
  resumo: string;
  /** ISO, AAAA-MM-DD. Ordena a faixa do início. */
  data: string;
  categoria: "santo" | "liturgia" | "aviso";
  /**
   * A que celebração a postagem se liga, para o calendário poder apontá-la.
   * Por nome, quando a postagem acompanha a festa aonde quer que ela vá; por
   * mês e dia, quando está presa à data.
   *
   * Mais de um nome quando os dois calendários chamam a festa de modos que
   * não se contêm: a Titular é "Nossa Senhora das Neves" no motor de 1962 e
   * "Dedicação de Santa Maria das Neves" no Ordo da capela, e nenhum dos dois
   * cabe dentro do outro.
   */
  festa?: { nome: string | string[] } | { mes: number; dia: number };
  /** Caminho em /public. Sem ela a faixa mostra o brasão. */
  imagem?: string;
  /** As medidas da estampa, como ela está no arquivo. Ver `Folheto.largura`. */
  largura?: number;
  altura?: number;
  /**
   * As notas de rodapé, da chamada para o texto: `{ "1": "São Cirilo…" }`.
   *
   * Mesmo mapa do `Conteudo`, porque é o mesmo `[nota]1[/nota]` do texto
   * rico. Sem ele a chamada não some — vira o número solto, sem balão —, e
   * uma vida de santo que cita encíclicas ficaria afirmando sem dizer de
   * onde.
   */
  notas?: Record<string, string>;
  /** Falso esconde do site inteiro, para escrever com calma. */
  publicado?: boolean;
  /** Texto provisório: mostra o aviso de rascunho. */
  rascunho?: boolean;
  blocos: Bloco[];
}

/**
 * Um folheto: o impresso que o Apostolado distribui, servido como página.
 *
 * O Perez pediu que o folheto abrisse como documento corrido — cabeçalho do
 * site, a folha inteira sem quebra de página, rodapé do site — em vez de um
 * PDF que o fiel tem de baixar e dar zoom para ler no celular.
 *
 * O corpo usa os mesmos blocos do resto do site. Isso não é economia: é o que
 * faz a oração bilíngue do folheto casar linha a linha como no impresso, e o
 * latim ser lido como latim por quem usa leitor de tela. Um formato próprio
 * de folheto teria de reconquistar as duas coisas.
 */
export interface Folheto {
  /** Vai na URL. Imutável depois de publicado, senão os links impressos quebram. */
  id: string;
  /**
   * A linha acima do título, que diz de que gênero é a folha.
   *
   * "Obra indulgenciada", "Próprio da Missa", "Canto de procissão". No
   * impresso ela vem em caixa alta e maior que o título; aqui é o título que
   * manda, porque é ele que vai para a aba do navegador e para o WhatsApp.
   */
  chapeu?: string;
  titulo: string;
  resumo: string;
  categoria: CategoriaDeFolheto;
  /** A figura da folha, em /public/folhetos. Gerada de ferramentas/folhetos. */
  imagem?: string;
  /**
   * As medidas da figura, em pixels, como ela está no arquivo.
   *
   * Vão junto com `imagem` e saem da mesma ferramenta, porque é delas que o
   * navegador tira a proporção antes de a imagem chegar. Fixas no componente,
   * como estavam, toda folha herdava a proporção da primeira: a estampa de
   * Cristo Rei é retrato e a da Quinta-feira Santa é paisagem, e o texto
   * saltava ao carregar.
   */
  largura?: number;
  altura?: number;
  /**
   * A obra indulgenciada: o que se tem de fazer para lucrar a indulgência.
   *
   * Campo, e não bloco de rubrica. No impresso ela é vermelha e em itálico,
   * que é o registro da rubrica no site — mas rubrica diz gesto e posição, e
   * o bloco traz o sinal ℞ junto. Aqui o que se afirma é o que a Igreja
   * concede, e sai na ordem do impresso: a obra, quem a concedeu, e então a
   * oração.
   */
  obra?: string;
  /**
   * De onde vem a concessão: "Concessão nº 2 do Enchiridion Indulgentiarum".
   *
   * Linha curta, logo abaixo do que se concede. Sem ela o folheto afirmaria
   * uma indulgência sem dizer quem a concedeu, que é o que o impresso nunca
   * faz.
   */
  concessao?: string;
  /**
   * Fecha com as condições ordinárias para lucrar indulgência plenária.
   *
   * É verdadeiro nas obras indulgenciadas e falso no resto. O texto não fica
   * aqui: é o mesmo em toda folha do gênero, e repeti-lo em cada uma faria
   * com que corrigir uma vírgula exigisse corrigir vinte arquivos. Mora uma
   * vez só em `folhetos.json`, na raiz da coleção.
   */
  condicoes?: boolean;
  /** Falso esconde do site inteiro, para preparar com calma. */
  publicado?: boolean;
  /** Texto provisório: mostra o aviso de rascunho. */
  rascunho?: boolean;
  blocos: Bloco[];
}

export type CategoriaDeFolheto = "indulgencia" | "proprio" | "canto" | "oficio";

export const NOME_DA_CATEGORIA: Record<CategoriaDeFolheto, string> = {
  indulgencia: "Obras indulgenciadas",
  proprio: "Próprios da Missa",
  canto: "Cantos e procissões",
  oficio: "Ofícios e vésperas",
};

export interface ColecaoDeFolhetos {
  titulo: string;
  descricao?: string;
  /** As condições ordinárias, escritas uma vez e usadas por `condicoes`. */
  condicoes: { titulo: string; blocos: Bloco[] };
  folhetos: Folheto[];
}

export interface ColecaoDePostagens {
  titulo: string;
  descricao?: string;
  postagens: Postagem[];
}

/**
 * Os textos de uma página, fora do corpo dela.
 *
 * É o que o leitor vê sem rolar: o título da aba e do cabeçalho, o rótulo do
 * menu, a descrição que aparece no cartão da seção e na prévia ao
 * compartilhar, a linha em versalete e a estampa atrás do cabeçalho.
 *
 * Mora em `paginas.json`, separado do corpo, porque **uma página pode não ter
 * corpo e ainda assim ter cabeçalho**: o calendário e as postagens são
 * montados por código e não têm documento nenhum, mas precisam de título e
 * descrição como qualquer outra.
 */
export interface TextoDaPagina {
  /** Vai para o título da aba, para o cabeçalho e para as migalhas. */
  titulo: string;
  /** Onde o título inteiro não cabe: a barra do alto e os atalhos da seção. */
  curto?: string;
  /** Uma linha. Abaixo do título, no cartão da seção e na prévia do WhatsApp. */
  descricao?: string;
  /**
   * A linha em versalete dourado acima do título.
   *
   * Sem valor próprio, herda da página mãe e, na falta dela, usa a do site.
   * O rito só se anuncia onde a página fala da Missa; no calendário e nas
   * indulgências ele seria ruído.
   */
  chamada?: string;
  /**
   * A estampa da seção, em /public.
   *
   * Vale para a seção inteira, herdada pelas filhas: é ela que identifica a
   * seção no cartão e atrás do cabeçalho de toda página dela.
   */
  imagem?: string;
}

/** O que é do site inteiro, e não de uma página. */
export interface Site {
  /** A linha em versalete dourado acima do título, igual em toda página. */
  chamada: string;
  marca: string;
  marcaCurta: string;
  lema: string;
  rodape: string[];
  /**
   * Quem fez o site, numa linha, no fim do rodapé.
   *
   * Fica aqui, e não no código, porque é texto do site: o Apostolado pode
   * reescrevê-lo pelo painel sem pedir nada a ninguém. Aceita a mesma
   * marcação do resto, então o nome pode levar a algum lugar.
   */
  credito?: string;
  agendas: Agenda[];
  /** Os retratos da lateral das páginas, no computador. */
  lateral?: Retrato[];
}

/**
 * Um retrato da lateral: o Papa, o Arcebispo, a Padroeira.
 *
 * `imagem` vazia quer dizer que o arquivo ainda não chegou, e aí o retrato não
 * aparece: um quadro vazio com "Papa Leão XIV" embaixo, repetido em todas as
 * páginas, parece defeito e não espera.
 */
export interface Retrato {
  id: string;
  /** "Soberano Pontífice": o ofício, em cima. */
  titulo: string;
  /** "Papa Leão XIV": quem, embaixo. */
  nome: string;
  imagem: string;
}

/**
 * Um dia de um calendário do Google, já lido do iCal.
 *
 * Mora aqui, e não no Worker que o produz, porque a tela também o consome.
 * Posto lá, o `import type` do cliente arrastava `worker/agenda.ts` para o
 * projeto do navegador, que não conhece os tipos da Cloudflare e passava a
 * reprovar o `cf` do fetch.
 */
export interface ItemDeAgenda {
  /** AAAA-MM-DD */
  data: string;
  titulo: string;
  /**
   * O cabeçalho da descrição, quando o redator escreveu um.
   *
   * Nos calendários de indulgência do Apostolado o título de todo evento é
   * "Indulgência Plenária", e a festa vem na primeira linha da descrição.
   * Quem a separa da obra é `partirDescricao`, no Worker.
   */
  festa?: string;
  /** O corpo da descrição, em parágrafos separados por linha em branco. */
  descricao?: string;
  /** Cor litúrgica, quando o título vem marcado com ela. */
  cor?: CorDaAgenda;
}

export type CorDaAgenda =
  | "branco"
  | "vermelho"
  | "verde"
  | "roxo"
  | "preto"
  | "rosa"
  | "ouro";

/** Um calendário do Google que o fiel pode vincular ao aparelho dele. */
export interface Agenda {
  id: string;
  nome: string;
  descricao?: string;
  /** Onde ela aparece no site. */
  grupo: "ordo" | "indulgencias" | "indulgencias-apostolado";
  /** Identificador do calendário, que só funciona se ele for público. */
  google: string;
}
