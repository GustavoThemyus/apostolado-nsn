import { naMissaDoOrdo, type DiaDoOrdo } from "../calendario/ordo";
import { NOME_DO_TEMPO } from "../calendario/tipos";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
  "agosto", "setembro", "outubro", "novembro", "dezembro"];

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco", vermelho: "Vermelho", verde: "Verde",
  roxo: "Roxo", preto: "Preto", rosa: "Rosa",
};

/** "sim" ou "não", com o motivo quando o Ordo o dá. */
function Sim({ v, porque }: { v: boolean; porque?: string }) {
  return (
    <>
      <span className={v ? "sinal sinal--sim" : "sinal sinal--nao"}>{v ? "sim" : "não"}</span>
      {porque && <span className="desenv__porque"> {porque}</span>}
    </>
  );
}

/**
 * O dia no Ordo da capela.
 *
 * Não é o irmão do `DetalheDoDia`: aquele mostra o que o motor de 1962 deduziu
 * — classe, Glória, Credo — e aqui nada é deduzido. O Ordo já diz a Missa, as
 * comemorações, o Prefácio e as rubricas, e o que esta tela faz é mostrá-las
 * com as palavras dele. Por isso o grau vem escrito ("Duples maior") e não
 * como número de classe: são vocabulários diferentes, e traduzir um no outro
 * seria dizer o que o Ordo não diz.
 */
export function DetalheDoOrdo({ dia }: { dia: DiaDoOrdo }) {
  // no Ordo o primeiro parágrafo é sempre o da Missa; os demais vêm marcados
  const [missa, ...resto] = dia.partes;
  const marcado = (p: string) => /^[➢❖]/.test(p);
  const naMissa = naMissaDoOrdo(dia);

  return (
    <div className="calendario__detalhe">
      <p className="calendario__detalhe-data">
        {dia.data.getUTCDate()} de {MESES[dia.data.getUTCMonth()]} de{" "}
        {dia.data.getUTCFullYear()}
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
          <dt>Grau</dt>
          <dd>{dia.grau}</dd>
        </div>
      </dl>

      {dia.cores && <p className="ordo__cores">{dia.cores[0].toUpperCase() + dia.cores.slice(1)}.</p>}
      {dia.guarda && <p className="ordo__guarda">Dia santo de guarda.</p>}

      {naMissa && (
        <div className="desenv">
          <p className="desenv__titulo">Na Missa deste dia</p>
          <dl className="desenv__lista">
            <div>
              <dt>Glória</dt>
              <dd><Sim v={naMissa.gloria} porque={naMissa.gloriaPorque} /></dd>
            </div>
            <div>
              <dt>Credo</dt>
              <dd><Sim v={naMissa.credo} porque={naMissa.credoPorque} /></dd>
            </div>
            {naMissa.comemoracoes.length > 0 && (
              <div>
                <dt>Comemoração</dt>
                <dd>{naMissa.comemoracoes.join("; ")}</dd>
              </div>
            )}
            {naMissa.entreAsLeituras.length > 0 && (
              <div>
                <dt>Entre as leituras</dt>
                <dd>{naMissa.entreAsLeituras.join("; ")}</dd>
              </div>
            )}
            {naMissa.prefacio && (
              <div>
                <dt>Prefácio</dt>
                <dd>
                  {naMissa.prefacio}
                  {naMissa.communicantes && (
                    <span className="desenv__porque"> e Communicantes próprio</span>
                  )}
                </dd>
              </div>
            )}
            {naMissa.ultimoEvangelho && (
              <div>
                <dt>Último Evangelho</dt>
                <dd>{naMissa.ultimoEvangelho}</dd>
              </div>
            )}
            {naMissa.fecho && (
              <div>
                <dt>Fecho</dt>
                <dd>{naMissa.fecho}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {missa && <p className="ordo__missa">{missa}</p>}

      {resto.length > 0 && (
        <ul className="ordo__notas">
          {resto.map((p) => (
            <li className={marcado(p) ? "ordo__nota" : "ordo__nota ordo__nota--corrida"} key={p}>
              {p.replace(/^[➢❖]\s*/, "")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
