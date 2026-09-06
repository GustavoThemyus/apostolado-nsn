/**
 * Ordem de precedência da Tabula dierum liturgicorum (1960), reduzida ao que
 * o guia precisa. Número menor vence: o posto 1 não cede a nada.
 *
 * A distinção que importa para a transferência é que os domingos de I classe
 * e os dias do Tríduo vencem as festas de I classe do Santoral. É por isso que
 * a Imaculada Conceição cai para o dia 9 quando 8 de dezembro é domingo do
 * Advento, e que a Anunciação em Semana Santa vai parar depois da Páscoa.
 */
export const POSTO = {
  /** Tríduo Sacro. */
  triduo: 1,
  /** Páscoa e Pentecostes. */
  pascoaPentecostes: 2,
  /** Festas de I classe do Senhor: Natal, Epifania, Ascensão, Corpus Christi. */
  senhorPrimeira: 3,
  /** Domingos de I classe: Advento, Quaresma, Paixão, Ramos, in albis. */
  domingoPrimeira: 4,
  /** Cinzas e ferias da Semana Santa. */
  feriaPrivilegiada: 5,
  /** Vigílias do Natal e de Pentecostes. */
  vigiliaPrimeira: 6,
  /** Festas de I classe do Santoral. São estas que se transferem. */
  festaPrimeira: 8,
  /** Domingos de II classe. */
  domingoSegunda: 9,
  /** Festas de II classe e Finados. */
  festaSegunda: 10,
  /** Vigílias de II classe. */
  vigiliaSegunda: 11,
  /** Festas de III classe. */
  festaTerceira: 12,
  /** Ferias de Advento, Quaresma e Paixão. */
  feriaTerceira: 13,
  /** Ferias comuns. */
  feriaQuarta: 14,
} as const;

/** Um dia está livre para receber transferência se nada de I ou II classe o ocupa. */
export function livreParaTransferencia(posto: number): boolean {
  return posto > POSTO.vigiliaSegunda;
}
