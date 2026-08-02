/**
 * MELODIA — Shared JavaScript Utilities
 * Reusable utility functions for all Melodia components
 * Version: 1.0
 */

const MelodiaUtils = (function() {
  
  /**
   * Seeded random number generator
   * @param {number} seed - Initial seed value
   * @returns {function} - Random function that returns 0-1
   */
  function rng(seed) {
    return function() {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }
  
  /**
   * Generate random number in range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random number in range
   */
  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  /**
   * Generate random integer in range
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random integer in range
   */
  function randomInt(min, max) {
    return Math.floor(randomRange(min, max + 1));
  }
  
  /**
   * Get URL parameter value
   * @param {string} name - Parameter name
   * @param {string} defaultValue - Default value if not found
   * @returns {string} - Parameter value or default
   */
  function getUrlParam(name, defaultValue) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || defaultValue;
  }
  
  /**
   * Get all URL parameters as object
   * @returns {object} - Parameters object
   */
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }
  
  /**
   * Deep merge configuration with URL parameters
   * @param {object} config - Base configuration object
   * @param {object} params - URL parameters object
   * @returns {object} - Merged configuration
   */
  function mergeConfig(config, params) {
    const merged = { ...config };
    
    for (const key in params) {
      if (params.hasOwnProperty(key) && merged.hasOwnProperty(key)) {
        // Handle different types appropriately
        if (typeof merged[key] === 'number') {
          merged[key] = parseFloat(params[key]);
        } else if (typeof merged[key] === 'boolean') {
          merged[key] = params[key] === 'true';
        } else if (typeof merged[key] === 'object' && !Array.isArray(merged[key])) {
          // Handle nested objects (like duration ranges)
          const numValue = parseFloat(params[key]);
          if (!isNaN(numValue)) {
            merged[key] = numValue;
          } else {
            merged[key] = params[key];
          }
        } else {
          merged[key] = params[key];
        }
      }
    }
    
    return merged;
  }
  
  /**
   * Create SVG burst/star shape
   * @param {number} size - Size in pixels
   * @param {string} color - Color hex or name
   * @returns {string} - SVG HTML string
   */
  function createBurst(size, color) {
    const pts = [];
    const cx = size / 2;
    const cy = size / 2;
    const outer = size / 2;
    const inner = outer * 0.4;
    
    for (let i = 0; i < 16; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const a = -Math.PI / 2 + i * Math.PI / 8;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
    }
    
    return `<svg class="melodia-burst" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <polygon points="${pts.join(' ')}" fill="${color}"/>
    </svg>`;
  }
  
  /**
   * Create SVG four-point star
   * @param {number} size - Size in pixels
   * @param {string} color - Color hex or name
   * @returns {string} - SVG HTML string
   */
  function createFourStar(size, color) {
    const h = size / 2;
    const t = size * 0.16;
    const d = `M ${h} 0 L ${h + t} ${h - t} L ${size} ${h} L ${h + t} ${h + t} L ${h} ${size} L ${h - t} ${h + t} L 0 ${h} L ${h - t} ${h - t} Z`;
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <path d="${d}" fill="${color}"/>
    </svg>`;
  }
  
  /**
   * Clamp value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Clamped value
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  /**
   * Linear interpolation
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} - Interpolated value
   */
  function lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
  
  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - Element to check
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {boolean} - True if element is visible
   */
  function isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const visibleHeight = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0));
    const visibleWidth = Math.max(0, Math.min(rect.right, windowWidth) - Math.max(rect.left, 0));
    
    const visibleArea = visibleHeight * visibleWidth;
    const totalArea = rect.height * rect.width;
    
    return (visibleArea / totalArea) >= threshold;
  }
  
  /**
   * Debounce function
   * @param {function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {function} - Debounced function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Throttle function
   * @param {function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {function} - Throttled function
   */
  function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} - Formatted number string
   */
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  
  /**
   * Generate unique ID
   * @param {string} prefix - ID prefix
   * @returns {string} - Unique ID
   */
  function generateId(prefix = 'melodia') {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Detect mobile device
   * @returns {boolean} - True if mobile device
   */
  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Detect reduced motion preference
   * @returns {boolean} - True if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Safe parse JSON
   * @param {string} jsonString - JSON string to parse
   * @param {object} defaultValue - Default value if parsing fails
   * @returns {object} - Parsed object or default
   */
  function safeParseJson(jsonString, defaultValue = {}) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn('Failed to parse JSON:', e);
      return defaultValue;
    }
  }
  
  /**
   * Apply CSS variables to element
   * @param {HTMLElement} element - Target element
   * @param {object} variables - CSS variables object
   */
  function applyCssVariables(element, variables) {
    for (const [key, value] of Object.entries(variables)) {
      element.style.setProperty(`--${key}`, value);
    }
  }
  
  /**
   * Create element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {object} attributes - Element attributes
   * @param {Array} children - Child elements or strings
   * @returns {HTMLElement} - Created element
   */
  function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    }
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
    
    return element;
  }
  
  // Public API
  return {
    rng,
    randomRange,
    randomInt,
    getUrlParam,
    getUrlParams,
    mergeConfig,
    createBurst,
    createFourStar,
    clamp,
    lerp,
    isInViewport,
    debounce,
    throttle,
    formatNumber,
    generateId,
    isMobile,
    prefersReducedMotion,
    safeParseJson,
    applyCssVariables,
    createElement
  };
  
})();

// Make available globally
if (typeof window !== 'undefined') {
  window.MelodiaUtils = MelodiaUtils;
}