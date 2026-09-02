/**
 * Melodia Living Worlds
 * Three procedural dreamscapes built with Three.js r128 and no external art assets.
 */
(function (window, document) {
  'use strict';

  var THREE = window.THREE;
  var shell;
  var canvasRoot;
  var renderer;
  var scene;
  var camera;
  var clock;
  var animationFrame;
  var chapters = [];
  var currentChapter = 1;
  var cameraHome;
  var lookHome;
  var lookCurrent;
  var desiredCamera;
  var starfield;
  var ambientLight;
  var keyLight;
  var rimLight;
  var elapsed = 0;
  var frameCount = 0;
  var fpsStarted = 0;
  var motionEnabled = true;
  var reducedMotion = false;
  var pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  var orbit = { yaw: 0, pitch: 0, dragging: false, x: 0, y: 0 };

  var CHAPTER_COPY = [
    {
      id: 'sea-above',
      chapter: 'Chapter I · Serene Impossibility',
      title: 'Sea Above',
      description: 'An ocean occupies the sky. Bone-gold arches emerge from a tide with no source, while small stars drift upward into the water.',
      motifs: 'inverted water · caustic ceiling · gilded ribs',
      background: 0x081224,
      fog: 0x101b34,
      accent: 0x8fc9bd,
      camera: [0, 1.3, 9.2],
      target: [0, 1.2, -3.4]
    },
    {
      id: 'faraway-mother',
      chapter: 'Chapter II · Biological Revelation',
      title: 'Faraway Mother',
      description: 'The mountain inhales. A pupil larger than a lighthouse opens inside its folds, and a tear-river remembers the way home.',
      motifs: 'fabric terrain · eyelid fold · tear river',
      background: 0x171021,
      fog: 0x241b2e,
      accent: 0xe8a9a1,
      camera: [0, 1.8, 9.8],
      target: [0, 1.55, -4.5]
    },
    {
      id: 'horizon-eater',
      chapter: 'Chapter III · Ontological Dread',
      title: 'Horizon Eater',
      description: 'The edge of the world is not a line. It is a mouth holding the stars in place, folding distance until every road becomes a throat.',
      motifs: 'world-mouth · spatial compression · wayfold',
      background: 0x05050d,
      fog: 0x100917,
      accent: 0xa85751,
      camera: [0, 1.1, 10.6],
      target: [0, 0.9, -5.8]
    }
  ];

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

  function shaderMaterial(vertex, fragment, uniforms, options) {
    var settings = options || {};
    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: Boolean(settings.transparent),
      depthWrite: settings.depthWrite !== false,
      side: settings.side || THREE.FrontSide,
      blending: settings.blending || THREE.NormalBlending
    });
  }

  function makeStarfield() {
    var random = seededRandom(3900);
    var count = 1550;
    var positions = new Float32Array(count * 3);
    var sizes = new Float32Array(count);
    var i;

    for (i = 0; i < count; i += 1) {
      positions[i * 3] = (random() - 0.5) * 52;
      positions[i * 3 + 1] = (random() - 0.28) * 28;
      positions[i * 3 + 2] = -24 + random() * 44;
      sizes[i] = 0.7 + random() * 2.2;
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
        '  gl_PointSize = aSize * (130.0 / max(1.0, -mv.z));',
        '  gl_Position = projectionMatrix * mv;',
        '  vAlpha = 0.35 + aSize * 0.18;',
        '}'
      ].join('\n'),
      [
        'uniform vec3 uColor;',
        'varying float vAlpha;',
        'void main() {',
        '  vec2 p = gl_PointCoord - vec2(0.5);',
        '  float d = length(p);',
        '  float glow = smoothstep(0.5, 0.0, d);',
        '  gl_FragColor = vec4(uColor, glow * vAlpha);',
        '}'
      ].join('\n'),
      { uColor: { value: new THREE.Color(CHAPTER_COPY[1].accent) } },
      { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }
    );

    var points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    return points;
  }

  function buildSeaAbove() {
    var group = new THREE.Group();
    group.name = 'Sea Above';
    var waterUniforms = {
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color(0x26365e) },
      uLight: { value: new THREE.Color(0x8fc9bd) },
      uPearl: { value: new THREE.Color(0xe8e4f2) }
    };
    var waterMaterial = shaderMaterial(
      [
        'uniform float uTime;',
        'varying vec2 vUv;',
        'varying float vWave;',
        'void main() {',
        '  vUv = uv;',
        '  vec3 p = position;',
        '  float a = sin(p.x * 0.46 + uTime * 0.55) * 0.22;',
        '  float b = cos(p.y * 0.35 - uTime * 0.42) * 0.18;',
        '  float c = sin((p.x + p.y) * 0.21 + uTime * 0.3) * 0.12;',
        '  p.z += a + b + c;',
        '  vWave = a + b + c;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);',
        '}'
      ].join('\n'),
      [
        'uniform float uTime;',
        'uniform vec3 uDeep;',
        'uniform vec3 uLight;',
        'uniform vec3 uPearl;',
        'varying vec2 vUv;',
        'varying float vWave;',
        'void main() {',
        '  float c1 = sin((vUv.x + vUv.y) * 46.0 + uTime * 0.85);',
        '  float c2 = sin((vUv.x - vUv.y) * 31.0 - uTime * 0.62);',
        '  float caustic = pow(max(0.0, c1 * c2), 4.0);',
        '  vec3 color = mix(uDeep, uLight, 0.5 + vWave * 0.7);',
        '  color = mix(color, uPearl, caustic * 0.52);',
        '  gl_FragColor = vec4(color, 0.58 + caustic * 0.16);',
        '}'
      ].join('\n'),
      waterUniforms,
      { transparent: true, depthWrite: false, side: THREE.DoubleSide }
    );
    var water = new THREE.Mesh(new THREE.PlaneGeometry(42, 42, 88, 88), waterMaterial);
    water.rotation.x = Math.PI / 2;
    water.position.set(0, 5.2, -5);
    group.add(water);

    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(42, 42),
      new THREE.MeshStandardMaterial({
        color: 0x101b34,
        roughness: 0.86,
        metalness: 0.12
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.25;
    group.add(floor);

    var ribMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc9a86a,
      emissive: 0x4b3217,
      emissiveIntensity: 0.48,
      roughness: 0.34,
      metalness: 0.72
    });
    var ribGeometry = new THREE.TorusGeometry(3.35, 0.095, 10, 88, Math.PI);
    var ribs = new THREE.Group();
    var r;
    for (r = 0; r < 8; r += 1) {
      var rib = new THREE.Mesh(ribGeometry, ribMaterial);
      rib.position.set(Math.sin(r * 0.7) * 0.26, -0.85, 2.2 - r * 2.65);
      rib.scale.set(1 + r * 0.045, 1 + r * 0.018, 1);
      ribs.add(rib);
    }
    group.add(ribs);

    var moon = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 3),
      new THREE.MeshPhysicalMaterial({
        color: 0xe8e4f2,
        emissive: 0x6e5aa6,
        emissiveIntensity: 0.38,
        roughness: 0.18,
        metalness: 0.06,
        transparent: true,
        opacity: 0.76
      })
    );
    moon.position.set(0, 1.15, -15.5);
    group.add(moon);

    var shardGeometry = new THREE.OctahedronGeometry(0.08, 0);
    var shardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0e6d2,
      emissive: 0xc9a86a,
      emissiveIntensity: 0.65,
      roughness: 0.24
    });
    var shards = new THREE.Group();
    var random = seededRandom(771);
    var i;
    for (i = 0; i < 42; i += 1) {
      var shard = new THREE.Mesh(shardGeometry, shardMaterial);
      shard.position.set((random() - 0.5) * 14, -0.25 + random() * 5.1, 5 - random() * 24);
      shard.scale.setScalar(0.45 + random() * 1.8);
      shard.userData.phase = random() * Math.PI * 2;
      shards.add(shard);
    }
    group.add(shards);

    group.userData.update = function (time, delta) {
      waterUniforms.uTime.value = time;
      moon.rotation.y += delta * 0.07;
      moon.rotation.x = Math.sin(time * 0.16) * 0.12;
      ribs.rotation.z = Math.sin(time * 0.14) * 0.012;
      shards.children.forEach(function (shard, index) {
        shard.rotation.x += delta * (0.18 + index % 5 * 0.04);
        shard.rotation.y += delta * 0.22;
        shard.position.y += Math.sin(time * 0.42 + shard.userData.phase) * delta * 0.045;
      });
    };
    return group;
  }

  function buildFarawayMother() {
    var group = new THREE.Group();
    group.name = 'Faraway Mother';
    var terrainGeometry = new THREE.PlaneGeometry(34, 38, 96, 108);
    var positions = terrainGeometry.attributes.position;
    var colors = [];
    var low = new THREE.Color(0x241b2e);
    var mid = new THREE.Color(0x6e6080);
    var high = new THREE.Color(0xd6a9b0);
    var i;

    for (i = 0; i < positions.count; i += 1) {
      var x = positions.getX(i);
      var lane = positions.getY(i);
      var mother = Math.exp(-(x * x / 30 + Math.pow(lane - 10.3, 2) / 22)) * 5.6;
      var shoulder = Math.exp(-Math.pow(x + 8.2, 2) / 22 - Math.pow(lane - 6.5, 2) / 30) * 2.6;
      var shoulderTwo = Math.exp(-Math.pow(x - 9.4, 2) / 25 - Math.pow(lane - 7.4, 2) / 34) * 2.9;
      var folds = Math.sin(x * 1.45 + lane * 0.32) * 0.22 * (0.25 + mother * 0.34);
      var smallFolds = Math.cos(x * 0.42 - lane * 0.72) * 0.13;
      var height = mother + shoulder + shoulderTwo + folds + smallFolds - 1.18;
      positions.setZ(i, height);
      var normalized = THREE.MathUtils.clamp((height + 1.2) / 6.8, 0, 1);
      var color = normalized < 0.5
        ? low.clone().lerp(mid, normalized * 2)
        : mid.clone().lerp(high, (normalized - 0.5) * 2);
      colors.push(color.r, color.g, color.b);
    }
    terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeometry.computeVertexNormals();

    var terrain = new THREE.Mesh(
      terrainGeometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.82,
        metalness: 0.03,
        side: THREE.DoubleSide
      })
    );
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = 0;
    group.add(terrain);

    var wire = new THREE.Mesh(
      terrainGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xe7c9ce,
        wireframe: true,
        transparent: true,
        opacity: 0.035
      })
    );
    wire.rotation.copy(terrain.rotation);
    wire.position.y = 0.018;
    group.add(wire);

    var eye = new THREE.Group();
    eye.position.set(0, 2.9, -8.65);
    var sclera = new THREE.Mesh(
      new THREE.CircleGeometry(2.05, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0xf5e8ea,
        emissive: 0xd6a9b0,
        emissiveIntensity: 0.22,
        roughness: 0.24,
        transparent: true,
        opacity: 0.9
      })
    );
    sclera.scale.y = 0.48;
    eye.add(sclera);
    var iris = new THREE.Mesh(
      new THREE.CircleGeometry(0.72, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0x8fc9bd,
        emissive: 0x3c5c9e,
        emissiveIntensity: 0.48,
        roughness: 0.18,
        metalness: 0.12
      })
    );
    iris.position.z = 0.035;
    eye.add(iris);
    var pupil = new THREE.Mesh(
      new THREE.CircleGeometry(0.27, 40),
      new THREE.MeshBasicMaterial({ color: 0x05050d })
    );
    pupil.scale.y = 1.75;
    pupil.position.z = 0.07;
    eye.add(pupil);
    var glint = new THREE.Mesh(
      new THREE.CircleGeometry(0.075, 24),
      new THREE.MeshBasicMaterial({ color: 0xfff8ee })
    );
    glint.position.set(-0.18, 0.23, 0.09);
    eye.add(glint);

    var lidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc9a86a,
      emissive: 0x4b3217,
      emissiveIntensity: 0.45,
      roughness: 0.32,
      metalness: 0.62
    });
    var upperCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.45, 0, 0.11),
      new THREE.Vector3(0, 1.05, 0.14),
      new THREE.Vector3(2.45, 0, 0.11)
    );
    var lowerCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.45, 0, 0.11),
      new THREE.Vector3(0, -1.05, 0.14),
      new THREE.Vector3(2.45, 0, 0.11)
    );
    var upperLid = new THREE.Mesh(new THREE.TubeGeometry(upperCurve, 48, 0.07, 8, false), lidMaterial);
    var lowerLid = new THREE.Mesh(new THREE.TubeGeometry(lowerCurve, 48, 0.055, 8, false), lidMaterial);
    eye.add(upperLid, lowerLid);
    group.add(eye);

    var riverGeometry = new THREE.PlaneGeometry(1.35, 19.5, 14, 100);
    var riverPositions = riverGeometry.attributes.position;
    for (i = 0; i < riverPositions.count; i += 1) {
      var riverX = riverPositions.getX(i);
      var riverLane = riverPositions.getY(i);
      riverPositions.setX(i, riverX * (0.55 + (riverLane + 9.75) / 19.5 * 0.6) + Math.sin(riverLane * 0.52) * 0.58);
      riverPositions.setZ(i, Math.sin(riverLane * 0.38) * 0.025);
    }
    var riverUniforms = {
      uTime: { value: 0 },
      uNear: { value: new THREE.Color(0x8fc9bd) },
      uFar: { value: new THREE.Color(0xf8ecd6) }
    };
    var riverMaterial = shaderMaterial(
      [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      [
        'uniform float uTime;',
        'uniform vec3 uNear;',
        'uniform vec3 uFar;',
        'varying vec2 vUv;',
        'void main() {',
        '  float flow = sin(vUv.y * 72.0 - uTime * 2.2 + sin(vUv.x * 14.0)) * 0.5 + 0.5;',
        '  float edge = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);',
        '  vec3 color = mix(uNear, uFar, vUv.y * 0.72 + flow * 0.16);',
        '  gl_FragColor = vec4(color, edge * (0.48 + flow * 0.25));',
        '}'
      ].join('\n'),
      riverUniforms,
      { transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }
    );
    var river = new THREE.Mesh(riverGeometry, riverMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -0.7, 0.5);
    group.add(river);

    var ribMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xddc79b,
      emissive: 0x4b3217,
      emissiveIntensity: 0.32,
      roughness: 0.4,
      metalness: 0.54,
      transparent: true,
      opacity: 0.72
    });
    var ribs = new THREE.Group();
    for (i = 0; i < 5; i += 1) {
      var arch = new THREE.Mesh(new THREE.TorusGeometry(2.6 + i * 0.18, 0.065, 8, 72, Math.PI), ribMaterial);
      arch.position.set(Math.sin(i) * 0.24, -0.62, -0.8 - i * 1.65);
      arch.scale.y = 0.72 + i * 0.04;
      ribs.add(arch);
    }
    group.add(ribs);

    var droplets = new THREE.Group();
    var dropletGeometry = new THREE.SphereGeometry(0.055, 10, 10);
    var dropletMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8e4f2,
      transparent: true,
      opacity: 0.76
    });
    var random = seededRandom(1313);
    for (i = 0; i < 34; i += 1) {
      var droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
      droplet.position.set((random() - 0.5) * 7.5, -0.2 + random() * 5.5, -4 - random() * 8);
      droplet.scale.y = 1.4 + random() * 2.4;
      droplet.userData.phase = random() * Math.PI * 2;
      droplets.add(droplet);
    }
    group.add(droplets);

    group.userData.update = function (time, delta, cursor) {
      var breath = 1 + Math.sin(time * 0.52) * 0.018;
      terrain.scale.y = breath;
      wire.scale.y = breath;
      riverUniforms.uTime.value = time;
      pupil.position.x = cursor.x * 0.22;
      pupil.position.y = cursor.y * 0.12;
      iris.position.x = cursor.x * 0.08;
      iris.position.y = cursor.y * 0.05;
      var blink = Math.pow(Math.max(0, Math.sin(time * 0.34 - 1.1)), 30);
      upperLid.position.y = -blink * 0.82;
      lowerLid.position.y = blink * 0.82;
      eye.scale.y = 1 + Math.sin(time * 0.52) * 0.014;
      droplets.children.forEach(function (drop, index) {
        drop.position.y += Math.sin(time * 0.68 + drop.userData.phase) * delta * 0.11;
        drop.rotation.z += delta * (0.1 + index % 4 * 0.02);
      });
    };
    return group;
  }

  function buildHorizonEater() {
    var group = new THREE.Group();
    group.name = 'Horizon Eater';
    var mouth = new THREE.Group();
    mouth.position.set(0, 0.95, -9.4);
    var voidDisk = new THREE.Mesh(
      new THREE.CircleGeometry(4.18, 80),
      new THREE.MeshBasicMaterial({ color: 0x020207 })
    );
    voidDisk.scale.y = 0.52;
    mouth.add(voidDisk);

    var rings = [];
    var ringColors = [0xa85751, 0x6e5aa6, 0xc9a86a];
    var i;
    for (i = 0; i < 3; i += 1) {
      var ring = new THREE.Mesh(
        new THREE.TorusGeometry(4.35 - i * 0.36, 0.17 - i * 0.03, 12, 112),
        new THREE.MeshPhysicalMaterial({
          color: ringColors[i],
          emissive: ringColors[i],
          emissiveIntensity: 0.44 - i * 0.06,
          roughness: 0.3,
          metalness: 0.54,
          transparent: true,
          opacity: 0.86
        })
      );
      ring.scale.y = 0.53 + i * 0.012;
      ring.position.z = 0.04 + i * 0.035;
      rings.push(ring);
      mouth.add(ring);
    }

    var toothGeometry = new THREE.ConeGeometry(0.13, 0.78, 7);
    var toothMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0e6d2,
      emissive: 0x6d4f24,
      emissiveIntensity: 0.2,
      roughness: 0.34,
      metalness: 0.18
    });
    var center = new THREE.Vector3(0, 0, 0.16);
    var up = new THREE.Vector3(0, 1, 0);
    for (i = 0; i < 30; i += 1) {
      var angle = i / 30 * Math.PI * 2;
      var tooth = new THREE.Mesh(toothGeometry, toothMaterial);
      tooth.position.set(Math.cos(angle) * 3.95, Math.sin(angle) * 1.92, 0.17);
      var direction = center.clone().sub(tooth.position).normalize();
      tooth.quaternion.setFromUnitVectors(up, direction);
      tooth.scale.setScalar(i % 2 === 0 ? 1 : 0.72);
      mouth.add(tooth);
    }
    group.add(mouth);

    var railMaterial = new THREE.LineBasicMaterial({
      color: 0x6e5aa6,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    var rails = new THREE.Group();
    for (i = 0; i < 18; i += 1) {
      var railPoints = [];
      var startX = -11 + i * 1.3;
      var p;
      for (p = 0; p < 54; p += 1) {
        var progress = p / 53;
        var z = 9 - progress * 18.2;
        var compression = Math.pow(1 - progress, 1.7);
        var x = startX * compression + Math.sin(progress * 5 + i) * 0.12;
        var y = -1.1 + Math.sin(i * 0.7) * 0.22 + progress * 1.7;
        railPoints.push(new THREE.Vector3(x, y, z));
      }
      var railGeometry = new THREE.BufferGeometry().setFromPoints(railPoints);
      rails.add(new THREE.Line(railGeometry, railMaterial));
    }
    group.add(rails);

    var random = seededRandom(909);
    var count = 720;
    var particlePositions = new Float32Array(count * 3);
    var baseX = new Float32Array(count);
    var baseY = new Float32Array(count);
    var speeds = new Float32Array(count);
    for (i = 0; i < count; i += 1) {
      baseX[i] = (random() - 0.5) * 20;
      baseY[i] = -0.5 + (random() - 0.5) * 8;
      particlePositions[i * 3] = baseX[i];
      particlePositions[i * 3 + 1] = baseY[i];
      particlePositions[i * 3 + 2] = -8.8 + random() * 19;
      speeds[i] = 1.5 + random() * 4.5;
    }
    var particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    var particleMaterial = new THREE.PointsMaterial({
      color: 0xe8e4f2,
      size: 0.055,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    var warpParticles = new THREE.Points(particleGeometry, particleMaterial);
    warpParticles.userData.baseX = baseX;
    warpParticles.userData.baseY = baseY;
    warpParticles.userData.speeds = speeds;
    group.add(warpParticles);

    var veil = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 38),
      new THREE.MeshStandardMaterial({
        color: 0x100917,
        roughness: 0.98,
        metalness: 0
      })
    );
    veil.rotation.x = -Math.PI / 2;
    veil.position.y = -1.15;
    group.add(veil);

    group.userData.update = function (time, delta) {
      mouth.scale.y = 1 + Math.sin(time * 0.72) * 0.045;
      rings.forEach(function (ring, index) {
        ring.rotation.z += delta * (index % 2 === 0 ? 0.07 : -0.09);
        var pulse = 1 + Math.sin(time * (0.7 + index * 0.12) + index) * 0.018;
        ring.scale.x = pulse;
      });
      rails.rotation.z = Math.sin(time * 0.13) * 0.025;
      var attribute = particleGeometry.attributes.position;
      for (var n = 0; n < count; n += 1) {
        var particleZ = attribute.getZ(n) - speeds[n] * delta;
        if (particleZ < -8.8) particleZ = 10.2;
        var progress = THREE.MathUtils.clamp((10.2 - particleZ) / 19, 0, 1);
        attribute.setXYZ(
          n,
          baseX[n] * Math.pow(1 - progress * 0.94, 1.65),
          0.95 + (baseY[n] - 0.95) * (1 - progress * 0.84),
          particleZ
        );
      }
      attribute.needsUpdate = true;
    };
    return group;
  }

  function updateCopy(index) {
    var copy = CHAPTER_COPY[index];
    document.body.setAttribute('data-living-scene', copy.id);
    document.getElementById('living-chapter').textContent = copy.chapter;
    document.getElementById('living-scene-title').textContent = copy.title;
    document.getElementById('living-scene-description').textContent = copy.description;
    document.getElementById('living-motif-copy').textContent = copy.motifs;
    document.querySelectorAll('.living-scene-button').forEach(function (button) {
      var active = button.getAttribute('data-scene') === copy.id;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setChapter(index, updateHash) {
    if (!chapters.length) {
      currentChapter = index;
      updateCopy(index);
      return;
    }
    currentChapter = (index + chapters.length) % chapters.length;
    chapters.forEach(function (chapter, chapterIndex) {
      chapter.visible = chapterIndex === currentChapter;
    });
    var copy = CHAPTER_COPY[currentChapter];
    scene.background.setHex(copy.background);
    scene.fog.color.setHex(copy.fog);
    starfield.material.uniforms.uColor.value.setHex(copy.accent);
    keyLight.color.setHex(copy.accent);
    rimLight.color.setHex(currentChapter === 2 ? 0x6e5aa6 : 0xc9a86a);
    cameraHome.set(copy.camera[0], copy.camera[1], copy.camera[2]);
    lookHome.set(copy.target[0], copy.target[1], copy.target[2]);
    orbit.yaw = 0;
    orbit.pitch = 0;
    updateCopy(currentChapter);
    if (updateHash && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + copy.id);
    }
  }

  function updateMotionButton() {
    var button = document.getElementById('living-motion');
    button.setAttribute('aria-pressed', motionEnabled ? 'true' : 'false');
    button.innerHTML = '<span aria-hidden="true">' + (motionEnabled ? '◉' : '○') + '</span> Motion ' + (motionEnabled ? 'on' : 'paused');
  }

  function showFallback(message) {
    var fallback = document.getElementById('living-fallback');
    var fallbackCopy = document.getElementById('living-fallback-copy');
    fallback.hidden = false;
    if (message) fallbackCopy.textContent = message;
    document.getElementById('living-runtime-copy').textContent = 'Illustrated field note · renderer unavailable';
  }

  function bindInterface() {
    document.querySelectorAll('.living-scene-button').forEach(function (button, index) {
      button.addEventListener('click', function () {
        setChapter(index, true);
      });
    });

    document.getElementById('living-motion').addEventListener('click', function () {
      motionEnabled = !motionEnabled;
      updateMotionButton();
    });

    window.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') setChapter(currentChapter + 1, true);
      if (event.key === 'ArrowLeft') setChapter(currentChapter - 1, true);
      if (event.key === '1' || event.key === '2' || event.key === '3') {
        setChapter(Number(event.key) - 1, true);
      }
      if (event.key === ' ' && event.target === document.body) {
        event.preventDefault();
        motionEnabled = !motionEnabled;
        updateMotionButton();
      }
    });
  }

  function bindCanvasInteraction() {
    var canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Interactive Melodia procedural landscape. Drag to orbit.');

    canvas.addEventListener('pointerdown', function (event) {
      orbit.dragging = true;
      orbit.x = event.clientX;
      orbit.y = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', function (event) {
      var rect = canvas.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointer.targetY = -((event.clientY - rect.top) / rect.height * 2 - 1);
      if (orbit.dragging) {
        orbit.yaw -= (event.clientX - orbit.x) * 0.0042;
        orbit.pitch -= (event.clientY - orbit.y) * 0.0035;
        orbit.pitch = THREE.MathUtils.clamp(orbit.pitch, -0.34, 0.34);
        orbit.yaw = THREE.MathUtils.clamp(orbit.yaw, -0.62, 0.62);
        orbit.x = event.clientX;
        orbit.y = event.clientY;
      }
    });
    canvas.addEventListener('pointerup', function (event) {
      orbit.dragging = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointercancel', function () {
      orbit.dragging = false;
    });
    canvas.addEventListener('dblclick', function () {
      orbit.yaw = 0;
      orbit.pitch = 0;
    });
    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      showFallback('The WebGL context was lost. Reload the page to wake the landscape again.');
    });
  }

  function resize() {
    if (!renderer || !camera || !canvasRoot) return;
    var width = Math.max(1, canvasRoot.clientWidth);
    var height = Math.max(1, canvasRoot.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function animate(now) {
    animationFrame = window.requestAnimationFrame(animate);
    if (document.hidden) return;
    var delta = Math.min(clock.getDelta(), 0.05);
    if (motionEnabled) elapsed += delta;
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;
    var active = chapters[currentChapter];
    if (active && active.userData.update) {
      active.userData.update(elapsed, motionEnabled ? delta : 0, pointer);
    }
    if (motionEnabled) {
      starfield.rotation.y += delta * 0.004;
      starfield.rotation.x = Math.sin(elapsed * 0.04) * 0.025;
    }

    var offset = cameraHome.clone().sub(lookHome);
    var spherical = new THREE.Spherical().setFromVector3(offset);
    spherical.theta += orbit.yaw + pointer.x * 0.055;
    spherical.phi += orbit.pitch - pointer.y * 0.028;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.42, Math.PI - 0.42);
    desiredCamera.setFromSpherical(spherical).add(lookHome);
    camera.position.lerp(desiredCamera, 0.052);
    lookCurrent.lerp(lookHome, 0.06);
    camera.lookAt(lookCurrent);
    renderer.render(scene, camera);

    frameCount += 1;
    if (!fpsStarted) fpsStarted = now;
    if (now - fpsStarted > 1200) {
      var fps = Math.round(frameCount * 1000 / (now - fpsStarted));
      var ratio = Math.min(window.devicePixelRatio || 1, 1.6).toFixed(1);
      document.getElementById('living-runtime-copy').textContent = 'WebGL · ' + fps + ' fps · ' + ratio + 'x · three procedural realms';
      frameCount = 0;
      fpsStarted = now;
    }
  }

  function initThree() {
    THREE = window.THREE;
    if (!THREE || !window.WebGLRenderingContext) {
      showFallback('This browser cannot start the real-time WebGL study. The illustrated field note remains available.');
      return;
    }

    try {
      canvasRoot = document.getElementById('living-canvas');
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.physicallyCorrectLights = true;
      canvasRoot.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(CHAPTER_COPY[1].background);
      scene.fog = new THREE.FogExp2(CHAPTER_COPY[1].fog, 0.028);
      camera = new THREE.PerspectiveCamera(48, 1, 0.08, 120);
      camera.position.set(0, 1.8, 9.8);
      cameraHome = new THREE.Vector3(0, 1.8, 9.8);
      lookHome = new THREE.Vector3(0, 1.55, -4.5);
      lookCurrent = lookHome.clone();
      desiredCamera = camera.position.clone();
      clock = new THREE.Clock();

      ambientLight = new THREE.HemisphereLight(0xc2bae0, 0x101424, 2.35);
      keyLight = new THREE.DirectionalLight(CHAPTER_COPY[1].accent, 3.2);
      keyLight.position.set(-4, 8, 6);
      rimLight = new THREE.PointLight(0xc9a86a, 12, 34, 2);
      rimLight.position.set(5, 4, -2);
      scene.add(ambientLight, keyLight, rimLight);

      starfield = makeStarfield();
      scene.add(starfield);
      chapters = [buildSeaAbove(), buildFarawayMother(), buildHorizonEater()];
      chapters.forEach(function (chapter) {
        chapter.visible = false;
        scene.add(chapter);
      });

      var hash = window.location.hash.replace('#', '');
      var hashIndex = CHAPTER_COPY.findIndex(function (chapter) {
        return chapter.id === hash;
      });
      setChapter(hashIndex >= 0 ? hashIndex : 1, false);
      bindCanvasInteraction();
      resize();
      window.addEventListener('resize', resize, { passive: true });
      shell.classList.add('is-ready');
      document.getElementById('living-runtime-copy').textContent = 'WebGL · waking the landscape';
      animationFrame = window.requestAnimationFrame(animate);
    } catch (error) {
      window.cancelAnimationFrame(animationFrame);
      showFallback('The real-time renderer encountered an error. The illustrated field note remains available.');
      if (window.console && window.console.error) window.console.error('Melodia Living Worlds:', error);
    }
  }

  function boot() {
    shell = document.querySelector('.living-shell');
    reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    motionEnabled = !reducedMotion;
    if (window.MelodiaEditorial && typeof window.MelodiaEditorial.init === 'function') {
      window.MelodiaEditorial.init({ page: 'melodia-living-worlds' });
    }
    bindInterface();
    updateMotionButton();
    updateCopy(1);
    initThree();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window, document);
