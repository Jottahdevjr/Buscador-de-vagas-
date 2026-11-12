export type ModeloTrabalho = "remote" | "hybrid" | "on-site";

export interface Vaga {
  titulo: string;
  empresa: string;
  link: string;
  descricao: string;
  fonte: string;
  dataPublicacao?: Date | undefined;
  tags?: string[] | undefined;
  localizacao?: string | undefined;
  modeloTrabalho?: ModeloTrabalho | undefined;
}