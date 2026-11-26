import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { interpretar } from "./TextoRico";

export interface ParteDoBrasao {
  id: string;
  rotulo: string;
  x: number;
  y: number;
  paragrafos: string[];
}

type Estado = "linha" | "aberta" | "fechando";

const PROJETAR = 380;
const RECOLHER = 360;
const COM_LINHAS = "(min-width: 56rem)";

const semMovimento = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const comLinhas = () => typeof matchMedia === "function" && matchMedia(COM_LINHAS).matches;

export function BrasaoComentado({ partes }: { partes: ParteDoBrasao[] }) {
  const [estados, definirEstados] = useState<Record<string, Estado>>({});
  const [revelado, definirRevelado] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const linhas = useRef(new Map<string, SVGLineElement>());
  const relogios = useRef(new Map<string, number>());

  const medir = useCallback(() => {
    const raiz = caixa.current;
    if (!raiz) return;
    const base = raiz.getBoundingClientRect();
    for (const [id, linha] of linhas.current) {
      const numero = raiz.querySelector<HTMLElement>(`[data-numero="${id}"]`);
      const marca = raiz.querySelector<HTMLElement>(`[data-marca="${id}"]`);
      if (!numero || !marca) continue;
      const a = numero.getBoundingClientRect();
      const b = marca.getBoundingClientRect();
      linha.setAttribute("x1", String(a.left + a.width / 2 - base.left));
      linha.setAttribute("y1", String(a.top + a.height / 2 - base.top));
      linha.setAttribute("x2", String(b.left - base.left));
      linha.setAttribute("y2", String(b.top + b.height / 2 - base.top));
    }
  }, []);

  useLayoutEffect(medir, [estados, medir]);

  useEffect(() => {
    const raiz = caixa.current;
    if (!raiz) return;
    let pendente = 0;
    const agendar = () => {
      if (pendente) return;
      pendente = requestAnimationFrame(() => {
        pendente = 0;
        medir();
      });
    };
    const observador = new ResizeObserver(agendar);
    observador.observe(raiz);
    window.addEventListener("scroll", agendar, { passive: true });
    document.fonts?.ready.then(agendar);
    return () => {
      observador.disconnect();
      window.removeEventListener("scroll", agendar);
      if (pendente) cancelAnimationFrame(pendente);
    };
  }, [medir]);

  useEffect(() => {
    const pendentes = relogios.current;
    return () => pendentes.forEach((r) => window.clearTimeout(r));
  }, []);

  const depois = (id: string, ms: number, feito: () => void) => {
    window.clearTimeout(relogios.current.get(id));
    relogios.current.set(id, window.setTimeout(feito, ms));
  };

  const mudar = (id: string, estado: Estado | undefined) =>
    definirEstados((atual) => {
      const novo = { ...atual };
      if (estado) novo[id] = estado;
      else delete novo[id];
      return novo;
    });

  const alternar = (id: string) => {
    const atual = estados[id];
    const instantaneo = semMovimento();

    if (!atual || atual === "fechando") {
      if (instantaneo || !comLinhas()) {
        mudar(id, "aberta");
        return;
      }
      mudar(id, "linha");
      depois(id, PROJETAR, () => mudar(id, "aberta"));
      return;
    }

    if (instantaneo) {
      mudar(id, undefined);
      return;
    }
    mudar(id, "fechando");
    depois(id, RECOLHER, () => mudar(id, undefined));
  };

  return (
    <div className="brasao-comentado" ref={caixa}>
      <div className="brasao-comentado__coluna">
        <div
          className={`brasao-comentado__escudo${revelado ? " brasao-comentado__escudo--revelado" : ""}`}
          onClick={() => definirRevelado((r) => !r)}
        >
          <img
            className="brasao-comentado__imagem"
            src="/brasao-9ea57f61.webp"
            alt="Brasão do Apostolado Nossa Senhora das Neves"
            width={572}
            height={620}
          />
          {partes.map((parte, i) => (
            <button
              type="button"
              key={parte.id}
              className="brasao-comentado__numero"
              style={{ left: `${parte.x}%`, top: `${parte.y}%` }}
              data-numero={parte.id}
              aria-expanded={Boolean(estados[parte.id]) && estados[parte.id] !== "fechando"}
              aria-controls={`brasao-${parte.id}`}
              aria-label={`${i + 1}: ${parte.rotulo}`}
              onClick={(evento) => {
                evento.stopPropagation();
                definirRevelado(true);
                alternar(parte.id);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {Object.keys(estados).length === 0 && (
          <p className="brasao-comentado__dica">
            Passe o cursor ou toque no brasão, e escolha um número.
          </p>
        )}
      </div>

      <ul className="brasao-comentado__partes">
        {partes.map((parte, i) => {
          const estado = estados[parte.id];
          return (
            <li
              key={parte.id}
              id={`brasao-${parte.id}`}
              className={`brasao-comentado__parte${estado ? ` brasao-comentado__parte--${estado}` : ""}`}
              hidden={!estado}
            >
              <p className="brasao-comentado__rotulo">
                <span className="brasao-comentado__marca" data-marca={parte.id} aria-hidden="true">
                  {i + 1}
                </span>
                {parte.rotulo}
              </p>
              {parte.paragrafos.map((p, j) => (
                <p className="brasao-comentado__texto" key={j}>
                  {interpretar(p, `brasao-${parte.id}-${j}`)}
                </p>
              ))}
            </li>
          );
        })}
      </ul>

      <svg className="brasao-comentado__linhas" aria-hidden="true">
        {partes.map((parte) => {
          const estado = estados[parte.id];
          if (!estado) return null;
          return (
            <line
              key={parte.id}
              pathLength={1}
              className={`brasao-comentado__linha brasao-comentado__linha--${estado}`}
              ref={(el) => {
                if (el) linhas.current.set(parte.id, el);
                else linhas.current.delete(parte.id);
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
