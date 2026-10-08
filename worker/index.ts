import { buscarAgenda } from "./agenda";
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

    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(pedido);

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
