import { ESTADO_DA_ROTA, NOME_DO_ESTADO, filhasDe } from "../routes/rotas";
import { Elo } from "../routes/Elo";
import { Seta } from "./Seta";

/**
 * Os caminhos que saem de uma seção, em cartões.
 *
 * Sem isto, `/missa` prometia no texto \"abaixo, três caminhos\" e não trazia
 * nenhum: o guia só era alcançável pelo Menu, o que o fazia parecer uma
 * página perdida atrás da Missa Tridentina em vez de o destino principal
 * dela. Vale para toda seção com subpáginas, não só para a Missa.
 */
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

/** Onde os cartões ficam, para o índice do alto poder apontar para eles. */
export const ANCORA_DOS_CARTOES = "nesta-secao";

/**
 * O mesmo destino dos cartões, anunciado no alto da página.
 *
 * Os cartões ficam no fim, e quem chega ao texto não tem como saber que a
 * seção tem outras páginas sem rolar até lá. Esta linha diz de saída o que
 * existe, e cada nome já leva direto: quem sabe aonde vai não precisa passar
 * pelo cartão. Quem quiser ver a descrição de cada um desce pelo elo do fim.
 *
 * Fica no mesmo arquivo dos cartões de propósito: as duas listas saem de
 * `filhasDe`, e separá-las seria abrir espaço para uma esquecer a outra.
 */
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
      {/* âncora da própria página: o Roteador não intercepta href com # */}
      <a className="atalhos__descer" href={`#${ANCORA_DOS_CARTOES}`}>
        Ver com as descrições
        <Seta className="atalhos__seta" />
      </a>
    </nav>
  );
}
