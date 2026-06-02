# SocialCare — Web

Front-end da plataforma **SocialCare** (gestão de assistência social). Reúne, em um
único projeto Next.js:

- **Site institucional** (público): home, programas sociais, indicadores públicos, sobre e contato.
- **Sistema integrado** (autenticado): área operacional e gerencial que cobre **todas as
  funcionalidades da [SocialCare API](../socialcare-api)**.

> Slogan: *"Cuidar é transformar."*

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (identidade visual própria)
- Autenticação JWT (token no navegador), chamadas diretas à API

## Pré-requisitos

A **SocialCare API** precisa estar em execução (por padrão em `http://localhost:5128`).
O CORS já está habilitado na API para `http://localhost:3000`.

```bash
# na pasta da API
dotnet run
```

## Configuração

Crie um `.env.local` (veja `.env.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:5128
```

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Acesso inicial

A API cria um administrador no primeiro boot (definido no `appsettings.json` da API):

- **Login:** `admin`
- **Senha:** `ChangeMe@123`

Com o administrador é possível cadastrar Gestores e Assistentes Sociais em **Usuários**.

## Funcionalidades cobertas

| Área | Recursos |
|---|---|
| Público | Programas (vitrine), indicadores agregados, busca de CEP |
| Famílias | CRUD, endereço com ViaCEP + IBGE, membros (documentos e rendas), renda per capita |
| Operação | Visitas (agendar/editar/registrar/cancelar), atendimentos, encaminhamentos |
| Gestão | Benefícios (conceder → aprovar/indeferir → encerrar), programas, instituições (consulta CNPJ), relatórios |
| Administração | Usuários (perfis, senha) e trilha de auditoria |

O acesso a cada módulo respeita os perfis **Administrador**, **Gestor** e **Assistente Social**.

## Estrutura

```
app/
  (site)/        Site institucional (header/footer próprios)
  login/         Autenticação
  painel/        Sistema integrado (sidebar + guarda por perfil)
components/      UI, layout do site, componentes do painel
lib/             api, auth, hooks, tipos, enums, catálogos e formatadores
```

## Scripts

- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run start` — sobe o build
- `npm run lint` — ESLint
