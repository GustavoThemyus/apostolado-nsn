import { Elo } from "../rotas/Elo";

/**
 * Estado de uma página ainda por escrever.
 *
 * Aparece no lugar do conteúdo, dizendo com todas as letras que o texto não
 * existe. É melhor do que uma página em branco, e muito melhor do que texto
 * inventado: o que se afirma aqui sobre o apostolado tem de vir dele.
 */
export function Vazia({
  o_que,
  variante = "preparacao",
}: {
  o_que?: string;
  /** "rascunho" avisa que há texto, mas provisório. */
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
