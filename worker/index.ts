import { buscarAgenda } from "./agenda";
import { resolver } from "../src/routes/casar";
import { porId as postagemPorId } from "../src/data/postagens";
import { PADROES } from "../src/routes/padroes";
import { porId } from "../src/data/registro";
import { emailAutenticado } from "./acesso";
import { ConflitoDeEdicao, CredencialInvalida, gravarConteudo, lerConteudo } from "./github";
import { validar } from "./validar";

export interface Env {
  ASSETS: Fetcher;
  /** Subdomínio do time no Cloudflare Access, sem ".cloudflareaccess.com". */
  ACCESS_TEAM: string;
  /** Tag de público (aud) da aplicação do Access. */
  ACCESS_AUD: string;
  /** "usuario/repositorio" */
  GITHUB_REPO: string;
  GITHUB_RAMO?: string;
  /** Segredo: token de acesso ao repositório. */
  GITHUB_TOKEN: string;
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

/** O endereço de casa, sem o `www`. */
const CASA = "ansn.com.br";

/*
 * Os caminhos que o site atende, para `resolver` escolher entre eles. Só os
 * padrões: a tabela cheia mora no lado do navegador e carrega os componentes
 * de cada página, que não têm o que fazer aqui dentro.
 */
const ROTAS = PADROES.map((padrao) => ({ padrao }));

/**
 * O caminho leva a alguma coisa?
 *
 * Casar com a rota não basta nos dois caminhos que capturam parâmetro:
 * `/postagens/:id` casa com qualquer palavra, e `/admin/:documento` também.
 * Link para uma postagem apagada é endereço morto como qualquer outro, e
 * responder 200 nele é a mesma promessa falsa — só que mais provável de
 * acontecer, porque esses são justamente os endereços que se compartilham.
 */
function existe(caminho: string): boolean {
  const casamento = resolver(ROTAS, caminho);
  if (!casamento) return false;

  if (casamento.rota.padrao === "/postagens/:id") {
    return postagemPorId(casamento.parametros.id) !== undefined;
  }
  if (casamento.rota.padrao === "/admin/:documento") {
    return porId(casamento.parametros.documento) !== undefined;
  }
  return true;
}

/**
 * Serve um arquivo, ou a página do site com o status certo.
 *
 * O armazém de ativos responde primeiro: se o caminho é um arquivo de
 * verdade, é ele que vai, e acabou. Se não é, só então se pergunta se aquilo
 * é rota do site.
 *
 * A página devolvida é a mesma nos dois casos — quem decide o que mostrar é o
 * React, que já tem a tela de não encontrada. O que muda é o status, e ele
 * não é detalhe: com 200, o buscador entende que o endereço existe e indexa
 * um erro de digitação como se fosse página do Apostolado.
 */
async function servirPagina(pedido: Request, url: URL, env: Env): Promise<Response> {
  const resposta = await env.ASSETS.fetch(pedido);
  if (resposta.status !== 404) return resposta;

  const conhecida = existe(url.pathname);
  const pagina = await env.ASSETS.fetch(new Request(new URL("/index.html", url)));
  return new Response(pagina.body, {
    status: conhecida ? 200 : 404,
    headers: pagina.headers,
  });
}

export default {
  async fetch(pedido: Request, env: Env): Promise<Response> {
    const url = new URL(pedido.url);

    /*
     * O `www` leva ao apex, com o caminho e a busca intactos.
     *
     * Os dois são domínio do mesmo Worker, então sem isto o site responderia
     * nos dois endereços e os buscadores veriam o mesmo texto em dois lugares.
     * O redirecionamento é permanente porque a decisão é permanente: o nome do
     * site é `ansn.com.br`.
     */
    if (url.hostname === `www.${CASA}`) {
      url.hostname = CASA;
      return Response.redirect(url.toString(), 301);
    }

    if (!url.pathname.startsWith("/api/")) return await servirPagina(pedido, url, env);

    /*
     * As agendas vêm antes da autenticação de propósito: são calendários
     * públicos que qualquer visitante pode vincular, e exigir o Access aqui
     * tornaria o recurso inútil para quem o site serve.
     */
    if (url.pathname === "/api/agenda") {
      if (pedido.method !== "GET") return json({ erro: "método não aceito" }, 405);
      const id = url.searchParams.get("id");
      if (!id) return json({ erro: "falta o id da agenda" }, 400);
      try {
        return await buscarAgenda(id);
      } catch (e) {
        return json({ erro: e instanceof Error ? e.message : "falha ao buscar a agenda" }, 502);
      }
    }

    let quem: string;
    try {
      quem = await emailAutenticado(pedido, env.ACCESS_TEAM, env.ACCESS_AUD);
    } catch (e) {
      return json({ erro: e instanceof Error ? e.message : "não autenticado" }, 401);
    }

    if (url.pathname !== "/api/conteudo") return json({ erro: "rota desconhecida" }, 404);

    // o cliente manda um id; quem sabe o caminho é o registro, aqui no servidor
    const id = url.searchParams.get("documento") ?? "guia";
    const doc = porId(id);
    if (!doc) return json({ erro: `documento desconhecido: ${id}` }, 404);

    const cfg = {
      repo: env.GITHUB_REPO,
      token: env.GITHUB_TOKEN,
      ramo: env.GITHUB_RAMO ?? "main",
      caminho: doc.caminho,
    };

    if (pedido.method === "GET") {
      try {
        const { texto, sha } = await lerConteudo(cfg);
        return json({ documento: doc.id, conteudo: JSON.parse(texto), sha, quem });
      } catch (e) {
        // 503: é configuração do site, não erro de quem está editando
        if (e instanceof CredencialInvalida) return json({ erro: e.message }, 503);
        return json({ erro: e instanceof Error ? e.message : "falha ao ler" }, 502);
      }
    }

    if (pedido.method === "PUT") {
      let corpo: { conteudo?: unknown; sha?: unknown };
      try {
        corpo = (await pedido.json()) as typeof corpo;
      } catch {
        return json({ erro: "corpo não é JSON" }, 400);
      }

      if (typeof corpo.sha !== "string" || corpo.sha === "") {
        // sem o sha de origem não há como saber se alguém salvou no meio
        return json({ erro: "gravação sem sha de origem; recarregue o painel" }, 428);
      }

      const problema = validar(doc.forma, corpo.conteudo);
      if (problema) return json({ erro: problema }, 400);

      try {
        const texto = `${JSON.stringify(corpo.conteudo, null, 2)}\n`;
        const { commit, sha } = await gravarConteudo(cfg, texto, corpo.sha, quem, doc.titulo);
        return json({ ok: true, documento: doc.id, commit, sha, quem });
      } catch (e) {
        if (e instanceof ConflitoDeEdicao) return json({ erro: e.message }, 409);
        if (e instanceof CredencialInvalida) return json({ erro: e.message }, 503);
        return json({ erro: e instanceof Error ? e.message : "falha ao gravar" }, 502);
      }
    }

    return json({ erro: "método não aceito" }, 405);
  },
};
