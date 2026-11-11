import { createContext, useContext, type ReactNode } from "react";
import { pecasDoProprio, tipoDaPeca } from "../data/ordinario";
import type { Folheto } from "../data/tipos";
import { ListaDeBlocos } from "./Bloco";
import { Rubrica } from "./Rubrica";
import { TextoRico } from "./TextoRico";

/**
 * O folheto de próprio que vale para a página inteira.
 *
 * Vai por contexto, e não por propriedade, porque quem precisa dele são os
 * dez lugares do próprio, enterrados dentro dos blocos de uma seção: passá-lo
 * de mão em mão obrigaria `ListaDeBlocos` e `Bloco` a carregarem um dado que
 * só interessa ao Ordinário.
 */
const FolhetoDoDia = createContext<{ folheto?: Folheto; dia?: string }>({});

/**
 * `folheto` é o próprio do dia, quando está transcrito. `dia` (ISO) só serve
 * ao Ordinário sem próprio, que remete à Missa do dia daquela data.
 */
export function ComOProprioDoDia({
  folheto,
  dia,
  children,
}: {
  folheto?: Folheto;
  dia?: string;
  children: ReactNode;
}) {
  return <FolhetoDoDia.Provider value={{ folheto, dia }}>{children}</FolhetoDoDia.Provider>;
}

/**
 * Um dos dez lugares em que o impresso manda buscar a Missa do dia.
 *
 * Com folheto, o lugar se preenche: o título é o do folheto, que traz a
 * referência da Escritura junto ("Intróito (Sl XXIV,1-3)"), e o texto é o
 * dele. Sem folheto, fica o que o impresso diz, que é a verdade do papel —
 * o nome da parte e a remissão à Missa do dia.
 *
 * São duas peças num lugar só no Gradual, porque o impresso junta ali o
 * Gradual, o Aleluia e o Tracto, e o folheto os traz separados.
 */
export function LugarDoProprio({
  nome,
  subtitulos,
}: {
  nome: string;
  subtitulos: string[];
}) {
  const { folheto, dia } = useContext(FolhetoDoDia);
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
        <div className={`proprio__peca peca peca--${tipoDaPeca(peca.titulo)}`} key={peca.titulo}>
          <h3 className="subtitulo">
            <TextoRico texto={peca.titulo} />
          </h3>
          <ListaDeBlocos blocos={peca.blocos} />
        </div>
      ))}
    </section>
  );
}
