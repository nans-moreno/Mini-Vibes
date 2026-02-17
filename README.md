# Trackmania Clone - Vibe Coding Project

Un jeu de course arcade 3D inspiré de Trackmania, développé en Unity pour le projet "Vibe Coding" de l'école.

## 🎮 Fonctionnalités

- **Gameplay core** : Voiture contrôlable sur circuit
- **Physics réaliste** : Gravité, accélération, freinage
- **Checkpoints** : Détection de passage et respawn
- **Système de chrono** : Temps de course et bestsplit
- **UI complète** : Menu, HUD en jeu, écran fin
- **3D Modern** : Caméra dynamique, effets visuels

## 📋 Configuration

### Requirements
- Unity 2022 LTS ou supérieur
- Visual Studio Code ou Visual Studio
- .NET 6.0+

### Installation
1. Ouvrir le projet dans Unity Hub
2. Laisser Unity compiler les shaders
3. Scène principal : `Assets/Scenes/MainGame.unity`
4. Appuyer sur Play ▶️

## 🕹️ Contrôles

| Touche | Action |
|--------|--------|
| W / ↑ | Accélération |
| S / ↓ | Freinage |
| A / ← | Tourner gauche |
| D / → | Tourner droite |
| Space | Nitro boost |
| R | Respawn au checkpoint |
| ESC | Pause/Menu |

## 📁 Structure du Projet

```
Assets/
├── Scripts/
│   ├── Player/
│   │   ├── CarController.cs       # Contrôle de la voiture
│   │   ├── CarPhysics.cs          # Physics personnalisées
│   │   └── CarInput.cs            # Gestion inputs
│   ├── Track/
│   │   ├── CheckpointManager.cs   # Gestion checkpoints
│   │   ├── Checkpoint.cs          # Script checkpoint
│   │   └── TrackTrigger.cs        # Colliders track
│   ├── UI/
│   │   ├── HUDManager.cs          # Affichage HUD
│   │   ├── MenuManager.cs         # Menu principal
│   │   └── ResultsScreen.cs       # Écran résultats
│   ├── Managers/
│   │   ├── GameManager.cs         # Manager global
│   │   ├── TimerManager.cs        # Chrono
│   │   └── AudioManager.cs        # Musique/SFX
│   └── Utils/
│       └── Constants.cs           # Constantes
├── Prefabs/
│   ├── Car/
│   ├── Checkpoints/
│   └── UI/
├── Scenes/
│   ├── MainGame.unity
│   ├── Menu.unity
│   └── Results.unity
├── Models/
│   ├── Car/
│   └── Track/
├── Textures/
├── Materials/
├── Sounds/
│   ├── Music/
│   └── SFX/
└── Settings/
    └── ProjectSettings.asset
```

## 🛠️ Développement

### Scripts principaux

**CarController.cs** - Cœur du gameplay
```csharp
- Accélération/Freinage
- Rotation/Drift
- Nitro boost
- Animation moteur
```

**CheckpointManager.cs** - Système de progression
```csharp
- Détection passages
- Respawn points
- Validation circuit
```

**TimerManager.cs** - Système de chrono
```csharp
- Temps total
- Split times
- Bestsplit sauvegarde
```

## 🎨 Assets créés

- ✅ Voiture 3D optimisée
- ✅ Track circuit 8-9 checkpoints
- ✅ Skybox environment
- ✅ Shaders custom pour la route
- ✅ Particles nitro/fumée

## 📈 Progression de développement

- [x] Architecture projet
- [x] Controller voiture de base
- [x] Physics et collisions
- [x] Checkpoint system
- [x] UI & HUD
- [x] Système de chrono
- [ ] Polishing & optimisation
- [ ] Leaderboard local

## 🐛 Known Issues

Aucun actuellement - Version 1.0 stable

## 👥 Auteurs

Réalisé par les étudiants du projet "Vibe Coding" 🎓

## 📝 Licence

Projet éducatif - Libre d'usage pour études

---

**Bon jeu ! 🏁**
