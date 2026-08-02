/**
 * MELODIA — Configuration Template
 * Central configuration for all Melodia components
 * Copy this file and customize for your project
 * Version: 1.0
 */

const MelodiaConfig = {
  
  // ============================================
  // GLOBAL SETTINGS
  // ============================================
  global: {
    // Performance
    reduceMotion: false, // Respects user preferences when true
    enableDebug: false,  // Enable console logging
    
    // Colors
    colors: {
      gold: '#C9A86A',
      goldLight: '#DDC79B',
      goldDark: '#A7884E',
      plum: '#241B2E',
      ivory: '#F7F4EF',
      astral: '#141A30',
      lavender: '#9F94C6',
      sakura: '#E7C9CE',
      white: '#ffffff'
    },
    
    // Fonts
    fonts: {
      display: 'Fraunces',
      body: 'Inter',
      mono: 'IBM Plex Mono',
      cover: 'Cinzel'
    }
  },
  
  // ============================================
  // STAR SYSTEM CONFIGURATION
  // ============================================
  stars: {
    // Counts
    starCount: 70,
    gstarCount: 8,
    
    // Animation probabilities (0-1)
    twinkleChance: 0.3,
    floatChance: 0.2,
    pulseChance: 0.15,
    rotateChance: 0.5,
    
    // Size settings
    starSizeRange: { min: 0.8, max: 1.6 },
    gstarSize: 9,
    
    // Animation durations (seconds)
    twinkleDuration: { min: 2, max: 5 },
    floatDuration: { min: 3, max: 6 },
    pulseDuration: { min: 1.5, max: 3 },
    rotateDuration: { min: 15, max: 30 },
    
    // Colors
    starColor: '#ffffff',
    gstarColor: '#C9A86A',
    
    // Parallax
    enableParallax: true,
    parallaxStrength: 0.03,
    
    // Performance
    seed: 42
  },
  
  // ============================================
  // PARALLAX SYSTEM CONFIGURATION
  // ============================================
  parallax: {
    // Strength
    strength: 0.03,
    
    // Input types
    enableMouse: true,
    enableTouch: true,
    enableScroll: false,
    
    // Smoothing
    smoothing: 0.1,
    damping: 0.95,
    
    // Performance
    throttleMs: 16,
    
    // Boundaries
    boundary: 'container' // 'container' or 'viewport'
  },
  
  // ============================================
  // AURORA EFFECT CONFIGURATION
  // ============================================
  aurora: {
    // Aurora settings
    auroraCount: 3,
    auroraIntensity: 0.6,
    auroraSpeed: 1.0,
    auroraColors: [
      'rgba(110,90,166,0.4)',
      'rgba(60,92,158,0.3)',
      'rgba(156,148,198,0.3)'
    ],
    
    // Particle settings
    particleCount: 50,
    particleSizeRange: { min: 1, max: 3 },
    particleSpeed: { min: 6, max: 12 },
    particleColor: 'rgba(201,168,106,0.8)',
    
    // Positioning
    auroraSizeRange: { min: 30, max: 60 },
    
    // Performance
    seed: 789
  },
  
  // ============================================
  // COSMIC EFFECT CONFIGURATION
  // ============================================
  cosmic: {
    // Galaxy settings
    enableGalaxy: true,
    galaxySize: 600,
    galaxyRotationSpeed: 60,
    galaxyArmCount: 4,
    galaxyCoreSize: 200,
    galaxyColors: {
      core: 'rgba(201,168,106,0.3)',
      arms: 'rgba(156,148,198,0.4)'
    },
    
    // Nebula settings
    nebulaCount: 3,
    nebulaColors: [
      'rgba(110,90,166,0.4)',
      'rgba(60,92,158,0.3)',
      'rgba(156,148,198,0.3)'
    ],
    nebulaSizeRange: { min: 30, max: 50 },
    nebulaDriftSpeed: { min: 15, max: 25 },
    
    // Shooting star settings
    shootingStarCount: 2,
    shootingStarInterval: 4000,
    shootingStarDuration: { min: 2, max: 4 },
    shootingStarColor: 'rgba(255,255,255,0.8)',
    
    // Cosmic dust settings
    dustCount: 40,
    dustSize: 1,
    dustDuration: { min: 8, max: 15 },
    dustColor: 'rgba(201,168,106,0.6)',
    
    // Positioning
    galaxyPosition: { x: 50, y: 50 },
    
    // Performance
    seed: 321
  },
  
  // ============================================
  // CONTENT-THEMED PRESETS
  // ============================================
  presets: {
    // Environment preset
    environment: {
      stars: {
        starCount: 70,
        gstarCount: 8,
        starColor: '#ffffff',
        gstarColor: '#C9A86A'
      },
      aurora: {
        auroraColors: [
          'rgba(110,90,166,0.4)',
          'rgba(60,92,158,0.3)',
          'rgba(156,148,198,0.3)'
        ]
      }
    },
    
    // Character preset
    character: {
      stars: {
        starCount: 60,
        gstarCount: 6,
        starColor: '#ffffff',
        gstarColor: '#9F94C6'
      },
      aurora: {
        auroraColors: [
          'rgba(156,148,198,0.5)',
          'rgba(110,90,166,0.4)',
          'rgba(169,154,198,0.3)'
        ]
      }
    },
    
    // Prop preset
    prop: {
      stars: {
        starCount: 50,
        gstarCount: 5,
        starColor: '#ffffff',
        gstarColor: '#8AA9D6'
      },
      aurora: {
        auroraColors: [
          'rgba(60,92,158,0.4)',
          'rgba(138,169,214,0.3)',
          'rgba(110,90,166,0.3)'
        ]
      }
    },
    
    // Abstract preset
    abstract: {
      stars: {
        starCount: 80,
        gstarCount: 10,
        starColor: '#ffffff',
        gstarColor: '#D6A9B0'
      },
      aurora: {
        auroraColors: [
          'rgba(214,169,176,0.4)',
          'rgba(156,148,198,0.3)',
          'rgba(201,168,106,0.3)'
        ]
      }
    }
  },
  
  // ============================================
  // PERFORMANCE PRESETS
  // ============================================
  performance: {
    // High performance (minimal effects)
    high: {
      stars: {
        starCount: 20,
        gstarCount: 3,
        twinkleChance: 0.05,
        floatChance: 0.02,
        pulseChance: 0.02,
        enableParallax: false
      },
      aurora: {
        auroraCount: 1,
        auroraIntensity: 0.3,
        particleCount: 10
      },
      cosmic: {
        enableGalaxy: false,
        nebulaCount: 1,
        shootingStarCount: 0,
        dustCount: 10
      }
    },
    
    // Balanced (default)
    balanced: {
      // Uses default values
    },
    
    // High quality (maximum effects)
    highQuality: {
      stars: {
        starCount: 100,
        gstarCount: 12,
        twinkleChance: 0.5,
        floatChance: 0.3,
        pulseChance: 0.25,
        enableParallax: true,
        parallaxStrength: 0.05
      },
      aurora: {
        auroraCount: 4,
        auroraIntensity: 0.8,
        particleCount: 80
      },
      cosmic: {
        enableGalaxy: true,
        galaxySize: 800,
        nebulaCount: 4,
        shootingStarCount: 4,
        dustCount: 60
      }
    }
  },
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Get configuration for a specific preset
   * @param {string} presetName - Name of preset (environment, character, prop, abstract)
   * @returns {object} - Merged configuration
   */
  getPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) {
      console.warn(`Preset "${presetName}" not found, using defaults`);
      return {};
    }
    
    return this.deepMerge({}, preset);
  },
  
  /**
   * Get configuration for performance level
   * @param {string} level - Performance level (high, balanced, highQuality)
   * @returns {object} - Merged configuration
   */
  getPerformanceLevel(level) {
    const perfConfig = this.performance[level];
    if (!perfConfig) {
      console.warn(`Performance level "${level}" not found, using defaults`);
      return {};
    }
    
    return this.deepMerge({}, perfConfig);
  },
  
  /**
   * Get merged configuration with preset and performance level
   * @param {string} presetName - Content preset name
   * @param {string} performanceLevel - Performance level
   * @returns {object} - Fully merged configuration
   */
  getCombinedConfig(presetName, performanceLevel) {
    const preset = this.getPreset(presetName);
    const performance = this.getPerformanceLevel(performanceLevel);
    
    return this.deepMerge({}, performance, preset);
  },
  
  /**
   * Deep merge multiple objects
   * @param {object} target - Target object
   * @param {...object} sources - Source objects to merge
   * @returns {object} - Merged object
   */
  deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return this.deepMerge(target, ...sources);
  },
  
  /**
   * Check if value is object
   * @param {any} item - Item to check
   * @returns {boolean} - True if object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
};

// Make available globally
if (typeof window !== 'undefined') {
  window.MelodiaConfig = MelodiaConfig;
}