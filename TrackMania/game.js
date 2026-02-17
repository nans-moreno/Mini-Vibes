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

// ==================== SOUND MANAGER ====================
class SoundManager {
    constructor() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.ctx = audioContext;
        this.masterGain = audioContext.createGain();
        this.masterGain.gain.value = 0.25;
        this.masterGain.connect(audioContext.destination);
        
        this.engineOscs = [];
        this.engineGains = [];
        this.engineNoiseGain = null;
        this.engineNoiseSource = null;
        
        // Music system
        this.musicOscs = [];
        this.musicGains = [];
        this.musicActive = false;
        this.beatTime = 0;
    }
    
    // Start background music loop (arcade/electronic style)
    startBackgroundMusic() {
        if (this.musicActive) return;
        this.musicActive = true;
        
        const beatDuration = 0.5; // 120 BPM = 0.5s per beat
        const loopDuration = beatDuration * 8; // 4 beats per measure
        
        const playBeat = () => {
            if (!this.musicActive) return;
            
            const now = this.ctx.currentTime;
            
            // Kick drum on beats 1 and 3
            this.playKickDrum(now, beatDuration * 0.7);
            
            // Snare on beats 2 and 4
            this.playSnare(now + beatDuration * 1, beatDuration * 0.7);
            this.playSnare(now + beatDuration * 3, beatDuration * 0.7);
            
            // Hi-hat
            for (let i = 0; i < 8; i++) {
                this.playHiHat(now + beatDuration * 0.25 * i, beatDuration * 0.2);
            }
            
            // Bass line
            const bassNotes = [55, 55, 55, 82, 82, 110, 110, 82]; // B1, B1, B1, E2, E2, A2, A2, E2
            bassNotes.forEach((freq, idx) => {
                this.playBass(now + beatDuration * idx, beatDuration * 0.8, freq);
            });
            
            // Lead synth melody
            const leadNotes = [330, 330, 390, 390, 440, 440, 440, 330]; // E4, E4, G4, G4, A4, A4, A4, E4
            leadNotes.forEach((freq, idx) => {
                this.playSynthLead(now + beatDuration * idx, beatDuration * 0.7, freq);
            });
            
            setTimeout(playBeat, loopDuration * 1000);
        };
        
        playBeat();
    }
    
    stopBackgroundMusic() {
        this.musicActive = false;
        this.musicOscs.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.musicOscs = [];
    }
    
    playKickDrum(time, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + duration);
        
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
        this.musicOscs.push(osc);
    }
    
    playSnare(time, duration) {
        // Noise burst
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        noise.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        noise.start(time);
    }
    
    playHiHat(time, duration) {
        // High-pitched noise
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.ctx.createGain();
        noise.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        noise.start(time);
    }
    
    playBass(time, duration, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'square';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }
    
    playSynthLead(time, duration, freq) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }
    
    // Create realistic multi-harmonic engine sound
    playEngineSound(speed, maxSpeed) {
        const speedRatio = speed / maxSpeed;
        
        // Initialize engine oscillators if needed
        if (this.engineOscs.length === 0) {
            // Create 3 harmonic oscillators for realistic engine tone
            const frequencies = [150, 300, 450]; // Fundamental and harmonics
            
            frequencies.forEach((baseFreq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.type = idx === 0 ? 'sine' : 'sine';
                osc.frequency.value = baseFreq;
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                this.engineOscs.push(osc);
                this.engineGains.push(gain);
                
                gain.gain.value = idx === 0 ? 0.08 : (0.04 / (idx));
                osc.start();
            });
            
            // Add engine noise layer
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            this.engineNoiseSource = this.ctx.createBufferSource();
            this.engineNoiseSource.buffer = buffer;
            this.engineNoiseSource.loop = true;
            
            this.engineNoiseGain = this.ctx.createGain();
            this.engineNoiseSource.connect(this.engineNoiseGain);
            this.engineNoiseGain.connect(this.masterGain);
            this.engineNoiseSource.start();
        }
        
        // Update fundamental frequency based on speed (RPM simulation)
        const baseFreq = 150 + speedRatio * 550; // Range from 150Hz to 700Hz
        
        this.engineOscs.forEach((osc, idx) => {
            const harmonic = idx + 1;
            const targetFreq = baseFreq * harmonic;
            osc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
        });
        
        // Volume increases with speed
        const volume = Math.min(speedRatio * 0.12, 0.1);
        this.engineGains.forEach((gain, idx) => {
            const targetGain = (idx === 0 ? 0.08 : 0.04 / (idx)) * (volume / 0.1);
            gain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
        });
        
        // Engine noise intensity
        if (this.engineNoiseGain) {
            const noiseVolume = speedRatio * 0.05;
            this.engineNoiseGain.gain.setTargetAtTime(noiseVolume, this.ctx.currentTime, 0.1);
        }
    }
    
    playCollisionSound(intensity = 0.5) {
        // HEAVY collision impact with deep rumble
        const frequencies = [60, 120, 200, 350];
        
        frequencies.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(freq + Math.random() * 100, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.2, this.ctx.currentTime + 0.5);
            
            const delay = idx * 0.03;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(intensity * 0.4, this.ctx.currentTime + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
            
            osc.start(this.ctx.currentTime + delay);
            osc.stop(this.ctx.currentTime + 0.55);
        });
        
        // Aggressive noise burst
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noiseGain.gain.setValueAtTime(intensity * 0.35, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        
        noise.start();
        
        // Metal clang for extra impact
        const clang = this.ctx.createOscillator();
        const clangGain = this.ctx.createGain();
        clang.connect(clangGain);
        clangGain.connect(this.masterGain);
        
        clang.frequency.setValueAtTime(800, this.ctx.currentTime);
        clang.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);
        
        clangGain.gain.setValueAtTime(intensity * 0.25, this.ctx.currentTime);
        clangGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        clang.start();
        clang.stop(this.ctx.currentTime + 0.3);
    }
    
    playBrakeSound(intensity = 0.5) {
        // HEAVY tire squeal with multiple frequencies
        const squeals = [3000, 3500, 4200, 2000];
        
        squeals.forEach((freq, idx) => {
            const bufferSize = this.ctx.sampleRate * 0.5;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                const t = i / this.ctx.sampleRate;
                data[i] = Math.sin(t * freq * Math.PI * 2) * (Math.random() * 0.6 + 0.4) * (1 - i / bufferSize);
            }
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            const gain = this.ctx.createGain();
            noise.connect(gain);
            gain.connect(this.masterGain);
            
            const delay = idx * 0.05;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(intensity * 0.25, this.ctx.currentTime + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + 0.5);
            
            noise.start(this.ctx.currentTime + delay);
        });
        
        // Deep brake rumble
        const rumbleFreqs = [80, 120, 60];
        rumbleFreqs.forEach((freq, idx) => {
            const rumbleOsc = this.ctx.createOscillator();
            const rumbleGain = this.ctx.createGain();
            rumbleOsc.connect(rumbleGain);
            rumbleGain.connect(this.masterGain);
            
            rumbleOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            rumbleOsc.frequency.linearRampToValueAtTime(freq * 0.6, this.ctx.currentTime + 0.5);
            
            const delay = idx * 0.03;
            rumbleGain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
            rumbleGain.gain.linearRampToValueAtTime(intensity * 0.15, this.ctx.currentTime + delay + 0.05);
            rumbleGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
            
            rumbleOsc.start(this.ctx.currentTime + delay);
            rumbleOsc.stop(this.ctx.currentTime + 0.55);
        });
    }
    
    playNitroSound() {
        // Turbo spin-up sound with whoosh
        const frequencies = [1000, 1500, 2000];
        
        frequencies.forEach((startFreq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(startFreq * 2.5, this.ctx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        });
        
        // Whoosh noise effect
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const whoosh = this.ctx.createBufferSource();
        whoosh.buffer = buffer;
        const whooshGain = this.ctx.createGain();
        whoosh.connect(whooshGain);
        whooshGain.connect(this.masterGain);
        
        whooshGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        whooshGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        
        whoosh.start();
    }
    
    playCheckpointSound() {
        // Beep sound with two tones
        const tones = [800, 1200];
        
        tones.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.frequency.value = freq;
            
            const delay = idx * 0.08;
            gain.gain.setValueAtTime(0, this.ctx.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + delay + 0.15);
            
            osc.start(this.ctx.currentTime + delay);
            osc.stop(this.ctx.currentTime + delay + 0.15);
        });
    }
    
    playFinishSound() {
        // Victorious fanfare
        const melody = [
            { freq: 523, duration: 0.15 },   // C5
            { freq: 659, duration: 0.15 },   // E5
            { freq: 784, duration: 0.15 },   // G5
            { freq: 1047, duration: 0.3 }    // C6 (longer)
        ];
        
        let totalDelay = 0;
        melody.forEach((note) => {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.masterGain);
                
                osc.frequency.value = note.freq;
                gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + note.duration);
                
                osc.start();
                osc.stop(this.ctx.currentTime + note.duration);
            }, totalDelay * 1000);
            
            totalDelay += note.duration;
        });
    }
    
    stopEngine() {
        if (this.engineOscs.length > 0) {
            this.engineGains.forEach(gain => {
                gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
            });
        }
        if (this.engineNoiseGain) {
            this.engineNoiseGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
        }
    }
}

const soundManager = new SoundManager();

// ==================== SCENE SETUP ====================
const scene = new THREE.Scene();
// Trackmania-style vibrant sky
scene.background = new THREE.Color(0x4da6ff);
scene.fog = new THREE.FogExp2(0x4da6ff, 0.0012);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.4;
document.getElementById('canvas').appendChild(renderer.domElement);

// ==================== LIGHTING ====================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xfffacd, 1.2);
directionalLight.position.set(200, 150, 100);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -400;
directionalLight.shadow.camera.right = 400;
directionalLight.shadow.camera.top = 400;
directionalLight.shadow.camera.bottom = -400;
directionalLight.shadow.bias = -0.0001;
scene.add(directionalLight);

// Add hemisphere light for better ambient
const hemiLight = new THREE.HemisphereLight(0x4da6ff, 0x2d5016, 0.6);
scene.add(hemiLight);

// ==================== GROUND & TERRAIN ====================
// Large grass ground with better texture
const groundGeometry = new THREE.PlaneGeometry(1400, 1600);
const grassCanvas = document.createElement('canvas');
grassCanvas.width = 512;
grassCanvas.height = 512;
const grassCtx = grassCanvas.getContext('2d');
// Create grass texture
grassCtx.fillStyle = '#2d5016';
grassCtx.fillRect(0, 0, 512, 512);
for (let i = 0; i < 2000; i++) {
    const shade = Math.random() * 40 - 20;
    grassCtx.fillStyle = `rgb(${45 + shade}, ${80 + shade}, ${22 + shade})`;
    grassCtx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
}
const grassTexture = new THREE.CanvasTexture(grassCanvas);
grassTexture.repeat.set(20, 20);
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;

const groundMaterial = new THREE.MeshStandardMaterial({ 
    map: grassTexture,
    roughness: 0.9,
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
        roughness: 0.95
    });
    const patch = new THREE.Mesh(geometry, material);
    patch.position.copy(position);
    patch.position.y = 0.01;
    patch.rotation.x = -Math.PI / 2;
    patch.receiveShadow = true;
    scene.add(patch);
}

// Create grass patches around track
addDarkGrassPatch(new THREE.Vector3(350, 0, 0), 250);
addDarkGrassPatch(new THREE.Vector3(-350, 0, 0), 250);
addDarkGrassPatch(new THREE.Vector3(0, 0, 350), 250);
addDarkGrassPatch(new THREE.Vector3(0, 0, -200), 300);

// ==================== CIRCUIT ZONE MARKERS ====================
// Start/Finish zone with special markings
function createStartZone() {
    // White start line on asphalt
    const startLineGeometry = new THREE.PlaneGeometry(12, 1);
    const startLineMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.7
    });
    const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
    startLine.position.set(0, 0.06, 0);
    startLine.rotation.x = -Math.PI / 2;
    startLine.receiveShadow = true;
    scene.add(startLine);
    
    // Checkered pattern boxes
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 2; j++) {
            const isBlack = (i + j) % 2 === 0;
            const boxGeo = new THREE.PlaneGeometry(2, 1);
            const boxMat = new THREE.MeshStandardMaterial({
                color: isBlack ? 0x000000 : 0xffffff,
                metalness: 0.5
            });
            const box = new THREE.Mesh(boxGeo, boxMat);
            box.position.set(-5 + i * 2, 0.08, -3 + j * 2);
            box.rotation.x = -Math.PI / 2;
            scene.add(box);
        }
    }
}

createStartZone();

// Advanced track material with better asphalt texture
const trackCanvas = document.createElement('canvas');
trackCanvas.width = 512;
trackCanvas.height = 512;
const ctx = trackCanvas.getContext('2d');
// Dark asphalt base
ctx.fillStyle = '#222222';
ctx.fillRect(0, 0, 512, 512);
// Add realistic road texture details
for (let i = 0; i < 1000; i++) {
    const shade = Math.random() * 50;
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.3)`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, Math.random() * 20 + 5, Math.random() * 20 + 5);
}
// Add tire marks and wear patterns
ctx.strokeStyle = 'rgba(40, 40, 40, 0.4)';
ctx.lineWidth = 3;
for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.lineTo(Math.random() * 512, 512);
    ctx.stroke();
}
const trackTexture = new THREE.CanvasTexture(trackCanvas);
trackTexture.repeat.set(6, 10);
trackTexture.wrapS = THREE.RepeatWrapping;
trackTexture.wrapT = THREE.RepeatWrapping;

const trackMaterial = new THREE.MeshStandardMaterial({
    map: trackTexture,
    color: 0x1a1a1a,
    roughness: 0.4,
    metalness: 0.3
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
    
    // Add white dashed center lines and side lines
    const lineGeometry = new THREE.PlaneGeometry(0.2, length);
    const lineMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffff99,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x444400
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.copy(midpoint);
    line.position.y = 0.05;
    line.rotation.x = -Math.PI / 2;
    line.rotation.z = angle;
    scene.add(line);
    
    // Side guide lines
    for (let side of [-7, 7]) {
        const sideLineGeo = new THREE.PlaneGeometry(0.15, length);
        const sideLineMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.8
        });
        const sideLine = new THREE.Mesh(sideLineGeo, sideLineMat);
        sideLine.position.copy(midpoint);
        sideLine.position.y = 0.04;
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(side);
        sideLine.position.add(perpendicular);
        sideLine.rotation.x = -Math.PI / 2;
        sideLine.rotation.z = angle;
        scene.add(sideLine);
    }
    
    return mesh;
}

// Create circuit track - complex layout with chicanes, S-curves and hairpin
const trackPoints = [
    // Start/Finish straight
    new THREE.Vector3(0, 0, -120),
    new THREE.Vector3(0, 0, -60),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 60),
    new THREE.Vector3(0, 0, 120),
    new THREE.Vector3(0, 0, 180),
    // S-curve (chicane gauche-droite)
    new THREE.Vector3(-30, 0, 220),
    new THREE.Vector3(-50, 0, 250),
    new THREE.Vector3(-30, 0, 280),
    new THREE.Vector3(10, 0, 310),
    new THREE.Vector3(60, 0, 330),
    // Long sweeping right curve
    new THREE.Vector3(120, 0, 340),
    new THREE.Vector3(180, 0, 330),
    new THREE.Vector3(230, 0, 300),
    new THREE.Vector3(260, 0, 260),
    // Fast kink
    new THREE.Vector3(280, 0, 220),
    new THREE.Vector3(310, 0, 180),
    new THREE.Vector3(320, 0, 130),
    // Right straight descent
    new THREE.Vector3(320, 0, 70),
    new THREE.Vector3(320, 0, 10),
    new THREE.Vector3(320, 0, -50),
    // Hairpin turn
    new THREE.Vector3(310, 0, -100),
    new THREE.Vector3(280, 0, -140),
    new THREE.Vector3(240, 0, -160),
    new THREE.Vector3(200, 0, -150),
    new THREE.Vector3(180, 0, -120),
    // Mid chicane
    new THREE.Vector3(170, 0, -80),
    new THREE.Vector3(150, 0, -50),
    new THREE.Vector3(120, 0, -40),
    new THREE.Vector3(90, 0, -50),
    // Second hairpin
    new THREE.Vector3(70, 0, -80),
    new THREE.Vector3(60, 0, -120),
    new THREE.Vector3(50, 0, -170),
    new THREE.Vector3(40, 0, -220),
    // Wide bottom curve back to start
    new THREE.Vector3(20, 0, -250),
    new THREE.Vector3(-10, 0, -260),
    new THREE.Vector3(-30, 0, -240),
    new THREE.Vector3(-20, 0, -200),
    new THREE.Vector3(-10, 0, -160),
    // Back to start
    new THREE.Vector3(0, 0, -120),
];

// Draw track segments - wider road
for (let i = 0; i < trackPoints.length - 1; i++) {
    createTrackSegment(trackPoints[i], trackPoints[i + 1], 18);
}

// Border markings - flat colored strips on the ground (no 3D boxes)
function createBorderCurb(start, end, offset = 6.5) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(offset);
    
    const borderStart = new THREE.Vector3().addVectors(start, perpendicular);
    const borderEnd = new THREE.Vector3().addVectors(end, perpendicular);
    const midpoint = new THREE.Vector3().addVectors(borderStart, borderEnd).multiplyScalar(0.5);
    const angle = Math.atan2(direction.x, direction.z);
    
    // Red strip on ground
    const redGeo = new THREE.PlaneGeometry(1.0, length);
    const redMat = new THREE.MeshStandardMaterial({
        color: 0xff2200,
        emissive: 0x440000,
        emissiveIntensity: 0.2
    });
    const redStrip = new THREE.Mesh(redGeo, redMat);
    redStrip.position.copy(midpoint);
    redStrip.position.y = 0.04;
    redStrip.rotation.x = -Math.PI / 2;
    redStrip.rotation.z = angle;
    scene.add(redStrip);
    
    // White edge line
    const whiteGeo = new THREE.PlaneGeometry(0.15, length);
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const whiteLine = new THREE.Mesh(whiteGeo, whiteMat);
    whiteLine.position.copy(midpoint);
    whiteLine.position.y = 0.05;
    whiteLine.rotation.x = -Math.PI / 2;
    whiteLine.rotation.z = angle;
    scene.add(whiteLine);
}

// Add curbs to both sides (wider track)
for (let i = 0; i < trackPoints.length - 1; i++) {
    createBorderCurb(trackPoints[i], trackPoints[i + 1], 9.5);
    createBorderCurb(trackPoints[i], trackPoints[i + 1], -9.5);
}

// ==================== INNER CIRCUIT ZONES ====================
// Add grass/green zones inside the circuit for a more professional look
function addInnerGrassZone(position, width, depth) {
    const grassGeo = new THREE.PlaneGeometry(width, depth);
    const grassMat = new THREE.MeshStandardMaterial({
        color: 0x1a4d0a,
        roughness: 0.95
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.copy(position);
    grass.position.y = -0.01;
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);
}

// Inner zones - adjusted for new track
addInnerGrassZone(new THREE.Vector3(150, 0, 100), 250, 400);

// ==================== COLLISION SYSTEM ====================
// Array to store collision objects
const collisionObjects = [];

// ==================== TIRE WALLS ====================
// Tire wall function
function createTireWall(start, end, offset = 7.5) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    direction.normalize();
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(offset);
    
    const wallStart = new THREE.Vector3().addVectors(start, perpendicular);
    const wallEnd = new THREE.Vector3().addVectors(end, perpendicular);
    
    // Tire wall with stacked tires - optimized spacing
    const tireSpacing = 3.0;
    for (let d = 0; d <= length; d += tireSpacing) {
        const t = d / length;
        const tirePos = new THREE.Vector3().lerpVectors(wallStart, wallEnd, t);
        
        // Single tire per position (reduced from 2)
        const tireGeometry = new THREE.TorusGeometry(0.45, 0.15, 8, 12);
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.95,
            metalness: 0.0
        });
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.y = Math.random() * Math.PI * 2;
        tire.position.copy(tirePos);
        tire.position.y = 0.5;
        tire.castShadow = false;
        tire.receiveShadow = true;
        scene.add(tire);
        
        collisionObjects.push({
            position: new THREE.Vector3(tirePos.x, tire.position.y, tirePos.z),
            radius: 0.5,
            type: 'tire'
        });
        
        // White stripe on top
        const stripeGeometry = new THREE.TorusGeometry(0.48, 0.08, 6, 10);
        const stripeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.6
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.copy(tirePos);
        stripe.position.y = 0.5;
        scene.add(stripe);
    }
}

// Add tire walls to both sides (wider offset for wider track)
for (let i = 0; i < trackPoints.length - 1; i++) {
    createTireWall(trackPoints[i], trackPoints[i + 1], 11);
    createTireWall(trackPoints[i], trackPoints[i + 1], -11);
}

// ==================== OBSTACLES ====================
// Oil barrel obstacles
function addOilBarrel(position) {
    const barrelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 10);
    const barrelMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa500,
        metalness: 0.6,
        roughness: 0.4
    });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.copy(position);
    barrel.position.y = 0.6;
    barrel.castShadow = true;
    barrel.receiveShadow = true;
    scene.add(barrel);
    
    // Add collision
    collisionObjects.push({
        position: position.clone(),
        radius: 0.6,
        type: 'barrel'
    });
}

// Tire wall obstacles
function addTireWall(position, count = 3) {
    for (let i = 0; i < count; i++) {
        const tireGeometry = new THREE.TorusGeometry(0.4, 0.15, 8, 12);
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.9,
            metalness: 0.0
        });
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.position.copy(position);
        tire.position.x += i * 0.8;
        tire.position.y = 0.4;
        tire.rotation.y = Math.PI / 4;
        tire.castShadow = true;
        tire.receiveShadow = true;
        scene.add(tire);
        
        // Add collision for each tire
        const tirePos = new THREE.Vector3().copy(position);
        tirePos.x += i * 0.8;
        collisionObjects.push({
            position: tirePos,
            radius: 0.5,
            type: 'tire'
        });
    }
}

// Concrete blocks/chicane
function addConcreteBlock(position) {
    const blockGeometry = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const blockMaterial = new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.7,
        metalness: 0.2
    });
    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    block.position.copy(position);
    block.position.y = 0.4;
    block.castShadow = true;
    block.receiveShadow = true;
    scene.add(block);
    
    // Add collision
    collisionObjects.push({
        position: position.clone(),
        radius: 1.0,
        type: 'block'
    });
}

// Place obstacles strategically on the track
// S-curve entry - barrels
addOilBarrel(new THREE.Vector3(-25, 0, 230));
addOilBarrel(new THREE.Vector3(-45, 0, 260));
addOilBarrel(new THREE.Vector3(-15, 0, 295));

// Sweeping right curve - tire chicane
addTireWall(new THREE.Vector3(130, 0, 338), 4);
addTireWall(new THREE.Vector3(240, 0, 290), 3);

// Fast kink area - barrels
addOilBarrel(new THREE.Vector3(290, 0, 210));
addOilBarrel(new THREE.Vector3(305, 0, 170));

// Right straight - chicane with concrete blocks
addConcreteBlock(new THREE.Vector3(315, 0, 50));
addConcreteBlock(new THREE.Vector3(325, 0, -10));
addOilBarrel(new THREE.Vector3(318, 0, -40));

// Hairpin entry - barrels
addOilBarrel(new THREE.Vector3(300, 0, -110));
addOilBarrel(new THREE.Vector3(270, 0, -145));

// Hairpin exit - tire wall
addTireWall(new THREE.Vector3(195, 0, -140), 3);

// Mid chicane - lots of obstacles
addOilBarrel(new THREE.Vector3(160, 0, -65));
addConcreteBlock(new THREE.Vector3(135, 0, -42));
addOilBarrel(new THREE.Vector3(100, 0, -48));

// Second hairpin - barrels
addOilBarrel(new THREE.Vector3(62, 0, -100));
addOilBarrel(new THREE.Vector3(55, 0, -150));

// Bottom straight - tire wall chicane
addTireWall(new THREE.Vector3(42, 0, -200), 3);
addConcreteBlock(new THREE.Vector3(25, 0, -245));

// Return to start - barrels
addOilBarrel(new THREE.Vector3(-15, 0, -250));
addOilBarrel(new THREE.Vector3(-25, 0, -225));

// Realistic trees with better geometry
function addRealisticTree(position) {
    // Trunk with better proportions
    const trunkGeometry = new THREE.CylinderGeometry(0.8, 1.2, 8, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x5d4e37,
        roughness: 0.7,
        metalness: 0.0
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.copy(position);
    trunk.position.y = 4;
    trunk.castShadow = false;
    trunk.receiveShadow = true;
    scene.add(trunk);
    
    // Multiple layers of foliage for better shape
    const foliageLayers = [
        { radius: 5, height: 7, color: 0x2d5016 },
        { radius: 4, height: 9, color: 0x3d6b1f },
        { radius: 3, height: 11, color: 0x2d5016 }
    ];
    
    foliageLayers.forEach((layer, idx) => {
        const foliageGeometry = new THREE.ConeGeometry(layer.radius, layer.radius * 1.5, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: layer.color,
            roughness: 0.8,
            metalness: 0.0
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.copy(position);
        foliage.position.y = layer.height;
        foliage.castShadow = false;
        foliage.receiveShadow = true;
        scene.add(foliage);
    });
}

// Plant trees strategically around new track
const treePositions = [
    // Along start straight
    new THREE.Vector3(-30, 0, 50),
    new THREE.Vector3(30, 0, 100),
    // S-curve exterior
    new THREE.Vector3(-80, 0, 250),
    new THREE.Vector3(-70, 0, 310),
    // Top curve exterior  
    new THREE.Vector3(100, 0, 380),
    new THREE.Vector3(200, 0, 370),
    // Right side
    new THREE.Vector3(360, 0, 200),
    new THREE.Vector3(360, 0, 50),
    new THREE.Vector3(360, 0, -80),
    // Hairpin exterior
    new THREE.Vector3(300, 0, -200),
    new THREE.Vector3(200, 0, -200),
    // Bottom area
    new THREE.Vector3(50, 0, -300),
    new THREE.Vector3(-50, 0, -280),
    // Return to start
    new THREE.Vector3(-60, 0, -180),
    new THREE.Vector3(-50, 0, -100),
];

treePositions.forEach(pos => addRealisticTree(pos));

// Decorative flags along the track instead of grandstands
function addFlag(position, color) {
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 5, 6);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.copy(position);
    pole.position.y = 2.5;
    scene.add(pole);
    
    const flagGeo = new THREE.PlaneGeometry(2, 1);
    const flagMat = new THREE.MeshStandardMaterial({ 
        color: color, 
        side: THREE.DoubleSide,
        emissive: color,
        emissiveIntensity: 0.1
    });
    const flag = new THREE.Mesh(flagGeo, flagMat);
    flag.position.copy(position);
    flag.position.y = 4.5;
    flag.position.x += 1;
    scene.add(flag);
}

const flagColors = [0xff0000, 0x0000ff, 0xffff00, 0x00ff00];
addFlag(new THREE.Vector3(-12, 0, -5), flagColors[0]);
addFlag(new THREE.Vector3(12, 0, -5), flagColors[1]);
addFlag(new THREE.Vector3(-12, 0, 10), flagColors[2]);
addFlag(new THREE.Vector3(12, 0, 10), flagColors[3]);

// Removed pit building (was causing grey block on map)

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
}

// Place lights along the new track
addStreetLight(new THREE.Vector3(-20, 0, 150));
addStreetLight(new THREE.Vector3(100, 0, 350));
addStreetLight(new THREE.Vector3(270, 0, 270));
addStreetLight(new THREE.Vector3(340, 0, 100));
addStreetLight(new THREE.Vector3(340, 0, -80));
addStreetLight(new THREE.Vector3(200, 0, -170));
addStreetLight(new THREE.Vector3(80, 0, -60));
addStreetLight(new THREE.Vector3(30, 0, -230));

// ==================== CAR ====================
class Car {
    constructor() {
        this.group = new THREE.Group();
        
        // Main chassis/body - lower part
        const chassisGeometry = new THREE.BoxGeometry(2, 0.6, 4.5);
        const chassisMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0044,
            metalness: 0.8,
            roughness: 0.15,
            envMapIntensity: 1.0
        });
        const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
        chassis.position.y = 0.4;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        this.group.add(chassis);

        // Upper cabin
        const cabinGeometry = new THREE.BoxGeometry(1.8, 0.6, 2.0);
        const cabinMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0044,
            metalness: 0.8,
            roughness: 0.15
        });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.set(0, 1.0, -0.2);
        cabin.castShadow = true;
        this.group.add(cabin);

        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(1.7, 0.5, 1.0);
        const windshieldMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.6
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.15, 0.9);
        windshield.rotation.x = -0.3;
        this.group.add(windshield);

        // Rear windshield
        const rearWindshieldGeometry = new THREE.BoxGeometry(1.7, 0.4, 0.6);
        const rearWindshield = new THREE.Mesh(rearWindshieldGeometry, windshieldMaterial);
        rearWindshield.position.set(0, 1.1, -1.1);
        rearWindshield.rotation.x = 0.3;
        this.group.add(rearWindshield);

        // Front bumper
        const frontSpoilerGeometry = new THREE.BoxGeometry(2.1, 0.25, 0.4);
        const spoilerMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.8
        });
        const frontSpoiler = new THREE.Mesh(frontSpoilerGeometry, spoilerMaterial);
        frontSpoiler.position.set(0, 0.25, 2.3);
        this.group.add(frontSpoiler);

        // Hood (capot)
        const hoodGeometry = new THREE.BoxGeometry(1.9, 0.1, 1.5);
        const hoodMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff0044,
            metalness: 0.85,
            roughness: 0.1
        });
        const hood = new THREE.Mesh(hoodGeometry, hoodMaterial);
        hood.position.set(0, 0.75, 1.4);
        this.group.add(hood);

        // Rear wing/spoiler
        const rearWingGeometry = new THREE.BoxGeometry(2.2, 0.15, 0.4);
        const rearWing = new THREE.Mesh(rearWingGeometry, spoilerMaterial);
        rearWing.position.set(0, 1.4, -1.9);
        this.group.add(rearWing);

        // Spoiler supports
        const supportGeo = new THREE.BoxGeometry(0.1, 0.4, 0.1);
        const leftSupport = new THREE.Mesh(supportGeo, spoilerMaterial);
        leftSupport.position.set(-0.8, 1.2, -1.9);
        this.group.add(leftSupport);
        const rightSupport = new THREE.Mesh(supportGeo, spoilerMaterial);
        rightSupport.position.set(0.8, 1.2, -1.9);
        this.group.add(rightSupport);

        // Front lights (left and right)
        const headlightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const headlightMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff99,
            emissive: 0xffff55,
            emissiveIntensity: 0.8,
            metalness: 0.9,
            roughness: 0.1
        });

        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-0.7, 0.45, 2.25);
        this.group.add(leftHeadlight);

        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(0.7, 0.45, 2.25);
        this.group.add(rightHeadlight);

        // Tail lights (rear)
        const tailLightGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const tailLightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.9,
            metalness: 0.8
        });

        const leftTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        leftTailLight.position.set(-0.7, 0.45, -2.25);
        this.group.add(leftTailLight);

        const rightTailLight = new THREE.Mesh(tailLightGeometry, tailLightMaterial);
        rightTailLight.position.set(0.7, 0.45, -2.25);
        this.group.add(rightTailLight);

        // Side mirrors
        const mirrorGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.3);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.7
        });

        const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        leftMirror.position.set(-1.1, 0.8, 0.5);
        this.group.add(leftMirror);

        const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        rightMirror.position.set(1.1, 0.8, 0.5);
        this.group.add(rightMirror);

        // Wheels with rims
        this.wheels = [];
        const wheelPositions = [
            [-1.1, 0.35, 1.6],   // front-left
            [1.1, 0.35, 1.6],    // front-right
            [-1.1, 0.35, -1.6],  // rear-left
            [1.1, 0.35, -1.6]    // rear-right
        ];
        
        wheelPositions.forEach(pos => {
            const wheelGroup = new THREE.Group();
            
            // Wheel tire (torus for round look)
            const tireGeometry = new THREE.TorusGeometry(0.38, 0.15, 10, 16);
            const tireMaterial = new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.9,
                metalness: 0.1
            });
            const tire = new THREE.Mesh(tireGeometry, tireMaterial);
            tire.castShadow = true;
            tire.receiveShadow = true;
            wheelGroup.add(tire);

            // Wheel rim (disc)
            const rimGeometry = new THREE.CylinderGeometry(0.28, 0.28, 0.12, 12);
            const rimMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 0.95,
                roughness: 0.1
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.x = Math.PI / 2;
            rim.castShadow = true;
            wheelGroup.add(rim);

            // Tire sidewall (cylinder to fill the torus)
            const sidewallGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 16);
            const sidewallMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a1a,
                roughness: 0.95
            });
            const sidewall = new THREE.Mesh(sidewallGeometry, sidewallMaterial);
            sidewall.rotation.x = Math.PI / 2;
            wheelGroup.add(sidewall);

            wheelGroup.position.set(pos[0], pos[1], pos[2]);
            this.group.add(wheelGroup);

            this.wheels.push({ group: wheelGroup, rotation: 0 });
        });

        // Exhaust pipes (dual)
        const exhaustGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 8);
        const exhaustMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.8
        });
        const exhaustL = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaustL.rotation.x = Math.PI / 2;
        exhaustL.position.set(-0.5, 0.2, -2.35);
        this.group.add(exhaustL);
        const exhaustR = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
        exhaustR.rotation.x = Math.PI / 2;
        exhaustR.position.set(0.5, 0.2, -2.35);
        this.group.add(exhaustR);

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
        this.nitroFlame.position.set(0, 0.25, -2.8);
        this.nitroFlame.rotation.x = Math.PI / 2;
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
        this.bounceTimer = 0;
        this.nitroWasActive = false;
        this.brakeWasActive = false;
    }

    update(input, deltaTime) {
        // Acceleration
        if (input.forward) {
            this.speed = Math.min(this.speed + CONFIG.CAR_ACCELERATION * deltaTime, this.maxSpeed);
        }
        
        // Braking (slow down, don't go negative)
        if (input.brake && this.speed > 0) {
            this.speed = Math.max(this.speed - CONFIG.CAR_BRAKING * deltaTime, 0);
        }
        
        // Reverse (separate from braking)
        if (input.backward && !input.forward) {
            this.speed = Math.max(this.speed - CONFIG.CAR_ACCELERATION * 0.5 * deltaTime, -this.maxSpeed * 0.3);
        }
        
        // Natural deceleration
        if (!input.forward && !input.backward && !input.brake) {
            this.speed *= 0.98;
            if (Math.abs(this.speed) < 0.1) this.speed = 0;
        }

        // Nitro
        const isNitroActive = input.nitro && this.nitro > 0;
        if (isNitroActive) {
            this.speed = Math.min(this.speed * CONFIG.NITRO_BOOST, this.maxSpeed * 1.3);
            this.nitro -= CONFIG.NITRO_CONSUMPTION * deltaTime;
            if (!this.nitroWasActive) {
                soundManager.playNitroSound();
            }
        } else {
            this.nitro = Math.min(this.nitro + CONFIG.NITRO_RECHARGE * deltaTime, CONFIG.NITRO_MAX);
        }
        this.nitroWasActive = isNitroActive;

        // Show/hide nitro flame
        this.nitroFlame.visible = isNitroActive && this.speed > 5;

        // Play engine sound based on speed
        soundManager.playEngineSound(Math.abs(this.speed), this.maxSpeed);
        
        // Play brake sound
        if (input.brake && this.speed > 0.5) {
            if (!this.brakeWasActive) {
                soundManager.playBrakeSound(Math.min(this.speed / this.maxSpeed, 1));
            }
        }
        this.brakeWasActive = input.brake && this.speed > 0.5;

        // Rotation (works when moving forward or backward)
        if (Math.abs(this.speed) > 0.5) {
            const turnDir = this.speed >= 0 ? 1 : -1;
            if (input.left) {
                this.group.rotation.y += turnDir * (CONFIG.CAR_TURN_SPEED * Math.PI / 180) * deltaTime;
            }
            if (input.right) {
                this.group.rotation.y -= turnDir * (CONFIG.CAR_TURN_SPEED * Math.PI / 180) * deltaTime;
            }
        }

        // Movement
        const moveDirection = new THREE.Vector3(0, 0, this.speed * deltaTime);
        moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        const newPosition = new THREE.Vector3().addVectors(this.group.position, moveDirection);
        
        // Check collisions with improved bounce system
        const collisionInfo = this.checkCollisionsWithBounce(newPosition);
        if (collisionInfo.canMove) {
            this.group.position.copy(newPosition);
        } else {
            // Bounce: push car away from collision
            const bounceDir = collisionInfo.bounceDirection.clone();
            bounceDir.y = 0;
            
            const pushForce = Math.max(2.0, this.speed * 0.5) * deltaTime;
            this.group.position.add(bounceDir.multiplyScalar(pushForce));
            
            // Speed reduction based on collision angle
            const moveDir = moveDirection.clone().normalize();
            const dot = Math.abs(moveDir.dot(collisionInfo.bounceDirection));
            const speedLoss = 0.3 + 0.4 * dot;
            this.speed *= (1.0 - speedLoss);
            this.speed = Math.max(this.speed, 0);
            
            // Trigger visual bounce (slight lift)
            this.bounceTimer = 0.15;
            
            // Play collision sound
            soundManager.playCollisionSound(Math.min(this.speed / (this.maxSpeed * 0.5), 1));
        }

        // Visual bounce effect
        if (this.bounceTimer > 0) {
            this.bounceTimer -= deltaTime;
            const bounceHeight = Math.sin(this.bounceTimer / 0.15 * Math.PI) * 0.3;
            this.group.position.y = Math.max(0.5 + bounceHeight, 0.5);
        } else {
            // Gravity
            this.group.position.y = Math.max(this.group.position.y - CONFIG.GRAVITY * deltaTime * 0.2, 0.5);
        }

        // Update wheel rotation
        this.wheels.forEach(wheel => {
            wheel.rotation += this.speed * deltaTime * 2;
            wheel.group.children.forEach(child => {
                child.rotation.x = wheel.rotation;
            });
        });

        // Record replay frame
        replayRecorder.recordFrame({
            position: this.group.position,
            rotation: this.group.rotation,
            speed: this.speed
        });

        // Trackmania-style dynamic camera
        const cameraOffset = new THREE.Vector3(0, 5, -12);
        cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.group.rotation.y);
        const targetCamPos = new THREE.Vector3(
            this.group.position.x + cameraOffset.x,
            this.group.position.y + cameraOffset.y,
            this.group.position.z + cameraOffset.z
        );
        camera.position.lerp(targetCamPos, 0.08);
        camera.lookAt(this.group.position.x, this.group.position.y + 1.5, this.group.position.z);
    }

    checkCollisionsWithBounce(position) {
        const carRadius = 1.2;
        let closestObject = null;
        let minDistance = Infinity;
        
        for (let obj of collisionObjects) {
            const distance = position.distanceTo(obj.position);
            if (distance < carRadius + obj.radius) {
                // Find the closest collision
                if (distance < minDistance) {
                    minDistance = distance;
                    closestObject = obj;
                }
            }
        }
        
        if (closestObject) {
            // Calculate bounce direction away from collision
            const bounceDirection = new THREE.Vector3().subVectors(position, closestObject.position).normalize();
            return {
                canMove: false,
                bounceDirection: bounceDirection
            };
        }
        
        return {
            canMove: true,
            bounceDirection: new THREE.Vector3(0, 0, 0)
        };
    }

    checkCollisions(position) {
        const carRadius = 1.2;
        for (let obj of collisionObjects) {
            const distance = position.distanceTo(obj.position);
            if (distance < carRadius + obj.radius) {
                return true;
            }
        }
        return false;
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
        this.bounceTimer = 0;
    }
}

const car = new Car();
const spawnPoint = { pos: new THREE.Vector3(0, 0.5, 0), rot: new THREE.Euler(0, 0, 0) };

// ==================== CHECKPOINTS ====================
class Checkpoint {
    constructor(index, position, rotationY = 0) {
        this.index = index;
        this.passed = false;
        this.group = new THREE.Group();

        // Left pillar
        const pillarGeometry = new THREE.CylinderGeometry(0.3, 0.4, 6, 8);
        const pillarMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ccff,
            emissive: 0x0066aa,
            emissiveIntensity: 0.4,
            metalness: 0.7,
            roughness: 0.3
        });
        
        const leftPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        leftPillar.position.set(-5, 3, 0);
        this.group.add(leftPillar);
        
        const rightPillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
        rightPillar.position.set(5, 3, 0);
        this.group.add(rightPillar);

        // Top bar connecting pillars
        const topBarGeometry = new THREE.BoxGeometry(10.5, 0.5, 0.5);
        const topBarMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ccff,
            emissive: 0x0088ff,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        const topBar = new THREE.Mesh(topBarGeometry, topBarMaterial);
        topBar.position.set(0, 6, 0);
        this.group.add(topBar);

        this.group.position.copy(position);
        this.group.rotation.y = rotationY;
        scene.add(this.group);
        
        // Use sphere-based detection instead of bounding box
        this.position = position.clone();
        this.detectionRadius = 5;
    }

    checkCollision(carPos) {
        const dist = carPos.distanceTo(this.position);
        return dist < this.detectionRadius;
    }

    pass() {
        this.passed = true;
        // Change pillars and bar to green when passed
        this.group.children.forEach(child => {
            if (child.material) {
                child.material.color.set(0x00ff00);
                child.material.emissive.set(0x00aa00);
            }
        });
    }

    reset() {
        this.passed = false;
        this.group.children.forEach(child => {
            if (child.material) {
                child.material.color.set(0x00ccff);
                child.material.emissive.set(0x0066aa);
            }
        });
        // Top bar slightly different
        const topBar = this.group.children[2];
        if (topBar && topBar.material) {
            topBar.material.emissive.set(0x0088ff);
        }
    }
}

// Create checkpoint circuit - ordered along the new track
const checkpoints = [];
const checkpointPositions = [
    { pos: new THREE.Vector3(0, 0, 60),     rot: 0 },                // Start straight
    { pos: new THREE.Vector3(-40, 0, 255),  rot: Math.PI * 0.3 },    // S-curve
    { pos: new THREE.Vector3(60, 0, 330),   rot: Math.PI * 0.45 },   // After S-curve
    { pos: new THREE.Vector3(230, 0, 300),  rot: Math.PI * 0.7 },    // Sweeping curve
    { pos: new THREE.Vector3(315, 0, 150),  rot: Math.PI },          // Fast kink exit
    { pos: new THREE.Vector3(320, 0, -20),  rot: Math.PI },          // Right straight
    { pos: new THREE.Vector3(250, 0, -155), rot: -Math.PI * 0.6 },   // Hairpin
    { pos: new THREE.Vector3(155, 0, -55),  rot: -Math.PI * 0.3 },   // Mid chicane
    { pos: new THREE.Vector3(58, 0, -135),  rot: -Math.PI * 0.1 },   // Second hairpin
    { pos: new THREE.Vector3(30, 0, -235),  rot: -Math.PI * 0.4 },   // Bottom
    { pos: new THREE.Vector3(0, 0, -60),    rot: 0 },                // Back to start
];

checkpointPositions.forEach((cp, idx) => {
    checkpoints.push(new Checkpoint(idx, cp.pos, cp.rot));
});

// ==================== REPLAY SYSTEM ====================
class ReplayRecorder {
    constructor() {
        this.frames = [];
        this.recording = false;
        this.bestLapTime = localStorage.getItem('bestLapTime') ? 
            parseInt(localStorage.getItem('bestLapTime')) : null;
        this.bestLapData = localStorage.getItem('bestLapData') ? 
            JSON.parse(localStorage.getItem('bestLapData')) : null;
    }
    
    startRecording() {
        this.frames = [];
        this.recording = true;
    }
    
    recordFrame(carState) {
        if (!this.recording) return;
        this.frames.push({
            pos: { x: carState.position.x, y: carState.position.y, z: carState.position.z },
            rot: { x: carState.rotation.x, y: carState.rotation.y, z: carState.rotation.z },
            speed: carState.speed
        });
    }
    
    stopRecording() {
        this.recording = false;
    }
    
    saveLap(lapTime) {
        if (this.bestLapTime === null || lapTime < this.bestLapTime) {
            this.bestLapTime = lapTime;
            this.bestLapData = this.frames;
            
            // Store in localStorage (limit to ~5MB)
            try {
                localStorage.setItem('bestLapTime', lapTime.toString());
                localStorage.setItem('bestLapData', JSON.stringify(this.frames));
                return true;
            } catch (e) {
                console.warn('Failed to save lap to localStorage:', e);
                return false;
            }
        }
        return false;
    }
    
    getBestLapData() {
        return this.bestLapData;
    }
}

class GhostCar {
    constructor(replayData) {
        this.replayData = replayData;
        this.currentFrame = 0;
        this.active = replayData && replayData.length > 0;
        
        if (this.active) {
            this.group = new THREE.Group();
            this.createGhostBody();
            scene.add(this.group);
        }
    }
    
    createGhostBody() {
        // Simple translucent car for ghost
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
        const ghostMaterial = new THREE.MeshStandardMaterial({
            color: 0xff00ff,
            emissive: 0xff00ff,
            emissiveIntensity: 0.4,
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.5
        });
        
        const body = new THREE.Mesh(bodyGeometry, ghostMaterial);
        this.group.add(body);
        
        // Wheels (minimal)
        const wheelGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            transparent: true,
            opacity: 0.6
        });
        
        const positions = [
            [-1, 0, 0.8],
            [1, 0, 0.8],
            [-1, 0, -0.8],
            [1, 0, -0.8]
        ];
        
        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeom, wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(...pos);
            this.group.add(wheel);
        });
    }
    
    update() {
        if (!this.active || !this.replayData) return;
        
        if (this.currentFrame < this.replayData.length) {
            const frame = this.replayData[this.currentFrame];
            this.group.position.set(frame.pos.x, frame.pos.y, frame.pos.z);
            this.group.rotation.set(frame.rot.x, frame.rot.y, frame.rot.z);
            this.currentFrame++;
        } else {
            // Loop the replay
            this.currentFrame = 0;
        }
    }
    
    remove() {
        if (this.active && this.group) {
            scene.remove(this.group);
        }
    }
}

const replayRecorder = new ReplayRecorder();
let ghostCar = null;

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
    brake: false,
    left: false,
    right: false,
    nitro: false
};

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'z' || key === 'arrowup') input.forward = true;
    if (key === 's') input.backward = true;
    if (key === 'x' || key === 'arrowdown') input.brake = true;
    if (key === 'a' || key === 'q' || key === 'arrowleft') input.left = true;
    if (key === 'd' || key === 'arrowright') input.right = true;
    if (key === ' ') input.nitro = true;
    if (key === 'r') resetRace();
    if (key === 'escape') togglePause();
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'z' || key === 'arrowup') input.forward = false;
    if (key === 's') input.backward = false;
    if (key === 'x' || key === 'arrowdown') input.brake = false;
    if (key === 'a' || key === 'q' || key === 'arrowleft') input.left = false;
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
        soundManager.playCheckpointSound();
        gameState.currentCheckpoint++;

        if (gameState.currentCheckpoint >= checkpoints.length) {
            finishRace();
        }
    }
}

function finishRace() {
    gameState.finished = true;
    gameState.running = false;
    soundManager.playFinishSound();
    soundManager.stopEngine();
    soundManager.stopBackgroundMusic();
    
    replayRecorder.stopRecording();
    const elapsed = (Date.now() - gameState.startTime) / 1000;
    
    // Save lap if it's a personal best
    const isNewBest = replayRecorder.saveLap(elapsed);
    
    const mins = Math.floor(elapsed / 60);
    const secs = Math.floor(elapsed % 60);
    const ms = Math.floor((elapsed % 1) * 1000);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(ms).padStart(3, '0')}`;
    
    document.getElementById('finishTime').textContent = timeStr;
    if (isNewBest) {
        document.getElementById('finishTime').textContent += ' 🏆 NEW BEST!';
    }
    document.getElementById('finishScreen').classList.add('show');
}

function resetRace() {
    gameState.startTime = Date.now();
    gameState.currentCheckpoint = 0;
    gameState.finished = false;
    gameState.running = true;
    gameState.paused = false;
    
    // Remove old ghost and start new recording
    if (ghostCar) {
        ghostCar.remove();
    }
    
    // Load best lap as ghost car
    const bestLapData = replayRecorder.getBestLapData();
    ghostCar = new GhostCar(bestLapData);
    
    car.respawn(spawnPoint.pos.clone(), new THREE.Euler());
    checkpoints.forEach(cp => cp.reset());
    
    replayRecorder.startRecording();
    
    document.getElementById('finishScreen').classList.remove('show');
    document.getElementById('pauseMenu').classList.remove('show');
    soundManager.stopEngine();
    soundManager.startBackgroundMusic();
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

// Start background music and initial ghost car load
soundManager.startBackgroundMusic();
replayRecorder.startRecording();
const bestLapData = replayRecorder.getBestLapData();
ghostCar = new GhostCar(bestLapData);

function animate() {
    requestAnimationFrame(animate);

    if (!gameState.paused && gameState.running) {
        const rawDelta = clock.getDelta();
        const deltaTime = Math.min(rawDelta, 0.033); // Cap at ~30fps min step
        car.update(input, deltaTime);
        if (ghostCar) ghostCar.update();
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
