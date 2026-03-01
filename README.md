# 🏭 Metalizze - ERP & Gestão de Produção

O **Metalizze** é um sistema de nível ERP (Enterprise Resource Planning) desenvolvido especificamente para gerenciar o chão de fábrica de oficinas de corte a laser. Ele automatiza o controle de estoque de matéria-prima (chapas), rastreia a geração de retalhos (scraps) de forma inteligente e mantém um log de auditoria financeiro rigoroso de todas as movimentações.

---

## 🚀 Tecnologias Utilizadas

### Backend (API Restful)
- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Banco de Dados:** PostgreSQL via [Supabase](https://supabase.com/)
- **Validação:** [Zod](https://zod.dev/)
- **Testes:** [Vitest](https://vitest.dev/) & [Supertest](https://github.com/ladjs/supertest)
- **Arquitetura:** Clean Architecture e Domain-Driven Design (DDD)

### Frontend (Interface Web)
- **Framework:** [Next.js (App Router)](https://nextjs.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## ✨ Principais Funcionalidades

- **Gestão de Materiais e Clientes:** Cadastro e controle com geração automática de Slugs e integridade referencial.
- **Estoque de Chapas:** Controle de entrada de chapas virgens com cálculo dinâmico de SKUs.
- **Sistema de Corte Inteligente:** Baixa automática da chapa original ("Chapa Mãe") e geração dinâmica de chapas filhas ("Retalhos/Scraps"), com reaproveitamento de SKUs existentes no estoque.
- **Log de Auditoria (Inventory Movements):** Registro imutável de todas as entradas e saídas, garantindo rastreabilidade total (quem, quando e por quê).
- **Autenticação e Autorização:** Sistema JWT (RS256) com RBAC (Admin, Operador, Visualizador) e permissões granulares por módulo.
- **Gestão de Usuários:** Tela administrativa para criação, edição, ativação/desativação e exclusão de usuários com controle de permissões.
- **Dashboard Moderno:** Interface administrativa responsiva (Light Mode), com menu lateral inteligente e preparada para uso em chãos de fábrica (visão para leitura de QR Code no mobile).

---

## ⚙️ Como Executar o Projeto Localmente

Siga o passo a passo abaixo para rodar o ambiente de desenvolvimento completo na sua máquina.

### 1. Inicializando o Banco de Dados (Supabase)
O projeto utiliza o Supabase localmente via Docker para simular o banco de dados e a infraestrutura.

Na pasta raiz do projeto (`/metalizze`), inicie os containers do Supabase:
```bash
npx supabase start
```

### 2. Configurando o Backend

Na pasta raiz do backend (`/backend`), onde se encontra o código da API siga os seguintes passos:

  1. Instale as dependências:
      ```bash
      npm install
      ```
  2. Configuração das Variáveis de Ambiente: </br>
  O repositório inclui um `.env.test` para servir de base.
      - Crie um arquivo chamado `.env` na raiz.
      - Copie o conteúdo de `.env.test` para dentro dele.
      - Certifique-se de que a variável `DATABASE_URL` está preenchida com a URL de conexão local fornecida pelo Supabase no passo 1. Exemplo:

      ```bash
      DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
      ```
      - Gere as chaves JWT (RS256) e adicione ao `.env`:

      ```bash
      # Gerar par de chaves RSA
      openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
      openssl rsa -in private.pem -pubout -out public.pem

      # Converter para base64 e adicionar ao .env
      echo "JWT_PRIVATE_KEY=$(base64 -w 0 private.pem)" >> .env
      echo "JWT_PUBLIC_KEY=$(base64 -w 0 public.pem)" >> .env

      # Limpar arquivos temporários
      rm private.pem public.pem
      ```

  3. Rodando as Migrações do Banco: </br>
  Sincronize o banco de dados do Supabase com o esquema do Prisma, e logo após por garantida, rode o generate do client do Prisma:

      ```bash
      npx prisma migrate dev
      npx prisma generate
      ```

  4. Populando Dados Iniciais (Seeder):
  Execute o seed para criar o usuário administrador e materiais base:

      ```bash
      npx prisma db seed
      ```

      > **Credenciais do Admin padrão:**
      > - E-mail: `admin@metalizze.com`
      > - Senha: `admin123`
      > - 5 materiais base serão criados: Aço Carbono, Aço Inox, Alumínio, Latão, Cobre

  5. Inicie o servidor de desenvolvimento:

      ```bash
      npm run start:dev
      ```
      A API ficará disponível em `http://localhost:3000`

### 3. Configurando o Frontend

Abra um novo terminal e acesse a pasta do frontend:

  1. Navegue para o diretório:

      ```bash
      cd frontend
      ```
  2. Instale as dependências:

      ```bash
      npm install
      ```
  3. Inicie o servidor do Next.js

      ```bash
      npm run dev
      ```
      A interface gráfica estará provavelmente disponível em `http://locahost:3001`

---

## 🧪 Rodando os testes

O backend foi construído com foco na qualidade do código e segurança das regras de negócio. Para rodar a suíte de testes, utilize os comandos abaixo na pasta raiz do projeto:

### Testes Unitários (Regras de Domínio e Use Cases):

```bash
npm run test
```

### Testes E2E (Integração de Rotas, Controllers e Banco de Dados):

```bash
npm run test:e2e
```
