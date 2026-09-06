import bruto from "./guia.json";
import type { Guia } from "./tipos";

/**
 * O conteúdo do guia vive em guia.json, e não mais em módulos TypeScript.
 * Isso é o que permite editá-lo pelo painel sem tocar em código: o painel lê
 * e grava esse mesmo arquivo, e cada bloco tem identificador próprio para ser
 * alterado sem reescrever o resto.
 */
export const guia = bruto as unknown as Guia;
