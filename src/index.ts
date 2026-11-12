import { buscarGupy } from "./sources/gupy.js";
import { analisar, filtrarPorModelo } from "./filter.js";
import type { ModeloTrabalho } from "./types.js";

const MODELOS: ModeloTrabalho[] = ["remote", "hybrid"];
const MINIMO_PONTOS = 1;

const main = async () => {
  const todas = await buscarGupy();
  const semDescricao = todas.filter((v) => v.descricao === "").length;
  const vagas = filtrarPorModelo(todas, MODELOS);

  const ranqueadas = vagas
    .flatMap((vaga) => {
      const analise = analisar(vaga);
      return analise && analise.pontos >= MINIMO_PONTOS
        ? [{ vaga, ...analise }]
        : [];
    })
    .sort((a, b) => b.pontos - a.pontos);

  console.log(
    `\n${ranqueadas.length} vagas combinam (buscadas: ${todas.length}, sem descrição: ${semDescricao})\n`
  );

  for (const { vaga, pontos, encontradas } of ranqueadas) {
    console.log(`[${pontos}] ${vaga.titulo} - ${vaga.empresa} (${vaga.modeloTrabalho})`);
    console.log(`  Tecnologias: ${encontradas.join(", ")}`);
    console.log(`  ${vaga.link}\n`);
  }
};

main();