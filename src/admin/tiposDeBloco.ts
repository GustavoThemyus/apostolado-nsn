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
  { tipo: "separador", rotulo: "Fio separador", descricao: "Divide o latim da tradução." },
  { tipo: "bilingue", rotulo: "Oração bilíngue", descricao: "Latim e tradução lado a lado na tela larga." },
  { tipo: "indice", rotulo: "Índice do documento", descricao: "Lista as seções e as partes desta página." },
  { tipo: "passo", rotulo: "Passo da Missa", descricao: "Peça numerada, com etiqueta litúrgica." },
];

/*
 * O que existe no conteúdo mas não se cria à mão.
 *
 * O lugar do próprio sai do gerador do Ordinário, que lê os dez "Ver a Missa
 * do dia" do impresso: escrevê-lo num folheto não faria sentido. Mas o
 * editor precisa saber chamá-lo pelo nome se um dia abrir uma seção que o
 * tenha, e por isso ele tem rótulo sem ter lugar no menu.
 */
const SO_GERADOS: Partial<Record<NomeDeTipo, string>> = {
  proprio: "Lugar do próprio",
};

export const ROTULO: Record<NomeDeTipo, string> = {
  ...SO_GERADOS,
  ...Object.fromEntries(TIPOS.map((t) => [t.tipo, t.rotulo])),
} as Record<NomeDeTipo, string>;

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
    case "separador": return { id, tipo };
    case "bilingue": return { id, tipo, latim: [], portugues: [] };
    case "indice": return { id, tipo };
    case "passo":
      return { id, tipo, etiqueta: "ordinario", titulo: "", corpo: [] };
    // fora do menu: quem o escreve é ferramentas/ordinario/gerar.py
    case "proprio":
      return { id, tipo, nome: "Intróito", subtitulos: ["Intróito"] };
  }
}
