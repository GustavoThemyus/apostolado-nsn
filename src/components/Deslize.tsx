import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Painéis lado a lado, que se passam com o dedo ou pelos botões do alto.
 *
 * É o gesto das últimas publicações, pedido pelo Perez para a Missa do
 * Calendário Universal. A rolagem é do navegador (`scroll-snap`): o dedo
 * funciona sem script, e os botões só rolam até o painel e dizem onde se está.
 * No canto direito um aviso diz que há mais para o lado.
 *
 * O trilho tem a altura do painel à vista. Sem isso valia a do mais alto, e o
 * outro terminava num vazio.
 */
export function Deslize({ paineis }: { paineis: { rotulo: string; corpo: ReactNode }[] }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, definirAtual] = useState(0);

  const [altura, definirAltura] = useState<number>();

  useEffect(() => {
    const painel = trilho.current?.children[atual] as HTMLElement | undefined;
    if (!painel) return;
    /* muda também quando se abre uma Missa recolhida dentro dele */
    const observador = new ResizeObserver(() => definirAltura(painel.offsetHeight));
    observador.observe(painel);
    return () => observador.disconnect();
  }, [atual]);

  const ir = (i: number) => {
    const t = trilho.current;
    if (t) t.scrollTo({ left: i * t.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="deslize">
      <div className="deslize__abas" role="group" aria-label="Qual Missa mostrar">
        {paineis.map((p, i) => (
          <button
            type="button"
            key={p.rotulo}
            className="deslize__aba"
            aria-pressed={atual === i}
            onClick={() => ir(i)}
          >
            {p.rotulo}
          </button>
        ))}
        {atual < paineis.length - 1 && (
          <button
            type="button"
            className="deslize__adiante"
            aria-label={`Passar para ${paineis[atual + 1].rotulo}`}
            onClick={() => ir(atual + 1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <div
        className="deslize__trilho"
        ref={trilho}
        style={{ height: altura }}
        onScroll={(e) => {
          const t = e.currentTarget;
          definirAtual(Math.round(t.scrollLeft / Math.max(t.clientWidth, 1)));
        }}
      >
        {paineis.map((p) => (
          <div className="deslize__painel" key={p.rotulo}>
            {p.corpo}
          </div>
        ))}
      </div>
    </div>
  );
}
