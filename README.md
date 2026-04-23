# MellosCakes — Sistema de Gestão

SaaS completo para confeitaria profissional. Gestão de pedidos, receitas, estoque, financeiro, redes sociais e muito mais.

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Deploy**: Vercel

---

## Setup Local

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/mellos-cakes
cd mellos-cakes
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copie a **Project URL** e **anon key** do painel (Settings → API)

### 3. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=uma-chave-secreta-qualquer
```

### 4. Criar primeiro usuário

No Supabase Dashboard → **Authentication** → **Users** → Add User

Ou use a página de login e depois force a criação via SQL:

```sql
-- Após criar o usuário via Auth, defini-lo como admin:
UPDATE public.profiles SET role = 'admin' WHERE email = 'seu@email.com';
```

### 5. Rodar

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Deploy Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

No painel da Vercel, adicione as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key |
| `NEXT_PUBLIC_APP_URL` | URL da Vercel (ex: https://mellos.vercel.app) |
| `CRON_SECRET` | Chave secreta para o cron job |

---

## Módulos

| Módulo | Rota | Descrição |
|---|---|---|
| Dashboard | `/dashboard` | Visão geral, alertas, métricas |
| Clientes | `/clientes` | CRM com histórico de pedidos |
| Orçamentos | `/orcamentos` | Criação e conversão em pedidos |
| Pedidos | `/pedidos` | Gestão de pedidos com fluxo de status |
| Entregas | `/entregas` | Logística com avanço de status |
| Produção | `/producao` | Agenda semanal de produção |
| Produtos | `/produtos` | Catálogo com ficha técnica |
| Receitas | `/receitas` | Receitas com custo automático |
| Ingredientes | `/ingredientes` | Cadastro com movimentação de estoque |
| Estoque | `/estoque` | Painel de controle de estoque |
| Fornecedores | `/fornecedores` | Cadastro de fornecedores |
| Compras | `/compras` | Pedidos de compra com recebimento |
| Financeiro | `/financeiro` | Fluxo de caixa e lançamentos |
| Redes Sociais | `/social` | Calendário editorial e agendamento |
| Configurações | `/configuracoes` | Dados do negócio e preferências |

---

## Storage Buckets (Supabase)

O schema SQL já cria automaticamente:

- `products` — fotos de produtos (público)
- `recipes` — imagens de receitas (público)
- `social-media` — mídias de posts (público)
- `business` — logo e arquivos do negócio (público)
- `ingredients` — fotos de ingredientes (privado)

---

## Cron Job

O arquivo `vercel.json` configura execução diária às 8h:
- Verifica ingredientes com estoque baixo
- Pedidos com entrega nas próximas 48h
- Orçamentos sem resposta há +3 dias
- Contas vencidas

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── auth/          # Login, recuperação de senha
│   ├── dashboard/     # Página principal
│   ├── clientes/      # CRUD de clientes
│   ├── pedidos/       # Gestão de pedidos
│   ├── produtos/      # Catálogo
│   ├── receitas/      # Receitas e fichas técnicas
│   ├── ingredientes/  # Ingredientes
│   ├── estoque/       # Controle de estoque
│   ├── fornecedores/  # Fornecedores
│   ├── compras/       # Pedidos de compra
│   ├── orcamentos/    # Orçamentos
│   ├── producao/      # Agenda de produção
│   ├── entregas/      # Logística
│   ├── financeiro/    # Fluxo de caixa
│   ├── social/        # Redes sociais
│   ├── configuracoes/ # Configurações
│   └── api/           # API routes + cron
├── components/
│   ├── layout/        # Sidebar, Topbar
│   └── ui/            # StatsCard, NotificationBell
└── lib/
    ├── supabase/      # Client, server, middleware
    ├── hooks/         # useNotifications
    └── utils/         # formatCurrency, formatDate, etc.
```

---

## Papéis de Usuário

| Papel | Acesso |
|---|---|
| `admin` | Total |
| `financeiro` | Financeiro, Pedidos, Clientes |
| `producao` | Produção, Ingredientes, Estoque |
| `social_media` | Redes Sociais |
| `atendente` | Clientes, Orçamentos, Pedidos |
