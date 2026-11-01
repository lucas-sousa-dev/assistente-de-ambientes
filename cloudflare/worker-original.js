// Cópia de referência do Worker fornecido pelo usuário em 2026-11-01.
// O original serve HTML e aplica cor localmente via Canvas; não contém IA.
// Código original está na conversa; este arquivo registra a arquitetura antes da migração.
export default {
  async fetch(request) {
    if (request.method !== "GET") return new Response("Metodo nao permitido", {status:405});
    return new Response("Protótipo original: pintura por Canvas no navegador; consulte histórico do projeto.", {headers:{"content-type":"text/plain; charset=utf-8"}});
  }
};
