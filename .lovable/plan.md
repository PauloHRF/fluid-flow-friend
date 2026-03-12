

## Análise do projeto e sugestões de melhoria

Após revisar todo o codebase, aqui estão as melhorias mais impactantes organizadas por prioridade:

---

### 1. Página inicial (Landing Page) não está acessível
A rota `/` aponta direto para `ReynoldsPage`. O componente `Index.tsx` com os cards de navegação nunca é renderizado. Criar uma rota dedicada para a landing page daria uma entrada profissional ao site.

### 2. Responsividade mobile
- O sidebar é fixo com `w-60 min-w-[240px]` e não colapsa em telas pequenas — em mobile o conteúdo fica espremido ou cortado.
- Implementar um menu hamburger com sheet/drawer para mobile.

### 3. Validação de inputs e feedback de erro
- Atualmente, se o usuário não preenche um campo ou coloca valor inválido, o botão "Calcular" simplesmente não faz nada (return silencioso).
- Adicionar mensagens de erro visuais (campo vermelho + texto "Campo obrigatório") usando toast ou inline validation.

### 4. Densidade editável no Bernoulli
- A densidade está hardcoded como `1000 kg/m³`. Adicionar um campo editável (com 1000 como default) amplia a utilidade para outros fluidos.

### 5. Tabela de propriedades de fluidos comuns
- Um dropdown ou modal com densidades e viscosidades pré-carregadas (água, ar, mercúrio, óleo SAE, etc.) para preenchimento rápido.

### 6. Dark mode
- O design system já usa CSS variables (`--background`, `--foreground`). Adicionar um toggle de dark mode seria direto com `next-themes` (já instalado).

### 7. Exportar Memorial de Cálculo para PDF
- Permitir que o aluno exporte o passo a passo como PDF para colar no relatório ou estudar offline.

### 8. SEO e meta tags
- Adicionar títulos e descrições por página para indexação (útil se o site for publicado).

---

### Plano de implementação sugerido (por ordem de impacto)

| # | Melhoria | Esforço |
|---|----------|---------|
| 1 | Landing page como rota `/` + Reynolds em `/reynolds` | Pequeno |
| 2 | Sidebar responsivo com menu hamburger | Médio |
| 3 | Validação de inputs com feedback visual | Médio |
| 4 | Dark mode toggle | Pequeno |
| 5 | Densidade editável no Bernoulli | Pequeno |
| 6 | Dropdown de fluidos comuns | Médio |
| 7 | Export PDF do memorial | Médio |
| 8 | SEO meta tags por página | Pequeno |

