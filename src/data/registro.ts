export type Forma =
  | "documento"
  | "site"
  | "inicio"
  | "postagens"
  | "folhetos"
  | "paginas"
  | "diasDeIndulgencia";

export interface DocumentoRegistrado {
  id: string;
  titulo: string;
  caminho: string;
  forma: Forma;
  rota?: string;
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
    id: "paginas",
    titulo: "Títulos e cabeçalhos",
    caminho: emDados("paginas.json"),
    forma: "paginas",
    ajuda: "O que cada página mostra no alto e nos cartões da seção. Mexe no menu e nas migalhas.",
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
    id: "quo-primum",
    titulo: "Bula Quo primum tempore",
    caminho: emDados("quo-primum.json"),
    forma: "documento",
    rota: "/missa/situacao-canonica/quo-primum",
    ajuda: "O texto da bula, em latim e em português. Gerado por tools/quo-primum: correção aqui tem de voltar para lá.",
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
    titulo: "Indulgências universais: os dias",
    caminho: emDados("indulgencias-dias.json"),
    forma: "diasDeIndulgencia",
    rota: "/indulgencias/calendario",
    ajuda: "Os dias do ano em que a Igreja universal concede plenária, com a obra de cada um, e as condições que valem para todas. Alimenta o quadro do calendário e a grade do mês na página das indulgências. Os presos a uma festa acompanham a transferência dela.",
  },
  {
    id: "indulgencias-calendario",
    titulo: "Indulgências universais: a prosa do calendário",
    caminho: emDados("indulgencias-calendario.json"),
    forma: "documento",
    rota: "/indulgencias/calendario",
    ajuda: "A apresentação, a nota sobre o calendário litúrgico, as normas gerais e a conclusão em volta dos dois quadros. As condições, as observações e os dias em si estão no documento dos dias.",
  },
  {
    id: "indulgencias-arquidiocese",
    titulo: "Calendário de Indulgências Arquidiocesano",
    caminho: emDados("indulgencias-arquidiocese.json"),
    forma: "documento",
    rota: "/indulgencias/arquidiocese",
    ajuda: "As igrejas da Arquidiocese e o dia de indulgência de cada uma. Gerado por tools/arquidiocese: correção aqui tem de voltar para lá.",
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
    ajuda: "As de ordens, confrarias e associações. Gerado por tools/indulgencias-proprias: correção aqui tem de voltar para lá.",
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
    id: "folhetos",
    titulo: "Folhetos",
    caminho: emDados("folhetos.json"),
    forma: "folhetos",
    rota: "/folhetos",
    ajuda: "Os impressos do Apostolado servidos como página. As condições ordinárias ficam na raiz do arquivo e valem para toda obra indulgenciada. Os próprios da Missa saem dos PDFs do Ordo, por tools/proprios: correção de texto neles tem de voltar para lá.",
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
