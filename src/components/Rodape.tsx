import { Estrela } from "./Estrela";
import { TextoRico } from "./TextoRico";

export function Rodape({
  paragrafos,
  marca,
  lema,
  credito,
}: {
  paragrafos: string[];
  marca: string;
  lema: string;
  credito?: string;
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
      <span className="rodape__selo" aria-hidden="true" />
      <p className="rodape__marca">
        {marca}
        <span className="rodape__lema" lang="la">
          {lema}
        </span>
      </p>
      {credito && (
        <p className="rodape__credito">
          <TextoRico texto={credito} />
        </p>
      )}
    </footer>
  );
}
