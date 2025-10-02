# 🏆 Guía del Sistema de Leaderboard - Neon Runner WOW

## ✅ ¿Qué está implementado?

Tu juego **Neon Runner WOW** ya tiene integrado el sistema completo de leaderboard con todas las funcionalidades:

### 🎮 Funcionalidades Principales

1. **🏆 Ranking Diario**
   - Clasificación diaria que se reinicia cada día
   - Top 50 jugadores por día
   - Posición en tiempo real

2. **👤 Sistema de Usuarios**
   - Registro de nombre (máximo 15 caracteres)
   - Estadísticas personales (mejor score, total de juegos, racha diaria)
   - Historial de puntuaciones

3. **🏅 Sistema de Badges**
   - **Badges de Puntuación**: 10K, 50K, 100K puntos
   - **Badges de Combo**: 20x, 50x combos
   - **Badges de Nivel**: Nivel 10+, 25+
   - **Badges de Racha**: 3, 7, 30 días seguidos
   - **Badges de Ranking**: Top 10, Top 3, #1 del día
   - **Badges de Actividad**: 5+, 10+ juegos por día

4. **🔔 Notificaciones**
   - Nuevos badges desbloqueados
   - Nuevos récords personales
   - Posición en el ranking

5. **📱 Compartir**
   - Compartir puntuación con ranking y badges
   - Integración con redes sociales
   - Texto viral optimizado

## 🚀 Cómo usar el Leaderboard

### Para los Jugadores:

1. **Primera vez**: Al hacer Game Over, se pedirá un nombre
2. **Ver Ranking**: Botón "🏆 RANKING" en el menú principal
3. **Ver Badges**: Desde el ranking, botón "🏅 Mis Badges"
4. **Compartir**: Botón "📱 COMPARTIR VIRAL" en Game Over

### Para el Desarrollador:

```javascript
// Inicializar leaderboard
window.leaderboard = new DailyLeaderboard('neon-runner-wow');

// Enviar puntuación (se hace automáticamente en gameOver)
leaderboard.submitScore(score, level, combo);

// Mostrar ranking
leaderboard.showRanking({ name: 'Usuario', score: 1000 });

// Obtener estadísticas
const stats = leaderboard.getStats();
const ranking = leaderboard.getRanking();
const userRank = leaderboard.getUserRank();
```

## 🎯 Integración Automática

El sistema ya está **100% integrado** en tu juego:

- ✅ **Game Over**: Envía automáticamente la puntuación
- ✅ **Menú Principal**: Botón de ranking funcional
- ✅ **Compartir**: Incluye información del leaderboard
- ✅ **Badges**: Se desbloquean automáticamente
- ✅ **Notificaciones**: Aparecen cuando corresponde

## 🧪 Archivo de Prueba

He creado `test-leaderboard-simple.html` para que puedas probar todas las funcionalidades:

1. Abre el archivo en el navegador
2. Prueba las diferentes funciones
3. Simula puntuaciones
4. Verifica que todo funcione

## 📊 Datos Almacenados

El sistema guarda en `localStorage`:

- `lipa_leaderboard_neon-runner-wow`: Ranking diario
- `lipa_user_neon-runner-wow`: Datos del usuario
- `lipa_badges_neon-runner-wow`: Badges desbloqueados

## 🔧 Personalización

Puedes ajustar los umbrales de badges en `leaderboard.js`:

```javascript
// Cambiar umbrales de badges
if (score >= 10000 && !this.hasBadge('high_score_10k')) {
    // Badge de 10K puntos
}
```

## 🎉 ¡Listo para usar!

Tu juego **Neon Runner WOW** ya tiene un sistema de leaderboard completo y profesional. Los jugadores pueden:

- Competir en el ranking diario
- Desbloquear badges
- Compartir sus logros
- Ver sus estadísticas

¡El sistema está funcionando y listo para tus jugadores! 🚀
