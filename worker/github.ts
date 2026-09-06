/**
 * Gravação do conteúdo no GitHub.
 *
 * O painel não fala com o GitHub: quem fala é o Worker, com um token que fica
 * como segredo do projeto e nunca chega ao navegador. Cada salvamento vira um
 * commit, então o histórico registra quem mudou o quê e dá para voltar atrás.
 *
 * SEGURANÇA: `caminho` nunca pode vir da requisição. Quem o resolve é o
 * registro de documentos, no servidor. Aceitar um caminho do cliente daria
 * escrita arbitrária no repositório, e como o repositório está ligado ao
 * Workers Builds, isso é execução de código na esteira de publicação.
 */

interface Config {
  repo: string;
  token: string;
  ramo: string;
  /** Caminho do arquivo no repositório, resolvido pelo registro. */
  caminho: string;
}

const cabecalhos = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "apostolado-nsn-admin",
  "X-GitHub-Api-Version": "2022-11-28",
});

/** Erro de edição concorrente, para o Worker responder 409 em vez de 502. */
export class ConflitoDeEdicao extends Error {
  constructor() {
    super("o conteúdo mudou desde que você abriu o painel; recarregue e refaça a edição");
    this.name = "ConflitoDeEdicao";
  }
}

/** Conteúdo publicado e o sha **do arquivo**, necessário para gravar por cima. */
export async function lerConteudo(c: Config): Promise<{ texto: string; sha: string }> {
  const r = await fetch(
    `https://api.github.com/repos/${c.repo}/contents/${c.caminho}?ref=${c.ramo}`,
    { headers: cabecalhos(c.token) }
  );
  if (r.status === 404) throw new Error(`documento ainda não existe no repositório: ${c.caminho}`);
  if (!r.ok) throw new Error(`GitHub leu ${r.status}: ${await r.text()}`);
  const d = (await r.json()) as { content: string; sha: string };
  const bytes = Uint8Array.from(atob(d.content.replace(/\n/g, "")), (ch) => ch.charCodeAt(0));
  return { texto: new TextDecoder().decode(bytes), sha: d.sha };
}

/**
 * Grava um commit novo e devolve o sha **do arquivo** resultante.
 *
 * O sha devolvido é o de `content`, não o do commit: é ele que o painel guarda
 * para a gravação seguinte. Devolver o do commit faria a segunda gravação de
 * cada sessão falhar como se fosse conflito.
 *
 * `sha` ausente significa criar arquivo novo, que a API aceita.
 */
export async function gravarConteudo(
  c: Config,
  texto: string,
  sha: string | undefined,
  quem: string,
  titulo: string
): Promise<{ commit: string; sha: string }> {
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

  // 409 é o conflito documentado; a API também devolve 422 quando o sha está velho
  if (r.status === 409 || r.status === 422) throw new ConflitoDeEdicao();
  if (!r.ok) throw new Error(`GitHub gravou ${r.status}: ${await r.text()}`);

  const d = (await r.json()) as { commit: { sha: string }; content: { sha: string } };
  return { commit: d.commit.sha, sha: d.content.sha };
}
