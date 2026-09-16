"""
Gera os retratos da lateral: o Papa e o Arcebispo.

    python3 gerar.py <foto do papa> <foto do arcebispo>

Escreve em public/retratos/ com a impressão do conteúdo no nome, como as
estampas dos padroeiros: o cache é de um ano, e trocar a imagem tem de trocar
o nome. Depois, atualizar os caminhos em src/data/site.json.

Sem numpy, que não está instalado aqui: tudo com Pillow.
"""
import hashlib, io, math, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(os.path.dirname(os.path.dirname(AQUI)), "public", "retratos")
PROPORCAO = 3 / 4


def recorte_3x4(im, ancora_y=0.5, ancora_x=0.5):
    """O maior 3:4 que cabe, com a sobra tirada segundo a âncora (0 = topo)."""
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


# ---------------------------------------------------------------- o Papa
def papa(origem):
    """
    A foto oficial vem num cartão: margem branca e a assinatura embaixo. Tira
    os dois. A borda da foto se acha pelo papel: a linha ou coluna em que mais
    da metade dos pixels passa de 240 nos três canais é cartão, não foto. Na
    foto de 8 de maio de 2025 isso dá as linhas 48 a 1245 e as colunas 71 a
    936; a assinatura, que é traço fino, não chega a meia linha.
    """
    im = Image.open(origem).convert("RGB")
    w, h = im.size
    px = im.load()
    papel = lambda x, y: min(px[x, y]) > 240
    linhas = [y for y in range(h) if sum(papel(x, y) for x in range(0, w, 2)) < w / 4]
    colunas = [x for x in range(w) if sum(papel(x, y) for y in range(0, h, 2)) < h / 4]
    # o primeiro bloco contínuo de linhas é a foto; o que vem depois é assinatura
    fim = linhas[0]
    for y in linhas[1:]:
        if y - fim > 1:
            break
        fim = y
    # 2px para dentro: a borda da foto é meio pixel de cartão
    foto = im.crop((colunas[0] + 2, linhas[0] + 2, colunas[-1] - 1, fim - 1))
    # a sobra sai quase toda de baixo: em cima está o solidéu
    foto = recorte_3x4(foto, ancora_y=0.15)
    foto = foto.resize((480, 640), Image.LANCZOS)
    # o mesmo ajuste de nitidez das estampas dos padroeiros
    foto = foto.filter(ImageFilter.UnsharpMask(radius=0.8, percent=80, threshold=2))
    return salvar(foto, "papa")


# ------------------------------------------------------------ o Arcebispo
def arcebispo(origem):
    """
    Foto de estúdio em fundo branco — quase metade do quadro é papel — com um
    pedestal branco embaixo, à esquerda. A vinheta escurece só o fundo: sobre
    a foto inteira ela escureceria também as mãos e a faixa, que encostam na
    borda.

    O fundo é o branco (claro e sem cor) ligado à borda do quadro. Ligado à
    borda, e não qualquer branco: o colarinho e o cabelo também são claros, e
    ficam de fora porque estão cercados pela batina.
    """
    im = Image.open(origem).convert("RGB")
    im = recorte_3x4(im)
    w, h = im.size

    luz = im.convert("L")
    saturacao = im.convert("HSV").split()[1]
    borda = ([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
             + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])

    def inundar(corte, faixa_y=0, cor_max=40):
        """O que é claro, sem cor e ligado à borda — da faixa_y para baixo."""
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

    # A transição entre a batina e o branco tem pixels cinza, abaixo do corte.
    # Sem pegá-los, sobra um halo claro em volta da figura contra o fundo que
    # escureceu. Então: alarga a região um pouco e pesa cada pixel pelo quanto
    # ele é claro, de 150 (nada) a 225 (tudo).
    fundo = inundar(225).filter(ImageFilter.MaxFilter(5))
    alfa = ImageChops.multiply(fundo, rampa(150, 225))

    # O pedestal. A face da frente dele é cinza-claro, perto de 205, abaixo do
    # corte do fundo: na primeira passada só o tampo escurecia, e o bloco
    # ficava branco contra o fundo já escuro — era ele o "pano branco" que
    # mais aparecia. Baixar o corte na foto inteira pegaria o cabelo grisalho,
    # que encosta no fundo; então é uma segunda inundação, só no quinto de
    # baixo do quadro, onde não há cabelo.
    #
    # O corte é baixo, 115, por causa da sombra das mãos sobre o tampo: ela
    # vai de 135 a 176, e com corte de 185 ficava para trás como uma mancha
    # clara de contorno recortado no meio do bloco escurecido. As mãos ficam
    # de fora pela cor: a pele tem saturação de 60 a 98, e a sombra no tampo,
    # de 9 a 44.
    pedestal = inundar(115, faixa_y=round(h * 0.8), cor_max=50).filter(ImageFilter.MaxFilter(3))
    alfa = ImageChops.lighter(alfa, ImageChops.multiply(pedestal, rampa(70, 140)))
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.8))

    # A vinheta: clara no rosto, escura nos cantos, num tom quente de estúdio.
    centro = (w * 0.5, h * 0.3)
    raio = math.hypot(w * 0.55, h * 0.66)
    # A primeira versão, de (236, 231, 222) a (58, 53, 46) a partir de um
    # quarto do raio, ainda lia como fundo claro: ao lado da foto do Papa, que
    # é uma igreja escura, parecia outro tipo de retrato. O centro também
    # desce um pouco, para não ofuscar ao lado dela.
    claro_rgb, escuro_rgb = (224, 218, 207), (34, 31, 27)
    vinheta = Image.new("RGB", (w, h))
    vp = vinheta.load()
    for y in range(h):
        for x in range(w):
            d = min(1.0, math.hypot(x - centro[0], y - centro[1]) / raio)
            t = max(0.0, (d - 0.12) / 0.88)
            t = t * t * (3 - 2 * t)                      # suave nas duas pontas
            # um grão de ruído, para o degradê não virar degraus no WebP
            g = ((x * 73856093) ^ (y * 19349663)) % 7 - 3
            vp[x, y] = tuple(max(0, min(255, round(a + (b - a) * t) + g))
                             for a, b in zip(claro_rgb, escuro_rgb))

    # multiplica sobre o original: o pedestal guarda a sombra que tinha
    novo_fundo = ImageChops.multiply(vinheta, im)
    return salvar(Image.composite(novo_fundo, im, alfa), "arcebispo")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    os.makedirs(SAIDA, exist_ok=True)
    papa(sys.argv[1])
    arcebispo(sys.argv[2])
