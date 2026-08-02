# Melodia Animated Assets Guide

Complete guide to using the enhanced animated versions of the Melodia design system assets for your website.

---

## Overview

The animated versions enhance your static Melodia assets with:
- **Animated stars** with twinkling, floating, and pulsing effects
- **Mouse parallax** for depth and interactivity
- **Content-aware variations** that respond to your data
- **Easy configuration** for quick customization
- **Multiple visual themes** (Constellation, Aurora, Cosmic)

---

## New Animated Files

| File | Description | Best For |
|------|-------------|----------|
| `melodia-hero-embed-animated.html` | Enhanced classic hero with animated stars & parallax | General use, portfolios |
| `melodia-hero-embed-aurora.html` | Aurora Borealis effect with flowing lights | Ethereal, nature scenes |
| `melodia-hero-embed-cosmic.html` | Deep space with rotating galaxy & nebulae | Sci-fi, abstract works |
| `melodia-passport-embed-animated.html` | Animated asset passport with hover effects | Project specifications |

---

## Quick Start

### 1. Basic Installation (Same as Static Versions)

1. **Wix Editor → Add (+) → Embed Code → Embed HTML → "Enter Code"**
2. Open the `.html` file in a text editor, copy **everything**, paste into the box
3. Resize/position:
   - Hero: stretch **full-width**, height ~ **440–520px**
   - Passport: ~ **360 × 560** (dark) — drag to fit

### 2. Basic Configuration

Edit the `CONFIG` object at the top of each file:

```javascript
var CONFIG = {
  theme: "dark",              // "dark" | "nebula" | "ivory"
  kicker: "3D Environment & Technical Art",
  title: "Your Project Name",
  sub: "Your tagline here"
};
```

---

## Configuration Options

### Animated Hero (`melodia-hero-embed-animated.html`)

```javascript
var CONFIG = {
  // Theme options
  theme: "dark",                      // "dark" | "nebula" | "ivory"
  contentTheme: "environment",        // "environment" | "character" | "prop" | "abstract"
  
  // Content
  kicker: "3D Environment & Technical Art",
  title: "Ashen Cathedral",
  sub: "mapped to the stars",
  
  // Star animation settings
  starCount: 70,                     // Number of background stars
  gstarCount: 8,                      // Number of gold stars
  twinkleChance: 0.3,                // 30% of stars will twinkle
  floatChance: 0.2,                  // 20% of stars will float
  pulseChance: 0.15,                 // 15% of stars will pulse
  
  // Parallax settings
  parallaxEnabled: true,             // Enable mouse parallax
  parallaxStrength: 0.03,           // Movement intensity (0.01 = subtle, 0.1 = strong)
  
  // Animation speeds (seconds)
  twinkleDuration: { min: 2, max: 5 },
  floatDuration: { min: 3, max: 6 },
  pulseDuration: { min: 1.5, max: 3 },
  rotateDuration: { min: 15, max: 30 }
};
```

### Aurora Hero (`melodia-hero-embed-aurora.html`)

```javascript
var CONFIG = {
  // Content
  kicker: "3D Environment & Technical Art",
  title: "Northern Expanse",
  sub: "where light dances across the sky",
  
  // Aurora settings
  auroraIntensity: 0.6,             // 0.0 to 1.0 (brightness)
  auroraSpeed: 1.0,                  // Speed multiplier
  
  // Particle settings
  particleCount: 50,                 // Floating light particles
  particleSpeed: { min: 6, max: 12 }, // Duration in seconds
  
  // Star settings
  starCount: 60,
  gstarCount: 6,
  
  // Parallax
  parallaxEnabled: true,
  parallaxStrength: 0.04
};
```

### Cosmic Hero (`melodia-hero-embed-cosmic.html`)

```javascript
var CONFIG = {
  // Content
  kicker: "3D Environment & Technical Art",
  title: "Cosmic Void",
  sub: "beyond the edge of known space",
  
  // Galaxy settings
  galaxyRotationSpeed: 60,           // Rotation duration in seconds
  galaxyArmCount: 4,                // Number of spiral arms
  galaxySize: 600,                  // Galaxy size in pixels
  
  // Nebula settings
  nebulaCount: 3,
  nebulaColors: [
    "rgba(110,90,166,0.4)", 
    "rgba(60,92,158,0.3)", 
    "rgba(156,148,198,0.3)"
  ],
  
  // Shooting star settings
  shootingStarCount: 2,
  shootingStarInterval: 4000,       // Milliseconds between shooting stars
  
  // Cosmic dust
  dustCount: 40,
  
  // Regular stars
  starCount: 80,
  gstarCount: 8,
  
  // Parallax
  parallaxEnabled: true,
  parallaxStrength: 0.05
};
```

### Animated Passport (`melodia-passport-embed-animated.html`)

```javascript
var CONFIG = {
  theme: "dark",                     // "dark" (Astral Night) or "light" (Ivory)
  highlight: "environment",          // "environment" | "character" | "prop" | "abstract"
  project: "Ashen Cathedral",
  category: "Environment",
  version: "v1.2",
  
  // Enable/disable features
  animations: true,                  // Enable animations
  hoverEffects: true,                // Enable hover effects
  decorativeStars: true,             // Show decorative background stars
  
  rows: [
    ["Triangles", "482,318"],
    ["Textures", "4K"],
    ["Materials", "12"],
    ["Software", "Blender · ZBrush"],
    ["Engine", "Unreal Engine 5.4"],
    ["Date", "2026-03"]
  ]
};
```

---

## URL Parameter Overrides

All configuration values can be overridden via URL parameters for dynamic content:

### Hero Examples:
```
?theme=dark&title=MyProject&kicker=EnvironmentArt&sub=CreativeCoding
?contentTheme=character&parallaxStrength=0.05&starCount=100
```

### Passport Examples:
```
?theme=dark&project=MyProject&triangles=123,456&textures=8K&materials=24
?highlight=character&animations=true&hoverEffects=true
```

---

## Content-Aware Themes

### Hero Content Themes
The animated hero supports content-aware background variations:

- **`environment`** (default) - Blue-green gradients for natural environments
- **`character`** - Purple-violet gradients for character work
- **`prop`** - Teal-blue gradients for props and objects
- **`abstract`** - Rose-plum gradients for abstract/experimental work

### Passport Highlight Themes
The animated passport supports title color highlights:

- **`environment`** (default) - Astral blue title
- **`character`** - Lavender title
- **`prop`** - Sakura pink title
- **`abstract`** - Gold title

---

## Performance Optimization

### For Better Performance:
- Reduce star counts: `starCount: 40` instead of `70`
- Disable parallax on mobile: `parallaxEnabled: false`
- Reduce animation complexity: set all chances to `0.1`
- Limit particle counts in Aurora/Cosmic themes

### For Maximum Effect:
- Increase star counts: `starCount: 100`
- Enable all animations: set chances to `0.4-0.5`
- Stronger parallax: `parallaxStrength: 0.08`
- More particles in Aurora/Cosmic: `particleCount: 80`

---

## Browser Compatibility

- **Chrome/Edge**: Full support for all features
- **Firefox**: Full support
- **Safari**: Full support (may have slight performance differences)
- **Mobile**: Full support, consider reducing particle counts for better performance

---

## Integration with Existing Pipeline

The animated versions maintain the same data schema as the static versions, so they work seamlessly with your existing automation pipeline:

### Automation Compatibility:
- Same URL parameter structure
- Same data field names
- Compatible with existing `portfolio_schema.json`
- Can be swapped with static versions without breaking automation

---

## Design Guidelines

### When to Use Each Theme:

**Animated Hero (Constellation)**:
- Portfolio home pages
- Project showcases
- Professional presentations
- When you want subtle elegance

**Aurora Hero**:
- Nature/environment projects
- Ethereal, dreamlike work
- When you want flowing, organic motion
- Landscape showcases

**Cosmic Hero**:
- Sci-fi projects
- Abstract/experimental work
- When you want dramatic, space-like effects
- High-impact hero sections

**Animated Passport**:
- All project specification cards
- When you want interactive elements
- To add polish to technical data
- When subtle animation enhances readability

### Animation Best Practices:
- Keep it subtle - animations should enhance, not distract
- One animated hero per page maximum
- Don't mix multiple complex themes together
- Test on mobile for performance
- Consider your audience - some prefer minimal motion

---

## Troubleshooting

### Stars Not Appearing:
- Check `starCount` is greater than 0
- Verify `theme` is set correctly (some themes disable stars)
- Check browser console for errors

### Parallax Not Working:
- Verify `parallaxEnabled: true`
- Check that the embed has sufficient height
- Some mobile browsers may have limited parallax support

### Performance Issues:
- Reduce `starCount` and `particleCount`
- Set `parallaxEnabled: false`
- Reduce animation chances
- Close other browser tabs

### Animation Too Fast/Slow:
- Adjust duration ranges: `{ min: 2, max: 5 }`
- Increase values for slower animations
- Decrease values for faster animations

---

## Customization Examples

### Subtle Professional Look:
```javascript
var CONFIG = {
  starCount: 30,
  twinkleChance: 0.1,
  parallaxStrength: 0.015,
  auroraIntensity: 0.3
};
```

### Dramatic Showcase:
```javascript
var CONFIG = {
  starCount: 100,
  twinkleChance: 0.5,
  parallaxStrength: 0.08,
  auroraIntensity: 0.8,
  particleCount: 80
};
```

### Performance-Optimized:
```javascript
var CONFIG = {
  starCount: 20,
  twinkleChance: 0.05,
  parallaxEnabled: false,
  particleCount: 20
};
```

---

## Future Enhancements

Potential additions for future versions:
- Sound-reactive animations (using Web Audio API)
- Scroll-triggered animations
- More theme variations (underwater, volcanic, etc.)
- Custom animation curves
- Performance profiling tools
- Mobile-specific optimizations

---

## Support

For issues or questions:
1. Check this guide first
2. Test in different browsers
3. Verify configuration values
4. Check browser console for errors
5. Consider performance constraints

---

**Remember**: The animated versions are designed to enhance your existing Melodia design system while maintaining full compatibility with your current workflow and automation pipeline.