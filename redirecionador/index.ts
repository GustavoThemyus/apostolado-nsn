const CASA = "https://ansn.com.br";

export default {
  fetch(pedido: Request): Response {
    const velho = new URL(pedido.url);
    const novo = new URL(velho.pathname + velho.search, CASA);
    return Response.redirect(novo.toString(), 301);
  },
};
