import { useEffect, useState } from "react";
import { carregarOrdo, mesDoOrdo, temOrdo, type DiaDoOrdo } from "../calendario/ordo";

export interface EstadoDoOrdo {
  dias: DiaDoOrdo[];
  carregando: boolean;
  /** A capela não publicou Ordo para este ano. Não é falha: é ausência. */
  semOrdo: boolean;
}

/**
 * Os dias do Ordo de um mês. Busca o arquivo do ano na primeira vez e o
 * guarda; trocar de mês dentro do mesmo ano não baixa nada de novo.
 */
export function usarOrdo(ano: number, mes: number, ligado: boolean): EstadoDoOrdo {
  const [dias, definirDias] = useState<DiaDoOrdo[]>([]);
  const [carregando, definirCarregando] = useState(false);

  useEffect(() => {
    if (!ligado || !temOrdo(ano)) {
      definirDias([]);
      return;
    }
    let vivo = true;
    definirCarregando(true);
    carregarOrdo(ano).then((arquivo) => {
      if (!vivo) return;
      definirDias(arquivo ? mesDoOrdo(arquivo, ano, mes) : []);
      definirCarregando(false);
    });
    return () => {
      vivo = false;
    };
  }, [ano, mes, ligado]);

  return { dias, carregando, semOrdo: ligado && !temOrdo(ano) };
}
