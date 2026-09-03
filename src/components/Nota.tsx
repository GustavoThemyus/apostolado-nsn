import { TextoRico } from "./TextoRico";

export function Nota({
  titulo,
  paragrafos,
  alerta = false,
}: {
  titulo: string;
  paragrafos: string[];
  alerta?: boolean;
}) {
  return (
    <aside className={alerta ? "nota nota--alerta" : "nota"}>
      <h4 className="nota__titulo">
        <TextoRico texto={titulo} />
      </h4>
      {paragrafos.map((paragrafo, indice) => (
        <p key={indice}>
          <TextoRico texto={paragrafo} />
        </p>
      ))}
    </aside>
  );
}
