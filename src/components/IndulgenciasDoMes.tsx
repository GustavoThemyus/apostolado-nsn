import { useMemo, useState } from "react";
import { ARQUIDIOCESE, agendasLembradas } from "../data/agendasLigadas";
import { diasDaArquidiocese } from "../data/arquidioceseDias";
import { usarAgendas } from "../hooks/usarAgendas";
import { indulgenciasDoMes, type Ocorrencia } from "../calendario/indulgencias";
import { indulgencias } from "../data/indulgenciasDias";
import { Elo } from "../routes/Elo";
import { porExtensoCurto } from "./DiaDeHoje";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

interface Faixa {
  de: string;
  ate: string;
  titulos: string[];
}

const diaSeguinte = (iso: string): string => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

function emFaixas(porDia: Map<string, string[]>): Faixa[] {
  const faixas: Faixa[] = [];

  for (const data of [...porDia.keys()].sort()) {
    const titulos = [...new Set(porDia.get(data) ?? [])];
    const ultima = faixas[faixas.length - 1];
    if (
      ultima &&
      diaSeguinte(ultima.ate) === data &&
      ultima.titulos.join("\u0000") === titulos.join("\u0000")
    ) {
      ultima.ate = data;
    } else {
      faixas.push({ de: data, ate: data, titulos });
    }
  }

  return faixas;
}

function quando(faixa: Faixa): string {
  if (faixa.de === faixa.ate) return porExtensoCurto(faixa.de);
  return `${Number(faixa.de.slice(8))} a ${porExtensoCurto(faixa.ate)}`;
}

export function IndulgenciasDoMes({ data }: { data?: Date }) {
  const hoje = useMemo(() => {
    if (data) return data;
    const agora = new Date();
    return new Date(
      Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate()),
    );
  }, [data]);

  const mes = hoje.getUTCMonth() + 1;
  const ano = hoje.getUTCFullYear();
  const [ligadas] = useState(agendasLembradas);
  const vinculadas = usarAgendas(
    useMemo(() => ligadas.filter((id) => id !== ARQUIDIOCESE), [ligadas]),
    ano,
  );

  const faixas = useMemo(() => {
    const porDia = new Map<string, string[]>();
    const por = (data: string, titulo: string) =>
      porDia.set(data, [...(porDia.get(data) ?? []), titulo]);
    const somar = (lista: Map<string, Ocorrencia[]>, sufixo = "") =>
      lista.forEach((os, data) => os.forEach((o) => por(data, o.entrada.titulo + sufixo)));

    somar(indulgenciasDoMes(indulgencias.dias, ano, mes));
    if (ligadas.includes(ARQUIDIOCESE)) {
      somar(indulgenciasDoMes(diasDaArquidiocese, ano, mes) as unknown as Map<string, Ocorrencia[]>, " (Arquidiocese)");
    }
    const doMes = `${ano}-${String(mes).padStart(2, "0")}-`;
    vinculadas.porDia.forEach((itens, data) => {
      if (!data.startsWith(doMes)) return;
      itens.forEach((i) => por(data, `${i.festa ?? i.titulo} (${i.nome})`));
    });
    return emFaixas(porDia);
  }, [ano, mes, ligadas, vinculadas.porDia]);

  if (faixas.length === 0) return null;

  return (
    <aside className="indulgencias-mes" aria-labelledby="indulgencias-mes-titulo">
      <h2 className="indulgencias-mes__titulo" id="indulgencias-mes-titulo">
        Indulgências de {MESES[mes - 1]}
      </h2>
      <ul className="indulgencias-mes__lista">
        {faixas.map((faixa) => (
          <li key={faixa.de}>
            <Elo para={`/indulgencias?dia=${faixa.de}`} className="indulgencias-mes__item">
              <span className="indulgencias-mes__data">{quando(faixa)}</span>
              <span className="indulgencias-mes__nome">
                {faixa.titulos.join("; ")}
              </span>
            </Elo>
          </li>
        ))}
      </ul>
      <Elo para="/indulgencias" className="dia__link">
        Ver no calendário das indulgências
      </Elo>
    </aside>
  );
}
