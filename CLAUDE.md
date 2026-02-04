# Demo ERP - TRAID Agency

## Propósito

Demo de dashboard de inventario para e-commerce, mostrando capacidades de TRAID Agency.
Empresa ficticia: **TechStore CL** (accesorios tecnológicos en Mercado Libre Chile).

## Stack

- Next.js 15.1.0 + React 19
- TypeScript strict
- Tailwind CSS 3.4 + Glassmorphism
- Recharts 2.15
- Radix UI + Lucide Icons
- Framer Motion (animaciones)

## Datos

- **Todos los datos son sintéticos** (archivos JSON en `/data`)
- Empresa: "TechStore CL"
- Moneda: CLP (peso chileno)
- No hay conexión a Supabase real

## Branding TRAID

| Color | Hex | Uso |
|-------|-----|-----|
| Primario | `#7c3aed` | Acciones, links, highlights |
| Acento | `#db2777` | CTAs, alertas importantes |
| Background | `#0f172a` | Dark mode (default) |

## Estructura

```
app/
├── dashboard/           # Páginas del dashboard
│   ├── page.tsx         # Overview con KPIs
│   ├── inventario/      # Tabla de productos
│   ├── pareto/          # Análisis 80/20
│   ├── ventas/          # Tendencias
│   ├── alertas/         # Centro de alertas
│   ├── costos/          # Gestión de costos
│   └── proveedores/     # Por proveedor
components/
├── ui/                  # Componentes base (Radix)
├── layout/              # Sidebar, Header
├── dashboard/           # KPICard, Charts
└── features/            # Semáforos, tablas específicas
data/                    # JSONs sintéticos
lib/                     # Utils y cálculos
```

## Comandos

```bash
npm run dev    # Desarrollo (Turbopack)
npm run build  # Build producción
npm run start  # Servidor producción
npm run lint   # Linter
```

## Deploy

Vercel - Sin variables de entorno requeridas.

## Notas

- Dark mode por defecto
- Responsive (mobile-first)
- Sin dependencias de backend
