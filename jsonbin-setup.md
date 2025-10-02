# 🗄️ Configuración de JSONBin para Leaderboard Global (SIMPLE)

## 📋 Pasos para Configurar la Base de Datos Global

### 1. **Crear Cuenta en JSONBin**
1. Ve a [jsonbin.io](https://jsonbin.io)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. **Crear un Bin**
1. Haz clic en **"Create Bin"**
2. Ponle nombre: `neon-runner-leaderboard`
3. En el contenido inicial, pega esto:
```json
{
  "2024-10-02": []
}
```
4. Haz clic en **"Create"**

### 3. **Obtener Credenciales**
1. Ve a **"My Bins"**
2. Copia el **Bin ID** (algo como: `507f1f77bcf86cd799439011`)
3. Ve a **"API Keys"**
4. Copia tu **Master Key** (algo como: `$2a$10$...`)

### 4. **Configurar el Código**
Actualiza el archivo `leaderboard-simple-global.js` con tus credenciales:

```javascript
this.binId = '507f1f77bcf86cd799439011'; // Tu Bin ID
this.apiKey = '$2a$10$...'; // Tu Master Key
```

### 5. **Actualizar el HTML**
Reemplaza el leaderboard actual en `index.html`:

```html
<script src="leaderboard-simple-global.js"></script>
```

## 🚀 **Ventajas del Sistema Global:**

### ✅ **Funcionalidades:**
- **Ranking Global**: Todos los jugadores ven el mismo ranking
- **Tiempo Real**: Las puntuaciones se actualizan instantáneamente
- **Persistencia**: Los datos se mantienen en la nube
- **Gratuito**: Hasta 10,000 requests por mes
- **Simple**: Fácil de configurar

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

## 🛠️ **Configuración Rápida (5 minutos)**

### Paso 1: Crear Bin
1. Ve a [jsonbin.io](https://jsonbin.io)
2. Crea cuenta
3. Crea bin con contenido: `{"2024-10-02": []}`

### Paso 2: Obtener Credenciales
1. Copia Bin ID
2. Copia Master Key

### Paso 3: Actualizar Código
```javascript
// En leaderboard-simple-global.js línea 6-7:
this.binId = 'TU_BIN_ID_AQUI';
this.apiKey = 'TU_MASTER_KEY_AQUI';
```

### Paso 4: Cambiar HTML
```html
<!-- En index.html línea 32, cambiar: -->
<script src="leaderboard-simple-global.js"></script>
```

## 🎯 **Resultado Final:**
- ✅ Ranking global visible para todos los jugadores
- ✅ Puntuaciones sincronizadas entre dispositivos
- ✅ Datos persistentes en la nube
- ✅ Sistema escalable y confiable

¿Quieres que configure esto ahora mismo?
