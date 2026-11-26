import { useEffect, useState } from "react";
import { carregarOrdo, mesDoOrdo, temOrdo, type DiaDoOrdo } from "../calendar/ordo";

export interface EstadoDoOrdo {
  dias: DiaDoOrdo[];
  carregando: boolean;
  semOrdo: boolean;
}

export function usarOrdo(ano: number, mes: number, ligado: boolean): EstadoDoOrdo {
  const [dias, definirDias] = useState<DiaDoOrdo[]>([]);
  const [carregando, definirCarregando] = useState(false);

  useEffect(() => {
    if (!ligado || !temOrdo(ano, mes)) {
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

  return { dias, carregando, semOrdo: ligado && !temOrdo(ano, mes) };
}
