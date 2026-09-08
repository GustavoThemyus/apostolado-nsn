import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/*
 * /api só existe dentro do Worker, e nem `vite dev` nem `vite preview` o
 * levantam. Sem este desvio o servidor de desenvolvimento devolvia o
 * index.html com status 200 para /api/agenda, por causa do fallback de página
 * única: o cliente achava que tinha dado certo, tentava ler JSON e culpava o
 * calendário do Google por um erro que era daqui.
 *
 * Para o /api funcionar em desenvolvimento, rodar em outro terminal:
 *
 *   npx wrangler@4.85.0 dev --port 8788 --local --compatibility-date 2026-05-01
 *
 * Sem ele, o desvio falha e o site diz que não falou com o servidor, que é a
 * verdade, em vez de acusar o calendário.
 */
const PONTE = {
  "/api": {
    target: "http://127.0.0.1:8788",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    cssTarget: "safari14",
  },
  server: {
    host: true,
    port: 5173,
    proxy: PONTE,
  },
  preview: {
    proxy: PONTE,
  },
});
