# 🏎️ Copilot Instructions — TrackMania 3JS

## 🎯 Vision du projet
Tu construis un jeu de course style **TrackMania** entièrement dans le navigateur.
Stack : **Three.js** (rendu 3D), **Vanilla JS / TypeScript**, zéro framework UI.
Le joueur pilote une voiture sur des circuits modulaires, fait des sauts, loopings,
qualifie son temps et améliore son record. Ambiance arcade, physique fun > réalisme.

---

## 🗂️ Architecture des fichiers

```
src/
├── main.ts              # Bootstrap Three.js (scene, camera, renderer, loop)
├── car/
│   ├── Car.ts           # Entité voiture : mesh, physique, inputs
│   ├── CarController.ts # Mapping clavier → forces
│   └── CarCamera.ts     # Caméra TPS qui suit la voiture
├── track/
│   ├── TrackBuilder.ts  # Génère les blocs de circuit
│   ├── TrackBlock.ts    # Un bloc individuel (plat, rampe, looping…)
│   └── tracks/
│       └── track01.json # Données d'un circuit (tableau de blocs)
├── physics/
│   └── PhysicsEngine.ts # Calculs de collision AABB, gravité, friction
├── ui/
│   ├── HUD.ts           # Chrono, vitesse, compte à rebours
│   └── Menu.ts          # Écran titre, sélection circuit
├── audio/
│   └── SoundManager.ts  # Web Audio API : moteur, crash, checkpoint
├── utils/
│   ├── AssetLoader.ts   # Chargement GLB / textures
│   └── EventBus.ts      # Bus d'événements global
└── index.html           # Point d'entrée unique
```

---

## 🚗 Car.ts — Règles de codage

```typescript
// La voiture est un objet physique simple, PAS de moteur physique externe.
// Toutes les unités sont en mètres et secondes.

class Car {
  // OBLIGATOIRE : ces propriétés publiques pour que CarCamera et HUD y accèdent
  mesh: THREE.Group;
  velocity: THREE.Vector3;   // m/s dans le repère monde
  speed: number;             // scalaire km/h pour le HUD
  isGrounded: boolean;
  checkpointsPassed: number;

  // INTERDIT : ne jamais modifier mesh.position directement hors de update()
  // OBLIGATOIRE : appeler physicsStep() AVANT de mettre à jour mesh.position
}
```

**Physique voiture :**
- Gravité : `9.81 m/s²` appliquée chaque frame si `!isGrounded`
- Accélération max : `25 m/s²`, freinage : `40 m/s²`
- Vitesse max : `80 m/s` (~290 km/h)
- Virage : rotation autour de Y proportionnelle à la vitesse (understeering léger)
- Sur looping : calculer la normale de la piste et coller la voiture via dot product

---

## 🏗️ TrackBuilder.ts — Format de blocs

```typescript
// Chaque bloc est une pièce modulaire de 16×4×16 m
// Types disponibles (BlockType enum) :
type BlockType =
  | 'flat'          // route plate
  | 'ramp_up'       // rampe montante 15°
  | 'ramp_down'     // rampe descendante 15°
  | 'loop'          // looping complet 360°
  | 'jump_boost'    // tremplin avec boost
  | 'turn_left'     // virage 90° gauche
  | 'turn_right'    // virage 90° droit
  | 'checkpoint'    // checkpoint (trigger invisible)
  | 'finish';       // ligne d'arrivée

// Format track01.json
{
  "name": "Démo Sprint",
  "blocks": [
    { "type": "flat",       "position": [0,  0,  0],  "rotation": 0 },
    { "type": "ramp_up",    "position": [0,  0, -16], "rotation": 0 },
    { "type": "loop",       "position": [0,  4, -32], "rotation": 0 },
    { "type": "checkpoint", "position": [0,  0, -80], "rotation": 0 },
    { "type": "finish",     "position": [0,  0, -96], "rotation": 0 }
  ]
}
```

**Règles TrackBuilder :**
- Chaque bloc instancie un `THREE.Mesh` avec sa géométrie propre
- Les blocs de collision sont des AABB stockés dans `PhysicsEngine.colliders[]`
- Le looping utilise un `THREE.TubeGeometry` sur une `CatmullRomCurve3` circulaire
- Toujours appeler `mergeGeometries()` (three-stdlib) pour fusionner les blocs statiques → 1 draw call

---

## 🌍 Scène Three.js — main.ts

```typescript
// Configuration obligatoire du renderer
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Lumières obligatoires
const sun = new THREE.DirectionalLight(0xfff5e0, 2.5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x8090b0, 0.6));

// Skybox : CubeTextureLoader ou PMREMGenerator sur un HDR
// Fog atmosphérique (optionnel mais recommandé)
scene.fog = new THREE.FogExp2(0x87ceeb, 0.008);
```

---

## 🎮 Contrôles clavier

| Touche | Action |
|---|---|
| `Z` / `↑` | Accélérer |
| `S` / `↓` | Freiner / marche arrière |
| `Q` / `←` | Virer à gauche |
| `D` / `→` | Virer à droite |
| `Espace` | Frein à main (dérapage) |
| `R` | Respawn au dernier checkpoint |
| `Entrée` | Relancer la course / valider menu |
| `Échap` | Pause / menu |

```typescript
// Toujours écouter 'keydown' et 'keyup', stocker dans un Set<string>
// Ne JAMAIS bloquer les touches navigateur (F5, F12…)
const keys = new Set<string>();
window.addEventListener('keydown', e => keys.add(e.code));
window.addEventListener('keyup',   e => keys.delete(e.code));
```

---

## ⏱️ Système de chrono

```typescript
// HUD affiche : MM:SS.mmm (ex: 01:23.456)
// Enregistrer les ghost data : Array<{t: number, pos: Vector3, rot: Quaternion}>
// Comparer avec le ghost précédent (localStorage key: `tm_ghost_${trackName}`)
// Delta time coloré : vert si en avance, rouge si en retard

interface GhostFrame {
  timestamp: number;       // ms depuis start
  position: [number, number, number];
  quaternion: [number, number, number, number];
}
```

---

## 🎨 Style visuel

- Palette : couleurs saturées arcade (rouge vif, jaune néon, bleu électrique)
- Sol : `MeshStandardMaterial` avec texture tarmac + normalMap
- Voiture : formes géométriques simples (box + cylindres pour roues), pas de GLB requis
- Checkpoints : anneau `TorusGeometry` semi-transparent, pulsation via `Math.sin(time)`
- Particules crash : `THREE.Points` avec positions aléatoires, fade sur 0.5s
- Post-processing (optionnel) : `UnrealBloomPass` sur les boost pads + phares

---

## ⚡ Performance

- **Budget** : 60 fps stable sur un laptop mid-range
- Utiliser `InstancedMesh` pour les éléments répétitifs (barrières, panneaux)
- Frustum culling actif par défaut (ne PAS désactiver `frustumCulled`)
- Limiter les `new THREE.Vector3()` dans la boucle → préallouer et `.set()`
- Éviter `Object3D.clone()` dans la game loop
- `deltaTime` toujours cappé à `0.05` pour éviter les tunneling physiques

```typescript
// Game loop correcte
let lastTime = 0;
function animate(time: number) {
  requestAnimationFrame(animate);
  const delta = Math.min((time - lastTime) / 1000, 0.05); // cap 50ms
  lastTime = time;
  car.update(delta);
  renderer.render(scene, camera);
}
```

---

## 🧪 Patterns interdits

```typescript
// ❌ INTERDIT
scene.traverse(obj => obj.material = ...) // trop lent
new THREE.Vector3() // dans la game loop, préallouer
document.getElementById('score').innerHTML = ... // utiliser HUD.ts

// ✅ OBLIGATOIRE
const _tempVec = new THREE.Vector3(); // préalloué hors loop
_tempVec.set(x, y, z);               // réutilisé en loop
```

---

## 📦 Dépendances

```json
{
  "dependencies": {
    "three": "^0.169.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "@types/three": "^0.169.0"
  }
}
```

Commandes :
```bash
npm create vite@latest trackmania-3js -- --template vanilla-ts
cd trackmania-3js
npm install three
npm install -D @types/three
npm run dev
```

---

## 🔊 Audio (Web Audio API)

```typescript
// SoundManager : un AudioContext partagé, gain master
// Sons requis :
// - engine_loop.ogg  (boucle, pitch proportionnel à la vitesse)
// - checkpoint.ogg   (court, positif)
// - crash.ogg        (impact)
// - countdown.ogg    (3, 2, 1, GO!)
// Jamais d'autoplay sans geste utilisateur → déclencher sur premier click
```

---

## ✅ Checklist avant chaque commit

- [ ] 60 fps en mode dev (vérifier avec `Stats.js`)
- [ ] Pas de fuite mémoire (pas de `addEventListener` sans removeEventListener)
- [ ] Respawn fonctionne depuis n'importe quelle position
- [ ] Le chrono se réinitialise correctement au restart
- [ ] Pas d'erreur console en mode strict TypeScript