

## Conversão de Unidades nos Inputs

### Conceito

Adicionar um seletor de unidade ao lado de cada campo numérico. O usuário digita o valor na unidade que preferir (ex: mm, cm, pol) e o sistema converte automaticamente para a unidade base (SI) antes do cálculo. A conversão é transparente — o valor exibido é o que o usuário digitou, mas internamente o cálculo sempre usa SI.

### Arquitetura

**1. Definir mapa de unidades por dimensão**

Criar `src/lib/units.ts` com grupos de unidades:

```text
length:    mm (×0.001), cm (×0.01), m (×1), pol/in (×0.0254)
area:      mm² (×1e-6), cm² (×1e-4), m² (×1)
volume:    L (×0.001), cm³ (×1e-6), m³ (×1)
velocity:  cm/s (×0.01), m/s (×1), km/h (×1/3.6)
pressure:  Pa (×1), kPa (×1000), atm (×101325), bar (×1e5), psi (×6894.76), mmHg (×133.322)
density:   kg/m³ (×1)
viscosity: Pa·s (×1), cP (×0.001)
mass:      g (×0.001), kg (×1)
```

Cada grupo tem uma `baseUnit` e uma lista de `{ label, factor }`.

**2. Modificar `InputField`**

Adicionar prop opcional `unitGroup?: string`. Quando presente:
- Renderizar um `<select>` compacto ao lado do input (dentro de um flex row)
- Armazenar a unidade selecionada internamente via `useState`
- Adicionar nova prop `onConvertedChange?: (baseValue: number) => void` ou simplesmente uma nova callback que retorna o valor já convertido

Abordagem mais simples: adicionar props `unitOptions` e `selectedUnit`/`onUnitChange` ao `InputField`, e deixar cada página controlar a conversão. Mas isso exigiria muitas mudanças em cada página.

**Abordagem escolhida (mais limpa):** O `InputField` recebe `unitGroup` e expõe `getBaseValue()` via o valor convertido. Internamente, o componente mostra o seletor e a label da unidade muda conforme seleção. O `onChange` continua retornando o valor digitado (string), mas adicionamos um `onBaseValueChange?: (val: number) => void` opcional. No entanto, para manter compatibilidade, a abordagem mais prática é:

- `InputField` recebe `unitGroup` opcionalmente
- Quando presente, mostra dropdown de unidades ao lado do input
- O `onChange` continua passando o valor bruto (string)
- Adicionamos `conversionFactor` como state no InputField e passamos via um novo callback `onFactorChange?: (factor: number) => void`

**Abordagem final mais simples:** Cada página já faz `parseFloat(value)` no cálculo. Basta multiplicar pelo fator de conversão. Vou criar um hook/utility e fazer o `InputField` gerenciar a unidade selecionada internamente, expondo o fator via callback.

### Implementação

**Arquivo: `src/lib/units.ts`**
- Exportar `unitGroups` com todas as dimensões acima
- Exportar `getConversionFactor(group, unit)` e `getUnitOptions(group)`

**Arquivo: `src/components/InputField.tsx`**
- Nova prop opcional: `unitGroup?: string`
- Quando `unitGroup` é fornecido, renderizar um `<select>` inline à direita do input com as opções do grupo
- A unidade default é a baseUnit (fator = 1)
- O label `(unit)` atualiza automaticamente com a unidade selecionada
- Nova prop: `onUnitFactorChange?: (factor: number) => void` — chamada quando o usuário troca a unidade

**Páginas (todas as 7):**
- Cada campo com unidade conversível recebe `unitGroup` correspondente
- Armazenar fatores de conversão no state da página (um por campo)
- Na função `calculate()`, multiplicar `parseFloat(value) * factor` em vez de só `parseFloat(value)`

### Campos afetados por página

| Página | Campos com conversão |
|--------|---------------------|
| Reynolds | Diâmetro (length), Velocidade (velocity), Viscosidade (viscosity), Densidade (density) |
| Bernoulli | Pressão (pressure), Velocidade (velocity), Cota (length) |
| Continuidade | Diâmetro/Área (length/area), Velocidade (velocity), Densidade (density) |
| Empuxo | Dimensões (length), Volume (volume), Massa (mass), Densidade (density) |
| Darcy-Weisbach | Comprimento/Diâmetro/Rugosidade (length), Velocidade (velocity), Densidade/Viscosidade |
| NPSH | Pressão (pressure), Altura (length), Velocidade (velocity), Densidade (density) |
| Manometria | Densidade (density), Altura (length) |

### Visual

O seletor aparece como um pequeno dropdown compacto integrado à direita do input, formando um grupo visual coeso:

```text
┌──────────────────────────┬──────┐
│  0.05                    │  m ▾ │
└──────────────────────────┴──────┘
```

Estilo: borda compartilhada, o select tem `bg-muted` para diferenciar do input.

