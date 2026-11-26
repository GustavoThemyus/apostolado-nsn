import { useEffect, useState } from "react";
import { dataDaFestaMovel } from "../calendario/moveis";
import type { ItemDeAgenda } from "../data/tipos";

export interface ItemVinculado extends ItemDeAgenda {
  agenda: string;
  nome: string;
}

export interface EstadoDasAgendas {
  porDia: Map<string, ItemVinculado[]>;
  carregando: boolean;
  falharam: string[];
  semDetalhes: string[];
}

interface Resposta {
  id: string;
  nome: string;
  itens: ItemDeAgenda[];
  semDetalhes?: boolean;
}

const cache = new Map<string, Promise<Resposta | null>>();

function buscar(id: string): Promise<Resposta | null> {
  const guardado = cache.get(id);
  if (guardado) return guardado;

  const pedido = fetch(`/api/agenda?id=${encodeURIComponent(id)}`)
    .then((r) => (r.ok ? (r.json() as Promise<Resposta>) : null))
    .catch(() => null);

  cache.set(id, pedido);
  return pedido;
}

const comoIso = (d: Date) => d.toISOString().slice(0, 10);

export function usarAgendas(ligadas: string[], ano: number): EstadoDasAgendas {
  const [estado, definirEstado] = useState<EstadoDasAgendas>({
    porDia: new Map(),
    carregando: false,
    falharam: [],
    semDetalhes: [],
  });

  const chave = [...ligadas].sort().join(",");

  useEffect(() => {
    const ids = chave ? chave.split(",") : [];
    if (ids.length === 0) {
      definirEstado({ porDia: new Map(), carregando: false, falharam: [], semDetalhes: [] });
      return;
    }

    let vivo = true;
    definirEstado((e) => ({ ...e, carregando: true }));

    Promise.all(ids.map(buscar)).then((respostas) => {
      if (!vivo) return;

      const porDia = new Map<string, ItemVinculado[]>();
      const falharam: string[] = [];
      const semDetalhes: string[] = [];
      const moveisJaPostas = new Set<string>();

      respostas.forEach((r, i) => {
        if (!r) {
          falharam.push(ids[i]);
          return;
        }
        if (r.semDetalhes) {
          semDetalhes.push(r.id);
          return;
        }
        for (const item of r.itens) {
          const anuncio = item.festa ?? item.titulo;
          const movel = dataDaFestaMovel(anuncio, ano);
          if (movel) {
            const chaveDaFesta = `${r.id}|${anuncio.trim()}`;
            if (moveisJaPostas.has(chaveDaFesta)) continue;
            moveisJaPostas.add(chaveDaFesta);
          }
          const data = movel ? comoIso(movel) : item.data;
          const lista = porDia.get(data) ?? [];
          lista.push({ ...item, data, agenda: r.id, nome: r.nome });
          porDia.set(data, lista);
        }
      });

      definirEstado({ porDia, carregando: false, falharam, semDetalhes });
    });

    return () => {
      vivo = false;
    };
  }, [chave, ano]);

  return estado;
}
