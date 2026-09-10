import { gsap } from 'gsap';
import Lenis from 'lenis';

// 1. Initialize Lenis Smooth Scrolling Engine
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function scrollLoop(time) {
  lenis.raf(time);
  requestAnimationFrame(scrollLoop);
}
requestAnimationFrame(scrollLoop);

// 2. Setup Canvas Mapping
const canvas = document.getElementById('hero-reveal-canvas');
const ctx = canvas.getContext('2d');

// Image Layers References
const imgCasual = new Image();
const imgRacing = new Image();

imgCasual.src = '/lando-casual.png';
imgRacing.src = '/lando-racing.png';

let assetsLoaded = 0;
function checkAssets() {
  assetsLoaded++;
  if (assetsLoaded === 2) {
    resizeCanvas();
    animateEntrance();
    renderLoop();
  }
}
imgCasual.onload = checkAssets;
imgRacing.onload = checkAssets;

// Interactive State Trackers
let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let maskRadius = { value: 0 }; // Controlled via GSAP on entrance
let isHovering = false;

// Track Mouse Movement Coordinates
window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  targetMouse.x = e.clientX - rect.left;
  targetMouse.y = e.clientY - rect.top;
  if (!isHovering && maskRadius.value > 0) {
    isHovering = true;
  }
});

// Linear Interpolation Helper (For Smooth Slow-Down Momentum Delay)
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

// Maintain Proportions Safely Across Display Monitors
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.parentElement.clientWidth;
  const displayHeight = canvas.parentElement.clientHeight;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  ctx.scale(dpr, dpr);

  // Initialize mouse center safely before movement starts
  if(targetMouse.x === 0 && targetMouse.y === 0) {
    targetMouse.x = displayWidth / 2;
    targetMouse.y = displayHeight / 2;
    mouse.x = targetMouse.x;
    mouse.y = targetMouse.y;
  }
}
window.addEventListener('resize', resizeCanvas);

// 3. Cinematic Entrance Timeline Animations (GSAP)
function animateEntrance() {
  const tl = gsap.timeline();

  // Entrance of Layout Typography & Dynamic Opening Portal Size expansion
  tl.from('.navbar', { y: -50, opacity: 0, duration: 1, ease: 'power4.out' })
    .from('.giant-text', { y: 100, opacity: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out' }, '-=0.8')
    .to(maskRadius, {
      value: 140, // Base default aperture view frame size
      duration: 1.5,
      ease: 'elastic.out(1, 0.75)'
    }, '-=0.5')
    .from('.hero-footer', { opacity: 0, y: 20, duration: 0.8 }, '-=0.5');
}

// 4. Frame Rendering Execution Cycle
// 4. Frame Rendering Execution Cycle (Optimized for Square Aspect Ratios)
function renderLoop() {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  // Clear Frame Buffer
  ctx.clearRect(0, 0, w, h);

  // FORCE A PERFECT 1:1 SQUARE ASPECT BOX WITHIN VIEWPORT
  const sideLength = Math.min(w, h) * 0.9; // Uses 90% of the smallest screen edge

  const renderX = (w - sideLength) / 2;
  const renderY = (h - sideLength) / 2;

  // Frame Interp Calculations (Tracks brush coordinate lagging delay)
  mouse.x = lerp(mouse.x, targetMouse.x, 0.08);
  mouse.y = lerp(mouse.y, targetMouse.y, 0.08);

  // --- LAYER 1: Draw Casual Normal Map Layer ---
  ctx.save();
  ctx.drawImage(imgCasual, renderX, renderY, sideLength, sideLength);
  ctx.restore();

  // --- LAYER 2: Draw Clipped Reveal Racing Helmet Layer ---
  ctx.save();
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, maskRadius.value, 0, Math.PI * 2, false);
  ctx.clip(); // Restricts drawing to the circular cursor zone
  
  ctx.drawImage(imgRacing, renderX, renderY, sideLength, sideLength);
  ctx.restore();

  requestAnimationFrame(renderLoop);
}
