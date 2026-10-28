import { useCallback, useEffect, useMemo, useState } from "react";
import bruto from "../data/indulgencias-dias.json";
import {
  indulgenciasDoMes,
  temPlenaria,
  type DiaDeIndulgencia,
  type Especie,
} from "../calendario/indulgencias";
import { mesLiturgico } from "../calendario/precedencia";
import { AssinarAgenda } from "../components/AssinarAgenda";
import { ListaDeBlocos } from "../components/Bloco";
import { ProvedorDeNotas } from "../components/Notas";
import { TextoRico } from "../components/TextoRico";
import { Cabecalho } from "../components/Cabecalho";
import { GradeDoMes, mesmoDia } from "../components/GradeDoMes";
import { Moldura } from "../components/Moldura";
import { porExtensoCurto } from "../components/DiaDeHoje";
import { SeletorDeAgendas } from "../components/SeletorDeAgendas";
import { usarAgendas } from "../hooks/usarAgendas";
import { site } from "../data/site";
import { usarRota } from "../routes/usarRota";
import type { Bloco } from "../data/tipos";

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

interface Colecao {
  titulo: string;
  descricao: string;
  /** As quatro condições ordinárias, escritas uma vez para toda a página. */
  condicoes: { titulo: string; blocos: Bloco[] };
  /** O que vale para todas elas: nove itens, com a citação de cada um. */
  observacoes: { titulo: string; blocos: Bloco[] };
  /** As notas de rodapé das duas, pela chamada. */
  notas: Record<string, string>;
  dias: DiaDeIndulgencia[];
  /** As que valem em qualquer dia, e por isso não entram na grade. */
  semDiaFixo: {
    id: string;
    titulo: string;
    especie: Especie;
    fonte?: string;
    obra: Bloco[];
  }[];
}

const colecao = bruto as unknown as Colecao;

/*
 * Quais calendários vinculados o leitor mandou mostrar.
 *
 * Fica no aparelho dele, e não na URL: é preferência de quem lê, não parte do
 * endereço que se compartilha. Quem é da Terceira Franciscana quer os dias
 * dela toda vez que voltar, e não quer que o link que mandou para um amigo
 * leve junto a confraria a que ele não pertence.
 */
const LEMBRANCA = "nsn:indulgencias:agendas";

/** "escapulario, cordao" não é frase: o aviso fala o nome que o leitor leu. */
function nomesDas(ids: string[]): string {
  const nomes = ids.map((id) => site.agendas.find((a) => a.id === id)?.nome ?? id);
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

function agendasLembradas(): string[] {
  try {
    const cru = localStorage.getItem(LEMBRANCA);
    const lista = cru ? (JSON.parse(cru) as unknown) : null;
    if (!Array.isArray(lista)) return [];
    // o que foi removido do site.json desde a última visita não volta
    const validos = new Set(site.agendas.map((a) => a.id));
    return lista.filter((x): x is string => typeof x === "string" && validos.has(x));
  } catch {
    return [];
  }
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

/**
 * O calendário das indulgências.
 *
 * Usa a mesma grade e o mesmo motor do calendário litúrgico, e é isso que faz
 * a indulgência presa a uma festa acompanhar a transferência dela. Um segundo
 * calendário, próprio, divergiria do primeiro na primeira exceção.
 */
export default function IndulgenciasCalendario() {
  const { busca, navegar } = usarRota();
  const hoje = useMemo(hojeUTC, []);
  const escolhido = useMemo(() => diaDaBusca(busca, hoje), [busca, hoje]);

  const ano = escolhido.getUTCFullYear();
  const mes = escolhido.getUTCMonth() + 1;

  const dias = useMemo(() => mesLiturgico(ano, mes), [ano, mes]);
  const porDia = useMemo(
    () => indulgenciasDoMes(colecao.dias, ano, mes),
    [ano, mes],
  );

  const irPara = useCallback(
    (data: Date) => navegar(`/indulgencias/calendario?dia=${comoIso(data)}`),
    [navegar],
  );
  const andar = (passo: number) =>
    irPara(new Date(Date.UTC(ano, mes - 1 + passo, 1)));

  const [ligadas, definirLigadas] = useState<string[]>(agendasLembradas);
  const vinculadas = usarAgendas(ligadas);

  useEffect(() => {
    try {
      localStorage.setItem(LEMBRANCA, JSON.stringify(ligadas));
    } catch {
      /* navegador com os dados do site bloqueados: a escolha vale só nesta visita */
    }
  }, [ligadas]);

  const alternar = useCallback((id: string) => {
    definirLigadas((atuais) =>
      atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id],
    );
  }, []);

  const doDia = porDia.get(comoIso(escolhido)) ?? [];
  const vinculadosDoDia = vinculadas.porDia.get(comoIso(escolhido)) ?? [];
  const diaLiturgico = dias.find((d) => mesmoDia(d.data, escolhido));

  return (
    <Moldura titulo={colecao.titulo}>
      <Cabecalho titulo={colecao.titulo} descricao={colecao.descricao} />

      {/*
        As condições e as observações vêm do JSON, e não daqui.

        São o texto que o Perez escreveu para abrir o calendário, com as
        citações canônicas de cada item, e ele continua corrigindo-o. Escrito
        na página, cada vírgula dele exigiria mexer em TSX; no JSON o painel
        de edição alcança, como alcança o resto do conteúdo do site.

        As duas caixas, e não uma: a primeira é o que se tem de fazer, e é
        curta de propósito; a segunda é o que costuma ser perguntado depois, e
        tem nove itens. Juntas, as nove linhas enterravam as quatro.
      */}
      {/* o provedor envolve só estas duas caixas, que é onde estão as
          chamadas: as citações canônicas vivem em balão, como no resto do
          site, e sem ele virariam números soltos no meio da frase */}
      <ProvedorDeNotas notas={colecao.notas}>
        <aside className="nota" aria-labelledby="condicoes">
          <h2 className="nota__titulo" id="condicoes">
            {colecao.condicoes.titulo}
          </h2>
          <ListaDeBlocos blocos={colecao.condicoes.blocos} />
        </aside>

        <details className="observacoes">
          <summary className="observacoes__resumo">
            {colecao.observacoes.titulo}
            <span className="observacoes__pista"> o que vale para todas elas</span>
          </summary>
          <ListaDeBlocos blocos={colecao.observacoes.blocos} />
        </details>
      </ProvedorDeNotas>

      <SeletorDeAgendas
        grupos={[
          { grupo: "indulgencias-apostolado", titulo: "Do Apostolado" },
          { grupo: "indulgencias", titulo: "Das confrarias e ordens terceiras" },
        ]}
        ligadas={ligadas}
        aoAlternar={alternar}
        carregando={vinculadas.carregando}
      />

      {vinculadas.falharam.length > 0 && (
        <p className="agendas__aviso">
          Não consegui buscar {nomesDas(vinculadas.falharam)}. Pode ser que o
          calendário tenha saído do ar ou deixado de ser público.
        </p>
      )}
      {vinculadas.semDetalhes.length > 0 && (
        <p className="agendas__aviso">
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

      {/*
        Grade e detalhe lado a lado no computador, como no calendário
        litúrgico: o Perez achou o mês grande demais em tela larga, e aqui
        valia o mesmo — a casa em que se clica e o que ela traz ficavam
        longe uma da outra. No celular continua empilhado.
      */}
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
              /*
               * As agendas de fora não se somam ao marcador de plenária: aquele
               * diz o que esta página calcula, e misturar com o que vem do Google
               * faria o leitor atribuir a uma coisa a garantia da outra. Cada
               * agenda ligada ganha o seu próprio ponto, na cor dela.
               */
              const deFora = vinculadas.porDia.get(iso) ?? [];
              const agendas = [...new Set(deFora.map((i) => i.agenda))];
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
                    <span className="agendas__bandeiras" aria-hidden="true">
                      {agendas.map((id) => (
                        <span className="agendas__ponto" key={id} />
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

            {doDia.length === 0 && vinculadosDoDia.length === 0 ? (
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

          {vinculadosDoDia.length > 0 && (
            /*
             * Em bloco próprio, e não misturado com as de cima.
             *
             * As de cima este site calcula, e responde por elas: a obra, a fonte
             * e a transferência saem do motor. Estas vêm do calendário que a
             * associação mantém no Google, com o texto que ela escreveu. Juntar
             * as duas numa lista só faria o leitor cobrar deste site a exatidão
             * do que é de outro.
             */
            <section className="vinculados" aria-labelledby="vinculados">
              <h2 className="vinculados__titulo" id="vinculados">
                Dos calendários que você ligou
              </h2>
              <ul className="indulgencias-dia">
                {vinculadosDoDia.map((i) => (
                  <li key={`${i.agenda}-${i.titulo}`}>
                    <p className="indulgencias-dia__titulo">
                      {i.titulo}
                      <span className="vinculados__fonte">{i.nome}</span>
                    </p>
                    {i.descricao && <p className="paragrafo">{i.descricao}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <section className="nota" aria-labelledby="sem-dia">
        <h2 className="nota__titulo" id="sem-dia">
          Em qualquer dia
        </h2>
        <p>
          Nem toda indulgência está presa a uma data. Estas valem quando a obra
          for feita, e por isso ficam fora da grade em vez de repetidas em todos
          os dias do ano.
        </p>
        <ul className="indulgencias-dia">
          {colecao.semDiaFixo.map((i) => (
            <li key={i.id}>
              <p className="indulgencias-dia__titulo">
                {i.titulo}
                <span className={`etiqueta etiqueta--${i.especie}`}>
                  {i.especie === "plenaria" ? "Plenária" : "Parcial"}
                </span>
              </p>
              <ListaDeBlocos blocos={i.obra} />
              {i.fonte && (
                <p className="indulgencias-dia__fonte">
                  <TextoRico texto={i.fonte} />
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/*
        Dois blocos, e não um: o calendário do Apostolado vale para qualquer
        fiel, e os das confrarias só para quem é de uma delas. Junto, o de cima
        parecia mais uma associação na lista.
      */}
      <AssinarAgenda
        grupo="indulgencias-apostolado"
        titulo="Levar as indulgências no celular"
        explicacao="O calendário que o Apostolado mantém, com os dias que ele marca."
      />

      <AssinarAgenda
        grupo="indulgencias"
        titulo="Calendários das confrarias e ordens terceiras"
        explicacao="Cada um traz os dias próprios de uma associação. Vincule o da que você pertence, para não perder as datas."
      />
    </Moldura>
  );
}
