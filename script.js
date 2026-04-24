/* ═══════════════════════════════════════════════════════════
   PS2 PORTFOLIO — SCRIPT
   Boot sequence · Three.js scene · Typewriter · Interactions
═══════════════════════════════════════════════════════════ */

/* ── BOOT SEQUENCE ─────────────────────────────────────── */
(function runBoot() {
  const fill    = document.getElementById('boot-fill');
  const pct     = document.getElementById('boot-pct');
  const lines   = [document.getElementById('bl-1'), document.getElementById('bl-2'), document.getElementById('bl-3')];
  const syms    = [document.getElementById('bs-tri'), document.getElementById('bs-cir'), document.getElementById('bs-cro'), document.getElementById('bs-squ')];
  const screen  = document.getElementById('boot-screen');
  const port    = document.getElementById('portfolio');

  // Show symbols one by one
  syms.forEach((s, i) => setTimeout(() => s.classList.add('show'), 600 + i * 200));

  // Show text lines
  lines.forEach((l, i) => setTimeout(() => l.classList.add('show'), 1400 + i * 300));

  // Animate progress bar
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 4 + 1;
    if (progress >= 100) progress = 100;
    fill.style.width = progress + '%';
    pct.textContent  = Math.floor(progress) + '%';
    if (progress >= 100) clearInterval(interval);
  }, 60);

  // Glitch out and reveal portfolio after ~4.2s
  setTimeout(() => {
    screen.style.animation = 'boot-glitch-out 0.5s ease forwards';
    setTimeout(() => {
      screen.style.display = 'none';
      port.classList.remove('hidden');
      initPortfolio();
    }, 480);
  }, 4200);
})();

// Boot exit animation (injected dynamically to avoid blocking parse)
const bootStyle = document.createElement('style');
bootStyle.textContent = `
  @keyframes boot-glitch-out {
    0%  { opacity:1; transform:none; filter:none; }
    20% { opacity:1; transform:translateX(-6px) skewX(2deg); filter:hue-rotate(90deg); }
    40% { opacity:1; transform:translateX(6px) skewX(-2deg); filter:hue-rotate(180deg); }
    60% { opacity:0.5; transform:scaleY(0.8); filter:brightness(3); }
    80% { opacity:0.2; transform:scaleY(0.1); }
    100%{ opacity:0; transform:scaleY(0); }
  }
`;
document.head.appendChild(bootStyle);

/* ══════════════════════════════════════════════════════════
   MAIN INIT — runs after boot screen fades
══════════════════════════════════════════════════════════ */
function initPortfolio() {
  initThreeScene();
  initTypewriter();
  initNavScroll();
  initReveal();
  initSkillBars();
  initCounters();
}

/* ── THREE.JS BACKGROUND SCENE ─────────────────────────── */
function initThreeScene() {
  if (typeof THREE === 'undefined') return;

  const canvas   = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 0, 60);

  // Subtle blue fog
  scene.fog = new THREE.FogExp2(0x000510, 0.012);

  // ── Floating wireframe objects
  const colors = [0x00d4ff, 0x448aff, 0x00e676, 0xe91e63, 0xff9100];

  const makeGeos = () => [
    new THREE.IcosahedronGeometry(2.5, 0),
    new THREE.OctahedronGeometry(2.2, 0),
    new THREE.TetrahedronGeometry(2.4, 0),
    new THREE.DodecahedronGeometry(1.8, 0),
    new THREE.TorusGeometry(2.2, 0.4, 6, 6),
    new THREE.TorusKnotGeometry(1.4, 0.35, 50, 6),
    new THREE.IcosahedronGeometry(1.4, 0),
    new THREE.OctahedronGeometry(1.6, 0),
    new THREE.TorusGeometry(1.6, 0.3, 5, 5),
    new THREE.TetrahedronGeometry(1.8, 0),
    new THREE.DodecahedronGeometry(2.2, 0),
    new THREE.IcosahedronGeometry(3, 0),
  ];

  const objects = makeGeos().map((geo, i) => {
    const mat = new THREE.MeshBasicMaterial({
      color: colors[i % colors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.18 + Math.random() * 0.14,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const spread = 65;
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.7,
      (Math.random() - 0.5) * 40 - 10
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData.rotX = (Math.random() - 0.5) * 0.004;
    mesh.userData.rotY = (Math.random() - 0.5) * 0.006;
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    mesh.userData.floatSpeed  = 0.3 + Math.random() * 0.4;
    scene.add(mesh);
    return mesh;
  });

  // ── Particle field (stars)
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x4488aa, size: 0.25, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(pGeo, pMat));

  // ── Mouse parallax
  const mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Animation loop
  let clock = 0;
  (function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;

    objects.forEach(obj => {
      obj.rotation.x += obj.userData.rotX;
      obj.rotation.y += obj.userData.rotY;
      obj.position.y += Math.sin(clock * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.008;
    });

    // Smooth camera parallax
    camera.position.x += (mouse.x * 4 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  })();
}

/* ── TYPEWRITER EFFECT ─────────────────────────────────── */
function initTypewriter() {
  // EDIT: Add your titles here
  const titles = [
    'FULL STACK DEVELOPER',
    'UI / UX ENTHUSIAST',
    'OPEN SOURCE BUILDER',
    'CREATIVE TECHNOLOGIST',
  ];

  const el = document.getElementById('typewriter');
  let ti = 0, ci = 0, deleting = false;
  const SPEED_TYPE = 80, SPEED_DELETE = 40, PAUSE = 1800;

  function tick() {
    const current = titles[ti];
    if (!deleting) {
      ci++;
      el.textContent = current.slice(0, ci);
      if (ci === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      ci--;
      el.textContent = current.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        ti = (ti + 1) % titles.length;
      }
    }
    setTimeout(tick, deleting ? SPEED_DELETE : SPEED_TYPE);
  }
  tick();
}

/* ── NAV SCROLL BEHAVIOR ───────────────────────────────── */
function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── REVEAL ON SCROLL ──────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── SKILL BARS ────────────────────────────────────────── */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.sk-bar').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.skill-card').forEach(c => obs.observe(c));
}

/* ── COUNTER ANIMATION ─────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.stat-n').forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        let current  = 0;
        const step   = Math.max(1, Math.floor(target / 30));
        const t = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = current;
          if (current >= target) clearInterval(t);
        }, 40);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  const aboutSection = document.getElementById('about');
  if (aboutSection) obs.observe(aboutSection);
}
