import type { NaMissa } from "../calendar/ordo";

function Sim({ v, porque }: { v: boolean; porque?: string }) {
  return (
    <>
      <span className={v ? "sinal sinal--sim" : "sinal sinal--nao"}>{v ? "sim" : "não"}</span>
      {porque && <span className="desenv__porque"> {porque}</span>}
    </>
  );
}

const CHAPEU = /^(comemoraç(ão|ões)|oraç(ão|ões))\s+(d[aeos]s?\s+)?/i;

const INTERNO = /(\s+e\s+|,\s*)oraç(ão|ões)\s+/gi;

export function semOChapeu(texto: string): string {
  const limpo = texto.replace(CHAPEU, "").replace(INTERNO, "$1");
  return limpo ? limpo[0].toUpperCase() + limpo.slice(1) : texto;
}

const semMissa = (texto: string): string => {
  const nome = texto.replace(/^Missa\s+/, "");
  return nome[0].toUpperCase() + nome.slice(1);
};

export function TabelaDaMissa({ naMissa, titulo, quaresma, soONome }: {
  naMissa: NaMissa;
  titulo: string;
  quaresma: boolean;
  soONome: boolean;
}) {
  return (
    <div className="desenv">
      <p className="desenv__titulo">{titulo}</p>
      <dl className="desenv__lista">
        {naMissa.resto.length > 0 && (
          <div>
            <dt>Missa</dt>
            <dd>
              {(soONome ? naMissa.resto.map(semMissa) : naMissa.resto).join("; ")}
            </dd>
          </div>
        )}
        <div>
          <dt>Glória</dt>
          <dd><Sim v={naMissa.gloria} porque={naMissa.gloriaPorque} /></dd>
        </div>
        {naMissa.comemoracoes.length > 0 && (
          <div>
            <dt>Comemoração</dt>
            <dd>{naMissa.comemoracoes.map(semOChapeu).join("; ")}</dd>
          </div>
        )}
        {naMissa.oracoes.length > 0 && (
          <div>
            <dt>Orações do tempo</dt>
            <dd>{naMissa.oracoes.map(semOChapeu).join("; ")}</dd>
          </div>
        )}
        {naMissa.entreAsLeituras.length > 0 && (
          <div>
            <dt>Entre as leituras</dt>
            <dd>{naMissa.entreAsLeituras.join("; ")}</dd>
          </div>
        )}
        <div>
          <dt>Credo</dt>
          <dd><Sim v={naMissa.credo} porque={naMissa.credoPorque} /></dd>
        </div>
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
        {(quaresma || naMissa.oracaoSobreOPovo) && (
          <div>
            <dt>Oração sobre o povo</dt>
            <dd><Sim v={naMissa.oracaoSobreOPovo} /></dd>
          </div>
        )}
        {naMissa.fecho && (
          <div>
            <dt>Despedida</dt>
            <dd>{naMissa.fecho}</dd>
          </div>
        )}
        <div>
          <dt>Último Evangelho</dt>
          <dd>
            {naMissa.ultimoEvangelho ?? (
              <>
                prólogo de São João
                <span className="desenv__porque"> pela regra geral</span>
              </>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}
