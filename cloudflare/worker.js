// API inicial do Meu Arquiteto IA. Sem publicação até a integração ser validada.
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ service: "meu-arquiteto-ia", status: "ok", ai_binding: !!env.AI });
    }
    if (request.method === "GET" && url.pathname === "/api/capabilities") {
      return json({ photo_editing: false, floorplan: false, manual_painting: true,
        message: "Edição por IA ainda não configurada. Nenhuma imagem será devolvida como se tivesse sido editada." });
    }
    if (url.pathname === "/api/edit") {
      return json({ error: "Edição real por IA ainda não habilitada. Aguardando seleção e teste de modelo compatível." }, 501);
    }
    return json({ service: "meu-arquiteto-ia", endpoints: ["/health", "/api/capabilities"] });
  }
};
