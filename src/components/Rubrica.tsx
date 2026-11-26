import { TextoRico } from "./TextoRico";

export function Rubrica({ texto }: { texto: string }) {
  return (
    <p className="rubrica">
      <TextoRico texto={texto} />
    </p>
  );
}
