import type { Verso } from "../data/tipos";
import { TextoRico } from "./TextoRico";

export function Oracao({ versos }: { versos: Verso[] }) {
  return (
    <blockquote className="oracao">
      {versos.map((verso, indice) => (
        <p className="oracao__verso" key={indice}>
          {verso.latim && (
            <span className="oracao__latim" lang="la">
              {verso.latim}
            </span>
          )}
          {verso.portugues && (
            <span className="oracao__portugues">
              <TextoRico texto={verso.portugues} />
            </span>
          )}
        </p>
      ))}
    </blockquote>
  );
}
