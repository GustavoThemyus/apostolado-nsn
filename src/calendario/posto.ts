export const POSTO = {
  triduo: 1,
  pascoaPentecostes: 2,
  senhorPrimeira: 3,
  domingoPrimeira: 4,
  feriaPrivilegiada: 5,
  vigiliaPrimeira: 6,
  festaPrimeira: 8,
  domingoSegunda: 9,
  festaSegunda: 10,
  vigiliaSegunda: 11,
  feriaSegunda: 11,
  festaTerceira: 12,
  feriaTerceira: 13,
  feriaQuarta: 14,
} as const;

export function livreParaTransferencia(posto: number): boolean {
  return posto > POSTO.vigiliaSegunda;
}
