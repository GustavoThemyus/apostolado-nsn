import { useContext } from "react";
import { ContextoDeRota, type EstadoDaRota } from "./Roteador";

export function usarRota(): EstadoDaRota {
  const valor = useContext(ContextoDeRota);
  if (!valor) throw new Error("usarRota fora do Roteador");
  return valor;
}

/** Os parâmetros capturados pelo padrão da rota, como `:id`. */
export function usarParametros(): Record<string, string> {
  return usarRota().parametros;
}
