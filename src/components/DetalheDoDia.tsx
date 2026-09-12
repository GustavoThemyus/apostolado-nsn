import { Desenvolvimento } from "./Desenvolvimento";
import { postagemDoDia } from "../calendario/vinculo";
import { publicadas } from "../data/postagens";
import { Elo } from "../routes/Elo";
import { Seta } from "./Seta";
import { porExtensoCurto } from "./DiaDeHoje";
import { NOME_DO_TEMPO } from "../calendario/tipos";
import type { DiaLiturgico } from "../calendario/tipos";

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

const NOME_DA_COR: Record<string, string> = {
  branco: "Branco",
  vermelho: "Vermelho",
  verde: "Verde",
  roxo: "Roxo",
  preto: "Preto",
  rosa: "Rosa",
};

/** O que se celebra num dia, com tempo, cor, classe e o que muda na Missa. */
export function DetalheDoDia({ dia }: { dia: DiaLiturgico }) {
  // a postagem acompanha a festa, e não a casa do calendário
  const postagem = postagemDoDia(publicadas(), dia);

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
            <span
              className={`dia__amostra dia__amostra--${dia.cor}`}
              aria-hidden="true"
            />
            <span className={`cor cor--${dia.cor}`}>
              {NOME_DA_COR[dia.cor]}
            </span>
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
      {dia.observacoes.map((o) => (
        <p className="dia__observacao" key={o}>
          {o}
        </p>
      ))}
      <Desenvolvimento dia={dia} />

      {postagem && (
        <Elo para={`/postagens/${postagem.id}`} className="dia__postagem">
          <span className="dia__postagem-rotulo">Sobre esta festa</span>
          <span className="dia__postagem-titulo">{postagem.titulo}</span>
          <Seta className="cartao__seta" />
        </Elo>
      )}

    </div>
  );
}
