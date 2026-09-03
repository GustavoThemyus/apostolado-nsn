import { Estrela } from "./Estrela";
import { TextoRico } from "./TextoRico";

export function Rodape({
  paragrafos,
  marca,
  lema,
}: {
  paragrafos: string[];
  marca: string;
  lema: string;
}) {
  return (
    <footer className="rodape">
      <p className="filete" aria-hidden="true">
        <Estrela />
      </p>
      {paragrafos.map((paragrafo, indice) => (
        <p key={indice}>
          <TextoRico texto={paragrafo} />
        </p>
      ))}
      <p className="rodape__marca">
        {marca}
        <span className="rodape__lema" lang="la">
          {lema}
        </span>
      </p>
    </footer>
  );
}
