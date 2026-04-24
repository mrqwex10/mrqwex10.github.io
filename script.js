/* ═══════════════════════════════════════════════════════════
   JACOB SMITH — PORTFOLIO SCRIPT
   Boot · Three.js · Grain · Screen Tear · Glitch · Typewriter
═══════════════════════════════════════════════════════════ */

/* ── BOOT SEQUENCE ─────────────────────────────────────── */
(function runBoot() {
  const fill  = document.getElementById('boot-fill');
  const pct   = document.getElementById('boot-pct');
  const lines = ['bl-1','bl-2','bl-3'].map(id => document.getElementById(id));
  const syms  = ['bs-tri','bs-cir','bs-cro','bs-squ'].map(id => document.getElementById(id));
  const screen = document.getElementById('boot-screen');
  const port   = document.getElementById('portfolio');

  // Reveal symbols
  syms.forEach((s, i) => setTimeout(() => s.classList.add('show'), 500 + i * 180));

  // Reveal text lines
  lines.forEach((l, i) => setTimeout(() => l.classList.add('show'), 1200 + i * 320));

  // Progress bar — starts fast, hesitates near 100
  let progress = 0;
  const tick = setInterval(() => {
    const speed = progress < 85 ? Math.random() * 5 + 2 : Math.random() * 1 + 0.3;
    progress = Math.min(progress + speed, 100);
    fill.style.width = progress + '%';
    pct.textContent  = Math.floor(progress) + '%';
    if (progress >= 100) clearInterval(tick);
  }, 55);

  // Glitch exit — reveal portfolio
  setTimeout(() => {
    screen.style.animation = 'boot-exit 0.55s ease forwards';
    setTimeout(() => {
      screen.style.display = 'none';
      port.classList.remove('hidden');
      document.getElementById('warning-strip').classList.remove('hidden');
      initPortfolio();
    }, 520);
  }, 4400);
})();

const exitAnim = document.createElement('style');
exitAnim.textContent = `
  @keyframes boot-exit {
    0%  { opacity:1; filter:none; transform:none; }
    15% { opacity:1; filter:hue-rotate(90deg) contrast(2); transform:translateX(-5px) skewX(3deg); }
    30% { opacity:1; filter:hue-rotate(180deg); transform:translateX(5px) skewX(-3deg); }
    55% { opacity:0.6; filter:brightness(4) saturate(0); transform:scaleY(0.6); }
    80% { opacity:0.1; transform:scaleY(0.05); }
    100%{ opacity:0; transform:scaleY(0); }
  }
`;
document.head.appendChild(exitAnim);

/* ══════════════════════════════════════════════════════════
   MAIN INIT
══════════════════════════════════════════════════════════ */
function initPortfolio() {
  initThreeScene();
  initGrainCanvas();
  initTypewriter();
  initNavScroll();
  initReveal();
  initRandomGlitch();
  initScreenTear();
}

/* ── THREE.JS SCENE ────────────────────────────────────── */
function initThreeScene() {
  if (typeof THREE === 'undefined') return;

  const canvas   = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.z = 65;

  scene.fog = new THREE.FogExp2(0x000208, 0.011);

  // Colour palette — mostly cold, with a few blood-red objects
  const cold  = [0x00ccff, 0x3366dd, 0x0044aa, 0x006688];
  const hot   = [0xcc0000, 0xff2200];
  const allColors = [...cold, ...cold, ...cold, ...hot]; // mostly cold

  const geoFactories = [
    () => new THREE.IcosahedronGeometry(2.6, 0),
    () => new THREE.OctahedronGeometry(2.3, 0),
    () => new THREE.TetrahedronGeometry(2.5, 0),
    () => new THREE.DodecahedronGeometry(1.9, 0),
    () => new THREE.TorusGeometry(2.4, 0.4, 6, 6),
    () => new THREE.TorusKnotGeometry(1.5, 0.35, 50, 6),
    () => new THREE.IcosahedronGeometry(1.5, 0),
    () => new THREE.OctahedronGeometry(3.0, 0),
    () => new THREE.TorusGeometry(1.8, 0.3, 5, 5),
    () => new THREE.TetrahedronGeometry(1.9, 0),
    () => new THREE.DodecahedronGeometry(2.3, 0),
    () => new THREE.IcosahedronGeometry(3.2, 0),
    () => new THREE.TorusKnotGeometry(1.2, 0.28, 40, 5),
    () => new THREE.OctahedronGeometry(1.7, 0),
  ];

  const objects = geoFactories.map((factory, i) => {
    const mat  = new THREE.MeshBasicMaterial({
      color: allColors[i % allColors.length],
      wireframe: true,
      transparent: true,
      opacity: 0.16 + Math.random() * 0.13,
    });
    const mesh = new THREE.Mesh(factory(), mat);
    const spread = 70;
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread * 0.65,
      (Math.random() - 0.5) * 45 - 12
    );
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, 0);
    mesh.userData.rx   = (Math.random() - 0.5) * 0.005;
    mesh.userData.ry   = (Math.random() - 0.5) * 0.007;
    mesh.userData.fOff = Math.random() * Math.PI * 2;
    mesh.userData.fSpd = 0.25 + Math.random() * 0.45;
    scene.add(mesh);
    return mesh;
  });

  // Particle field
  const pCount = 700;
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i*3]   = (Math.random()-0.5)*220;
    pPos[i*3+1] = (Math.random()-0.5)*220;
    pPos[i*3+2] = (Math.random()-0.5)*130 - 20;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x224455, size: 0.22, transparent: true, opacity: 0.55
  })));

  // Mouse parallax
  const mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    t += 0.016;
    objects.forEach(o => {
      o.rotation.x += o.userData.rx;
      o.rotation.y += o.userData.ry;
      o.position.y += Math.sin(t * o.userData.fSpd + o.userData.fOff) * 0.007;
    });
    camera.position.x += (mouse.x * 5 - camera.position.x) * 0.025;
    camera.position.y += (-mouse.y * 3 - camera.position.y) * 0.025;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  })();
}

/* ── ANIMATED FILM GRAIN ────────────────────────────────── */
function initGrainCanvas() {
  const c   = document.getElementById('grain-canvas');
  const ctx = c.getContext('2d');
  let frame = 0;

  const resize = () => {
    // Half-res for perf — CSS stretches it
    c.width  = Math.ceil(window.innerWidth  / 2);
    c.height = Math.ceil(window.innerHeight / 2);
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  (function draw() {
    requestAnimationFrame(draw);
    frame++;
    if (frame % 3 !== 0) return; // ~20fps update
    const { width, height } = c;
    const img  = ctx.createImageData(width, height);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  })();
}

/* ── TYPEWRITER ─────────────────────────────────────────── */
function initTypewriter() {
  const titles = [
    'ELECTRICAL ENGINEER',
    'FPGA DEVELOPER',
    'SYSTEMS INTEGRATOR',
    'WEB DEVELOPER',
    'I BUILD THINGS THAT DON\'T FAIL',
  ];
  const el   = document.getElementById('typewriter');
  let ti = 0, ci = 0, deleting = false;

  function tick() {
    const word = titles[ti];
    if (!deleting) {
      ci++;
      el.textContent = word.slice(0, ci);
      if (ci === word.length) {
        deleting = true;
        return setTimeout(tick, 2000);
      }
    } else {
      ci--;
      el.textContent = word.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        ti = (ti + 1) % titles.length;
      }
    }
    setTimeout(tick, deleting ? 38 : 78);
  }
  tick();
}

/* ── NAV SCROLL ─────────────────────────────────────────── */
function initNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ── REVEAL ON SCROLL ───────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── RANDOM ELEMENT GLITCH ──────────────────────────────── */
function initRandomGlitch() {
  const targets = () => [
    ...document.querySelectorAll('.fe-company'),
    ...document.querySelectorAll('.sh-title'),
    ...document.querySelectorAll('.proj-title'),
    ...document.querySelectorAll('.contact-headline'),
  ];

  function strike() {
    const els = targets();
    if (!els.length) return schedule();
    const el = els[Math.floor(Math.random() * els.length)];

    // Frame 1
    el.style.cssText = 'filter:hue-rotate(180deg) contrast(2.5) brightness(1.5);transform:translateX(-5px) skewX(2deg);transition:none';
    setTimeout(() => {
      // Frame 2
      el.style.cssText = 'filter:hue-rotate(90deg) saturate(3);transform:translateX(4px) skewX(-1deg);transition:none';
      setTimeout(() => {
        // Frame 3 — snap back
        el.style.cssText = '';
        setTimeout(() => {
          // Optional micro-second blip
          if (Math.random() > 0.5) {
            el.style.cssText = 'filter:brightness(3) saturate(0);transform:translateX(2px);transition:none';
            setTimeout(() => { el.style.cssText = ''; }, 45);
          }
        }, 80);
      }, 60);
    }, 55);

    schedule();
  }

  function schedule() {
    setTimeout(strike, 2500 + Math.random() * 6000);
  }
  setTimeout(strike, 4000); // first strike after 4s
}

/* ── SCREEN TEAR ────────────────────────────────────────── */
function initScreenTear() {
  const tears = Array.from({ length: 3 }, () => {
    const d = document.createElement('div');
    d.style.cssText = [
      'position:fixed',
      'left:0',
      'right:0',
      'pointer-events:none',
      'z-index:9990',
      'display:none',
      'mix-blend-mode:screen',
    ].join(';');
    document.body.appendChild(d);
    return d;
  });

  function tear() {
    const activeCount = Math.random() > 0.6 ? 2 : 1;
    for (let i = 0; i < activeCount; i++) {
      const t = tears[i];
      const top = Math.random() * 100;
      const h   = Math.random() < 0.5 ? 1 : (Math.random() * 3 + 1);
      const isRed = Math.random() > 0.7;
      t.style.top      = top + 'vh';
      t.style.height   = h + 'px';
      t.style.background = isRed ? 'rgba(220,0,0,0.6)' : 'rgba(0,180,255,0.55)';
      t.style.boxShadow  = isRed
        ? '0 0 8px rgba(200,0,0,0.8)'
        : '0 0 6px rgba(0,200,255,0.7)';
      t.style.display  = 'block';
      const dur = 40 + Math.random() * 80;
      setTimeout(() => { t.style.display = 'none'; }, dur);
    }
    setTimeout(tear, 3500 + Math.random() * 9000);
  }
  setTimeout(tear, 6000);
}
