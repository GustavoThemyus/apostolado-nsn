import { site } from "../data/site";
import type { Agenda } from "../data/tipos";

/**
 * Quais agendas do Google o visitante vinculou ao calendário do site.
 *
 * Fica no aparelho dele, em `localStorage`, e não no servidor: é preferência
 * de quem lê, não dado do apostolado. Vincular não muda nada para os outros,
 * e desvincular devolve o calendário aos itens padrão na mesma hora.
 */

const CHAVE = "nsn:agendas-vinculadas";

export interface ItemDeAgenda {
  data: string;
  titulo: string;
  descricao?: string;
}

export interface AgendaBuscada {
  id: string;
  nome: string;
  grupo: Agenda["grupo"];
  itens: ItemDeAgenda[];
  /** O calendário está público, mas escondendo os títulos. */
  semDetalhes: boolean;
}

const ouvintes = new Set<() => void>();
let vinculadas: string[] | null = null;

function ler(): string[] {
  if (vinculadas) return vinculadas;
  try {
    const cru = window.localStorage.getItem(CHAVE);
    const lista = cru ? (JSON.parse(cru) as unknown) : [];
    // só ids que ainda existem: agenda removida do site.json não pode
    // ressuscitar por causa de um localStorage antigo
    vinculadas = Array.isArray(lista)
      ? lista.filter((id): id is string => typeof id === "string" && !!agendaPorId(id))
      : [];
  } catch {
    vinculadas = [];
  }
  return vinculadas;
}

function gravar(lista: string[]) {
  vinculadas = lista;
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* modo privado, ou armazenamento cheio: o vínculo vale só nesta visita */
  }
  for (const avisar of ouvintes) avisar();
}

export const agendaPorId = (id: string): Agenda | undefined =>
  site.agendas.find((a) => a.id === id);

/** As agendas que podem ser vinculadas: as que têm calendário preenchido. */
export const agendasDisponiveis = (grupo?: Agenda["grupo"]): Agenda[] =>
  site.agendas.filter((a) => a.google && (!grupo || a.grupo === grupo));

export const estaVinculada = (id: string): boolean => ler().includes(id);

export function vincular(id: string) {
  if (!agendaPorId(id) || estaVinculada(id)) return;
  gravar([...ler(), id]);
}

export function desvincular(id: string) {
  gravar(ler().filter((outro) => outro !== id));
}

export function assinar(avisar: () => void): () => void {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

/** Para o useSyncExternalStore: a mesma referência enquanto nada muda. */
export const lerVinculadas = (): string[] => ler();

// -------------------------------------------------------------- busca

const cache = new Map<string, Promise<AgendaBuscada>>();

/**
 * Busca uma agenda pela ponte do Worker.
 *
 * O cache é por sessão e guarda a *promessa*, não o resultado: duas partes da
 * página pedindo a mesma agenda ao mesmo tempo fazem uma requisição só.
 */
export function buscarAgenda(id: string): Promise<AgendaBuscada> {
  const guardada = cache.get(id);
  if (guardada) return guardada;

  const pedido = fetch(`/api/agenda?id=${encodeURIComponent(id)}`)
    .then(async (r) => {
      if (!r.ok) throw new Error(`agenda ${id}: ${r.status}`);
      return (await r.json()) as AgendaBuscada;
    })
    .catch((erro) => {
      // não guardar a falha: a próxima visita à página tenta de novo
      cache.delete(id);
      throw erro;
    });

  cache.set(id, pedido);
  return pedido;
}
