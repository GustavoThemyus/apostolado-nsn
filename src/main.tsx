import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tema.css";
import "./styles/base.css";

/**
 * O painel é carregado sob demanda: as suas 844 linhas e o admin.css não têm
 * por que viajar no pacote de quem só quer ler o guia no celular.
 */
const Admin = lazy(() => import("./admin/Admin").then((m) => ({ default: m.Admin })));

const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Elemento #raiz não encontrado em index.html");

const naAdministracao = window.location.pathname.replace(/\/+$/, "") === "/admin";

createRoot(raiz).render(
  <StrictMode>
    {naAdministracao ? (
      <Suspense fallback={<p className="admin__carregando">Carregando o painel…</p>}>
        <Admin />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
