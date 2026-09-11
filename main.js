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

// 2. Setup Canvas Mapping Layout Viewport
const canvas = document.getElementById('hero-reveal-canvas');
const ctx = canvas.getContext('2d');

const imgCasual = new Image();
const imgRacing = new Image();

imgCasual.src = '/lando-casual.png';
imgRacing.src = '/lando-racing.png';

// Interactive Physics Motion Vector Variables
let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let maskRadius = { value: 0 };       // Linearly animated upwards via master timeline
let canvasScale = { value: 0.85 };    // Handles elastic entry scaling transitions
let contentOpacity = { value: 0 };    // Controls graphic fade states on reveal

let assetsLoaded = 0;
function checkAssets() {
  assetsLoaded++;
  if (assetsLoaded === 2) {
    resizeCanvas();
    renderLoop();                     // Fire up graphics frame buffer updates
    executeMasterTransitionTimeline(); // Safely dismiss loader screen overlay panel
  }
}
imgCasual.onload = checkAssets;
imgRacing.onload = checkAssets;

// Monitor mouse coordinate vector coordinates across window viewport
window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  targetMouse.x = e.clientX - rect.left;
  targetMouse.y = e.clientY - rect.top;
});

// Linear Interpolation Physics Momentum Delay Tracker
const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.parentElement.clientWidth;
  const displayHeight = canvas.parentElement.clientHeight;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  ctx.scale(dpr, dpr);

  if(targetMouse.x === 0 && targetMouse.y === 0) {
    targetMouse.x = displayWidth / 2;
    targetMouse.y = displayHeight / 2;
    mouse.x = targetMouse.x;
    mouse.y = targetMouse.y;
  }
}
window.addEventListener('resize', resizeCanvas);

// 3. MASTER PRELOADER SLIDE-OUT & HERO ENTRANCE SEQUENCE TIMELINE
function executeMasterTransitionTimeline() {
  const masterTimeline = gsap.timeline();

  // Step A: Lift the full-screen neon background mask layer upward
  masterTimeline.to('#site-preloader', {
    y: '-100%',
    duration: 1.1,
    ease: 'power4.inOut',
    delay: 1.5, // Keeps the logo breathing loop visible briefly for the user
    onComplete: () => {
      document.getElementById('site-preloader').style.display = 'none'; // Clear from rendering tree
    }
  });

  // Step B: Drop navigation clusters down into view space
  masterTimeline.from('.left-brand-group', { 
    y: -40, 
    opacity: 0, 
    duration: 0.9, 
    ease: 'power4.out' 
  }, '-=0.5')
  .from('.right-nav-group', { 
    y: -40, 
    opacity: 0, 
    duration: 0.9, 
    ease: 'power4.out' 
  }, '-=0.9');

  // Step C: Clip text blocks upwards from baseline positions
  masterTimeline.from('.giant-text', {
    y: '100%',
    duration: 1.2,
    stagger: 0.15,
    ease: 'power4.out'
  }, '-=0.7');

  // Step D: Elastically expand and fade canvas layers into active display coordinates
  masterTimeline.to(contentOpacity, {
    value: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=1')
  .to(canvasScale, {
    value: 1,
    duration: 1.4,
    ease: 'elastic.out(1, 0.85)'
  }, '-=1');

  // Step E: Pop open the dynamic brush-portal circle mask ring radius
  masterTimeline.to(maskRadius, {
    value: 160,
    duration: 1.2,
    ease: 'power3.out'
  }, '-=0.6');
}

// 4. FRAME RENDERING EXECUTION CYCLE
function renderLoop() {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);

  // Set up 1:1 square bounding dimensions relative to viewport sizes
  let rawSide = Math.min(w, h) * 0.85; 
  let sideLength = rawSide * canvasScale.value;

  const renderX = (w - sideLength) / 2;
  const renderY = (h - sideLength) / 2;

  // Track position smoothing inertia delay steps
  mouse.x = lerp(mouse.x, targetMouse.x, 0.07);
  mouse.y = lerp(mouse.y, targetMouse.y, 0.07);

  ctx.globalAlpha = contentOpacity.value;

  // --- LAYER 1: Render Base Image Layout (Normal Map) ---
  ctx.save();
  ctx.drawImage(imgCasual, renderX, renderY, sideLength, sideLength);
  ctx.restore();

  // --- LAYER 2: Render Masked Target Graphic Foreground (Neon Helmet) ---
  ctx.save();
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, maskRadius.value, 0, Math.PI * 2, false);
  ctx.clip(); // Restrict canvas clipping calculations strictly to circle dimensions
  
  ctx.drawImage(imgRacing, renderX, renderY, sideLength, sideLength);
  ctx.restore();

  ctx.globalAlpha = 1.0;

  requestAnimationFrame(renderLoop);
}
