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

/**
 * As notas do documento, servidas de cima para quem as chama.
 *
 * O Perez pediu que a nota aparecesse ao passar o mouse, em vez de ficar
 * amontoada no fim do capítulo. Passar o mouse, porém, é gesto que não existe
 * em celular, e é no celular que este site é lido: por isso a chamada é um
 * botão de verdade, que abre no toque e no teclado além do ponteiro. O pedido
 * fica atendido no computador sem deixar o telefone de fora.
 *
 * Este arquivo não sabe interpretar marcação, de propósito: nota tem texto
 * rico e texto rico tem nota, e importar um do outro fecharia um ciclo. Quem
 * interpreta é o TextoRico, que entrega o corpo já pronto em `children`.
 */
const Contexto = createContext<Record<string, string>>({});

/**
 * As notas abertas acima desta, para uma não chamar a si mesma.
 *
 * Não é zelo teórico: a nota do asterisco vinha do documento começando pela
 * própria chamada, e a primeira montagem da página levou o V8 a estourar a
 * memória. Conteúdo vem de um painel de edição, então isto tem de degradar,
 * e não derrubar a aba de quem lê.
 */
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

/** Onde o balão cabe, medido a partir da chamada. */
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
  const [lugar, definirLugar] = useState<Lugar | null>(null);
  const id = useId();

  const fechar = useCallback(() => definirAberto(false), []);

  /*
   * Onde o balão cabe, medido a partir da chamada. Fica num callback porque
   * é usado ao abrir e de novo a cada rolagem.
   */
  const posicionar = useCallback(() => {
    const botao = marca.current;
    const caixa = balao.current;
    if (!botao || !caixa) return;

    const r = botao.getBoundingClientRect();
    // a chamada saiu da tela: aí sim a nota não tem mais a que se prender
    if (r.bottom < 0 || r.top > window.innerHeight) {
      fechar();
      return;
    }
    const largura = Math.min(LARGURA, window.innerWidth - MARGEM * 2);
    const alto = caixa.offsetHeight;
    // cabe embaixo? senão vai para cima: a nota nunca sai da tela
    const acima = r.bottom + alto + 10 > window.innerHeight && r.top > alto + 10;
    const meio = r.left + r.width / 2 - largura / 2;
    definirLugar({
      largura,
      esquerda: Math.max(MARGEM, Math.min(meio, window.innerWidth - largura - MARGEM)),
      topo: acima ? r.top - alto - 8 : r.bottom + 8,
      acima,
    });
  }, [fechar]);

  /*
   * A medição é de layout, não de efeito: entre pintar o balão no canto errado
   * e movê-lo depois de colocado há um quadro de diferença, e esse quadro
   * aparece como um salto.
   */
  useLayoutEffect(() => {
    if (aberto) posicionar();
  }, [aberto, posicionar]);

  useEffect(() => {
    if (!aberto) return;
    let pendente = 0;
    /*
     * Rolar acompanha, não fecha. Fechar na rolagem parecia certo até o teste
     * no celular: tocar numa chamada perto da borda faz o navegador rolar
     * para trazê-la à vista, e com a rolagem suave do site essa animação dura
     * mais do que qualquer carência razoável. A nota morria antes de aparecer.
     */
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
        className="nota-chamada__marca"
        aria-expanded={aberto}
        aria-describedby={aberto ? id : undefined}
        onClick={() => definirAberto((a) => !a)}
        onMouseEnter={() => definirAberto(true)}
        onMouseLeave={() => definirAberto(false)}
        onFocus={() => definirAberto(true)}
        onBlur={(e) => {
          if (!balao.current?.contains(e.relatedTarget as Node)) fechar();
        }}
      >
        <span className="visualmente-oculto">nota </span>
        {chave}
      </button>
      <span
        id={id}
        ref={balao}
        role="tooltip"
        hidden={!aberto}
        className={`nota-balao${lugar?.acima ? " nota-balao--acima" : ""}`}
        style={
          lugar
            ? { left: lugar.esquerda, top: lugar.topo, width: lugar.largura }
            : { left: -9999, top: 0, width: LARGURA }
        }
      >
        <span className="nota-balao__numero">
          {chave === "*" ? "Nota do apostolado" : `Nota ${chave}`}
        </span>
        <span className="nota-balao__texto">{children}</span>
      </span>
    </span>
    </Abertas.Provider>
  );
}
