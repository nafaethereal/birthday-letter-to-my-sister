import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// ===== OVERLAY & TYPING EFFECT =====
const welcomeOverlay = document.getElementById('welcomeOverlay');
const welcomeText = welcomeOverlay.querySelector('.welcomeText');
const startBtn = document.getElementById('startBtn');

// HINT ELEMENTS
let musicHint, galaxyHint, finalNotification; // Deklarasikan dulu

const message = "Hi Mba Nia, are you ready for a journey through my galaxy?";
let i = 0;
let hint1Shown = false;

function typeWriter() {
  if (i < message.length) {
    welcomeText.innerHTML += message.charAt(i);
    i++;
    const speed = Math.random() * 100 + 50; 
    setTimeout(typeWriter, speed);
  } else {
    startBtn.style.display = 'inline-block';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Check if we should skip the overlay
  const urlParams = new URLSearchParams(window.location.search);
  const skipOverlay = urlParams.get('skipOverlay') === 'true';

  // Inisialisasi hint elements setelah DOM siap
  musicHint = document.getElementById('musicHint');
  galaxyHint = document.getElementById('galaxyHint');
  finalNotification = document.getElementById('finalNotification');

  console.log("musicHint found:", musicHint);
  console.log("galaxyHint found:", galaxyHint);
  console.log("finalNotification found:", finalNotification);

  // Add click event for final notification
  if (finalNotification) {
    finalNotification.addEventListener('click', () => {
      // Ensure music state is preserved when navigating to pesan.html
      if (music && !music.paused) {
        localStorage.setItem('musicPlaying', 'true');
        localStorage.setItem('musicCurrentTime', music.currentTime.toString());
      }
      window.location.href = 'pesan.html';
    });
  }

  // Add click events for galaxy navigation buttons
  const startAgainBtn = document.getElementById('startAgainBtn');
  const backToMessageBtn = document.getElementById('backToMessageBtn');

  if (startAgainBtn) {
    startAgainBtn.addEventListener('click', () => {
      // Stop music completely and go back to overlay
      if (music) {
        music.pause();
        music.currentTime = 0;
      }
      localStorage.removeItem('musicPlaying');
      localStorage.removeItem('musicCurrentTime');
      window.location.href = 'index.html'; // No skipOverlay parameter
    });
  }

  if (backToMessageBtn) {
    backToMessageBtn.addEventListener('click', () => {
      // Preserve music state and go back to message
      if (music && !music.paused) {
        localStorage.setItem('musicPlaying', 'true');
        localStorage.setItem('musicCurrentTime', music.currentTime.toString());
      }
      window.location.href = 'pesan.html';
    });
  }

  if (skipOverlay) {
    // Skip overlay and go directly to galaxy
    console.log("Skipping overlay, going directly to galaxy");
    welcomeOverlay.style.display = 'none';

    // Start the planet 3D immediately
    startPlanet3D();

    // Show final notification immediately
    if (finalNotification) {
      finalNotification.style.display = 'block';
      finalNotification.style.opacity = '1';
    }

    // Show galaxy navigation buttons
    const galaxyNavButtons = document.getElementById('galaxyNavButtons');
    if (galaxyNavButtons) {
      galaxyNavButtons.style.display = 'flex';
    }
  } else {
    // Normal flow with overlay
    typeWriter();
  }
});

// Handle music persistence on page load
window.addEventListener('load', () => {
  const shouldPlayMusic = localStorage.getItem('musicPlaying') === 'true';
  const savedTime = parseFloat(localStorage.getItem('musicCurrentTime')) || 0;

  if (shouldPlayMusic && music) {
    music.currentTime = savedTime;
    music.play().then(() => {
      console.log("Music resumed playing from", savedTime, "seconds");
    }).catch(error => {
      console.log("Music resume failed:", error);
    });
  }
});

// ===== TOMBOL READY =====
const music = document.getElementById("bgMusic");

// Pastikan startBtn ada sebelum menambahkan event listener
if (startBtn) {
  startBtn.addEventListener('click', () => {
    console.log("Start button clicked!");

    // === PLAY AUDIO ===
    if (music) {
      music.currentTime = 0;
      music.muted = false;
      music.play().then(() => {
        localStorage.setItem('musicPlaying', 'true');
      }).catch(err => {
        console.warn("Audio blocked:", err);
      });
    }

    // === FADE OVERLAY ===
    welcomeOverlay.classList.add('fadeOut');

    setTimeout(() => {
      welcomeOverlay.style.display = 'none';
      
      // ✅ TAMPILKAN HINT 1 DI TENGAH
      if (musicHint) {
        console.log("Showing musicHint");
        musicHint.style.display = 'block';
        musicHint.style.opacity = '0';
        
        // Trigger reflow untuk animasi
        setTimeout(() => {
          musicHint.style.transition = 'opacity 1s ease-in';
          musicHint.style.opacity = '1';
        }, 100);
      } else {
        console.error("musicHint not found!");
      }
      
    }, 800);
  });
} else {
  console.error("startBtn not found!");
}
// ===== THREE.JS PLANET =====
function startPlanet3D() {

  // LIGHT
  const light = new THREE.AmbientLight(0xffffff, 1);
  scene.add(light);

  // PLANET
  const geometry = new THREE.SphereGeometry(2, 64, 64);
  const material = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
  const planet = new THREE.Mesh(geometry, material);
  scene.add(planet);

  // ORBIT CONTROLS
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // ANIMASI
  function animate() {
    requestAnimationFrame(animate);
    planet.rotation.y += 0.005;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // RESPONSIVE
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}


const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.0015);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100000);
camera.position.set(0, 20, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('container').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enabled = false;
controls.target.set(0, 0, 0);
controls.enablePan = false;
controls.minDistance = 15;
controls.maxDistance = 300;
controls.zoomSpeed = 0.3;
controls.rotateSpeed = 0.3;
controls.update();

function createGlowMaterial(color, size = 128, opacity = 0.55) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Sprite(material);
}


const centralGlow = createGlowMaterial('rgba(255,255,255,0.8)', 156, 0.25);
centralGlow.scale.set(8, 8, 1);
scene.add(centralGlow);

for (let i = 0; i < 15; i++) {
  const hue = Math.random() * 360;
  const color = `hsla(${hue}, 80%, 50%, 0.6)`;
  const nebula = createGlowMaterial(color, 256);
  nebula.scale.set(100, 100, 1);
  nebula.position.set(
    (Math.random() - 0.5) * 175,
    (Math.random() - 0.5) * 175,
    (Math.random() - 0.5) * 175
  );
  scene.add(nebula);
}


const galaxyParameters = {
  count: 100000,
  arms: 6,
  radius: 100,
  spin: 0.5,
  randomness: 0.2,
  randomnessPower: 20,
  insideColor: new THREE.Color(0xd63ed6),
  outsideColor: new THREE.Color(0x48b8b8),
};

const defaultHeartImages = Array.from({ length: 10 }, (_, i) => `images/img${i + 1}.jpeg`);

const heartImages = [
  ...(window.dataCCD?.data?.heartImages || []),
  ...defaultHeartImages,
];

const textureLoader = new THREE.TextureLoader();
const numGroups = heartImages.length;



const maxDensity = 50000;

const minDensity = 2000;

const maxGroupsForScale = 14;

let pointsPerGroup;

if (numGroups <= 1) {
  pointsPerGroup = maxDensity;
} else if (numGroups >= maxGroupsForScale) {
  pointsPerGroup = minDensity;
} else {
  const t = (numGroups - 1) / (maxGroupsForScale - 1);
  pointsPerGroup = Math.floor(maxDensity * (1 - t) + minDensity * t);
}

if (pointsPerGroup * numGroups > galaxyParameters.count) {
  pointsPerGroup = Math.floor(galaxyParameters.count / numGroups);
}

console.log(`Số lượng ảnh: ${numGroups}, Điểm mỗi ảnh: ${pointsPerGroup}`);

const positions = new Float32Array(galaxyParameters.count * 3);
const colors = new Float32Array(galaxyParameters.count * 3);


let pointIdx = 0;
for (let i = 0; i < galaxyParameters.count; i++) {
  const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
  const branchAngle = (i % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
  const spinAngle = radius * galaxyParameters.spin;

  const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
  const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 1.2; 
  const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
  const totalAngle = branchAngle + spinAngle;

  if (radius < 30 && Math.random() < 0.8) continue;

  const i3 = pointIdx * 3;
  positions[i3] = Math.cos(totalAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;

  const mixedColor = new THREE.Color(0xff66ff);
  mixedColor.lerp(new THREE.Color(0x66ffff), radius / galaxyParameters.radius);
  mixedColor.multiplyScalar(0.7 + 0.3 * Math.random());
  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;

  pointIdx++;
}

const galaxyGeometry = new THREE.BufferGeometry();
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions.slice(0, pointIdx * 3), 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors.slice(0, pointIdx * 3), 3));

const galaxyMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0.0 },
    uSize: { value: 50.0 * renderer.getPixelRatio() },
    uRippleTime: { value: -1.0 },
    uRippleSpeed: { value: 40.0 },
    uRippleWidth: { value: 20.0 }
  },
  vertexShader: `
        uniform float uSize;
        uniform float uTime;
        uniform float uRippleTime;
        uniform float uRippleSpeed;
        uniform float uRippleWidth;

        varying vec3 vColor;

        void main() {
            // Lấy màu gốc từ geometry (giống hệt vertexColors: true)
            vColor = color;

            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            // ---- LOGIC HIỆU ỨNG GỢN SÓNG ----
            if (uRippleTime > 0.0) {
                float rippleRadius = (uTime - uRippleTime) * uRippleSpeed;
                float particleDist = length(modelPosition.xyz);

                float strength = 1.0 - smoothstep(rippleRadius - uRippleWidth, rippleRadius + uRippleWidth, particleDist);
                strength *= smoothstep(rippleRadius + uRippleWidth, rippleRadius - uRippleWidth, particleDist);

                if (strength > 0.0) {
                    vColor += vec3(strength * 2.0); // Làm màu sáng hơn khi sóng đi qua
                }
            }

            vec4 viewPosition = viewMatrix * modelPosition;
            gl_Position = projectionMatrix * viewPosition;
            // Dòng này làm cho các hạt nhỏ hơn khi ở xa, mô phỏng hành vi của PointsMaterial
            gl_PointSize = uSize / -viewPosition.z;
        }
    `,
  fragmentShader: `
        varying vec3 vColor;
        void main() {
            // Làm cho các hạt có hình tròn thay vì hình vuông
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  vertexColors: true
});
const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

function createNeonTexture(image, size) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const aspectRatio = image.width / image.height;
  let drawWidth, drawHeight, offsetX, offsetY;
  if (aspectRatio > 1) {
    drawWidth = size;
    drawHeight = size / aspectRatio;
    offsetX = 0;
    offsetY = (size - drawHeight) / 2;
  } else {
    drawHeight = size;
    drawWidth = size * aspectRatio;
    offsetX = (size - drawWidth) / 2;
    offsetY = 0;
  }
  ctx.clearRect(0, 0, size, size);
  const cornerRadius = size * 0.1;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(offsetX + cornerRadius, offsetY);
  ctx.lineTo(offsetX + drawWidth - cornerRadius, offsetY);
  ctx.arcTo(offsetX + drawWidth, offsetY, offsetX + drawWidth, offsetY + cornerRadius, cornerRadius);
  ctx.lineTo(offsetX + drawWidth, offsetY + drawHeight - cornerRadius);
  ctx.arcTo(offsetX + drawWidth, offsetY + drawHeight, offsetX + drawWidth - cornerRadius, offsetY + drawHeight, cornerRadius);
  ctx.lineTo(offsetX + cornerRadius, offsetY + drawHeight);
  ctx.arcTo(offsetX, offsetY + drawHeight, offsetX, offsetY + drawHeight - cornerRadius, cornerRadius);
  ctx.lineTo(offsetX, offsetY + cornerRadius);
  ctx.arcTo(offsetX, offsetY, offsetX + cornerRadius, offsetY, cornerRadius);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  ctx.restore();
  return new THREE.CanvasTexture(canvas);
}

for (let group = 0; group < numGroups; group++) {
  const groupPositions = new Float32Array(pointsPerGroup * 3);
  const groupColorsNear = new Float32Array(pointsPerGroup * 3);
  const groupColorsFar = new Float32Array(pointsPerGroup * 3);
  let validPointCount = 0;

  for (let i = 0; i < pointsPerGroup; i++) {
    const idx = validPointCount * 3;
    const globalIdx = group * pointsPerGroup + i;
    const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
    if (radius < 30) continue;

    const branchAngle = (globalIdx % galaxyParameters.arms) / galaxyParameters.arms * Math.PI * 2;
    const spinAngle = radius * galaxyParameters.spin;

    const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
    const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.5;
    const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
    const totalAngle = branchAngle + spinAngle;

    groupPositions[idx] = Math.cos(totalAngle) * radius + randomX;
    groupPositions[idx + 1] = randomY;
    groupPositions[idx + 2] = Math.sin(totalAngle) * radius + randomZ;

    const colorNear = new THREE.Color(0xffffff);
    groupColorsNear[idx] = colorNear.r;
    groupColorsNear[idx + 1] = colorNear.g;
    groupColorsNear[idx + 2] = colorNear.b;

    const colorFar = galaxyParameters.insideColor.clone();
    colorFar.lerp(galaxyParameters.outsideColor, radius / galaxyParameters.radius);
    colorFar.multiplyScalar(0.7 + 0.3 * Math.random());
    groupColorsFar[idx] = colorFar.r;
    groupColorsFar[idx + 1] = colorFar.g;
    groupColorsFar[idx + 2] = colorFar.b;

    validPointCount++;
  }

  if (validPointCount === 0) continue;


  const groupGeometryNear = new THREE.BufferGeometry();
  groupGeometryNear.setAttribute('position', new THREE.BufferAttribute(groupPositions.slice(0, validPointCount * 3), 3));
  groupGeometryNear.setAttribute('color', new THREE.BufferAttribute(groupColorsNear.slice(0, validPointCount * 3), 3));

  const groupGeometryFar = new THREE.BufferGeometry();
  groupGeometryFar.setAttribute('position', new THREE.BufferAttribute(groupPositions.slice(0, validPointCount * 3), 3));
  groupGeometryFar.setAttribute('color', new THREE.BufferAttribute(groupColorsFar.slice(0, validPointCount * 3), 3));

  const posAttr = groupGeometryFar.getAttribute('position');
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < posAttr.count; i++) {
    cx += posAttr.getX(i);
    cy += posAttr.getY(i);
    cz += posAttr.getZ(i);
  }
  cx /= posAttr.count;
  cy /= posAttr.count;
  cz /= posAttr.count;
  groupGeometryNear.translate(-cx, -cy, -cz);
  groupGeometryFar.translate(-cx, -cy, -cz);

  const img = new window.Image();
  img.crossOrigin = "Anonymous";
  img.src = heartImages[group];
  img.onload = () => {
    const neonTexture = createNeonTexture(img, 256);

    const materialNear = new THREE.PointsMaterial({
      size: 1.8,
      map: neonTexture,
      transparent: false,
      alphaTest: 0.2,
      depthWrite: true,
      depthTest: true,
      blending: THREE.NormalBlending,
      vertexColors: true
    });

    const materialFar = new THREE.PointsMaterial({
      size: 1.8,
      map: neonTexture,
      transparent: true,
      alphaTest: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const pointsObject = new THREE.Points(groupGeometryFar, materialFar);
    pointsObject.position.set(cx, cy, cz);

    pointsObject.userData.materialNear = materialNear;
    pointsObject.userData.geometryNear = groupGeometryNear;
    pointsObject.userData.materialFar = materialFar;
    pointsObject.userData.geometryFar = groupGeometryFar;

    scene.add(pointsObject);
  };
}


const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const starCount = 20000;
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPositions[i * 3] = (Math.random() - 0.5) * 900;
  starPositions[i * 3 + 1] = (Math.random() - 0.5) * 900;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * 900;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.7,
  transparent: true,
  opacity: 0.7,
  depthWrite: false
});
const starField = new THREE.Points(starGeometry, starMaterial);
starField.name = 'starfield';
starField.renderOrder = 999;
scene.add(starField);

let shootingStars = [];

function createShootingStar() {
  const trailLength = 100;

  const headGeometry = new THREE.SphereGeometry(2, 32, 32);
  const headMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);

  const glowGeometry = new THREE.SphereGeometry(3, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            varying vec3 vNormal;
            uniform float time;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(1.0, 1.0, 1.0, intensity * (0.8 + sin(time * 5.0) * 0.2));
            }
        `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  head.add(glow);

  const atmosphereGeometry = new THREE.SphereGeometry(planetRadius * 1.05, 48, 48);
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: new THREE.Color(0xe0b3ff) }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 glowColor;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });

  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  planet.add(atmosphere); 
  const curve = createRandomCurve();
  const trailPoints = [];
  for (let i = 0; i < trailLength; i++) {
    const progress = i / (trailLength - 1);
    trailPoints.push(curve.getPoint(progress));
  }
  const trailGeometry = new THREE.BufferGeometry().setFromPoints(trailPoints);
  const trailMaterial = new THREE.LineBasicMaterial({
    color: 0x99eaff,
    transparent: true,
    opacity: 0.7,
    linewidth: 2
  });
  const trail = new THREE.Line(trailGeometry, trailMaterial);

  const shootingStarGroup = new THREE.Group();
  shootingStarGroup.add(head);
  shootingStarGroup.add(trail);
  shootingStarGroup.userData = {
    curve: curve,
    progress: 0,
    speed: 0.001 + Math.random() * 0.001,
    life: 0,
    maxLife: 300,
    head: head,
    trail: trail,
    trailLength: trailLength,
    trailPoints: trailPoints,
  };
  scene.add(shootingStarGroup);
  shootingStars.push(shootingStarGroup);
}

function createRandomCurve() {
  const points = [];
  const startPoint = new THREE.Vector3(-200 + Math.random() * 100, -100 + Math.random() * 200, -100 + Math.random() * 200);
  const endPoint = new THREE.Vector3(600 + Math.random() * 200, startPoint.y + (-100 + Math.random() * 200), startPoint.z + (-100 + Math.random() * 200));
  const controlPoint1 = new THREE.Vector3(startPoint.x + 200 + Math.random() * 100, startPoint.y + (-50 + Math.random() * 100), startPoint.z + (-50 + Math.random() * 100));
  const controlPoint2 = new THREE.Vector3(endPoint.x - 200 + Math.random() * 100, endPoint.y + (-50 + Math.random() * 100), endPoint.z + (-50 + Math.random() * 100));

  points.push(startPoint, controlPoint1, controlPoint2, endPoint);
  return new THREE.CubicBezierCurve3(startPoint, controlPoint1, controlPoint2, endPoint);
}



function createPlanetTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(size / 2, size / 2, size / 8, size / 2, size / 2, size / 2);
  gradient.addColorStop(0.00, '#f8bbd0');
  gradient.addColorStop(0.12, '#f48fb1');
  gradient.addColorStop(0.22, '#f06292');
  gradient.addColorStop(0.35, '#ffffff');
  gradient.addColorStop(0.50, '#e1aaff');
  gradient.addColorStop(0.62, '#a259f7');
  gradient.addColorStop(0.75, '#b2ff59');
  gradient.addColorStop(1.00, '#3fd8c7');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const spotColors = ['#f8bbd0', '#f8bbd0', '#f48fb1', '#f48fb1', '#f06292', '#f06292', '#ffffff', '#e1aaff', '#a259f7', '#b2ff59'];
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 30 + Math.random() * 120;
    const color = spotColors[Math.floor(Math.random() * spotColors.length)];
    const spotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    spotGradient.addColorStop(0, color + 'cc');
    spotGradient.addColorStop(1, color + '00');
    ctx.fillStyle = spotGradient;
    ctx.fillRect(0, 0, size, size);
  }


  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.bezierCurveTo(Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size, Math.random() * size);
    ctx.strokeStyle = 'rgba(180, 120, 200, ' + (0.12 + Math.random() * 0.18) + ')';
    ctx.lineWidth = 8 + Math.random() * 18;
    ctx.stroke();
  }


  if (ctx.filter !== undefined) {
    ctx.filter = 'blur(2px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
  }

  return new THREE.CanvasTexture(canvas);
}


const stormShader = {
  uniforms: {
    time: { value: 0.0 },
    baseTexture: { value: null }
  },
  vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        uniform float time;
        uniform sampler2D baseTexture;
        varying vec2 vUv;
        void main() {
            vec2 uv = vUv;
            float angle = length(uv - vec2(0.5)) * 3.0;
            float twist = sin(angle * 3.0 + time) * 0.1;
            uv.x += twist * sin(time * 0.5);
            uv.y += twist * cos(time * 0.5);
            vec4 texColor = texture2D(baseTexture, uv);
            float noise = sin(uv.x * 10.0 + time) * sin(uv.y * 10.0 + time) * 0.1;
            texColor.rgb += noise * vec3(0.8, 0.4, 0.2);
            gl_FragColor = texColor;
        }
    `
};


const planetRadius = 10;
const planetGeometry = new THREE.SphereGeometry(planetRadius, 48, 48);
const planetTexture = createPlanetTexture();
const planetMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    baseTexture: { value: planetTexture }
  },
  vertexShader: stormShader.vertexShader,
  fragmentShader: stormShader.fragmentShader
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(0, 0, 0);
scene.add(planet);


//Ganti Deskripsi Planet
const ringTexts = [
  'Happy Birthday My Beloved Sister',//untuk deskripsi planet layer 1
  "please be happy..",//untuk deskripsi planet layer 2
  "galaxy of love from indy",//untuk deskripsi planet layer 3
  "12/01/1988",//untuk deskripsi planet layer 4
  ...(window.dataCCD && window.dataCCD.data.ringTexts ? window.dataCCD.data.ringTexts : [])
];

function createTextRings() {
  const numRings = ringTexts.length;
  const baseRingRadius = planetRadius * 1.1;
  const ringSpacing = 5;
  window.textRings = [];

  for (let i = 0; i < numRings; i++) {
    const text = ringTexts[i % ringTexts.length] + '   '; 
    const ringRadius = baseRingRadius + i * ringSpacing;

    function getCharType(char) {
      const charCode = char.charCodeAt(0);
      if ((charCode >= 0x4E00 && charCode <= 0x9FFF) || // CJK
        (charCode >= 0x3040 && charCode <= 0x309F) || // Hiragana
        (charCode >= 0x30A0 && charCode <= 0x30FF) || // Katakana
        (charCode >= 0xAC00 && charCode <= 0xD7AF)) { // Korean
        return 'cjk';
      } else if (charCode >= 0 && charCode <= 0x7F) { // Latin
        return 'latin';
      }
      return 'other';
    }

    let charCounts = { cjk: 0, latin: 0, other: 0 };
    for (let char of text) {
      charCounts[getCharType(char)]++;
    }

    const totalChars = text.length;
    const cjkRatio = charCounts.cjk / totalChars;

    let scaleParams = { fontScale: 0.75, spacingScale: 1.1 };

    if (i === 0) {
      scaleParams.fontScale = 0.55;
      scaleParams.spacingScale = 0.9;
    } else if (i === 1) {
      scaleParams.fontScale = 0.65;
      scaleParams.spacingScale = 1.0;
    }

    if (cjkRatio > 0) {
      scaleParams.fontScale *= 0.9;
      scaleParams.spacingScale *= 1.1;
    }

    const textureHeight = 150;
    const fontSize = Math.max(130, 0.8 * textureHeight);


    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
    let singleText = ringTexts[i % ringTexts.length];
    const separator = '   ';
    let repeatedTextSegment = singleText + separator;

    let segmentWidth = tempCtx.measureText(repeatedTextSegment).width;
    let textureWidthCircumference = 2 * Math.PI * ringRadius * 180; 
    let repeatCount = Math.ceil(textureWidthCircumference / segmentWidth);

    let fullText = '';
    for (let j = 0; j < repeatCount; j++) {
      fullText += repeatedTextSegment;
    }

    let finalTextureWidth = segmentWidth * repeatCount;
    if (finalTextureWidth < 1 || !fullText) {
      fullText = repeatedTextSegment;
      finalTextureWidth = segmentWidth;
    }


    const textCanvas = document.createElement('canvas');
    textCanvas.width = Math.ceil(Math.max(1, finalTextureWidth));
    textCanvas.height = textureHeight;
    const ctx = textCanvas.getContext('2d');

    ctx.clearRect(0, 0, textCanvas.width, textureHeight);

    // FONT
    ctx.font = `700 ${fontSize}px 'Poppins', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // SHADOW / GLOW
    ctx.shadowColor = '#ff4f9a';
    ctx.shadowBlur = 20;

    // STROKE (tetap)
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#c2185b';
    ctx.strokeText(fullText, 0, textureHeight * 0.82);

    // TEXT UTAMA (pink lebih gelap)
    ctx.fillStyle = '#e91e63';
    ctx.fillText(fullText, 0, textureHeight * 0.82);


    const ringTexture = new THREE.CanvasTexture(textCanvas);
    ringTexture.wrapS = THREE.RepeatWrapping;
    ringTexture.repeat.x = finalTextureWidth / textureWidthCircumference;
    ringTexture.needsUpdate = true;

    const ringGeometry = new THREE.CylinderGeometry(ringRadius, ringRadius, 1, 128, 1, true);

    const ringMaterial = new THREE.MeshBasicMaterial({
      map: ringTexture,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.01,
      opacity: 1,
      depthWrite: false,
    });

    const textRingMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    textRingMesh.position.set(0, 0, 0);
    textRingMesh.rotation.y = Math.PI / 2;

    const ringGroup = new THREE.Group();
    ringGroup.add(textRingMesh);
    ringGroup.userData = {
      ringRadius: ringRadius,
      angleOffset: 0.15 * Math.PI * 0.5,
      speed: 0.002 + 0.00025, 
      tiltSpeed: 0, rollSpeed: 0, pitchSpeed: 0,
      tiltAmplitude: Math.PI / 3, rollAmplitude: Math.PI / 6, pitchAmplitude: Math.PI / 8, 
      tiltPhase: Math.PI * 2, rollPhase: Math.PI * 2, pitchPhase: Math.PI * 2,
      isTextRing: true
    };

    const initialRotationX = i / numRings * (Math.PI / 1);
    ringGroup.rotation.x = initialRotationX;
    scene.add(ringGroup);
    window.textRings.push(ringGroup);
  }
}

createTextRings();

function updateTextRingsRotation() {
  if (!window.textRings || !camera) return;

  window.textRings.forEach((ringGroup, index) => {
    ringGroup.children.forEach(child => {
      if (child.userData.initialAngle !== undefined) {
        const angle = child.userData.initialAngle + ringGroup.userData.angleOffset;
        const x = Math.cos(angle) * child.userData.ringRadius;
        const z = Math.sin(angle) * child.userData.ringRadius;
        child.position.set(x, 0, z);

        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);

        const lookAtVector = new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
        const rotationY = Math.atan2(lookAtVector.x, lookAtVector.z);
        child.rotation.y = rotationY;
      }
    });
  });
}

function animatePlanetSystem() {
  if (window.textRings) {
    const time = Date.now() * 0.001;
    window.textRings.forEach((ringGroup, index) => {
      const userData = ringGroup.userData;
      userData.angleOffset += userData.speed;


      const tilt = Math.sin(time * userData.tiltSpeed + userData.tiltPhase) * userData.tiltAmplitude;
      const roll = Math.cos(time * userData.rollSpeed + userData.rollPhase) * userData.rollAmplitude;
      const pitch = Math.sin(time * userData.pitchSpeed + userData.pitchPhase) * userData.pitchAmplitude;

      ringGroup.rotation.x = (index / window.textRings.length) * (Math.PI / 1) + tilt;
      ringGroup.rotation.z = roll;
      ringGroup.rotation.y = userData.angleOffset + pitch;

      const verticalBob = Math.sin(time * (userData.tiltSpeed * 0.7) + userData.tiltPhase) * 0.3;
      ringGroup.position.y = verticalBob;

      const pulse = (Math.sin(time * 1.5 + index) + 1) / 2; 
      const textMesh = ringGroup.children[0];
      if (textMesh && textMesh.material) {

        textMesh.material.opacity = 0.7 + pulse * 0.3;
      }
    });
    updateTextRingsRotation();
  }
}





let fadeOpacity = 0.1;
let fadeInProgress = false;


let hintIcon;
let hintText;

function createHintIcon() {
  hintIcon = new THREE.Group();
  hintIcon.name = 'hint-icon-group';
  scene.add(hintIcon);

  const cursorVisuals = new THREE.Group();


  const cursorShape = new THREE.Shape();
  const h = 1.5;
  const w = h * 0.5;

  cursorShape.moveTo(0, 0);
  cursorShape.lineTo(-w * 0.4, -h * 0.7);
  cursorShape.lineTo(-w * 0.25, -h * 0.7);
  cursorShape.lineTo(-w * 0.5, -h);
  cursorShape.lineTo(w * 0.5, -h);
  cursorShape.lineTo(w * 0.25, -h * 0.7);
  cursorShape.lineTo(w * 0.4, -h * 0.7);
  cursorShape.closePath();


  const backgroundGeometry = new THREE.ShapeGeometry(cursorShape);
  const backgroundMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, 
    side: THREE.DoubleSide
  });
  const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

  const foregroundGeometry = new THREE.ShapeGeometry(cursorShape);
  const foregroundMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, 
    side: THREE.DoubleSide
  });
  const foregroundMesh = new THREE.Mesh(foregroundGeometry, foregroundMaterial);

  foregroundMesh.scale.set(0.8, 0.8, 1);
  foregroundMesh.position.z = 0.01;

  cursorVisuals.add(backgroundMesh, foregroundMesh);
  cursorVisuals.position.y = h / 2;
  cursorVisuals.rotation.x = Math.PI / 2;

  
  const ringGeometry = new THREE.RingGeometry(1.8, 2.0, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
  ringMesh.rotation.x = Math.PI / 2;
  hintIcon.userData.ringMesh = ringMesh;


  hintIcon.add(cursorVisuals);
  hintIcon.add(ringMesh);


  hintIcon.position.set(1.5, 1.5, 15); 

  hintIcon.scale.set(0.8, 0.8, 0.8);
  hintIcon.lookAt(planet.position);
  hintIcon.userData.initialPosition = hintIcon.position.clone();
}

/**
 * Animate icon gợi ý.
 * @param {number} time - Thời gian hiện tại.
 */
function animateHintIcon(time) {
  if (!hintIcon) return;

  if (hintActive) {
    hintIcon.visible = true;


    const tapFrequency = 2.5;
    const tapAmplitude = 1.5;
    const tapOffset = Math.sin(time * tapFrequency) * tapAmplitude;


    const direction = new THREE.Vector3();
    hintIcon.getWorldDirection(direction);
    hintIcon.position.copy(hintIcon.userData.initialPosition).addScaledVector(direction, -tapOffset);


    const ring = hintIcon.userData.ringMesh;
    const ringScale = 1 + Math.sin(time * tapFrequency) * 0.1;
    ring.scale.set(ringScale, ringScale, 1);
    ring.material.opacity = 0.5 + Math.sin(time * tapFrequency) * 0.2;

    if (hintText) {
      hintText.visible = true;
      hintText.material.opacity = 0.7 + Math.sin(time * 3) * 0.3;
      hintText.position.y = 15 + Math.sin(time * 2) * 0.5;
      hintText.lookAt(camera.position);
    }
  } else {

    if (hintIcon) hintIcon.visible = false;

    if (hintText) hintText.visible = false;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;


  animateHintIcon(time);

  controls.update();
  planet.material.uniforms.time.value = time * 0.5;

  if (fadeInProgress && fadeOpacity < 1) {
    fadeOpacity += 0.025;
    if (fadeOpacity > 1) fadeOpacity = 1;
  }

  if (!introStarted) {

    fadeOpacity = 0.1;
    scene.traverse(obj => {
      if (obj.name === 'starfield') {
        if (obj.points && obj.material.opacity !== undefined) {
          obj.material.transparent = false;
          obj.material.opacity = 1;
        }
        return;
      }
      if (obj.userData.isTextRing || (obj.parent && obj.parent.userData && obj.parent.userData.isTextRing)) {
        if (obj.material && obj.material.opacity !== undefined) {
          obj.material.transparent = false;
          obj.material.opacity = 1;
        }
        if (obj.material && obj.material.color) {
          obj.material.color.set(0xffffff);
        }
      } else if (obj !== planet && obj !== centralGlow && obj !== hintIcon && obj.type !== 'Scene' && !obj.parent.isGroup) {
        if (obj.material && obj.material.opacity !== undefined) {
          obj.material.transparent = true;
          obj.material.opacity = 0.1;
        }
      }
    });
    planet.visible = true;
    centralGlow.visible = true;
  } else {

    scene.traverse(obj => {
      if (!(obj.userData.isTextRing || (obj.parent && obj.parent.userData && obj.parent.userData.isTextRing) || obj === planet || obj === centralGlow || obj.type === 'Scene')) {
        if (obj.material && obj.material.opacity !== undefined) {
          obj.material.transparent = true;
          obj.material.opacity = fadeOpacity;
        }
      } else {
        if (obj.material && obj.material.opacity !== undefined) {
          obj.material.opacity = 1;
          obj.material.transparent = false;
        }
      }
      if (obj.material && obj.material.color) {
        obj.material.color.set(0xffffff);
      }
    });
  }


  for (let i = shootingStars.length - 1; i >= 0; i--) {
    const star = shootingStars[i];
    star.userData.life++;

    let opacity = 1.0;
    if (star.userData.life < 30) {
      opacity = star.userData.life / 30;
    } else if (star.userData.life > star.userData.maxLife - 30) {
      opacity = (star.userData.maxLife - star.userData.life) / 30;
    }

    star.userData.progress += star.userData.speed;
    if (star.userData.progress > 1) {
      scene.remove(star);
      shootingStars.splice(i, 1);
      continue;
    }

    const currentPos = star.userData.curve.getPoint(star.userData.progress);
    star.position.copy(currentPos);
    star.userData.head.material.opacity = opacity;
    star.userData.head.children[0].material.uniforms.time.value = time;

    const trail = star.userData.trail;
    const trailPoints = star.userData.trailPoints;
    trailPoints[0].copy(currentPos);
    for (let j = 1; j < star.userData.trailLength; j++) {
      const trailProgress = Math.max(0, star.userData.progress - j * 0.01);
      trailPoints[j].copy(star.userData.curve.getPoint(trailProgress));
    }
    trail.geometry.setFromPoints(trailPoints);
    trail.material.opacity = opacity * 0.7;
  }

  if (shootingStars.length < 3 && Math.random() < 0.02) {
    createShootingStar();
  }

  scene.traverse(obj => {
    if (obj.isPoints && obj.userData.materialNear && obj.userData.materialFar) {
      const positionAttr = obj.geometry.getAttribute('position');
      let isClose = false;
      for (let i = 0; i < positionAttr.count; i++) {
        const worldX = positionAttr.getX(i) + obj.position.x;
        const worldY = positionAttr.getY(i) + obj.position.y;
        const worldZ = positionAttr.getZ(i) + obj.position.z;
        const distance = camera.position.distanceTo(new THREE.Vector3(worldX, worldY, worldZ));
        if (distance < 10) {
          isClose = true;
          break;
        }
      }
      if (isClose) {
        if (obj.material !== obj.userData.materialNear) {
          obj.material = obj.userData.materialNear;
          obj.geometry = obj.userData.geometryNear;
        }
      } else {
        if (obj.material !== obj.userData.materialFar) {
          obj.material = obj.userData.materialFar;
          obj.geometry = obj.userData.geometryFar;
        }
      }
    }
  });

  planet.lookAt(camera.position);
  animatePlanetSystem();

  if (starField && starField.material && starField.material.opacity !== undefined) {
    starField.material.opacity = 1.0;
    starField.material.transparent = false;
  }

  renderer.render(scene, camera);
}
function createHintText() { 
  // 🖌 Canvas lebih besar supaya teks tidak kepotong
  const canvasWidth = 3000; // lebih lebar
  const canvasHeight = 1200; // tinggi sesuai 2 baris
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  const text = `Happy Birthday to my beloved sister,\nMba Nia!`;

  const fontSize = 150;
  const lineHeight = fontSize * 1.3;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.font = `900 ${fontSize}px Poppins, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = text.split('\n');
  const startY = canvasHeight / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;

    // Outline hitam
    ctx.lineWidth = 18;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(line, canvasWidth / 2, y);

    // Stroke pink gelap
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#8e0038';
    ctx.strokeText(line, canvasWidth / 2, y);

    // Text utama
    ctx.shadowColor = '#ff2f92';
    ctx.shadowBlur = 40;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line, canvasWidth / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    depthTest: false
  });

  // 🖼 Sesuaikan plane geometry dengan canvas aspect ratio
  const aspect = canvasWidth / canvasHeight; // 3000 / 1200 = 2.5
  const planeHeight = 14;
  const planeWidth = planeHeight * aspect; // otomatis lebih lebar supaya teks muat
  const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

  hintText = new THREE.Mesh(planeGeometry, material);
  hintText.position.set(0, 16, 0); // posisi tetap di atas galaxy

  scene.add(hintText);
}



createShootingStar();
createHintIcon(); 
createHintText();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.target.set(0, 0, 0);
  controls.update();
});

function startCameraAnimation() {
  const startPos = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
  const midPos1 = { x: startPos.x, y: 0, z: startPos.z };
  const midPos2 = { x: startPos.x, y: 0, z: 160 };
  const endPos = { x: -40, y: 100, z: 100 };

  const duration1 = 0.2;
  const duration2 = 0.55;
  const duration3 = 0.4;
  let progress = 0;

  function animatePath() {

    progress += 0.0025;
    let newPos;

    if (progress < duration1) {
      let t = progress / duration1;
      newPos = {
        x: startPos.x + (midPos1.x - startPos.x) * t,
        y: startPos.y + (midPos1.y - startPos.y) * t,
        z: startPos.z + (midPos1.z - startPos.z) * t,
      };
    } else if (progress < duration1 + duration2) {
      let t = (progress - duration1) / duration2;
      newPos = {
        x: midPos1.x + (midPos2.x - midPos1.x) * t,
        y: midPos1.y + (midPos2.y - midPos1.y) * t,
        z: midPos1.z + (midPos2.z - midPos1.z) * t,
      };
    } else if (progress < duration1 + duration2 + duration3) {
      let t = (progress - duration1 - duration2) / duration3;
      let easedT = 0.5 - 0.5 * Math.cos(Math.PI * t); // Ease-in-out
      newPos = {
        x: midPos2.x + (endPos.x - midPos2.x) * easedT,
        y: midPos2.y + (endPos.y - midPos2.y) * easedT,
        z: midPos2.z + (endPos.z - midPos2.z) * easedT,
      };
    } else {
      camera.position.set(endPos.x, endPos.y, endPos.z);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
      controls.enabled = true;
      return;
    }

    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.lookAt(0, 0, 0);
    requestAnimationFrame(animatePath);
  }
  controls.enabled = false;
  animatePath();
}




const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let introStarted = false;
let hintActive = true;



const originalStarCount = starGeometry.getAttribute('position').count;
if (starField && starField.geometry) {
  starField.geometry.setDrawRange(0, Math.floor(originalStarCount * 0.1));
}

function requestFullScreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
    elem.msRequestFullscreen();
  }
}
function resizeRenderer() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', resizeRenderer);
document.addEventListener('fullscreenchange', resizeRenderer);

function onCanvasClick(event) {
  if (introStarted) return;
  function onCanvasClick(event) {
    if (introStarted) return;
  }
    // 🔥 FULLSCREEN DI TAP PERTAMA (WAJIB DI USER GESTURE)
    requestFullScreen();
  
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObject(planet);
  if (intersects.length > 0) {
    console.log("Planet tapped!");
    introStarted = true;
    hintActive = false;

    // ❌ HIDE HINT 1 immediately on tap
    if (musicHint && musicHint.style.display === 'block') {
      console.log("Hiding musicHint immediately...");
      musicHint.style.display = 'none';

      // Wait 7 seconds, then show hint 2
      setTimeout(() => {
        // ✅ SHOW HINT 2 DI POSISI YANG SAMA (TENGAH)
        if (galaxyHint) {
          console.log("Showing galaxyHint at center...");
          galaxyHint.style.display = 'block';
          galaxyHint.style.opacity = '0';

          // Pastikan posisi benar-benar di tengah
          // Trigger reflow
          galaxyHint.offsetHeight;

          // Fade in hint 2
          galaxyHint.style.transition = 'opacity 1s ease-in';
          galaxyHint.style.opacity = '1';

          // Auto hide hint 2 setelah 5 detik
          setTimeout(() => {
            if (galaxyHint.style.opacity === '1') {
              console.log("Auto-hiding galaxyHint...");
              galaxyHint.style.transition = 'opacity 1s ease-out';
              galaxyHint.style.opacity = '0';
              setTimeout(() => {
                galaxyHint.style.display = 'none';
                // Wait 5 seconds after galaxyHint disappears, then show final notification
                setTimeout(() => {
                  if (finalNotification) {
                    console.log("Showing finalNotification...");
                    finalNotification.style.display = 'block';
                    finalNotification.style.opacity = '0';
                    finalNotification.offsetHeight; // trigger reflow
                    finalNotification.style.transition = 'opacity 1s ease-in';
                    finalNotification.style.opacity = '1';
                  }
                }, 5000);
              }, 2000);
            }
          }, 5000);
        } else {
          console.error("galaxyHint not found!");
        }
      }, 7000);
    } else {
      console.log("musicHint not displayed, skipping...");
    }

    fadeInProgress = true;
    document.body.classList.add("intro-started");

    startCameraAnimation();

    if (starField && starField.geometry) {
      starField.geometry.setDrawRange(0, originalStarCount);
    }
  }
}

renderer.domElement.addEventListener("click", onCanvasClick);

animate();


planet.name = 'main-planet';
centralGlow.name = 'main-glow';


function setFullScreen() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  const container = document.getElementById('container');
  if (container) {
    container.style.height = `${window.innerHeight}px`;
  }
}

window.addEventListener('resize', setFullScreen);
window.addEventListener('orientationchange', () => {
  setTimeout(setFullScreen, 300);
});
setFullScreen();

const preventDefault = event => event.preventDefault();
document.addEventListener('touchmove', preventDefault, { passive: false });
document.addEventListener('gesturestart', preventDefault, { passive: false });

const container = document.getElementById('container');
if (container) {
  container.addEventListener('touchmove', preventDefault, { passive: false });
}



function checkOrientation() {

  const isMobilePortrait = window.innerHeight > window.innerWidth && 'ontouchstart' in window;

  if (isMobilePortrait) {
    document.body.classList.add('portrait-mode');
  } else {
    document.body.classList.remove('portrait-mode');
  }
}

window.addEventListener('DOMContentLoaded', checkOrientation);
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {

  setTimeout(checkOrientation, 200);
});