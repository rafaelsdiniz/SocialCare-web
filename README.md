# SocialCare (Web)

Front-end do SocialCare, um sistema de gestão de assistência social. O projeto junta
duas coisas no mesmo app Next.js:

- o site institucional (público): home, programas sociais, indicadores, mapa e contato;
- o sistema (com login): a parte operacional e gerencial, que consome a SocialCare API.

Projeto feito como trabalho da disciplina de Tópicos III.

- Aluno: Rafael Silva Diniz
- Instituição: Unitins
- Disciplina: Tópicos III
- Professor: Itamar

## Tecnologias

- Next.js 16 (App Router) com React 19 e TypeScript
- Tailwind CSS v4
- Autenticação por JWT (token guardado no navegador), consumindo a API direto

## Pré-requisitos

A SocialCare API precisa estar rodando (por padrão em `http://localhost:5128`). O
passo a passo pra subir o back-end está no README do repositório `socialcare-api`.

## Configuração

Crie um arquivo `.env.local` (tem um `.env.example` de referência):

```
NEXT_PUBLIC_API_URL=http://localhost:5128
```

## Como rodar

```bash
npm install
npm run dev
```

Depois é só abrir `http://localhost:3000`.

### Primeiro acesso

A API cria um administrador no primeiro boot:

- login: `admin`
- senha: `ChangeMe@123`

Logado como admin dá pra cadastrar os Gestores e Assistentes Sociais na tela de Usuários.

## O que dá pra fazer

- Site público: vitrine de programas, indicadores agregados, mapa e busca de CEP
- Famílias: cadastro completo, endereço com ViaCEP/IBGE, membros (documentos e rendas) e cálculo de renda per capita
- Operação: visitas (agendar, registrar, cancelar), atendimentos e encaminhamentos
- Gestão: benefícios (conceder, aprovar/indeferir, encerrar), programas, instituições parceiras (com consulta de CNPJ) e relatórios
- Administração: usuários e trilha de auditoria

Cada módulo respeita o perfil do usuário (Administrador, Gestor ou Assistente Social).

## Organização

```
app/
  (site)/   site institucional
  login/    autenticação
  painel/   sistema (sidebar e proteção por perfil)
components/  componentes de UI, do site e do painel
lib/         api, auth, hooks, tipos, enums e formatadores
```

## Scripts

- `npm run dev` - ambiente de desenvolvimento
- `npm run build` - build de produção
- `npm run start` - sobe o build gerado
- `npm run lint` - ESLint
