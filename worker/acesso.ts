/**
 * Verificação do token do Cloudflare Access.
 *
 * O Access já barra quem não está na política antes de chegar aqui, mas o
 * Worker confere de novo: se um dia a rota for exposta por engano, a API não
 * fica aberta. Valida assinatura, público (aud) e validade do token.
 */

interface Chave {
  kid: string;
  chave: CryptoKey;
}

let cache: { chaves: Chave[]; ate: number } | null = null;

async function chavesDoTime(time: string): Promise<Chave[]> {
  if (cache && cache.ate > Date.now()) return cache.chaves;

  const r = await fetch(`https://${time}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`certs do Access: ${r.status}`);
  const { keys } = (await r.json()) as { keys: (JsonWebKey & { kid: string })[] };

  const chaves = await Promise.all(
    keys.map(async (jwk) => ({
      kid: jwk.kid,
      chave: await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      ),
    }))
  );
  cache = { chaves, ate: Date.now() + 60 * 60 * 1000 };
  return chaves;
}

const daBase64Url = (s: string): Uint8Array => {
  const b = atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "="));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};

/** Devolve o e-mail de quem está autenticado, ou lança. */
export async function emailAutenticado(
  pedido: Request,
  time: string,
  aud: string
): Promise<string> {
  const token =
    pedido.headers.get("Cf-Access-Jwt-Assertion") ??
    (pedido.headers.get("Cookie") ?? "").match(/CF_Authorization=([^;]+)/)?.[1];
  if (!token) throw new Error("sem token do Access");

  const [cabeca, corpo, assinatura] = token.split(".");
  if (!cabeca || !corpo || !assinatura) throw new Error("token malformado");

  const { kid } = JSON.parse(new TextDecoder().decode(daBase64Url(cabeca)));
  const chave = (await chavesDoTime(time)).find((k) => k.kid === kid);
  if (!chave) throw new Error("chave do token não reconhecida");

  const valido = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    chave.chave,
    daBase64Url(assinatura),
    new TextEncoder().encode(`${cabeca}.${corpo}`)
  );
  if (!valido) throw new Error("assinatura inválida");

  const carga = JSON.parse(new TextDecoder().decode(daBase64Url(corpo))) as {
    aud?: string | string[];
    exp?: number;
    email?: string;
  };

  const publicos = Array.isArray(carga.aud) ? carga.aud : [carga.aud];
  if (!publicos.includes(aud)) throw new Error("token de outra aplicação");
  if (!carga.exp || carga.exp * 1000 < Date.now()) throw new Error("token vencido");
  if (!carga.email) throw new Error("token sem e-mail");

  return carga.email;
}
