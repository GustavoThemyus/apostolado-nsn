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
 * Dois modos. Passar o cursor abre uma prévia, que aguenta o caminho da
 * chamada até o balão; clicar ou tocar fixa o balão, que fica aberto até se
 * clicar fora, na chamada de novo, no × ou apertar Esc. Foi o que o Perez
 * pediu para poder copiar as referências: antes, o balão fechava quando o
 * cursor saía da chamada — isto é, a caminho dele —, e o clique, em vez de
 * fixar, fechava, porque o cursor já o tinha aberto e o clique alternava.
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
  const [fixado, definirFixado] = useState(false);
  const [copiado, definirCopiado] = useState(false);
  const [lugar, definirLugar] = useState<Lugar | null>(null);
  const id = useId();
  // espelho do estado para os ouvintes, que não re-leem o estado a cada render
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

  /*
   * A prévia fecha com atraso, e o atraso se cancela se o cursor entra no
   * balão. É a ponte que faltava: entre a chamada e o balão há 8px de nada, e
   * o cursor passava por eles.
   */
  const fecharLogo = () => {
    if (fixadoAgora.current) return;
    window.clearTimeout(relogio.current);
    relogio.current = window.setTimeout(fechar, 250);
  };
  const ficar = () => window.clearTimeout(relogio.current);

  useEffect(() => () => window.clearTimeout(relogio.current), []);

  /*
   * Copia o texto da nota, sem o rótulo e sem as chamadas aninhadas. No
   * celular, selecionar à mão dentro de um balão pequeno é o que o Perez
   * disse que atrapalhava; o botão resolve de uma vez.
   */
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
      /* sem área de transferência: o texto continua selecionável à mão */
    }
  };

  /*
   * Onde o balão cabe, medido a partir da chamada. Fica num callback porque
   * é usado ao abrir e de novo a cada rolagem.
   */
  const posicionar = useCallback(() => {
    const botao = marca.current;
    const caixa = balao.current;
    if (!botao || !caixa) return;

    const r = botao.getBoundingClientRect();
    const naTela = r.bottom >= 0 && r.top <= window.innerHeight;
    /*
     * A chamada saiu da tela: aí sim a nota não tem mais a que se prender.
     * *Saiu* — depois de ter estado nela. Ao abrir pelo teclado uma chamada
     * que está fora da tela, o navegador rola até ela com a rolagem suave do
     * site, e durante essa rolagem ela ainda não chegou: fechar ali matava a
     * nota no mesmo instante em que o foco a abria.
     */
    if (naTela) jaEsteveNaTela.current = true;
    else {
      if (jaEsteveNaTela.current) fechar();
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
        /*
         * O asterisco não é uma das 123 notas do livro: é a única observação
         * do Apostolado sobre um texto pontifício. Sobrescrito do tamanho das
         * outras, ele passava despercebido no meio do parágrafo.
         */
        className={`nota-chamada__marca${
          chave === "*" ? " nota-chamada__marca--asterisco" : ""
        }`}
        aria-expanded={aberto}
        aria-controls={id}
        aria-describedby={aberto ? id : undefined}
        // fixado, o segundo clique fecha; senão, o clique fixa o que o cursor abriu
        onClick={() => (fixadoAgora.current ? fechar() : fixar())}
        onMouseEnter={() => {
          ficar();
          definirAberto(true);
        }}
        onMouseLeave={fecharLogo}
        onFocus={() => definirAberto(true)}
        onBlur={(e) => {
          // fixado, o balão sobrevive ao foco sair: é assim que se seleciona
          // texto nele no celular, onde tocar no balão tira o foco da chamada
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
        // diálogo, e não dica: agora ele tem botões dentro
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
        // mexer dentro dele — selecionar, clicar num botão — fixa
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
