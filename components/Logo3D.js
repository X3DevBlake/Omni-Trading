import * as THREE from 'three';

/**
 * Renders a high-fidelity 3D animated logo using Three.js.
 * The logo features an atomic structure with rotating loops, a glowing core, and a particle system.
 * It includes interactive hover effects that increase rotation speed and glow intensity.
 *
 * @param {string} containerId - The ID of the HTML element to host the 3D scene.
 * @param {number} [colorHex=0x00D2A6] - The primary color of the logo in hex format.
 */
export function renderLogo3D(containerId, colorHex = 0x00D2A6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const width = container.clientWidth || 50;
  const height = container.clientHeight || 50;

  // Scene setup
  const scene = new THREE.Scene();
  
  // Camera setup
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 6;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Group to hold the 3 distinct loops and core mechanics
  const gyroGroup = new THREE.Group();

  /* ----------------------------------------------------
     LAYER 1: The Ambient Glow Aura
  ---------------------------------------------------- */
  const auraGeo = new THREE.SphereGeometry(1.8, 32, 32);
  const auraMat = new THREE.MeshBasicMaterial({ 
      color: colorHex, 
      transparent: true, 
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  gyroGroup.add(aura);

  /* ----------------------------------------------------
     LAYER 2: The 3-Loop Atomic Structure
  ---------------------------------------------------- */
  const ringGeometry = new THREE.TorusGeometry(1.4, 0.06, 128, 256); // Hyper-smooth, extremely thin rings
  
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: colorHex,
    metalness: 0.9,
    roughness: 0.1,
    emissive: colorHex,
    emissiveIntensity: 0.7,
  });

  const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring1.rotation.x = Math.PI / 2;
  gyroGroup.add(ring1);

  const ring2 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring2.rotation.y = Math.PI / 4; 
  ring2.rotation.x = Math.PI / 4; 
  gyroGroup.add(ring2);

  const ring3 = new THREE.Mesh(ringGeometry, ringMaterial);
  ring3.rotation.y = -Math.PI / 4; 
  ring3.rotation.x = Math.PI / 4;
  gyroGroup.add(ring3);

  /* ----------------------------------------------------
     LAYER 3: The Wireframe Tech Core
  ---------------------------------------------------- */
  const coreGroup = new THREE.Group();
  
  const innerCoreGeo = new THREE.SphereGeometry(0.28, 64, 64);
  const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  coreGroup.add(innerCore);

  const wireframeGeo = new THREE.IcosahedronGeometry(0.42, 3); // High poly wireframe wrap
  const wireframeMat = new THREE.MeshBasicMaterial({ 
      color: colorHex, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.8 
  });
  const wireCore = new THREE.Mesh(wireframeGeo, wireframeMat);
  coreGroup.add(wireCore);

  gyroGroup.add(coreGroup);

  /* ----------------------------------------------------
     LAYER 4: Stardust Internal Particle System
  ---------------------------------------------------- */
  const particleCount = 150;
  const particlesGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);

  for(let i=0; i < particleCount; i++) {
     const r = 0.5 + Math.random() * 1.0;
     const theta = Math.random() * 2 * Math.PI;
     const phi = Math.acos((Math.random() * 2) - 1);
     
     particlePos[i*3] = r * Math.sin(phi) * Math.cos(theta);
     particlePos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
     particlePos[i*3+2] = r * Math.cos(phi);
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
  });

  const stardust = new THREE.Points(particlesGeo, particleMat);
  gyroGroup.add(stardust);

  // Hidden hit-box for raycasting to make hovered area larger globally
  const hitGeo = new THREE.SphereGeometry(2.0, 16, 16);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  gyroGroup.add(hitMesh);

  scene.add(gyroGroup);

  // Lighting
  const light = new THREE.PointLight(0xffffff, 4.0, 100);
  light.position.set(0, 0, 10);
  scene.add(light);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Raycaster setup
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2(-1, -1);
  let isHovered = false;

  container.addEventListener('mousemove', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  });
  
  container.addEventListener('mouseleave', () => {
    mouse.x = -1;
    mouse.y = -1;
  });

  // Base rotation speeds
  let gyroSpeedX = 0.005;
  let gyroSpeedY = 0.007;
  let coreSpeedY = -0.03;
  let coreSpeedZ = 0.01;

  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Detect Hover
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hitMesh);
    
    if (intersects.length > 0) {
      isHovered = true;
      // Interpolate towards faster rotation
      gyroSpeedX += (0.02 - gyroSpeedX) * 0.1;
      gyroSpeedY += (0.025 - gyroSpeedY) * 0.1;
      coreSpeedY += (-0.08 - coreSpeedY) * 0.1;
      auraMat.opacity = 0.15 + Math.sin(time * 6) * 0.05; // faster, brighter pulsing
      gyroGroup.scale.setScalar(1.05); // slight pop scale
    } else {
      isHovered = false;
      gyroSpeedX += (0.005 - gyroSpeedX) * 0.05;
      gyroSpeedY += (0.007 - gyroSpeedY) * 0.05;
      coreSpeedY += (-0.03 - coreSpeedY) * 0.05;
      auraMat.opacity = 0.05 + Math.sin(time * 2) * 0.03;
      gyroGroup.scale.setScalar(1.0);
    }
    
    gyroGroup.rotation.x += gyroSpeedX;
    gyroGroup.rotation.y += gyroSpeedY;

    coreGroup.rotation.y += coreSpeedY;
    coreGroup.rotation.z += coreSpeedZ;

    stardust.rotation.y -= 0.01;
    stardust.rotation.x += 0.005;

    renderer.render(scene, camera);
  }
  
  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
}
