# PRD: Automação de Qualidade de Código e CI/CD

**Autor:** Staff Software Engineer / Technical Product Manager
**Projeto:** `async-print-api`

---

## 1. Resumo Executivo
Atualmente, o ciclo de desenvolvimento do projeto não conta com proteções automatizadas para garantir a resiliência e a qualidade base do código (Code Quality). Isso significa que formatação de arquivos, validação de lint e execução da suíte de testes (uso do Vitest e Biome) dependem grandemente do fator humano local. A ausência de automação apresenta riscos sistêmicos, desde a introdução de regressões simples invisíveis aos code-reviews, inconsistências de padronização, até o deploy de códigos falhos (pipelines quebradas).

Implementar uma estratégia fundacional de Integração Contínua (CI) operada primariamente pelo **GitHub Actions** em conjunto de **Git Hooks (Husky)** nas máquinas locais, fechará o perímetro de proteção. Essa automação fornecerá confiabilidade sistemática, garantindo que nenhum códgo com quebras sintáticas ou lógicas básicas entre na branch principal.

---

## 2. Problema que a funcionalidade resolve
A falta de mecanismos restritivos e redundantes resulta no cotidiano prático da engenharia de software em:
* **Commits com erro:** Código instável ou formatado incorretamente passa pelo stage e fica cimentado nas ramificações da source tree.
* **Pipelines quebradas e falsos merges:** Pull Requests que não tiveram testes rodados localmente podem ser submetidos à branch *main/develop*, fazendo com que as ramificações de ouro tornem-se inoperantes até uma intervenção manual.
* **Código sem padronização:** Mesmo possuindo o `Biome` instalado, a formatação manual é susceptível a lapsos. A equipe perde homogeneidade, e revisores ocupam tempo debatendo tabs vs spaces ou convenções.
* **Ausência de validação automática:** Atrapalha a adoção de Continuous Deployment (CD), já que não se pode confiar na integridade autônoma de qualquer commit "mergeado".

---

## 3. Objetivos da funcionalidade
Os principais propósitos e metas desta esteira de automação são:
* **Validar rigorosamente o código antes do commit e push:** Estabelecer barreiras invisíveis nos terminais habituais dos engenheiros.
* **Rodar verificações como *lint* e testes *unitários* silenciosa e automaticamente:** Em todos as mudanças do dia a dia, preservando a base estrita do projeto.
* **Impedir o merge de código quebrado no versionamento Git:** Regras de branch estritas associarão relatórios positivos de CI ao botão "Merge Pull Request".
* **Reduzir erros contornáveis em frentes de staging e produção:** Prevenindo a fatiga de engenharia originária de *hotfixes* não previstos de comportamentos falhos que testes pegariam e automatizariam o reparo.

---

## 4. Escopo da solução
O projeto será coberto de ponta-a-ponta por duas linhas concêntricas de validação, alavancando a *stack* primária (`pnpm`, `Biome`, `Vitest`).

### Git Hooks (Husky)
A solução injeta mecanismos no ciclo de vida do Git, agindo interceptivamente nas estações de trabalho antes do código alcançar o servidor remoto:

* **`pre-commit`**
  * **Objetivo:** Garantirá a sintaxe limpa.
  * **Funcionalidade Esparada:** Execução de um lint e auto-fixamento (`pnpm lint`) e formatação (`lint-staged`). Casos que resultem num não-zero *exit code* impedirão o commit de existir.
* **`pre-push`**
  * **Objetivo:** Check-ins lógicos sem a espera de cloud runners.
  * **Funcionalidade Esperada:** Execução da bateria super rápida de testes do sistema (`pnpm test` de escopo unitário). Se os testes derem quebra, o push é abortado.

### Pipeline CI com GitHub Actions
Implementação do agente validador Server-Side central (como fonte final de verdade).

**Para cada Push / Commit em branches abertas**
Validação de *fast-feedback*:
* Instalação imutável de pacotes e dependências (`pnpm install --frozen-lockfile`).
* Execução do Lint para mitigar qualquer *bypass* forçado pelos desenvolvedores.
* Execução isolada dos testes unitários (`pnpm test`).

**Para cada Pull Request (Target: `main`)**
Validação completa de Integração e Sistema:
* Transpilação profunda em busca de tipagens perdidas no TypeScript via build (`pnpm build`).
* Execução rigorosa dos Testes de Integração (`pnpm test:e2e`), rodando em container host e checando pontes externas como S3 (se mockado/integrado), PostgreSQL / Prisma e filas no Redis / BullMQ.
* Emissão de Validação Completa do GitHub, autorizando o merge.

---

## 5. Fluxo de desenvolvimento esperado
O ecossistema implementado resultará em uma esteira cadenciada e confiável:

1. **Desenvolvedor (+ código):** Inicializa sua rotina, escreve o código de novas *features* e roda `git add .`
2. **Commit (+ validação local):** `git commit -m "feat: .."` dispara o **Husky**, validando Linter em milissegundos. Falhas atômicas barram o andamento na raiz.
3. **Push e Teste Rápido:** Ocorre a execução dos testes com `git push`. A barreira se estende, garantindo integridade das regras de negócio.
4. **Acionamento do CI:** O push aciona o GitHub Actions. Dependências estáticas validam a branch.
5. **Criação de Pull Request:** No GitHub, a thread inicia os relatórios para merge. A pipeline ativa verificação pesada (`test:e2e`), cobrindo endpoints e contratos HTTP.
6. **Integração Validada e Merge:** Apenas com as "bolinhas verdes" de Lint, Build e Test (unificado com aprovação paralela de code review humano) a code-base será alterada com a incorporação final do artefato validado.

---

## 6. Arquitetura da solução

* **Estrutura de Pastas e Arquivos no GitHub**
  ```text
  .github/workflows/
  ├── quality-check.yml   # Workflow para validações on-Push (Lint e Unit tests rápidos)
  └── pr-validation.yml   # Workflow robusto on-PullRequest (Build TSC, Testes E2E complexos)
  ```

* **Estrutura de Pastas e Hooks do Husky**
  ```text
  .husky/
  ├── pre-commit          # npx lint-staged (recomendado para formatar apenas code "staged") ou pnpm lint
  └── pre-push            # pnpm test
  ```

* **Adaptação e Scripts Inclusos (`package.json`)**
  A base local suportará e será referenciada sem redundâncias pelas Actions nos seguintes comandos:
  ```json
  "scripts": {
    "build": "tsc",
    "test": "vitest run --project unit",
    "test:e2e": "vitest run --project e2e",
    "test:cover": "vitest run --coverage --project unit",
    "lint": "biome check", -- NOTA: Ideal ter um run read-only sem o --write pro CI falhar propriamente
    "lint:fix": "biome check --write --unsafe",
    "prepare": "husky"
  }
  ```
  *(Nota: A adição da dependência `lint-staged` aos `devDependencies` é fortemente recomendada para otimizar tempo de verificação local)*.

---

## 7. Definição dos workflows

### Workflow 1: `Commit Quality Check`
Focado na saúde diária de rastreamento atômico das branches sem gerar pesados tempos de pipeline de contêineres E2E.
* **Events (Triggers):** `push` direcionado para toda ramificação genérica de suporte exceto main direta.
* **Executa as matrizes:** 
  - Subida do repositório (`actions/checkout`);
  - Cache dinâmico da folder `.pnpm-store` para cortes drásticos nos minutos consumidos;
  - `pnpm lint` verificando `biome.json`;
  - `pnpm test` verificando assertividades puras.

### Workflow 2: `Pull Request Validation`
É a muralha defensiva *heavy-duty*. Funciona como integradora, agrupa microserviços em background em containers para homologação simulada ao real.
* **Events (Triggers):** `pull_request` no alvo principal `main`.
* **Executa as matrizes:**
  - Instalação e Build das tipagens Tsc Typescript (`pnpm build`).
  - Lançamento de serviços de background (`services` node no YAML do GitHub Action para gerar DB Postgres test + base Redis).
  - Execução das *migrations* Prisma para popular as tabelas transacionais de teste.
  - Teste de Integração Real: `pnpm test:e2e`.

---

## 8. Critérios de Aceitação
* Commits submetendo alterações de lint incorretas não poderão ser concluídos localmente devido ao hook restritivo.
* Ao abrir um PR com testes de Integração ou Unitários resultando em estado negativo (`exit 1`), o GitHub bloqueará o botão central `Merge Pull Request` nativamente.
* Não deve haver forma de integrar código a ramificação núcleo do repositório cujos pipelines não concluam satisfatoriamente.
* A automação roda sem demandar chaves, cliques, ou engajamentos humanos além de seu push habitual.

---

## 9. Métricas de sucesso
Adotar a funcionalidade irá resultar, após 1 a 2 Sprints (15 a 30 dias), nos seguintes medidores de engajamento técnico:
* **Diminuição do TTR (Time to Revert):** Redução em até 100% de quebras atômicas ou tipagens e syntax-sugar divergentes que quebrem Builds sendo injetados na master/main.
* **Redução de falhas incidentais em Produção/Staging** com coberturas de APIs devidamente protegidas em pre-merging.
* **Velocidade dos Code Reviews (Lead Time):** Redução do tempo de debate. Desenvolvedores sêniores investirão tempo debordando *arquiteturas* ou *problemas de domínio* porque code-style e *broken code* foram completamente capturados pre-view pela automação.

---

## 10. Riscos e mitigação
* **Pipelines de E2E Lentas no CI limitando entregabilidade**
  * *Riscos:* Testes com conteinerização massiva demorando 15 minutos em cada PR enchem a paciência dos devs.
  * *Mitigação:* Usar estratégias robustas de Cache Node modules e Banco local SQLite provisório onde couber; se o projeto crescer grandemente, separar matrixamento e paralelismo de testes no github actions (`strategy: matrix`).
* **Falsos Positivos de Lints estressando desenvolvedores localmente**
  * *Risco:* Biome travar pre-commit constantemente.
  * *Mitigação:* Revisar e refinar periodicamente e flexibilizar regras no `biome.json` que acarretem quebra de mentalidade produtiva nos Devs.
* **Bypass de Hooks local**
  * *Risco:* Cansados ou frustrados, os Devs abusam repetidamente e diariamente do termo `git commit --no-verify`, enviando falhas quebravéis pro GitHub com intuito unicamente malicioso ou preguiçoso para fazer com que as testagens passem longe da máquina deles.
  * *Mitigação:* É uma prática irrefreável na engenharia. O CI age como a autoridade remota que não dá pra pular (nomenclatura Single Source of Truth). O dev apenas sofrerá e perderá os minutos em nuvem sem conseguir o merge, forçando adaptação orgânica à resolução local pelo pre-commit de antes.

---

## 11. Roadmap futuro (CD - Continuous Deployment)
Com este plano robusto de Integração Contínua solidamente assentado, a maturidade de dev abre as portas para:
1. **Deploy Dinâmico (Auto-Deploy):** Assim que a Action ligada a `branch push main` concluir a automação já pré-aprovada do PR, gatilhos de CD para atualizar as Instâncias ou Lambdas (como Render, Vercel, ECS AWS) executarão o rollout automágico à produção.
2. **Build de Conteiner Docker:** Iniciar a criação automatizada, empacotando o repósitório por meio do `dockerfile` já contido nesse repositório via Action Push ao ECR em versionamentos `latest`.
3. **Publicação Automatizada e Semantic Releases:** Interceptar padrões de "Commits Convencionais" na main, para criar dinamicamente os ChangeLogs e as tags Major,Minor e Patch na base de release do repositório (ex: `v1.2.0`).
