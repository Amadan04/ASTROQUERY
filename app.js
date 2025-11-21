import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById('gl');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

const textureLoader = new THREE.TextureLoader();
const dayTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
const specTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
const nightTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_lights_2048.png');
const cloudTexture = textureLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');

const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
dayTexture.colorSpace = THREE.SRGBColorSpace;
dayTexture.anisotropy = maxAnisotropy;
specTexture.anisotropy = maxAnisotropy;
nightTexture.colorSpace = THREE.SRGBColorSpace;
nightTexture.anisotropy = maxAnisotropy;
cloudTexture.colorSpace = THREE.SRGBColorSpace;
cloudTexture.anisotropy = maxAnisotropy;

const starGeometry = new THREE.BufferGeometry();
const starCount = 8000;
const starPositions = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);

for (let i = 0; i < starCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(Math.random() * 2 - 1);
  const radius = 50 + Math.random() * 50;

  starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i * 3 + 2] = radius * Math.cos(phi);

  starSizes[i] = Math.random() * 2 + 0.5;
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.1,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.8
});

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
const earthMaterial = new THREE.MeshPhongMaterial({
  map: dayTexture,
  specularMap: specTexture,
  bumpMap: dayTexture,
  bumpScale: 0.35,
  specular: new THREE.Color(0x222222),
  shininess: 20
});

const earth = new THREE.Mesh(earthGeometry, earthMaterial);

const cloudGeometry = new THREE.SphereGeometry(1.01, 64, 64);
const cloudMaterial = new THREE.MeshPhongMaterial({
  map: cloudTexture,
  transparent: true,
  opacity: 0.55,
  depthWrite: false
});

const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);

const nightLightVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nightLightFragmentShader = `
  uniform sampler2D nightMap;
  uniform vec3 lightDirection;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightDirection);

    float lightDot = dot(normal, lightDir);
    float nightFactor = smoothstep(0.1, -0.1, lightDot);

    vec4 nightColor = texture2D(nightMap, vUv);
    gl_FragColor = vec4(nightColor.rgb, nightColor.a * nightFactor);
  }
`;

const nightLightGeometry = new THREE.SphereGeometry(1.001, 64, 64);
const nightLightMaterial = new THREE.ShaderMaterial({
  uniforms: {
    nightMap: { value: nightTexture },
    lightDirection: { value: new THREE.Vector3(1, 0, 0) }
  },
  vertexShader: nightLightVertexShader,
  fragmentShader: nightLightFragmentShader,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const nightLights = new THREE.Mesh(nightLightGeometry, nightLightMaterial);

const atmosphereVertexShader = `
  varying vec3 vNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    float intensity = pow(0.6 - dot(normal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
  }
`;

const atmosphereGeometry = new THREE.SphereGeometry(1.06, 64, 64);
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  transparent: true,
  depthWrite: false,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending
});

const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

const earthGroup = new THREE.Group();
earthGroup.add(earth);
earthGroup.add(clouds);
earthGroup.add(nightLights);
earthGroup.add(atmosphere);
scene.add(earthGroup);

const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(5, 3, 5);
scene.add(sunLight);

const ambientLight = new THREE.AmbientLight(0x222233, 0.3);
scene.add(ambientLight);

let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let isVisible = true;
document.addEventListener('visibilitychange', () => {
  isVisible = !document.hidden;
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const motionFactor = reduceMotion ? 0.5 : 1;

let frameCount = 0;
let lastFpsCheck = performance.now();
let lowFpsTime = 0;

function updateNavigation() {
  const hash = window.location.hash || '#/';
  const route = hash.substring(1);

  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.route === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

window.addEventListener('hashchange', updateNavigation);
updateNavigation();

let RAF = null;

function animate() {
  RAF = requestAnimationFrame(animate);

  if (!isVisible) return;

  earth.rotation.y += 0.001 * motionFactor;
  clouds.rotation.y += 0.0012 * 1.2 * motionFactor;
  nightLights.rotation.y += 0.001 * motionFactor;

  const lightDir = new THREE.Vector3(5, 3, 5).normalize();
  nightLightMaterial.uniforms.lightDirection.value.copy(lightDir);

  if (!reduceMotion) {
    const time = Date.now() * 0.0005;
    const sizes = starGeometry.attributes.size.array;
    for (let i = 0; i < starCount; i++) {
      sizes[i] = (Math.sin(time + i) * 0.3 + 1.2) * (Math.random() * 2 + 0.5);
    }
    starGeometry.attributes.size.needsUpdate = true;
  }

  camera.position.x = mouseX * 0.1;
  camera.position.y = mouseY * 0.1;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);

  frameCount++;
  const now = performance.now();
  if (now - lastFpsCheck > 1000) {
    const fps = (frameCount / (now - lastFpsCheck)) * 1000;
    if (fps < 48) {
      lowFpsTime += (now - lastFpsCheck);
      if (lowFpsTime > 1000) {
        const newDPR = Math.max(0.75, window.devicePixelRatio * 0.75);
        renderer.setPixelRatio(newDPR);
        lowFpsTime = 0;
      }
    } else {
      lowFpsTime = 0;
    }
    frameCount = 0;
    lastFpsCheck = now;
  }
}

function tween({from=0,to=1,dur=600,ease=(t)=>t,onUpdate,onDone}){
  const t0=performance.now();
  function f(now){
    const p=Math.min(1,(now-t0)/dur); const e=ease(p); onUpdate && onUpdate(from+(to-from)*e);
    if(p<1) requestAnimationFrame(f); else onDone && onDone();
  } requestAnimationFrame(f);
}
const easeInOut = t=>t<.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;

window.__earthShow = ()=>{ earthGroup.visible = true; };
window.__earthHide = ()=>{ earthGroup.visible = false; };

window.__earthZoomOutToPage = (cb)=>{
  earthGroup.visible = true;
  const startScale = earthGroup.scale.x||1;
  tween({from:startScale,to:2.6,dur:600,ease:easeInOut,onUpdate:(v)=>{ earthGroup.scale.setScalar(v); camera.position.z = 3 - (v-1)*0.28; }, onDone:()=>{ earthGroup.visible=false; earthGroup.scale.setScalar(1); camera.position.z = 3; cb && cb(); }});
};

window.__earthZoomInFromPage = ()=>{
  earthGroup.visible = true;
  earthGroup.scale.setScalar(2.6); camera.position.z = 3 - (2.6-1)*0.28;
  tween({from:2.6,to:1,dur:650,ease:easeInOut,onUpdate:(v)=>{ earthGroup.scale.setScalar(v); camera.position.z = 3 - (v-1)*0.28; }});
};

RAF = requestAnimationFrame(animate);

console.log('✅ Step-1 ready');

import { initSearchUI } from './search.js';
initSearchUI();
console.log("✅ Step-2 ready");

import { initRouter } from './router.js';
initRouter(()=>{});
console.log("✅ Step-3 ready");

// Auth functionality removed

console.log("✅ Step-4 polish ready");

console.log("✅ Step-5 applied");

console.log("✅ Step-6 applied");

document.getElementById('fabChat')?.addEventListener('click', ()=> location.hash = '#/chat');

console.log("✅ Step-7 applied");

console.log("✅ FAB + spacing + checkboxes applied");

console.log("✅ FAB + advanced checkboxes + spacing applied");

import { enhanceButtons } from './ui-effects.js';
enhanceButtons();
