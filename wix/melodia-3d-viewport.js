/**
 * MELODIA INTERACTIVE 3D ASSET STUDY
 *
 * Browser WebGL viewport for inspecting geometric assets, approximate material response,
 * topology, and normal/ORM channels. Unreal Engine captures remain the visual authority;
 * this module is intentionally a lightweight presentation study rather than UE Substrate.
 */

(function (window, document) {
  'use strict';

  // --- Asset Catalog Manifest ---
  var ASSET_CATALOG = {
    'fabric-sphere': {
      name: 'PBR Fabric Lookdev Sphere',
      category: 'Fabrics & Lookdev',
      type: 'obj',
      path: 'models/SM_Fabric_Sphere.obj',
      defaultFabric: 'RoyalVelvet',
      scale: 1.0,
      rotSpeed: 0.005,
      polyCount: '4,608 Tris'
    },
    'fabric-drape': {
      name: 'Haute Couture Draped Swatch',
      category: 'Fabrics & Lookdev',
      type: 'obj',
      path: 'models/SM_Fabric_Cloth_Drape.obj',
      defaultFabric: 'GildedBrocade',
      scale: 1.0,
      rotSpeed: 0.003,
      polyCount: '3,200 Tris'
    },
    'treble-clef': {
      name: 'Melodia Treble Clef Ornament',
      category: 'Kitbash & Ornaments',
      type: 'obj',
      path: 'models/SM_Orn_TrebleClef.obj',
      defaultFabric: 'GoldEmbroidery',
      scale: 1.1,
      rotSpeed: 0.008,
      polyCount: '2,528 Tris'
    },
    'torus-knot': {
      name: 'Harmonic Torus Knot',
      category: 'Kitbash & Ornaments',
      type: 'obj',
      path: 'models/SM_Orn_TorusKnot.obj',
      defaultFabric: 'CelestialWeave',
      scale: 0.85,
      rotSpeed: 0.006,
      polyCount: '7,680 Tris'
    },
    'melody-token': {
      name: 'Sacred Water Melody Token',
      category: 'Kitbash & Ornaments',
      type: 'obj',
      path: 'models/SM_Orn_MelodyToken_Water.obj',
      defaultFabric: 'GildedBrocade',
      scale: 1.2,
      rotSpeed: 0.007,
      polyCount: '192 Tris'
    },
    'grand-piano': {
      name: 'Atelier Grand Piano',
      category: 'Interactive Instruments',
      type: 'glb',
      path: 'models/grand_piano.glb',
      scale: 0.015,
      rotSpeed: 0.004,
      polyCount: '21,558 Tris'
    },
    'violin': {
      name: 'Resonance Violin',
      category: 'Interactive Instruments',
      type: 'obj',
      path: 'models/violin.obj',
      defaultFabric: 'GildedBrocade',
      scale: 2.2,
      rotSpeed: 0.006,
      polyCount: '8 Tris'
    },
    'cello': {
      name: 'Cathedral Cello',
      category: 'Interactive Instruments',
      type: 'obj',
      path: 'models/cello.obj',
      defaultFabric: 'GildedBrocade',
      scale: 1.8,
      rotSpeed: 0.006,
      polyCount: '8 Tris'
    },
    'stone-pillar': {
      name: 'Cathedral Stone Pillar',
      category: 'Architecture & Props',
      type: 'glb',
      path: 'models/pillar_stone.glb',
      scale: 1.2,
      rotSpeed: 0.005,
      polyCount: '124 Tris'
    },
    'fountain': {
      name: 'Grotto Stone Fountain',
      category: 'Architecture & Props',
      type: 'glb',
      path: 'models/fountain_round.glb',
      scale: 1.0,
      rotSpeed: 0.004,
      polyCount: '1,002 Tris'
    },
    'melusina-shirt': {
      name: 'Melusina (Production Wardrobe)',
      category: 'Characters & Companions',
      type: 'fbx',
      path: 'models/SK_Melusina_Clothes_Production.fbx',
      defaultFabric: 'MelusinaShirt',
      scale: 0.015,
      rotSpeed: 0.005,
      polyCount: '334,712 Tris'
    },
    'melusina-hero': {
      name: 'Melusina (Full Production Rig & Wardrobe)',
      category: 'Characters & Companions',
      type: 'fbx',
      path: 'models/SK_Melusina_FullRig_Production.fbx',
      defaultFabric: 'MelusinaShirt',
      scale: 0.012,
      rotSpeed: 0.005,
      polyCount: '95,388 Tris'
    },
    'sir-melodious': {
      name: 'Sir Melodious (Full Clothed Production)',
      category: 'Characters & Companions',
      type: 'fbx',
      path: 'models/SK_SirMelodious_Clothed_Production.fbx',
      defaultFabric: 'GildedBrocade',
      scale: 0.015,
      rotSpeed: 0.006,
      polyCount: '374,656 Tris'
    },
    'zundamon': {
      name: 'Zundamon (Companion NPC)',
      category: 'Characters & Companions',
      type: 'fbx',
      path: 'models/SK_Zundamon.fbx',
      defaultFabric: 'CelestialWeave',
      scale: 0.015,
      rotSpeed: 0.005,
      polyCount: '34,820 Tris'
    },
    'melody-token-water': {
      name: 'Sacred Water Melody Token (Production)',
      category: 'Sacred Ornaments',
      type: 'fbx',
      path: 'models/SM_MelodyToken_Water.fbx',
      defaultFabric: 'GildedBrocade',
      scale: 0.015,
      rotSpeed: 0.006,
      polyCount: '5,015,040 Tris'
    },
    'melody-token-star': {
      name: 'Astral Star Melody Token (Production)',
      category: 'Sacred Ornaments',
      type: 'fbx',
      path: 'models/SM_MelodyToken_Star.fbx',
      defaultFabric: 'GoldEmbroidery',
      scale: 0.015,
      rotSpeed: 0.006,
      polyCount: '4,278,450 Tris'
    },
    'prop-harp': {
      name: 'Cathedral Sacred Harp (Production)',
      category: 'Interactive Instruments',
      type: 'fbx',
      path: 'models/SM_PropHarp.fbx',
      defaultFabric: 'GildedBrocade',
      scale: 0.012,
      rotSpeed: 0.005,
      polyCount: '76,228 Tris'
    },
    'prop-fountain': {
      name: 'Atlantis Classical Fountain (Production)',
      category: 'Architecture & Props',
      type: 'fbx',
      path: 'models/SM_PropFountain.fbx',
      defaultFabric: 'RoyalVelvet',
      scale: 0.012,
      rotSpeed: 0.004,
      polyCount: '31,332 Tris'
    },
    'prop-trident': {
      name: 'Triton Sacred Trident (Production)',
      category: 'Architecture & Props',
      type: 'fbx',
      path: 'models/SM_PropTrident.fbx',
      defaultFabric: 'GoldEmbroidery',
      scale: 0.015,
      rotSpeed: 0.006,
      polyCount: '14,448 Tris'
    }
  };

  // --- PBR Texture Sets Manifest ---
  var FABRIC_SETS = {
    'RoyalVelvet': {
      name: 'Royal Velvet (Micro-Fiber Sheen)',
      bc: 'textures/pbr/T_Fabric_RoyalVelvet_BC.png',
      orm: 'textures/pbr/T_Fabric_RoyalVelvet_ORM.png',
      n: 'textures/pbr/T_Fabric_RoyalVelvet_N.png',
      sheen: 'textures/pbr/T_Fabric_RoyalVelvet_Sheen.png',
      roughnessMult: 0.85,
      metalMult: 0.0,
      sheenColor: '#E8A9A1'
    },
    'GildedBrocade': {
      name: 'Gilded Jacquard & Brocade',
      bc: 'textures/pbr/T_Fabric_GildedBrocade_BC.png',
      orm: 'textures/pbr/T_Fabric_GildedBrocade_ORM.png',
      n: 'textures/pbr/T_Fabric_GildedBrocade_N.png',
      roughnessMult: 0.35,
      metalMult: 0.85,
      sheenColor: '#FFDF9E'
    },
    'SheerSilk': {
      name: 'Sheer Silk & Chiffon',
      bc: 'textures/pbr/T_Fabric_SheerSilk_BC.png',
      orm: 'textures/pbr/T_Fabric_SheerSilk_ORM.png',
      n: 'textures/pbr/T_Fabric_SheerSilk_N.png',
      sheen: 'textures/pbr/T_Fabric_SheerSilk_Sheen.png',
      roughnessMult: 0.25,
      metalMult: 0.05,
      sheenColor: '#E3D7FF'
    },
    'BaroqueLace': {
      name: 'Baroque Filigree Lace',
      bc: 'textures/pbr/T_Fabric_BaroqueLace_BC.png',
      orm: 'textures/pbr/T_Fabric_BaroqueLace_ORM.png',
      n: 'textures/pbr/T_Fabric_BaroqueLace_N.png',
      roughnessMult: 0.65,
      metalMult: 0.0,
      sheenColor: '#FFFFFF'
    },
    'GoldEmbroidery': {
      name: 'Gold-Threaded Bullion Embroidery',
      bc: 'textures/pbr/T_Fabric_GoldEmbroidery_BC.png',
      orm: 'textures/pbr/T_Fabric_GoldEmbroidery_ORM.png',
      n: 'textures/pbr/T_Fabric_GoldEmbroidery_N.png',
      roughnessMult: 0.45,
      metalMult: 0.9,
      sheenColor: '#FFE08A'
    },
    'CelestialWeave': {
      name: 'Iridescent Celestial Astral Weave',
      bc: 'textures/pbr/T_Fabric_CelestialWeave_BC.png',
      orm: 'textures/pbr/T_Fabric_CelestialWeave_ORM.png',
      n: 'textures/pbr/T_Fabric_CelestialWeave_N.png',
      roughnessMult: 0.2,
      metalMult: 0.3,
      sheenColor: '#66D9FF'
    },
    'MelusinaShirt': {
      name: 'Melusina Hero Shirt Silk',
      bc: 'textures/pbr/T_Melusina_Shirt_BC.png',
      orm: 'textures/pbr/T_Melusina_Shirt_ORM.png',
      n: 'textures/pbr/T_Melusina_Shirt_N.png',
      roughnessMult: 0.5,
      metalMult: 0.1,
      sheenColor: '#FFF0F5'
    }
  };

  // --- Realtime 3D Engine Class ---
  function Melodia3DViewer(containerId, options) {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!this.container) return;

    this.options = options || {};
    this.currentAssetKey = this.options.initialAsset || 'fabric-sphere';
    this.currentFabricKey = this.options.initialFabric || 'RoyalVelvet';
    this.renderMode = this.options.initialMode || 'pbr';
    this.reducedMotion = Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.isAutoRotate = this.options.autoRotate !== false && !this.reducedMotion;
    this.rotSpeed = 0.005;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentMeshGroup = null;
    this.pedestalGroup = null;
    this.lights = {};
    this.textureCache = {};
    this.loadedModels = {};

    this.init();
  }

  Melodia3DViewer.prototype.init = function () {
    var self = this;
    if (typeof THREE === 'undefined') {
      this.loadThreeLibraries(function () {
        self.setupScene();
      });
    } else {
      this.setupScene();
    }
  };

  Melodia3DViewer.prototype.showUnavailable = function (message) {
    if (!this.container) return;
    this.container.innerHTML =
      '<div class="viewer-unavailable" role="status">' +
      '<div><strong>Interactive preview unavailable.</strong>' +
      '<span>' + (message || 'The browser could not start the WebGL asset study.') + '</span></div>' +
      '</div>';
  };

  Melodia3DViewer.prototype.loadThreeLibraries = function (callback) {
    var self = this;
    var libraries = [
      [
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
        'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js'
      ],
      [
        'https://cdn.jsdelivr.net/npm/fflate@0.8.0/umd/index.js',
        'https://unpkg.com/fflate@0.8.0/umd/index.js'
      ],
      [
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
        'https://unpkg.com/three@0.128.0/examples/js/controls/OrbitControls.js'
      ],
      [
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/OBJLoader.js',
        'https://unpkg.com/three@0.128.0/examples/js/loaders/OBJLoader.js'
      ],
      [
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
        'https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js'
      ],
      [
        'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js',
        'https://unpkg.com/three@0.128.0/examples/js/loaders/FBXLoader.js'
      ]
    ];

    function loadLibrary(index) {
      if (index >= libraries.length) {
        callback();
        return;
      }

      function trySource(sourceIndex) {
        if (sourceIndex >= libraries[index].length) {
          self.showUnavailable('A required 3D library was blocked or unavailable. The rest of the portfolio remains fully accessible.');
          return;
        }
        var script = document.createElement('script');
        script.src = libraries[index][sourceIndex];
        script.async = false;
        script.onload = function () { loadLibrary(index + 1); };
        script.onerror = function () { trySource(sourceIndex + 1); };
        document.head.appendChild(script);
      }

      trySource(0);
    }

    loadLibrary(0);
  };

  Melodia3DViewer.prototype.setupScene = function () {
    var self = this;
    var width = this.container.clientWidth || 800;
    var height = this.container.clientHeight || 600;

    if (!window.WebGLRenderingContext) {
      this.showUnavailable('WebGL is disabled in this browser. Use the rendered case studies for the authoritative project view.');
      return;
    }

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e22);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 1.2, 3.8);

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (error) {
      this.showUnavailable('The browser could not create a WebGL context. Use the rendered case studies for the authoritative project view.');
      return;
    }
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      self.showUnavailable('The WebGL context was lost. The rendered case studies remain available.');
    });

    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.15;
      this.controls.minDistance = 1.0;
      this.controls.maxDistance = 10.0;
      this.controls.addEventListener('start', function () {
        self.isAutoRotate = false;
      });
    }

    this.setupLighting();
    this.setupPedestal();
    this.loadAsset(this.currentAssetKey);

    window.addEventListener('resize', function () { self.onResize(); });
    this.animate();
  };

  Melodia3DViewer.prototype.setupLighting = function () {
    var ambient = new THREE.AmbientLight(0xfff5ea, 0.45);
    this.scene.add(ambient);
    this.lights.ambient = ambient;

    var keyLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    var fillLight = new THREE.DirectionalLight(0x99b3ff, 0.7);
    fillLight.position.set(-3, 2, -2);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    var rimLight = new THREE.DirectionalLight(0xe8a9a1, 1.2);
    rimLight.position.set(0, -2, -3);
    this.scene.add(rimLight);
    this.lights.rim = rimLight;

    var bounceLight = new THREE.PointLight(0x66d9ff, 0.8, 10);
    bounceLight.position.set(0, -1.2, 1.5);
    this.scene.add(bounceLight);
    this.lights.bounce = bounceLight;
  };

  Melodia3DViewer.prototype.setupPedestal = function () {
    this.pedestalGroup = new THREE.Group();

    var shadowPlaneGeo = new THREE.PlaneGeometry(16, 16);
    var shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.35 });
    var shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.75;
    shadowPlane.receiveShadow = true;
    this.pedestalGroup.add(shadowPlane);

    var ringGeo = new THREE.TorusGeometry(1.8, 0.025, 16, 64);
    var ringMat = new THREE.MeshStandardMaterial({
      color: 0xc9a86a,
      metalness: 0.9,
      roughness: 0.25,
      emissive: 0x33200a
    });
    var ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.73;
    this.pedestalGroup.add(ringMesh);

    var discGeo = new THREE.CylinderGeometry(1.78, 1.78, 0.05, 48);
    var discMat = new THREE.MeshStandardMaterial({
      color: 0x161224,
      roughness: 0.6,
      metalness: 0.3
    });
    var discMesh = new THREE.Mesh(discGeo, discMat);
    discMesh.position.y = -1.76;
    discMesh.receiveShadow = true;
    this.pedestalGroup.add(discMesh);

    this.scene.add(this.pedestalGroup);
  };

  Melodia3DViewer.prototype.getTexture = function (url) {
    if (!this.textureCache[url]) {
      var loader = new THREE.TextureLoader();
      var tex = loader.load(url);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      this.textureCache[url] = tex;
    }
    return this.textureCache[url];
  };

  // Channel isolation for ORM inspection.
  //
  // A packed ORM map stores occlusion in R, roughness in G and metalness in B.
  // Rendering that texture through MeshBasicMaterial - which is what these three modes
  // used to do - shows all three channels at once and isolates nothing. `metallic` was
  // worse: a flat grey MeshBasicMaterial with no texture bound at all.
  //
  // This samples ONE channel and writes it out as greyscale, so the mode shows what its
  // label claims.
  Melodia3DViewer.prototype.createChannelMaterial = function (tex, channel) {
    var sample = 'texture2D(map, vUv).' + (channel === 'g' || channel === 'b' ? channel : 'r');
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: tex } },
      vertexShader: [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D map;',
        'varying vec2 vUv;',
        'void main() {',
        '  float v = ' + sample + ';',
        '  gl_FragColor = vec4(vec3(v), 1.0);',
        '}'
      ].join('\n'),
      side: THREE.DoubleSide
    });
  };

  // Flat fallback when a fabric has no ORM map: the mode cannot isolate a channel that
  // does not exist, so show a neutral value rather than a misleading texture.
  Melodia3DViewer.prototype.createFlatChannelMaterial = function (value) {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(value, value, value)
    });
  };

  Melodia3DViewer.prototype.createMaterialForMode = function (fabricKey, mode) {
    var f = FABRIC_SETS[fabricKey] || FABRIC_SETS['RoyalVelvet'];
    var bcTex = f.bc ? this.getTexture(f.bc) : null;
    var normTex = f.n ? this.getTexture(f.n) : null;
    var ormTex = f.orm ? this.getTexture(f.orm) : null;

    if (bcTex) bcTex.encoding = THREE.sRGBEncoding;

    switch (mode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({
          color: 0x66d9ff,
          wireframe: true
        });

      case 'normal':
        return new THREE.MeshNormalMaterial({
          normalMap: normTex,
          normalScale: new THREE.Vector2(1.0, 1.0)
        });

      // Packed ORM: R = occlusion, G = roughness, B = metalness.
      // Each mode now isolates exactly one channel. The fallback when a fabric has no ORM
      // map is a flat neutral value - never another channel's data, which is what the old
      // `ao` case did by falling back to the base-colour map.
      case 'roughness':
        return ormTex
          ? this.createChannelMaterial(ormTex, 'g')
          : this.createFlatChannelMaterial(0.5);

      case 'metallic':
        return ormTex
          ? this.createChannelMaterial(ormTex, 'b')
          : this.createFlatChannelMaterial(0.0);

      case 'ao':
        return ormTex
          ? this.createChannelMaterial(ormTex, 'r')
          : this.createFlatChannelMaterial(1.0);

      case 'clay':
        return new THREE.MeshStandardMaterial({
          color: 0xd6c4b2,
          roughness: 0.65,
          metalness: 0.05
        });

      case 'toon':
        return new THREE.MeshToonMaterial({
          map: bcTex,
          normalMap: normTex,
          color: 0xffffff,
          gradientMap: null
        });

      case 'pbr':
      default:
        return new THREE.MeshStandardMaterial({
          map: bcTex,
          normalMap: normTex,
          normalScale: new THREE.Vector2(1.0, 1.0),
          roughnessMap: ormTex,
          metalnessMap: ormTex,
          roughness: f.roughnessMult !== undefined ? f.roughnessMult : 0.5,
          metalness: f.metalMult !== undefined ? f.metalMult : 0.1,
          aoMap: ormTex,
          aoMapIntensity: 1.0,
          emissive: new THREE.Color(f.sheenColor || '#000000'),
          emissiveIntensity: 0.08
        });
    }
  };

  Melodia3DViewer.prototype.loadAsset = function (assetKey) {
    var self = this;
    var def = ASSET_CATALOG[assetKey];
    if (!def) return;

    this.currentAssetKey = assetKey;
    if (def.defaultFabric) {
      this.currentFabricKey = def.defaultFabric;
    }

    if (this.currentMeshGroup) {
      this.scene.remove(this.currentMeshGroup);
      this.currentMeshGroup = null;
    }

    var group = new THREE.Group();
    this.currentMeshGroup = group;
    this.scene.add(group);

    var onMeshReady = function (object3D, isFallback) {
      object3D.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material = self.createMaterialForMode(self.currentFabricKey, self.renderMode);
        }
      });

      var scale = def.scale || 1.0;
      object3D.scale.set(scale, scale, scale);

      var box = new THREE.Box3().setFromObject(object3D);
      var center = box.getCenter(new THREE.Vector3());

      // Center horizontally and ground bottom neatly on top of the lowered plate (y = -1.72)
      object3D.position.x = -center.x;
      object3D.position.z = -center.z;
      object3D.position.y = -box.min.y - 1.72;

      group.add(object3D);
      self.updateTelemetry(def, Boolean(isFallback));
    };

    if (def.type === 'obj') {
      if (THREE.OBJLoader) {
        var objLoader = new THREE.OBJLoader();
        objLoader.load(def.path, onMeshReady, null, function (err) {
          var fallbackGeo = new THREE.TorusKnotGeometry(0.8, 0.25, 64, 16);
          var fallbackMesh = new THREE.Mesh(fallbackGeo, self.createMaterialForMode(self.currentFabricKey, self.renderMode));
          onMeshReady(fallbackMesh, true);
        });
      }
    } else if (def.type === 'glb') {
      if (THREE.GLTFLoader) {
        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load(def.path, function (gltf) {
          onMeshReady(gltf.scene);
        }, null, function (err) {
          var fallbackGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
          var fallbackMesh = new THREE.Mesh(fallbackGeo, self.createMaterialForMode(self.currentFabricKey, self.renderMode));
          onMeshReady(fallbackMesh, true);
        });
      }
    } else if (def.type === 'fbx') {
      if (THREE.FBXLoader) {
        var fbxLoader = new THREE.FBXLoader();
        fbxLoader.load(def.path, function (fbx) {
          onMeshReady(fbx);
        }, null, function (err) {
          var fallbackGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 32);
          var fallbackMesh = new THREE.Mesh(fallbackGeo, self.createMaterialForMode(self.currentFabricKey, self.renderMode));
          onMeshReady(fallbackMesh, true);
        });
      }
    }
  };

  Melodia3DViewer.prototype.setRenderMode = function (mode) {
    var self = this;
    this.renderMode = mode;
    if (this.currentMeshGroup) {
      this.currentMeshGroup.traverse(function (child) {
        if (child.isMesh) {
          child.material = self.createMaterialForMode(self.currentFabricKey, mode);
        }
      });
    }
  };

  Melodia3DViewer.prototype.setFabric = function (fabricKey) {
    var self = this;
    this.currentFabricKey = fabricKey;
    if (this.currentMeshGroup) {
      this.currentMeshGroup.traverse(function (child) {
        if (child.isMesh) {
          child.material = self.createMaterialForMode(fabricKey, self.renderMode);
        }
      });
    }
    this.updateTelemetry(ASSET_CATALOG[this.currentAssetKey] || {});
  };

  Melodia3DViewer.prototype.updateTelemetry = function (def, isFallback) {
    var elTriangles = document.getElementById('viewer-triangles');
    var elAsset = document.getElementById('viewer-asset-name');
    var elFabric = document.getElementById('viewer-fabric-name');

    if (elTriangles) elTriangles.textContent = isFallback ? 'Fallback primitive' : (def.polyCount || 'Not listed');
    if (elAsset) elAsset.textContent = (def.name || 'Asset') + (isFallback ? ' · source preview unavailable' : '');
    if (elFabric) elFabric.textContent = (FABRIC_SETS[this.currentFabricKey] || {}).name || this.currentFabricKey;
  };

  Melodia3DViewer.prototype.onResize = function () {
    if (!this.container || !this.renderer || !this.camera) return;
    var w = this.container.clientWidth;
    var h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  Melodia3DViewer.prototype.animate = function () {
    var self = this;
    requestAnimationFrame(function () { self.animate(); });

    if (document.hidden) return;

    if (this.controls) {
      this.controls.update();
    }

    if (this.isAutoRotate && this.currentMeshGroup) {
      var speed = (ASSET_CATALOG[this.currentAssetKey] || {}).rotSpeed || this.rotSpeed;
      this.currentMeshGroup.rotation.y += speed;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  window.Melodia3DViewer = Melodia3DViewer;
  window.MELODIA_3D_CATALOG = ASSET_CATALOG;
  window.MELODIA_FABRICS = FABRIC_SETS;

})(window, document);
