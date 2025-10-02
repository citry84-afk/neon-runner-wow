// LIPA STUDIOS - GLOBAL LEADERBOARD SYSTEM
// Sistema de clasificacion global usando JSONBin

class GlobalLeaderboard {
    constructor(gameName) {
        this.gameName = gameName;
        this.apiUrl = 'https://api.jsonbin.io/v3/b/68ded27743b1c97be95840b3'; // Tu Bin ID
        this.apiKey = '$2a$10$wIVZHoUqVwKQR2K1LDyPueJYW0x2laHFZz4WztFqEo7WAyAvlx8ti'; // Tu Master Key
        this.today = this.getTodayString();
        this.currentUser = this.loadCurrentUser();
        this.leaderboard = [];
        this.isLoading = false;
    }

    getTodayString() {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    loadCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(`lipa_user_${this.gameName}`) || 'null');
        } catch (e) {
            return null;
        }
    }

    saveCurrentUser() {
        try {
            localStorage.setItem(`lipa_user_${this.gameName}`, JSON.stringify(this.currentUser));
        } catch (e) {
            console.error('Error saving user:', e);
        }
    }

    setUserName(name) {
        this.currentUser = {
            name: name.trim().substring(0, 15),
            joinDate: this.currentUser?.joinDate || new Date().toISOString(),
            totalGames: this.currentUser?.totalGames || 0,
            bestScore: this.currentUser?.bestScore || 0,
            deviceId: this.getDeviceId()
        };
        this.saveCurrentUser();
    }

    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }

    // API CALLS TO JSONBIN
    async fetchLeaderboard() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            const response = await fetch(`${this.apiUrl}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const allScores = data.record || {};
                const todayScores = allScores[this.today] || [];
                
                // Filtrar solo las puntuaciones de este juego
                this.leaderboard = todayScores
                    .filter(score => score.game === this.gameName)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 50);
                
                console.log('✅ Leaderboard cargado desde la nube:', this.leaderboard.length, 'puntuaciones');
            } else {
                console.error('❌ Error cargando leaderboard:', response.status);
                this.leaderboard = [];
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            this.leaderboard = [];
        } finally {
            this.isLoading = false;
        }
    }

    async submitScore(score, level = 1, combo = 0) {
        if (!this.currentUser) {
            this._pendingSubmission = { score, level, combo };
            this.showNamePrompt(true);
            return false;
        }

        const scoreData = {
            name: this.currentUser.name,
            score: score,
            level: level,
            combo: combo,
            game: this.gameName,
            date: this.today,
            device_id: this.getDeviceId(),
            timestamp: new Date().toISOString()
        };

        try {
            // Primero obtener los datos actuales
            const response = await fetch(`${this.apiUrl}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const allScores = data.record || {};
                
                // Inicializar array para hoy si no existe
                if (!allScores[this.today]) {
                    allScores[this.today] = [];
                }
                
                // Agregar nueva puntuación
                allScores[this.today].push(scoreData);
                
                // Ordenar y mantener solo top 50
                allScores[this.today] = allScores[this.today]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 50);
                
                // Actualizar en JSONBin
                const updateResponse = await fetch(this.apiUrl, {
                    method: 'PUT',
                    headers: {
                        'X-Master-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(allScores)
                });

                if (updateResponse.ok) {
                    console.log('✅ Puntuación enviada a la nube');
                    
                    // Actualizar stats del usuario
                    this.currentUser.totalGames++;
                    if (score > this.currentUser.bestScore) {
                        this.currentUser.bestScore = score;
                    }
                    this.saveCurrentUser();

                    // Recargar leaderboard
                    await this.fetchLeaderboard();
                    
                    // Mostrar ranking
                    this.showRanking(scoreData);
                    return true;
                } else {
                    console.error('❌ Error actualizando puntuación:', updateResponse.status);
                    alert('Error al enviar puntuación. Inténtalo de nuevo.');
                    return false;
                }
            } else {
                console.error('❌ Error obteniendo datos:', response.status);
                alert('Error al obtener datos. Inténtalo de nuevo.');
                return false;
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
            alert('Sin conexión a internet. La puntuación se guardará cuando tengas conexión.');
            return false;
        }
    }

    getRanking() {
        return this.leaderboard.slice(0, 10); // Top 10
    }

    getUserRank() {
        if (!this.currentUser) return null;
        
        const userIndex = this.leaderboard.findIndex(
            entry => entry.name === this.currentUser.name
        );
        
        return userIndex >= 0 ? userIndex + 1 : null;
    }

    showNamePrompt(autoSubmitAfter = false) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100000; display: flex; align-items: center; justify-content: center; font-family: system-ui;';
        overlay.innerHTML = '<div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #00ffff; border-radius: 15px; padding: 30px; text-align: center; max-width: 400px; width: 90%;"><h2 style="color: #00ffff; margin-bottom: 20px;">TROPHY Unete al Ranking Global!</h2><p style="color: #fff; margin-bottom: 20px;">Elige tu nombre para competir con jugadores de todo el mundo</p><input type="text" id="username-input" placeholder="Tu nombre (max 15 caracteres)" style="width: 100%; padding: 12px; margin-bottom: 20px; border: 2px solid #00ffff; background: rgba(0,0,0,0.5); color: #fff; border-radius: 8px; font-size: 16px;" maxlength="15"><div style="display: flex; gap: 10px; justify-content: center;"><button id="save-name" style="background: #00ffff; color: #000; padding: 12px 24px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">GUARDAR</button><button id="skip-name" style="background: #666; color: #fff; padding: 12px 24px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">SALTAR</button></div></div>';
        document.body.appendChild(overlay);
        
        const input = overlay.querySelector('#username-input');
        const saveBtn = overlay.querySelector('#save-name');
        const skipBtn = overlay.querySelector('#skip-name');
        
        input.focus();
        
        saveBtn.onclick = () => {
            const name = input.value.trim();
            if (name.length >= 2) {
                this.setUserName(name);
                document.body.removeChild(overlay);
                if (autoSubmitAfter && this._pendingSubmission) {
                    const { score, level, combo } = this._pendingSubmission;
                    this._pendingSubmission = null;
                    this.submitScore(score, level, combo);
                }
            } else {
                alert('El nombre debe tener al menos 2 caracteres');
            }
        };
        
        skipBtn.onclick = () => {
            if (!this.currentUser) this.setUserName('Anonimo');
            document.body.removeChild(overlay);
            if (autoSubmitAfter && this._pendingSubmission) {
                const { score, level, combo } = this._pendingSubmission;
                this._pendingSubmission = null;
                this.submitScore(score, level, combo);
            }
        };
        
        input.onkeypress = (e) => { if (e.key === 'Enter') saveBtn.click(); };
    }

    showRanking(scoreData) {
        const ranking = this.getRanking();
        const userRank = this.getUserRank();
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 100000; display: flex; align-items: center; justify-content: center; font-family: system-ui;';
        
        let rankingHTML = '';
        ranking.forEach((entry, index) => {
            const isCurrentUser = entry.name === this.currentUser.name;
            const medal = index === 0 ? 'GOLD' : index === 1 ? 'SILVER' : index === 2 ? 'BRONZE' : 'MEDAL';
            rankingHTML += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; margin: 4px 0; border-radius: 8px; background: ' + (isCurrentUser ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.1)') + '; border: ' + (isCurrentUser ? '2px solid #00ffff' : '1px solid #333') + ';"><span style="color: #fff; font-weight: bold;">' + medal + ' #' + (index + 1) + '</span><span style="color: ' + (isCurrentUser ? '#00ffff' : '#fff') + '; font-weight: bold;">' + entry.name + '</span><span style="color: #ffff00; font-weight: bold;">' + entry.score.toLocaleString() + '</span></div>';
        });
        
        overlay.innerHTML = '<div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 2px solid #00ffff; border-radius: 15px; padding: 30px; text-align: center; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;"><h2 style="color: #00ffff; margin-bottom: 20px;">TROPHY Ranking Global Diario - ' + this.gameName + '</h2><p style="color: #fff; margin-bottom: 20px;">Tu posicion: #' + (userRank || 'No clasificado') + '</p><div style="margin-bottom: 20px;">' + rankingHTML + '</div><div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;"><button id="refresh-ranking" style="background: #1da1f2; color: #fff; padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">REFRESH Actualizar</button><button id="close-ranking" style="background: #00ffff; color: #000; padding: 10px 20px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">Cerrar</button></div></div>';
        document.body.appendChild(overlay);
        
        const refreshBtn = overlay.querySelector('#refresh-ranking');
        const closeBtn = overlay.querySelector('#close-ranking');
        
        refreshBtn.onclick = async () => {
            refreshBtn.textContent = 'Cargando...';
            await this.fetchLeaderboard();
            document.body.removeChild(overlay);
            this.showRanking(scoreData);
        };
        
        closeBtn.onclick = () => document.body.removeChild(overlay);
    }

    async showLeaderboard() {
        await this.fetchLeaderboard();
        this.showRanking({ name: this.currentUser?.name || 'Anonimo', score: 0 });
    }

    getStats() {
        if (!this.currentUser) return null;
        return {
            name: this.currentUser.name,
            totalGames: this.currentUser.totalGames,
            bestScore: this.currentUser.bestScore,
            currentRank: this.getUserRank(),
            joinDate: this.currentUser.joinDate,
            badgesCount: 0,
            recentBadges: []
        };
    }
}

// INTEGRACION CON JUEGOS
window.GlobalLeaderboard = GlobalLeaderboard;
window.DailyLeaderboard = GlobalLeaderboard; // Mantener compatibilidad

// Funcion helper para integrar facilmente
window.initLeaderboard = function(gameName) {
    return new GlobalLeaderboard(gameName);
};

// Funcion para mostrar ranking desde cualquier parte
window.showLeaderboard = function(gameName) {
    const lb = new GlobalLeaderboard(gameName);
    lb.showLeaderboard();
};

console.log('LIPA Global Leaderboard System loaded!');
