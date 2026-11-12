import "dotenv/config";
import { ApifyClient } from "apify-client";
import type { Vaga, ModeloTrabalho } from "../types.js";

const TERMOS_BUSCA = [
  "desenvolvedor junior",
  "desenvolvedor júnior",
  "desenvolvedor full stack",
  "desenvolvedor fullstack",
  "desenvolvedor node",
  "desenvolvedor backend",
  "desenvolvedor frontend",
  "desenvolvedor javascript",
  "desenvolvedor typescript",
  "desenvolvedor web",
];

const ESTADOS = ["Rio de Janeiro"];

const normalizarModelo = (valor: unknown): ModeloTrabalho | undefined => {
  const texto = String(valor ?? "").toLowerCase();

  if (texto.includes("remote") || texto.includes("remoto")) return "remote";
  if (texto.includes("hybrid") || texto.includes("híbrido") || texto.includes("hibrido")) return "hybrid";
  if (texto.includes("on-site") || texto.includes("onsite") || texto.includes("presencial")) return "on-site";

  return undefined;
};

export const buscarGupy = async (): Promise<Vaga[]> => {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("Falta APIFY_TOKEN no arquivo .env");
  }

  const client = new ApifyClient({ token });

  const run = await client.actor("data_daemon/gupy-jobs-scraper").call({
    searchTerms: TERMOS_BUSCA,
    states: ESTADOS,
    postedWithinDays: 30,
    maxResultsPerSearch: 30,
    includeDescription: true,
  });

  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  console.log("Modelos encontrados:", [...new Set(items.map((i) => i.workplaceType))]);

  const vagas = new Map<string, Vaga>();

  for (const item of items) {
    if (!item.url || !item.title) continue;

    vagas.set(String(item.url), {
      titulo: String(item.title),
      empresa: String(item.company ?? ""),
      link: String(item.url),
      descricao: String(item.description ?? ""),
      fonte: "Gupy",
      localizacao: String(item.locationText ?? ""),
      modeloTrabalho: normalizarModelo(item.workplaceType),
    });
  }

  return [...vagas.values()];
};