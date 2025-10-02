// LIPA STUDIOS - UNIFIED GLOBAL LEADERBOARD SYSTEM
// Sistema unificado de clasificacion global para todos los juegos

class UnifiedGlobalLeaderboard {
    constructor(gameName) {
        this.gameName = gameName;
        this.apiUrl = 'https://api.jsonbin.io/v3/b/68ded27743b1c97be95840b3';
        this.apiKey = '$2a$10$wIVZHoUqVwKQR2K1LDyPueJYW0x2laHFZz4WztFqEo7WAyAvlx8ti';
        this.today = this.getTodayString();
        this.currentUser = this.loadCurrentUser();
        this.leaderboard = [];
        this.isLoading = false;
    }

    getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    loadCurrentUser() {
        try {
            let user = JSON.parse(localStorage.getItem(`lipa_user_${this.gameName}`) || 'null');
            if (!user) {
                user = JSON.parse(localStorage.getItem('lipa_user_global') || 'null');
            }
            return user;
        } catch (e) {
            return null;
        }
    }

    saveCurrentUser() {
        try {
            localStorage.setItem(`lipa_user_${this.gameName}`, JSON.stringify(this.currentUser));
            localStorage.setItem('lipa_user_global', JSON.stringify(this.currentUser));
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

    async fetchLeaderboard() {
        if (this.isLoading) return;
        this.isLoading = true;
        console.log('🔄 Cargando leaderboard para:', this.gameName, 'fecha:', this.today);
        
        try {
            const response = await fetch(`${this.apiUrl}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Datos recibidos de JSONBin:', data);
                
                const allScores = data.record || {};
                const todayScores = allScores[this.today] || [];
                console.log('📅 Puntuaciones de hoy:', todayScores);
                
                this.leaderboard = todayScores
                    .filter(score => score.game === this.gameName)
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 50);
                
                console.log('✅ Leaderboard cargado desde la nube:', this.leaderboard.length, 'puntuaciones para', this.gameName);
                console.log('🏆 Puntuaciones encontradas:', this.leaderboard);
            } else {
                console.error('❌ Error cargando leaderboard:', response.status, response.statusText);
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
        console.log('🎯 Enviando puntuación:', { score, level, combo, game: this.gameName, user: this.currentUser });
        
        if (!this.currentUser) {
            console.log('⚠️ No hay usuario, mostrando prompt de nombre');
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
        
        console.log('📤 Datos de puntuación a enviar:', scoreData);

        try {
            const response = await fetch(`${this.apiUrl}/latest`, {
                headers: {
                    'X-Master-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            
            let currentData = {};
            if (response.ok) {
                const data = await response.json();
                currentData = data.record || {};
                console.log('📥 Datos actuales de JSONBin antes de actualizar:', currentData);
            } else {
                console.warn('⚠️ No se pudieron obtener los datos actuales, creando uno nuevo:', response.status, response.statusText);
            }

            if (!currentData[this.today]) {
                currentData[this.today] = [];
            }

            currentData[this.today] = currentData[this.today].filter(
                s => !(s.name === scoreData.name && s.game === scoreData.game)
            );

            currentData[this.today].push(scoreData);
            
            const updateResponse = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': this.apiKey,
                    'X-Bin-Versioning': 'false'
                },
                body: JSON.stringify(currentData)
            });

            if (updateResponse.ok) {
                console.log('✅ Puntuación enviada y leaderboard actualizado en la nube.');
                this.fetchLeaderboard();
                return true;
            } else {
                const errorText = await updateResponse.text();
                console.error('❌ Error al actualizar la puntuación en JSONBin:', updateResponse.status, updateResponse.statusText, errorText);
                return false;
            }
        } catch (error) {
            console.error('❌ Error de conexión al enviar puntuación:', error);
            return false;
        }
    }

    showNamePrompt(isSubmission = false) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;';
        overlay.innerHTML = '<div style="background: linear-gradient(145deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; text-align: center; border: 3px solid #00FFFF; box-shadow: 0 0 30px #FF0080; max-width: 90%; color: white;"><h2 style="color: #FFFF00; margin-bottom: 20px;">¡Bienvenido, jugador!</h2><p style="margin-bottom: 20px;">Introduce tu nombre para aparecer en el ranking global:</p><input type="text" id="leaderboardNameInput" placeholder="Tu nombre (max 15 caracteres)" maxlength="15" style="width: 80%; padding: 10px; margin-bottom: 20px; border-radius: 8px; border: 2px solid #00FFFF; background: #0a0a0a; color: white; font-size: 1rem;"><button id="saveNameBtn" style="background: linear-gradient(45deg, #FF0080, #00FFFF); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem;">GUARDAR Y JUGAR</button></div>';
        document.body.appendChild(overlay);

        const nameInput = document.getElementById('leaderboardNameInput');
        const saveNameBtn = document.getElementById('saveNameBtn');

        saveNameBtn.onclick = () => {
            const name = nameInput.value;
            if (name) {
                this.setUserName(name);
                document.body.removeChild(overlay);
                if (isSubmission && this._pendingSubmission) {
                    this.submitScore(this._pendingSubmission.score, this._pendingSubmission.level, this._pendingSubmission.combo);
                    this._pendingSubmission = null;
                } else {
                    this.showLeaderboard();
                }
            } else {
                alert('Por favor, introduce un nombre.');
            }
        };
    }

    async showRanking(currentScoreData = { name: 'Anonimo', score: 0 }) {
        await this.fetchLeaderboard();

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 10000; overflow-y: auto;';

        let rankingHtml = `<h2 style="color: #FFFF00; margin-bottom: 20px;">🏆 RANKING ${this.gameName.toUpperCase().replace(/-/g, ' ')} 🏆</h2>`;
        rankingHtml += `<p style="color: #00FFFF; margin-bottom: 10px;">Fecha: ${this.today}</p>`;
        
        if (this.leaderboard.length > 0) {
            rankingHtml += `<ul style="list-style: none; padding: 0; max-height: 60vh; overflow-y: auto; border: 1px solid #00FFFF; border-radius: 8px; padding: 10px;">`;
            this.leaderboard.forEach((entry, index) => {
                const isCurrentUser = this.currentUser && entry.name === this.currentUser.name && entry.game === this.gameName;
                rankingHtml += `<li style="background: ${isCurrentUser ? 'linear-gradient(90deg, #FF0080, #8A2BE2)' : '#1a1a2e'}; margin-bottom: 5px; padding: 8px 15px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center; font-size: 1rem; box-shadow: 0 0 8px rgba(0,255,255,0.3);"><span style="font-weight: bold; color: ${isCurrentUser ? 'white' : '#00FFFF'};">${index + 1}. ${this.getGameIcon(entry.game)} ${entry.name}</span><span style="color: ${isCurrentUser ? 'white' : '#FFFF00'};">${entry.score}</span></li>`;
            });
            rankingHtml += `</ul>`;
        } else {
            rankingHtml += `<p style="color: #FF0080;">No hay puntuaciones aún para este juego hoy. ¡Sé el primero!</p>`;
        }

        rankingHtml += `<div style="margin-top: 20px;"><button id="closeLeaderboardBtn" style="background: linear-gradient(45deg, #FF0080, #00FFFF); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem;">CERRAR</button></div>`;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = "background: linear-gradient(145deg, #1a1a2e, #16213e); padding: 30px; border-radius: 20px; text-align: center; border: 3px solid #00FFFF; box-shadow: 0 0 30px #FF0080; max-width: 90%; color: white;";
        modalContent.innerHTML = rankingHtml;
        overlay.appendChild(modalContent);
        document.body.appendChild(overlay);

        const closeBtn = document.getElementById('closeLeaderboardBtn');
        closeBtn.onclick = () => document.body.removeChild(overlay);
    }

    getGameIcon(gameName) {
        const icons = {
            'neon-runner-wow': '🏃‍♂️',
            'stack-tower-neon': '📚',
            'neon-beat-stage': '🎵',
            'neon-lab-physics-wow': '🧪',
            'stack-tower-wow': '📚',
            'neon-beat-wow': '🎵',
            'neon-runner': '🏃‍♂️',
            'neon-lab-physics': '🧪'
        };
        return icons[gameName] || '🎮';
    }

    async showLeaderboard() {
        await this.fetchLeaderboard();
        this.showRanking({ name: this.currentUser?.name || 'Anonimo', score: 0 });
    }
}

// Export for global access
window.UnifiedGlobalLeaderboard = UnifiedGlobalLeaderboard;
window.GlobalLeaderboard = UnifiedGlobalLeaderboard;
window.DailyLeaderboard = UnifiedGlobalLeaderboard;

console.log('LIPA Unified Global Leaderboard System loaded!');
