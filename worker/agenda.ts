import site from "../src/data/site.json";

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

export interface ItemDeAgenda {
  /** AAAA-MM-DD */
  data: string;
  titulo: string;
  descricao?: string;
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
  return valor
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

/**
 * Lê os VEVENT de um iCal.
 *
 * Não trata RRULE de propósito: o Google já entrega as ocorrências expandidas
 * em eventos separados, com RECURRENCE-ID. Implementar recorrência aqui seria
 * escrever um motor de datas que o servidor do outro lado já rodou.
 */
export function lerIcal(texto: string): ItemDeAgenda[] {
  const itens: ItemDeAgenda[] = [];
  let dentro = false;
  let data: string | null = null;
  let titulo = "";
  let descricao = "";

  for (const linha of desdobrar(texto)) {
    if (linha === "BEGIN:VEVENT") {
      dentro = true;
      data = null;
      titulo = "";
      descricao = "";
      continue;
    }
    if (linha === "END:VEVENT") {
      if (dentro && data && titulo) {
        itens.push(descricao ? { data, titulo, descricao } : { data, titulo });
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
    else if (chave === "DESCRIPTION") descricao = desescapar(valor);
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
