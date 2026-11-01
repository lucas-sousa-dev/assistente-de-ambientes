# Meu Arquiteto IA — requisitos e plano de implementação

Status: protótipo em desenvolvimento. Este documento é a referência funcional do produto; não implica que as funcionalidades estejam implementadas.

## Princípio fundamental
Alterar somente o que o usuário pedir. Preservar o restante da fotografia. Quando a seleção não for confiável, solicitar confirmação e permitir ajuste manual. Não afirmar precisão absoluta.

## Modo 1 — Fotografia
- Capturar com câmera ou escolher imagem do dispositivo.
- Campo de instrução em português, alvo da edição, estilo e escopo.
- Seleção manual por pincel/máscara e, futuramente, seleção assistida por segmentação.
- Enviar imagem, máscara e instrução para um serviço de edição real; receber imagem gerada e mostrar antes/depois.
- Permitir revisões, desfazer, histórico, salvar e compartilhar, respeitando permissões e planos.
- Edições: pintura, textura, revestimento, piso, teto, adicionar/remover/substituir móveis e decoração.
- Nunca aplicar filtros globais quando o pedido for localizado. Preservar pixels fora da máscara na composição final, quando tecnicamente possível.

## Modo 2 — Planta baixa
- Upload de imagem ou PDF; identificar paredes, cômodos, portas, janelas e cotas.
- Confirmar dimensões ambíguas; não inventar medidas.
- Planejar mobiliário respeitando geometria, abertura de portas, circulação e dimensões reais.
- Produzir planta mobiliada 2D e ilustração 3D identificada como conceitual; permitir ajustes por texto.
- Validar colisões e distâncias por lógica geométrica, não apenas por geração de imagem.

## Medidas
- Calculadora de encaixe por medidas fornecidas pelo usuário.
- Medição por fotografia somente com escala/referência adequada; exibir incerteza e exigir confirmação.
- Não substituir projeto executivo ou medição profissional.

## Experiência
- Interface responsiva para celular, português brasileiro, upload por arquivo e câmera, comandos textuais, comparação antes/depois, estados de carregamento e erros claros.
- Projetos persistidos com consentimento e política de privacidade apropriada.

## Monetização futura (não ativar no protótipo)
- Gratuito: gerar e visualizar prévia com limites.
- Avulso: pagamento para liberar download.
- Assinatura: gerações e recursos adicionais.
- Profissional: maior detalhamento e ferramentas de planejamento.
- Definir custos por geração, antifraude, termos e pagamentos antes de lançar.

## Arquitetura desejada
Frontend GitHub Pages -> Cloudflare Worker (API, autenticação, validação, limites) -> provedor de visão/edição de imagens.
Segredos exclusivamente no Worker, nunca no HTML. Restringir CORS, validar tipo/tamanho de arquivo e tratar erros. Não expor chave de API.
A API de edição deve receber imagem + instrução + máscara opcional e devolver resultado real; proibir respostas de sucesso que simplesmente devolvam a imagem original.

## Critérios de aceitação — primeiro marco
1. Escolher uma foto no celular.
2. Digitar: "Pinte somente a parede atrás do sofá de cinza-claro".
3. Marcar a parede com pincel/máscara.
4. Worker processar a solicitação com modelo de edição efetivo.
5. Resultado visivelmente alterar a parede e manter os pixels externos à máscara.
6. Exibir antes/depois, erros e estado de processamento.
7. Testar fotos variadas, inclusive limites complexos, e registrar falhas.

## Ordem de execução
1. Auditar frontend e Worker atual; preservar código existente.
2. Corrigir integração e edição localizada real.
3. Testes com fotografias e ajustes de seleção.
4. Leitura de plantas, geometria e distribuição de móveis.
5. Medição assistida, persistência e refinamentos.
6. Custos, autenticação, planos e lançamento.

## Estado encontrado em 2026-11-01
O index.html contém interface e simulação ilustrativa local (canvas, emojis e cores), mas não há chamada de API de edição real na função criarProjeto. O chat usa palavras-chave, não um modelo de IA. O Worker Cloudflare ainda não foi auditado, pois seu código não está disponível no repositório consultado.
