# Meu Arquiteto IA — Assistente de Ambientes

> Projeto web em desenvolvimento. Este README registra o estado **confirmado**, as decisões e o roteiro de evolução. Não representa funcionalidades ainda não implementadas como prontas.

## 1. Objetivo
Criar um assistente de arquitetura e decoração acessível pelo navegador e, futuramente, disponibilizá-lo como aplicativo. O usuário poderá enviar fotos e plantas, descrever mudanças desejadas e visualizar resultados preservando a estrutura e os objetos que não devem ser alterados.

## 2. Funcionalidades planejadas
- Enviar uma fotografia do ambiente ou capturar uma imagem pela câmera.
- Selecionar uma parede ou região e mudar apenas sua cor, preservando quadros, móveis, portas e objetos.
- Escolher cores por paleta contínua e inserir valores manuais (HEX/RGB).
- Informar instruções em linguagem natural, como “pinte esta parede de cinza”.
- Visualizar antes/depois, salvar projetos e baixar resultados.
- No futuro: rearranjar móveis, analisar plantas com medidas, sugerir circulação, suportar captura panorâmica/360° e modos gratuito e pago.
- Interface planejada: fundo claro, cinza grafite, verde musgo e navegação por abas horizontais.

**Importante:** esses itens são requisitos do produto, não uma declaração de que todos já funcionam.

## 3. Arquitetura atual
- **GitHub:** guarda o código-fonte e o histórico de alterações (commits).
- **GitHub Actions:** automatiza a publicação do Worker quando arquivos específicos mudam na branch `main`; também permite execução manual.
- **Cloudflare Workers:** executa o backend HTTP.
- **Wrangler:** ferramenta de linha de comando usada pelo GitHub Actions para publicar o Worker.
- **Workers AI:** binding `AI` declarado no `wrangler.jsonc`; sua existência não garante que a edição esteja liberada.
- **Frontend web:** interface do aplicativo; o processo de publicação do Worker não substitui a publicação do frontend.

### Arquivos-chave
| Arquivo | Para que serve |
| --- | --- |
| `README.md` | Documentação do projeto, estado e decisões. |
| `wrangler.jsonc` | Nome do Worker, arquivo de entrada, data de compatibilidade, binding de IA e variáveis. |
| `cloudflare/worker.js` | Rotas HTTP e validações do backend. |
| `.github/workflows/deploy-worker.yml` | Passos de diagnóstico e publicação automatizada no Cloudflare. |

## 4. API do Worker
| Rota | Finalidade |
| --- | --- |
| `GET /health` | Verificar se o serviço responde e se há binding de IA. |
| `GET /api/capabilities` | Informar recursos habilitados/desabilitados. |
| `POST /api/edit` | Receber foto e instrução, sujeito a validação e autorização. |

### Estado atual da edição por IA
No `wrangler.jsonc`, `EDIT_ENABLED` está definido como `"false"`. Assim, a edição por IA **não está liberada para uso público**. O backend exige também um segredo privado `EDIT_TEST_TOKEN` de pelo menos 32 caracteres quando habilitado. Esse segredo **nunca deve ser colocado no código do navegador**.

O endpoint aceita solicitações `multipart/form-data`, imagens JPG/PNG/WebP e verifica tamanho e instruções. A edição visual precisa ainda requer testes e melhorias de precisão. O recurso de pintura manual é anunciado pela API, mas sua qualidade e integração com a interface devem ser verificadas em testes reais.

## 5. Histórico de desenvolvimento (marcos confirmados)
1. Definido o conceito do produto: assistente de ambientes com edição precisa, comandos por texto, seleção de cores e futura monetização.
2. Criado o Worker `meu-arquiteto-ia` no Cloudflare, com configuração de Workers AI.
3. Criado o repositório e o fluxo `Publicar Worker no Cloudflare` via GitHub Actions.
4. Configurados os secrets do repositório `CLOUDFLARE_ACCOUNT_ID` e `CLOUDFLARE_API_TOKEN`. **Nunca registrar valores de credenciais no README.**
5. Adicionada proteção ao endpoint de edição: bloqueio por padrão, autenticação privada para testes e validações de entrada.
6. Em 03/11/2026, as execuções manuais #7, #8 e #9 falharam durante o Wrangler com mensagem: `Unable to fetch bindings, routes, or services metadata from the dashboard`.
7. Atualizado o fluxo de publicação para diagnosticar a consulta de metadados na API Cloudflare e usar Wrangler `4.157.0`.
8. Execução #10 do GitHub Actions concluída com sucesso. Painel Cloudflare confirmou implantação ativa `256692a7`, com 100% do tráfego destinado a ela e taxa de erro indicada de 0% naquele momento.

**Observação:** implantação bem-sucedida significa que o backend foi publicado; não significa que a edição de imagens ou todas as telas estejam prontas.

## 6. Como funciona a publicação
1. Alterações nos arquivos monitorados são enviadas à branch `main`.
2. O GitHub Actions faz checkout do repositório e configura o Node.js.
3. O fluxo verifica a presença dos secrets sem mostrar seus valores.
4. Uma etapa consulta a API Cloudflare para diagnosticar o acesso ao Worker.
5. O Wrangler publica `cloudflare/worker.js` usando `wrangler.jsonc`.
6. Conferimos o resultado no GitHub Actions e a nova versão em **Cloudflare > Worker > Implantações**.

## 7. Próximas etapas
- [ ] Testar frontend e backend juntos e documentar o resultado.
- [ ] Implementar/validar seleção precisa de parede, sem pintar quadros e objetos.
- [ ] Adicionar seletor de cores contínuo e campo HEX/RGB.
- [ ] Integrar campo de instruções, prévia antes/depois e salvar/baixar.
- [ ] Projetar autenticação de usuários, limites de uso, orçamento e controle de custos antes de liberar IA.
- [ ] Testar edição com IA sem alterações indevidas de geometria ou mobiliário.
- [ ] Definir armazenamento de projetos, privacidade e tratamento de imagens.
- [ ] Avaliar formato de aplicativo: PWA instalável inicialmente e, se necessário, empacotamento Android/iOS posteriormente.
- [ ] Criar testes automatizados e documentação técnica detalhada dos módulos.

## 8. Guia de estudos: o que aprender neste código
- **JavaScript:** `const`, funções, `async/await`, `fetch`, objetos e tratamento de erros.
- **HTTP:** métodos GET/POST, rotas, cabeçalhos, status 200/400/401/503 e CORS.
- **Segurança:** secrets, variáveis de ambiente, autenticação Bearer, validação de upload e limitação de custos.
- **Git/GitHub:** repositório, branch, commit, histórico e revisão de alterações.
- **CI/CD:** gatilhos de workflow, jobs, steps, logs e deploy.
- **Cloudflare:** Worker, bindings, Wrangler e versões implantadas.

### Glossário rápido
- **Frontend:** a interface que a pessoa usa.
- **Backend:** serviço que processa as solicitações.
- **API:** contrato de comunicação entre frontend e backend.
- **Deploy:** publicação de uma versão.
- **Binding:** recurso da plataforma disponibilizado ao código.
- **Secret:** credencial protegida que não deve ser exposta.
- **PWA:** aplicativo web que pode ser instalado no dispositivo, conforme suporte do navegador.

## 9. Como manter esta documentação
A cada etapa concluída:
1. Atualizar o checklist e registrar o que foi efetivamente testado.
2. Descrever quais arquivos mudaram e por quê.
3. Explicar o código novo em linguagem simples.
4. Registrar limitações, erros e correções sem divulgar senhas ou tokens.
5. Manter o histórico do GitHub como fonte de detalhes de cada commit.

## 10. Referências do projeto
- [Código no GitHub](https://github.com/lucas-sousa-dev/assistente-de-ambientes)
- [Execuções do GitHub Actions](https://github.com/lucas-sousa-dev/assistente-de-ambientes/actions)

---
**Documentação iniciada em 03/11/2026.** Este arquivo deve evoluir junto com o aplicativo.
