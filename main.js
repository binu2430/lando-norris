import { gsap } from "gsap";
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

let mouse = { x: 0, y: 0 };
let targetMouse = { x: 0, y: 0 };
let maskRadius = { value: 0 };       
let canvasScale = { value: 0.85 };    
let contentOpacity = { value: 0 };    

let assetsLoaded = 0;
function checkAssets() {
  assetsLoaded++;
  if (assetsLoaded === 2) {
    resizeCanvas();
    renderLoop();                     
    executeMasterTransitionTimeline(); 
  }
}
imgCasual.onload = checkAssets;
imgRacing.onload = checkAssets;

window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  targetMouse.x = e.clientX - rect.left;
  targetMouse.y = e.clientY - rect.top;
});

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

// 3. MASTER PRELOADER & HERO CINEMATIC ENTRANCE TIMELINE
function executeMasterTransitionTimeline() {
  const masterTimeline = gsap.timeline();

  masterTimeline.to('#site-preloader', {
    y: '-100%',
    duration: 1.1,
    ease: 'power4.inOut',
    delay: 1.5, 
    onComplete: () => {
      document.getElementById('site-preloader').style.display = 'none'; 
    }
  });

  masterTimeline.from('.navbar', { y: -40, opacity: 0, duration: 0.9, ease: 'power4.out' }, '-=0.5');

  masterTimeline.to(contentOpacity, {
    value: 1,
    duration: 0.8,
    ease: 'power2.out'
  }, '-=0.5')
  .to(canvasScale, {
    value: 1,
    duration: 1.4,
    ease: 'elastic.out(1, 0.85)'
  }, '-=0.5');

  masterTimeline.to(maskRadius, {
    value: 160,
    duration: 1.2,
    ease: 'power3.out'
  }, '-=0.6')
  .from('.race-details-badge', { opacity: 0, y: 20, duration: 0.6 }, '-=0.4');
}

// 4. FRAME RENDERING EXECUTION CYCLE
function renderLoop() {
  const w = canvas.width / (window.devicePixelRatio || 1);
  const h = canvas.height / (window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);

  let rawSide = Math.min(w, h) * 0.85; 
  let sideLength = rawSide * canvasScale.value;

  const renderX = (w - sideLength) / 2;
  const renderY = (h - sideLength) / 2;

  mouse.x = lerp(mouse.x, targetMouse.x, 0.07);
  mouse.y = lerp(mouse.y, targetMouse.y, 0.07);

  ctx.globalAlpha = contentOpacity.value;

  ctx.save();
  ctx.drawImage(imgCasual, renderX, renderY, sideLength, sideLength);
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, maskRadius.value, 0, Math.PI * 2, false);
  ctx.clip(); 
  
  ctx.drawImage(imgRacing, renderX, renderY, sideLength, sideLength);
  ctx.restore();

  ctx.globalAlpha = 1.0;

  requestAnimationFrame(renderLoop);
}
