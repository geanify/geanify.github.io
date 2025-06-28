// Cyberpunk Smoke Effect by AI
(function() {
  const canvas = document.getElementById('cyberpunk-smoke');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Parameters
  const PARTICLE_COUNT = 48;
  const PARTICLE_BASE_RADIUS = 32;
  const PARTICLE_RADIUS_VARIANCE = 18;
  const PARTICLE_LIFESPAN = 3400; // ms
  const COLORS = [
    'rgba(255,255,255,0.15)', // white
    'rgba(240,240,255,0.12)', // light blue-white
    'rgba(255,255,255,0.10)',
    'rgba(245,245,255,0.08)', // very light blue-white
    'rgba(255,255,255,0.13)'
  ];

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function Particle() {
    this.x = W - 100 + randomBetween(-20, 20);
    this.y = H - 80 + randomBetween(-20, 20);
    this.radius = PARTICLE_BASE_RADIUS + randomBetween(-PARTICLE_RADIUS_VARIANCE, PARTICLE_RADIUS_VARIANCE);
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.alpha = randomBetween(0.15, 0.25);
    this.life = 0;
    this.lifespan = PARTICLE_LIFESPAN + randomBetween(-800, 800);
    this.angle = randomBetween(-Math.PI/2-0.8, -Math.PI/2+0.2);
    this.speed = randomBetween(0.18, 0.38);
    this.swirl = randomBetween(0.001, 0.004) * (Math.random() > 0.5 ? 1 : -1);
  }

  Particle.prototype.update = function(dt) {
    this.life += dt;
    this.x += Math.cos(this.angle) * this.speed * dt * 0.12;
    this.y += Math.sin(this.angle) * this.speed * dt * 0.12;
    this.angle += this.swirl * dt;
    this.alpha *= 0.998;
  };

  Particle.prototype.draw = function(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha * (1 - this.life / this.lifespan));
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  };

  let particles = [];
  let lastTime = performance.now();

  function spawnParticle() {
    particles.push(new Particle());
  }

  function animate(now) {
    const dt = now - lastTime;
    lastTime = now;
    ctx.clearRect(0, 0, W, H);
    // Add new particles
    if (particles.length < PARTICLE_COUNT) {
      for (let i = 0; i < 3; i++) spawnParticle();
    }
    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update(dt);
      p.draw(ctx);
      if (p.life > p.lifespan) particles.splice(i, 1);
    }
    requestAnimationFrame(animate);
  }

  animate(performance.now());
})(); 