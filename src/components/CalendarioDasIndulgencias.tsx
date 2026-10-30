import { useCallback, useEffect, useMemo, useState } from "react";
import { indulgenciasDoMes, temPlenaria } from "../calendario/indulgencias";
import { mesLiturgico } from "../calendario/precedencia";
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

/*
 * Quais calendários vinculados o leitor mandou mostrar.
 *
 * Fica no aparelho dele, e não na URL: é preferência de quem lê, não parte do
 * endereço que se compartilha. Quem é da Terceira Franciscana quer os dias
 * dela toda vez que voltar, e não quer que o link que mandou para um amigo
 * leve junto a confraria a que ele não pertence.
 */
const LEMBRANCA = "nsn:indulgencias:agendas";

/**
 * O calendário que não se desliga.
 *
 * "Eu quero que as indulgências universais esteja sempre ativo", pediu o
 * Perez. É o calendário que o próprio Apostolado mantém, e é o que a grade
 * promete: deixá-lo numa caixa, desmarcado por padrão, era oferecer como
 * opcional o assunto da página.
 *
 * Fica fora do que se guarda no aparelho. Guardado junto, ele voltaria duas
 * vezes na lista das ligadas, e sairia da lista no dia em que alguém tivesse
 * visitado a página antes desta mudança.
 */
const SEMPRE = ["indulgencias-apostolado"];

/**
 * A Arquidiocese não é agenda do Google: é conta deste site.
 *
 * Sai das 75 datas do documento do Perez, pelo mesmo motor das indulgências
 * de cima, e por isso não passa pelo Worker. O id vive junto dos outros na
 * lista do que o leitor ligou — é um interruptor como os outros, e guardar
 * em separado faria duas memórias para a mesma pergunta —, mas sai da lista
 * antes da busca, que é só para quem tem calendário no Google.
 */
const ARQUIDIOCESE = "arquidiocese";

/**
 * "Indulgência Plenária" é o nome de todo evento destes calendários.
 *
 * O Perez escreve a espécie no título e a festa na primeira linha da
 * descrição, e assim a lista mostrava a mesma frase repetida em todo item,
 * com a festa colada na obra embaixo. Reconhecida a frase, ela vira a
 * etiqueta que as indulgências de cima já usam, e a festa sobe para o lugar
 * dela.
 *
 * Exato, e não "contém plenária": é o que garante que um título de verdade,
 * no dia em que ele escrever um, continue sendo o título.
 */
const ESPECIE_NO_TITULO = /^indulg[êe]ncias?\s+(plen[áa]ria|parcial)s?$/i;

const especieDe = (titulo: string): "plenaria" | "parcial" | undefined => {
  const achado = ESPECIE_NO_TITULO.exec(titulo.trim());
  if (!achado) return undefined;
  return /^plen/i.test(achado[1]) ? "plenaria" : "parcial";
};

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
    const validos = new Set([...site.agendas.map((a) => a.id), ARQUIDIOCESE]);
    return lista.filter(
      (x): x is string => typeof x === "string" && validos.has(x) && !SEMPRE.includes(x),
    );
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
 * A grade do mês com as indulgências, e o detalhe do dia escolhido.
 *
 * Usa a mesma grade e o mesmo motor do calendário litúrgico, e é isso que faz
 * a indulgência presa a uma festa acompanhar a transferência dela. Um segundo
 * calendário, próprio, divergiria do primeiro na primeira exceção.
 *
 * Mora na página geral das indulgências desde que o Perez pediu a troca: "o
 * calendário que está lá, colocava na página geral das indulgências; seria
 * invertido". A página filha ficou com a lista do ano inteiro.
 *
 * `caminho` é a página que o hospeda, porque o dia escolhido vai na URL e a
 * seta do mês tem de voltar para ela, não para onde este bloco nasceu.
 */
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

  /* o que o leitor escolheu; o do Apostolado entra por fora e não se guarda */
  const [escolhidas, definirEscolhidas] = useState<string[]>(agendasLembradas);
  const ligadas = useMemo(() => [...SEMPRE, ...escolhidas], [escolhidas]);
  const vinculadas = usarAgendas(
    useMemo(() => ligadas.filter((id) => id !== ARQUIDIOCESE), [ligadas]),
  );

  const comArquidiocese = escolhidas.includes(ARQUIDIOCESE);
  const porDiaArquidiocese = useMemo(
    () =>
      comArquidiocese
        ? indulgenciasDoMes(diasDaArquidiocese, ano, mes)
        : new Map<string, never[]>(),
    [comArquidiocese, ano, mes],
  );

  useEffect(() => {
    try {
      localStorage.setItem(LEMBRANCA, JSON.stringify(escolhidas));
    } catch {
      /* navegador com os dados do site bloqueados: a escolha vale só nesta visita */
    }
  }, [escolhidas]);

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
        grupos={[
          { grupo: "indulgencias-apostolado", titulo: "Do Apostolado", sempre: true },
          { grupo: "indulgencias", titulo: "Das confrarias e ordens terceiras" },
        ]}
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
               * agenda ligada ganha o seu próprio ponto, na cor dela — a mesma
               * que está ao lado do nome, na caixa de cima.
               */
              const deFora = vinculadas.porDia.get(iso) ?? [];
              const agendas = [...new Set(deFora.map((i) => i.agenda))];
              /* a da Arquidiocese é conta nossa, mas é ponto como os outros:
                 na casa do dia o que importa é de quem é o dia, e ela tem a
                 cor dela na mesma lista de cima */
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
            /*
             * As da Arquidiocese também em bloco próprio, e pelo motivo
             * oposto ao das de baixo: estas o site calcula, mas não são de
             * todo mundo. A de cima se lucra onde o fiel estiver; esta pede
             * que ele vá àquela igreja, naquele dia. Na mesma lista, o
             * leitor leria "hoje tem indulgência" e sairia sem saber que
             * precisava atravessar a cidade.
             */
            <section className="vinculados" aria-labelledby="arquidiocese">
              <h2 className="vinculados__titulo" id="arquidiocese">
                Nas igrejas da Arquidiocese
              </h2>
              <ul className="indulgencias-dia">
                {daArquidiocese.map(({ entrada, transferidaDe }) => (
                  <li key={entrada.id}>
                    <p className="indulgencias-dia__titulo">
                      {entrada.titulo}
                      <span className="etiqueta etiqueta--plenaria">Plenária</span>
                    </p>
                    {transferidaDe && (
                      <p className="dia__transferida">
                        Acompanha a festa, transferida de{" "}
                        {porExtensoCurto(transferidaDe)}.
                      </p>
                    )}
                    {entrada.instituicao && (
                      <p className="arquidiocese-dia__instituicao">
                        {entrada.instituicao}
                      </p>
                    )}
                    <ul className="arquidiocese-dia__igrejas">
                      {entrada.igrejas.map((igreja) => (
                        <li key={igreja}>{igreja}</li>
                      ))}
                    </ul>
                    <p className="indulgencias-dia__fonte">
                      <Elo para={`/indulgencias/arquidiocese#${entrada.secao}`}>
                        A obra e as condições, no calendário arquidiocesano
                      </Elo>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
                {vinculadosDoDia.map((i, n) => {
                  const especie = especieDe(i.titulo);
                  /*
                   * O nome do evento só sai da frente quando ele é a etiqueta
                   * que todos repetem e há festa para pôr no lugar. Fora
                   * disso ele continua sendo o título, e a primeira linha da
                   * descrição volta para o corpo: nada se esconde porque o
                   * calendário de fora mudou de forma.
                   */
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
