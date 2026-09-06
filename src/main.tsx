import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Admin } from "./admin/Admin";
import App from "./App";
import "./styles/tema.css";
import "./styles/base.css";

const raiz = document.getElementById("raiz");
if (!raiz) throw new Error("Elemento #raiz não encontrado em index.html");

const naAdministracao = window.location.pathname.replace(/\/+$/, "") === "/admin";

createRoot(raiz).render(
  <StrictMode>{naAdministracao ? <Admin /> : <App />}</StrictMode>
);
