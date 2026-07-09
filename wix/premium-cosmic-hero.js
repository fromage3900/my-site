/**
 * Premium Parallax System
 * Deep multi-layer parallax with premium easing
 */

class PremiumParallax {
  constructor(container) {
    this.container = container;
    this.layers = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.depthFactors = [0.05, 0.15, 0.25, 0.35, 0.50, 0.60, 0.70, 0.80];
    this.smoothing = 0.08; // Premium smooth feel
    this.initialized = false;
    this.init();
  }

  init() {
    // Check if parallax layers exist
    const layers = this.container.querySelectorAll('.parallax-layer');
    if (layers.length === 0) {
      console.warn('No parallax layers found');
      return;
    }

    // Initialize layers
    layers.forEach((layer, index) => {
      this.layers.push({
        element: layer,
        depth: this.depthFactors[index] || 0.5,
        baseTransform: this.getBaseTransform(layer)
      });
    });

    // Mouse tracking
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('mouseleave', () => this.onMouseLeave());
    
    // Touch support
    this.container.addEventListener('touchmove', (e) => this.onTouchMove(e));
    this.container.addEventListener('touchend', () => this.onMouseLeave());
    
    // Start animation loop
    this.initialized = true;
    this.animate();
  }

  getBaseTransform(element) {
    const style = window.getComputedStyle(element);
    const transform = style.transform;
    return transform !== 'none' ? transform : '';
  }

  onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    this.mouseY = (e.clientY - rect.top) / rect.height - 0.5;
  }

  onTouchMove(e) {
    const rect = this.container.getBoundingClientRect();
    const touch = e.touches[0];
    this.mouseX = (touch.clientX - rect.left) / rect.width - 0.5;
    this.mouseY = (touch.clientY - rect.top) / rect.height - 0.5;
  }

  onMouseLeave() {
    this.mouseX = 0;
    this.mouseY = 0;
  }

  animate() {
    if (!this.initialized) return;

    // Premium smooth interpolation
    this.currentX += (this.mouseX - this.currentX) * this.smoothing;
    this.currentY += (this.mouseY - this.currentY) * this.smoothing;

    // Apply to each layer
    this.layers.forEach(layer => {
      const moveX = this.currentX * layer.depth * 30; // Max 30px movement
      const moveY = this.currentY * layer.depth * 30;
      const rotateX = this.currentY * layer.depth * 2; // Subtle rotation
      const rotateY = this.currentX * layer.depth * 2;
      
      layer.element.style.transform = `
        translate3d(${moveX}px, ${moveY}px, ${layer.depth * 10}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `;
    });

    requestAnimationFrame(() => this.animate());
  }

  destroy() {
    this.initialized = false;
    this.container.removeEventListener('mousemove', this.onMouseMove);
    this.container.removeEventListener('mouseleave', this.onMouseLeave);
    this.container.removeEventListener('touchmove', this.onTouchMove);
    this.container.removeEventListener('touchend', this.onMouseLeave);
  }
}

/**
 * Premium Orrery System
 * Detailed celestial mechanism with premium materials
 */

class PremiumOrrery {
  constructor(container) {
    this.container = container;
    this.rings = [];
    this.nodes = [];
    this.initialized = false;
    this.init();
  }

  init() {
    // Check if orrery already exists
    if (this.container.querySelector('.orrery-system')) {
      console.log('Orrery system already exists');
      return;
    }

    // Create orrery system
    this.createOrrerySystem();
    
    // Create orbital rings
    this.createRings();
    
    // Create nodes on rings
    this.createNodes();
    
    // Create constellation lines
    this.createConstellationLines();
    
    this.initialized = true;
  }

  createOrrerySystem() {
    const orrerySystem = document.createElement('div');
    orrerySystem.className = 'orrery-system';
    this.container.appendChild(orrerySystem);
    this.orrerySystem = orrerySystem;
  }

  createRings() {
    const ringConfig = [
      { size: [70, 60], duration: 30, color: 'rgba(155, 143, 196, 0.35)' },
      { size: [120, 110], duration: 42, color: 'rgba(201, 168, 106, 0.35)' },
      { size: [180, 160], duration: 56, color: 'rgba(232, 201, 184, 0.3)' },
      { size: [240, 220], duration: 72, color: 'rgba(212, 197, 169, 0.25)' },
      { size: [320, 300], duration: 96, color: 'rgba(155, 143, 196, 0.2)' },
      { size: [400, 380], duration: 120, color: 'rgba(109, 184, 184, 0.15)' }
    ];

    ringConfig.forEach((config, index) => {
      // 3D: shell rotates; path tilts in 3D space
      const shell = document.createElement('div');
      shell.className = 'orbital-shell';
      shell.style.width = config.size[0] + 'px';
      shell.style.height = config.size[1] + 'px';
      shell.style.setProperty('--duration', config.duration + 's');

      const ring = document.createElement('div');
      ring.className = 'orbital-path orbital-ring-' + (index + 1);
      ring.style.borderColor = config.color;

      shell.appendChild(ring);
      this.orrerySystem.appendChild(shell);
      this.rings.push({ element: ring, shell, config });
    });

    // Create central core
    this.createCore();
  }

  createCore() {
    const core = document.createElement('div');
    core.className = 'orrery-core';
    this.orrerySystem.appendChild(core);
  }

  createNodes() {
    const nodeTypes = ['node-crystal', 'node-gold', 'node-rose-gold', 'node-platinum', 'node-iris', 'node-lavender'];
    
    this.rings.forEach((ring, ringIndex) => {
      const nodeCount = ringIndex + 1; // More nodes on outer rings
      
      for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        const nodeType = nodeTypes[ringIndex % nodeTypes.length];
        node.className = 'orbital-node ' + nodeType;
        
        // Position on ring
        const angle = (360 / nodeCount) * i;
        const radiusX = (parseInt(ring.config.size[0]) / 2) - 10;
        const radiusY = (parseInt(ring.config.size[1]) / 2) - 10;
        
        const x = Math.cos(angle * Math.PI / 180) * radiusX;
        const y = Math.sin(angle * Math.PI / 180) * radiusY;
        
        const nodeSize = Math.max(6, 10 - ringIndex);
        node.style.width = nodeSize + 'px';
        node.style.height = nodeSize + 'px';
        node.style.left = `calc(50% + ${x}px)`;
        node.style.top = `calc(50% + ${y}px)`;
        
        // Stagger animations
        node.style.animationDelay = (ringIndex * 0.3 + i * 0.5) + 's';
        
        ring.element.appendChild(node);
        this.nodes.push({ element: node, ringIndex });
      }
    });
  }

  createConstellationLines() {
    const layer4 = this.container.querySelector('.parallax-layer-4');
    if (!layer4) return;

    // Create subtle constellation lines
    const lineCount = 5;
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement('div');
      line.className = 'constellation-line';
      
      // Random positioning
      const startX = Math.random() * 80 + 10;
      const startY = Math.random() * 80 + 10;
      const angle = Math.random() * 360;
      const length = Math.random() * 30 + 20;
      
      line.style.left = startX + '%';
      line.style.top = startY + '%';
      line.style.width = length + '%';
      line.style.transform = `rotate(${angle}deg)`;
      line.style.animationDelay = (i * 1.5) + 's';
      
      layer4.appendChild(line);
    }
  }

  destroy() {
    if (this.orrerySystem) {
      this.orrerySystem.remove();
    }
    this.initialized = false;
  }
}

/**
 * Premium Material Effects
 * Iridescent material shift and shimmer effects
 */

class PremiumMaterials {
  constructor() {
    this.materials = [];
    this.init();
  }

  init() {
    // Find all elements with premium material classes
    const materialElements = document.querySelectorAll('.material-gold-iridescent, .material-crystal, .material-premium');
    
    materialElements.forEach(element => {
      this.materials.push({
        element: element,
        type: this.getMaterialType(element)
      });
    });

    // Start material animation loop
    this.animateMaterials();
  }

  getMaterialType(element) {
    if (element.classList.contains('material-gold-iridescent')) return 'gold';
    if (element.classList.contains('material-crystal')) return 'crystal';
    if (element.classList.contains('material-premium')) return 'premium';
    return 'default';
  }

  animateMaterials() {
    const time = Date.now() / 1000;
    
    this.materials.forEach(material => {
      const phase = (time + Math.random() * 2) % 6; // 6-second cycle
      
      switch (material.type) {
        case 'gold':
          // Gold iridescent shift
          const goldProgress = phase / 6;
          material.element.style.backgroundPosition = `${goldProgress * 100}% 50%`;
          break;
          
        case 'crystal':
          // Crystal refraction effect
          const crystalOpacity = 0.5 + Math.sin(phase * Math.PI) * 0.3;
          material.element.style.opacity = crystalOpacity;
          break;
          
        case 'premium':
          // Premium shimmer
          const shimmerOffset = Math.sin(phase * Math.PI * 2) * 10;
          material.element.style.backgroundPosition = `calc(50% + ${shimmerOffset}px) 50%`;
          break;
      }
    });

    requestAnimationFrame(() => this.animateMaterials());
  }
}

/**
 * Premium Hero Controller
 * Coordinates all premium effects
 */

class PremiumHero {
  constructor() {
    this.hero = document.querySelector('.hero');
    if (!this.hero) {
      console.warn('Hero section not found');
      return;
    }

    this.parallax = null;
    this.orrery = null;
    this.materials = null;
    this.init();
  }

  init() {
    // Initialize parallax system
    this.parallax = new PremiumParallax(this.hero);
    
    // Initialize orrery system
    const orreryContainer = this.hero.querySelector('.parallax-layer-5');
    if (orreryContainer) {
      this.orrery = new PremiumOrrery(orreryContainer);
    }
    
    // Initialize material effects
    this.materials = new PremiumMaterials();
    
    // Handle reduced motion preference
    this.handleReducedMotion();
  }

  handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      // Disable parallax
      if (this.parallax) {
        this.parallax.destroy();
        this.parallax = null;
      }
      
      // Disable orrery
      if (this.orrery) {
        this.orrery.destroy();
        this.orrery = null;
      }
    }
    
    prefersReducedMotion.addEventListener('change', () => {
      if (prefersReducedMotion.matches) {
        if (this.parallax) {
          this.parallax.destroy();
          this.parallax = null;
        }
        if (this.orrery) {
          this.orrery.destroy();
          this.orrery = null;
        }
      } else {
        this.init();
      }
    });
  }

  destroy() {
    if (this.parallax) this.parallax.destroy();
    if (this.orrery) this.orrery.destroy();
    if (this.materials) this.materials = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PremiumHero();
  });
} else {
  new PremiumHero();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PremiumParallax, PremiumOrrery, PremiumMaterials, PremiumHero };
}