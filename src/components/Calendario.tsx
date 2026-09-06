import { useEffect, useMemo, useState } from "react";
import { mesLiturgico } from "../calendario/precedencia";
import { porExtensoCurto } from "./DiaDeHoje";
import { NOME_DO_TEMPO } from "../calendario/tipos";
import type { DiaLiturgico } from "../calendario/tipos";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const NOME_DA_COR: Record<string, string> = {
  branco: "Branco", vermelho: "Vermelho", verde: "Verde",
  roxo: "Roxo", preto: "Preto", rosa: "Rosa",
};

const mesmoDia = (a: Date, b: Date) =>
  a.getUTCFullYear() === b.getUTCFullYear() &&
  a.getUTCMonth() === b.getUTCMonth() &&
  a.getUTCDate() === b.getUTCDate();

function Detalhe({ dia }: { dia: DiaLiturgico }) {
  return (
    <div className="calendario__detalhe">
      <p className="calendario__detalhe-data">
        {dia.data.getUTCDate()} de {MESES[dia.data.getUTCMonth()]} de {dia.data.getUTCFullYear()}
      </p>
      <p className="calendario__detalhe-nome">{dia.nome}</p>
      <dl className="dia__detalhes">
        <div>
          <dt>Tempo</dt>
          <dd>{NOME_DO_TEMPO[dia.tempo]}</dd>
        </div>
        <div>
          <dt>Cor</dt>
          <dd>
            <span className={`dia__amostra dia__amostra--${dia.cor}`} aria-hidden="true" />
            <span className={`cor cor--${dia.cor}`}>{NOME_DA_COR[dia.cor]}</span>
          </dd>
        </div>
        <div>
          <dt>Classe</dt>
          <dd>{dia.classe}ª</dd>
        </div>
      </dl>
      {dia.transferidaDe && (
        <p className="dia__transferida">
          Transferida de {porExtensoCurto(dia.transferidaDe)}, por impedimento.
        </p>
      )}
      {dia.comemoracoes.length > 0 && (
        <p className="dia__comemoracoes">
          <span>Comemoração: </span>
          {dia.comemoracoes.join("; ")}
        </p>
      )}
    </div>
  );
}

export function Calendario({ aoFechar }: { aoFechar: () => void }) {
  const hoje = useMemo(() => {
    const a = new Date();
    return new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
  }, []);
  const [ano, definirAno] = useState(hoje.getUTCFullYear());
  const [mes, definirMes] = useState(hoje.getUTCMonth() + 1);
  const [escolhido, definirEscolhido] = useState<Date>(hoje);

  const dias = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const detalhe = useMemo(
    () => dias.find((d) => mesmoDia(d.data, escolhido)) ?? dias[0],
    [dias, escolhido]
  );

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    document.addEventListener("keydown", aoTeclar);
    document.body.classList.add("sem-rolagem");
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.classList.remove("sem-rolagem");
    };
  }, [aoFechar]);

  const andar = (passo: number) => {
    const d = new Date(Date.UTC(ano, mes - 1 + passo, 1));
    definirAno(d.getUTCFullYear());
    definirMes(d.getUTCMonth() + 1);
  };

  const vazias = new Date(Date.UTC(ano, mes - 1, 1)).getUTCDay();

  return (
    <div className="calendario" role="dialog" aria-modal="true" aria-label="Calendário litúrgico">
      <div className="calendario__barra">
        <button type="button" className="barra__botao" onClick={() => andar(-1)} aria-label="Mês anterior">‹</button>
        <p className="calendario__mes">
          {MESES[mes - 1]} <span>{ano}</span>
        </p>
        <button type="button" className="barra__botao" onClick={() => andar(1)} aria-label="Próximo mês">›</button>
        <button type="button" className="barra__botao" onClick={aoFechar} aria-label="Fechar calendário">Fechar</button>
      </div>

      <div className="calendario__corpo">
        <div className="calendario__grade" role="grid">
          {SEMANA.map((s, i) => (
            <span className="calendario__cabeca" key={i} aria-hidden="true">{s}</span>
          ))}
          {Array.from({ length: vazias }, (_, i) => (
            <span className="calendario__vazio" key={`v${i}`} />
          ))}
          {dias.map((d) => {
            const eHoje = mesmoDia(d.data, hoje);
            const selecionado = mesmoDia(d.data, escolhido);
            return (
              <button
                type="button"
                key={d.data.toISOString()}
                className={`calendario__dia${eHoje ? " calendario__dia--hoje" : ""}${selecionado ? " calendario__dia--escolhido" : ""}`}
                onClick={() => definirEscolhido(d.data)}
                aria-pressed={selecionado}
                title={d.nome}
              >
                <span className="calendario__numero">{d.data.getUTCDate()}</span>
                <span className={`calendario__ponto dia__amostra--${d.cor}`} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        {detalhe && <Detalhe dia={detalhe} />}

        <p className="calendario__ressalva">
          Calendário de 1962, calculado para qualquer ano. Estão completas as
          festas de I e II classe e a transferência das de I classe impedidas.
          Faltam boa parte das de III classe, as comemorações de IV, as Têmporas
          e as Rogações, e os próprios locais. Confira no Ordo antes de celebrar.
        </p>
      </div>
    </div>
  );
}
