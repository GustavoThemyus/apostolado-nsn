import { postagemDaFesta, type DiaParaVinculo } from "../calendario/vinculo";
import { publicadas } from "../data/postagens";
import { Elo } from "../routes/Elo";

/**
 * O nome do que se celebra, clicável quando há a história da festa escrita.
 *
 * "Faz o título de Cristo Rei ser clicável e leva pra história da festa, dos
 * padroeiros também", pediu o Perez. O cartão "Sobre esta festa" já levava
 * para lá, mas o nome é o primeiro lugar em que se clica: é o que a página
 * anuncia, e é o que a pessoa lê.
 *
 * Só pelo nome, e não pela data. Um título que leva a outro lugar promete que
 * o lugar é sobre ele, e "Terça-feira da XI semana depois de Pentecostes" não
 * é sobre Santa Filomena, ainda que ela caia naquele dia. Nesse caso o cartão
 * embaixo continua levando, com o nome dela escrito.
 *
 * Sem postagem viva o nome fica como era, sem link: link para postagem
 * despublicada ou renomeada seria um 404 sem nada na tela avisando.
 */
export function NomeDaFesta({
  dia,
  /* a faixa do início e o detalhe do calendário têm cada um o seu titular */
  classe = "calendario__detalhe-nome",
}: {
  dia: DiaParaVinculo;
  classe?: string;
}) {
  const postagem = postagemDaFesta(publicadas(), dia);
  if (!postagem) return <p className={classe}>{dia.nome}</p>;
  return (
    <p className={classe}>
      {/* o elo comum do texto: herda a cor e se anuncia pelo fio embaixo, que
          num titular é o bastante e não o transforma em botão */}
      <Elo para={`/postagens/${postagem.id}`} className="elo-texto">
        {dia.nome}
      </Elo>
    </p>
  );
}
