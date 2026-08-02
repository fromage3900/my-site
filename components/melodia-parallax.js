/**
 * MELODIA — Parallax System Component
 * Standalone mouse/touch parallax system for any elements
 * Version: 1.0
 * 
 * Usage:
 * const parallax = new MelodiaParallax(container, config);
 * parallax.addElement(element, depth);
 * parallax.init();
 */

class MelodiaParallax {
  
  constructor(container, config = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.config = this.mergeDefaults(config);
    this.elements = [];
    this.isInitialized = false;
    this.animationFrame = null;
    this.mouseEnterHandler = null;
    this.mouseLeaveHandler = null;
    this.touchStartHandler = null;
    this.touchEndHandler = null;
  }
  
  mergeDefaults(config) {
    const defaults = {
      // Parallax strength
      strength: 0.03,
      
      // Input types
      enableMouse: true,
      enableTouch: true,
      enableScroll: false,
      
      // Smoothing
      smoothing: 0.1, // 0-1, lower = smoother
      damping: 0.95,
      
      // Performance
      throttleMs: 16, // ~60fps
      reduceMotion: false,
      
      // Boundaries
      boundary: 'container', // 'container' or 'viewport'
      
      // Callbacks
      onMove: null,
      onEnter: null,
      onLeave: null
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
    
    if (!this.config.reduceMotion) {
      this.setupEventListeners();
    }
    
    this.isInitialized = true;
    return this;
  }
  
  addElement(element, depth = 1, config = {}) {
    const el = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (!el) {
      console.warn('Element not found:', element);
      return this;
    }
    
    const elementConfig = {
      element: el,
      depth: depth,
      ...config
    };
    
    this.elements.push(elementConfig);
    
    // Add initial transform
    el.style.transition = 'transform 0.3s ease-out';
    el.dataset.parallaxDepth = depth;
    
    return this;
  }
  
  addElements(selector, depthRange = { min: 0.5, max: 1.5 }) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      const depth = MelodiaUtils.randomRange(depthRange.min, depthRange.max);
      this.addElement(el, depth);
    });
    return this;
  }
  
  removeElement(element) {
    const el = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    this.elements = this.elements.filter(item => {
      if (item.element === el) {
        el.style.transform = '';
        delete el.dataset.parallaxDepth;
        return false;
      }
      return true;
    });
    
    return this;
  }
  
  setupEventListeners() {
    if (this.config.enableMouse) {
      this.mouseHandler = MelodiaUtils.throttle(
        this.handleMouseMove.bind(this), 
        this.config.throttleMs
      );
      this.mouseEnterHandler = this.handleMouseEnter.bind(this);
      this.mouseLeaveHandler = this.handleMouseLeave.bind(this);
      this.container.addEventListener('mousemove', this.mouseHandler);
      this.container.addEventListener('mouseenter', this.mouseEnterHandler);
      this.container.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
    
    if (this.config.enableTouch) {
      this.touchHandler = MelodiaUtils.throttle(
        this.handleTouchMove.bind(this), 
        this.config.throttleMs
      );
      this.touchStartHandler = this.handleTouchStart.bind(this);
      this.touchEndHandler = this.handleTouchEnd.bind(this);
      this.container.addEventListener('touchmove', this.touchHandler, { passive: true });
      this.container.addEventListener('touchstart', this.touchStartHandler, { passive: true });
      this.container.addEventListener('touchend', this.touchEndHandler);
    }
    
    if (this.config.enableScroll) {
      this.scrollHandler = MelodiaUtils.throttle(
        this.handleScroll.bind(this), 
        this.config.throttleMs
      );
      window.addEventListener('scroll', this.scrollHandler);
    }
  }
  
  handleMouseMove(e) {
    const rect = this.getBoundaryRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    
    this.updateElements(mouseX, mouseY);
    
    if (this.config.onMove) {
      this.config.onMove(mouseX, mouseY, e);
    }
  }
  
  handleTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.getBoundaryRect();
      const touchX = (touch.clientX - rect.left) / rect.width - 0.5;
      const touchY = (touch.clientY - rect.top) / rect.height - 0.5;
      
      this.updateElements(touchX, touchY);
      
      if (this.config.onMove) {
        this.config.onMove(touchX, touchY, e);
      }
    }
  }
  
  handleScroll() {
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    this.elements.forEach(item => {
      const moveY = scrollY * item.depth * this.config.strength;
      const moveX = scrollX * item.depth * this.config.strength;
      item.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }
  
  handleMouseEnter() {
    if (this.config.onEnter) {
      this.config.onEnter();
    }
  }
  
  handleMouseLeave() {
    this.resetElements();
    
    if (this.config.onLeave) {
      this.config.onLeave();
    }
  }
  
  handleTouchStart() {
    if (this.config.onEnter) {
      this.config.onEnter();
    }
  }
  
  handleTouchEnd() {
    this.resetElements();
    
    if (this.config.onLeave) {
      this.config.onLeave();
    }
  }
  
  getBoundaryRect() {
    if (this.config.boundary === 'viewport') {
      return {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
    return this.container.getBoundingClientRect();
  }
  
  updateElements(inputX, inputY) {
    this.elements.forEach(item => {
      const moveX = inputX * item.depth * this.config.strength * 100;
      const moveY = inputY * item.depth * this.config.strength * 100;
      item.element.style.transform = `translate(${moveX.toFixed(2)}px, ${moveY.toFixed(2)}px)`;
    });
  }
  
  resetElements() {
    this.elements.forEach(item => {
      item.element.style.transform = 'translate(0, 0)';
    });
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.isInitialized) {
      this.destroy();
      this.init();
    }
    
    return this;
  }
  
  setStrength(strength) {
    this.config.strength = strength;
    return this;
  }
  
  setSmoothing(smoothing) {
    this.config.smoothing = smoothing;
    return this;
  }
  
  enableMouse(enabled) {
    this.config.enableMouse = enabled;
    if (this.isInitialized) {
      this.destroy();
      this.init();
    }
    return this;
  }
  
  enableTouch(enabled) {
    this.config.enableTouch = enabled;
    if (this.isInitialized) {
      this.destroy();
      this.init();
    }
    return this;
  }
  
  enableScroll(enabled) {
    this.config.enableScroll = enabled;
    if (this.isInitialized) {
      this.destroy();
      this.init();
    }
    return this;
  }
  
  destroy() {
    // Remove event listeners
    if (this.mouseHandler) {
      this.container.removeEventListener('mousemove', this.mouseHandler);
      this.container.removeEventListener('mouseenter', this.mouseEnterHandler);
      this.container.removeEventListener('mouseleave', this.mouseLeaveHandler);
    }
    
    if (this.touchHandler) {
      this.container.removeEventListener('touchmove', this.touchHandler);
      this.container.removeEventListener('touchstart', this.touchStartHandler);
      this.container.removeEventListener('touchend', this.touchEndHandler);
    }
    
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    
    // Reset all elements
    this.resetElements();
    
    // Clear transforms
    this.elements.forEach(item => {
      item.element.style.transition = '';
      delete item.element.dataset.parallaxDepth;
    });
    
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    this.isInitialized = false;
  }
  
  getElements() {
    return this.elements.map(item => item.element);
  }
  
  getElementCount() {
    return this.elements.length;
  }
  
  pause() {
    if (this.mouseHandler) {
      this.container.removeEventListener('mousemove', this.mouseHandler);
    }
    if (this.touchHandler) {
      this.container.removeEventListener('touchmove', this.touchHandler);
    }
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }
  
  resume() {
    if (this.isInitialized && !this.config.reduceMotion) {
      this.setupEventListeners();
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.MelodiaParallax = MelodiaParallax;
}
