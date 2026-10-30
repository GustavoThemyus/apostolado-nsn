import site from "../src/data/site.json";
import type { CorDaAgenda, ItemDeAgenda } from "../src/data/tipos";

export type { CorDaAgenda, ItemDeAgenda };

/**
 * Ponte para os calendários públicos do Google.
 *
 * Existe por dois motivos. O primeiro é CORS: o endereço iCal do Google não
 * manda `Access-Control-Allow-Origin`, então o navegador não consegue buscá-lo
 * direto. O segundo é que o formato iCal não se lê no cliente sem uma
 * biblioteca, e o retorno aqui já vem em JSON pequeno.
 *
 * **O cliente manda um id do nosso `site.json`, nunca um endereço.** Aceitar
 * uma URL da requisição transformaria o Worker num proxy aberto: qualquer um
 * o usaria para bater em endereços internos da rede da Cloudflare com o nosso
 * nome. A lista de agendas é a fronteira, do mesmo jeito que o registro é a
 * fronteira da gravação.
 */


/*
 * O Ordo da capela põe a cor litúrgica como emoji no começo do título
 * ("🔴Santo Estanislau"). Renderizado cru, o emoji sai na fonte colorida do
 * sistema e destoa de tudo no site. Aqui ele é lido, virado em cor e cortado
 * do texto; quem desenha o marcador é o CSS, com a mesma amostra que o
 * calendário próprio já usa.
 *
 * "ouro" não existe no calendário de 1962, que nunca o emite: entra só porque
 * o Ordo o usa, e traduzi-lo para branco seria reinterpretar o dado deles.
 */
const CORES: Record<string, CorDaAgenda> = {
  "⚪": "branco",
  "⬜": "branco",
  "🤍": "branco",
  "🔴": "vermelho",
  "❤️": "vermelho",
  "🟥": "vermelho",
  "🟢": "verde",
  "💚": "verde",
  "🟩": "verde",
  "🟣": "roxo",
  "💜": "roxo",
  "🟪": "roxo",
  "⚫": "preto",
  "⬛": "preto",
  "🖤": "preto",
  "🩷": "rosa",
  "💗": "rosa",
  "🌸": "rosa",
  "🟡": "ouro",
  "🟨": "ouro",
  "💛": "ouro",
};

/** Separa o marcador de cor do título, quando há um. */
export function separarCor(titulo: string): { titulo: string; cor?: CorDaAgenda } {
  for (const [marca, cor] of Object.entries(CORES)) {
    if (titulo.startsWith(marca)) {
      return { titulo: titulo.slice(marca.length).trim(), cor };
    }
  }
  return { titulo };
}

/** Uma hora: o Ordo muda no máximo quando alguém edita o calendário. */
const VALIDADE = 3600;

/** Desdobra as linhas continuadas do iCal, que quebram em 75 octetos. */
function desdobrar(texto: string): string[] {
  return texto.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

/** "20260805" ou "20260805T110000Z" viram "2026-08-05". */
function comoData(valor: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(valor.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function desescapar(valor: string): string {
  return semEscapes(valor).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

/** O mesmo, guardando as quebras: a descrição tem parágrafos, o título não. */
function semEscapes(valor: string): string {
  return valor
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/*
 * As obras abrem pelo que se deve fazer; as festas, pelo nome delas.
 *
 * Lista fechada, e é o que distingue os dois casos que o comprimento não
 * separa: "Visitar o Santíssimo Sacramento e fazer adoração por pelo menos
 * meia hora." tem 74 caracteres, e "São Francisco Xavier, Padroeiro principal
 * do AO." tem 48 e fecha em ponto. Verbo novo erraria para o lado de mostrar
 * a obra em negrito, que é feio e não perde nada — nenhum dos dois desfechos
 * esconde texto.
 */
const COMECA_PELA_OBRA =
  /^(requer|recitar|visitar|fazer|participar|receber|renovar|utilizar|rezar|assistir|acompanhar|tomar parte|aplicável|na igreja)\b/i;

/**
 * O cabeçalho da descrição, quando o redator escreveu um.
 *
 * Nos calendários de indulgência do Apostolado todo evento se chama
 * "Indulgência Plenária", e o que muda está na descrição: a festa na primeira
 * linha, a obra depois de uma linha em branco. Lidas como texto corrido, as
 * duas saíam coladas — "Santa Teresa de Jesus Requer-se o propósito firme…" —,
 * que foi o que o Perez viu na tela.
 *
 * Nem todo evento tem festa: as indulgências que valem em qualquer dia abrem
 * direto pela obra. Daí os dois testes, e não um só.
 */
const ehCabecalho = (p: string): boolean =>
  p.length <= 100 && !COMECA_PELA_OBRA.test(p);

export function partirDescricao(cru: string): { festa?: string; descricao?: string } {
  const paragrafos = cru
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  if (paragrafos.length < 2 || !ehCabecalho(paragrafos[0])) {
    const inteiro = paragrafos.join("\n\n");
    return inteiro ? { descricao: inteiro } : {};
  }
  return { festa: paragrafos[0], descricao: paragrafos.slice(1).join("\n\n") };
}

/**
 * A repetição de um evento, no pouco que estes calendários usam.
 *
 * Havia aqui um comentário dizendo que o Google entregava as ocorrências já
 * expandidas, com RECURRENCE-ID, e que por isso tratar RRULE seria refazer
 * conta alheia. **Não é verdade.** No iCal do Escapulário há 7 eventos, 7
 * RRULE e zero RECURRENCE-ID; o Google entrega a regra, não as ocorrências.
 * Como a regra era ignorada e só o DTSTART guardado, cada festa anual ficou
 * parada no ano em que foi criada, e cinco calendários do Apostolado
 * mostravam quase nada de 2026 em diante.
 */
interface Repeticao {
  /** Em anos. O que não for anual não se expande. */
  passo: number;
  /** AAAA-MM-DD, quando a série termina. */
  ate?: string;
  mes?: number;
  diaDoMes?: number;
  /** "BYDAY=-1SU": o último domingo. Ordem negativa conta do fim. */
  diaDaSemana?: { ordem: number; dia: number };
}

const DIAS_DA_SEMANA: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

/**
 * Lê a RRULE, e devolve nulo para o que não sabemos expandir.
 *
 * Nulo não perde o evento: ele continua valendo pela data do DTSTART, como
 * valia antes. É de propósito que o desconhecido degrade para uma ocorrência
 * em vez de sumir ou de virar palpite.
 *
 * O que estes seis calendários usam, conferido um a um: 58 regras anuais e
 * uma mensal de doze em doze meses, com BYMONTH, BYMONTHDAY, BYDAY e UNTIL.
 * Nenhum EXDATE, nenhum COUNT, nenhum RECURRENCE-ID.
 */
export function lerRepeticao(valor: string): Repeticao | null {
  const partes: Record<string, string> = {};
  for (const pedaco of valor.split(";")) {
    const i = pedaco.indexOf("=");
    if (i > 0) partes[pedaco.slice(0, i).toUpperCase()] = pedaco.slice(i + 1);
  }

  const intervalo = Number(partes.INTERVAL ?? 1) || 1;
  let passo: number;
  if (partes.FREQ === "YEARLY") passo = intervalo;
  // "de doze em doze meses" é uma vez por ano dita de outro jeito
  else if (partes.FREQ === "MONTHLY" && intervalo % 12 === 0) passo = intervalo / 12;
  else return null;

  const r: Repeticao = { passo };
  if (partes.UNTIL) {
    const ate = comoData(partes.UNTIL);
    if (ate) r.ate = ate;
  }
  if (partes.BYMONTH) r.mes = Number(partes.BYMONTH);
  if (partes.BYMONTHDAY) r.diaDoMes = Number(partes.BYMONTHDAY);
  if (partes.BYDAY) {
    const m = /^(-?\d+)?([A-Z]{2})$/.exec(partes.BYDAY.trim().toUpperCase());
    if (m && m[2] in DIAS_DA_SEMANA) {
      r.diaDaSemana = { ordem: Number(m[1] ?? 1), dia: DIAS_DA_SEMANA[m[2]] };
    } else {
      // BYDAY com lista ("MO,WE") não é coisa destes calendários
      return null;
    }
  }
  return r;
}

/** A enésima ocorrência de um dia da semana no mês. Ordem negativa conta do fim. */
function diaDaOcorrencia(ano: number, mes: number, ordem: number, dia: number): number | null {
  const noMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const casam: number[] = [];
  for (let d = 1; d <= noMes; d += 1) {
    if (new Date(Date.UTC(ano, mes - 1, d)).getUTCDay() === dia) casam.push(d);
  }
  const escolhido = ordem > 0 ? casam[ordem - 1] : casam[casam.length + ordem];
  return escolhido ?? null;
}

/**
 * As datas em que a série cai, dentro da janela.
 *
 * A janela existe porque o retorno é uma lista chata, sem o ano pedido: o ano
 * passado serve para quem olha janeiro e volta para dezembro, e dois à frente
 * cobrem o calendário que o Apostolado prepara com antecedência.
 */
function expandir(inicio: string, r: Repeticao, de: number, ate: number): string[] {
  const [ano0, mes0, dia0] = inicio.split("-").map(Number);
  const saida: string[] = [];

  for (let ano = Math.max(de, ano0); ano <= ate; ano += 1) {
    if ((ano - ano0) % r.passo !== 0) continue;
    const mes = r.mes ?? mes0;
    const dia = r.diaDaSemana
      ? diaDaOcorrencia(ano, mes, r.diaDaSemana.ordem, r.diaDaSemana.dia)
      : (r.diaDoMes ?? dia0);
    if (!dia) continue;
    const data = `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    if (data < inicio) continue;
    if (r.ate && data > r.ate) break;
    saida.push(data);
  }
  return saida;
}

/** A janela padrão, em torno do ano corrente. */
function janelaPadrao(): { de: number; ate: number } {
  const ano = new Date().getUTCFullYear();
  return { de: ano - 1, ate: ano + 2 };
}

/**
 * Lê os VEVENT de um iCal, expandindo as séries anuais.
 *
 * Evento sem RRULE, ou com uma que não sabemos ler, entra uma vez só, pela
 * data do DTSTART. Nada se perde por não ser entendido.
 */
export function lerIcal(texto: string, janela = janelaPadrao()): ItemDeAgenda[] {
  const itens: ItemDeAgenda[] = [];
  const vistos = new Set<string>();
  let dentro = false;
  let data: string | null = null;
  let titulo = "";
  let descricao = "";
  let repeticao: Repeticao | null = null;

  for (const linha of desdobrar(texto)) {
    if (linha === "BEGIN:VEVENT") {
      dentro = true;
      data = null;
      titulo = "";
      descricao = "";
      repeticao = null;
      continue;
    }
    if (linha === "END:VEVENT") {
      if (dentro && data && titulo) {
        const { titulo: limpo, cor } = separarCor(titulo);
        const datas = repeticao ? expandir(data, repeticao, janela.de, janela.ate) : [data];
        for (const quando of datas) {
          /*
           * A mesma festa pode vir como série e como evento solto.
           *
           * A descrição entra na chave porque nestes calendários o título não
           * distingue nada: todo evento se chama "Indulgência Plenária", e
           * duas festas no mesmo dia viravam uma só, calada.
           */
          const chave = `${quando}\u0000${limpo}\u0000${descricao}`;
          if (vistos.has(chave)) continue;
          vistos.add(chave);
          const { festa, descricao: corpo } = partirDescricao(descricao);
          const item: ItemDeAgenda = { data: quando, titulo: limpo };
          if (festa) item.festa = festa;
          if (corpo) item.descricao = corpo;
          if (cor) item.cor = cor;
          itens.push(item);
        }
      }
      dentro = false;
      continue;
    }
    if (!dentro) continue;

    const corte = linha.indexOf(":");
    if (corte === -1) continue;
    const chave = linha.slice(0, corte).split(";")[0].toUpperCase();
    const valor = linha.slice(corte + 1);

    if (chave === "DTSTART") data = comoData(valor);
    else if (chave === "SUMMARY") titulo = desescapar(valor);
    else if (chave === "DESCRIPTION") descricao = semEscapes(valor);
    else if (chave === "RRULE") repeticao = lerRepeticao(valor);
  }

  itens.sort((a, b) => a.data.localeCompare(b.data));
  return itens;
}

/**
 * Um calendário só é legível se estiver público **com os detalhes**. Partilhado
 * como "apenas livre/ocupado", o Google devolve todo evento com o título
 * "Busy", e é isso que o site mostraria. Vale avisar em vez de fingir.
 */
export function semDetalhes(itens: ItemDeAgenda[]): boolean {
  return itens.length > 0 && itens.every((i) => /^busy$/i.test(i.titulo));
}

export async function buscarAgenda(id: string): Promise<Response> {
  const agenda = site.agendas.find((a) => a.id === id);
  if (!agenda || !agenda.google) {
    return new Response(JSON.stringify({ erro: `agenda desconhecida: ${id}` }), {
      status: 404,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const endereco =
    "https://calendar.google.com/calendar/ical/" +
    encodeURIComponent(agenda.google) +
    "/public/basic.ics";

  const resposta = await fetch(endereco, { cf: { cacheTtl: VALIDADE, cacheEverything: true } });
  if (!resposta.ok) {
    return new Response(
      JSON.stringify({
        erro: "o Google não devolveu o calendário",
        situacao: resposta.status,
        dica: "confira se o calendário está publicado",
      }),
      { status: 502, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }

  const itens = lerIcal(await resposta.text());
  return new Response(
    JSON.stringify({
      id: agenda.id,
      nome: agenda.nome,
      grupo: agenda.grupo,
      itens,
      semDetalhes: semDetalhes(itens),
    }),
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${VALIDADE}`,
      },
    }
  );
}
