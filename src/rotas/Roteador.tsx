import {
  Suspense,
  createContext,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { resolver, type Parametros } from "./casar";
import { ROTAS, type Rota } from "./rotas";

export interface EstadoDaRota {
  caminho: string;
  busca: URLSearchParams;
  rota: Rota | null;
  parametros: Parametros;
  navegar: (para: string, opcoes?: { substituir?: boolean }) => void;
}

export const ContextoDeRota = createContext<EstadoDaRota | null>(null);

/** Guarda a rolagem por entrada do histórico, para o voltar cair no lugar. */
const rolagens = new Map<number, number>();
let proximaChave = 0;

function chaveAtual(): number {
  const estado = window.history.state as { chave?: number } | null;
  if (estado && typeof estado.chave === "number") return estado.chave;
  proximaChave += 1;
  window.history.replaceState({ chave: proximaChave }, "");
  return proximaChave;
}

/**
 * Decide se um clique num link deve ser tratado aqui ou entregue ao navegador.
 *
 * Fica de fora tudo o que o leitor espera que se comporte como link normal:
 * abrir em outra aba, baixar, ir para outro site. E as âncoras `#`, que o
 * Sumário usa e que dependem do scroll-behavior do CSS.
 */
function ehNavegacaoInterna(evento: MouseEvent): string | null {
  if (evento.defaultPrevented || evento.button !== 0) return null;
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return null;

  const alvo = (evento.target as Element | null)?.closest("a");
  if (!alvo) return null;
  if (alvo.hasAttribute("download") || alvo.hasAttribute("target")) return null;
  if (alvo.getAttribute("rel")?.includes("external")) return null;

  const href = alvo.getAttribute("href");
  if (!href || href.startsWith("#")) return null;

  const url = new URL(alvo.href, window.location.href);
  if (url.origin !== window.location.origin) return null;

  return url.pathname + url.search + url.hash;
}

export function Roteador({ children }: { children: (conteudo: ReactNode) => ReactNode }) {
  const [endereco, definirEndereco] = useState(
    () => window.location.pathname + window.location.search + window.location.hash
  );

  const navegar = useCallback((para: string, opcoes?: { substituir?: boolean }) => {
    const atual = window.location.pathname + window.location.search + window.location.hash;
    if (para === atual) return;

    rolagens.set(chaveAtual(), window.scrollY);
    proximaChave += 1;
    const metodo = opcoes?.substituir ? "replaceState" : "pushState";
    window.history[metodo]({ chave: proximaChave }, "", para);
    definirEndereco(para);
  }, []);

  // voltar e avançar do navegador
  useEffect(() => {
    const aoVoltar = () => {
      definirEndereco(window.location.pathname + window.location.search + window.location.hash);
    };
    window.addEventListener("popstate", aoVoltar);
    return () => window.removeEventListener("popstate", aoVoltar);
  }, []);

  // um só ouvinte para todos os links da página
  useEffect(() => {
    const aoClicar = (evento: MouseEvent) => {
      const destino = ehNavegacaoInterna(evento);
      if (!destino) return;
      evento.preventDefault();
      navegar(destino);
    };
    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, [navegar]);

  const [caminho, buscaCrua] = useMemo(() => {
    const url = new URL(endereco, window.location.origin);
    return [url.pathname, url.search] as const;
  }, [endereco]);

  const busca = useMemo(() => new URLSearchParams(buscaCrua), [buscaCrua]);
  const casamento = useMemo(() => resolver(ROTAS, caminho), [caminho]);

  const valor = useMemo<EstadoDaRota>(
    () => ({
      caminho,
      busca,
      rota: casamento?.rota ?? null,
      parametros: casamento?.parametros ?? {},
      navegar,
    }),
    [caminho, busca, casamento, navegar]
  );

  const Pagina = useMemo(
    () => (casamento ? lazy(casamento.rota.pagina) : NaoEncontrada),
    [casamento]
  );

  return (
    <ContextoDeRota.Provider value={valor}>
      {children(
        <Suspense fallback={<div className="carregando" aria-hidden="true" />}>
          <AoTrocarDePagina caminho={caminho} titulo={casamento?.rota.titulo}>
            <Pagina />
          </AoTrocarDePagina>
        </Suspense>
      )}
    </ContextoDeRota.Provider>
  );
}

/**
 * Roda quando a página nova de fato aparece, não quando o pedaço começa a
 * carregar: ajusta o título, leva a rolagem e move o foco para o cabeçalho.
 *
 * O foco é o que faz a navegação funcionar em leitor de tela. Router de
 * cliente que não mexe no foco deixa o leitor preso no fim da página anterior.
 */
function AoTrocarDePagina({
  caminho,
  titulo,
  children,
}: {
  caminho: string;
  titulo?: string;
  children: ReactNode;
}) {
  const primeira = useRef(true);

  useEffect(() => {
    document.title = titulo
      ? `${titulo} | Apostolado Nossa Senhora das Neves`
      : "Apostolado Nossa Senhora das Neves";

    if (primeira.current) {
      primeira.current = false;
      return;
    }

    const hash = window.location.hash;
    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
    } else {
      const guardada = rolagens.get(chaveAtual());
      window.scrollTo(0, guardada ?? 0);
    }

    const cabecalho = document.querySelector<HTMLElement>("main h1, main h2");
    if (cabecalho) {
      cabecalho.setAttribute("tabindex", "-1");
      cabecalho.focus({ preventScroll: true });
    }
  }, [caminho, titulo]);

  return (
    <>
      <p className="apenas-leitores" aria-live="polite">
        {titulo ?? "Página não encontrada"}
      </p>
      {children}
    </>
  );
}

const NaoEncontrada: ComponentType = lazy(() => import("../paginas/NaoEncontrada"));
