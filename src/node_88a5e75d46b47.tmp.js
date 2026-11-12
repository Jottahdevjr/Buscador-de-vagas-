import { buscarGupy } from "./sources/gupy.js";
import { buscarRemotive } from "./sources/remotive.js";
import { salvarCache } from "./cache.js";
import type { Vaga } from "./types.js";

const main = async () => {
  const resultados = await Promise.allSettled([buscarGupy(), buscarRemotive()]);
  const vagas: Vaga[] = [];

  for (const resultado of resultados) {
    if (resultado.status === "fulfilled") {
      vagas.push(...resultado.value);
    } else {
      console.error("Uma fonte falhou:", resultado.reason);
    }
  }

  await salvarCache(vagas);
  console.log(`Salvas ${vagas.length} vagas em data/vagas.json`);
};

main();