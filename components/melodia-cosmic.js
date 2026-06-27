/**
 * MELODIA — Cosmic Effect Component
 * Standalone deep space effect with galaxy, nebulae, shooting stars, and cosmic dust
 * Version: 1.0
 * 
 * Usage:
 * const cosmic = new MelodiaCosmic(container, config);
 * cosmic.init();
 */

class MelodiaCosmic {
  
  constructor(container, config = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.config = this.mergeDefaults(config);
    this.galaxy = null;
    this.nebulae = [];
    this.shootingStars = [];
    this.cosmicDust = [];
    this.isInitialized = false;
  }
  
  mergeDefaults(config) {
    const defaults = {
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
      galaxyPosition: { x: 50, y: 50 }, // percentage center
      
      // Performance
      reduceMotion: false,
      seed: 321
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
    
    this.createCosmicContainer();
    
    if (this.config.enableGalaxy) {
      this.createGalaxy();
    }
    
    this.createNebulae();
    
    if (!this.config.reduceMotion) {
      this.createShootingStars();
      this.createCosmicDust();
    }
    
    this.isInitialized = true;
    return this;
  }
  
  createCosmicContainer() {
    this.cosmicContainer = document.createElement('div');
    this.cosmicContainer.className = 'melodia-cosmic-container';
    this.cosmicContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    `;
    this.container.appendChild(this.cosmicContainer);
  }
  
  createGalaxy() {
    const galaxyWrapper = document.createElement('div');
    galaxyWrapper.style.cssText = `
      position: absolute;
      top: ${this.config.galaxyPosition.y}%;
      left: ${this.config.galaxyPosition.x}%;
      transform: translate(-50%, -50%);
    `;
    
    const galaxy = document.createElement('div');
    galaxy.className = 'melodia-galaxy melodia-galaxy-rotate';
    galaxy.style.cssText = `
      width: ${this.config.galaxySize}px;
      height: ${this.config.galaxySize}px;
      border-radius: 50%;
      --galaxy-duration: ${this.config.galaxyRotationSpeed}s;
    `;
    
    // Create galaxy core
    const core = document.createElement('div');
    core.className = 'melodia-galaxy-core';
    core.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${this.config.galaxyCoreSize}px;
      height: ${this.config.galaxyCoreSize}px;
      background: radial-gradient(circle, ${this.config.galaxyColors.core} 0%, rgba(110,90,166,0.2) 40%, transparent 70%);
      border-radius: 50%;
    `;
    galaxy.appendChild(core);
    
    // Create galaxy arms
    for (let i = 0; i < this.config.galaxyArmCount; i++) {
      const arm = document.createElement('div');
      arm.className = 'melodia-galaxy-arm';
      arm.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${this.config.galaxyColors.arms}, transparent);
        transform-origin: 0 50%;
        transform: rotate(${(i / this.config.galaxyArmCount) * 360}deg);
      `;
      galaxy.appendChild(arm);
    }
    
    galaxyWrapper.appendChild(galaxy);
    this.cosmicContainer.appendChild(galaxyWrapper);
    
    this.galaxy = {
      wrapper: galaxyWrapper,
      element: galaxy,
      core
    };
  }
  
  createNebulae() {
    const rng = MelodiaUtils.rng(this.config.seed);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.nebulaCount; i++) {
      const nebula = this.createNebula(rng, i);
      this.nebulae.push(nebula);
      fragment.appendChild(nebula.element);
    }
    
    this.cosmicContainer.appendChild(fragment);
  }
  
  createNebula(rng, index) {
    const x = MelodiaUtils.randomRange(10, 90);
    const y = MelodiaUtils.randomRange(10, 90);
    const size = MelodiaUtils.randomRange(
      this.config.nebulaSizeRange.min,
      this.config.nebulaSizeRange.max
    );
    const color = this.config.nebulaColors[index % this.config.nebulaColors.length];
    const duration = MelodiaUtils.randomRange(
      this.config.nebulaDriftSpeed.min,
      this.config.nebulaDriftSpeed.max
    );
    
    const nebula = document.createElement('div');
    nebula.className = 'melodia-nebula melodia-nebula-drift';
    nebula.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}%;
      height: ${size}%;
      background: ${color};
      border-radius: 50%;
      filter: blur(60px);
      --nebula-duration: ${duration}s;
    `;
    
    return {
      element: nebula,
      x, y, size, color, duration
    };
  }
  
  createShootingStars() {
    const rng = MelodiaUtils.rng(this.config.seed + 100);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.shootingStarCount; i++) {
      const shootingStar = this.createShootingStar(rng, i);
      this.shootingStars.push(shootingStar);
      fragment.appendChild(shootingStar.element);
    }
    
    this.cosmicContainer.appendChild(fragment);
  }
  
  createShootingStar(rng, index) {
    const x = MelodiaUtils.randomRange(20, 80);
    const y = MelodiaUtils.randomRange(10, 50);
    const duration = MelodiaUtils.randomRange(
      this.config.shootingStarDuration.min,
      this.config.shootingStarDuration.max
    );
    const delay = (index * this.config.shootingStarInterval / 1000);
    
    const shootingStar = document.createElement('div');
    shootingStar.className = 'melodia-shooting-star melodia-shooting-star';
    shootingStar.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: 100px;
      height: 2px;
      background: linear-gradient(90deg, ${this.config.shootingStarColor}, transparent);
      --shoot-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    return {
      element: shootingStar,
      x, y, duration, delay
    };
  }
  
  createCosmicDust() {
    const rng = MelodiaUtils.rng(this.config.seed + 200);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.dustCount; i++) {
      const dust = this.createCosmicDustParticle(rng, i);
      this.cosmicDust.push(dust);
      fragment.appendChild(dust.element);
    }
    
    this.cosmicContainer.appendChild(fragment);
  }
  
  createCosmicDustParticle(rng, index) {
    const x = rng() * 100;
    const y = rng() * 100;
    const duration = MelodiaUtils.randomRange(
      this.config.dustDuration.min,
      this.config.dustDuration.max
    );
    const delay = rng() * 5;
    
    const dust = document.createElement('div');
    dust.className = 'melodia-cosmic-dust melodia-cosmic-dust';
    dust.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${this.config.dustSize}px;
      height: ${this.config.dustSize}px;
      background: ${this.config.dustColor};
      border-radius: 50%;
      --dust-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    return {
      element: dust,
      x, y, duration, delay
    };
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setGalaxySize(size) {
    this.config.galaxySize = size;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setGalaxyRotationSpeed(speed) {
    this.config.galaxyRotationSpeed = Math.max(1, speed);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setNebulaCount(count) {
    this.config.nebulaCount = Math.max(0, count);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setShootingStarCount(count) {
    this.config.shootingStarCount = Math.max(0, count);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setDustCount(count) {
    this.config.dustCount = Math.max(0, count);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setNebulaColors(colors) {
    this.config.nebulaColors = colors;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  addNebula(color, size, position) {
    const nebula = this.createNebula(MelodiaUtils.rng(Date.now()), this.nebulae.length);
    if (color) nebula.color = color;
    if (size) nebula.size = size;
    if (position) {
      nebula.x = position.x;
      nebula.y = position.y;
    }
    
    nebula.element.style.background = nebula.color;
    nebula.element.style.width = `${nebula.size}%`;
    nebula.element.style.height = `${nebula.size}%`;
    nebula.element.style.left = `${nebula.x}%`;
    nebula.element.style.top = `${nebula.y}%`;
    
    this.nebulae.push(nebula);
    this.cosmicContainer.appendChild(nebula.element);
    
    return this;
  }
  
  removeNebula(index) {
    if (index >= 0 && index < this.nebulae.length) {
      const nebula = this.nebulae[index];
      nebula.element.remove();
      this.nebulae.splice(index, 1);
    }
    return this;
  }
  
  pause() {
    if (this.galaxy) {
      this.galaxy.element.style.animationPlayState = 'paused';
    }
    this.nebulae.forEach(nebula => {
      nebula.element.style.animationPlayState = 'paused';
    });
    this.shootingStars.forEach(star => {
      star.element.style.animationPlayState = 'paused';
    });
    this.cosmicDust.forEach(dust => {
      dust.element.style.animationPlayState = 'paused';
    });
    return this;
  }
  
  resume() {
    if (this.galaxy) {
      this.galaxy.element.style.animationPlayState = 'running';
    }
    this.nebulae.forEach(nebula => {
      nebula.element.style.animationPlayState = 'running';
    });
    this.shootingStars.forEach(star => {
      star.element.style.animationPlayState = 'running';
    });
    this.cosmicDust.forEach(dust => {
      dust.element.style.animationPlayState = 'running';
    });
    return this;
  }
  
  destroy() {
    // Remove cosmic container
    if (this.cosmicContainer && this.cosmicContainer.parentNode) {
      this.cosmicContainer.parentNode.removeChild(this.cosmicContainer);
    }
    
    this.galaxy = null;
    this.nebulae = [];
    this.shootingStars = [];
    this.cosmicDust = [];
    this.isInitialized = false;
  }
  
  getGalaxyElement() {
    return this.galaxy ? this.galaxy.element : null;
  }
  
  getNebulaElements() {
    return this.nebulae.map(n => n.element);
  }
  
  getShootingStarElements() {
    return this.shootingStars.map(s => s.element);
  }
  
  getDustElements() {
    return this.cosmicDust.map(d => d.element);
  }
  
  getAllElements() {
    const elements = [];
    if (this.galaxy) elements.push(this.galaxy.element);
    elements.push(...this.getNebulaElements());
    elements.push(...this.getShootingStarElements());
    elements.push(...this.getDustElements());
    return elements;
  }
  
  getElementCount() {
    let count = 0;
    if (this.galaxy) count++;
    count += this.nebulae.length;
    count += this.shootingStars.length;
    count += this.cosmicDust.length;
    return count;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MelodiaCosmic = MelodiaCosmic;
}