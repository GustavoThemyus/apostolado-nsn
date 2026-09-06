import { emailAutenticado } from "./acesso";
import { gravarConteudo, lerConteudo } from "./github";

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

export default {
  async fetch(pedido: Request, env: Env): Promise<Response> {
    const url = new URL(pedido.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(pedido);

    let quem: string;
    try {
      quem = await emailAutenticado(pedido, env.ACCESS_TEAM, env.ACCESS_AUD);
    } catch (e) {
      return json({ erro: e instanceof Error ? e.message : "não autenticado" }, 401);
    }

    const cfg = {
      repo: env.GITHUB_REPO,
      token: env.GITHUB_TOKEN,
      ramo: env.GITHUB_RAMO ?? "main",
    };

    if (url.pathname === "/api/conteudo" && pedido.method === "GET") {
      try {
        const { texto, sha } = await lerConteudo(cfg);
        return json({ conteudo: JSON.parse(texto), sha, quem });
      } catch (e) {
        return json({ erro: e instanceof Error ? e.message : "falha ao ler" }, 502);
      }
    }

    if (url.pathname === "/api/conteudo" && pedido.method === "PUT") {
      try {
        const corpo = (await pedido.json()) as { conteudo?: unknown };
        if (!corpo?.conteudo || typeof corpo.conteudo !== "object") {
          return json({ erro: "corpo sem conteúdo" }, 400);
        }
        const g = corpo.conteudo as { secoes?: unknown[] };
        if (!Array.isArray(g.secoes) || g.secoes.length === 0) {
          return json({ erro: "conteúdo sem seções: recusado para não apagar o guia" }, 400);
        }
        // relê o sha na hora de gravar, para detectar edição concorrente
        const { sha } = await lerConteudo(cfg);
        const texto = JSON.stringify(corpo.conteudo, null, 2) + "\n";
        const { commit } = await gravarConteudo(cfg, texto, sha, quem);
        return json({ ok: true, commit, quem });
      } catch (e) {
        return json({ erro: e instanceof Error ? e.message : "falha ao gravar" }, 502);
      }
    }

    return json({ erro: "rota desconhecida" }, 404);
  },
};
