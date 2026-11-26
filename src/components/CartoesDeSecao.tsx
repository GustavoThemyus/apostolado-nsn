import { ESTADO_DA_ROTA, NOME_DO_ESTADO, filhasDe } from "../routes/rotas";
import { Elo } from "../routes/Elo";
import { Seta } from "./Seta";

export function CartoesDeSecao({ padrao }: { padrao: string }) {
  const filhas = filhasDe(padrao);
  if (filhas.length === 0) return null;

  return (
    <nav
      className="cartoes cartoes--secao"
      aria-label="Nesta seção"
      id={ANCORA_DOS_CARTOES}
    >
      {filhas.map((rota) => (
        <Elo key={rota.padrao} para={rota.padrao} className="cartao">
          <span className="cartao__titulo">{rota.titulo}</span>
          {rota.descricao && (
            <span className="cartao__texto">{rota.descricao}</span>
          )}
          {ESTADO_DA_ROTA[rota.padrao] && (
            <span className="cartao__preparo">
              {NOME_DO_ESTADO[ESTADO_DA_ROTA[rota.padrao]]}
            </span>
          )}
          <span className="cartao__ir">
            Ver
            <Seta className="cartao__seta" />
          </span>
        </Elo>
      ))}
    </nav>
  );
}

export const ANCORA_DOS_CARTOES = "nesta-secao";

export function AtalhosDaSecao({ padrao }: { padrao: string }) {
  const filhas = filhasDe(padrao);
  if (filhas.length === 0) return null;

  return (
    <nav className="atalhos" aria-label="Páginas desta seção">
      <p className="atalhos__rotulo">Nesta seção</p>
      <ul className="atalhos__lista">
        {filhas.map((rota) => (
          <li className="atalhos__item" key={rota.padrao}>
            <Elo para={rota.padrao} className="atalhos__elo">
              {rota.curto ?? rota.titulo}
            </Elo>
            {ESTADO_DA_ROTA[rota.padrao] && (
              <span className="atalhos__preparo">
                {" "}
                ({NOME_DO_ESTADO[ESTADO_DA_ROTA[rota.padrao]].toLowerCase()})
              </span>
            )}
          </li>
        ))}
      </ul>
      <a className="atalhos__descer" href={`#${ANCORA_DOS_CARTOES}`}>
        Ver com as descrições
        <Seta className="atalhos__seta" />
      </a>
    </nav>
  );
}
