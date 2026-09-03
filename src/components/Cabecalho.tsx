import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";

export function Cabecalho({
  chamada,
  titulo,
  descricao,
  epigrafe,
}: {
  chamada: string;
  titulo: string;
  descricao: string;
  epigrafe: string;
}) {
  return (
    <header className="cabecalho damasco">
      <Brasao tamanho="cabecalho" />
      <p className="cabecalho__chamada">{chamada}</p>
      <h1 className="cabecalho__titulo">{titulo}</h1>
      <p className="cabecalho__resumo">{descricao}</p>
      <p className="cabecalho__lema" lang="la">
        <Estrela />
        {epigrafe}
        <Estrela />
      </p>
    </header>
  );
}
