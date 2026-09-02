/**
 * Melodia root atmosphere gateway.
 * A deliberately quiet Three.js field: breathing haze, slow rings, drifting light.
 */
(function (window, document) {
  'use strict';

  var THREE;
  var mount;
  var renderer;
  var scene;
  var camera;
  var clock;
  var halo;
  var rings;
  var particles;
  var haze;
  var pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  var reducedMotion = false;

  function seededRandom(seed) {
    var value = seed >>> 0;
    return function () {
      value += 0x6d2b79f5;
      var t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shaderMaterial(vertex, fragment, uniforms) {
    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
  }

  function makeHaze() {
    var uniforms = {
      uTime: { value: 0 },
      uRose: { value: new THREE.Color(0xd6a9b0) },
      uSeafoam: { value: new THREE.Color(0x8fc9bd) }
    };
    var material = shaderMaterial(
      [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      [
        'uniform float uTime;',
        'uniform vec3 uRose;',
        'uniform vec3 uSeafoam;',
        'varying vec2 vUv;',
        'void main() {',
        '  vec2 p = vUv - vec2(0.5);',
        '  float d = length(p * vec2(0.86, 1.2));',
        '  float breath = 0.5 + 0.5 * sin(uTime * 0.34);',
        '  float alpha = smoothstep(0.62, 0.02, d) * (0.16 + breath * 0.08);',
        '  vec3 color = mix(uSeafoam, uRose, smoothstep(0.2, 0.85, vUv.y));',
        '  gl_FragColor = vec4(color, alpha);',
        '}'
      ].join('\n'),
      uniforms
    );
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(25, 16), material);
    mesh.position.set(1.4, 0.1, -8);
    mesh.userData.uniforms = uniforms;
    return mesh;
  }

  function makeParticles() {
    var random = seededRandom(2718);
    var count = 360;
    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var i;
    for (i = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 19;
      positions[i * 3 + 1] = (random() - 0.35) * 11;
      positions[i * 3 + 2] = -2 - random() * 19;
      sizes[i] = 0.55 + random() * 1.7;
    }
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    var material = shaderMaterial(
      [
        'attribute float aSize;',
        'varying float vAlpha;',
        'void main() {',
        '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
        '  gl_PointSize = aSize * (110.0 / max(1.0, -mv.z));',
        '  gl_Position = projectionMatrix * mv;',
        '  vAlpha = 0.25 + aSize * 0.14;',
        '}'
      ].join('\n'),
      [
        'varying float vAlpha;',
        'void main() {',
        '  float d = distance(gl_PointCoord, vec2(0.5));',
        '  float glow = smoothstep(0.5, 0.0, d);',
        '  gl_FragColor = vec4(0.95, 0.88, 0.74, glow * vAlpha);',
        '}'
      ].join('\n'),
      {}
    );
    var points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  function resize() {
    if (!renderer) return;
    var width = Math.max(1, mount.clientWidth);
    var height = Math.max(1, mount.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate() {
    window.requestAnimationFrame(animate);
    if (document.hidden) return;
    var delta = Math.min(clock.getDelta(), 0.05);
    var time = clock.elapsedTime;
    if (!reducedMotion) {
      halo.rotation.z += delta * 0.008;
      rings.forEach(function (ring, index) {
        ring.rotation.z += delta * (index % 2 ? -0.012 : 0.017);
        ring.rotation.x = Math.sin(time * 0.12 + index) * 0.06;
        ring.scale.y = 0.92 + Math.sin(time * 0.22 + index * 0.7) * 0.025;
      });
      particles.rotation.y += delta * 0.003;
      haze.userData.uniforms.uTime.value = time;
    }
    pointer.x += (pointer.targetX - pointer.x) * 0.035;
    pointer.y += (pointer.targetY - pointer.y) * 0.035;
    camera.position.x += ((pointer.x * 0.28) - camera.position.x) * 0.025;
    camera.position.y += ((pointer.y * 0.16 + 0.18) - camera.position.y) * 0.025;
    camera.lookAt(0.35, 0.05, -5.2);
    renderer.render(scene, camera);
  }

  function boot() {
    mount = document.getElementById('atmosphere-canvas');
    reducedMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    THREE = window.THREE;
    if (!mount || !THREE || !window.WebGLRenderingContext) return;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.45));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.92;
      mount.appendChild(renderer.domElement);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, 1, 0.1, 80);
      camera.position.set(0, 0.18, 10);
      clock = new THREE.Clock();

      var key = new THREE.PointLight(0xd6a9b0, 8, 28, 2);
      key.position.set(4, 3, 2);
      var rim = new THREE.PointLight(0x8fc9bd, 7, 24, 2);
      rim.position.set(-5, 1, -5);
      scene.add(new THREE.AmbientLight(0x26365e, 1.5), key, rim);

      haze = makeHaze();
      halo = new THREE.Mesh(
        new THREE.TorusGeometry(2.25, 0.026, 8, 120),
        new THREE.MeshBasicMaterial({
          color: 0xc9a86a,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      halo.position.set(0.8, 0.45, -5.4);
      halo.scale.y = 0.48;
      scene.add(haze, halo);

      rings = [];
      [1.4, 2.1, 2.9].forEach(function (radius, index) {
        var ring = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.018 + index * 0.009, 8, 96),
          new THREE.MeshBasicMaterial({
            color: index === 1 ? 0xd6a9b0 : 0x8fc9bd,
            transparent: true,
            opacity: 0.22 - index * 0.035,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        ring.position.set(0.8 - index * 0.08, 0.45, -5.2 - index * 0.7);
        ring.scale.y = 0.48 + index * 0.04;
        rings.push(ring);
        scene.add(ring);
      });
      particles = makeParticles();
      scene.add(particles);
      window.addEventListener('resize', resize, { passive: true });
      mount.addEventListener('pointermove', function (event) {
        var rect = mount.getBoundingClientRect();
        pointer.targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
        pointer.targetY = -((event.clientY - rect.top) / rect.height * 2 - 1);
      }, { passive: true });
      document.querySelector('.atmosphere-shell').classList.add('is-ready');
      resize();
      animate();
    } catch (error) {
      if (window.console && window.console.error) window.console.error('Melodia atmosphere:', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
