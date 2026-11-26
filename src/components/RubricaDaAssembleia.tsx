import { TextoRico } from "./TextoRico";

export function RubricaDaAssembleia({ texto }: { texto: string }) {
  return (
    <p className="assembleia">
      <span className="assembleia__marca">Assembleia</span>
      <TextoRico texto={texto} />
    </p>
  );
}
