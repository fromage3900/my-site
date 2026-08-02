# Melodia Modular System Guide

Complete guide to using the modular Melodia components as individual, reusable assets.

---

## Overview

The Melodia design system has been separated into modular, standalone components that can be used independently or combined. This gives you complete flexibility to mix and match effects according to your needs.

---

## Component Architecture

```
components/
├── melodia-animations.css      # Shared CSS animations
├── melodia-utils.js            # JavaScript utility functions  
├── melodia-star-system.js      # Animated star field
├── melodia-parallax.js         # Mouse/touch parallax system
├── melodia-aurora.js           # Aurora borealis effect
├── melodia-cosmic.js           # Deep space cosmic effect
└── melodia-config-template.js   # Configuration template

examples/
├── minimal-stars.html          # Basic star usage
├── aurora-effect.html          # Standalone aurora
├── cosmic-effect.html          # Standalone cosmic
└── combined-effects.html       # Multiple components together
```

---

## Core Components

### 1. Shared CSS Animations (`melodia-animations.css`)

**Purpose**: Provides all CSS keyframe animations used across components.

**Usage**: Include in any HTML file that uses Melodia components.

```html
<link rel="stylesheet" href="components/melodia-animations.css">
```

**Features**:
- Star animations (twinkle, float, pulse, rotate)
- Aurora animations (flow, particle float)
- Cosmic animations (galaxy rotate, nebula drift, shooting star)
- UI animations (fade in, shimmer)
- Performance optimizations and reduced motion support

---

### 2. JavaScript Utilities (`melodia-utils.js`)

**Purpose**: Shared utility functions used across all components.

**Usage**: Load before any component scripts.

```html
<script src="components/melodia-utils.js"></script>
```

**Key Functions**:
- `rng(seed)` - Seeded random number generator
- `randomRange(min, max)` - Random number in range
- `getUrlParam(name, default)` - Get URL parameter
- `mergeConfig(config, params)` - Merge configuration with URL params
- `createBurst(size, color)` - Create SVG burst shape
- `createFourStar(size, color)` - Create SVG four-point star
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function
- `prefersReducedMotion()` - Check for reduced motion preference

---

### 3. Star System (`melodia-star-system.js`)

**Purpose**: Animated star field with multiple animation types.

**Basic Usage**:
```html
<div id="stars"></div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-star-system.js"></script>
<script>
  const starSystem = new MelodiaStarSystem('#stars', {
    starCount: 70,
    gstarCount: 8,
    enableParallax: true
  });
  starSystem.init();
</script>
```

**Configuration Options**:
```javascript
{
  starCount: 70,              // Number of regular stars
  gstarCount: 8,              // Number of gold stars
  twinkleChance: 0.3,         // 30% chance to twinkle
  floatChance: 0.2,           // 20% chance to float
  pulseChance: 0.15,          // 15% chance to pulse
  rotateChance: 0.5,          // 50% chance to rotate
  starSizeRange: { min: 0.8, max: 1.6 },
  gstarSize: 9,
  twinkleDuration: { min: 2, max: 5 },
  floatDuration: { min: 3, max: 6 },
  pulseDuration: { min: 1.5, max: 3 },
  rotateDuration: { min: 15, max: 30 },
  starColor: '#ffffff',
  gstarColor: '#C9A86A',
  enableParallax: true,
  parallaxStrength: 0.03,
  seed: 42
}
```

**Methods**:
- `init()` - Initialize the star system
- `updateConfig(newConfig)` - Update configuration
- `setStarCount(count)` - Change star count
- `setGStarCount(count)` - Change gold star count
- `setColors(starColor, gstarColor)` - Change colors
- `enableParallax(enabled)` - Enable/disable parallax
- `destroy()` - Clean up and remove elements
- `pause()` / `resume()` - Control animations

---

### 4. Parallax System (`melodia-parallax.js`)

**Purpose**: Mouse/touch parallax for any elements.

**Basic Usage**:
```html
<div class="parallax-container">
  <div class="parallax-element" data-depth="1">Element 1</div>
  <div class="parallax-element" data-depth="0.5">Element 2</div>
</div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-parallax.js"></script>
<script>
  const parallax = new MelodiaParallax('.parallax-container', {
    strength: 0.03
  });
  parallax.addElements('.parallax-element');
  parallax.init();
</script>
```

**Configuration Options**:
```javascript
{
  strength: 0.03,             // Parallax movement strength
  enableMouse: true,          // Enable mouse tracking
  enableTouch: true,          // Enable touch tracking
  enableScroll: false,       // Enable scroll parallax
  smoothing: 0.1,            // Movement smoothing (0-1)
  damping: 0.95,             // Movement damping
  throttleMs: 16,            // Throttle for performance
  boundary: 'container'      // 'container' or 'viewport'
}
```

**Methods**:
- `init()` - Initialize parallax
- `addElement(element, depth)` - Add single element
- `addElements(selector, depthRange)` - Add multiple elements
- `removeElement(element)` - Remove element
- `updateConfig(newConfig)` - Update configuration
- `setStrength(strength)` - Change parallax strength
- `enableMouse(enabled)` - Toggle mouse parallax
- `enableTouch(enabled)` - Toggle touch parallax
- `destroy()` - Clean up event listeners
- `pause()` / `resume()` - Control parallax

---

### 5. Aurora Effect (`melodia-aurora.js`)

**Purpose**: Aurora borealis effect with flowing lights and particles.

**Basic Usage**:
```html
<div id="aurora"></div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-aurora.js"></script>
<script>
  const aurora = new MelodiaAurora('#aurora', {
    auroraCount: 3,
    auroraIntensity: 0.6,
    particleCount: 50
  });
  aurora.init();
</script>
```

**Configuration Options**:
```javascript
{
  auroraCount: 3,             // Number of aurora layers
  auroraIntensity: 0.6,      // Brightness (0-1)
  auroraSpeed: 1.0,           // Animation speed multiplier
  auroraColors: [
    'rgba(110,90,166,0.4)',
    'rgba(60,92,158,0.3)',
    'rgba(156,148,198,0.3)'
  ],
  particleCount: 50,          // Number of floating particles
  particleSizeRange: { min: 1, max: 3 },
  particleSpeed: { min: 6, max: 12 },
  particleColor: 'rgba(201,168,106,0.8)',
  auroraSizeRange: { min: 30, max: 60 },
  seed: 789
}
```

**Methods**:
- `init()` - Initialize aurora effect
- `updateConfig(newConfig)` - Update configuration
- `setAuroraIntensity(intensity)` - Change brightness
- `setAuroraSpeed(speed)` - Change animation speed
- `setParticleCount(count)` - Change particle count
- `setAuroraColors(colors)` - Change aurora colors
- `addAuroraLayer(color, size, intensity)` - Add custom layer
- `removeAuroraLayer(index)` - Remove specific layer
- `pause()` / `resume()` - Control animations
- `destroy()` - Clean up and remove elements

---

### 6. Cosmic Effect (`melodia-cosmic.js`)

**Purpose**: Deep space effect with galaxy, nebulae, shooting stars, and cosmic dust.

**Basic Usage**:
```html
<div id="cosmic"></div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-cosmic.js"></script>
<script>
  const cosmic = new MelodiaCosmic('#cosmic', {
    enableGalaxy: true,
    galaxySize: 600,
    nebulaCount: 3,
    shootingStarCount: 2,
    dustCount: 40
  });
  cosmic.init();
</script>
```

**Configuration Options**:
```javascript
{
  enableGalaxy: true,
  galaxySize: 600,
  galaxyRotationSpeed: 60,
  galaxyArmCount: 4,
  galaxyCoreSize: 200,
  galaxyColors: {
    core: 'rgba(201,168,106,0.3)',
    arms: 'rgba(156,148,198,0.4)'
  },
  nebulaCount: 3,
  nebulaColors: [
    'rgba(110,90,166,0.4)',
    'rgba(60,92,158,0.3)',
    'rgba(156,148,198,0.3)'
  ],
  nebulaSizeRange: { min: 30, max: 50 },
  nebulaDriftSpeed: { min: 15, max: 25 },
  shootingStarCount: 2,
  shootingStarInterval: 4000,
  shootingStarDuration: { min: 2, max: 4 },
  dustCount: 40,
  dustSize: 1,
  dustDuration: { min: 8, max: 15 },
  galaxyPosition: { x: 50, y: 50 },
  seed: 321
}
```

**Methods**:
- `init()` - Initialize cosmic effect
- `updateConfig(newConfig)` - Update configuration
- `setGalaxySize(size)` - Change galaxy size
- `setGalaxyRotationSpeed(speed)` - Change rotation speed
- `setNebulaCount(count)` - Change nebula count
- `setShootingStarCount(count)` - Change shooting star count
- `setDustCount(count)` - Change dust count
- `setNebulaColors(colors)` - Change nebula colors
- `addNebula(color, size, position)` - Add custom nebula
- `removeNebula(index)` - Remove specific nebula
- `pause()` / `resume()` - Control animations
- `destroy()` - Clean up and remove elements

---

### 7. Configuration Template (`melodia-config-template.js`)

**Purpose**: Centralized configuration with presets and helper functions.

**Usage**:
```html
<script src="components/melodia-config-template.js"></script>
<script>
  // Get preset configuration
  const envConfig = MelodiaConfig.getPreset('environment');
  
  // Get performance level
  const perfConfig = MelodiaConfig.getPerformanceLevel('balanced');
  
  // Get combined configuration
  const combined = MelodiaConfig.getCombinedConfig('character', 'highQuality');
  
  // Use with components
  const stars = new MelodiaStarSystem('#stars', combined.stars);
</script>
```

**Available Presets**:
- `environment` - Blue-green tones for natural environments
- `character` - Purple-violet tones for character work
- `prop` - Teal-blue tones for props and objects
- `abstract` - Rose-plum tones for abstract work

**Performance Levels**:
- `high` - Minimal effects for maximum performance
- `balanced` - Default configuration
- `highQuality` - Maximum effects for best visuals

---

## Integration Examples

### Example 1: Minimal Stars Only

```html
<link rel="stylesheet" href="components/melodia-animations.css">
<div id="stars"></div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-star-system.js"></script>
<script>
  const stars = new MelodiaStarSystem('#stars', {
    starCount: 30,
    enableParallax: false
  });
  stars.init();
</script>
```

### Example 2: Aurora with Custom Colors

```html
<link rel="stylesheet" href="components/melodia-animations.css">
<div id="aurora"></div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-aurora.js"></script>
<script>
  const aurora = new MelodiaAurora('#aurora', {
    auroraColors: [
      'rgba(255,100,100,0.4)',
      'rgba(100,255,100,0.3)',
      'rgba(100,100,255,0.3)'
    ],
    auroraIntensity: 0.8
  });
  aurora.init();
</script>
```

### Example 3: Combined Effects

```html
<link rel="stylesheet" href="components/melodia-animations.css">
<div class="container">
  <div id="aurora"></div>
  <div id="stars"></div>
  <div class="content">Your content here</div>
</div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-star-system.js"></script>
<script src="components/melodia-aurora.js"></script>
<script src="components/melodia-parallax.js"></script>
<script>
  // Initialize aurora
  const aurora = new MelodiaAurora('#aurora').init();
  
  // Initialize stars without built-in parallax
  const stars = new MelodiaStarSystem('#stars', {
    enableParallax: false
  }).init();
  
  // Use separate parallax system for all elements
  const parallax = new MelodiaParallax('.container', {
    strength: 0.04
  });
  parallax.addElements('.melodia-star', { min: 0.5, max: 1.5 });
  parallax.addElement('.content', 0.3);
  parallax.init();
</script>
```

### Example 4: Using Configuration Presets

```html
<link rel="stylesheet" href="components/melodia-animations.css">
<script src="components/melodia-config-template.js"></script>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-star-system.js"></script>
<script src="components/melodia-aurora.js"></script>
<script>
  // Get character preset with high quality
  const config = MelodiaConfig.getCombinedConfig('character', 'highQuality');
  
  // Apply to components
  const stars = new MelodiaStarSystem('#stars', config.stars).init();
  const aurora = new MelodiaAurora('#aurora', config.aurora).init();
</script>
```

---

## Performance Optimization

### For Desktop (Full Performance)
```javascript
const config = MelodiaConfig.getCombinedConfig('environment', 'highQuality');
```

### For Mobile (Optimized)
```javascript
const config = MelodiaConfig.getCombinedConfig('environment', 'high');
// Or manually reduce counts
const stars = new MelodiaStarSystem('#stars', {
  starCount: 20,
  enableParallax: false
});
```

### For Low-End Devices
```javascript
const config = MelodiaConfig.getPerformanceLevel('high');
// Disable complex effects
const cosmic = new MelodiaCosmic('#cosmic', {
  enableGalaxy: false,
  shootingStarCount: 0,
  dustCount: 10
});
```

---

## Browser Compatibility

All components support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS 15+, Android 10+)

Components automatically respect `prefers-reduced-motion` preferences.

---

## File Size & Loading

**Component Sizes** (minified estimates):
- `melodia-animations.css`: ~3KB
- `melodia-utils.js`: ~4KB
- `melodia-star-system.js`: ~5KB
- `melodia-parallax.js`: ~5KB
- `melodia-aurora.js`: ~4KB
- `melodia-cosmic.js`: ~7KB

**Loading Strategy**:
1. Load CSS first
2. Load utilities before components
3. Load only components you need
4. Use async/defer for non-critical components

---

## Troubleshooting

### Components Not Initializing
- Ensure utils.js is loaded before components
- Check container elements exist in DOM
- Verify CSS animations file is loaded
- Check browser console for errors

### Performance Issues
- Reduce star/particle counts
- Disable parallax on mobile
- Use performance presets
- Check for memory leaks (call destroy() when done)

### Animations Not Working
- Check if `prefers-reduced-motion` is enabled
- Verify CSS animations file is loaded
- Ensure animation classes are being applied
- Check browser compatibility

---

## Migration from Monolithic Files

To migrate from the original monolithic HTML files to modular components:

**Before** (monolithic):
```html
<!-- One large file with everything embedded -->
<div class="hero" id="hero">
  <!-- All effects hardcoded -->
</div>
<script>
  // All logic in one place
</script>
```

**After** (modular):
```html
<link rel="stylesheet" href="components/melodia-animations.css">
<div class="hero">
  <div id="aurora"></div>
  <div id="stars"></div>
  <div class="content">Your content</div>
</div>
<script src="components/melodia-utils.js"></script>
<script src="components/melodia-star-system.js"></script>
<script src="components/melodia-aurora.js"></script>
<script>
  const aurora = new MelodiaAurora('#aurora', auroraConfig).init();
  const stars = new MelodiaStarSystem('#stars', starConfig).init();
</script>
```

---

## Best Practices

1. **Load Order**: CSS → Utils → Components
2. **Cleanup**: Call `destroy()` when removing components
3. **Performance**: Use presets for consistent performance
4. **Mobile**: Reduce effects on smaller screens
5. **Accessibility**: Respect reduced motion preferences
6. **Testing**: Test on target devices before deployment

---

## Advanced Usage

### Dynamic Component Switching
```javascript
let currentEffect = null;

function switchEffect(type) {
  if (currentEffect) {
    currentEffect.destroy();
  }
  
  switch(type) {
    case 'aurora':
      currentEffect = new MelodiaAurora('#effect', auroraConfig);
      break;
    case 'cosmic':
      currentEffect = new MelodiaCosmic('#effect', cosmicConfig);
      break;
    case 'stars':
      currentEffect = new MelodiaStarSystem('#effect', starConfig);
      break;
  }
  
  currentEffect.init();
}
```

### Custom Animation Sequences
```javascript
const stars = new MelodiaStarSystem('#stars').init();

// Create custom sequence
function playSequence() {
  stars.pause();
  setTimeout(() => stars.resume(), 1000);
  setTimeout(() => stars.setStarCount(100), 2000);
  setTimeout(() => stars.setStarCount(50), 4000);
}
```

### Integration with Frameworks
```javascript
// React example
import { MelodiaStarSystem } from './components/melodia-star-system';

function StarField() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const stars = new MelodiaStarSystem(containerRef.current);
    stars.init();
    
    return () => stars.destroy();
  }, []);
  
  return <div ref={containerRef} />;
}
```

---

## Support

For issues or questions:
1. Check this guide first
2. Review example files
3. Test in different browsers
4. Check browser console for errors
5. Verify component loading order

---

**Remember**: The modular system gives you complete flexibility. Use only what you need, combine as desired, and optimize for your specific use case.