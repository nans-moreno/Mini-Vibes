# 🎮 Trackmania Three.js - Guide Rapide

## ⚡ Lancer le jeu en 30 secondes!

### **Étape 1: Ouvre le fichier**
```bash
# Navigue au dossier du projet
cd "C:\Users\aniss\lptf\projets\Mini vibes\Mini-Vibes"

# Lance un serveur local
python -m http.server 8000
```

### **Étape 2: Ouvre le jeu**
- Va sur: **http://localhost:8000**
- Clique sur **index.html**

### **C'est tout! 🚀**

---

## 🕹️ Contrôles

```
W / ↑              → Accélération
S / ↓              → Freinage
A / ← / Q / Z      → Tourner gauche
D / → / E / C      → Tourner droite
SPACE              → Nitro boost 🚀
R                  → Recommencer la course
ESC                → Pause/Menu
```

---

## 📊 Que vois-tu?

**À l'écran:**
- ✅ Une voiture rouge en 3D
- ✅ Un circuit avec 8 checkpoints orange
- ✅ Un HUD avec vitesse, temps, nitro
- ✅ La caméra suit la voiture
- ✅ L'écran "Finish" quand tu termines

---

## 🎯 Objectif du jeu

1. **Franchir tous les checkpoints** (portails orange/bleus)
2. **Dans le meilleur temps possible**
3. **Utilise le NITRO** (SPACE) pour aller plus vite
4. **Appuie sur R** pour recommencer

---

## 🛠️ Architecture

```
index.html         ← La page du jeu
game.js            ← Tout le code du jeu (1 fichier!)
package.json       ← Configuration npm
README.md          ← Documentation
```

---

## 📋 Contenu du code

**game.js** contient:
- 🎮 **Car class** - Contrôle et physics de la voiture
- 🚩 **Checkpoint class** - Les portails du circuit
- 📊 **Game State** - État du jeu (pause, fin, etc.)
- ⌨️ **Input handling** - Gestion des touches
- 🎨 **Three.js Scene** - Rendu 3D
- ⏱️ **Animation loop** - Boucle du jeu

---

## 🚀 Améliorations possibles

### Level 2 (Facile à ajouter)
- [ ] Ajouter des murs/obstacles
- [ ] Effets de particules (nitro, smoke)
- [ ] Sounds & Musique
- [ ] Terrain avec pentes
- [ ] Boost zones

### Level 3 (Intermédiaire)
- [ ] Multiples circuits
- [ ] Leaderboard localStorage
- [ ] Meilleur temps sauvegardé
- [ ] Modèles 3D avancés
- [ ] Driften avec bonus

### Level 4 (Avancé)
- [ ] Multijoueur online (WebSocket)
- [ ] Replay system
- [ ] Track editor
- [ ] IA ennemis
- [ ] Physics réaliste (box2d/cannon.js)

---

## 🐛 Troubleshooting

### **Le jeu ne charge pas?**
- Assure-toi que le serveur Python tourne
- Va sur http://localhost:8000 (pas file://)

### **La voiture ne bouge pas?**
- Appuie sur W pour accélérer
- Vérifie que la fenêtre est en focus

### **Le jeu est lent?**
- Ferme les autres onglets
- Réduis les paramètres graphiques (réduire la fog distance dans le code)

### **Les checkpoints ne se passent pas?**
- Assure-toi de passer au centre du portail
- Regarde les coordonnées dans la console

---

## 📝 Variables à customiser

Ouvre **game.js** et modifie ces valeurs:

```javascript
// Vitesses
CAR_MAX_SPEED: 50,          // Vitesse max
CAR_ACCELERATION: 150,      // Accélération
CAR_TURN_SPEED: 90,         // Rotation

// Nitro
NITRO_BOOST: 1.5,           // Multiplicateur nitro
NITRO_MAX: 100,             // Capacité nitro
NITRO_CONSUMPTION: 20,      // Consommation par sec
NITRO_RECHARGE: 30,         // Recharge par sec
```

---

## 📚 Ressources

- **Three.js Docs**: https://threejs.org/docs/
- **WebGL**: Rendu 3D dans le navigateur
- **Physics**: Le code utilise une physique simplifiée

---

## ✨ Bon jeu! 🏁

Amuse-toi bien avec ton Trackmania Three.js!

**C'est complètement jouable et facile à modifier.**

Si tu veux ajouter des features, le code est bien structuré et commenté! 🚀
