/**
 * O endereço antigo do site, que só leva ao novo.
 *
 * Até outubro de 2026 o site morou em apostolado-nsn.gustavothemyus.workers.dev,
 * na conta pessoal. Hoje mora em ansn.com.br, na conta do Apostolado. O
 * endereço velho não pode simplesmente morrer: ele está **impresso na página 2
 * do PDF do calendário arquidiocesano** que o Perez distribui, e circula em
 * conversas de WhatsApp de meses atrás.
 *
 * Então o Worker daquela conta deixa de servir o site e passa a ser isto: um
 * redirecionamento permanente que preserva o caminho e a busca, para que um
 * link para uma página funda continue caindo na página funda certa.
 */
const CASA = "https://ansn.com.br";

export default {
  fetch(pedido: Request): Response {
    const velho = new URL(pedido.url);
    const novo = new URL(velho.pathname + velho.search, CASA);
    /*
     * 301 porque a mudança é definitiva. O navegador guarda, e quem clicar de
     * novo no link do PDF nem passa por aqui na segunda vez.
     */
    return Response.redirect(novo.toString(), 301);
  },
};
