/**
 * MELODIA — Star System Component
 * Standalone animated star field with multiple animation types
 * Version: 1.0
 * 
 * Usage:
 * const starSystem = new MelodiaStarSystem(container, config);
 * starSystem.init();
 */

class MelodiaStarSystem {
  
  constructor(container, config = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.config = this.mergeDefaults(config);
    this.stars = [];
    this.gstars = [];
    this.isInitialized = false;
  }
  
  mergeDefaults(config) {
    const defaults = {
      // Star counts
      starCount: 70,
      gstarCount: 8,
      
      // Animation chances (0-1)
      twinkleChance: 0.3,
      floatChance: 0.2,
      pulseChance: 0.15,
      rotateChance: 0.5,
      
      // Size ranges
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
      
      // Positioning
      positionType: 'percentage', // 'percentage' or 'pixels'
      bounds: { width: 100, height: 100 }, // for pixel positioning
      
      // Parallax
      enableParallax: false,
      parallaxStrength: 0.03,
      
      // Performance
      reduceMotion: false,
      seed: 42
    };
    
    return { ...defaults, ...config };
  }
  
  init() {
    if (this.isInitialized) {
      this.destroy();
    }
    
    // Check for reduced motion preference
    if (MelodiaUtils.prefersReducedMotion()) {
      this.config.reduceMotion = true;
    }
    
    this.createStars();
    this.createGStars();
    
    if (this.config.enableParallax && !this.config.reduceMotion) {
      this.setupParallax();
    }
    
    this.isInitialized = true;
    return this;
  }
  
  createStars() {
    const rng = MelodiaUtils.rng(this.config.seed);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.starCount; i++) {
      const star = this.createStar(rng, i);
      this.stars.push(star);
      fragment.appendChild(star.element);
    }
    
    this.container.appendChild(fragment);
  }
  
  createStar(rng, index) {
    const x = rng() * 100;
    const y = rng() * 100;
    const size = MelodiaUtils.randomRange(
      this.config.starSizeRange.min, 
      this.config.starSizeRange.max
    );
    const opacity = MelodiaUtils.randomRange(0.25, 0.65);
    const parallaxDepth = (rng() * 2 - 1).toFixed(2);
    
    const star = document.createElement('div');
    star.className = 'melodia-star';
    star.style.cssText = `
      position: absolute;
      background: ${this.config.starColor};
      border-radius: 50%;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      opacity: ${opacity};
    `;
    
    // Add animation if not reduced motion
    if (!this.config.reduceMotion) {
      const animType = this.selectAnimationType(rng);
      if (animType) {
        star.classList.add(`melodia-star-${animType}`);
        const duration = this.getAnimationDuration(animType);
        star.style.setProperty(`--${animType}-duration`, `${duration}s`);
      }
    }
    
    // Add parallax data
    star.dataset.depth = parallaxDepth;
    star.dataset.index = index;
    
    return {
      element: star,
      x, y, size, opacity,
      parallaxDepth: parseFloat(parallaxDepth),
      animationType: this.selectAnimationType(rng)
    };
  }
  
  createGStars() {
    const rng = MelodiaUtils.rng(this.config.seed + 100);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.gstarCount; i++) {
      const gstar = this.createGStar(rng, i);
      this.gstars.push(gstar);
      fragment.appendChild(gstar.element);
    }
    
    this.container.appendChild(fragment);
  }
  
  createGStar(rng, index) {
    const x = MelodiaUtils.randomRange(55, 95);
    const y = MelodiaUtils.randomRange(10, 80);
    const parallaxDepth = (rng() * 2 - 1).toFixed(2);
    
    const gstar = document.createElement('div');
    gstar.className = 'melodia-gstar';
    gstar.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      opacity: 0.85;
    `;
    
    // Add SVG star
    gstar.innerHTML = MelodiaUtils.createFourStar(
      this.config.gstarSize, 
      this.config.gstarColor
    );
    
    // Add rotation animation if not reduced motion
    if (!this.config.reduceMotion && Math.random() < this.config.rotateChance) {
      gstar.classList.add('melodia-star-rotate');
      const duration = MelodiaUtils.randomRange(
        this.config.rotateDuration.min,
        this.config.rotateDuration.max
      );
      gstar.style.setProperty('--rotate-duration', `${duration}s`);
    }
    
    // Add parallax data
    gstar.dataset.depth = parallaxDepth;
    gstar.dataset.index = index;
    
    return {
      element: gstar,
      x, y,
      parallaxDepth: parseFloat(parallaxDepth)
    };
  }
  
  selectAnimationType(rng) {
    const rand = rng();
    if (rand < this.config.twinkleChance) return 'twinkle';
    if (rand < this.config.twinkleChance + this.config.floatChance) return 'float';
    if (rand < this.config.twinkleChance + this.config.floatChance + this.config.pulseChance) return 'pulse';
    return null;
  }
  
  getAnimationDuration(type) {
    const range = this.config[`${type}Duration`] || { min: 2, max: 4 };
    return MelodiaUtils.randomRange(range.min, range.max).toFixed(1);
  }
  
  setupParallax() {
    this.parallaxHandler = this.handleParallax.bind(this);
    this.container.addEventListener('mousemove', this.parallaxHandler);
    this.container.addEventListener('mouseleave', this.handleParallaxEnd.bind(this));
  }
  
  handleParallax(e) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    
    // Move regular stars
    this.stars.forEach(star => {
      const moveX = mouseX * star.parallaxDepth * this.config.parallaxStrength * 100;
      const moveY = mouseY * star.parallaxDepth * this.config.parallaxStrength * 100;
      star.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
    
    // Move gold stars
    this.gstars.forEach(gstar => {
      const moveX = mouseX * gstar.parallaxDepth * this.config.parallaxStrength * 100;
      const moveY = mouseY * gstar.parallaxDepth * this.config.parallaxStrength * 100;
      gstar.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }
  
  handleParallaxEnd() {
    this.stars.forEach(star => {
      star.element.style.transform = 'translate(0, 0)';
    });
    this.gstars.forEach(gstar => {
      gstar.element.style.transform = 'translate(0, 0)';
    });
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setStarCount(count) {
    this.config.starCount = count;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setGStarCount(count) {
    this.config.gstarCount = count;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setColors(starColor, gstarColor) {
    this.config.starColor = starColor;
    this.config.gstarColor = gstarColor;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  enableParallax(enabled = true) {
    this.config.enableParallax = enabled;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  destroy() {
    // Remove event listeners
    if (this.parallaxHandler) {
      this.container.removeEventListener('mousemove', this.parallaxHandler);
      this.container.removeEventListener('mouseleave', this.handleParallaxEnd.bind(this));
    }
    
    // Remove all star elements
    this.stars.forEach(star => {
      if (star.element && star.element.parentNode) {
        star.element.parentNode.removeChild(star.element);
      }
    });
    
    this.gstars.forEach(gstar => {
      if (gstar.element && gstar.element.parentNode) {
        gstar.element.parentNode.removeChild(gstar.element);
      }
    });
    
    this.stars = [];
    this.gstars = [];
    this.isInitialized = false;
  }
  
  getStarElements() {
    return this.stars.map(s => s.element);
  }
  
  getGStarElements() {
    return this.gstars.map(s => s.element);
  }
  
  getAllElements() {
    return [...this.getStarElements(), ...this.getGStarElements()];
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MelodiaStarSystem = MelodiaStarSystem;
}