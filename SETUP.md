# Guide Installation et Utilisation

## ✅ Étapes d'installation

### 1. **Ouvrir dans Unity Hub**
   - Cliquez sur "Open" dans Unity Hub
   - Sélectionnez le dossier `Mini-Vibes`
   - Choisissez **Unity 2022 LTS** (ou supérieur)

### 2. **Configurer la scène**
   - Dans le dossier `Scenes`, créer `MainGame.unity`
   - Ajouter une Camera 3D
   - Ajouter un sol (Plane ou Mesh)
   - Ajouter la voiture (voir ci-dessous)

### 3. **Créer la voiture**
   - Clic droit → 3D Object → Cube
   - Renommer en "Car"
   - Ajouter composants:
     - **Rigidbody** : Mass = 1.2, Is Kinematic = OFF
     - **Box Collider** : Ajuster la taille
     - Attacher les scripts:
       - `CarController.cs`
       - `CarInput.cs`
     - Tag: "Player"

### 4. **Créer les checkpoints**
   - Clic droit → 3D Object → Cube
   - Renommer en "Checkpoint_0"
   - Composants:
     - **Box Collider** : Is Trigger = ON
     - Script: `Checkpoint.cs`
     - `checkpointIndex = 0`
   - Dupliquer pour chaque checkpoint (Checkpoint_1, Checkpoint_2, etc.)
   - Positionner le long du circuit

### 5. **Ajouter les Managers**
   - Clic droit → Create Empty → renommer en "GameManager"
   - Ajouter script: `GameManager.cs`
   - Clic droit → Create Empty → renommer en "CheckpointManager"
   - Ajouter script: `CheckpointManager.cs`
   - Clic droit → Create Empty → renommer en "HUDManager"
   - Ajouter script: `HUDManager.cs`

### 6. **Configurer l'UI**
   - Clic droit → UI → Panel → TextMeshPro
   - Créer les texts suivants:
     - Speed (en haut à gauche)
     - Timer (en haut au centre)
     - Nitro (à droite)
     - Checkpoint (en bas)
   - Assigner les références dans HUDManager

### 7. **Tester**
   - Appuyer sur Play ▶️
   - Tester les contrôles

## 🕹️ Contrôles

```
W / Haut      → Accélération
S / Bas       → Freinage
A / Gauche    → Tourner gauche
D / Droite    → Tourner droite
SPACE         → Nitro boost
R             → Respawn
ESC           → Pause
```

## 🎯 Améliorations possibles

### Level 2 (Intermédiaire)
- Ajouter sons moteur et musique
- Créer des graphismes meilleurs (modèles 3D)
- Systèmes de drift avec bonus speed
- Leaderboard local

### Level 3 (Avancé)
- Multiple circuits
- Ennemis IA
- Multijoueur local
- Effets de particules avancés
- Physique terrain (dénivelé)

## 📝 Notes de développement

- Tous les scripts sont commentés et faciles à comprendre
- Les valeurs (speed, boost, etc.) sont paramétrables dans l'Inspector
- Architecture modulaire: facile d'ajouter des features
- Compatible avec les versions récentes de Unity

## 🐛 Troubleshooting

**La voiture ne se déplace pas?**
- Vérifier que le Rigidbody est présent et actif
- Vérifier que CarInput et CarController sont sur le même GameObject

**Les checkpoints ne se déclenchent pas?**
- Vérifier que "Is Trigger" est coché
- Vérifier le tag "Player" sur la voiture
- Vérifier que CheckpointManager a accès aux checkpoints

**L'UI n'affiche rien?**
- Vérifier les références dans HUDManager
- Vérifier que TextMeshPro est importé

Bon développement! 🚀
