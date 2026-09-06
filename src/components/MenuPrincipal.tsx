import { Elo } from "../rotas/Elo";
import { SECOES_DO_MENU, filhasDe, rotaPorPadrao } from "../rotas/rotas";
import { FolhaDeBaixo } from "./FolhaDeBaixo";

/** Documentos ainda por escrever: ganham etiqueta em vez de sumirem. */
const EM_PREPARACAO = new Set([
  "/missa/partes",
  "/missa/situacao-canonica",
  "/calendario/brasil",
  "/calendario/arquidiocese",
  "/indulgencias/raccolta",
  "/indulgencias/enchiridion",
  "/indulgencias/ordens",
  "/apostolado",
]);

function Item({ padrao, nivel }: { padrao: string; nivel: 1 | 2 }) {
  const rota = rotaPorPadrao(padrao);
  if (!rota) return null;
  return (
    <li>
      <Elo para={padrao} exato={nivel === 2} className={`menu__link menu__link--${nivel}`}>
        {rota.titulo}
        {EM_PREPARACAO.has(padrao) && <span className="menu__preparo">Em preparação</span>}
      </Elo>
    </li>
  );
}

export function MenuPrincipal({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  return (
    <FolhaDeBaixo aberto={aberto} aoFechar={aoFechar} rotulo="Menu">
      <nav aria-label="Seções do site" onClick={aoFechar}>
        <ul className="menu__lista">
          {SECOES_DO_MENU.map((padrao) => {
            const filhas = filhasDe(padrao);
            return (
              <li key={padrao}>
                <ul className="menu__grupo">
                  <Item padrao={padrao} nivel={1} />
                  {filhas.map((f) => (
                    <Item key={f.padrao} padrao={f.padrao} nivel={2} />
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </nav>
    </FolhaDeBaixo>
  );
}
