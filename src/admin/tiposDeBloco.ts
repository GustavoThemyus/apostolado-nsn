import type { Bloco } from "../data/tipos";

export type NomeDeTipo = Bloco["tipo"];

/** O menu de "criar bloco" que o painel oferece, com o que cada um serve. */
export const TIPOS: { tipo: NomeDeTipo; rotulo: string; descricao: string }[] = [
  { tipo: "paragrafo", rotulo: "Parágrafo", descricao: "Texto corrido." },
  { tipo: "rubrica", rotulo: "Rubrica", descricao: "Texto vermelho: o que o sacerdote faz." },
  { tipo: "assembleia", rotulo: "Rubrica da assembleia", descricao: "Texto azul: o que os fiéis fazem." },
  { tipo: "subtitulo", rotulo: "Subtítulo", descricao: "Tópico dentro da seção." },
  { tipo: "lista", rotulo: "Lista", descricao: "Itens, com ou sem numeração." },
  { tipo: "oracao", rotulo: "Oração", descricao: "Citação com latim e tradução." },
  { tipo: "nota", rotulo: "Nota", descricao: "Caixa destacada, normal ou de alerta." },
  { tipo: "tabela", rotulo: "Tabela", descricao: "Vira ficha empilhada no celular." },
  { tipo: "legenda", rotulo: "Legenda", descricao: "Lista de chaves com etiqueta." },
  { tipo: "passo", rotulo: "Passo da Missa", descricao: "Peça numerada, com etiqueta litúrgica." },
];

export const ROTULO: Record<NomeDeTipo, string> = Object.fromEntries(
  TIPOS.map((t) => [t.tipo, t.rotulo])
) as Record<NomeDeTipo, string>;

let contador = 0;
export function novoId(prefixo = "novo"): string {
  contador += 1;
  return `${prefixo}-${Date.now().toString(36)}-${contador}`;
}

/** Um bloco vazio do tipo pedido, pronto para ser preenchido. */
export function blocoVazio(tipo: NomeDeTipo): Bloco {
  const id = novoId(tipo);
  switch (tipo) {
    case "paragrafo": return { id, tipo, texto: "" };
    case "rubrica": return { id, tipo, texto: "" };
    case "assembleia": return { id, tipo, texto: "" };
    case "subtitulo": return { id, tipo, texto: "" };
    case "lista": return { id, tipo, itens: [""] };
    case "oracao": return { id, tipo, versos: [{ latim: "", portugues: "" }] };
    case "nota": return { id, tipo, titulo: "", paragrafos: [""] };
    case "tabela": return { id, tipo, colunas: ["", ""], linhas: [["", ""]] };
    case "legenda": return { id, tipo, itens: [{ chave: "", etiqueta: "ordinario", texto: "" }] };
    case "passo":
      return { id, tipo, numero: 1, etiqueta: "ordinario", titulo: "", corpo: [] };
  }
}
