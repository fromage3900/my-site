document.addEventListener("DOMContentLoaded", () => {
  if (typeof THREE === 'undefined') return;

  const stardustContainers = document.querySelectorAll('.stardust-field');
  if (stardustContainers.length === 0) return;

  stardustContainers.forEach(container => {
    // Clear static HTML stars
    container.innerHTML = '';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create particles
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color('#FFB7E1'), // Rose
      new THREE.Color('#88E5FF'), // Cyan
      new THREE.Color('#EED08D'), // Gold
      new THREE.Color('#D8B4FE'), // Purple
    ];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;

      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i] = c.r;
      colors[i+1] = c.g;
      colors[i+2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom shader material for glowing stardust
    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Handle resize
    window.addEventListener('resize', () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation Loop
    function animate() {
      requestAnimationFrame(animate);

      // Rotate slowly
      particles.rotation.y += 0.001;
      particles.rotation.x += 0.0005;

      // React to mouse
      particles.position.x += (mouseX * 0.5 - particles.position.x) * 0.05;
      particles.position.y += (mouseY * 0.5 - particles.position.y) * 0.05;

      renderer.render(scene, camera);
    }
    animate();
  });
});
