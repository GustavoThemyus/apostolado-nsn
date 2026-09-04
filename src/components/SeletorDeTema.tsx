import { ROTULO_DO_TEMA, type Tema } from "../hooks/usarTema";
import { IconeDeTema } from "./IconeDeTema";

export function SeletorDeTema({ tema, aoAlternar }: { tema: Tema; aoAlternar: () => void }) {
  return (
    <button
      type="button"
      className="barra__botao barra__botao--icone"
      onClick={aoAlternar}
      aria-label={`Tema: ${ROTULO_DO_TEMA[tema]}. Tocar para trocar.`}
      title={`Tema: ${ROTULO_DO_TEMA[tema]}`}
    >
      <IconeDeTema tema={tema} />
    </button>
  );
}
