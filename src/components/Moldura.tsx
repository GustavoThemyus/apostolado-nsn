import { useState, type ReactNode } from "react";
import { Lateral } from "./Lateral";
import { site } from "../data/site";
import { usarProgressoDeLeitura } from "../hooks/usarProgressoDeLeitura";
import { usarTema } from "../hooks/usarTema";
import { Elo } from "../routes/Elo";
import { SECOES_DO_MENU, rotaPorPadrao } from "../routes/rotas";
import { usarRota } from "../routes/usarRota";
import { BarraSuperior } from "./BarraSuperior";
import { MenuPrincipal } from "./MenuPrincipal";
import { Rodape } from "./Rodape";
import { SeletorDeTema } from "./SeletorDeTema";
import { Trilha } from "./Trilha";

export function Moldura({
  titulo,
  local,
  sumario,
  comProgresso = false,
  children,
}: {
  titulo: string;
  local?: string;
  sumario?: { aberto: boolean; alternar: () => void };
  comProgresso?: boolean;
  children: ReactNode;
}) {
  const [menuAberto, definirMenuAberto] = useState(false);
  const { tema, alternar } = usarTema();
  const progresso = usarProgressoDeLeitura(comProgresso);
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
        menu={
          <button
            type="button"
            className="barra__botao barra__botao--menu"
            onClick={() => definirMenuAberto(true)}
            aria-haspopup="dialog"
            aria-expanded={menuAberto}
          >
            <svg
              className="barra__barras"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Menu
          </button>
        }
      >
        <nav className="barra__site" aria-label="Seções do site">
          {SECOES_DO_MENU.map((padrao) => (
            <Elo
              key={padrao}
              para={padrao}
              className="barra__botao barra__botao--secao"
            >
              {rotaPorPadrao(padrao)?.curto ?? rotaPorPadrao(padrao)?.titulo}
            </Elo>
          ))}
        </nav>
        <SeletorDeTema tema={tema} aoAlternar={alternar} />
        {sumario && (
          <button
            type="button"
            className="barra__botao barra__botao--secao barra__botao--sumario"
            onClick={sumario.alternar}
            aria-expanded={sumario.aberto}
            aria-haspopup="dialog"
          >
            Sumário
          </button>
        )}
      </BarraSuperior>

      <main className="moldura conteudo" id="conteudo">
        {rota?.padrao !== "/" && <Lateral />}
        <Trilha rota={rota} atual={titulo} />
        {children}
        <Rodape
          paragrafos={site.rodape}
          marca={site.marca}
          lema={site.lema}
          email={site.email}
          credito={site.credito}
        />
      </main>

      <MenuPrincipal
        aberto={menuAberto}
        aoFechar={() => definirMenuAberto(false)}
      />
    </>
  );
}
