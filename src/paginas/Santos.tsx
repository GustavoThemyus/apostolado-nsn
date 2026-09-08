import { Cabecalho } from "../components/Cabecalho";
import { Moldura } from "../components/Moldura";
import { Vazia } from "../components/Vazia";
import { publicadas } from "../data/postagens";
import { Elo } from "../rotas/Elo";
import { Seta } from "../components/Seta";
import { diaHabitualDaFesta } from "../calendario/vinculo";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/**
 * As festas do calendário: uma vista sobre as postagens, não um segundo
 * conjunto de dados. Ordenadas pelo dia da festa, e não pela data de
 * publicação, que é como se procura um santo.
 */
export default function Santos() {
  const santos = publicadas()
    .filter((p) => p.categoria === "santo" && p.festa)
    // o dia habitual serve só para ordenar: no calendário quem manda é a
    // precedência, e a festa transferida aparece no dia para onde foi
    .map((p) => ({ postagem: p, quando: diaHabitualDaFesta(p.festa) }))
    .sort(
      (a, b) =>
        (a.quando?.mes ?? 13) - (b.quando?.mes ?? 13) ||
        (a.quando?.dia ?? 32) - (b.quando?.dia ?? 32)
    );

  return (
    <Moldura titulo="As festas do calendário">
      <Cabecalho
        titulo="As festas do calendário"
        descricao="As vidas dos santos que o calendário celebra. Cada uma aparece também no dia dela, dentro do calendário."
      />

      {santos.length === 0 ? (
        <Vazia o_que="Ainda não há vidas de santos publicadas." />
      ) : (
        <ul className="postagens">
          {santos.map(({ postagem, quando }) => (
            <li key={postagem.id}>
              <Elo para={`/postagens/${postagem.id}`} className="postagem-linha">
                <span className="postagem-linha__data">
                  {quando ? `${quando.dia} de ${MESES[quando.mes - 1]}` : "sem data fixa"}
                </span>
                <span className="postagem-linha__titulo">{postagem.titulo}</span>
                <span className="postagem-linha__resumo">{postagem.resumo}</span>
                {postagem.rascunho && <span className="cartao__preparo">Rascunho</span>}
                <span className="cartao__ir">
                  Ler
                  <Seta className="cartao__seta" />
                </span>
              </Elo>
            </li>
          ))}
        </ul>
      )}
    </Moldura>
  );
}
