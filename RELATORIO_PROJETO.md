# Relatorio do Projeto - Meu Projeto Estoque

Data: 18/06/2026

## 1. Visao geral

O projeto e uma aplicacao web de controle de estoque e vendas, desenvolvida com Next.js, React, TypeScript e Firebase. O sistema permite gerenciar produtos, registrar vendas, acompanhar indicadores no dashboard, controlar membros da organizacao e operar com isolamento de dados por organizacao.

A aplicacao usa Firebase Authentication para login/cadastro e Cloud Firestore como banco principal. Os dados de negocio ficam organizados por tenant no caminho `organizations/{organizationId}`, separando produtos, vendas, membros e convites por organizacao.

## 2. Objetivo do sistema

O objetivo principal e oferecer uma ferramenta simples para pequenas operacoes comerciais acompanharem:

- Cadastro e manutencao de produtos.
- Controle de estoque.
- Registro de vendas.
- Baixa automatica de estoque durante vendas.
- Historico e analise de vendas.
- Indicadores de faturamento e estoque baixo.
- Gestao de usuarios por papel dentro de uma organizacao.

## 3. Tecnologias utilizadas

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Firebase `12.12.1`
- Firebase Admin `10.3.0`
- Cloud Firestore
- Firebase Authentication
- Tailwind CSS `4`
- Lucide React para icones
- Recharts para graficos
- jsPDF e jsPDF AutoTable para relatorios em PDF
- Zod para validacao
- Sonner para notificacoes

## 4. Estrutura principal

As principais areas do projeto estao em `src/app`:

- `/dashboard`: visao geral com indicadores, grafico de vendas, produtos recentes, vendas recentes e estoque baixo.
- `/produtos`: cadastro, edicao, listagem e exclusao de produtos.
- `/vendas`: registro de vendas com multiplos produtos e baixa automatica de estoque.
- `/historico`: historico de vendas.
- `/analytics`: relatorios e analise de vendas.
- `/membros`: gerenciamento de membros da organizacao.
- `/convites`: criacao e gestao de convites.
- `/convite/[token]`: aceitacao de convite por token.
- `/login`, `/cadastro`, `/forgot-password`: fluxo de autenticacao.
- `/onboarding/organization`: criacao inicial da organizacao.
- `/organizacao`: configuracoes da organizacao.

## 5. Modelo de dados

O projeto usa um modelo multi-tenant baseado em organizacoes.

Colecoes principais:

- `users/{uid}`: perfil do usuario, `organizationId` e `role`.
- `organizations/{organizationId}`: dados da organizacao.
- `organizations/{organizationId}/members/{memberId}`: membros da organizacao.
- `organizations/{organizationId}/invites/{inviteId}`: convites internos da organizacao.
- `inviteTokens/{token}`: indice publico de convites por token.
- `organizations/{organizationId}/produtos/{productId}`: produtos da organizacao.
- `organizations/{organizationId}/vendas/{saleId}`: vendas da organizacao.

As colecoes legadas de raiz `produtos` e `vendas` estao bloqueadas nas regras do Firestore.

## 6. Autenticacao e autorizacao

O contexto de autenticacao fica em `src/contexts/AuthContext.tsx`.

Ele controla:

- Usuario autenticado.
- Estado de carregamento.
- `organizationId`.
- `tenantId`, atualmente equivalente ao `organizationId`.
- Papel do usuario: `owner`, `admin` ou `employee`.
- Login, cadastro, logout e recarregamento do perfil.

O perfil pode vir de custom claims do Firebase Auth ou do documento `users/{uid}` no Firestore. Quando nao ha papel definido, o fallback usado e `employee`.

## 7. Papeis e permissoes

Os papeis usados pelo sistema sao:

- `owner`: dono da organizacao.
- `admin`: administrador.
- `employee`: funcionario.

Resumo das permissoes atuais nas Firestore Rules:

- Usuarios autenticados podem ler e atualizar o proprio documento em `users/{uid}`.
- Apenas usuarios da mesma organizacao podem ler dados da organizacao.
- Apenas `owner` pode atualizar a organizacao.
- `owner` e `admin` podem gerenciar produtos.
- `owner`, `admin` e `employee` podem criar vendas.
- Atualizacoes e cancelamentos de vendas continuam restritos a administradores.
- `employee` pode reduzir estoque de produtos somente no caso estrito de baixa de estoque durante venda.

## 8. Fluxo de produtos

O servico de produtos esta em `src/services/products.ts`.

Principais operacoes:

- `createProduct`: cria produto em `organizations/{organizationId}/produtos`.
- `updateProduct`: atualiza dados do produto e grava `atualizadoEm`.
- `deleteProduct`: remove produto.
- `getProductsCollection`: retorna a collection tenantizada de produtos.

A listagem de produtos usa listeners em tempo real com `onSnapshot`.

## 9. Fluxo de vendas

O servico de vendas esta em `src/services/sales.ts`.

A criacao de venda acontece em `createSale()`, que usa uma transacao Firestore:

1. Calcula subtotal e total.
2. Busca os produtos envolvidos na venda.
3. Valida existencia dos produtos.
4. Valida estoque disponivel.
5. Atualiza o estoque de cada produto.
6. Cria o documento da venda.

Esse fluxo garante que a venda e a baixa de estoque sejam feitas como uma unidade atomica. Se uma parte falhar, a transacao inteira e cancelada.

## 10. Correcao recente em Firestore Rules

Foi identificado que usuarios com role `employee` conseguiam criar vendas, mas a transacao falhava ao tentar atualizar o estoque dos produtos. A causa era que as regras de produtos permitiam `update` apenas para `admin` e `owner`.

A correcao minima aplicada foi criar uma permissao especifica para baixa de estoque:

- O usuario precisa pertencer a mesma organizacao.
- O usuario precisa poder gerenciar vendas.
- A atualizacao pode alterar apenas `estoque` e `atualizadoEm`.
- O estoque precisa continuar maior ou igual a zero.
- O novo estoque precisa ser menor que o estoque anterior.
- `atualizadoEm` precisa corresponder a `request.time`.

Com isso, `employee` pode registrar vendas normalmente sem receber permissoes administrativas extras.

## 11. Dashboard e analytics

O dashboard usa os hooks `useProducts` e `useSales` para calcular:

- Total de produtos.
- Vendas do dia.
- Faturamento do dia.
- Diferencas em relacao ao dia anterior.
- Produtos com estoque baixo.
- Grafico dos ultimos 7 dias.
- Produtos recentes.
- Vendas recentes.

Os componentes de dashboard estao em `src/components/dashboard`.

## 12. Convites e membros

O fluxo de convites esta em `src/services/organizations.ts`.

Principais operacoes:

- Criacao de convite com token unico.
- Registro de convite interno em `organizations/{organizationId}/invites`.
- Registro publico em `inviteTokens/{token}`.
- Aceitacao de convite por transacao.
- Criacao/atualizacao do perfil do usuario convidado.
- Criacao/atualizacao do membro na organizacao.

O gerenciamento de membros fica em `/membros` e e protegido por `RoleGuard`, permitindo acesso apenas a `owner` e `admin`.

## 13. Seguranca

Pontos positivos:

- Dados de produtos e vendas ficam isolados por organizacao.
- Colecoes legadas de raiz estao bloqueadas.
- Convites tem token e status.
- Roles sao centralizadas nas Firestore Rules.
- A baixa de estoque por `employee` foi limitada por campos e por direcao da alteracao.

Pontos de atencao:

- Algumas regras permitem criacao/atualizacao do proprio documento de usuario com pouca validacao de campos.
- As regras de produtos validam permissao, mas nao validam completamente o formato dos documentos criados por administradores.
- Nao ha testes automatizados de Firestore Rules no repositorio.
- Ha textos com problemas de encoding em alguns arquivos, exibindo caracteres quebrados.

## 14. Qualidade e validacao

Scripts disponiveis:

- `npm run dev`: inicia o ambiente de desenvolvimento.
- `npm run build`: gera build de producao.
- `npm run start`: inicia o build.
- `npm run lint`: executa ESLint.

Ultima validacao realizada:

- `npm run lint` executado com sucesso.

## 15. Pendencias recomendadas

Recomendacoes para evolucao do projeto:

- Criar testes automatizados para Firestore Rules.
- Validar schema completo de produtos e vendas nas regras.
- Revisar validacoes de `users/{uid}` para evitar alteracoes indevidas de `role` e `organizationId`.
- Corrigir encoding dos textos quebrados nos arquivos fonte.
- Adicionar testes de fluxo para criacao de venda e baixa de estoque.
- Avaliar regra especifica para cancelamento de venda, caso funcionarios tambem precisem cancelar vendas no futuro.

## 16. Conclusao

O projeto esta estruturado como uma aplicacao multi-tenant de estoque e vendas com Firebase, separacao por organizacao e controle de acesso por papel. O fluxo principal de venda ja usa transacao para manter consistencia entre venda e estoque.

A correcao recente nas Firestore Rules resolveu o bloqueio de permissao para funcionarios registrarem vendas com baixa automatica de estoque, mantendo a seguranca do gerenciamento administrativo de produtos.
