import { resolver } from "../src/routes/casar";
import { porId as folhetoPorId } from "../src/data/folhetos";
import { porId as postagemPorId } from "../src/data/postagens";
import { PADROES } from "../src/routes/padroes";
import { porId } from "../src/data/registro";

const ROTAS = PADROES.map((padrao) => ({ padrao }));

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
