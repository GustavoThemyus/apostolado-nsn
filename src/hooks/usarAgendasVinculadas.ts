import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  assinar,
  buscarAgenda,
  lerVinculadas,
  type AgendaBuscada,
  type ItemDeAgenda,
} from "../agenda/vinculo";

export interface ItemVinculado extends ItemDeAgenda {
  /** De qual agenda veio, para a bandeira e o filtro. */
  agenda: string;
  nomeDaAgenda: string;
}

export interface EstadoDasAgendas {
  /** Ids vinculados, na ordem em que foram vinculados. */
  vinculadas: string[];
  /** Itens por dia, chaveados por AAAA-MM-DD. */
  porDia: Map<string, ItemVinculado[]>;
  carregando: boolean;
  /** Agendas que responderam sem títulos de evento. */
  semDetalhes: AgendaBuscada[];
  /** Agendas que não puderam ser lidas. */
  falharam: string[];
}

const VAZIO: string[] = [];

/**
 * O estado das agendas que o visitante vinculou.
 *
 * `useSyncExternalStore` porque a lista vive fora do React (localStorage) e é
 * mexida por botões espalhados pela página: o calendário e o bloco de
 * vinculação precisam ver a mesma coisa no mesmo quadro.
 */
export function usarAgendasVinculadas(): EstadoDasAgendas {
  const vinculadas = useSyncExternalStore(assinar, lerVinculadas, () => VAZIO);
  const [buscadas, definirBuscadas] = useState<Map<string, AgendaBuscada>>(new Map());
  const [falharam, definirFalharam] = useState<string[]>([]);

  const chave = vinculadas.join(",");

  useEffect(() => {
    if (vinculadas.length === 0) {
      definirFalharam([]);
      return;
    }
    let vivo = true;

    Promise.allSettled(vinculadas.map(buscarAgenda)).then((resultados) => {
      if (!vivo) return;
      const mapa = new Map<string, AgendaBuscada>();
      const ruins: string[] = [];
      resultados.forEach((r, i) => {
        if (r.status === "fulfilled") mapa.set(r.value.id, r.value);
        else ruins.push(vinculadas[i]);
      });
      definirBuscadas(mapa);
      definirFalharam(ruins);
    });

    return () => {
      vivo = false;
    };
    // a lista é recriada a cada leitura; a chave é o que de fato muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  const porDia = useMemo(() => {
    const mapa = new Map<string, ItemVinculado[]>();
    for (const id of vinculadas) {
      const agenda = buscadas.get(id);
      if (!agenda || agenda.semDetalhes) continue;
      for (const item of agenda.itens) {
        const lista = mapa.get(item.data) ?? [];
        lista.push({ ...item, agenda: agenda.id, nomeDaAgenda: agenda.nome });
        mapa.set(item.data, lista);
      }
    }
    return mapa;
  }, [buscadas, chave]);

  const semDetalhes = useMemo(
    () => vinculadas.map((id) => buscadas.get(id)).filter((a): a is AgendaBuscada => !!a?.semDetalhes),
    [buscadas, chave]
  );

  return {
    vinculadas,
    porDia,
    carregando: vinculadas.length > 0 && buscadas.size === 0 && falharam.length === 0,
    semDetalhes,
    falharam,
  };
}

/** "2026-08-05" a partir de uma data em UTC, que é como o calendário guarda. */
export function chaveDoDia(data: Date): string {
  const m = String(data.getUTCMonth() + 1).padStart(2, "0");
  const d = String(data.getUTCDate()).padStart(2, "0");
  return `${data.getUTCFullYear()}-${m}-${d}`;
}
