const form = document.querySelector("#filtros");
const lista = document.querySelector("#lista");
const statusEl = document.querySelector("#status");

const ROTULOS = { remote: "Remoto", hybrid: "Híbrido", "on-site": "Presencial" };

const criar = (tag, texto, classe) => {
  const el = document.createElement(tag);
  el.textContent = texto;
  if (classe) el.className = classe;
  return el;
};

const buscar = async () => {
  const dados = new FormData(form);
  const params = new URLSearchParams({
    q: dados.get("q") ?? "",
    modelos: dados.getAll("modelos").join(","),
    minimo: dados.get("minimo") ?? "1",
  });

  statusEl.textContent = "Buscando...";
  const res = await fetch(`/api/vagas?${params}`);
  if (!res.ok) {
    statusEl.textContent = "Erro ao buscar vagas.";
    return;
  }
  const resultado = await res.json();

  lista.replaceChildren();

  if (!resultado.atualizadoEm) {
    statusEl.textContent = "Ainda não há vagas salvas. Rode: npx tsx src/atualizar.ts";
    return;
  }

  const quando = new Date(resultado.atualizadoEm).toLocaleString("pt-BR");
  statusEl.textContent = `${resultado.total} vagas (atualizado em ${quando})`;

  for (const vaga of resultado.vagas) {
    const card = document.createElement("article");
    card.className = "card";

    card.append(criar("h2", vaga.titulo));
    card.append(
      criar("p", `${vaga.empresa} · ${vaga.localizacao || "Local não informado"} · ${ROTULOS[vaga.modeloTrabalho] ?? "Modelo não informado"}`)
    );

    const tags = document.createElement("p");
    for (const tech of vaga.tecnologias) {
      tags.append(criar("span", tech, "tag"));
    }
    card.append(tags);

    if (/^https?:\/\//.test(vaga.link)) {
      const link = criar("a", "Ver vaga e candidatar-se");
      link.href = vaga.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.append(link);
    }

    lista.append(card);
  }
};

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  buscar();
});

buscar();