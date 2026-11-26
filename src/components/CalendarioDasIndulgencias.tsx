import { ARQUIDIOCESE, LEMBRANCA, agendasLembradas } from "../data/agendasLigadas";
import { useCallback, useEffect, useMemo, useState } from "react";
import { indulgenciasDoMes, temPlenaria } from "../calendar/indulgencias";
import { mesLiturgico } from "../calendar/precedencia";
import { ListaDeBlocos } from "./Bloco";
import { TextoRico } from "./TextoRico";
import { GradeDoMes, mesmoDia } from "./GradeDoMes";
import { porExtensoCurto } from "./DiaDeHoje";
import { SeletorDeAgendas } from "./SeletorDeAgendas";
import { usarAgendas } from "../hooks/usarAgendas";
import { indulgencias } from "../data/indulgenciasDias";
import { diasDaArquidiocese } from "../data/arquidioceseDias";
import { site } from "../data/site";
import { Elo } from "../routes/Elo";
import { usarRota } from "../routes/usarRota";

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

const ESPECIE_NO_TITULO = /^indulg[êe]ncias?\s+(plen[áa]ria|parcial)s?$/i;

const especieDe = (titulo: string): "plenaria" | "parcial" | undefined => {
  const achado = ESPECIE_NO_TITULO.exec(titulo.trim());
  if (!achado) return undefined;
  return /^plen/i.test(achado[1]) ? "plenaria" : "parcial";
};

function nomesDas(ids: string[]): string {
  const nomes = ids.map((id) => site.agendas.find((a) => a.id === id)?.nome ?? id);
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

const OBRA_NA_IGREJA =
  "Obra indulgenciada: visitar a igreja e rezar um Pai-Nosso e um Credo.";

function porFesta<T extends { entrada: { titulo: string }; transferidaDe?: string }>(
  ocorrencias: T[],
) {
  const grupos = new Map<string, { titulo: string; transferidaDe?: string; entradas: T["entrada"][] }>();
  for (const { entrada, transferidaDe } of ocorrencias) {
    const g = grupos.get(entrada.titulo) ?? { titulo: entrada.titulo, transferidaDe, entradas: [] };
    g.entradas.push(entrada);
    grupos.set(entrada.titulo, g);
  }
  return [...grupos.values()];
}

const hojeUTC = () => {
  const a = new Date();
  return new Date(Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()));
};
const comoIso = (d: Date) => d.toISOString().slice(0, 10);

function diaDaBusca(busca: URLSearchParams, padrao: Date): Date {
  const cru = busca.get("dia");
  if (!cru || !/^\d{4}-\d{2}-\d{2}$/.test(cru)) return padrao;
  const d = new Date(`${cru}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? padrao
    : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function CalendarioDasIndulgencias({ caminho }: { caminho: string }) {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const escolhido = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);

  const ano = escolhido.getUTCFullYear();
  const mes = escolhido.getUTCMonth() + 1;

  const dias = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const porDia = useMemo(
    () => indulgenciasDoMes(indulgencias.dias, ano, mes),
    [ano, mes],
  );

  const irPara = useCallback(
    (data: Date) => navegar(`${caminho}?dia=${comoIso(data)}`),
    [navegar, caminho],
  );
  const andar = (passo: number) =>
    irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  const [ligadas, definirEscolhidas] = useState<string[]>(agendasLembradas);
  const vinculadas = usarAgendas(
    useMemo(() => ligadas.filter((id) => id !== ARQUIDIOCESE), [ligadas]),
    ano,
  );

  const comArquidiocese = ligadas.includes(ARQUIDIOCESE);
  const porDiaArquidiocese = useMemo(
    () =>
      comArquidiocese
        ? indulgenciasDoMes(diasDaArquidiocese, ano, mes)
        : new Map<string, never[]>(),
    [comArquidiocese, ano, mes],
  );

  useEffect(() => {
    try {
      localStorage.setItem(LEMBRANCA, JSON.stringify(ligadas));
    } catch {
    }
  }, [ligadas]);

  const alternar = useCallback((id: string) => {
    definirEscolhidas((atuais) =>
      atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id],
    );
  }, []);

  const doDia = porDia.get(comoIso(escolhido)) ?? [];
  const vinculadosDoDia = vinculadas.porDia.get(comoIso(escolhido)) ?? [];
  const daArquidiocese = porDiaArquidiocese.get(comoIso(escolhido)) ?? [];
  const diaLiturgico = dias.find((d) => mesmoDia(d.data, escolhido));

  return (
    <>
      <SeletorDeAgendas
        grupos={[{ grupo: "indulgencias", titulo: "Das confrarias e ordens terceiras" }]}
        proprios={[
          {
            titulo: "Da Arquidiocese",
            itens: [{ id: ARQUIDIOCESE, nome: "Paróquias, santuários e ordens" }],
          },
        ]}
        ligadas={ligadas}
        aoAlternar={alternar}
        carregando={vinculadas.carregando}
      />

      {vinculadas.falharam.length > 0 && (
        <p className="agendas-na-grade__aviso">
          Não consegui buscar {nomesDas(vinculadas.falharam)}. Pode ser que o
          calendário tenha saído do ar ou deixado de ser público.
        </p>
      )}
      {vinculadas.semDetalhes.length > 0 && (
        <p className="agendas-na-grade__aviso">
          {nomesDas(vinculadas.semDetalhes)} está partilhado sem os detalhes, e
          o Google devolve todo dia como "Busy". Para aparecer aqui, tem de
          estar público <em>com</em> os detalhes.
        </p>
      )}

      <div className="calendario__barra">
        <button
          type="button"
          className="barra__botao"
          onClick={() => andar(-1)}
          aria-label="Mês anterior"
        >
          ‹
        </button>
        <p className="calendario__mes">
          {MESES[mes - 1]} <span>{ano}</span>
        </p>
        <button
          type="button"
          className="barra__botao"
          onClick={() => andar(1)}
          aria-label="Próximo mês"
        >
          ›
        </button>
        <button
          type="button"
          className="barra__botao"
          onClick={() => irPara(hoje)}
        >
          Hoje
        </button>
      </div>

      <div className="calendario__painel">
        <div className="calendario__coluna-grade">
          <GradeDoMes
            dias={dias}
            hoje={hoje}
            escolhido={escolhido}
            aoEscolher={irPara}
            marcar={(d) => {
              const iso = comoIso(d.data);
              const ocorrencias = porDia.get(iso);
              const deFora = vinculadas.porDia.get(iso) ?? [];
              const agendas = [...new Set(deFora.map((i) => i.agenda))];
              if (porDiaArquidiocese.get(iso)?.length) agendas.push(ARQUIDIOCESE);
              if (!ocorrencias?.length && agendas.length === 0) return null;
              return (
                <>
                  {ocorrencias?.length ? (
                    <span
                      className={`indulgencia__marca${
                        temPlenaria(ocorrencias) ? " indulgencia__marca--plenaria" : ""
                      }`}
                      aria-hidden="true"
                    />
                  ) : null}
                  {agendas.length > 0 && (
                    <span className="agendas-na-grade__bandeiras" aria-hidden="true">
                      {agendas.map((id) => (
                        <span
                          className={`agendas-na-grade__ponto agendas-na-grade__ponto--${id}`}
                          key={id}
                        />
                      ))}
                    </span>
                  )}
                </>
              );
            }}
          />

          <p className="legenda-agendas">
            <span className="legenda-agendas__rotulo">Na grade:</span>
            <span className="legenda-agendas__item">
              <span
                className="indulgencia__marca indulgencia__marca--plenaria"
                aria-hidden="true"
              />
              plenária
            </span>
            <span className="legenda-agendas__item">
              <span className="indulgencia__marca" aria-hidden="true" />
              parcial
            </span>
          </p>
        </div>

        <div className="calendario__coluna-detalhe">
          <div className="calendario__detalhe">
            <p className="calendario__detalhe-data">
              {escolhido.getUTCDate()} de {MESES[escolhido.getUTCMonth()]} de {ano}
            </p>
            {diaLiturgico && (
              <p className="calendario__detalhe-nome">{diaLiturgico.nome}</p>
            )}

            {doDia.length === 0 &&
            vinculadosDoDia.length === 0 &&
            daArquidiocese.length === 0 ? (
              <p className="dia__observacao">
                Nenhuma indulgência presa a este dia.
              </p>
            ) : doDia.length === 0 ? null : (
              <ul className="indulgencias-dia">
                {doDia.map(({ entrada, transferidaDe }) => (
                  <li key={entrada.id}>
                    <p className="indulgencias-dia__titulo">
                      {entrada.titulo}
                      <span className={`etiqueta etiqueta--${entrada.especie}`}>
                        {entrada.especie === "plenaria" ? "Plenária" : "Parcial"}
                      </span>
                    </p>
                    {transferidaDe && (
                      <p className="dia__transferida">
                        Acompanha a festa, transferida de{" "}
                        {porExtensoCurto(transferidaDe)}.
                      </p>
                    )}
                    <ListaDeBlocos blocos={entrada.obra} />
                    {entrada.fonte && (
                      <p className="indulgencias-dia__fonte">
                        <TextoRico texto={entrada.fonte} />
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {daArquidiocese.length > 0 && (
            <section className="vinculados" aria-labelledby="arquidiocese">
              <h2 className="vinculados__titulo" id="arquidiocese">
                Nas igrejas da Arquidiocese
              </h2>
              <ul className="indulgencias-dia">
                {porFesta(daArquidiocese).map(({ titulo, transferidaDe, entradas }) => (
                  <li key={titulo}>
                    <p className="indulgencias-dia__titulo">
                      {titulo}
                      <span className="etiqueta etiqueta--plenaria">Plenária</span>
                    </p>
                    {transferidaDe && (
                      <p className="dia__transferida">
                        Acompanha a festa, transferida de{" "}
                        {porExtensoCurto(transferidaDe)}.
                      </p>
                    )}
                    <p>{OBRA_NA_IGREJA}</p>
                    <ul className="arquidiocese-dia__igrejas">
                      {entradas.flatMap((entrada) =>
                        entrada.igrejas.map((igreja) => (
                          <li key={`${entrada.id}-${igreja}`}>
                            <Elo
                              para={`/indulgencias/arquidiocese#${entrada.id}`}
                              className="elo-texto"
                            >
                              {igreja}
                            </Elo>
                            {entrada.instituicao && (
                              <span className="arquidiocese-dia__instituicao">
                                {" "}
                                {entrada.instituicao}
                              </span>
                            )}
                          </li>
                        )),
                      )}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {vinculadosDoDia.length > 0 && (
            <section className="vinculados" aria-labelledby="vinculados">
              <h2 className="vinculados__titulo" id="vinculados">
                Dos calendários que você ligou
              </h2>
              <ul className="indulgencias-dia">
                {vinculadosDoDia.map((i, n) => {
                  const especie = especieDe(i.titulo);
                  const comFesta = !!i.festa && !!especie;
                  const corpo = comFesta
                    ? i.descricao
                    : [i.festa, i.descricao].filter(Boolean).join("\n\n");
                  return (
                    <li key={`${i.agenda}-${n}`}>
                      <p className="indulgencias-dia__titulo">
                        {comFesta ? i.festa : i.titulo}
                        {especie && (
                          <span className={`etiqueta etiqueta--${especie}`}>
                            {especie === "plenaria" ? "Plenária" : "Parcial"}
                          </span>
                        )}
                      </p>
                      {corpo?.split("\n\n").map((paragrafo) => (
                        <p className="paragrafo" key={paragrafo}>
                          {paragrafo}
                        </p>
                      ))}
                      <p className="indulgencias-dia__fonte">{i.nome}</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
