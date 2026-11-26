import { postagemDaFesta, type DiaParaVinculo } from "../calendario/vinculo";
import { publicadas } from "../data/postagens";
import { Elo } from "../routes/Elo";

export function NomeDaFesta({
  dia,
  classe = "calendario__detalhe-nome",
}: {
  dia: DiaParaVinculo;
  classe?: string;
}) {
  const postagem = postagemDaFesta(publicadas(), dia);
  if (!postagem) return <p className={classe}>{dia.nome}</p>;
  return (
    <p className={classe}>
      <Elo para={`/postagens/${postagem.id}`} className="elo-texto">
        {dia.nome}
      </Elo>
    </p>
  );
}
