# E2E — Estratégia de isolamento de banco

Este documento descreve a estratégia adotada para os testes E2E do projeto e como o *DB-per-test* foi implementado (criação de um database temporário por execução de teste).

---

## ✅ Objetivo
Garantir que cada execução de E2E rode isolada em relação ao banco, evitando interferência entre testes e dados residuais.

## Como funciona (resumo)
- **Primeiro** tentamos criar um novo database para a bateria de testes (DB-per-test):
  - Cria `prisma_test_<UUID>` no servidor Postgres.
  - Atualiza `process.env.DATABASE_URL` apontando para essa DB.
  - Executa `npx prisma migrate deploy` nessa DB para preparar o schema.
- **Observação**: este projeto exige permissão para criação de databases no ambiente apontado por `DATABASE_URL`. O setup cria um database temporário `prisma_test_<uuid>` para cada teste e o dropa no final. Se o seu ambiente (ex: Supabase) não permite criar databases, ajuste o `DATABASE_URL` para apontar para uma DB de teste dedicada com permissão para criar DBs, ou execute os testes em um runner com um banco PostgreSQL que permita criação de DBs.
- No teardown, removemos o que foi criado:
  - Se foi DB: terminamos conexões e droppamos o database.

## Arquivos alterados / pontos importantes
- `test/setup-e2e.ts` — implementa a lógica DB-per-test: cria um database temporário para a execução de testes, executa migrations e faz cleanup.
- `src/infra/database/prisma/prisma.service.ts` — usa `ConfigService` para obter `DATABASE_URL` e configura o pool para operar contra a DB criada pelos testes (DB-per-test).
- `src/infra/database/prisma/repositories/prisma-materials-repository.ts` — usa o Prisma Client para operações CRUD; o uso de SQL raw foi minimizado/removido.

> Observação: o uso de SQL raw foi minimizado e removido das operações principais; preferimos o Prisma Client para todas as operações CRUD. Mantemos raw apenas em casos pontuais muito específicos.


## Configuração e boas práticas
- **Acesse variáveis de ambiente via `EnvService` / `ConfigService`** em vez de ler `process.env` diretamente. Isso garante validação, tipagem e valores default do `envSchema`.
- Evite mutar `process.env` durante a inicialização — isso mantém a inicialização previsível e fácil de testar.
- Uso de DB-per-test é obrigatório: garanta que o usuário em `DATABASE_URL` tenha permissão para criar databases; em CI, forneça um Postgres que permita `CREATE DATABASE` ou use um runner dedicado.

---

## Como rodar localmente
1. Garanta que `DATABASE_URL` no seu `.env.test` aponte para um Postgres acessível (ex.: `postgresql://postgres:postgres@127.0.0.1:5432/postgres`).
2. Rode:

```bash
npm run test:e2e
```

- Se o usuário do `DATABASE_URL` puder criar databases, o script criará `prisma_test_<uuid>` automaticamente.
- Se não puder, o teste falhará com um erro claro — ajuste as permissões ou execute os testes em um runner com um Postgres que permita criação de databases.

---

## Dicas para CI (GitHub Actions / GitLab CI / etc.)
- **Preferível**: Prover um Postgres de teste com permissão para criar databases. Exemplo simples no GitHub Actions usando service `postgres` funciona bem:

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports: [5432]
    options: >-
      --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
```
- Garanta que o Postgres de teste permita a criação de databases (CREATE DATABASE). Se você estiver usando Supabase ou outra plataforma gerenciada que não permite criar DBs, execute os E2E em um runner com um Postgres de teste com permissões adequadas.
- Recomendo configurar o runner para rodar os testes em nodes isolados (1 job por runner) para evitar conflitos de concorrência ao criar DBs.

---

## Troubleshooting rápido
- Testa falhando porque já existe material: verifique se o `DATABASE_URL` está apontando para a DB criada pelo setup (logs locais imprimem a URL no App init) e se a criação do DB funcionou. Se o teardown falhar por conexões ativas ao droppar DB: o script termina as conexões antes de droppar (pg_terminate_backend), mas certifique-se que seu usuário tenha permissões adequadas.