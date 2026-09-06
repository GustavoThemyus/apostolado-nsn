import type { Forma } from "../src/data/registro";

/**
 * Guardas mínimas por forma de documento.
 *
 * O objetivo não é validar o esquema inteiro: é recusar o que **esvaziaria**
 * uma página publicada. Se algo der errado no navegador e o painel mandar um
 * documento vazio, o site não pode perder o conteúdo por causa disso.
 */

const ehObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const listaComItens = (v: unknown): v is unknown[] => Array.isArray(v) && v.length > 0;

/** Devolve a mensagem de erro, ou null se o conteúdo passa. */
export function validar(forma: Forma, conteudo: unknown): string | null {
  if (!ehObjeto(conteudo)) return "conteúdo não é um objeto";

  switch (forma) {
    case "documento":
      if (typeof conteudo.titulo !== "string" || conteudo.titulo.trim() === "") {
        return "documento sem título";
      }
      if (!listaComItens(conteudo.secoes)) {
        return "documento sem seções: recusado para não apagar a página";
      }
      return null;

    case "site":
      for (const campo of ["marca", "marcaCurta"]) {
        if (typeof conteudo[campo] !== "string" || (conteudo[campo] as string).trim() === "") {
          return `identidade do site sem ${campo}`;
        }
      }
      return null;

    case "inicio":
      if (!Array.isArray(conteudo.avisos)) return "página inicial sem lista de avisos";
      if (!Array.isArray(conteudo.blocos)) return "página inicial sem blocos";
      return null;

    case "postagens": {
      if (!Array.isArray(conteudo.postagens)) return "sem lista de postagens";
      const vistos = new Set<string>();
      for (const p of conteudo.postagens as unknown[]) {
        if (!ehObjeto(p)) return "postagem que não é objeto";
        if (typeof p.id !== "string" || p.id.trim() === "") return "postagem sem endereço";
        if (typeof p.titulo !== "string" || p.titulo.trim() === "") {
          return `postagem "${p.id}" sem título`;
        }
        if (vistos.has(p.id)) return `duas postagens com o mesmo endereço: ${p.id}`;
        vistos.add(p.id);
      }
      return null;
    }

    case "diasDeIndulgencia": {
      if (!Array.isArray(conteudo.dias)) return "sem lista de dias";
      for (const d of conteudo.dias as unknown[]) {
        if (!ehObjeto(d)) return "dia que não é objeto";
        if (typeof d.titulo !== "string" || d.titulo.trim() === "") return "dia sem título";
        if (!ehObjeto(d.quando)) return `dia "${d.titulo}" sem regra de quando`;
      }
      return null;
    }
  }
}
