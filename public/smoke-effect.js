// Optimized Cyberpunk Smoke Effect with Performance Detection
(function() {
  const canvas = document.getElementById('cyberpunk-smoke');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Performance detection
  let performanceMode = 'normal';
  let frameCount = 0;
  let lastFpsCheck = performance.now();
  let currentFps = 60;
  
  // Check device performance
  function detectPerformance() {
    const start = performance.now();
    let testFrames = 0;
    
    function testFrame() {
      testFrames++;
      if (performance.now() - start < 1000) {
        requestAnimationFrame(testFrame);
      } else {
        const fps = testFrames;
        if (fps < 30) {
          performanceMode = 'low';
          console.log('Low performance device detected, using minimal smoke effect');
        } else if (fps < 45) {
          performanceMode = 'medium';
          console.log('Medium performance device detected, using reduced smoke effect');
        } else {
          performanceMode = 'high';
          console.log('High performance device detected, using full smoke effect');
        }
        initializeSmoke();
      }
    }
    testFrame();
  }

  // Performance optimizations - Reduced to 10 FPS
  const TARGET_FPS = 10; // Reduced to 10 FPS for maximum performance
  const FRAME_TIME = 1000 / TARGET_FPS;
  let lastFrameTime = 0;
  
  // Adjust particle count based on performance
  const getParticleCount = () => {
    switch(performanceMode) {
      case 'low': return 6;
      case 'medium': return 12;
      default: return 18;
    }
  };
  
  const PARTICLE_COUNT = getParticleCount();
  const PARTICLE_BASE_RADIUS = 28;
  const PARTICLE_RADIUS_VARIANCE = 12;
  const PARTICLE_LIFESPAN = 3000;
  const COLORS = [
    'rgba(255,255,255,0.12)',
    'rgba(240,240,255,0.10)',
    'rgba(255,255,255,0.08)',
    'rgba(245,245,255,0.06)',
    'rgba(255,255,255,0.10)'
  ];

  // Pre-calculate some values for performance
  const HALF_PI = Math.PI / 2;
  const TWO_PI = Math.PI * 2;

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function Particle() {
    this.x = W - 100 + randomBetween(-20, 20);
    this.y = H - 80 + randomBetween(-20, 20);
    this.radius = PARTICLE_BASE_RADIUS + randomBetween(-PARTICLE_RADIUS_VARIANCE, PARTICLE_RADIUS_VARIANCE);
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = randomBetween(0.12, 0.18);
    this.life = 0;
    this.lifespan = PARTICLE_LIFESPAN + randomBetween(-600, 600);
    this.angle = randomBetween(-HALF_PI - 0.6, -HALF_PI + 0.15);
    this.speed = randomBetween(0.15, 0.25);
    this.swirl = randomBetween(0.0008, 0.002) * (Math.random() > 0.5 ? 1 : -1);
    
    // Pre-calculate some values
    this.speedX = Math.cos(this.angle) * this.speed * 0.12;
    this.speedY = Math.sin(this.angle) * this.speed * 0.12;
  }

  Particle.prototype.update = function(dt) {
    this.life += dt;
    this.x += this.speedX * dt;
    this.y += this.speedY * dt;
    this.angle += this.swirl * dt;
    this.alpha *= 0.999;
    
    // Update speed components
    this.speedX = Math.cos(this.angle) * this.speed * 0.12;
    this.speedY = Math.sin(this.angle) * this.speed * 0.12;
  };

  Particle.prototype.draw = function(ctx) {
    const alpha = Math.max(0, this.alpha * (1 - this.life / this.lifespan));
    if (alpha <= 0.01) return;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // Adjust shadow blur based on performance
    const shadowBlur = performanceMode === 'low' ? 8 : 16;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = shadowBlur;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  };

  let particles = [];
  let lastTime = performance.now();
  let isVisible = true;
  let isEnabled = true;

  // Check if element is visible to pause animation when not needed
  function checkVisibility() {
    const rect = canvas.getBoundingClientRect();
    isVisible = rect.top < window.innerHeight && rect.bottom > 0;
  }

  function spawnParticle() {
    if (particles.length < PARTICLE_COUNT) {
      particles.push(new Particle());
    }
  }

  function animate(now) {
    // Frame rate limiting to 10 FPS
    if (now - lastFrameTime < FRAME_TIME) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrameTime = now;
    
    // FPS monitoring
    frameCount++;
    if (now - lastFpsCheck >= 1000) {
      currentFps = frameCount;
      frameCount = 0;
      lastFpsCheck = now;
      
      // Auto-adjust performance if FPS drops too low
      if (currentFps < 8 && performanceMode !== 'low') {
        performanceMode = 'low';
        console.log('Performance degraded, switching to low mode');
      }
    }
    
    const dt = now - lastTime;
    lastTime = now;
    
    // Only animate if visible and enabled
    if (!isVisible || !isEnabled) {
      requestAnimationFrame(animate);
      return;
    }
    
    // Clear canvas with transparent background instead of overlay
    ctx.clearRect(0, 0, W, H);
    
    // Spawn particles based on performance mode
    const spawnChance = performanceMode === 'low' ? 0.3 : 0.5;
    if (Math.random() < spawnChance) {
      spawnParticle();
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update(dt);
      p.draw(ctx);
      if (p.life > p.lifespan) {
        particles.splice(i, 1);
      }
    }
    
    requestAnimationFrame(animate);
  }

  function initializeSmoke() {
    // Initialize
    checkVisibility();
    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);
    
    // Add toggle functionality
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '🌫️';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      background: rgba(0,0,0,0.7);
      color: white;
      cursor: pointer;
      z-index: 1000;
      font-size: 16px;
      opacity: 0.7;
      transition: opacity 0.3s;
    `;
    toggleButton.addEventListener('mouseenter', () => toggleButton.style.opacity = '1');
    toggleButton.addEventListener('mouseleave', () => toggleButton.style.opacity = '0.7');
    toggleButton.addEventListener('click', () => {
      isEnabled = !isEnabled;
      if (!isEnabled) {
        ctx.clearRect(0, 0, W, H);
        particles = [];
      }
      toggleButton.style.background = isEnabled ? 'rgba(0,0,0,0.7)' : 'rgba(255,0,0,0.7)';
    });
    document.body.appendChild(toggleButton);
    
    // Start animation
    animate(performance.now());
  }

  // Start performance detection
  detectPerformance();
})(); 