import type { Secao as TipoSecao } from "../data/tipos";
import { ListaDeBlocos } from "./Bloco";
import { TextoRico } from "./TextoRico";

export function Secao({ secao }: { secao: TipoSecao }) {
  return (
    <section className="secao" id={secao.id} aria-labelledby={`titulo-${secao.id}`}>
      <h2 className="secao__titulo" id={`titulo-${secao.id}`}>
        <span className="secao__numero" aria-hidden="true">
          {secao.numero}
        </span>
        {secao.titulo}
      </h2>
      {secao.resumo && (
        <p className="secao__resumo">
          <TextoRico texto={secao.resumo} />
        </p>
      )}
      <ListaDeBlocos blocos={secao.blocos} />
    </section>
  );
}
