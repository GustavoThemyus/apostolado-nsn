interface Config {
  repo: string;
  token: string;
  ramo: string;
  caminho: string;
}

function problemaNoToken(token: string | undefined): string {
  if (!token) return "o segredo GITHUB_TOKEN não chegou ao Worker";
  if (token !== token.trim()) return "o token tem espaço ou quebra de linha nas pontas";
  if (/\s/.test(token)) return "o token tem espaço ou quebra de linha no meio";
  const estranho = [...token].find((c) => c.charCodeAt(0) < 33 || c.charCodeAt(0) > 126);
  if (estranho) {
    return `o token tem um caractere que não cabe num cabeçalho (código ${estranho.charCodeAt(0)})`;
  }
  return "";
}

const cabecalhos = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "apostolado-nsn-admin",
  "X-GitHub-Api-Version": "2022-11-28",
});

export class ConflitoDeEdicao extends Error {
  constructor() {
    super("o conteúdo mudou desde que você abriu o painel; recarregue e refaça a edição");
    this.name = "ConflitoDeEdicao";
  }
}

export class CredencialInvalida extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "CredencialInvalida";
  }

  static recusadaPeloGitHub(detalhe: string): CredencialInvalida {
    return new CredencialInvalida(
      `o GitHub recusou a credencial do site (${detalhe}). O token provavelmente expirou ou foi revogado: gere outro e grave com "wrangler secret put GITHUB_TOKEN".`,
    );
  }

  static malformada(problema: string): CredencialInvalida {
    return new CredencialInvalida(
      `o token guardado no site está malformado: ${problema}. Regrave com "wrangler secret put GITHUB_TOKEN" e, no terminal, cole com Ctrl+Shift+V — o Ctrl+V insere um caractere de controle em vez de colar.`,
    );
  }
}

async function comoFalhou(r: Response): Promise<string> {
  const corpo = (await r.text().catch(() => "")).slice(0, 300);
  const pedido = r.headers.get("x-github-request-id") ?? "sem id";
  const tipo = r.headers.get("content-type") ?? "sem tipo";
  return `${r.status} ${r.statusText || "(sem texto)"} [pedido ${pedido}; ${tipo}] ${
    corpo || "(corpo vazio)"
  }`;
}

function conferirCredencial(r: Response): void {
  if (r.status === 401) throw CredencialInvalida.recusadaPeloGitHub("401, credencial inválida");
  if (r.status === 403) {
    if (r.headers.get("x-ratelimit-remaining") === "0") return;
    throw CredencialInvalida.recusadaPeloGitHub("403, sem permissão para este repositório");
  }
}

export async function lerConteudo(c: Config): Promise<{ texto: string; sha: string }> {
  const problema = problemaNoToken(c.token);
  if (problema) throw CredencialInvalida.malformada(problema);

  const r = await fetch(
    `https://api.github.com/repos/${c.repo}/contents/${c.caminho}?ref=${c.ramo}`,
    { headers: cabecalhos(c.token) }
  );
  if (!r.ok) {
    console.log(
      `leitura falhou: repo=${c.repo} ramo=${c.ramo} caminho=${c.caminho} ` +
        `token=${c.token.length} caracteres status=${r.status}`,
    );
  }
  conferirCredencial(r);
  if (r.status === 404) throw new Error(`documento ainda não existe no repositório: ${c.caminho}`);
  if (!r.ok) throw new Error(`GitHub recusou a leitura: ${await comoFalhou(r)}`);
  const d = (await r.json()) as { content: string; sha: string };
  const bytes = Uint8Array.from(atob(d.content.replace(/\n/g, "")), (ch) => ch.charCodeAt(0));
  return { texto: new TextDecoder().decode(bytes), sha: d.sha };
}

export async function gravarConteudo(
  c: Config,
  texto: string,
  sha: string | undefined,
  quem: string,
  titulo: string
): Promise<{ commit: string; sha: string }> {
  const problema = problemaNoToken(c.token);
  if (problema) throw CredencialInvalida.malformada(problema);

  const bytes = new TextEncoder().encode(texto);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));

  const r = await fetch(`https://api.github.com/repos/${c.repo}/contents/${c.caminho}`, {
    method: "PUT",
    headers: { ...cabecalhos(c.token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Atualiza ${titulo} pelo painel\n\nEditado por ${quem}.`,
      content: btoa(bin),
      ...(sha ? { sha } : {}),
      branch: c.ramo,
      committer: { name: "Painel do Apostolado", email: "painel@apostolado-nsn.invalid" },
    }),
  });

  conferirCredencial(r);
  if (r.status === 409 || r.status === 422) throw new ConflitoDeEdicao();
  if (!r.ok) throw new Error(`GitHub recusou a gravação: ${await comoFalhou(r)}`);

  const d = (await r.json()) as { commit: { sha: string }; content: { sha: string } };
  return { commit: d.commit.sha, sha: d.content.sha };
}
