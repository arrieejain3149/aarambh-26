'use client';
import React, { useEffect, useRef } from 'react';

interface TrailParticle {
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSize: number;
  scale: number;
  angle: number;
  va: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseCoords = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on desktop devices with fine pointer (mouse)
    const isTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    if (isTouch) {
      return;
    }

    // Inject styles to display the canvas overlay (leaving system cursor normal)
    const style = document.createElement('style');
    style.innerHTML = `
      @media (pointer: fine) {
        .custom-cursor-canvas {
          display: block !important;
        }
      }
    `;
    document.head.appendChild(style);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Trail Particles Setup
    const particles: TrailParticle[] = [];
    const lastSpawn = { x: 0, y: 0 };
    let lastScrollSpawnTime = 0;
    let lastAmbientSpawnTime = 0;

    const hindiLetters = [
      'आरम्भ', 'सफ़र', 'उत्सव', 'कला', 'राग', 'JKLU'
    ];
    const colors = [
      '#FF188C', // Brand Pink
      '#0D21DD', // Brand Blue
      '#FF9A00', // Brand Orange
      '#030404', // Brand Ink (Solid dark contrast)
    ];

    const spawnParticle = (x: number, y: number) => {
      // Allow up to 25 words maximum on screen to accommodate bursts
      if (particles.length >= 25) {
        particles.shift();
      }

      const letter = hindiLetters[Math.floor(Math.random() * hindiLetters.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const randAngle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 1.6;

      particles.push({
        text: letter,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(randAngle) * speed,
        vy: Math.sin(randAngle) * speed,
        baseSize: Math.floor(Math.random() * 10) + 26, // 26px to 36px range for readability
        scale: 0.9, // grow on move
        angle: (Math.random() - 0.5) * 0.25, // rotate slightly
        va: (Math.random() - 0.5) * 0.005, // slow spin
        opacity: 1,
        color,
        life: 0,
        maxLife: 35 + Math.random() * 15 // slightly longer life
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      mouseCoords.current.x = x;
      mouseCoords.current.y = y;

      const dx = x - lastSpawn.x;
      const dy = y - lastSpawn.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Spawn a single word every 40px of movement so they form a readable chain
      if (distance > 40) {
        spawnParticle(x, y);
        lastSpawn.x = x;
        lastSpawn.y = y;
      }
    };

    const handleScroll = () => {
      const now = Date.now();
      // Occasional spawn on scroll to feel immersive
      if (now - lastScrollSpawnTime > 1200 && particles.length < 25) {
        const x = Math.random() * (window.innerWidth - 300) + 150;
        const y = window.innerHeight * 0.75;
        spawnParticle(x, y);
        lastScrollSpawnTime = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    let animationFrameId: number;

    const render = () => {
      // 1. Clear Canvas (reset transform to prevent scaled edge buffer artifacts)
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Ambient drift spawning
      const now = Date.now();
      if (now - lastAmbientSpawnTime > 3500 && particles.length < 3) {
        const x = Math.random() * (window.innerWidth - 300) + 150;
        const y = window.innerHeight * 0.8;
        spawnParticle(x, y);
        lastAmbientSpawnTime = now;
      }

      // 2. Update and Draw Trail Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.va;
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Scale grows slightly larger for depth effect
        if (p.scale < 1.35) {
          p.scale += 0.003;
        }

        // Keep text fully opaque for first 60% of life, then fade out quickly at the end
        const lifeRatio = p.life / p.maxLife;
        p.opacity = lifeRatio < 0.6 ? 1 : 1 - (lifeRatio - 0.6) / 0.4;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.font = `bold ${Math.round(p.baseSize * p.scale)}px Outfit, system-ui, sans-serif`;
        ctx.globalAlpha = p.opacity;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw sharp text fill directly without outline border
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, 0, 0);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      style.remove();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9998] hidden custom-cursor-canvas"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
