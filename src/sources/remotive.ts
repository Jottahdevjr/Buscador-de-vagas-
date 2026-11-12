
import type { Vaga } from "../types.js";

export async function buscarRemotive(): Promise<Vaga[]> {
  const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&search=junior");
  const dados = await res.json();

  return dados.jobs.map((item: any): Vaga => ({
    titulo: item.title,
     empresa:item.company_name,
    link:item.url,
    descricao:item.description,
    fonte:"Remotive",
    dataDePublicacao: new Date(item.publication_date),
    tags: item.tags,
    localizacao: item.candidate_required_location,
  }));
}
