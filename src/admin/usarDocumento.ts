import { useCallback, useEffect, useState } from "react";

/**
 * Carrega e grava um documento do registro.
 *
 * Era código solto dentro do Admin, preso ao guia por um `documento=guia`
 * escrito à mão. Virou gancho porque agora cada forma de documento tem o seu
 * editor, e os cinco precisam da mesma dança: buscar, guardar o sha, avisar
 * que há coisa por salvar, e recusar a gravação quando a API nunca respondeu.
 */
export type Estado = "lendo" | "pronto" | "salvando" | "salvo" | "erro";

interface Resposta {
  conteudo?: unknown;
  sha?: string;
  quem?: string;
  erro?: string;
}

export function usarDocumento<T>(id: string) {
  const [conteudo, definirConteudo] = useState<T | null>(null);
  const [estado, definirEstado] = useState<Estado>("lendo");
  const [recado, definirRecado] = useState("");
  const [quem, definirQuem] = useState("");
  const [sujo, definirSujo] = useState(false);
  /**
   * O sha do arquivo como ele estava quando abrimos. É o que deixa o servidor
   * perceber que outra pessoa gravou no meio: sem ele, duas abas abertas no
   * mesmo documento se sobrescrevem em silêncio.
   */
  const [sha, definirSha] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    definirEstado("lendo");
    definirConteudo(null);
    definirSha(null);
    definirSujo(false);
    definirRecado("");

    fetch(`/api/conteudo?documento=${encodeURIComponent(id)}`)
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as Resposta;
        if (!r.ok) throw new Error(d.erro ?? `erro ${r.status}`);
        return d;
      })
      .then((d) => {
        if (!vivo) return;
        definirConteudo((d.conteudo ?? null) as T);
        definirSha(d.sha ?? null);
        definirQuem(d.quem ?? "");
        definirEstado("pronto");
      })
      .catch((e: Error) => {
        if (!vivo) return;
        definirEstado("erro");
        definirRecado(
          `Não deu para abrir: ${e.message}. Sem isto não dá para salvar, porque o painel grava por cima da versão que leu.`,
        );
      });
    return () => {
      vivo = false;
    };
  }, [id]);

  /* Aviso do navegador ao fechar a aba com coisa por salvar. */
  useEffect(() => {
    const aoSair = (e: BeforeUnloadEvent) => {
      if (sujo) e.preventDefault();
    };
    window.addEventListener("beforeunload", aoSair);
    return () => window.removeEventListener("beforeunload", aoSair);
  }, [sujo]);

  const mudar = useCallback((novo: T) => {
    definirConteudo(novo);
    definirSujo(true);
    definirEstado("pronto");
  }, []);

  const salvar = useCallback(async () => {
    if (conteudo === null) return;
    if (!sha) {
      definirEstado("erro");
      definirRecado(
        "O painel não sabe de que versão partiu, então gravar agora apagaria o que estiver publicado. Recarregue.",
      );
      return;
    }
    definirEstado("salvando");
    definirRecado("");
    try {
      const r = await fetch(`/api/conteudo?documento=${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conteudo, sha }),
      });
      const d = (await r.json().catch(() => ({}))) as Resposta;
      if (!r.ok) throw new Error(d.erro ?? `erro ${r.status}`);
      // o sha muda a cada gravação; guardar o novo deixa salvar de novo sem recarregar
      if (d.sha) definirSha(d.sha);
      definirEstado("salvo");
      definirSujo(false);
      definirRecado("Salvo. O site republica em um ou dois minutos.");
    } catch (e) {
      definirEstado("erro");
      definirRecado(`Não salvou: ${e instanceof Error ? e.message : "erro desconhecido"}`);
    }
  }, [conteudo, id, sha]);

  return { conteudo, estado, recado, quem, sujo, mudar, salvar } as const;
}
