export function initGalaxy() {
  const canvas = document.getElementById('galaxy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];
  
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  // Star particle
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.z = Math.random() * 2; // depth
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.speedY = (Math.random() - 0.5) * 0.2;
      this.color = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
    }
    
    update() {
      // Parallax hyper-drive effect
      this.z -= 0.05 + (this.speedX * 0.1); 
      if (this.z <= 0) {
        this.z = 2; // Reset depth
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
      
      const projection = 300 / (this.z * 150);
      this.projX = (this.x - width/2) * projection + width/2;
      this.projY = (this.y - height/2) * projection + height/2;
      this.projSize = this.size * projection;
    }
    
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      // Draw trails
      ctx.arc(this.projX, this.projY, Math.abs(this.projSize), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  // Create 400 particles for dense universe
  for (let i = 0; i < 400; i++) {
    particles.push(new Particle());
  }
  
  // Connect close particles to form 4D constellations
  function drawConstellations() {
    for (let i = 0; i < particles.length; i+=2) { // optimization
      for (let j = i+1; j < particles.length; j+=2) {
        if (!particles[i].projX || !particles[j].projX) continue;
        const dx = particles[i].projX - particles[j].projX;
        const dy = particles[i].projY - particles[j].projY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 - distance/1000})`;
          ctx.lineWidth = 1.0;
          ctx.moveTo(particles[i].projX, particles[i].projY);
          ctx.lineTo(particles[j].projX, particles[j].projY);
          ctx.stroke();
        }
      }
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw deep space purple/blue nebula effects
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    gradient.addColorStop(0, 'rgba(45, 27, 105, 0.4)');
    gradient.addColorStop(1, 'rgba(10, 10, 26, 0.8)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    
    drawConstellations();
    
    requestAnimationFrame(animate);
  }
  
  animate();
}
