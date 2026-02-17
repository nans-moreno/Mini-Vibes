# 🎮 Comment Voir et Jouer au Jeu - Guide Rapide

## ⚡ 5 Minutes pour lancer le jeu!

### **ÉTAPE 1: Installer Unity (Si pas déjà fait)**

1. Va sur **https://unity.com/download**
2. Télécharge **Unity Hub** (gratuit)
3. Ouvre Unity Hub
4. Va dans `Installs` → `Install Editor`
5. Choisis **Unity 2022 LTS** (ou 2023)
6. Attends l'installation (~3-5 minutes)

---

### **ÉTAPE 2: Ouvrir le projet**

1. Ouvre **Unity Hub**
2. Clique sur **Projects** (à gauche)
3. Clique sur **Open** (bouton en haut à droite)
4. Sélectionne le dossier: `C:\Users\aniss\lptf\projets\Mini vibes\Mini-Vibes`
5. Clique sur **Open**

**⏳ Attends que Unity compile (2-3 minutes la première fois)**

---

### **ÉTAPE 3: Créer la scène basique**

Une fois que Unity est ouvert:

#### **Créer la scène:**

1. **À gauche** dans `Project` → Dossier `Scenes` (créer s'il existe pas)
2. **Clic droit** → `Create` → `Scene`
3. Nommer: `MainGame`
4. **Double-clic** pour l'ouvrir

#### **Ajouter les éléments basiques:**

**SOL (Ground):**
- `Clic droit` dans la Hiérarchie → `3D Object` → `Plane`
- Renommer en `Ground`
- Scale: X=10, Y=1, Z=10 (pour un grand sol)
- Position Y = -1

**VOITURE (Car):**
- `Clic droit` → `3D Object` → `Cube`
- Renommer en `Car`
- Position: X=0, Y=2, Z=0
- **Ajouter composants:**
  - **Rigidbody** (Add Component → Rigidbody)
    - Mass = 1.2
    - Is Kinematic = OFF ✓
  - **Box Collider** (déjà présent)
  - **Tag**: "Player" (créer le tag si besoin)
  
- **Ajouter les scripts:**
  - Drag & drop `CarController.cs` sur la voiture
  - Drag & drop `CarInput.cs` sur la voiture

**CAMÉRA (Camera):**
- Sélectionne la `Main Camera` (déjà dans la scène)
- Position: X=0, Y=5, Z=-10
- Rotation: X=20, Y=0, Z=0

**CHECKPOINTS (Portes de passage):**
- `Clic droit` → `3D Object` → `Cube`
- Renommer en `Checkpoint_0`
- Position: X=0, Y=1, Z=5
- Scale: X=3, Y=2, Z=0.5 (pour un portail)
- **Ajouter:**
  - `Checkpoint.cs` script
  - **Box Collider** → `Is Trigger = ON` ✓
- Dupliquer (Ctrl+D) pour créer d'autres checkpoints le long du parcours
  - Checkpoint_1: Z=15
  - Checkpoint_2: Z=25
  - Checkpoint_3: X=10, Z=25
  - etc.

**MANAGERS (GameObjects vides):**
1. `Clic droit` → `Create Empty`
   - Renommer en `GameManager`
   - Ajouter script: `GameManager.cs`

2. `Clic droit` → `Create Empty`
   - Renommer en `CheckpointManager`
   - Ajouter script: `CheckpointManager.cs`

3. `Clic droit` → `Create Empty`
   - Renommer en `HUDManager`
   - Ajouter script: `HUDManager.cs`

**UI (Canvas pour affichage):**
- `Clic droit` → `UI` → `Text - TextMeshPro`
  - Accepter l'import si demandé
- Créer 4 texts:
  - `SpeedText` (haut à gauche)
  - `TimerText` (haut au centre)
  - `NitroText` (à droite)
  - `CheckpointText` (en bas)
- Ajouter une `Image` pour la barre nitro

---

### **ÉTAPE 4: Connecter les références dans l'Inspector**

**Sélectionne HUDManager** dans la Hiérarchie:
- Dans l'Inspector (à droite), tu dois voir le script `HUDManager`
- Drag & drop chaque text créé dans les champs correspondants:
  - `Speed Text` ← SpeedText
  - `Timer Text` ← TimerText
  - `Nitro Text` ← NitroText
  - `Checkpoint Text` ← CheckpointText
  - `Nitro Bar` ← L'image de la barre

---

### **ÉTAPE 5: LANCER LE JEU! 🚀**

1. **Clique sur le bouton PLAY** ▶️ en haut au centre
2. **Utilise les contrôles:**

```
W / ↑          → Accélération
S / ↓          → Freinage
A / ←          → Tourner gauche
D / →          → Tourner droite
SPACE          → Nitro boost
R              → Respawn
ESC            → Pause
```

**✅ Tu dois voir:**
- Une voiture (cube blanc) qui se déplace
- Des checkpoints verts que tu franchis
- Un chrono qui s'affiche
- Une barre nitro qui se charge

---

## 🎨 Pour rendre ça plus beau (Optionnel)

### Ajouter des couleurs:

**Pour la voiture:**
1. Sélectionne le Car
2. Dans l'Inspector → Mesh Renderer
3. Material → Color → Rouge ou tu préfères

**Pour les checkpoints:**
1. Sélectionne Checkpoint_0
2. Mesh Renderer → Material → Color → Jaune/Orange

**Pour le sol:**
1. Sélectionne Ground
2. Mesh Renderer → Material → Color → Gris

---

## ❌ Ça ne marche pas?

### **La voiture ne bouge pas:**
- Vérifie que `CarController.cs` et `CarInput.cs` sont attachés
- Vérifie que le Rigidbody existe et `Is Kinematic = OFF`

### **Les checkpoints ne s'activent pas:**
- Vérifie que `Is Trigger = ON` sur chaque checkpoint
- Vérifie que la voiture a le tag "Player"

### **L'affichage UI n'apparaît pas:**
- Vérifie que les références sont connectées dans HUDManager
- Assure-toi que le Canvas existe

### **Besoin d'aide?**
- Consulte le `SETUP.md` pour plus de détails
- Regarde les scripts commentés pour comprendre

---

## 📊 Architecture finale (Hiérarchie Unity)

```
Scene (MainGame)
├── Ground (Plane)
├── Car (Cube)
│   ├── CarController.cs
│   ├── CarInput.cs
│   └── Rigidbody
├── Checkpoint_0
├── Checkpoint_1
├── Checkpoint_2
├── Camera
├── Canvas (UI)
│   ├── SpeedText
│   ├── TimerText
│   ├── NitroText
│   ├── CheckpointText
│   └── NitroBar (Image)
├── GameManager
├── CheckpointManager
└── HUDManager
```

---

## ✨ Résultat attendu:

**En appuyant sur PLAY, tu devrais voir:**
1. ✅ Une fenêtre de jeu avec une voiture qui se déplace
2. ✅ La vitesse affichée en haut à gauche
3. ✅ Un chrono qui compte
4. ✅ La barre nitro à droite
5. ✅ Des checkpoints que tu franchis
6. ✅ Un écran "Finish" quand tu as tous les checkpoints

---

**🏁 Bon jeu! N'hésite pas si tu as des questions!**
