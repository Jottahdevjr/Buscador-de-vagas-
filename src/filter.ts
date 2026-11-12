import type { Vaga, ModeloTrabalho } from "./types.js";

const TECNOLOGIAS: Record<string, string[]> = {
  "JavaScript": ["javascript", "js"],
  "TypeScript": ["typescript"],
  "Node.js": ["node", "nodejs"],
  "React": ["react", "reactjs"],
  "MongoDB": ["mongodb", "mongo"],
  "Express": ["express"],
  "API REST": ["api", "apis", "rest", "restful"],
  "Git": ["git", "github"],
  "Full Stack": ["full stack", "fullstack", "full-stack"],
};

const PALAVRAS_NEGATIVAS = [
  "senior", "sênior", "pleno", "lead", "staff",
  "principal", "especialista", "arquiteto", "coordenador", "manager",
];

const limparHtml = (texto: string): string =>
  texto.replace(/<[^>]*>/g, " ").toLowerCase();

const contem = (texto: string, palavra: string): boolean =>
  new RegExp(`(^|[^a-z0-9à-ú])${palavra}($|[^a-z0-9à-ú])`).test(texto);

export interface Analise {
  pontos: number;
  encontradas: string[];
}

export const analisar = (vaga: Vaga): Analise | null => {
  const titulo = vaga.titulo.toLowerCase();

  if (PALAVRAS_NEGATIVAS.some((palavra) => contem(titulo, palavra))) {
    return null;
  }

  const texto = `${titulo} ${limparHtml(vaga.descricao)} ${(vaga.tags ?? [])
    .join(" ")
    .toLowerCase()}`;

  const encontradas = Object.keys(TECNOLOGIAS).filter((nome) =>
    (TECNOLOGIAS[nome] ?? []).some((variante) => contem(texto, variante))
  );

  return { pontos: encontradas.length, encontradas };
};

export const filtrarPorModelo = (
  vagas: Vaga[],
  modelos: ModeloTrabalho[]
): Vaga[] => {
  if (modelos.length === 0) return vagas;

  return vagas.filter(
    (vaga) => vaga.modeloTrabalho && modelos.includes(vaga.modeloTrabalho)
  );
};