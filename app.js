/* ============================================
   WeddingBudget.AI — App Logic
   Particle canvas, floating emojis, navigation,
   planner interactivity, decor gallery, stats
   ============================================ */

/* ---- STATE ---- */
const state = {
  currentTab: 'style',
  weddingType: null,
  guestCount: 500,
  budget: null,
  city: null,
  venueType: null,
  artists: new Set(),
  sundries: new Set(),
  completedTabs: new Set(),
};

const TAB_ORDER = ['style', 'venue', 'decor', 'food', 'artists', 'sundries', 'logistics', 'budget'];

/* ============================================
   PARTICLE CANVAS — Water ripple on mouse move
   ============================================ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  /* Mouse tracking */
  let mouseX = -2000, mouseY = -2000;
  let prevMX = -2000, prevMY = -2000;
  let mouseVX = 0, mouseVY = 0;

  /* Ripple events: { x, y, vx, vy, time, strength } */
  const ripples = [];
  const WAVE_SPEED  = 280;   // px/sec — how fast the ring expands
  const WAVE_WIDTH  = 70;    // ring thickness in px
  const MAX_RIPPLES = 25;

  const COLORS = [
    'rgba(233,30,140,',
    'rgba(255,107,157,',
    'rgba(201,79,160,',
    'rgba(244,143,177,',
    'rgba(255,60,120,',
  ];

  /* ---- Particle ---- */
  class Particle {
    constructor(hx, hy) {
      this.hx = hx; this.hy = hy;
      this.x  = hx + (Math.random() - 0.5) * 28;
      this.y  = hy + (Math.random() - 0.5) * 28;
      this.vx = 0; this.vy = 0;
      this.r         = Math.random() * 2.0 + 0.6;
      this.color     = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.baseAlpha = Math.random() * 0.40 + 0.12;
      this.alpha     = this.baseAlpha;
    }

    update(now) {
      const SPRING  = 0.038;
      const DAMPING = 0.86;
      this.vx += (this.hx - this.x) * SPRING;
      this.vy += (this.hy - this.y) * SPRING;

      let extraAlpha = 0;
      for (let i = 0; i < ripples.length; i++) {
        const rp      = ripples[i];
        const elapsed = (now - rp.time) / 1000;
        if (elapsed > 3.5) continue;

        const dx   = this.x - rp.x;
        const dy   = this.y - rp.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const waveR = elapsed * WAVE_SPEED;
        const gap   = Math.abs(dist - waveR);

        if (gap < WAVE_WIDTH) {
          const waveFactor = 1 - gap / WAVE_WIDTH;
          const decay      = Math.exp(-elapsed * 1.0);
          const force      = waveFactor * rp.strength * decay * 4.5;

          /* Radial push outward */
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;

          /* Directional brightness — leading edge of wave is brighter */
          const rmag = Math.sqrt(rp.vx * rp.vx + rp.vy * rp.vy) || 1;
          const dot  = (dx * rp.vx + dy * rp.vy) / (dist * rmag);
          const dirBoost = 0.5 + dot * 0.5;
          extraAlpha = Math.max(extraAlpha, waveFactor * decay * dirBoost * 0.9);
        }
      }

      this.vx *= DAMPING;
      this.vy *= DAMPING;
      this.x  += this.vx;
      this.y  += this.vy;

      const targetAlpha = this.baseAlpha + extraAlpha;
      this.alpha += (targetAlpha - this.alpha) * 0.12;
    }

    draw() {
      const boost = 1 + (this.alpha - this.baseAlpha) * 0.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r * boost, 0, Math.PI * 2);
      ctx.fillStyle = this.color + Math.min(this.alpha, 1).toFixed(3) + ')';
      ctx.fill();
    }
  }

  /* ---- Build grid ---- */
  let particles = [];
  function buildGrid() {
    particles = [];
    const SP = 38;
    const cols = Math.ceil(W / SP) + 1;
    const rows = Math.ceil(H / SP) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        particles.push(new Particle(
          c * SP + (Math.random() - 0.5) * SP * 0.5,
          r * SP + (Math.random() - 0.5) * SP * 0.5
        ));
      }
    }
  }
  buildGrid();

  /* ---- Mouse / touch ---- */
  function spawnRipple(x, y, vx, vy) {
    const spd = Math.sqrt(vx * vx + vy * vy);
    if (spd < 5) return;
    if (ripples.length >= MAX_RIPPLES) ripples.shift();
    ripples.push({ x, y, vx, vy, time: performance.now(),
                   strength: Math.min(spd / 18, 2.5) });
  }

  document.addEventListener('mousemove', (e) => {
    prevMX = mouseX; prevMY = mouseY;
    mouseX = e.clientX; mouseY = e.clientY;
    mouseVX = mouseX - prevMX; mouseVY = mouseY - prevMY;
    spawnRipple(mouseX, mouseY, mouseVX, mouseVY);
  });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    prevMX = mouseX; prevMY = mouseY;
    mouseX = t.clientX; mouseY = t.clientY;
    spawnRipple(mouseX, mouseY, mouseX - prevMX, mouseY - prevMY);
  }, { passive: true });

  /* ---- Render loop ---- */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    while (ripples.length && now - ripples[0].time > 3600) ripples.shift();
    particles.forEach(p => { p.update(now); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
  });
})();


/* ============================================
   FLOATING EMOJIS — Physics-based antigravity
   ============================================ */
(function initFloatingEmojis() {
  const emojis = document.querySelectorAll('.float-emoji');
  const emojiData = [];
  let mouseX = 0.5, mouseY = 0.5;

  emojis.forEach((el, i) => {
    const baseX = parseFloat(el.dataset.x) / 100;
    const baseY = parseFloat(el.dataset.y) / 100;
    const speed = parseFloat(el.dataset.speed);
    const phase = i * (Math.PI * 2 / emojis.length);

    el.style.left = (baseX * 100) + '%';
    el.style.top = (baseY * 100) + '%';

    emojiData.push({ el, baseX, baseY, speed, phase, cx: 0, cy: 0 });
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  let t = 0;
  function animateEmojis() {
    t += 0.008;
    emojiData.forEach((d, i) => {
      const bobY = Math.sin(t * d.speed * 3 + d.phase) * 14;
      const bobX = Math.cos(t * d.speed * 2 + d.phase) * 7;

      // Mouse repulsion — push emoji AWAY from cursor
      const dx = mouseX - d.baseX;
      const dy = mouseY - d.baseY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const REPEL_RADIUS = 0.22;  // trigger zone: 22% of screen
      const REPEL_STRENGTH = 8;   // max displacement in % units

      if (dist < REPEL_RADIUS) {
        // Normalized direction away from mouse, scaled by closeness
        const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
        const targetCx = -(dx / dist) * force;
        const targetCy = -(dy / dist) * force;
        d.cx += (targetCx - d.cx) * 0.10; // spring toward repulsion target
        d.cy += (targetCy - d.cy) * 0.10;
      } else {
        // Spring back to resting position when mouse is far
        d.cx += (0 - d.cx) * 0.06;
        d.cy += (0 - d.cy) * 0.06;
      }

      const finalX = d.baseX * 100 + bobX + d.cx;
      const finalY = d.baseY * 100 + bobY + d.cy;

      d.el.style.left = finalX + '%';
      d.el.style.top = finalY + '%';

      const scale = 1 + Math.sin(t * d.speed * 2 + d.phase) * 0.06;
      d.el.style.transform = `scale(${scale})`;
    });

    requestAnimationFrame(animateEmojis);
  }

  animateEmojis();
})();


/* ============================================
   HEADER — Scroll effect
   ============================================ */
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
});


/* ============================================
   SCROLL REVEAL
   ============================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.feature-card, .stat-item, .footer-brand, .footer-col');
  els.forEach(el => el.classList.add('scroll-reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('revealed'), i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
}


/* ============================================
   STATS COUNTER ANIMATION
   ============================================ */
function animateStats() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const dur = 1800;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / dur, 1);
      el.textContent = Math.round(easeOut(progress) * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

const statsSection = document.querySelector('.stats');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      animateStats();
      statsObserver.disconnect();
    }
  }, { threshold: 0.3 });
  statsObserver.observe(statsSection);
}


/* ============================================
   PAGE NAVIGATION
   ============================================ */
function showPlanner() {
  document.getElementById('landing-page').classList.remove('active');
  document.getElementById('planner-page').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  switchTab(state.currentTab);
}

function showLanding() {
  document.getElementById('planner-page').classList.remove('active');
  document.getElementById('landing-page').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchToPlanner(tab) {
  state.currentTab = tab;
  showPlanner();
  switchTab(tab);
}

function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileNav() {
  const nav = document.getElementById('main-nav');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
  nav.style.flexDirection = 'column';
  nav.style.position = 'absolute';
  nav.style.top = '64px';
  nav.style.left = '0';
  nav.style.right = '0';
  nav.style.background = 'rgba(255,255,255,0.98)';
  nav.style.padding = '12px 24px';
  nav.style.borderBottom = '1px solid #f0f0f0';
  nav.style.backdropFilter = 'blur(20px)';
  nav.style.zIndex = '200';
}


/* ============================================
   PLANNER TAB SWITCHING
   ============================================ */
function switchTab(tabId) {
  // Deactivate all tabs and sections
  document.querySelectorAll('.planner-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.planner-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.dot').forEach(d => {
    d.classList.remove('active');
    if (state.completedTabs.has(d.dataset.tab)) d.classList.add('completed');
    else d.classList.remove('completed');
  });

  // Mark current tab as active
  const tab = document.getElementById('tab-' + tabId);
  const section = document.getElementById('section-' + tabId);
  const dot = document.querySelector('.dot[data-tab="' + tabId + '"]');

  if (tab) tab.classList.add('active');
  if (section) section.classList.add('active');
  if (dot) { dot.classList.add('active'); dot.classList.remove('completed'); }

  state.currentTab = tabId;

  // Scroll to top of planner
  const plannerMain = document.querySelector('.planner-main');
  if (plannerMain) plannerMain.scrollTop = 0;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ============================================
   STYLE TAB — Interactions
   ============================================ */
function selectType(card) {
  // In the same grid, deselect siblings
  const grid = card.closest('.wedding-types-grid, .logistics-grid');
  if (grid) {
    grid.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  }
  card.classList.add('selected');

  // Tiny bounce animation
  card.animate([
    { transform: 'scale(0.96)' },
    { transform: 'scale(1.04)' },
    { transform: 'scale(1)' }
  ], { duration: 280, easing: 'ease-out' });
}

function updateGuestCount(val) {
  document.getElementById('guest-display').textContent = parseInt(val).toLocaleString('en-IN') + ' guests';
  state.guestCount = parseInt(val);
}

function selectBudget(card) {
  document.querySelectorAll('.budget-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  state.budget = parseInt(card.dataset.budget);
}


/* ============================================
   VENUE TAB — City selector
   ============================================ */
function selectCity(chip) {
  document.querySelectorAll('.city-chips .chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.city = chip.textContent;
  const input = document.getElementById('city-input');
  if (input) input.value = chip.textContent;
}


/* ============================================
   DECOR GALLERY
   ============================================ */
const decorItems = [
  { name: 'Floral Arch Mandap', tags: ['high', 'romantic'], price: '₹2.6L', range: '₹2.1L – ₹3.1L', emoji: '🌺' },
  { name: 'Candle Centerpieces', tags: ['low', 'minimalist'], price: '₹34K', range: '₹27K – ₹41K', emoji: '🕯️' },
  { name: 'Marigold Garland Entrance', tags: ['medium', 'traditional'], price: '₹50K', range: '₹40K – ₹60K', emoji: '🌼' },
  { name: 'LED Fairy Light Ceiling', tags: ['high', 'modern'], price: '₹1.7L', range: '₹1.4L – ₹2.0L', emoji: '✨' },
  { name: 'Tropical Leaf Backdrop', tags: ['medium', 'boho'], price: '₹70K', range: '₹56K – ₹84K', emoji: '🌿' },
  { name: 'Diya Pathway Lighting', tags: ['low', 'traditional'], price: '₹18K', range: '₹12K – ₹24K', emoji: '🪔' },
  { name: 'Crystal Chandelier', tags: ['high', 'luxury'], price: '₹4.5L', range: '₹3.5L – ₹5.5L', emoji: '💎' },
  { name: 'Rose Petal Aisle', tags: ['medium', 'romantic'], price: '₹45K', range: '₹35K – ₹55K', emoji: '🌹' },
  { name: 'Minimalist White Setup', tags: ['low', 'minimalist'], price: '₹25K', range: '₹20K – ₹30K', emoji: '🏛️' },
  { name: 'Royal Pillar Draping', tags: ['high', 'luxury'], price: '₹3.2L', range: '₹2.5L – ₹4L', emoji: '🏰' },
  { name: 'Boho Dream Catcher Wall', tags: ['medium', 'boho'], price: '₹60K', range: '₹48K – ₹72K', emoji: '🕸️' },
  { name: 'Modern Geometric Frame', tags: ['medium', 'modern'], price: '₹80K', range: '₹65K – ₹95K', emoji: '📐' },
];

let currentFilter = 'all';

function buildDecorGrid(filter = 'all') {
  const grid = document.getElementById('decor-grid');
  if (!grid) return;

  const filtered = filter === 'all'
    ? decorItems
    : decorItems.filter(item => item.tags.includes(filter));

  grid.innerHTML = filtered.map(item => `
    <div class="decor-card" onclick="this.classList.toggle('selected')">
      <div class="decor-img-placeholder" style="background: ${getDecorBg(item.tags)}">
        <span style="font-size: 2.8rem">${item.emoji}</span>
      </div>
      <div class="decor-info">
        <div class="decor-name">${item.name}</div>
        <div class="decor-tags">
          ${item.tags.map(t => `<span class="decor-tag tag-${t}">${capitalize(t)}</span>`).join('')}
        </div>
        <div class="decor-price">${item.price}</div>
        <div class="decor-price-range">${item.range}</div>
      </div>
    </div>
  `).join('');
}

function getDecorBg(tags) {
  if (tags.includes('romantic')) return 'linear-gradient(135deg, #fce4ec, #f8bbd0)';
  if (tags.includes('traditional')) return 'linear-gradient(135deg, #fff8e1, #ffe0b2)';
  if (tags.includes('modern')) return 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
  if (tags.includes('luxury')) return 'linear-gradient(135deg, #f3e5f5, #e1bee7)';
  if (tags.includes('minimalist')) return 'linear-gradient(135deg, #f5f5f5, #eeeeee)';
  if (tags.includes('boho')) return 'linear-gradient(135deg, #fbe9e7, #ffccbc)';
  return 'linear-gradient(135deg, #f0e6ff, #ffe4f0)';
}

function filterDecor(chip, filter) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  currentFilter = filter;
  buildDecorGrid(filter);
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }


/* ============================================
   FOOD TAB — Preferences
   ============================================ */
function togglePref(chip) {
  chip.classList.toggle('active');
}


/* ============================================
   ARTISTS TAB
   ============================================ */
function toggleArtist(card) {
  card.classList.toggle('selected');
  const name = card.querySelector('.artist-name').textContent;
  if (card.classList.contains('selected')) {
    state.artists.add(name);
  } else {
    state.artists.delete(name);
  }
}


/* ============================================
   SUNDRIES TAB
   ============================================ */
function updateSundry(checkbox) {
  const item = checkbox.closest('.sundry-item');
  const name = item.querySelector('.sundry-name').textContent;
  if (checkbox.checked) {
    state.sundries.add(name);
    item.style.background = 'rgba(233,30,140,0.03)';
  } else {
    state.sundries.delete(name);
    item.style.background = '';
  }
}


/* ============================================
   EXPORT FUNCTIONS
   ============================================ */
function exportPDF() {
  showToast('📄 Generating PDF report…');
  setTimeout(() => showToast('✅ PDF ready to download!'), 1500);
}

function exportSheet() {
  showToast('📊 Exporting to spreadsheet…');
  setTimeout(() => showToast('✅ Sheet exported successfully!'), 1500);
}

function shareLink() {
  const url = window.location.href;
  navigator.clipboard?.writeText(url).then(() => {
    showToast('🔗 Link copied to clipboard!');
  }).catch(() => {
    showToast('🔗 Share this link: ' + url);
  });
}


/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #1a1a2e;
      color: #fff;
      padding: 14px 28px;
      border-radius: 50px;
      font-size: 0.92rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      z-index: 9999;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      opacity: 0;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      white-space: nowrap;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.transform = 'translateX(-50%) translateY(0)';
  toast.style.opacity = '1';

  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity = '0';
  }, 2800);
}


/* ============================================
   HERO BUTTON PULSE EFFECT
   ============================================ */
(function addHeroButtonEffect() {
  const btn = document.getElementById('hero-start-btn');
  if (!btn) return;

  setInterval(() => {
    btn.animate([
      { boxShadow: '0 0 0 0 rgba(233,30,140,0.4)' },
      { boxShadow: '0 0 0 12px rgba(233,30,140,0)' }
    ], { duration: 1400, easing: 'ease-out' });
  }, 2500);
})();


/* ============================================
   RIPPLE EFFECT on clickable cards
   ============================================ */
document.addEventListener('click', (e) => {
  const card = e.target.closest('.type-card, .budget-card, .artist-card, .decor-card, .feature-card');
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height) * 2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: rgba(233,30,140,0.28);
    transform: scale(0);
    opacity: 1;
    animation: rippleOut 0.65s ease-out forwards;
    pointer-events: none;
    z-index: 10;
  `;

  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleOut {
    from { transform: scale(0); opacity: 1; }
    to   { transform: scale(1); opacity: 0; }
  }
`;
document.head.appendChild(style);


/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  buildDecorGrid();

  // Set floating emoji initial positions
  document.querySelectorAll('.float-emoji').forEach(el => {
    const x = parseFloat(el.dataset.x);
    const y = parseFloat(el.dataset.y);
    el.style.left = x + '%';
    el.style.top = y + '%';
  });

  // Progress dots click navigation
  document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', () => switchTab(dot.dataset.tab));
  });

  // Planner nav links update
  document.querySelectorAll('.planner-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = tab.id.replace('tab-', '');
      switchTab(tabId);
    });
  });
});
