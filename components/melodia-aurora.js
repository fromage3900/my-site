/**
 * MELODIA — Aurora Effect Component
 * Standalone aurora borealis effect with flowing lights and particles
 * Version: 1.0
 * 
 * Usage:
 * const aurora = new MelodiaAurora(container, config);
 * aurora.init();
 */

class MelodiaAurora {
  
  constructor(container, config = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.config = this.mergeDefaults(config);
    this.auroraLayers = [];
    this.particles = [];
    this.isInitialized = false;
  }
  
  mergeDefaults(config) {
    const defaults = {
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
      auroraSizeRange: { min: 30, max: 60 }, // percentage
      particlePosition: 'random', // 'random' or 'distributed'
      
      // Performance
      reduceMotion: false,
      seed: 789
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
    
    this.createAuroraContainer();
    this.createAuroraLayers();
    
    if (!this.config.reduceMotion) {
      this.createParticles();
    }
    
    this.isInitialized = true;
    return this;
  }
  
  createAuroraContainer() {
    this.auroraContainer = document.createElement('div');
    this.auroraContainer.className = 'melodia-aurora-container';
    this.auroraContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    `;
    this.container.appendChild(this.auroraContainer);
  }
  
  createAuroraLayers() {
    const rng = MelodiaUtils.rng(this.config.seed);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.auroraCount; i++) {
      const aurora = this.createAuroraLayer(rng, i);
      this.auroraLayers.push(aurora);
      fragment.appendChild(aurora.element);
    }
    
    this.auroraContainer.appendChild(fragment);
  }
  
  createAuroraLayer(rng, index) {
    const size = MelodiaUtils.randomRange(
      this.config.auroraSizeRange.min,
      this.config.auroraSizeRange.max
    );
    
    const x = MelodiaUtils.randomRange(-20, 80);
    const y = MelodiaUtils.randomRange(-30, 70);
    const color = this.config.auroraColors[index % this.config.auroraColors.length];
    const duration = (30 + Math.random() * 20) / this.config.auroraSpeed;
    const delay = Math.random() * 5;
    const opacity = this.config.auroraIntensity * (1 - index * 0.2);
    
    const aurora = document.createElement('div');
    aurora.className = 'melodia-aurora melodia-aurora-flow';
    aurora.style.cssText = `
      position: absolute;
      width: ${size * 2}%;
      height: ${size * 2}%;
      top: ${y}%;
      left: ${x}%;
      border-radius: 50%;
      background: radial-gradient(ellipse at 30% 20%, ${color} 0%, transparent 50%);
      opacity: ${opacity};
      filter: blur(60px);
      --aurora-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    return {
      element: aurora,
      size, x, y, color, duration, opacity
    };
  }
  
  createParticles() {
    const rng = MelodiaUtils.rng(this.config.seed + 100);
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = this.createParticle(rng, i);
      this.particles.push(particle);
      fragment.appendChild(particle.element);
    }
    
    this.auroraContainer.appendChild(fragment);
  }
  
  createParticle(rng, index) {
    const x = rng() * 100;
    const y = rng() * 100;
    const size = MelodiaUtils.randomRange(
      this.config.particleSizeRange.min,
      this.config.particleSizeRange.max
    );
    const duration = MelodiaUtils.randomRange(
      this.config.particleSpeed.min,
      this.config.particleSpeed.max
    );
    const delay = rng() * 5;
    
    const particle = document.createElement('div');
    particle.className = 'melodia-particle melodia-particle-float';
    particle.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      background: ${this.config.particleColor};
      border-radius: 50%;
      --particle-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;
    
    return {
      element: particle,
      x, y, size, duration
    };
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setAuroraIntensity(intensity) {
    this.config.auroraIntensity = MelodiaUtils.clamp(intensity, 0, 1);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setAuroraSpeed(speed) {
    this.config.auroraSpeed = Math.max(0.1, speed);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setParticleCount(count) {
    this.config.particleCount = Math.max(0, count);
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  setAuroraColors(colors) {
    this.config.auroraColors = colors;
    if (this.isInitialized) {
      this.init();
    }
    return this;
  }
  
  addAuroraLayer(color, size, intensity) {
    const aurora = this.createAuroraLayer(MelodiaUtils.rng(Date.now()), this.auroraLayers.length);
    if (color) aurora.color = color;
    if (size) aurora.size = size;
    if (intensity) aurora.opacity = intensity;
    
    aurora.element.style.background = `radial-gradient(ellipse at 30% 20%, ${aurora.color} 0%, transparent 50%)`;
    aurora.element.style.opacity = aurora.opacity;
    aurora.element.style.width = `${aurora.size * 2}%`;
    aurora.element.style.height = `${aurora.size * 2}%`;
    
    this.auroraLayers.push(aurora);
    this.auroraContainer.appendChild(aurora.element);
    
    return this;
  }
  
  removeAuroraLayer(index) {
    if (index >= 0 && index < this.auroraLayers.length) {
      const aurora = this.auroraLayers[index];
      aurora.element.remove();
      this.auroraLayers.splice(index, 1);
    }
    return this;
  }
  
  pause() {
    this.auroraLayers.forEach(aurora => {
      aurora.element.style.animationPlayState = 'paused';
    });
    this.particles.forEach(particle => {
      particle.element.style.animationPlayState = 'paused';
    });
    return this;
  }
  
  resume() {
    this.auroraLayers.forEach(aurora => {
      aurora.element.style.animationPlayState = 'running';
    });
    this.particles.forEach(particle => {
      particle.element.style.animationPlayState = 'running';
    });
    return this;
  }
  
  destroy() {
    // Remove aurora container
    if (this.auroraContainer && this.auroraContainer.parentNode) {
      this.auroraContainer.parentNode.removeChild(this.auroraContainer);
    }
    
    this.auroraLayers = [];
    this.particles = [];
    this.isInitialized = false;
  }
  
  getAuroraElements() {
    return this.auroraLayers.map(a => a.element);
  }
  
  getParticleElements() {
    return this.particles.map(p => p.element);
  }
  
  getAllElements() {
    return [...this.getAuroraElements(), ...this.getParticleElements()];
  }
  
  getElementCount() {
    return this.auroraLayers.length + this.particles.length;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MelodiaAurora = MelodiaAurora;
}