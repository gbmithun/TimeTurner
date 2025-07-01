export function setupWatch3D(THREE, OrbitControls, GLTFLoader) {
  let scene, camera, renderer, controls, watchModel, raycaster, mouse;
  let dialMesh = null, strapMesh = null, crownMesh = null;
  let tooltipDiv = null;

  // Utility: Show tooltip/arrow overlay
  function showTooltip(x, y, label) {
    if (!tooltipDiv) {
      tooltipDiv = document.createElement('div');
      tooltipDiv.style.position = 'absolute';
      tooltipDiv.style.pointerEvents = 'none';
      tooltipDiv.style.zIndex = 10;
      tooltipDiv.style.transition = 'opacity 0.2s';
      tooltipDiv.style.background = 'rgba(0,0,0,0.8)';
      tooltipDiv.style.color = '#fff';
      tooltipDiv.style.padding = '4px 10px';
      tooltipDiv.style.borderRadius = '8px';
      tooltipDiv.style.fontSize = '0.9rem';
      tooltipDiv.style.opacity = 0.95;
      tooltipDiv.style.display = 'flex';
      tooltipDiv.style.alignItems = 'center';
      tooltipDiv.innerHTML = `<span style="margin-right:6px;">⬆️</span><span id="tt-label"></span>`;
      document.getElementById('watch-3d-container').appendChild(tooltipDiv);
    }
    tooltipDiv.style.left = `${x}px`;
    tooltipDiv.style.top = `${y - 40}px`;
    tooltipDiv.querySelector('#tt-label').textContent = label;
    tooltipDiv.style.opacity = 1;
    setTimeout(() => { tooltipDiv.style.opacity = 0; }, 1500);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  function resize() {
    const container = document.getElementById('watch-3d-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function highlightPart(mesh) {
    if (!mesh) return;
    const origColor = mesh.material.color.getHex();
    mesh.material.emissive = new THREE.Color(0xFFD700);
    setTimeout(() => {
      mesh.material.emissive = new THREE.Color(0x000000);
      mesh.material.color.setHex(origColor);
    }, 1000);
  }

  const container = document.getElementById('watch-3d-container');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 1.5, 5);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0xffffff, 0);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 2;
  controls.maxDistance = 10;

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  // Raycaster for click detection
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Load the watch model
  const loader = new GLTFLoader();
  loader.load('/models/watch.glb', gltf => {
    watchModel = gltf.scene;
    watchModel.traverse(child => {
      if (child.isMesh) {
        // Identify parts by name or index (adjust as per your model)
        if (child.name.toLowerCase().includes('dial')) dialMesh = child;
        if (child.name.toLowerCase().includes('strap')) strapMesh = child;
        if (child.name.toLowerCase().includes('crown')) crownMesh = child;
      }
    });
    scene.add(watchModel);
    animate();
  });

  // Handle resizing
  window.addEventListener('resize', resize);

  // Handle click for part selection
  renderer.domElement.addEventListener('pointerdown', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([dialMesh, strapMesh, crownMesh].filter(Boolean));
    if (intersects.length > 0) {
      const mesh = intersects[0].object;
      let label = '';
      if (mesh === dialMesh) label = 'Dial';
      if (mesh === strapMesh) label = 'Strap';
      if (mesh === crownMesh) label = 'Crown';
      highlightPart(mesh);
      showTooltip(event.offsetX, event.offsetY, label);
    }
  });

  // Listen for dial color change
  const dialColorInput = document.getElementById('dialColor');
  if (dialColorInput) {
    dialColorInput.addEventListener('input', (e) => {
      if (dialMesh) {
        dialMesh.material.color.set(e.target.value);
      }
    });
  }

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}
