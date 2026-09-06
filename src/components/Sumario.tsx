import type { Secao } from "../data/tipos";
import { FolhaDeBaixo } from "./FolhaDeBaixo";

interface Propriedades {
  secoes: Secao[];
  secaoAtiva: string | null;
  variante: "embutido" | "flutuante";
  aberto?: boolean;
  aoFechar?: () => void;
}

/** A lista de seções, que é o mesmo conteúdo nas duas variantes. */
function Lista({
  secoes,
  secaoAtiva,
  aoEscolher,
}: {
  secoes: Secao[];
  secaoAtiva: string | null;
  aoEscolher?: () => void;
}) {
  return (
    <>
      <p className="sumario__titulo">Nesta página</p>
      <ol className="sumario__lista">
        {secoes.map((secao) => (
          <li key={secao.id}>
            {/* âncora de verdade: o Roteador não intercepta href que começa com # */}
            <a
              className="sumario__link"
              href={`#${secao.id}`}
              aria-current={secaoAtiva === secao.id ? "true" : undefined}
              onClick={aoEscolher}
            >
              {secao.titulo}
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}

export function Sumario({ secoes, secaoAtiva, variante, aberto = true, aoFechar }: Propriedades) {
  if (variante === "flutuante") {
    return (
      <FolhaDeBaixo aberto={aberto} aoFechar={aoFechar ?? (() => {})} rotulo="Sumário">
        <Lista secoes={secoes} secaoAtiva={secaoAtiva} aoEscolher={aoFechar} />
      </FolhaDeBaixo>
    );
  }

  return (
    <nav className="sumario sumario--embutido" aria-label="Sumário da página" id="sumario">
      <div className="sumario__painel">
        <Lista secoes={secoes} secaoAtiva={secaoAtiva} />
      </div>
    </nav>
  );
}
