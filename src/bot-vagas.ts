import express from "express";
import { lerCache } from "./cache.js";
import { analisar, filtrarPorModelo } from "./filter.js";
import type { ModeloTrabalho } from "./types.js";

const MODELOS_VALIDOS: string[] = ["remote", "hybrid", "on-site"];

const app = express();
app.use(express.static("public"));

app.get("/api/vagas", async (req, res) => {
  const modelos = String(req.query.modelos ?? "")
    .split(",")
    .filter((m): m is ModeloTrabalho => MODELOS_VALIDOS.includes(m));

  const minimoLido = Number(req.query.minimo ?? 1);
  const minimo = Number.isNaN(minimoLido) ? 1 : minimoLido;
  const busca = String(req.query.q ?? "").toLowerCase().trim();

  const cache = await lerCache();
  const vagas = filtrarPorModelo(cache.vagas, modelos);

  const resultado = vagas
    .flatMap((vaga) => {
      const analise = analisar(vaga);
      if (!analise || analise.pontos < minimo) return [];

      const texto = `${vaga.titulo} ${vaga.empresa} ${vaga.descricao}`.toLowerCase();
      if (busca && !texto.includes(busca)) return [];

      return [
        {
          titulo: vaga.titulo,
          empresa: vaga.empresa,
          link: vaga.link,
          localizacao: vaga.localizacao ?? "",
          modeloTrabalho: vaga.modeloTrabalho ?? null,
          fonte: vaga.fonte,
          pontos: analise.pontos,
          tecnologias: analise.encontradas,
        },
      ];
    })
    .sort((a, b) => b.pontos - a.pontos);

  res.json({
    atualizadoEm: cache.atualizadoEm,
    total: resultado.length,
    vagas: resultado,
  });
});

app.listen(3000, () => {
  console.log("Buscador em http://localhost:3000");
});