# Calendário de Indulgências Arquidiocesano

`src/data/indulgencias-arquidiocese.json` não foi digitado à mão: é gerado do
PDF que o Perez mandou, transcrito em `dados.py`.

```
python3 ferramentas/arquidiocese/gerar.py
```

**Não edite o JSON direto, nem pelo painel**, enquanto este gerador existir:
corrija `dados.py` e rode de novo, senão a próxima remessa do Perez apaga o
conserto. São 129 igrejas e 49 notas; achar à mão o que divergiu não é
trabalho que se queira ter.

## O que o gerador faz que não é transcrever

- **Numera as notas.** No PDF a marca (§, ~, ^, *) vem com o texto ali mesmo,
  dentro da célula. Aqui ela vira chamada clicável, como no Enchiridion, e o
  texto vai para o mapa de notas do documento. Como a mesma marca aparece
  dezenas de vezes com textos diferentes, cada uma ganha um número: §1, §2,
  ~1. A exceção é o `^` sem texto próprio, que é um só, porque o que ele quer
  dizer está na legenda.
- **Constrói a consulta do mapa** com o nome da igreja e o endereço. O "Clique
  para conferir a localização" do PDF não tinha destino nenhum.
- **Liga as concessões ao Enchiridion**, que já está publicado com âncora em
  cada uma das 33. `conteudo.teste.ts` confere essas âncoras: concessão que
  mude de número derruba o teste em vez de virar link morto.

## O `^` que virou um só

A legenda do PDF traz duas linhas para o `^` — "Falta de consenso" e "Festas
propriamente particulares, usar-se-á a data que a paróquia comemora" — e as
distingue pela cor da marca na tabela, preta ou vermelha. O texto extraído do
PDF não carrega a cor, e adivinhar qual é qual em onze ocorrências seria
inventar. A nota genérica junta as duas, e a legenda da página mostra as duas
linhas como estão no original. **Se o Perez disser quais são quais, é só
separar em `^a` e `^b` aqui.**

## O que ficou de fora, e por quê

O Perez pediu que o clique desse a opção de abrir no Maps, no Waze ou no Uber.
O Uber não entrou: o elo universal dele só fixa o destino com latitude e
longitude, e nenhum endereço do documento traz coordenada. Botão que abre o
aplicativo sem destino promete o que não cumpre. No lugar dele há "copiar o
endereço", que serve para o Uber e para qualquer outro. Para ter os três seria
preciso geocodificar as 129 igrejas, e um alfinete no lugar errado manda o
fiel para a igreja errada — não é coisa de se fazer sem conferir uma a uma.
