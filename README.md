#  StockPro

> Sistema Web de Controle de Estoque desenvolvido com **Next.js**, **TypeScript** e **Firebase**, projetado para pequenas empresas com suporte a múltiplas organizações, controle de usuários, gerenciamento de estoque, vendas e relatórios.

![Version](https://img.shields.io/badge/version-v1.0.0-blue)
![Status](https://img.shields.io/badge/status-Stable-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

##  Sobre o Projeto

O **StockPro** é um sistema web moderno para gerenciamento de estoque desenvolvido com foco em pequenas empresas. A aplicação oferece autenticação segura, gerenciamento de produtos, controle de vendas, dashboard com indicadores, relatórios, controle de permissões por níveis de acesso e arquitetura multiempresa utilizando Firebase Authentication e Cloud Firestore.

O projeto foi desenvolvido com o objetivo de aplicar boas práticas de desenvolvimento utilizando o ecossistema React/Next.js, TypeScript e Firebase, simulando um cenário de aplicação real utilizada por empresas.


---

#  Demonstração

> **Aplicação Online:** *(Em breve)*

> **Vídeo de demonstração:** *(Em breve)*

> **GIF da aplicação:** *(Em breve)*

Quando o projeto for publicado na Vercel, esta seção será atualizada com:

*  Link da aplicação
*  Vídeo demonstrando as principais funcionalidades
*  GIF mostrando o fluxo completo do sistema


---

#  Screenshots

As imagens abaixo ilustram as principais funcionalidades do StockPro.

> **Em breve serão adicionadas capturas reais do sistema.**

## Telas previstas

*  Login
*  Dashboard
*  Produtos
*  Vendas
*  Analytics
*  Membros
*  Convites
*  Organização


---

#  Funcionalidades

O StockPro foi desenvolvido para oferecer uma solução completa de gerenciamento de estoque para pequenas empresas, com foco em organização, segurança e facilidade de uso.

##  Autenticação

* Login com Firebase Authentication
* Logout seguro
* Rotas protegidas
* Controle de sessão

##  Gestão de Organizações

* Criação de organizações
* Suporte a múltiplas empresas
* Convites para novos membros
* Aceite de convites
* Gerenciamento de membros

##  Controle de Permissões

Três níveis de acesso:

* **Owner** – Controle total da organização.
* **Admin** – Gerenciamento operacional da empresa.
* **Employee** – Operações do dia a dia com permissões limitadas.

##  Gestão de Produtos

* Cadastro de produtos
* Edição de produtos
* Exclusão de produtos
* Pesquisa de produtos
* Controle de estoque
* Estoque mínimo configurável
* Alertas de estoque baixo

##  Gestão de Vendas

* Registro de vendas
* Atualização automática do estoque
* Histórico de vendas
* Cálculo automático de faturamento

##  Dashboard

* Indicadores em tempo real
* Produtos com estoque baixo
* Produtos recentes
* Vendas recentes
* Visão geral do negócio

##  Analytics

* Gráficos de desempenho
* Indicadores de faturamento
* Produtos mais vendidos
* Estatísticas da operação

##  Relatórios

* Geração de PDF das vendas
* Histórico completo das movimentações

##  Segurança

* Firebase Authentication
* Firestore Security Rules
* Controle de acesso por função
* Isolamento de dados por organização (multi-tenant)


---

#  Tecnologias Utilizadas

O StockPro foi desenvolvido utilizando tecnologias modernas do ecossistema JavaScript/TypeScript, priorizando desempenho, escalabilidade e uma boa experiência para o usuário.

| Tecnologia                    | Finalidade                                      |
| ----------------------------- | ----------------------------------------------- |
| **Next.js 15**                | Framework React para desenvolvimento full-stack |
| **React 19**                  | Construção da interface de usuário              |
| **TypeScript**                | Tipagem estática e maior segurança no código    |
| **Firebase Authentication**   | Autenticação e gerenciamento de usuários        |
| **Cloud Firestore**           | Banco de dados NoSQL em tempo real              |
| **Tailwind CSS**              | Estilização da interface                        |
| **Recharts**                  | Gráficos e indicadores do Dashboard             |
| **Lucide React**              | Biblioteca de ícones                            |
| **Sonner**                    | Notificações (Toast)                            |
| **Firebase Hosting / Vercel** | Publicação da aplicação (produção)              |
| **Git & GitHub**              | Controle de versão e hospedagem do código       |

##  Boas práticas utilizadas

* Arquitetura baseada em componentes reutilizáveis
* Organização por módulos
* Hooks customizados
* Context API para gerenciamento de estado
* Serviços desacoplados da interface
* Firestore Security Rules
* Controle de acesso baseado em papéis (RBAC)
* Arquitetura Multi-Tenant
* Código tipado com TypeScript
* Interface responsiva
* Componentização para facilitar manutenção e evolução


---

#  Arquitetura do Projeto

O StockPro foi desenvolvido seguindo uma arquitetura modular, separando responsabilidades entre interface, regras de negócio, serviços e acesso aos dados.

```text
Usuário
    │
    ▼
Next.js (App Router)
    │
    ▼
React Components
    │
    ▼
Contexts + Hooks
    │
    ▼
Services
    │
    ▼
Firebase Authentication
    │
    ▼
Cloud Firestore
```

##  Organização das Pastas

```text
src/
├── app/                # Páginas e rotas da aplicação
├── components/         # Componentes reutilizáveis
├── contexts/           # Context API (Autenticação e estados globais)
├── hooks/              # Hooks personalizados
├── lib/                # Configurações e tipos
├── services/           # Comunicação com Firebase
├── utils/              # Funções auxiliares
└── middleware.ts       # Proteção de rotas
```

##  Organização do Código

O projeto foi estruturado para manter responsabilidades bem definidas:

* **Components:** Interface reutilizável.
* **Hooks:** Regras reutilizáveis e gerenciamento de dados.
* **Contexts:** Estado global da aplicação.
* **Services:** Comunicação com Firebase Authentication e Firestore.
* **Utils:** Funções utilitárias compartilhadas.
* **Lib:** Configurações, tipos e inicialização dos serviços.

Essa organização facilita a manutenção, evolução e escalabilidade do sistema.


---

#  Estrutura do Banco de Dados

O StockPro utiliza o **Cloud Firestore** como banco de dados principal, organizando as informações de forma segura e escalável.

A aplicação segue uma arquitetura **multi-tenant**, onde cada organização possui seus próprios dados isolados.

##  Estrutura das Coleções

```text
users/
 └── {userId}

organizations/
 └── {organizationId}
      ├── members/
      ├── produtos/
      ├── vendas/
      └── invites/

inviteTokens/
```

##  Descrição das Coleções

### users

Armazena informações globais dos usuários.

Exemplos:

* Nome
* Email
* Cargo (Role)
* Organização
* Data de criação

---

### organizations

Representa cada empresa cadastrada no sistema.

Cada organização possui suas próprias subcoleções.

---

### members

Lista todos os usuários pertencentes à organização.

Informações armazenadas:

* UID
* Nome
* Email
* Cargo
* Status

---

### produtos

Cadastro completo dos produtos.

Informações:

* Nome
* Categoria
* Preço
* Quantidade em estoque
* Estoque mínimo
* Datas de criação e atualização

---

### vendas

Registro das vendas realizadas.

Cada venda contém:

* Produtos vendidos
* Quantidade
* Valor total
* Data
* Usuário responsável

---

### invites

Convites enviados para novos membros.

Informações:

* Email
* Cargo
* Token
* Expiração
* Status

---

### inviteTokens

Coleção utilizada para validação e aceite dos convites enviados.

##  Isolamento dos Dados

Cada organização acessa apenas seus próprios dados.

Esse isolamento é garantido por:

* Firebase Authentication
* Firestore Security Rules
* Controle de permissões baseado em papéis (RBAC)
* Identificação da organização vinculada ao usuário autenticado


---

#  Controle de Permissões

O StockPro utiliza um modelo de **Controle de Acesso Baseado em Papéis (RBAC - Role-Based Access Control)** para garantir que cada usuário tenha acesso apenas às funcionalidades permitidas.

##  Owner

O **Owner** é o proprietário da organização e possui acesso completo ao sistema.

### Permissões

* Gerenciar produtos
* Registrar e visualizar vendas
* Gerenciar membros
* Enviar convites
* Alterar cargos dos usuários
* Gerenciar a organização
* Acessar dashboard e analytics
* Gerar relatórios

---

##  Admin

O **Admin** auxilia na administração da organização.

### Permissões

* Gerenciar produtos
* Registrar e visualizar vendas
* Gerenciar membros
* Enviar convites
* Acessar dashboard e analytics

### Restrições

* Não pode assumir a propriedade da organização.
* Não possui permissões exclusivas do Owner.

---

##  Employee

O **Employee** possui acesso apenas às operações do dia a dia.

### Permissões

* Visualizar produtos
* Registrar vendas
* Consultar informações necessárias para a operação

### Restrições

* Não pode gerenciar membros
* Não pode enviar convites
* Não pode alterar cargos
* Não pode acessar configurações administrativas

---

##  Segurança

O controle de acesso é garantido por:

* Firebase Authentication
* Cloud Firestore Security Rules
* Validação por papéis (Owner, Admin e Employee)
* Isolamento dos dados entre organizações (Multi-Tenant)

Todas as operações são validadas tanto na interface da aplicação quanto nas regras de segurança do Firestore, garantindo uma camada adicional de proteção.


---

#  Instalação e Execução

Siga os passos abaixo para executar o StockPro localmente.

##  Pré-requisitos

Antes de iniciar, certifique-se de possuir instalado:

* Node.js 20 ou superior
* Git
* Conta no Firebase
* Projeto configurado no Firebase Authentication
* Cloud Firestore habilitado

---

##  Clonando o repositório

```bash
git clone https://github.com/davilero27/stockpro.git

cd stockpro
```

---

##  Instalando as dependências

```bash
npm install
```

---

##  Configurando as variáveis de ambiente

Crie um arquivo:

```text
.env.local
```

Configure as credenciais do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> **Importante:** Nunca envie o arquivo `.env.local` para o GitHub. Utilize um arquivo `.env.example` para documentar as variáveis necessárias.

---

##  Executando o projeto

```bash
npm run dev

```

A aplicação estará disponível em:

```text
http://localhost:3000

```

---

##  Build para produção

```bash
npm run build

```

Para iniciar a aplicação em modo de produção:

```bash
npm start

```

---

#  Roadmap

##  Versão 1.0

* [x] Sistema de autenticação
* [x] Controle de organizações (Multi-Tenant)
* [x] Dashboard com indicadores
* [x] Cadastro de produtos
* [x] Controle de estoque
* [x] Controle de estoque mínimo
* [x] Registro de vendas
* [x] Atualização automática do estoque
* [x] Histórico de vendas
* [x] Relatórios em PDF
* [x] Analytics
* [x] Gestão de membros
* [x] Sistema de convites
* [x] Controle de permissões (Owner, Admin e Employee)
* [x] Firestore Security Rules

##  Futuras melhorias

* [ ] Dashboard ainda mais personalizável
* [ ] Upload de imagens dos produtos
* [ ] Leitor de código de barras
* [ ] Cadastro de fornecedores
* [ ] Controle de clientes
* [ ] Exportação para Excel
* [ ] Backup automático
* [ ] Notificações em tempo real
* [ ] Tema claro
* [ ] Testes automatizados
* [ ] Progressive Web App (PWA)

---

#  Contribuição

Contribuições são bem-vindas.

Caso encontre algum problema ou tenha sugestões de melhoria, abra uma **Issue** ou envie um **Pull Request**.

---

#  Licença

Este projeto está licenciado sob a licença **MIT**.

Consulte o arquivo `LICENSE` para mais informações.

---

#  Autor

**Davi dos Santos**

Projeto desenvolvido para fins de estudo, aprimoramento técnico e composição de portfólio profissional.

### Contato

* GitHub: https://github.com/davilero27
* LinkedIn: *(Adicionar futuramente)*
* Portfólio: *(Adicionar futuramente)*

---

⭐ Se este projeto foi útil para você, considere deixar uma **estrela** no repositório.
