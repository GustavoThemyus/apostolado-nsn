import { useState, type ReactNode } from "react";
import { site } from "../data/site";
import { usarProgressoDeLeitura } from "../hooks/usarProgressoDeLeitura";
import { usarTema } from "../hooks/usarTema";
import { Elo } from "../rotas/Elo";
import { SECOES_DO_MENU, rotaPorPadrao } from "../rotas/rotas";
import { usarRota } from "../rotas/usarRota";
import { BarraSuperior } from "./BarraSuperior";
import { MenuPrincipal } from "./MenuPrincipal";
import { Rodape } from "./Rodape";
import { SeletorDeTema } from "./SeletorDeTema";
import { Trilha } from "./Trilha";

/**
 * A moldura de toda página: barra, migalhas, conteúdo e rodapé.
 *
 * O grupo de botões da barra encolheu em vez de crescer. Com cinco seções e
 * suas subseções, listá-las na barra não caberia em 390px, então elas foram
 * para o Menu; o Sumário continua onde estava, mas agora como controle da
 * página que o pede.
 */
export function Moldura({
  titulo,
  local,
  sumario,
  comProgresso = false,
  children,
}: {
  titulo: string;
  /** Título da seção em foco, quando a página tem sumário. */
  local?: string;
  sumario?: { aberto: boolean; alternar: () => void };
  comProgresso?: boolean;
  children: ReactNode;
}) {
  const [menuAberto, definirMenuAberto] = useState(false);
  const { tema, alternar } = usarTema();
  const progresso = usarProgressoDeLeitura();
  const { rota } = usarRota();

  return (
    <>
      <a className="pular-para-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <BarraSuperior
        marca={site.marcaCurta}
        local={local ?? titulo}
        progresso={comProgresso ? progresso : undefined}
      >
        <nav className="barra__site" aria-label="Seções do site">
          {SECOES_DO_MENU.filter((p) => p !== "/").map((padrao) => (
            <Elo key={padrao} para={padrao} className="barra__botao barra__botao--secao">
              {rotaPorPadrao(padrao)?.curto ?? rotaPorPadrao(padrao)?.titulo}
            </Elo>
          ))}
        </nav>
        <SeletorDeTema tema={tema} aoAlternar={alternar} />
        {sumario && (
          <button
            type="button"
            className="barra__botao barra__botao--secao"
            onClick={sumario.alternar}
            aria-expanded={sumario.aberto}
            aria-haspopup="dialog"
          >
            Sumário
          </button>
        )}
        <button
          type="button"
          className="barra__botao barra__botao--secao barra__botao--menu"
          onClick={() => definirMenuAberto(true)}
          aria-haspopup="dialog"
        >
          Menu
        </button>
      </BarraSuperior>

      <main className="moldura conteudo" id="conteudo">
        <Trilha rota={rota} />
        {children}
        <Rodape paragrafos={site.rodape} marca={site.marca} lema={site.lema} />
      </main>

      <MenuPrincipal aberto={menuAberto} aoFechar={() => definirMenuAberto(false)} />
    </>
  );
}
