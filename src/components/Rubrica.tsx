import { TextoRico } from "./TextoRico";

/** Texto vermelho e em itálico: gesto, posição, quem faz o quê. */
export function Rubrica({ texto }: { texto: string }) {
  return (
    <p className="rubrica">
      <TextoRico texto={texto} />
    </p>
  );
}
