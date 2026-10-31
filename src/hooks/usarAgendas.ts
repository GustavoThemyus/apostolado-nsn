import { useEffect, useState } from "react";
import { dataDaFestaMovel } from "../calendario/moveis";
import type { ItemDeAgenda } from "../data/tipos";

/**
 * Os calendários vinculados que o leitor mandou mostrar.
 *
 * O Apostolado mantém, além das indulgências que este site calcula, um
 * punhado de calendários no Google: o dele próprio e os das confrarias e
 * ordens terceiras. Até agora eles eram só botão de assinar, e quem quisesse
 * ver tudo junto tinha de vincular cada um no aparelho.
 *
 * Busca pelo `/api/agenda` do nosso Worker, e não direto do Google, por dois
 * motivos que moram lá: o Google não manda `Access-Control-Allow-Origin`, e o
 * cliente manda um id da nossa lista, nunca um endereço.
 *
 * O que vem de fora é de fora: um calendário pode estar despublicado, ou
 * partilhado sem detalhes, e nesse caso a tela diz o que houve em vez de
 * ficar vazia fingindo que não há dias.
 */

export interface ItemVinculado extends ItemDeAgenda {
  /** O id da agenda, para a cor e para o filtro. */
  agenda: string;
  /** "Confraria do Escapulário do Carmo". */
  nome: string;
}

export interface EstadoDasAgendas {
  /** AAAA-MM-DD para os itens daquele dia, de todas as agendas ligadas. */
  porDia: Map<string, ItemVinculado[]>;
  carregando: boolean;
  /** Ids que o Worker não conseguiu buscar. */
  falharam: string[];
  /** Ids partilhados sem detalhes: o Google devolve "Busy" em todo evento. */
  semDetalhes: string[];
}

interface Resposta {
  id: string;
  nome: string;
  itens: ItemDeAgenda[];
  semDetalhes?: boolean;
}

/*
 * Uma agenda buscada não se busca de novo.
 *
 * O Worker devolve a lista inteira, de uns anos para trás e para a frente, e
 * não o mês pedido. Então andar de mês não custa rede nenhuma, e o cache de
 * módulo sobrevive à troca de página dentro da mesma visita.
 */
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

/**
 * `ano` é o ano que a grade está mostrando, e serve às festas móveis.
 *
 * Elas não vêm do Google com data em que se possa confiar — ver `moveis.ts` —,
 * e por isso se calculam. Calculam-se para o ano pedido, e não para uma janela
 * de anos: a grade mostra um mês de cada vez, e um mês tem um ano só. Assim
 * não há janela que estourar nem segunda régua que divirja da do Worker.
 */
export function usarAgendas(ligadas: string[], ano: number): EstadoDasAgendas {
  const [estado, definirEstado] = useState<EstadoDasAgendas>({
    porDia: new Map(),
    carregando: false,
    falharam: [],
    semDetalhes: [],
  });

  /*
   * A chave é a lista ordenada, e não o array: em React o array é novo a cada
   * render, e depender dele refaria o efeito sem parar.
   */
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
      /*
       * A mesma festa móvel digitada em quatro anos vira quatro eventos com a
       * mesma data calculada. Entra uma vez: a chave é a agenda e a festa, que
       * é o que distingue um evento de verdade do mesmo evento repetido.
       */
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
