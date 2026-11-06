// Gerado por ferramentas/ordinario/gerar.py. Não edite à mão.

/** Uma seção do Ordinário: o que o índice mostra antes de baixar o texto. */
export interface SecaoDoOrdinario {
  id: string;
  titulo: string;
  /** Reza-se acompanhando o celebrante, e não antes nem depois da Missa. */
  naMissa: boolean;
}

export const SECOES: SecaoDoOrdinario[] = [
  { id: "capa", titulo: "Ordinário da Missa", naMissa: false },
  { id: "magisterio", titulo: "A voz do Magistério", naMissa: false },
  { id: "preparacao", titulo: "Oração preparatória", naMissa: false },
  { id: "asperges", titulo: "Aspersão", naMissa: true },
  { id: "pe-altar", titulo: "Orações ao pé do altar", naMissa: true },
  { id: "catecumenos", titulo: "Missa dos catecúmenos", naMissa: true },
  { id: "ofertorio", titulo: "Ofertório", naMissa: true },
  { id: "canon", titulo: "Canon da Missa", naMissa: true },
  { id: "comunhao", titulo: "Comunhão", naMissa: true },
  { id: "conclusao", titulo: "Conclusão e Último Evangelho", naMissa: true },
  { id: "leoninas", titulo: "Orações no fim da Missa rezada", naMissa: true },
  { id: "acao-de-gracas", titulo: "Ação de graças depois da Missa", naMissa: false },
  { id: "bencao", titulo: "Exposição e bênção do Santíssimo", naMissa: false },
];

/**
 * Um arquivo por seção, carregado só quando o leitor chega nela.
 *
 * O tipo é `unknown` de propósito, como no Ordo: o que a forma do JSON
 * garante é o gerador, e quem confere é ferramentas/ordinario/conferir.py.
 */
export const ARQUIVOS: Record<string, () => Promise<{ default: unknown }>> = {
  "capa": () => import("./capa.json"),
  "magisterio": () => import("./magisterio.json"),
  "preparacao": () => import("./preparacao.json"),
  "asperges": () => import("./asperges.json"),
  "pe-altar": () => import("./pe-altar.json"),
  "catecumenos": () => import("./catecumenos.json"),
  "ofertorio": () => import("./ofertorio.json"),
  "canon": () => import("./canon.json"),
  "comunhao": () => import("./comunhao.json"),
  "conclusao": () => import("./conclusao.json"),
  "leoninas": () => import("./leoninas.json"),
  "acao-de-gracas": () => import("./acao-de-gracas.json"),
  "bencao": () => import("./bencao.json"),
};
