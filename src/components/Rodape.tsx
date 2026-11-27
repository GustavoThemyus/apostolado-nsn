import { Estrela } from "./Estrela";
import { TextoRico } from "./TextoRico";

export function Rodape({
  paragrafos,
  marca,
  lema,
  email,
  credito,
}: {
  paragrafos: string[];
  marca: string;
  lema: string;
  email?: string;
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
      {email && (
        <p className="rodape__email">
          <a className="elo-texto" href={`mailto:${email}`}>
            {email}
          </a>
        </p>
      )}
      {credito && (
        <p className="rodape__credito">
          <TextoRico texto={credito} />
        </p>
      )}
    </footer>
  );
}
