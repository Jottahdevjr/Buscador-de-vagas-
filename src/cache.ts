import { readFile, writeFile, mkdir } from "node:fs/promises";
import type { Vaga } from "./types.js";

const ARQUIVO = "data/vagas.json";

export interface Cache {
  atualizadoEm: string;
  vagas: Vaga[];
}

export const salvarCache = async (vagas: Vaga[]): Promise<void> => {
  await mkdir("data", { recursive: true });
  const cache: Cache = { atualizadoEm: new Date().toISOString(), vagas };
  await writeFile(ARQUIVO, JSON.stringify(cache, null, 2), "utf-8");
};

export const lerCache = async (): Promise<Cache> => {
  try {
    const texto = await readFile(ARQUIVO, "utf-8");
    return JSON.parse(texto) as Cache;
  } catch {
    return { atualizadoEm: "", vagas: [] };
  }
};