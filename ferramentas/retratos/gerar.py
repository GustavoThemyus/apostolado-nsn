"""
    python3 gerar.py <foto do papa> <foto do arcebispo>
"""
import hashlib, io, math, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(os.path.dirname(os.path.dirname(AQUI)), "public", "retratos")
PROPORCAO = 3 / 4


def recorte_3x4(im, ancora_y=0.5, ancora_x=0.5):
    w, h = im.size
    if w / h > PROPORCAO:
        nw = round(h * PROPORCAO)
        x = round((w - nw) * ancora_x)
        return im.crop((x, 0, x + nw, h))
    nh = round(w / PROPORCAO)
    y = round((h - nh) * ancora_y)
    return im.crop((0, y, w, y + nh))


def salvar(im, nome):
    dados = io.BytesIO()
    im.save(dados, "WEBP", quality=80, method=6)
    impressao = hashlib.sha256(dados.getvalue()).hexdigest()[:8]
    caminho = os.path.join(SAIDA, f"{nome}-{impressao}.webp")
    with open(caminho, "wb") as f:
        f.write(dados.getvalue())
    print(f"{caminho}  {im.size[0]}x{im.size[1]}  {len(dados.getvalue()) // 1024} KB")
    return caminho


def papa(origem):
    im = Image.open(origem).convert("RGB")
    w, h = im.size
    px = im.load()
    papel = lambda x, y: min(px[x, y]) > 240
    linhas = [y for y in range(h) if sum(papel(x, y) for x in range(0, w, 2)) < w / 4]
    colunas = [x for x in range(w) if sum(papel(x, y) for y in range(0, h, 2)) < h / 4]
    fim = linhas[0]
    for y in linhas[1:]:
        if y - fim > 1:
            break
        fim = y
    foto = im.crop((colunas[0] + 2, linhas[0] + 2, colunas[-1] - 1, fim - 1))
    foto = recorte_3x4(foto, ancora_y=0.15)
    foto = foto.resize((480, 640), Image.LANCZOS)
    foto = foto.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=2))
    return salvar(foto, "papa")


def arcebispo(origem):
    im = Image.open(origem).convert("RGB")
    im = recorte_3x4(im)
    w, h = im.size

    luz = im.convert("L")
    saturacao = im.convert("HSV").split()[1]
    borda = ([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
             + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])

    def inundar(corte, faixa_y=0, cor_max=40):
        claro = luz.point(lambda v: 255 if v > corte else 0)
        sem_cor = saturacao.point(lambda v: 255 if v < cor_max else 0)
        marcado = ImageChops.multiply(claro, sem_cor)
        if faixa_y:
            ImageDraw.Draw(marcado).rectangle((0, 0, w, faixa_y), fill=0)
        for xy in borda:
            if marcado.getpixel(xy) == 255:
                ImageDraw.floodfill(marcado, xy, 128)
        return marcado.point(lambda v: 255 if v == 128 else 0)

    def rampa(de, ate):
        return luz.point(lambda v: 0 if v <= de else 255 if v >= ate
                         else round((v - de) / (ate - de) * 255))

    fundo = inundar(225).filter(ImageFilter.MaxFilter(5))
    alfa = ImageChops.multiply(fundo, rampa(150, 225))

    pedestal = inundar(115, faixa_y=round(h * 0.8), cor_max=50).filter(ImageFilter.MaxFilter(3))
    alfa = ImageChops.lighter(alfa, ImageChops.multiply(pedestal, rampa(70, 140)))
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.8))

    centro = (w * 0.5, h * 0.3)
    raio = math.hypot(w * 0.55, h * 0.66)
    claro_rgb, escuro_rgb = (224, 218, 207), (34, 31, 27)
    vinheta = Image.new("RGB", (w, h))
    vp = vinheta.load()
    for y in range(h):
        for x in range(w):
            d = min(1.0, math.hypot(x - centro[0], y - centro[1]) / raio)
            t = max(0.0, (d - 0.12) / 0.88)
            t = t * t * (3 - 2 * t)
            g = ((x * 73856093) ^ (y * 19349663)) % 7 - 3
            vp[x, y] = tuple(max(0, min(255, round(a + (b - a) * t) + g))
                             for a, b in zip(claro_rgb, escuro_rgb))

    novo_fundo = ImageChops.multiply(vinheta, im)
    return salvar(Image.composite(novo_fundo, im, alfa), "arcebispo")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    os.makedirs(SAIDA, exist_ok=True)
    papa(sys.argv[1])
    arcebispo(sys.argv[2])
