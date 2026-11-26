import { Elo } from "../routes/Elo";

export function Vazia({
  o_que,
  variante = "preparacao",
}: {
  o_que?: string;
  variante?: "preparacao" | "rascunho";
}) {
  const rascunho = variante === "rascunho";
  return (
    <aside className={`vazia vazia--${variante}`}>
      <p className="vazia__marca">{rascunho ? "Rascunho" : "Em preparação"}</p>
      <p className="vazia__texto">
        {o_que ??
          (rascunho
            ? "Este texto é provisório e será substituído pelo definitivo."
            : "Este texto ainda será escrito.")}
      </p>
      <p className="vazia__saida">
        Enquanto isso, veja o <Elo para="/missa/guia">guia da Missa</Elo> ou o{" "}
        <Elo para="/calendario">calendário</Elo>.
      </p>
    </aside>
  );
}
