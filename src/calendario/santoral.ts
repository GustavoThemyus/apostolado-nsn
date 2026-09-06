import type { Classe, Cor } from "./tipos";

export interface FestaFixa {
  mes: number;
  dia: number;
  nome: string;
  classe: Classe;
  cor: Cor;
  /** Vigílias e oitavas se comportam de modo próprio na precedência. */
  tipo?: "vigilia" | "oitava";
}

/**
 * Santoral do Missal de 1962.
 *
 * Estão completas as festas de I e II classe. As de III classe cobrem as mais
 * conhecidas, e as comemorações de IV classe ficaram de fora. Os dados foram
 * escritos a partir do calendário universal e PRECISAM SER CONFERIDOS contra o
 * Divinum Officium antes de uso litúrgico, sobretudo nas de III classe.
 */
export const SANTORAL: FestaFixa[] = [
  // ---------------- janeiro ----------------
  { mes: 1, dia: 14, nome: "Santo Hilário", classe: 3, cor: "branco" },
  { mes: 1, dia: 17, nome: "Santo Antão, abade", classe: 3, cor: "branco" },
  { mes: 1, dia: 20, nome: "São Fabiano e São Sebastião", classe: 3, cor: "vermelho" },
  { mes: 1, dia: 21, nome: "Santa Inês", classe: 3, cor: "vermelho" },
  { mes: 1, dia: 25, nome: "Conversão de São Paulo", classe: 3, cor: "branco" },
  { mes: 1, dia: 27, nome: "São João Crisóstomo", classe: 3, cor: "branco" },
  { mes: 1, dia: 29, nome: "São Francisco de Sales", classe: 3, cor: "branco" },
  { mes: 1, dia: 31, nome: "São João Bosco", classe: 3, cor: "branco" },

  // ---------------- fevereiro ----------------
  { mes: 2, dia: 2, nome: "Purificação de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 2, dia: 5, nome: "Santa Águeda", classe: 3, cor: "vermelho" },
  { mes: 2, dia: 10, nome: "Santa Escolástica", classe: 3, cor: "branco" },
  { mes: 2, dia: 11, nome: "Nossa Senhora de Lourdes", classe: 3, cor: "branco" },
  { mes: 2, dia: 22, nome: "Cátedra de São Pedro", classe: 2, cor: "branco" },
  { mes: 2, dia: 24, nome: "São Matias, apóstolo", classe: 2, cor: "vermelho" },

  // ---------------- março ----------------
  { mes: 3, dia: 7, nome: "São Tomás de Aquino", classe: 3, cor: "branco" },
  { mes: 3, dia: 12, nome: "São Gregório Magno", classe: 3, cor: "branco" },
  { mes: 3, dia: 17, nome: "São Patrício", classe: 3, cor: "branco" },
  { mes: 3, dia: 19, nome: "São José, esposo de Nossa Senhora", classe: 1, cor: "branco" },
  { mes: 3, dia: 21, nome: "São Bento, abade", classe: 3, cor: "branco" },
  { mes: 3, dia: 25, nome: "Anunciação de Nossa Senhora", classe: 1, cor: "branco" },

  // ---------------- abril ----------------
  { mes: 4, dia: 11, nome: "São Leão Magno", classe: 3, cor: "branco" },
  { mes: 4, dia: 25, nome: "São Marcos, evangelista", classe: 2, cor: "vermelho" },
  { mes: 4, dia: 28, nome: "São Paulo da Cruz", classe: 3, cor: "branco" },
  { mes: 4, dia: 29, nome: "São Pedro de Verona, mártir", classe: 3, cor: "vermelho" },
  { mes: 4, dia: 30, nome: "Santa Catarina de Sena", classe: 3, cor: "branco" },

  // ---------------- maio ----------------
  { mes: 5, dia: 1, nome: "São José Operário", classe: 1, cor: "branco" },
  { mes: 5, dia: 2, nome: "Santo Atanásio", classe: 3, cor: "branco" },
  { mes: 5, dia: 4, nome: "Santa Mônica", classe: 3, cor: "branco" },
  { mes: 5, dia: 5, nome: "São Pio V", classe: 3, cor: "branco" },
  { mes: 5, dia: 13, nome: "São Roberto Belarmino", classe: 3, cor: "branco" },
  { mes: 5, dia: 26, nome: "São Filipe Néri", classe: 3, cor: "branco" },
  { mes: 5, dia: 31, nome: "Nossa Senhora Rainha", classe: 2, cor: "branco" },

  // ---------------- junho ----------------
  { mes: 6, dia: 11, nome: "São Barnabé, apóstolo", classe: 3, cor: "vermelho" },
  { mes: 6, dia: 13, nome: "Santo Antônio de Pádua", classe: 3, cor: "branco" },
  { mes: 6, dia: 21, nome: "São Luís Gonzaga", classe: 3, cor: "branco" },
  { mes: 6, dia: 24, nome: "Natividade de São João Batista", classe: 1, cor: "branco" },
  { mes: 6, dia: 28, nome: "Vigília de São Pedro e São Paulo", classe: 2, cor: "roxo", tipo: "vigilia" },
  { mes: 6, dia: 29, nome: "São Pedro e São Paulo, apóstolos", classe: 1, cor: "vermelho" },
  { mes: 6, dia: 30, nome: "Comemoração de São Paulo", classe: 3, cor: "vermelho" },

  // ---------------- julho ----------------
  { mes: 7, dia: 1, nome: "Preciosíssimo Sangue de Nosso Senhor", classe: 1, cor: "vermelho" },
  { mes: 7, dia: 2, nome: "Visitação de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 7, dia: 16, nome: "Nossa Senhora do Carmo", classe: 3, cor: "branco" },
  { mes: 7, dia: 19, nome: "São Vicente de Paulo", classe: 3, cor: "branco" },
  { mes: 7, dia: 22, nome: "Santa Maria Madalena", classe: 3, cor: "branco" },
  { mes: 7, dia: 24, nome: "Vigília de São Tiago", classe: 3, cor: "roxo", tipo: "vigilia" },
  { mes: 7, dia: 25, nome: "São Tiago, apóstolo", classe: 2, cor: "vermelho" },
  { mes: 7, dia: 26, nome: "Santa Ana, mãe de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 7, dia: 31, nome: "Santo Inácio de Loyola", classe: 3, cor: "branco" },

  // ---------------- agosto ----------------
  { mes: 8, dia: 4, nome: "São Domingos", classe: 3, cor: "branco" },
  { mes: 8, dia: 5, nome: "Nossa Senhora das Neves", classe: 3, cor: "branco" },
  { mes: 8, dia: 6, nome: "Transfiguração do Senhor", classe: 2, cor: "branco" },
  { mes: 8, dia: 8, nome: "São João Maria Vianney", classe: 3, cor: "branco" },
  { mes: 8, dia: 10, nome: "São Lourenço, mártir", classe: 2, cor: "vermelho" },
  { mes: 8, dia: 12, nome: "Santa Clara", classe: 3, cor: "branco" },
  { mes: 8, dia: 14, nome: "Vigília da Assunção", classe: 2, cor: "roxo", tipo: "vigilia" },
  { mes: 8, dia: 15, nome: "Assunção de Nossa Senhora", classe: 1, cor: "branco" },
  { mes: 8, dia: 16, nome: "São Joaquim, pai de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 8, dia: 20, nome: "São Bernardo", classe: 3, cor: "branco" },
  { mes: 8, dia: 22, nome: "Imaculado Coração de Maria", classe: 2, cor: "branco" },
  { mes: 8, dia: 24, nome: "São Bartolomeu, apóstolo", classe: 2, cor: "vermelho" },
  { mes: 8, dia: 25, nome: "São Luís, rei de França", classe: 3, cor: "branco" },
  { mes: 8, dia: 28, nome: "Santo Agostinho", classe: 3, cor: "branco" },
  { mes: 8, dia: 29, nome: "Degolação de São João Batista", classe: 3, cor: "vermelho" },
  { mes: 8, dia: 30, nome: "Santa Rosa de Lima", classe: 3, cor: "branco" },

  // ---------------- setembro ----------------
  { mes: 9, dia: 3, nome: "São Pio X", classe: 3, cor: "branco" },
  { mes: 9, dia: 8, nome: "Natividade de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 9, dia: 12, nome: "Santíssimo Nome de Maria", classe: 3, cor: "branco" },
  { mes: 9, dia: 14, nome: "Exaltação da Santa Cruz", classe: 2, cor: "vermelho" },
  { mes: 9, dia: 15, nome: "Sete Dores de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 9, dia: 16, nome: "São Cornélio e São Cipriano", classe: 3, cor: "vermelho" },
  { mes: 9, dia: 21, nome: "São Mateus, apóstolo e evangelista", classe: 2, cor: "vermelho" },
  { mes: 9, dia: 24, nome: "Nossa Senhora das Mercês", classe: 3, cor: "branco" },
  { mes: 9, dia: 27, nome: "São Cosme e São Damião", classe: 3, cor: "vermelho" },
  { mes: 9, dia: 29, nome: "Dedicação de São Miguel Arcanjo", classe: 1, cor: "branco" },
  { mes: 9, dia: 30, nome: "São Jerônimo", classe: 3, cor: "branco" },

  // ---------------- outubro ----------------
  { mes: 10, dia: 2, nome: "Santos Anjos da Guarda", classe: 3, cor: "branco" },
  { mes: 10, dia: 3, nome: "Santa Teresinha do Menino Jesus", classe: 3, cor: "branco" },
  { mes: 10, dia: 4, nome: "São Francisco de Assis", classe: 3, cor: "branco" },
  { mes: 10, dia: 7, nome: "Nossa Senhora do Rosário", classe: 2, cor: "branco" },
  { mes: 10, dia: 11, nome: "Maternidade de Nossa Senhora", classe: 2, cor: "branco" },
  { mes: 10, dia: 15, nome: "Santa Teresa de Ávila", classe: 3, cor: "branco" },
  { mes: 10, dia: 17, nome: "Santa Margarida Maria Alacoque", classe: 3, cor: "branco" },
  { mes: 10, dia: 18, nome: "São Lucas, evangelista", classe: 2, cor: "vermelho" },
  { mes: 10, dia: 24, nome: "São Rafael Arcanjo", classe: 3, cor: "branco" },
  { mes: 10, dia: 28, nome: "São Simão e São Judas, apóstolos", classe: 2, cor: "vermelho" },

  // ---------------- novembro ----------------
  { mes: 11, dia: 1, nome: "Todos os Santos", classe: 1, cor: "branco" },
  { mes: 11, dia: 2, nome: "Comemoração de Todos os Fiéis Defuntos", classe: 1, cor: "preto" },
  { mes: 11, dia: 4, nome: "São Carlos Borromeu", classe: 3, cor: "branco" },
  { mes: 11, dia: 9, nome: "Dedicação da Arquibasílica do Salvador", classe: 2, cor: "branco" },
  { mes: 11, dia: 11, nome: "São Martinho de Tours", classe: 3, cor: "branco" },
  { mes: 11, dia: 14, nome: "São Josafá", classe: 3, cor: "vermelho" },
  { mes: 11, dia: 21, nome: "Apresentação de Nossa Senhora", classe: 3, cor: "branco" },
  { mes: 11, dia: 22, nome: "Santa Cecília", classe: 3, cor: "vermelho" },
  { mes: 11, dia: 24, nome: "São João da Cruz", classe: 3, cor: "branco" },
  { mes: 11, dia: 29, nome: "Vigília de Santo André", classe: 3, cor: "roxo", tipo: "vigilia" },
  { mes: 11, dia: 30, nome: "Santo André, apóstolo", classe: 2, cor: "vermelho" },

  // ---------------- dezembro ----------------
  { mes: 12, dia: 3, nome: "São Francisco Xavier", classe: 3, cor: "branco" },
  { mes: 12, dia: 4, nome: "São Pedro Crisólogo", classe: 3, cor: "branco" },
  { mes: 12, dia: 6, nome: "São Nicolau", classe: 3, cor: "branco" },
  { mes: 12, dia: 7, nome: "Santo Ambrósio", classe: 3, cor: "branco" },
  { mes: 12, dia: 8, nome: "Imaculada Conceição de Nossa Senhora", classe: 1, cor: "branco" },
  { mes: 12, dia: 11, nome: "São Dâmaso", classe: 3, cor: "branco" },
  { mes: 12, dia: 13, nome: "Santa Luzia", classe: 3, cor: "vermelho" },
  { mes: 12, dia: 21, nome: "São Tomé, apóstolo", classe: 2, cor: "vermelho" },
  { mes: 12, dia: 24, nome: "Vigília do Natal", classe: 1, cor: "roxo", tipo: "vigilia" },
  { mes: 12, dia: 26, nome: "Santo Estêvão, primeiro mártir", classe: 2, cor: "vermelho" },
  { mes: 12, dia: 27, nome: "São João, apóstolo e evangelista", classe: 2, cor: "branco" },
  { mes: 12, dia: 28, nome: "Santos Inocentes", classe: 2, cor: "vermelho" },
  { mes: 12, dia: 29, nome: "São Tomás Becket", classe: 3, cor: "vermelho" },
  { mes: 12, dia: 31, nome: "São Silvestre", classe: 3, cor: "branco" },
];

/** Festas fixas de uma data. */
export function festasDe(mes: number, dia: number): FestaFixa[] {
  return SANTORAL.filter((f) => f.mes === mes && f.dia === dia);
}
