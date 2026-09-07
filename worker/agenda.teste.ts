/**
 * Suíte do leitor de iCal. Roda junto com `npm test`.
 *
 * O que importa aqui é o desdobramento de linha e a detecção do calendário
 * partilhado sem detalhes: as duas coisas que, erradas, fazem o site mostrar
 * lixo em cima do calendário litúrgico em vez de nada.
 */

import { lerIcal, semDetalhes } from "./agenda";

let passaram = 0;
const falhas: string[] = [];

const conferir = (rotulo: string, obtido: unknown, esperado: unknown) => {
  if (JSON.stringify(obtido) === JSON.stringify(esperado)) passaram += 1;
  else falhas.push(`${rotulo}: ${JSON.stringify(obtido)} != ${JSON.stringify(esperado)}`);
};

const ics = (corpo: string) =>
  ["BEGIN:VCALENDAR", "VERSION:2.0", corpo, "END:VCALENDAR"].join("\r\n");

// --- o caso simples ---------------------------------------------------------
conferir(
  "evento de dia inteiro",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT",
        "DTSTART;VALUE=DATE:20260805",
        "DTEND;VALUE=DATE:20260806",
        "SUMMARY:Nossa Senhora das Neves",
        "END:VEVENT",
      ].join("\r\n")
    )
  ),
  [{ data: "2026-08-05", titulo: "Nossa Senhora das Neves" }]
);

conferir(
  "evento com hora vira o dia dele",
  lerIcal(
    ics(
      ["BEGIN:VEVENT", "DTSTART;TZID=America/Sao_Paulo:20260805T190000",
       "SUMMARY:Missa cantada", "END:VEVENT"].join("\r\n")
    )
  ),
  [{ data: "2026-08-05", titulo: "Missa cantada" }]
);

// --- desdobramento: o iCal quebra em 75 octetos e continua com espaço -------
conferir(
  "linha continuada",
  lerIcal(
    ics(
      ["BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260613",
       "SUMMARY:Santo Antônio de Pádua\\, confessor e doutor da Igre", " ja",
       "END:VEVENT"].join("\r\n")
    )
  ),
  [{ data: "2026-06-13", titulo: "Santo Antônio de Pádua, confessor e doutor da Igreja" }]
);

conferir(
  "descrição com quebra escapada",
  lerIcal(
    ics(
      ["BEGIN:VEVENT", "DTSTART;VALUE=DATE:20261102",
       "SUMMARY:Finados", "DESCRIPTION:Visita ao cemitério.\\nIndulgência plenária.",
       "END:VEVENT"].join("\r\n")
    )
  ),
  [{ data: "2026-11-02", titulo: "Finados",
     descricao: "Visita ao cemitério. Indulgência plenária." }]
);

// --- o que tem de ser descartado -------------------------------------------
conferir(
  "evento sem título é descartado",
  lerIcal(ics(["BEGIN:VEVENT", "DTSTART;VALUE=DATE:20260805", "END:VEVENT"].join("\r\n"))),
  []
);
conferir(
  "evento sem data é descartado",
  lerIcal(ics(["BEGIN:VEVENT", "SUMMARY:Sem data", "END:VEVENT"].join("\r\n"))),
  []
);
conferir("calendário vazio", lerIcal(ics("")), []);
conferir(
  "linhas fora de VEVENT não viram evento",
  lerIcal(ics("X-WR-CALNAME:Ordo\r\nSUMMARY:isto não é um evento")),
  []
);

// --- ordem ------------------------------------------------------------------
conferir(
  "sai em ordem de data",
  lerIcal(
    ics(
      [
        "BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20261102\r\nSUMMARY:Finados\r\nEND:VEVENT",
        "BEGIN:VEVENT\r\nDTSTART;VALUE=DATE:20260805\r\nSUMMARY:Neves\r\nEND:VEVENT",
      ].join("\r\n")
    )
  ).map((i) => i.data),
  ["2026-08-05", "2026-11-02"]
);

// --- partilha sem detalhes --------------------------------------------------
const ocupado = [
  { data: "2026-07-16", titulo: "Busy" },
  { data: "2026-07-20", titulo: "Busy" },
];
conferir("só Busy é calendário sem detalhes", semDetalhes(ocupado), true);
conferir(
  "um título de verdade já basta",
  semDetalhes([...ocupado, { data: "2026-08-05", titulo: "Neves" }]),
  false
);
conferir("vazio não é sem detalhes", semDetalhes([]), false);

const total = passaram + falhas.length;
console.log(`\nleitura de iCal: ${passaram}/${total}`);
if (falhas.length > 0) {
  for (const f of falhas) console.log(`  ${f}`);
  process.exit(1);
}
