import "dotenv/config";
import { ApifyClient } from "apify-client";
import type { Vaga, ModeloTrabalho } from "../types.js";

const TERMOS_BUSCA = [
  "desenvolvedor",
  "junior",
];

//const LOCALIZACAO = "Rio de Janeiro, RJ";

const normalizarModelo = (valor: unknown): ModeloTrabalho | undefined => {
  const texto = String(valor ?? "").toLowerCase();

  if (texto.includes("remote") || texto.includes("remoto")) return "remote";
  if (texto.includes("hybrid") || texto.includes("híbrido") || texto.includes("hibrido")) return "hybrid";
  if (texto.includes("on-site") || texto.includes("onsite") || texto.includes("presencial")) return "on-site";

  return undefined;
};

export const buscarVagasIndeed = async (): Promise<Vaga[]> => {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("Falta APIFY_TOKEN no arquivo .env");
  }

  const client = new ApifyClient({ token });
  const vagas = new Map<string, Vaga>(); // Criado FORA do loop para acumular todas as vagas

  for (const termo of TERMOS_BUSCA) {
    try {
      console.log(`[Indeed] Buscando por: "${termo}"...`);
      
      const run = await client.actor("mojob/indeed-scraper").call({
        searchTerm: termo,
        //location: LOCALIZACAO,
        country: "BR",
        postedWithinDays: 30,
        maxResultsPerSearch: 15,
        includeDescription: true,
      });

      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      console.log(`[Indeed] Total de itens brutos para "${termo}": ${items.length}`);

      for (const item of items as any[]) {
        const link = item.url || item.jobUrl || item.externalApplyLink;
        const titulo = item.title || item.positionName;

        if (!link || !titulo) continue;

        vagas.set(String(link), {
          titulo: String(titulo),
          empresa: String(item.company || item.companyName || ""),
          link: String(link),
          descricao: String(item.description || item.descriptionText || ""),
          fonte: "Indeed",
          localizacao: String(item.location || item.locationText || ""),
          modeloTrabalho: normalizarModelo(item.workplaceType || item.jobType || titulo),
        });
      }
    } catch (erro) {
      console.error(`[Indeed] Erro ao buscar o termo "${termo}":`, erro);
    }
  }

  console.log(`[Indeed] Total acumulado de vagas únicas: ${vagas.size}`);
  return [...vagas.values()]; // Retorna FORA do loop, após coletar tudo
};