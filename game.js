// ==================== CONFIGURATION ====================
const CONFIG = {
    CAR_MAX_SPEED: 50,
    CAR_ACCELERATION: 150,
    CAR_BRAKING: 200,
    CAR_TURN_SPEED: 90,
    NITRO_BOOST: 1.5,
    NITRO_MAX: 100,
    NITRO_CONSUMPTION: 20,
    NITRO_RECHARGE: 30,
    GRAVITY: 9.81,
};

// ==================== SCENE SETUP ====================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 300, 500);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowShadowMap;
document.getElementById('canvas').appendChild(renderer.domElement);

// ==================== LIGHTING ====================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -200;
directionalLight.shadow.camera.right = 200;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -200;
scene.add(directionalLight);

// ==================== GROUND & TERRAIN ====================
// Large grass ground with texture variation
const groundGeometry = new THREE.PlaneGeometry(1200, 1400);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2d5016,
    roughness: 0.8,
    metalness: 0.0
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Darker grass patches for variation
function addDarkGrassPatch(position, size) {
    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({
        color: 0x1a3d0a,
        roughness: 0.9
    });
    const patch = new THREE.Mesh(geometry, material);
    patch.position.copy(position);
    patch.position.y = -0.02;
    patch.rotation.x = -Math.PI / 2;
    patch.receiveShadow = true;
    scene.add(patch);
}

addDarkGrassPatch(new THREE.Vector3(350, 0, 200), 300);
addDarkGrassPatch(new THREE.Vector3(-350, 0, 200), 300);
addDarkGrassPatch(new THREE.Vector3(0, 0, -350), 400);

// Advanced track material with details
const trackCanvas = document.createElement('canvas');
trackCanvas.width = 256;
trackCanvas.height = 256;
const ctx = trackCanvas.getContext('2d');
ctx.fillStyle = '#333333';
ctx.fillRect(0, 0, 256, 256);
// Add road texture details (lane markings, worn areas)
for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(100, 100, 100, ${Math.random() * 0.3})`;
    ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 30, Math.random() * 30);
}
const trackTexture = new THREE.CanvasTexture(trackCanvas);
trackTexture.repeat.set(4, 8);
trackTexture.wrapS = THREE.RepeatWrapping;
trackTexture.wrapT = THREE.RepeatWrapping;

const trackMaterial = new THREE.MeshStandardMaterial({
    map: trackTexture,
    color: 0x3a3a3a,
    roughness: 0.6,
    metalness: 0.1
});

// Road/Track helper function with better geometry
function createTrackSegment(start, end, width = 10) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();
    
    const geometry = new THREE.PlaneGeometry(width, length);
    const mesh = new THREE.Mesh(geometry, trackMaterial);
    
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mesh.position.copy(midpoint);
    mesh.position.y = 0.02;
    
    const angle = Math.atan2(direction.x, direction.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = angle;
    
    mesh.receiveShadow = true;
    scene.add(mesh);
    
    // Add center line (yellow dashed)
    const lineGeometry = new THREE.PlaneGeometry(0.3, length);
    const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffff00,
        metalness: 0.8,
        roughness: 0.2
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.copy(midpoint);
    line.position.y = 0.05;
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = angle;
    scene.add(line);
    
    return mesh;
}

// Create circuit track with smooth curves
const trackPoints = [
    new THREE.Vector3(0, 0, 0),           // Start line
    new THREE.Vector3(0, 0, 100),         // Straight 1
    new THREE.Vector3(80, 0, 140),        // Turn right smooth
    new THREE.Vector3(160, 0, 140),       // Mid-turn
    new THREE.Vector3(220, 0, 100),       // Turn 2 exit
    new THREE.Vector3(240, 0, 40),        // Right side
    new THREE.Vector3(240, 0, -40),       // Bottom right
    new THREE.Vector3(220, 0, -100),      // Turn 3
    new THREE.Vector3(160, 0, -140),      // Mid-bottom
    new THREE.Vector3(80, 0, -140),       // Bottom mid
    new THREE.Vector3(0, 0, -100),        // Back straight
    new THREE.Vector3(-80, 0, -140),      // Left turn
    new THREE.Vector3(-160, 0, -140),     // Left mid
    new THREE.Vector3(-220, 0, -100),     // Left exit
    new THREE.Vector3(-240, 0, 0),        // Left side
    new THREE.Vector3(-220, 0, 100),      // Left return
    new THREE.Vector3(-160, 0, 140),      // Left top
    new THREE.Vector3(-80, 0, 140),       // Approaching start
    new THREE.Vector3(0, 0, 100),         // Back to start area
];

// Draw track segments
for (let i = 0; i < trackPoints.length - 1; i++) {
    createTrackSegment(trackPoints[i], trackPoints[i + 1], 12);
}

// Advanced border system with raised curbs
function createBorderCurb(start, end, offset = 6.5) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(offset);
    
    const borderStart = new THREE.Vector3().addVectors(start, perpendicular);
    const borderEnd = new THREE.Vector3().addVectors(end, perpendicular);
    
    // Red and white striped curb
    const curbGeometry = new THREE.BoxGeometry(0.8, 0.4, length);
    const curbMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        metalness: 0.3,
        roughness: 0.4
    });
    const curb = new THREE.Mesh(curbGeometry, curbMaterial);
    
    const midpoint = new THREE.Vector3().addVectors(borderStart, borderEnd).multiplyScalar(0.5);
    curb.position.copy(midpoint);
    curb.position.y = 0.3;
    
    const angle = Math.atan2(direction.x, direction.z);
    curb.rotation.z = angle;
    
    curb.castShadow = true;
    curb.receiveShadow = true;
    scene.add(curb);
    
    // White line on top
    const whiteLineGeometry = new THREE.PlaneGeometry(0.5, length);
    const whiteLineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        metalness: 0.5
    });
    const whiteLine = new THREE.Mesh(whiteLineGeometry, whiteLineMaterial);
    whiteLine.position.copy(midpoint);
    whiteLine.position.y = 0.62;
    whiteLine.rotation.x = -Math.PI / 2;
    whiteLine.rotation.z = angle;
    scene.add(whiteLine);
}

// Add curbs to both sides
for (let i = 0; i < trackPoints.length - 1; i++) {
    createBorderCurb(trackPoints[i], trackPoints[i + 1], 6.3);
    createBorderCurb(trackPoints[i], trackPoints[i + 1], -6.3);
}

// Realistic trees with better geometry
function addRealisticTree(position) {
    // Trunk with better proportions
    const trunkGeometry = new THREE.CylinderGeometry(0.8, 1.2, 8, 12);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5d4e37,
        roughness: 0.7,
        metalness: 0.0
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.copy(position);
    trunk.position.y = 4;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    scene.add(trunk);
    
    // Multiple layers of foliage for better shape
    const foliageLayers = [
        { radius: 5, height: 7, color: 0x2d5016 },
        { radius: 4, height: 9, color: 0x3d6b1f },
        { radius: 3, height: 11, color: 0x2d5016 }
    ];
    
    foliageLayers.forEach((layer, idx) => {
        const foliageGeometry = new THREE.ConeGeometry(layer.radius, layer.radius * 1.5, 16);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: layer.color,
            roughness: 0.8,
            metalness: 0.0
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.copy(position);
        foliage.position.y = layer.height;
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        scene.add(foliage);
    });
}

// Plant trees strategically around track
const treePositions = [
    new THREE.Vector3(350, 0, 200),
    new THREE.Vector3(350, 0, -200),
    new THREE.Vector3(-350, 0, 200),
    new THREE.Vector3(-350, 0, -200),
    new THREE.Vector3(350, 0, 0),
    new THREE.Vector3(-350, 0, 0),
    new THREE.Vector3(0, 0, 280),
    new THREE.Vector3(0, 0, -280),
    new THREE.Vector3(280, 0, 250),
    new THREE.Vector3(-280, 0, 250),
    new THREE.Vector3(280, 0, -250),
    new THREE.Vector3(-280, 0, -250),
    new THREE.Vector3(400, 0, 100),
    new THREE.Vector3(400, 0, -100),
    new THREE.Vector3(-400, 0, 100),
    new THREE.Vector3(-400, 0, -100),
];

treePositions.forEach(pos => addRealisticTree(pos));

// Add grandstands/spectator areas
function addGrandstand(position, size) {
    const geometry = new THREE.BoxGeometry(size.x, 2, size.z);
    const material = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        roughness: 0.6,
        metalness: 0.2
    });
    const stand = new THREE.Mesh(geometry, material);
    stand.position.copy(position);
    stand.position.y = 1;
    stand.castShadow = true;
    stand.receiveShadow = true;
    scene.add(stand);
}

addGrandstand(new THREE.Vector3(250, 0, 0), { x: 30, z: 20 });
addGrandstand(new THREE.Vector3(-250, 0, 0), { x: 30, z: 20 });
addGrandstand(new THREE.Vector3(0, 0, 200), { x: 40, z: 25 });

// Add pit building
function addPitBuilding() {
    const buildingGeometry = new THREE.BoxGeometry(40, 4, 20);
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.5,
        metalness: 0.3
    });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(-80, 2, -180);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
    
    // Roof
    const roofGeometry = new THREE.ConeGeometry(30, 3, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xff3333 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(-80, 5.5, -180);
    roof.castShadow = true;
    scene.add(roof);
}

addPitBuilding();

// Add street lights around the track
function addStreetLight(position) {
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 6, 8);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.copy(position);
    pole.position.y = 3;
    pole.castShadow = true;
    scene.add(pole);
    
    // Light
    const lightGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const lightMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffff99,
        emissive: 0xffff99,
        emissiveIntensity: 0.5
    });
    const light = new THREE.Mesh(lightGeometry, lightMaterial);
    light.position.copy(position);
    light.position.y = 6;
    scene.add(light);
    
    // Add actual point light for illumination
    const pointLight = new THREE.PointLight(0xffff99, 0.3, 50);
    pointLight.position.copy(position);
    pointLight.position.y = 6;
    scene.add(pointLight);
}

// Place lights along the track
addStreetLight(new THREE.Vector3(300, 0, 150));
addStreetLight(new THREE.Vector3(300, 0, -150));
addStreetLight(new THREE.Vector3(-300, 0, 150));
addStreetLight(new THREE.Vector3(-300, 0, -150));

// ==================== CAR ====================
class Car {
    constructor() {
        this.group = new THREE.Group();
        
        // Main chassis/body
        const chassisGeometry = new THREE.BoxGeometry(2, 1.2, 4.5);
        const chassisMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff2222,
            metalness: 0.7,
            roughness: 0.2
        });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.6;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.group.add(chassis);

        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.9, 0.6, 0.8);
        const windshieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.2, 0.5);
        windshield.rotation.z = 0.3;
        windshield.castShadow = true;
        this.group.add(windshield);

        // Front bumper/spoiler
        const frontSpoilerGeometry = new THREE.BoxGeometry(2.1, 0.3, 0.5);
        const spoilerMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8
        });
        const frontSpoiler = new THREE.Mesh(frontSpoilerGeometry, spoilerMaterial);
        frontSpoiler.position.set(0, 0.5, 2.3);
        frontSpoiler.castShadow = true;
        this.group.add(frontSpoiler);

        // Rear wing/spoiler
        const rearWingGeometry = new THREE.BoxGeometry(2.2, 0.8, 0.3);
        const rearWing = new THREE.Mesh(rearWingGeometry, spoilerMaterial);
        rearWing.position.set(0, 1.3, -2);
        rearWing.castShadow = true;
        this.group.add(rearWing);

        // Front lights (left and right)
        const headlightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff99,
            emissive: 0xffff55,
            emissiveIntensity: 0.8,
            metalness: 0.9,
            roughness: 0.1
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.8, 0.7, 2.2);
        leftHeadlight.castShadow = true;
        this.group.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.8, 0.7, 2.2);
        rightHeadlight.castShadow = true;
        this.group.add(rightHeadlight);

        // Add point lights for headlights
        const leftLight = new THREE.PointLight(0xffff99, 0.6, 40);
        leftLight.position.set(-0.8, 0.7, 2.2);
        this.group.add(leftLight);

        const rightLight = new THREE.PointLight(0xffff99, 0.6, 40);
        rightLight.position.set(0.8, 0.7, 2.2);
        this.group.add(rightLight);

        // Tail lights (rear)
        const tailLightGeometry = new THREE.SphereGeometry(0.25, 12, 12);
        const tailLightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.9,
            metalness: 0.8
        });

        const leftTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        leftTailLight.position.set(-0.7, 0.7, -2.3);
        leftTailLight.castShadow = true;
        this.group.add(leftTailLight);

        const rightTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        rightTailLight.position.set(0.7, 0.7, -2.3);
        rightTailLight.castShadow = true;
        this.group.add(rightTailLight);

        // Side mirrors
        const mirrorGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7
        });

        const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        leftMirror.position.set(-1.15, 0.8, 0.2);
        leftMirror.castShadow = true;
        this.group.add(leftMirror);

        const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        rightMirror.position.set(1.15, 0.8, 0.2);
        rightMirror.castShadow = true;
        this.group.add(rightMirror);

        // Wheels with rims
        this.wheels = [];
        const wheelPositions = [
            [-1, 0.4, 0.8],
            [1, 0.4, 0.8],
            [-1, 0.4, -0.8],
            [1, 0.4, -0.8]
        ];
        
        wheelPositions.forEach(pos => {
            // Wheel tire
            const tireGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 24);
            const tireMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.9,
                metalness: 0.1
            });
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.rotation.z = Math.PI / 2;
            tire.position.set(pos[0], pos[1], pos[2]);
            tire.castShadow = true;
            tire.receiveShadow = true;
            this.group.add(tire);

            // Wheel rim
            const rimGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16);
            const rimMaterial = new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 0.95,
                roughness: 0.15
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            rim.position.set(pos[0], pos[1], pos[2]);
            rim.castShadow = true;
            this.group.add(rim);

            this.wheels.push({ tire: tire, rim: rim, rotation: 0 });
        });

        // Roof spoiler/fins
        const roofFinGeometry = new THREE.BoxGeometry(0.2, 0.5, 1);
        const roofFinMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8
        });
        const roofFin = new THREE.Mesh(roofFinGeometry, roofFinMaterial);
        roofFin.position.set(0, 1.5, 0.2);
        roofFin.castShadow = true;
        this.group.add(roofFin);

        // Exhaust pipe (right side)
        const exhaustGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12);
        const exhaustMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.6
        });
        const exhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaust.rotation.z = Math.PI / 2;
        exhaust.position.set(0.9, 0.3, -2.2);
        exhaust.castShadow = true;
        this.group.add(exhaust);

        // Nitro flame effect (rear)
        const nitroFlameGeometry = new THREE.ConeGeometry(0.3, 1.5, 12);
        const nitroFlameMaterial = new THREE.MeshStandardMaterial({
            color: 0xff6600,
            emissive: 0xff3300,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.7
        });
        this.nitroFlame = new THREE.Mesh(nitroFlameGeometry, nitroFlameMaterial);
        this.nitroFlame.position.set(0, 0.3, -2.5);
        this.nitroFlame.visible = false;
        this.group.add(this.nitroFlame);

        this.group.position.set(0, 1, 0);
        scene.add(this.group);

        // Physics
        this.speed = 0;
        this.maxSpeed = CONFIG.CAR_MAX_SPEED;
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.nitro = CONFIG.NITRO_MAX * 0.5;
    }

    update(input, deltaTime) {
        // Acceleration / Braking
        if (input.forward) {
            this.speed = Math.min(this.speed + CONFIG.CAR_ACCELERATION * deltaTime, this.maxSpeed);
        } else if (input.backward) {
            this.speed = Math.max(this.speed - CONFIG.CAR_BRAKING * deltaTime, 0);
        } else {
            this.speed *= 0.98;
        }

        // Nitro
        const isNitroActive = input.nitro && this.nitro > 0;
        if (isNitroActive) {
            this.speed = Math.min(this.speed * CONFIG.NITRO_BOOST, this.maxSpeed * 1.3);
            this.nitro -= CONFIG.NITRO_CONSUMPTION * deltaTime;
        } else {
            this.nitro = Math.min(this.nitro + CONFIG.NITRO_RECHARGE * deltaTime, CONFIG.NITRO_MAX);
        }

        // Show/hide nitro flame
        this.nitroFlame.visible = isNitroActive && this.speed > 5;

        // Rotation
        if (this.speed > 1) {
            if (input.left) {
                this.group.rotation.y += (CONFIG.CAR_TURN_SPEED * Math.PI / 180) * deltaTime;
            }
            if (input.right) {
                this.group.rotation.y -= (CONFIG.CAR_TURN_SPEED * Math.PI / 180) * deltaTime;
            }
        }

        // Movement
        const moveDirection = new THREE.Vector3(0, 0, this.speed * deltaTime);
        moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        this.group.position.add(moveDirection);

        // Gravity
        this.group.position.y = Math.max(this.group.position.y - CONFIG.GRAVITY * deltaTime * 0.2, 1);

        // Update wheel rotation
        this.wheels.forEach(wheel => {
            wheel.rotation += this.speed * deltaTime / 0.5;
            wheel.tire.rotation.x = wheel.rotation;
            wheel.rim.rotation.x = wheel.rotation;
        });

        // Update camera
        const cameraOffset = new THREE.Vector3(0, 4, -10);
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        camera.position.lerp(
            new THREE.Vector3(
                this.group.position.x + cameraOffset.x,
                this.group.position.y + cameraOffset.y,
                this.group.position.z + cameraOffset.z
            ),
            0.1
        );
        camera.lookAt(this.group.position.x, this.group.position.y + 1, this.group.position.z);
    }

    getSpeed() {
        return this.speed;
    }

    getNitroPercent() {
        return this.nitro / CONFIG.NITRO_MAX;
    }

    respawn(position, rotation) {
        this.group.position.copy(position);
        this.group.rotation.copy(rotation);
        this.speed = 0;
        this.nitro = CONFIG.NITRO_MAX * 0.5;
    }
}

const car = new Car();
const spawnPoint = { pos: new THREE.Vector3(0, 1, 0), rot: new THREE.Euler(0, 0, 0) };

// ==================== CHECKPOINTS ====================
class Checkpoint {
    constructor(index, position) {
        this.index = index;
        this.passed = false;
        this.group = new THREE.Group();

        // Main portal frame - much larger and more realistic
        const portalGeometry = new THREE.BoxGeometry(10, 6, 0.5);
        const portalMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ccff,
            emissive: 0x0088ff,
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.y = 3;
        portal.castShadow = true;
        portal.receiveShadow = true;
        this.group.add(portal);

        // Support pillars on both sides
        const pillarGeometry = new THREE.CylinderGeometry(0.6, 0.8, 6, 12);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            metalness: 0.6,
            roughness: 0.4
        });
        
        const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        leftPillar.position.set(-4.5, 3, 0);
        leftPillar.castShadow = true;
        this.group.add(leftPillar);
        
        const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        rightPillar.position.set(4.5, 3, 0);
        rightPillar.castShadow = true;
        this.group.add(rightPillar);

        // Top arch decoration
        const archGeometry = new THREE.TorusGeometry(5, 0.3, 12, 32, 0, Math.PI);
        const archMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff00,
            emissive: 0x00aa00,
            emissiveIntensity: 0.4,
            metalness: 0.9,
            roughness: 0.1
        });
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.position.y = 6;
        arch.rotation.z = Math.PI;
        arch.castShadow = true;
        this.group.add(arch);

        // Number plate
        const plateGeometry = new THREE.BoxGeometry(2, 1, 0.2);
        const plateMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.8
        });
        const plate = new THREE.Mesh(plateGeometry, plateMaterial);
        plate.position.set(0, 1.5, 0.5);
        plate.castShadow = true;
        this.group.add(plate);

        // Add glowing point lights around portal
        const glowLight = new THREE.PointLight(0x00ccff, 0.5, 30);
        glowLight.position.set(0, 3, 0);
        this.group.add(glowLight);

        this.group.position.copy(position);
        scene.add(this.group);
        this.boundingBox = new THREE.Box3().setFromObject(this.group);
    }

    checkCollision(carPos) {
        return this.boundingBox.containsPoint(carPos);
    }

    pass() {
        this.passed = true;
        // Change to green when passed
        const portal = this.group.children[0];
        portal.material.color.set(0x00ff00);
        portal.material.emissive.set(0x00dd00);
    }

    reset() {
        this.passed = false;
        const portal = this.group.children[0];
        portal.material.color.set(0x00ccff);
        portal.material.emissive.set(0x0088ff);
    }
}

// Create checkpoint circuit (following the track)
const checkpoints = [];
const checkpointPositions = [
    new THREE.Vector3(0, 0, 40),            // Start/Finish
    new THREE.Vector3(0, 0, 80),            // After first straight
    new THREE.Vector3(140, 0, 110),         // First big turn
    new THREE.Vector3(200, 0, 60),          // Turn right
    new THREE.Vector3(200, 0, -60),         // Bottom right
    new THREE.Vector3(140, 0, -110),        // Turn left
    new THREE.Vector3(0, 0, -80),           // Back straight
    new THREE.Vector3(-140, 0, 0),          // Left side
    new THREE.Vector3(-100, 0, 80),         // Coming back
];

checkpointPositions.forEach((pos, idx) => {
    checkpoints.push(new Checkpoint(idx, pos));
});

// ==================== GAME STATE ====================
const gameState = {
    running: true,
    paused: false,
    finished: false,
    startTime: Date.now(),
    currentCheckpoint: 0,
    raceTime: 0
};

// ==================== INPUT HANDLING ====================
const input = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    nitro: false
};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') input.forward = true;
    if (key === 's' || key === 'arrowdown') input.backward = true;
    if (key === 'a' || key === 'arrowleft') input.left = true;
    if (key === 'd' || key === 'arrowright') input.right = true;
    if (key === ' ') input.nitro = true;
    if (key === 'r') resetRace();
    if (key === 'escape') togglePause();
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') input.forward = false;
    if (key === 's' || key === 'arrowdown') input.backward = false;
    if (key === 'a' || key === 'arrowleft') input.left = false;
    if (key === 'd' || key === 'arrowright') input.right = false;
    if (key === ' ') input.nitro = false;
});

// ==================== GAME FUNCTIONS ====================
function updateHUD() {
    const speed = car.getSpeed() * 3.6; // Convert to km/h
    document.getElementById('speedDisplay').textContent = speed.toFixed(0) + ' km/h';
    document.getElementById('altitudeDisplay').textContent = car.group.position.y.toFixed(1) + ' m';

    const nitroPercent = car.getNitroPercent();
    document.getElementById('nitroBar').style.width = (nitroPercent * 100) + '%';

    document.getElementById('checkpointDisplay').textContent = 
        gameState.currentCheckpoint + ' / ' + checkpoints.length;

    // Timer
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    const ms = Math.floor((elapsed % 1) * 100);
    document.getElementById('timerDisplay').textContent = 
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(2, '0')}`;

    // Distance to next checkpoint
    if (gameState.currentCheckpoint < checkpoints.length) {
        const nextCheckpoint = checkpoints[gameState.currentCheckpoint];
        const distance = car.group.position.distanceTo(nextCheckpoint.group.position);
        document.getElementById('distanceToCheckpoint').textContent = distance.toFixed(0);
    }
}

function checkCheckpoints() {
    if (gameState.currentCheckpoint >= checkpoints.length || gameState.finished) return;

    const nextCheckpoint = checkpoints[gameState.currentCheckpoint];
    if (nextCheckpoint.checkCollision(car.group.position)) {
        nextCheckpoint.pass();
        gameState.currentCheckpoint++;

        if (gameState.currentCheckpoint >= checkpoints.length) {
            finishRace();
        }
    }
}

function finishRace() {
    gameState.finished = true;
    gameState.running = false;
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    const ms = Math.floor((elapsed % 1) * 1000);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;
    
    document.getElementById('finishTime').textContent = timeStr;
    document.getElementById('finishScreen').classList.add('show');
}

function resetRace() {
    gameState.startTime = Date.now();
    gameState.currentCheckpoint = 0;
    gameState.finished = false;
    gameState.running = true;
    gameState.paused = false;
    
    car.respawn(spawnPoint.pos.clone(), new THREE.Euler());
    checkpoints.forEach(cp => cp.reset());
    
    document.getElementById('finishScreen').classList.remove('show');
    document.getElementById('pauseMenu').classList.remove('show');
}

function togglePause() {
    gameState.paused = !gameState.paused;
    if (gameState.paused) {
        document.getElementById('pauseMenu').classList.add('show');
    } else {
        document.getElementById('pauseMenu').classList.remove('show');
    }
}

// ==================== ANIMATION LOOP ====================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    if (!gameState.paused && gameState.running) {
        const deltaTime = Math.min(clock.getDelta(), 0.016); // Cap at 60 FPS
        car.update(input, deltaTime);
        checkCheckpoints();
        updateHUD();
    }

    renderer.render(scene, camera);
}

animate();

// ==================== RESPONSIVE ====================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
