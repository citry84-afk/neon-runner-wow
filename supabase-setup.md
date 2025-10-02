# 🗄️ Configuración de Supabase para Leaderboard Global

## 📋 Pasos para Configurar la Base de Datos Global

### 1. **Crear Cuenta en Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto

### 2. **Crear la Tabla de Puntuaciones**
Ejecuta este SQL en el editor SQL de Supabase:

```sql
-- Crear tabla de puntuaciones
CREATE TABLE scores (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(15) NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER DEFAULT 1,
    combo INTEGER DEFAULT 0,
    game VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    device_id VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_scores_game_date ON scores(game, date);
CREATE INDEX idx_scores_score_desc ON scores(score DESC);
CREATE INDEX idx_scores_date ON scores(date);

-- Habilitar Row Level Security (RLS)
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Allow public read access" ON scores
    FOR SELECT USING (true);

-- Política para permitir inserción pública
CREATE POLICY "Allow public insert access" ON scores
    FOR INSERT WITH CHECK (true);
```

### 3. **Obtener Credenciales**
1. Ve a **Settings** > **API**
2. Copia la **Project URL**
3. Copia la **anon public** key

### 4. **Configurar el Código**
Actualiza el archivo `leaderboard-global.js` con tus credenciales:

```javascript
this.apiUrl = 'https://tu-proyecto.supabase.co'; // Tu Project URL
this.apiKey = 'tu-anon-key'; // Tu anon public key
```

### 5. **Actualizar el HTML**
Reemplaza el leaderboard actual en `index.html`:

```html
<script src="leaderboard-global.js"></script>
```

## 🚀 **Ventajas del Sistema Global:**

### ✅ **Funcionalidades:**
- **Ranking Global**: Todos los jugadores ven el mismo ranking
- **Tiempo Real**: Las puntuaciones se actualizan instantáneamente
- **Persistencia**: Los datos se mantienen en la nube
- **Escalabilidad**: Soporta miles de jugadores
- **Seguridad**: Row Level Security habilitado

### 📊 **Datos Guardados:**
- Nombre del jugador
- Puntuación obtenida
- Nivel alcanzado
- Combo máximo
- Fecha del juego
- ID del dispositivo
- Timestamp de la puntuación

### 🔄 **Sincronización:**
- **Automática**: Al enviar puntuación
- **Manual**: Botón "Actualizar" en el ranking
- **Tiempo Real**: Cambios visibles inmediatamente

## 🛠️ **Configuración Alternativa (Sin Supabase)**

Si prefieres una solución más simple, puedo implementar un sistema usando:
- **Firebase** (Google)
- **Airtable** (API simple)
- **JSONBin** (Base de datos JSON simple)

¿Cuál prefieres?
