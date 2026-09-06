import { TextoRico } from "./TextoRico";

/**
 * Rubrica dirigida a quem assiste, e não ao sacerdote: postura, resposta,
 * gesto. Fica em azul, separada do vermelho das rubricas do celebrante, para
 * que o fiel encontre num relance o que lhe cabe fazer.
 */
export function RubricaDaAssembleia({ texto }: { texto: string }) {
  return (
    <p className="assembleia">
      <span className="assembleia__marca">Assembleia</span>
      <TextoRico texto={texto} />
    </p>
  );
}
