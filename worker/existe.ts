import { resolver } from "../src/routes/casar";
import { porId as folhetoPorId } from "../src/data/folhetos";
import { porId as postagemPorId } from "../src/data/postagens";
import { PADROES } from "../src/routes/padroes";
import { porId } from "../src/data/registro";

/*
 * Os caminhos que o site atende, para `resolver` escolher entre eles. Só os
 * padrões: a tabela cheia mora no lado do navegador e carrega os componentes
 * de cada página, que não têm o que fazer aqui dentro.
 */
const ROTAS = PADROES.map((padrao) => ({ padrao }));

/**
 * O caminho leva a alguma coisa?
 *
 * Casar com a rota não basta nos caminhos que capturam parâmetro:
 * `/postagens/:id` casa com qualquer palavra, e `/folhetos/:id` e
 * `/admin/:documento` também. Link para uma postagem apagada é endereço
 * morto como qualquer outro, e responder 200 nele é a mesma promessa falsa —
 * só que mais provável de acontecer, porque esses são justamente os
 * endereços que se compartilham.
 *
 * Vive fora do `index.ts` para poder ser conferida por teste: a regra só se
 * via rodando o Worker, e o único modo de saber que ela valia era pedir o
 * endereço no ar.
 */
export function existe(caminho: string): boolean {
  const casamento = resolver(ROTAS, caminho);
  if (!casamento) return false;

  if (casamento.rota.padrao === "/postagens/:id") {
    return postagemPorId(casamento.parametros.id) !== undefined;
  }
  if (casamento.rota.padrao === "/folhetos/:id") {
    return folhetoPorId(casamento.parametros.id) !== undefined;
  }
  if (casamento.rota.padrao === "/admin/:documento") {
    return porId(casamento.parametros.documento) !== undefined;
  }
  return true;
}
