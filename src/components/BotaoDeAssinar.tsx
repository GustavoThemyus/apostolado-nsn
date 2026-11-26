import { useEffect, useRef, useState } from "react";
import { site } from "../data/site";
import { Linha } from "./AssinarAgenda";

export function BotaoDeAssinar() {
  const [aberto, definirAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const agendas = site.agendas.filter((a) => a.grupo === "ordo" && a.google);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixa.current?.contains(e.target as Node)) definirAberto(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && definirAberto(false);
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  if (agendas.length === 0) return null;

  return (
    <div className="assinar" ref={caixa}>
      {aberto && (
        <ul className="assinar__opcoes" id="assinar-opcoes">
          {agendas.map((a) => (
            <Linha key={a.id} agenda={a} />
          ))}
        </ul>
      )}
      <button
        type="button"
        className="assinar__mais"
        aria-expanded={aberto}
        aria-controls="assinar-opcoes"
        aria-label="Levar o calendário no celular"
        title="Levar o calendário no celular"
        onClick={() => definirAberto((a) => !a)}
      >
        +
      </button>
    </div>
  );
}
