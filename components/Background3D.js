import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function createPlanetTexture(color1, color2) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 15;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.4})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - r*0.3, y - r*0.3, r*0.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
        ctx.fill();
    }
    
    // Gas bands
    for (let i = 0; i < 5; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1})`;
        ctx.fillRect(0, Math.random() * 512, 512, Math.random() * 40 + 10);
    }

    return new THREE.CanvasTexture(canvas);
}

function createSpaceship() {
    const group = new THREE.Group();
    const bodyGeo = new THREE.CylinderGeometry(0, 6, 25, 6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3a3f47, metalness: 0.9, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);
    
    const cockpitGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const cockpitMat = new THREE.MeshStandardMaterial({ color: 0x00D2A6, metalness: 1, roughness: 0, emissive: 0x004433 });
    const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
    cockpit.position.set(0, 2.5, 3);
    group.add(cockpit);
    
    const engineGeo = new THREE.CylinderGeometry(4, 4, 3, 16);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xff00aa });
    const engine = new THREE.Mesh(engineGeo, engineMat);
    engine.position.set(0, 0, -13);
    engine.rotation.x = Math.PI / 2;
    group.add(engine);

    group.scale.set(0.6, 0.6, 0.6);
    return group;
}

export async function initBackground3D() {
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 768;

  const bgContainer = document.createElement('div');
  bgContainer.style.position = 'fixed';
  bgContainer.style.top = '0';
  bgContainer.style.left = '0';
  bgContainer.style.width = '100vw';
  bgContainer.style.height = '100vh';
  bgContainer.style.zIndex = '-1';
  // CRITICAL: never intercept pointer or touch events
  bgContainer.style.pointerEvents = 'none';
  bgContainer.style.touchAction = 'none';
  document.body.appendChild(bgContainer);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0b0e11, 0.0015); 
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
  camera.position.z = 200;

  let renderer;
  try {
     renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: isMobile ? 'low-power' : 'high-performance' });
     renderer.setSize(window.innerWidth, window.innerHeight);
     renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
     renderer.setClearColor(0x000000, 0);
     // CRITICAL: renderer canvas must never steal touch events
     renderer.domElement.style.pointerEvents = 'none';
     renderer.domElement.style.touchAction = 'none';
     bgContainer.appendChild(renderer.domElement);
  } catch(e) {
     console.error("WebGL Rendering Context Failed:", e);
     bgContainer.style.background = "radial-gradient(circle at center, #0b0e11 0%, #000 100%)";
     return;
  }

  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.6, 0.5, 0.85);
  bloomPass.threshold = 0.15;
  bloomPass.strength = 1.2; 
  bloomPass.radius = 0.6;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0x00D2A6, 2.5);
  dirLight.position.set(1, 1, 1);
  scene.add(dirLight);
  const pinkLight = new THREE.DirectionalLight(0xff00aa, 2);
  pinkLight.position.set(-1, -0.5, -1);
  scene.add(pinkLight);

  // Reduce stars on mobile for performance
  const rawParticles = isMobile ? 3000 : 8000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(rawParticles * 3);
  const colors = new Float32Array(rawParticles * 3);

  const starColors = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xaaccff),
    new THREE.Color(0x00D2A6),
    new THREE.Color(0xff00aa)
  ];

  for (let i = 0; i < rawParticles; i++) {
    const i3 = i * 3;
    const spread = 2000;
    positions[i3] = (Math.random() - 0.5) * spread;
    positions[i3 + 1] = (Math.random() - 0.5) * spread;
    positions[i3 + 2] = (Math.random() - 0.5) * spread - 500;

    const color = starColors[Math.floor(Math.random() * starColors.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  const material = new THREE.PointsMaterial({
    size: 2.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    map: createStarTexture(),
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  // Entities: Realistic Planets and Spacecraft
  const entities = [];
  
  // Create 3 Realistic Planets
  const planetColors = [
      ['#2a4b8d', '#00D2A6'], // Earth-like neo
      ['#8c2020', '#ff00aa'], // Red giant neo
      ['#3a1c71', '#d76d77']  // Purple gas
  ];

  planetColors.forEach(colors => {
      const pGeo = new THREE.SphereGeometry(Math.random() * 40 + 20, 64, 64);
      const pMat = new THREE.MeshStandardMaterial({
          map: createPlanetTexture(colors[0], colors[1]),
          roughness: 0.8,
          metalness: 0.2
      });
      const planet = new THREE.Mesh(pGeo, pMat);
      
      // Position far away
      planet.position.set((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * -1000 - 200);
      planet.userData = {
          velocity: new THREE.Vector3(0, 0, Math.random() * 0.5 + 0.1),
          rotSpeed: new THREE.Vector3(0, Math.random() * 0.005, 0),
          isPlanet: true
      };
      scene.add(planet);
      entities.push(planet);
  });

  // Create 15 Low-Poly Sci-Fi Spaceships
  for(let i = 0; i < 15; i++) {
      const ship = createSpaceship();
      ship.position.set((Math.random() - 0.5) * 800, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * -1200);
      
      // Face towards Z (camera)
      ship.lookAt(new THREE.Vector3(ship.position.x, ship.position.y, 1000));

      ship.userData = {
          velocity: new THREE.Vector3(0, 0, Math.random() * 3 + 1), // Fast movement towards camera
          rotSpeed: new THREE.Vector3(0, 0, (Math.random() - 0.5) * 0.05), // Slight barrel roll
          isShip: true
      };
      scene.add(ship);
      entities.push(ship);
  }

  // Infinite Universe Orbit Exploration
  // CRITICAL FIX: Only attach OrbitControls to the renderer canvas (not documentElement).
  // On mobile we completely disable OrbitControls so touch events are never intercepted.
  let controls = null;
  if (!isMobile) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    // Prevent OrbitControls from blocking page scroll on desktop
    controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: null, RIGHT: null };
  }

  let targetScrollY = 0;
  window.addEventListener('scroll', () => targetScrollY = window.scrollY);

  let currentScrollY = 0;

  function animate() {
    requestAnimationFrame(animate);
    currentScrollY += (targetScrollY - currentScrollY) * 0.05;

    // Slight parallax on scroll
    camera.position.z = 200 - (currentScrollY * 0.05);
    
    if (controls) controls.update();

    stars.rotation.x += 0.00005;
    stars.rotation.y += 0.0001;

    // Infinite Traversal Physics
    entities.forEach(entity => {
       entity.position.add(entity.userData.velocity);
       entity.rotation.x += entity.userData.rotSpeed.x;
       entity.rotation.y += entity.userData.rotSpeed.y;
       entity.rotation.z += entity.userData.rotSpeed.z;

       // If object flies past the camera, wrap it DEEP into the background
       if (entity.position.z > camera.position.z + 100) {
           entity.position.z = -1500;
           entity.position.x = (Math.random() - 0.5) * 1200;
           entity.position.y = (Math.random() - 0.5) * 800;
           
           if(entity.userData.isShip) {
               entity.lookAt(new THREE.Vector3(entity.position.x, entity.position.y, 1000));
           }
       }
    });

    composer.render();
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
}
