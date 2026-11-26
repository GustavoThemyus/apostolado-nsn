import { createContext, useContext, type ReactNode } from "react";
import { pecasDoProprio, semAberturaDoEvangelho, tipoDaPeca } from "../data/ordinario";
import type { Folheto } from "../data/tipos";
import { ListaDeBlocos } from "./Bloco";
import { Rubrica } from "./Rubrica";
import { TextoRico } from "./TextoRico";

const FolhetoDoDia = createContext<{ folheto?: Folheto; dia?: string; evangelhoNoOrdinario?: boolean }>({});

export function ComOProprioDoDia({
  folheto,
  dia,
  evangelhoNoOrdinario,
  children,
}: {
  folheto?: Folheto;
  dia?: string;
  evangelhoNoOrdinario?: boolean;
  children: ReactNode;
}) {
  return (
    <FolhetoDoDia.Provider value={{ folheto, dia, evangelhoNoOrdinario }}>
      {children}
    </FolhetoDoDia.Provider>
  );
}

export function LugarDoProprio({
  nome,
  subtitulos,
}: {
  nome: string;
  subtitulos: string[];
}) {
  const { folheto, dia, evangelhoNoOrdinario } = useContext(FolhetoDoDia);
  const pecas = folheto ? pecasDoProprio(folheto, subtitulos) : [];

  if (pecas.length === 0) {
    return (
      <section className="proprio proprio--vazio" aria-label={nome}>
        <h3 className="subtitulo">{nome}</h3>
        <Rubrica
          texto={
            dia
              ? `[elo:/missa/dia?dia=${dia}]Ver a Missa do dia[/elo].`
              : "Ver a Missa do dia."
          }
        />
      </section>
    );
  }

  return (
    <section className="proprio" aria-label={nome}>
      {pecas.map((peca) => (
        <div
          className={
            `proprio__peca peca peca--${tipoDaPeca(peca.titulo)}` +
            (nome === "Evangelho" && evangelhoNoOrdinario ? " peca--abertura-fora" : "")
          }
          key={peca.titulo}
        >
          <h3 className="subtitulo">
            <TextoRico texto={peca.titulo} />
          </h3>
          <ListaDeBlocos
            blocos={nome === "Evangelho" && evangelhoNoOrdinario ? semAberturaDoEvangelho(peca.blocos) : peca.blocos}
          />
        </div>
      ))}
    </section>
  );
}
