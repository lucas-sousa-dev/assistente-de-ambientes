// Meu Arquiteto IA — API de edição de fotografias (beta).
const MODEL = "@cf/black-forest-labs/flux-2-klein-9b";
const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "Content-Type",
};
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { ...cors, "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method === "GET" && url.pathname === "/health")
      return json({ service: "meu-arquiteto-ia", status: "ok", ai_binding: !!env.AI });
    if (request.method === "GET" && url.pathname === "/api/capabilities")
      return json({ photo_editing: env.EDIT_ENABLED === "true" && !!env.AI,
        floorplan: false, manual_painting: true, model: MODEL,
        message: "Edição experimental: a IA pode modificar regiões além das solicitadas. Selecione a área manualmente nas próximas versões." });
    if (url.pathname !== "/api/edit") return json({ service: "meu-arquiteto-ia", endpoints: ["/health", "/api/capabilities", "/api/edit"] });
    if (request.method !== "POST") return json({ error: "Use POST com multipart/form-data." }, 405);
    // Bloqueado por padrão: geração consome créditos. Ative EDIT_ENABLED=true
    // somente após definir proteção contra abuso e orçamento na Cloudflare.
    if (env.EDIT_ENABLED !== "true") return json({ error: "Edição por IA ainda não ativada para uso público. Falta configurar controle de acesso e custos." }, 503);
    if (!env.AI) return json({ error: "Binding AI não configurado." }, 503);
    // Autorização obrigatória para testes: nunca incluir esta chave no frontend público.
    // Configure EDIT_TEST_TOKEN como Secret no painel da Cloudflare.
    if (!env.EDIT_TEST_TOKEN || String(env.EDIT_TEST_TOKEN).length < 32)
      return json({ error: "Chave privada de teste não configurada." }, 503);
    const provided = request.headers.get("Authorization") || "";
    if (provided !== "Bearer " + env.EDIT_TEST_TOKEN)
      return json({ error: "Acesso não autorizado para edição de imagens." }, 401);
    // Limite por requisição. Para limite global por usuário, adicionar rate limiter persistente.

    if (!(request.headers.get("content-type") || "").includes("multipart/form-data"))
      return json({ error: "Envie uma foto e a instrução usando multipart/form-data." }, 415);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 5_000_000) return json({ error: "Arquivo muito grande (máximo 5 MB)." }, 413);
    try {
      const input = await request.formData();
      const photo = input.get("image");
      const instruction = String(input.get("prompt") || "").trim();
      if (!(photo instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(photo.type))
        return json({ error: "Escolha uma foto JPG, PNG ou WebP." }, 400);
      if (photo.size > 4_000_000 || photo.size < 100) return json({ error: "Foto inválida ou acima de 4 MB." }, 413);
      if (!instruction || instruction.length > 1000) return json({ error: "Descreva a alteração em até 1000 caracteres." }, 400);
      const form = new FormData();
      form.append("input_image_0", photo, photo.name || "ambiente.jpg");
      form.append("prompt", "Edit the provided room photograph following this user instruction in Brazilian Portuguese: " +
        instruction + ". Keep the same camera angle, architecture, furniture, objects, lighting and layout except for what the instruction explicitly requests. Photorealistic interior photograph, not an illustration.");
      const encoded = new Response(form);
      const output = await env.AI.run(MODEL, { multipart: { body: encoded.body, contentType: encoded.headers.get("content-type") } });
      if (!output || typeof output.image !== "string" || !output.image.length)
        return json({ error: "O modelo não retornou uma imagem. Verifique os logs do Worker." }, 502);
      return json({ image: "data:image/png;base64," + output.image, model: MODEL,
        warning: "Resultado experimental. Confira se a IA preservou os elementos não solicitados." });
    } catch (error) {
      console.error("Falha de edição:", error);
      return json({ error: "Falha no processamento da imagem. Consulte os logs do Worker." }, 502);
    }
  }
};
