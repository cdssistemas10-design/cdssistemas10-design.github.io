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

Para usar o painel com backend local, inicie o Express em um terminal e o Vite em outro. O proxy de desenvolvimento usa a porta 3000 por padrão; `API_PROXY_TARGET` permite apontá-lo para outra porta sem alterar o destino de produção:

```powershell
# Terminal do backend (configure DATABASE_PATH para um banco de teste isolado)
$env:PORT="3001"
$env:DATABASE_PATH="$env:TEMP\cds-admin-local-test\admin.db"
npm run start:backend

# Terminal do frontend
$env:API_PROXY_TARGET="http://127.0.0.1:3001"
npm run dev -- --host 127.0.0.1 --port 5174
```

O painel e a API devem ser acessados pela mesma origem do Vite (`http://127.0.0.1:5174`); o proxy encaminha `/api` ao backend.

## Publicação local no GitHub Pages

Defina `GITHUB_TOKEN` apenas no ambiente do processo Express local, fora do repositório. Use um Fine-grained Personal Access Token autorizado somente para `cdssistemas10-design/cdssistemas10-design.github.io` com estas permissões:

- `Contents: Read and write`: consultar a branch e os arquivos, criar blob/árvore/commit e atualizar a referência `main`.
- `Actions: Read-only`: consultar os runs do workflow `Deploy site to GitHub Pages` pelo SHA do commit.

Defina opcionalmente `GITHUB_REPOSITORY` e `GITHUB_BRANCH`; os únicos valores permitidos são o repositório informado e a branch `main`.

No painel, use **Salvar alterações** antes de **Publicar no site**. O backend prepara somente `src/site-config.json`, verifica o SHA da branch e consulta o workflow pelo SHA do commit. O token não é enviado ao frontend, gravado no banco ou registrado em logs.

## Atenção antes de divulgar o endereço publicamente

- Confirme e substitua os dados de contato de demonstração (WhatsApp, telefone, e-mail e endereço) pelos canais oficiais da CDS. Há valores aparentes de exemplo no conteúdo atual; não publique anúncios direcionando clientes para eles.
- Revise números comerciais, depoimentos, resultados, homologações e promessas de desempenho para garantir que estejam comprovados e atualizados.
- Esta hospedagem é estática. O formulário de demonstração abre uma conversa no WhatsApp; ele não grava leads em banco de dados.
- O painel administrativo é disponível somente no ambiente local com Express autenticado. Ele não faz parte da publicação pública do GitHub Pages como aplicação administrativa.
- Não coloque chaves secretas, senhas ou credenciais no frontend ou neste repositório público.

## Estrutura

- `src/`: aplicação React e componentes.
- `public/images/`: imagens estáticas.
- `.github/workflows/deploy.yml`: build e deploy automatizados no GitHub Pages.

## Painel administrativo seguro

O backend Express pode ser iniciado sem o frontend. Para servir também a versão compilada do site, gere `dist` antes de iniciar. O provisionamento continua sendo uma ação manual e separada; o servidor nunca cria uma conta automaticamente.

```bash
npm ci
npm run start:backend
```

Para servir o frontend compilado no mesmo processo, execute `npm run build` antes de iniciar o servidor. `npm start`, `npm run start:backend` e `npm run start:prod` iniciam o mesmo servidor; a plataforma deve fornecer `NODE_ENV=production` para ativar as verificações e cookies de produção.

Configure estas variáveis no ambiente de execução, não no bundle público:

- `NODE_ENV`: `development`, `test` ou `production`.
- `HOST`: endereço de escuta; o padrão é `0.0.0.0`.
- `PORT`: porta entre 1 e 65535; o padrão local é `3000`.
- `TRUST_PROXY`: quantidade inteira de proxies confiáveis; use apenas o número confirmado pela hospedagem. O padrão `0` não confia em cabeçalhos encaminhados.
- `PUBLIC_ORIGIN`: origem pública exata, por exemplo `https://admin.seudominio.com`, sem caminho. Obrigatória em produção e deve usar HTTPS.
- `SESSION_SECRET`: segredo aleatório exclusivo, com no mínimo 32 bytes; obrigatório em produção.
- `DATABASE_PATH`: caminho do SQLite. Em desenvolvimento, o padrão é `data/admin.db`; em produção é obrigatório informar um caminho absoluto em volume persistente.

O arquivo `.env.example` documenta os nomes e exemplos, mas o servidor não carrega `.env` automaticamente. A hospedagem deve injetar as variáveis. A rota `GET /api/health` retorna somente o estado geral e valida a disponibilidade do banco, sem revelar detalhes internos.

Não há CORS habilitado: a implantação prevista é same-origin, com proxy reverso encaminhando `/api` ao Express ou com o próprio servidor servindo `dist`. Não use `Access-Control-Allow-Origin: *` nem cookies cross-origin nesta etapa. A validação de origem usa `PUBLIC_ORIGIN`; os cookies de sessão permanecem `HttpOnly`, `SameSite=Strict` e `Secure` em produção.

Para validar localmente:

```bash
npm run build
npm run start:backend
```

Em outro terminal, consulte `http://localhost:3000/api/health`. Para hospedar em produção, configure todas as variáveis obrigatórias, um volume persistente para `DATABASE_PATH` e HTTPS antes de iniciar.

Provisione a única conta administrativa com variáveis de ambiente, fora do bundle e do Git:

```powershell
$env:ADMIN_USERNAME="cds.Diego"
$env:ADMIN_INITIAL_PASSWORD="<senha_inicial>"
npm run provision
Remove-Variable env:ADMIN_INITIAL_PASSWORD
Remove-Variable env:ADMIN_USERNAME
```

A conta deve alterar a senha inicial no primeiro acesso. A nova senha deve ter pelo menos 8 caracteres. Defina `DATABASE_PATH` para o mesmo banco persistente usado pelo backend ao executar o provisionador. Os arquivos de `data/` e todas as variáveis `.env` são ignorados pelo Git.

## Requisitos da hospedagem Node.js

- Defina `PORT` fornecida pela plataforma. O backend usa `HOST=0.0.0.0` por padrão.
- Configure `SESSION_SECRET` por variável de ambiente e mantenha o mesmo segredo em cada instância.
- Configure `PUBLIC_ORIGIN` como a origem HTTPS pública exata e `DATABASE_PATH` para um caminho absoluto em armazenamento persistente.
- Execute atrás de HTTPS e defina `NODE_ENV=production`; o cookie de sessão será marcado como `Secure`.
- Configure `TRUST_PROXY` somente quando houver proxy reverso conhecido. Use um número inteiro representando a quantidade confiável de hops.
- Preserve o volume definido em `DATABASE_PATH` em reinicializações e redeploys. As configurações e sessões ficam no mesmo banco SQLite; não use diretórios temporários.
- Hospede frontend e backend no mesmo origin ou configure um proxy reverso para encaminhar `/api` ao backend. Não exponha `/api` diretamente no GitHub Pages.


## Configuração comercial do site

No ambiente local, o rodapé possui **Configuração do site**, com abas para contatos, WhatsApp, redes sociais e planos. A edição é salva no SQLite administrativo e pode ser publicada pelo backend somente em `src/site-config.json`. A configuração pública não usa `localStorage` como fonte compartilhada.


## Navegação do site

O site utiliza navegação por rotas no hash (por exemplo, `#/solucoes` e `#/planos`). Essa estratégia mantém as páginas internas acessíveis no GitHub Pages sem exigir configuração de servidor para fallback de SPA.

O botão dourado incorporado à arte principal possui uma área de clique acessível posicionada sobre o botão da imagem e leva à página `#/solucoes`.
