import { NOME_DA_ETIQUETA, type Etiqueta as TipoEtiqueta } from "../data/tipos";

export function Etiqueta({ valor }: { valor: TipoEtiqueta }) {
  return <span className={`etiqueta etiqueta--${valor}`}>{NOME_DA_ETIQUETA[valor]}</span>;
}
