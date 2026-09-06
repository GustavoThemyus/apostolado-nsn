/**
 * Gravação do conteúdo no GitHub.
 *
 * O painel não fala com o GitHub: quem fala é o Worker, com um token que fica
 * como segredo do projeto e nunca chega ao navegador. Cada salvamento vira um
 * commit, então o histórico registra quem mudou o quê e dá para voltar atrás.
 */

const CAMINHO = "src/data/guia.json";

interface Config {
  repo: string;
  token: string;
  ramo: string;
}

const cabecalhos = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "apostolado-nsn-admin",
  "X-GitHub-Api-Version": "2022-11-28",
});

/** Conteúdo publicado e o sha do arquivo, necessário para gravar por cima. */
export async function lerConteudo(c: Config): Promise<{ texto: string; sha: string }> {
  const r = await fetch(
    `https://api.github.com/repos/${c.repo}/contents/${CAMINHO}?ref=${c.ramo}`,
    { headers: cabecalhos(c.token) }
  );
  if (!r.ok) throw new Error(`GitHub leu ${r.status}: ${await r.text()}`);
  const d = (await r.json()) as { content: string; sha: string };
  const bytes = Uint8Array.from(atob(d.content.replace(/\n/g, "")), (ch) => ch.charCodeAt(0));
  return { texto: new TextDecoder().decode(bytes), sha: d.sha };
}

/** Grava um commit novo. Falha se alguém salvou antes, em vez de sobrescrever. */
export async function gravarConteudo(
  c: Config,
  texto: string,
  sha: string,
  quem: string
): Promise<{ commit: string }> {
  const bytes = new TextEncoder().encode(texto);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));

  const r = await fetch(`https://api.github.com/repos/${c.repo}/contents/${CAMINHO}`, {
    method: "PUT",
    headers: { ...cabecalhos(c.token), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Atualiza o conteúdo do guia pelo painel\n\nEditado por ${quem}.`,
      content: btoa(bin),
      sha,
      branch: c.ramo,
      committer: { name: "Painel do Apostolado", email: "painel@apostolado-nsn.invalid" },
    }),
  });
  if (r.status === 409) {
    throw new Error("o conteúdo mudou desde que você abriu o painel; recarregue e refaça a edição");
  }
  if (!r.ok) throw new Error(`GitHub gravou ${r.status}: ${await r.text()}`);
  const d = (await r.json()) as { commit: { sha: string } };
  return { commit: d.commit.sha };
}
