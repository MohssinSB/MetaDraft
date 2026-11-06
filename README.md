# MetaDraft ⚔️

**MetaDraft** es una herramienta web interactiva de análisis de cobertura de tipos (defensiva y ofensiva) y simulador de enfrentamientos para torneos competitivos de Pokémon, diseñada con soporte completo tanto para formatos estándar como para torneos en **Modo Random / Draft League**.

🌐 **Demo en vivo (GitHub Pages):** [https://mohssinsb.github.io/MetaDraft/](https://mohssinsb.github.io/MetaDraft/)

---

## ✨ Características Principales

### 1. Constructor de Equipos con PokéAPI y Modo Random
- **Buscador con autocompletado en tiempo real** conectado a **PokéAPI** (~1.300 especies/formas y ~1.000 movimientos).
- **Traducción automática de movimientos al español** con detección de categoría (*Físico*, *Especial*, *Estado*) y potencia.
- **Flexibilidad para Modo Random**:
  - Permite asignar **cualquier movimiento del juego** a cualquier Pokémon o añadir ataques rápidos por tipo.
  - Permite personalizar manualmente el **Tipo Primario**, **Tipo Secundario** y la **Habilidad Defensiva** por si las reglas del torneo randomizan tipos o habilidades.
- **Guardado automático** en el navegador (`localStorage`) tanto para tu equipo como para el equipo rival.

### 2. Análisis de Cobertura Ofensiva (Global e Individual)
- **Resumen individual en cada tarjeta**: Muestra directamente a cuántos y a cuáles de los **18 tipos** golpea en súper efectivo (`2x`) cada Pokémon por sí solo.
- **Panel de Cobertura Ofensiva con filtro por Pokémon**:
  - Visualiza qué tipos cubres con todo el equipo o filtra haciendo clic en un Pokémon concreto.
  - Detalla qué Pokémon y qué ataque cubren cada tipo elemental.
  - Filtra automáticamente los movimientos de **Estado** (*Protección*, *Danza Espada*, *Fuego Fatuo*) para no falsear la cobertura de daño.
  - Distingue ataques con bonificación **STAB** (`x1.5`).

### 3. Matriz de Cobertura Defensiva y Alertas
- **Tabla `18x6`** que calcula los multiplicadores exactos (`0`, `¼`, `½`, `1`, `2x`, `4x`) que recibe cada miembro de tu equipo frente a los 18 tipos de ataque.
- **Detector de amenazas defensivas**: Alerta automáticamente cuando tu equipo acumula demasiadas debilidades a un mismo tipo o carece de resistencias/inmunidades frente a él.

### 4. Mecánicas Especiales, Habilidades y Teracristalización
- **Habilidades que alteran la tabla de tipos**:
  - Inmunidades y resistencias: *Levitación*, *Absorbe Fuego*, *Absorbe Agua*, *Absorbe Elec*, *Colector*, *Pararrayos*, *Electromotor*, *Comebarro*, *Cuerpo Horneado*, *Herbívoro*, *Piel Seca*, *Sebo*, *Sal Purificadora*, *Ignífugo*, *Peluche*.
  - Habilidades climáticas/especiales: **Ráfaga Delta** (*Delta Stream*, atenúa las debilidades de la parte Volador), **Tierra del Ocaso** (*Desolate Land*), **Mar del Albor** (*Primordial Sea*) y **Superguarda** (*Wonder Guard*).
- **Movimientos con eficacia especial**:
  - *Liofilización* (`freeze-dry`): Tipo Hielo, pero golpea `2x` al tipo Agua (`4x` a Agua/Tierra o Agua/Volador).
  - *Mil Flechas* (`thousand-arrows`): Tipo Tierra capaz de golpear neutro (`1x`) a Pokémon de tipo Volador.
  - *Plancha Voladora* (`flying-press`): Combina los tipos Lucha y Volador en su cálculo de efectividad.
- **Simulador de Teracristalización (`💎 Tera`)**: Activa o desactiva el Teratipo de cualquier Pokémon con un clic para comprobar al instante cómo cambian sus debilidades defensivas y sus STABs.

### 5. Analizador Cara a Cara contra Rival e Importador Showdown
- **Modo Equipo Rival y Cara a Cara (`⚔️ Cara a Cara vs Rival`)**: Introduce el equipo de tu rival del torneo para ver exactamente qué movimientos de tus Pokémon hacen `2x` o `4x` a cada Pokémon concreto de tu amigo y qué amenazas tiene él contra los tuyos.
- **Importar / Exportar Pokémon Showdown (*Pokepaste*)**: Copia tu equipo en formato estándar de Showdown o pega un texto de Showdown para importarlo automáticamente.

---

## 🛠️ Stack Tecnológico

- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Frontend:** [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Datos:** [PokéAPI](https://pokeapi.co/) (con caché en memoria y `localStorage`)

---

## 📁 Estructura del Proyecto

```text
MetaDraft/
├── .github/workflows/
│   └── deploy.yml                # Despliegue automático en GitHub Pages
├── src/
│   ├── data/                     # Datos estáticos del dominio
│   │   ├── typeChart.ts          # Matriz 18x18 de tipos, nombres en español y colores
│   │   ├── abilityModifiers.ts   # Habilidades defensivas (Levitación, Ráfaga Delta, Sebo...)
│   │   └── specialMoves.ts       # Reglas especiales (Liofilización, Mil Flechas, Plancha Voladora)
│   ├── types/
│   │   └── pokemon.ts            # Interfaces y tipos de TypeScript
│   ├── core/                     # Motor matemático puro
│   │   ├── effectiveness.ts      # Cálculo de multiplicadores, habilidades, Teratipo y ataques especiales
│   │   ├── defensiveAnalyzer.ts  # Análisis defensivo del equipo y detector de amenazas
│   │   ├── offensiveAnalyzer.ts  # Cobertura ofensiva global e individual por Pokémon
│   │   └── showdownParser.ts     # Parser y exportador de formato Pokémon Showdown
│   ├── services/
│   │   ├── pokeapi.ts            # Cliente de PokéAPI con autocompletado, traducción al español y caché
│   │   └── storage.ts            # Persistencia en localStorage
│   ├── hooks/
│   │   ├── useTeamCoverage.ts    # Estado de Mi Equipo, Equipo Rival y cálculos reactivos
│   │   └── usePokemonSearch.ts   # Hook de búsqueda en los catálogos de PokéAPI
│   └── components/
│       ├── team/                 # Grid del equipo, tarjetas, modal editor y modal de Showdown
│       └── analysis/             # Matriz defensiva, cobertura ofensiva, alertas y Cara a Cara
└── tests/                        # Suite de tests unitarios con Vitest
```

---

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/MohssinSB/MetaDraft.git
   cd MetaDraft
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

3. **Ejecutar las pruebas unitarias:**
   ```bash
   npm run test -- --run
   ```

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
