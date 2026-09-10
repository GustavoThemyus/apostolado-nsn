/**
 * Cliente mínimo do DevTools Protocol, para medir o site num navegador de
 * verdade.
 *
 * Existe porque o Node 20 não traz `WebSocket` global e porque este projeto
 * não aceita dependência sem motivo: um puppeteer inteiro para ler a posição
 * de um elemento não se paga.
 *
 * Uso, com o `vite preview` e um Chrome de depuração no ar:
 *
 *   npx vite preview --port 4173 --strictPort &
 *   google-chrome --headless=new --remote-debugging-port=9222 about:blank &
 *   node ferramentas/meu-teste.mjs
 *
 * E no teste:
 *
 *   import { abrir } from "./cdp.mjs";
 *   const { chamar, ver, tela } = await abrir();
 *
 * Uma lição que este arquivo já cobrou caro: para saber por que um estilo não
 * pega, `getComputedStyle` mente. Quem responde é `CSS.getMatchedStylesForNode`
 * e, em último caso, ler os pixels da captura.
 */
import net from "node:net";
import crypto from "node:crypto";
import fs from "node:fs";

export function conectar(url) {
  const u = new URL(url);
  return new Promise((ok, falhar) => {
    const chave = crypto.randomBytes(16).toString("base64");
    const soquete = net.connect(Number(u.port), u.hostname, () => {
      soquete.write(
        `GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\n` +
          "Upgrade: websocket\r\nConnection: Upgrade\r\n" +
          `Sec-WebSocket-Key: ${chave}\r\nSec-WebSocket-Version: 13\r\n\r\n`,
      );
    });
    let sobra = Buffer.alloc(0);
    let apertado = false;
    let proximo = 0;
    const pendentes = new Map();
    const ouvintes = new Map();

    const enviar = (texto) => {
      const carga = Buffer.from(texto);
      const mascara = crypto.randomBytes(4);
      let cabeca;
      if (carga.length < 126) cabeca = Buffer.from([0x81, 0x80 | carga.length]);
      else if (carga.length < 65536) {
        cabeca = Buffer.alloc(4);
        cabeca[0] = 0x81;
        cabeca[1] = 0x80 | 126;
        cabeca.writeUInt16BE(carga.length, 2);
      } else {
        cabeca = Buffer.alloc(10);
        cabeca[0] = 0x81;
        cabeca[1] = 0x80 | 127;
        cabeca.writeBigUInt64BE(BigInt(carga.length), 2);
      }
      const corpo = Buffer.from(carga);
      for (let i = 0; i < corpo.length; i++) corpo[i] ^= mascara[i % 4];
      soquete.write(Buffer.concat([cabeca, mascara, corpo]));
    };

    soquete.on("data", (pedaco) => {
      sobra = Buffer.concat([sobra, pedaco]);
      if (!apertado) {
        const fim = sobra.indexOf("\r\n\r\n");
        if (fim === -1) return;
        apertado = true;
        sobra = sobra.subarray(fim + 4);
        ok({ chamar, ao, fechar: () => soquete.destroy() });
      }
      for (;;) {
        if (sobra.length < 2) return;
        const t1 = sobra[1] & 0x7f;
        let inicio = 2;
        let tamanho = t1;
        if (t1 === 126) {
          if (sobra.length < 4) return;
          tamanho = sobra.readUInt16BE(2);
          inicio = 4;
        } else if (t1 === 127) {
          if (sobra.length < 10) return;
          tamanho = Number(sobra.readBigUInt64BE(2));
          inicio = 10;
        }
        if (sobra.length < inicio + tamanho) return;
        const texto = sobra.subarray(inicio, inicio + tamanho).toString();
        sobra = sobra.subarray(inicio + tamanho);
        try {
          const msg = JSON.parse(texto);
          if (msg.method) {
            const f = ouvintes.get(msg.method);
            if (f) f(msg.params);
            continue;
          }
          const p = pendentes.get(msg.id);
          if (p) {
            pendentes.delete(msg.id);
            msg.error ? p.falhar(new Error(JSON.stringify(msg.error))) : p.ok(msg.result);
          }
        } catch {
          /* quadro que não é JSON não interessa aqui */
        }
      }
    });

    soquete.on("error", falhar);
    const ao = (evento, f) => ouvintes.set(evento, f);
    function chamar(metodo, params = {}) {
      proximo += 1;
      const id = proximo;
      return new Promise((ok2, falhar2) => {
        pendentes.set(id, { ok: ok2, falhar: falhar2 });
        enviar(JSON.stringify({ id, method: metodo, params }));
      });
    }
  });
}

/** Conecta na primeira aba e devolve os atalhos que todo teste daqui usa. */
export async function abrir(porta = 9222) {
  const abas = await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json();
  const aba = abas.find((a) => a.type === "page");
  if (!aba) throw new Error("nenhuma aba aberta no Chrome de depuração");
  const { chamar, ao, fechar } = await conectar(aba.webSocketDebuggerUrl);
  await chamar("Page.enable");
  await chamar("DOM.enable");
  await chamar("CSS.enable");

  /** Roda a expressão na página e devolve o JSON que ela produzir. */
  const ver = async (expressao) =>
    JSON.parse(
      (await chamar("Runtime.evaluate", { expression: expressao, returnByValue: true }))
        .result.value,
    );

  const medidas = (largura, altura, densidade = 1) =>
    chamar("Emulation.setDeviceMetricsOverride", {
      width: largura,
      height: altura,
      deviceScaleFactor: densidade,
      mobile: densidade > 1,
    });

  const ir = async (caminho, espera = 2600) => {
    await chamar("Page.navigate", { url: `http://localhost:4173${caminho}` });
    await new Promise((r) => setTimeout(r, espera));
  };

  const tela = async (arquivo) => {
    const f = await chamar("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(arquivo, Buffer.from(f.data, "base64"));
  };

  return { chamar, ao, fechar, ver, medidas, ir, tela };
}
