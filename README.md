# Metalizze - Sistema de Gestão de Estoque e Orçamentos

O **Metalizze** é uma solução completa para oficinas de corte a laser, focada em rastreabilidade unitária de chapas, gestão genealógica de retalhos (Pai/Filho) e precificação dinâmica baseada no custo de reposição.

## 🏗 Arquitetura

O projeto é um **Monorepo** dividido em:

- **`backend/`**: API REST desenvolvida com **NestJS**, seguindo os princípios de **Clean Architecture** e **DDD (Domain-Driven Design)**.
- **`frontend/`**: Interface Web e Mobile (Tablet) desenvolvida com **Next.js**.

## 🛠 Tech Stack

- **Linguagem:** TypeScript
- **Backend:** NestJS, Zod, Pattern Either (Functional Error Handling)
- **Database:** PostgreSQL (Supabase), Prisma ORM
- **Frontend:** Next.js, TailwindCSS, Shadcn/ui, Tanstack Query
- **Testing:** Jest (Unit), Supertest (E2E)

## 🏛 Estrutura do Backend (Clean Architecture)

O backend segue a estrita separação de responsabilidades:

- `src/core`: Classes base compartilhadas (Entity, Either, UniqueEntityID).
- `src/domain`: Regras de negócio puras (Enterprise Logic e Use Cases).
- `src/infra`: Implementações concretas (Database, HTTP Controllers, Gateways).

## 🚀 Como Rodar

### Pré-requisitos
- Node.js (v20+)
- Docker (opcional, para banco local)
- Conta no Supabase

### Instalação
```bash
# Backend
cd backend
npm install
npm run start:dev