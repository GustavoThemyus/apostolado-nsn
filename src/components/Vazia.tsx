import { Elo } from "../rotas/Elo";

/**
 * Estado de uma página ainda por escrever.
 *
 * Aparece no lugar do conteúdo, dizendo com todas as letras que o texto não
 * existe. É melhor do que uma página em branco, e muito melhor do que texto
 * inventado: o que se afirma aqui sobre o apostolado tem de vir dele.
 */
export function Vazia({ o_que }: { o_que?: string }) {
  return (
    <aside className="vazia">
      <p className="vazia__marca">Em preparação</p>
      <p className="vazia__texto">{o_que ?? "Este texto ainda será escrito."}</p>
      <p className="vazia__saida">
        Enquanto isso, veja o <Elo para="/missa/guia">guia da Missa</Elo> ou o{" "}
        <Elo para="/calendario">calendário</Elo>.
      </p>
    </aside>
  );
}
