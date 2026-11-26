import { buscarAgenda } from "./agenda";
import { existe } from "./existe";
import { porId } from "../src/data/registro";
import { emailAutenticado } from "./acesso";
import { ConflitoDeEdicao, CredencialInvalida, gravarConteudo, lerConteudo } from "./github";
import { validar } from "./validar";

export interface Env {
  ASSETS: Fetcher;
  ACCESS_TEAM: string;
  ACCESS_AUD: string;
  GITHUB_REPO: string;
  GITHUB_RAMO?: string;
  GITHUB_TOKEN: string;
}

const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

const CASA = "ansn.com.br";

function foraDasBuscas(resposta: Response): Response {
  const copia = new Response(resposta.body, resposta);
  copia.headers.set("X-Robots-Tag", "noindex, nofollow");
  return copia;
}

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

    if (url.hostname === `www.${CASA}`) {
      url.hostname = CASA;
      return Response.redirect(url.toString(), 301);
    }

    if (!url.pathname.startsWith("/api/")) {
      return foraDasBuscas(await servirPagina(pedido, url, env));
    }

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
