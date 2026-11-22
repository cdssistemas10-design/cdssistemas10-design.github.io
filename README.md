# CDS Sistemas — site institucional

Site institucional em React + Vite, preparado para publicação no GitHub Pages.

## Publicação no GitHub Pages

1. Crie um repositório no GitHub e envie todo o conteúdo deste projeto para a branch `main`.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment → Source**, selecione **GitHub Actions**.
4. Faça um `push` na branch `main` (ou execute manualmente o workflow **Deploy site to GitHub Pages** na aba Actions).
5. Aguarde o workflow concluir. O endereço publicado aparecerá em **Settings → Pages** e no resultado do workflow.

O projeto usa `base: "./"` no Vite, portanto não precisa informar o nome do repositório. O workflow gera a pasta `dist` e publica automaticamente.

## Executar localmente

Requer Node.js 22 ou superior.

```bash
npm ci
npm run dev
```

Para validar a versão de produção:

```bash
npm run build
npm run preview
```

## Atenção antes de divulgar o endereço publicamente

- Confirme e substitua os dados de contato de demonstração (WhatsApp, telefone, e-mail e endereço) pelos canais oficiais da CDS. Há valores aparentes de exemplo no conteúdo atual; não publique anúncios direcionando clientes para eles.
- Revise números comerciais, depoimentos, resultados, homologações e promessas de desempenho para garantir que estejam comprovados e atualizados.
- Esta hospedagem é estática. O formulário de demonstração abre uma conversa no WhatsApp; ele não grava leads em banco de dados.
- O painel administrativo original foi desativado nesta versão pública: ele usava PIN fixo no código do navegador e salvava alterações somente no armazenamento local de cada visitante. Não era um CMS seguro nem compartilhado. Para administração real, será necessário backend/autenticação ou editar o conteúdo no repositório e publicar novamente.
- Não coloque chaves secretas, senhas ou credenciais no frontend ou neste repositório público.

## Estrutura

- `src/`: aplicação React e componentes.
- `public/images/`: imagens estáticas.
- `.github/workflows/deploy.yml`: build e deploy automatizados no GitHub Pages.


## Configuração comercial do site

No rodapé existe **Configuração do site**, com abas para contatos, WhatsApp, redes sociais e planos. Os dados ficam no `localStorage` do navegador em que foram editados. Use **Exportar configurações JSON** para guardar os ajustes. Para publicar as alterações para todos os visitantes, substitua o conteúdo de `src/site-config.json` pelo JSON exportado, faça commit/push e aguarde o GitHub Actions publicar novamente. GitHub Pages não oferece banco de dados nem gravação pública compartilhada; para edição online compartilhada sem novo deploy, será necessário integrar um CMS/backend.


## Navegação do site

O site utiliza navegação por rotas no hash (por exemplo, `#/solucoes` e `#/planos`). Essa estratégia mantém as páginas internas acessíveis no GitHub Pages sem exigir configuração de servidor para fallback de SPA.

O botão dourado incorporado à arte principal possui uma área de clique acessível posicionada sobre o botão da imagem e leva à página `#/solucoes`.
