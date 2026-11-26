import { useState } from "react";
import { ESTADO_DA_ROTA, NOME_DO_ESTADO, SECOES_DO_MENU, filhasDe, rotaPorPadrao } from "../routes/rotas";
import { site } from "../data/site";
import { Brasao } from "./Brasao";
import { Estrela } from "./Estrela";
import { Elo } from "../routes/Elo";
import { Folha } from "./Folha";
import { Seta } from "./Seta";

export function MenuPrincipal({
  aberto,
  aoFechar,
}: {
  aberto: boolean;
  aoFechar: () => void;
}) {
  const [abertas, definirAbertas] = useState<string[]>([]);
  const alternar = (padrao: string) =>
    definirAbertas((a) => (a.includes(padrao) ? a.filter((p) => p !== padrao) : [...a, padrao]));

  return (
    <Folha aberto={aberto} aoFechar={aoFechar} rotulo="Menu">
      <div className="menu__testeira">
        <Brasao tamanho="menu" />
        <p className="menu__marca">{site.marca}</p>
        <p className="menu__lema" lang="la">
          <Estrela />
          {site.lema}
          <Estrela />
        </p>
      </div>

      <nav
        aria-label="Seções do site"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) aoFechar();
        }}
      >
        <ul className="menu__lista">
          {SECOES_DO_MENU.map((padrao) => {
            const rota = rotaPorPadrao(padrao);
            if (!rota) return null;
            const filhas = filhasDe(padrao);
            const aberta = abertas.includes(padrao);
            const idDasFilhas = `menu-filhas${padrao.replace(/\//g, "-")}`;
            return (
              <li key={padrao} className={filhas.length ? "menu__item menu__item--com-filhas" : "menu__item"}>
                <Elo
                  para={padrao}
                  exato={padrao === "/"}
                  className="menu__secao"
                >
                  <span className="menu__nome">
                    {rota.titulo}
                    {ESTADO_DA_ROTA[padrao] && (
                      <span className="menu__preparo">
                        {NOME_DO_ESTADO[ESTADO_DA_ROTA[padrao]]}
                      </span>
                    )}
                  </span>
                  {filhas.length === 0 && <Seta className="menu__seta" />}
                </Elo>
                {filhas.length > 0 && (
                  <button
                    type="button"
                    className="menu__abrir"
                    aria-expanded={aberta}
                    aria-controls={idDasFilhas}
                    aria-label={`Páginas de ${rota.curto ?? rota.titulo}`}
                    onClick={() => alternar(padrao)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </button>
                )}
                {filhas.length > 0 && (
                  <ul className="menu__filhas" id={idDasFilhas} hidden={!aberta}>
                    {filhas.map((filha) => (
                      <li key={filha.padrao}>
                        <Elo para={filha.padrao} exato className="menu__filha">
                          {filha.curto ?? filha.titulo}
                          {ESTADO_DA_ROTA[filha.padrao] && (
                            <span className="menu__preparo">
                              {NOME_DO_ESTADO[ESTADO_DA_ROTA[filha.padrao]]}
                            </span>
                          )}
                        </Elo>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </Folha>
  );
}
