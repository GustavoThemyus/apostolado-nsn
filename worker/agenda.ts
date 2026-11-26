import site from "../src/data/site.json";
import type { CorDaAgenda, ItemDeAgenda } from "../src/data/tipos";

export type { CorDaAgenda, ItemDeAgenda };

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

export function separarCor(titulo: string): { titulo: string; cor?: CorDaAgenda } {
  for (const [marca, cor] of Object.entries(CORES)) {
    if (titulo.startsWith(marca)) {
      return { titulo: titulo.slice(marca.length).trim(), cor };
    }
  }
  return { titulo };
}

const VALIDADE = 3600;

function desdobrar(texto: string): string[] {
  return texto.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

function comoData(valor: string): string | null {
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(valor.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function desescapar(valor: string): string {
  return semEscapes(valor).replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

function semEscapes(valor: string): string {
  return valor
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

const COMECA_PELA_OBRA =
  /^(requer|recitar|visitar|fazer|participar|receber|renovar|utilizar|rezar|assistir|acompanhar|tomar parte|aplicável|na igreja)\b/i;

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

interface Repeticao {
  passo: number;
  ate?: string;
  mes?: number;
  diaDoMes?: number;
  diaDaSemana?: { ordem: number; dia: number };
}

const DIAS_DA_SEMANA: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
};

export function lerRepeticao(valor: string): Repeticao | null {
  const partes: Record<string, string> = {};
  for (const pedaco of valor.split(";")) {
    const i = pedaco.indexOf("=");
    if (i > 0) partes[pedaco.slice(0, i).toUpperCase()] = pedaco.slice(i + 1);
  }

  const intervalo = Number(partes.INTERVAL ?? 1) || 1;
  let passo: number;
  if (partes.FREQ === "YEARLY") passo = intervalo;
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
      return null;
    }
  }
  return r;
}

function diaDaOcorrencia(ano: number, mes: number, ordem: number, dia: number): number | null {
  const noMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const casam: number[] = [];
  for (let d = 1; d <= noMes; d += 1) {
    if (new Date(Date.UTC(ano, mes - 1, d)).getUTCDay() === dia) casam.push(d);
  }
  const escolhido = ordem > 0 ? casam[ordem - 1] : casam[casam.length + ordem];
  return escolhido ?? null;
}

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

function janelaPadrao(): { de: number; ate: number } {
  const ano = new Date().getUTCFullYear();
  return { de: ano - 1, ate: ano + 2 };
}

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
