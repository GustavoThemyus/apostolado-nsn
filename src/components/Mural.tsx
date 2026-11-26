import { ListaDeBlocos } from "./Bloco";
import type { Bloco } from "../data/tipos";

export interface Aviso {
  id: string;
  titulo: string;
  ate?: string;
  blocos: Bloco[];
}

const aindaVale = (aviso: Aviso, hoje: string) => !aviso.ate || aviso.ate >= hoje;

export function Mural({ avisos }: { avisos: Aviso[] }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const vigentes = avisos.filter((a) => aindaVale(a, hoje));

  return (
    <section className="mural" aria-labelledby="mural-titulo">
      <h2 className="mural__titulo" id="mural-titulo">
        Avisos
      </h2>
      {vigentes.length === 0 ? (
        <p className="mural__vazio">Nenhum aviso no momento.</p>
      ) : (
        <ul className="mural__lista">
          {vigentes.map((a) => (
            <li className="mural__aviso" key={a.id}>
              <h3 className="mural__aviso-titulo">{a.titulo}</h3>
              <ListaDeBlocos blocos={a.blocos} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
