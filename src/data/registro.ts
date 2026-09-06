/**
 * Registro dos documentos de conteúdo.
 *
 * É a lista de tudo o que o painel pode editar, e o único lugar que sabe onde
 * cada coisa mora no repositório.
 *
 * SEGURANÇA: o cliente manda só o `id`; quem traduz para caminho é este
 * arquivo, do lado do servidor. Aceitar um caminho vindo da requisição daria
 * escrita arbitrária no repositório, e como ele está ligado ao Workers Builds,
 * isso seria execução de código na esteira de publicação.
 *
 * Sem imports: o Worker também carrega este módulo, e ele não pode arrastar
 * nada de React nem de DOM junto.
 */

/** Como o documento é editado e validado. */
export type Forma =
  /** Título, descrição e uma lista de seções. A maior parte das páginas. */
  | "documento"
  /** Marca, lema, rodapé e a agenda do Google: o que é do site, não de uma página. */
  | "site"
  /** A página inicial, com o mural de avisos e os blocos próprios dela. */
  | "inicio"
  /** A coleção de postagens. */
  | "postagens"
  /** Os dias que carregam indulgência. */
  | "diasDeIndulgencia";

export interface DocumentoRegistrado {
  id: string;
  /** Nome que o painel mostra. */
  titulo: string;
  /** Caminho no repositório. Nunca vem do cliente. */
  caminho: string;
  forma: Forma;
  /** Onde ele aparece no site, para o painel oferecer "ver publicado". */
  rota?: string;
  /** Uma linha de orientação para quem edita. */
  ajuda?: string;
}

const emDados = (arquivo: string) => `src/data/${arquivo}`;

export const REGISTRO: DocumentoRegistrado[] = [
  {
    id: "inicio",
    titulo: "Página inicial",
    caminho: emDados("inicio.json"),
    forma: "inicio",
    rota: "/",
    ajuda: "O mural de avisos fica aqui. É o que mais muda de semana para semana.",
  },
  {
    id: "site",
    titulo: "Identidade do site",
    caminho: emDados("site.json"),
    forma: "site",
    ajuda: "Nome, lema, rodapé e o endereço da agenda do Google. Mexe em todas as páginas.",
  },
  {
    id: "missa",
    titulo: "A Missa Tridentina",
    caminho: emDados("missa.json"),
    forma: "documento",
    rota: "/missa",
    ajuda: "Texto curto de abertura da seção da Missa.",
  },
  {
    id: "guia",
    titulo: "Guia prático da Missa",
    caminho: emDados("guia.json"),
    forma: "documento",
    rota: "/missa/guia",
    ajuda: "O guia da Missa parte por parte.",
  },
  {
    id: "missa-partes",
    titulo: "Da Missa e suas partes",
    caminho: emDados("missa-partes.json"),
    forma: "documento",
    rota: "/missa/partes",
    ajuda: "O guia detalhado, com origem histórica, sentido espiritual e rubricas.",
  },
  {
    id: "missa-canonica",
    titulo: "A situação canônica da Missa",
    caminho: emDados("missa-canonica.json"),
    forma: "documento",
    rota: "/missa/situacao-canonica",
    ajuda: "A parte jurídica: rubricas, movimento litúrgico, o rito depois do Concílio.",
  },
  {
    id: "calendario-brasil",
    titulo: "O próprio do Brasil",
    caminho: emDados("calendario-brasil.json"),
    forma: "documento",
    rota: "/calendario/brasil",
    ajuda: "As festas próprias do Brasil.",
  },
  {
    id: "calendario-arquidiocese",
    titulo: "O próprio arquidiocesano",
    caminho: emDados("calendario-arquidiocese.json"),
    forma: "documento",
    rota: "/calendario/arquidiocese",
    ajuda: "O calendário próprio da Arquidiocese da Paraíba.",
  },
  {
    id: "indulgencias",
    titulo: "Indulgências",
    caminho: emDados("indulgencias.json"),
    forma: "documento",
    rota: "/indulgencias",
    ajuda: "O que são, como se obtêm e de onde vêm.",
  },
  {
    id: "indulgencias-dias",
    titulo: "Dias de indulgência",
    caminho: emDados("indulgencias-dias.json"),
    forma: "diasDeIndulgencia",
    rota: "/indulgencias/calendario",
    ajuda: "Os dias que carregam indulgência. Os presos a uma festa acompanham a transferência.",
  },
  {
    id: "indulgencias-raccolta",
    titulo: "Raccolta",
    caminho: emDados("indulgencias-raccolta.json"),
    forma: "documento",
    rota: "/indulgencias/raccolta",
    ajuda: "A coleção anterior a 1968, que corresponde ao Código de 1917.",
  },
  {
    id: "indulgencias-enchiridion",
    titulo: "Enchiridion Indulgentiarum",
    caminho: emDados("indulgencias-enchiridion.json"),
    forma: "documento",
    rota: "/indulgencias/enchiridion",
    ajuda: "A coleção de 1968 em diante, da disciplina atual.",
  },
  {
    id: "indulgencias-ordens",
    titulo: "Indulgências próprias",
    caminho: emDados("indulgencias-ordens.json"),
    forma: "documento",
    rota: "/indulgencias/ordens",
    ajuda: "As de ordens, confrarias e associações.",
  },
  {
    id: "apostolado",
    titulo: "Sobre o Apostolado",
    caminho: emDados("apostolado.json"),
    forma: "documento",
    rota: "/apostolado",
    ajuda: "Posição, situação canônica, história e o brasão. Uma seção para cada.",
  },
  {
    id: "postagens",
    titulo: "Postagens",
    caminho: emDados("postagens.json"),
    forma: "postagens",
    rota: "/postagens",
    ajuda: "Vidas de santos e escritos sobre a liturgia.",
  },
];

export function porId(id: string): DocumentoRegistrado | undefined {
  return REGISTRO.find((d) => d.id === id);
}
