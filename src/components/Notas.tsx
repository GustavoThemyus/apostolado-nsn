import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const Contexto = createContext<Record<string, string>>({});

const Abertas = createContext<readonly string[]>([]);

export const usarNotaEmCurso = (chave: string): boolean =>
  useContext(Abertas).includes(chave);

export function ProvedorDeNotas({
  notas,
  children,
}: {
  notas?: Record<string, string>;
  children: ReactNode;
}) {
  return <Contexto.Provider value={notas ?? {}}>{children}</Contexto.Provider>;
}

export const usarNota = (chave: string): string | undefined => useContext(Contexto)[chave];

interface Lugar {
  esquerda: number;
  topo: number;
  largura: number;
  acima: boolean;
}

const MARGEM = 12;
const LARGURA = 340;

export function BalaoDeNota({ chave, children }: { chave: string; children: ReactNode }) {
  const acima = useContext(Abertas);
  const marca = useRef<HTMLButtonElement | null>(null);
  const balao = useRef<HTMLSpanElement | null>(null);
  const [aberto, definirAberto] = useState(false);
  const [fixado, definirFixado] = useState(false);
  const [copiado, definirCopiado] = useState(false);
  const [lugar, definirLugar] = useState<Lugar | null>(null);
  const id = useId();
  const fixadoAgora = useRef(false);
  fixadoAgora.current = fixado;
  const relogio = useRef(0);
  const jaEsteveNaTela = useRef(false);

  const fechar = useCallback(() => {
    window.clearTimeout(relogio.current);
    jaEsteveNaTela.current = false;
    definirAberto(false);
    definirFixado(false);
    definirCopiado(false);
  }, []);

  const fixar = () => {
    window.clearTimeout(relogio.current);
    definirAberto(true);
    definirFixado(true);
  };

  const fecharLogo = () => {
    if (fixadoAgora.current) return;
    window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(fechar, 250);
  };
  const ficar = () => window.clearTimeout(relogio.current);

  useEffect(() => () => window.clearTimeout(relogio.current), []);

  const copiar = async () => {
    const corpo = balao.current?.querySelector(".nota-balao__texto");
    if (!corpo) return;
    const copia = corpo.cloneNode(true) as HTMLElement;
    copia.querySelectorAll(".visualmente-oculto, .nota-balao").forEach((el) => el.remove());
    copia.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    try {
      await navigator.clipboard.writeText(copia.textContent?.trim() ?? "");
      definirCopiado(true);
    } catch {
    }
  };

  const posicionar = useCallback(() => {
    const botao = marca.current;
    const caixa = balao.current;
    if (!botao || !caixa) return;

    const r = botao.getBoundingClientRect();
    const naTela = r.bottom >= 0 && r.top <= window.innerHeight;
    if (naTela) jaEsteveNaTela.current = true;
    else {
      if (jaEsteveNaTela.current) fechar();
      return;
    }
    const largura = Math.min(LARGURA, window.innerWidth - MARGEM * 2);
    const alto = caixa.offsetHeight;
    const acima = r.bottom + alto + 10 > window.innerHeight && r.top > alto + 10;
    const meio = r.left + r.width / 2 - largura / 2;
    definirLugar({
      largura,
      esquerda: Math.max(MARGEM, Math.min(meio, window.innerWidth - largura - MARGEM)),
      topo: acima ? r.top - alto - 8 : r.bottom + 8,
      acima,
    });
  }, [fechar]);

  useLayoutEffect(() => {
    if (aberto) posicionar();
  }, [aberto, posicionar]);

  useEffect(() => {
    if (!aberto) return;
    let pendente = 0;
    const aoRolar = () => {
      if (pendente === 0) {
        pendente = window.requestAnimationFrame(() => {
          pendente = 0;
          posicionar();
        });
      }
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        fechar();
        marca.current?.focus();
      }
    };
    const foraDaqui = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!marca.current?.contains(alvo) && !balao.current?.contains(alvo)) fechar();
    };
    window.addEventListener("keydown", aoTeclar);
    window.addEventListener("pointerdown", foraDaqui);
    window.addEventListener("scroll", aoRolar, { passive: true, capture: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      if (pendente) window.cancelAnimationFrame(pendente);
      window.removeEventListener("keydown", aoTeclar);
      window.removeEventListener("pointerdown", foraDaqui);
      window.removeEventListener("scroll", aoRolar, { capture: true });
      window.removeEventListener("resize", aoRolar);
    };
  }, [aberto, fechar, posicionar]);

  return (
    <Abertas.Provider value={[...acima, chave]}>
    <span className="nota-chamada">
      <button
        type="button"
        ref={marca}
        className={`nota-chamada__marca${
          chave === "*" ? " nota-chamada__marca--asterisco" : ""
        }`}
        aria-expanded={aberto}
        aria-controls={id}
        aria-describedby={aberto ? id : undefined}
        onClick={() => (fixadoAgora.current ? fechar() : fixar())}
        onMouseEnter={() => {
          ficar();
          definirAberto(true);
        }}
        onMouseLeave={fecharLogo}
        onFocus={() => definirAberto(true)}
        onBlur={(e) => {
          if (fixadoAgora.current) return;
          if (!balao.current?.contains(e.relatedTarget as Node)) fechar();
        }}
      >
        <span className="visualmente-oculto">nota </span>
        {chave}
      </button>
      <span
        id={id}
        ref={balao}
        role="dialog"
        aria-label={chave === "*" ? "Nota do apostolado" : `Nota ${chave}`}
        hidden={!aberto}
        className={`nota-balao${lugar?.acima ? " nota-balao--acima" : ""}${
          fixado ? " nota-balao--fixado" : ""
        }`}
        style={
          lugar
            ? { left: lugar.esquerda, top: lugar.topo, width: lugar.largura }
            : { left: -9999, top: 0, width: LARGURA }
        }
        onMouseEnter={ficar}
        onMouseLeave={fecharLogo}
        onPointerDown={() => {
          if (!fixadoAgora.current) fixar();
        }}
        onBlur={(e) => {
          if (fixadoAgora.current) return;
          const para = e.relatedTarget as Node | null;
          if (!marca.current?.contains(para) && !balao.current?.contains(para)) fechar();
        }}
      >
        <span className="nota-balao__cabeca">
          <span className="nota-balao__numero">
            {chave === "*" ? "Nota do apostolado" : `Nota ${chave}`}
          </span>
          <button type="button" className="nota-balao__acao" onClick={copiar}>
            {copiado ? "Copiado" : "Copiar"}
          </button>
          <button
            type="button"
            className="nota-balao__acao nota-balao__fechar"
            aria-label="Fechar a nota"
            onClick={() => {
              fechar();
              marca.current?.focus();
            }}
          >
            ×
          </button>
        </span>
        <span className="nota-balao__texto">{children}</span>
      </span>
    </span>
    </Abertas.Provider>
  );
}
