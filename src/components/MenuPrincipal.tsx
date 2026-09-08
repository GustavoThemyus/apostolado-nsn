import { EM_PREPARACAO, SECOES_DO_MENU, rotaPorPadrao } from "../rotas/rotas";
import { Elo } from "../rotas/Elo";
import { Folha } from "./Folha";
import { Seta } from "./Seta";

/**
 * O menu do site: as seis seções de topo, e só elas.
 *
 * Listar também as dezesseis subpáginas fazia do menu um índice, não um mapa:
 * o leitor tinha de ler tudo para achar as seções. As subpáginas moram na
 * página da sua seção, em cartões, que é onde elas fazem sentido e onde há
 * espaço para dizer o que são.
 */
export function MenuPrincipal({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  return (
    <Folha aberto={aberto} aoFechar={aoFechar} rotulo="Menu">
      <nav aria-label="Seções do site" onClick={aoFechar}>
        <ul className="menu__lista">
          {SECOES_DO_MENU.map((padrao) => {
            const rota = rotaPorPadrao(padrao);
            if (!rota) return null;
            return (
              <li key={padrao}>
                <Elo para={padrao} exato={padrao === "/"} className="menu__secao">
                  <span className="menu__nome">
                    {rota.titulo}
                    {EM_PREPARACAO.has(padrao) && (
                      <span className="menu__preparo">Em preparação</span>
                    )}
                  </span>
                  {rota.descricao && <span className="menu__resumo">{rota.descricao}</span>}
                  <Seta className="menu__seta" />
                </Elo>
              </li>
            );
          })}
        </ul>
      </nav>
    </Folha>
  );
}
