/* ── Waveform / spectrogram animation (landscape + portrait) ── */
      (function () {

        /* ── 1. Shared pieces ── */
      
        const mq = window.matchMedia('(max-width: 720px)');
      
        const BAR_W = 3;
        const GAP   = 10;
        const STEP  = BAR_W + GAP;
      
        // Buttons are recoloured page-wide, exactly as before (both heroes' buttons included).
        const buttons = document.querySelectorAll('.btn-primary, .btn-ghost');
      
        // Slow colour cycle between teal (#00c8a0) and pink (#ff2d78), plus its inverse for buttons.
        function getColors(t) {
          const cycle = (-Math.cos(t * 0.007) + 1) / 2;
          const inv   = 1 - cycle;
          return {
            r:  Math.round(0   + cycle * 255),
            g:  Math.round(200 - cycle * 155),
            b:  Math.round(160 - cycle * 40),
            rb: Math.round(0   + inv * 255),
            gb: Math.round(200 - inv * 155),
            bb: Math.round(160 - inv * 40)
          };
        }
      
        /* ── 2. Landscape ── */
      
        function makeLandscape() {
          const hero   = document.getElementById('hero-landscape');
          const canvas = document.getElementById('waveCanvasLandscape');
          const ctx    = canvas.getContext('2d');
          const title  = hero.querySelector('.hero-title-landscape');
          let W, H;
      
          function resize() {
            const heroRect  = hero.getBoundingClientRect();
            const titleRect = title.getBoundingClientRect();
            // canvas spans full page width, height matches title height with some breathing room
            const padding = titleRect.height * 0.5;
            W = canvas.width  = window.innerWidth;
            H = canvas.height = titleRect.height + padding * 2;
            // position canvas so its vertical centre aligns with the title's vertical centre
            const titleMidRelativeToHero = (titleRect.top + titleRect.height / 2) - heroRect.top;
            canvas.style.width = W + 'px';
            canvas.style.top   = (titleMidRelativeToHero - H / 2) + 'px';
          }
      
          function draw(t, c) {
            ctx.clearRect(0, 0, W, H);
            const cy = H / 2;
      
            const count   = Math.floor(W / STEP);
            const offsetX = (W - count * STEP) / 2;
      
            for (let i = 0; i < count; i++) {
              const bx   = offsetX + i * STEP + BAR_W / 2;
              const norm = i / count;
              const shape = Math.abs(Math.sin(norm * Math.PI * 3.2)) * 0.7
                          + Math.abs(Math.sin(norm * Math.PI * 1.7 + 1.3)) * 0.3;
              const breathe = 0.5 + 0.5 * Math.sin(t * 0.04 + i * 0.9);
              const amp   = (shape * 0.6 + breathe * 0.4) * H * 0.18 + 4;
              const halfH = Math.min(amp, H * 0.18);
      
              const grad = ctx.createLinearGradient(0, cy - halfH, 0, cy + halfH);
              grad.addColorStop(0,    `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
              grad.addColorStop(0.12, `rgba(${c.r}, ${c.g}, ${c.b}, 0.85)`);
              grad.addColorStop(0.5,  `rgba(${c.r}, ${c.g}, ${c.b}, 0.95)`);
              grad.addColorStop(0.88, `rgba(${c.r}, ${c.g}, ${c.b}, 0.85)`);
              grad.addColorStop(1,    `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
      
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(bx - BAR_W / 2, cy - halfH, BAR_W, halfH * 2, 1.5);
              ctx.fill();
            }
          }
      
          return { hero, title, accentWord: hero.querySelector('.accent-word'), resize, draw };
        }
      
        /* ── 3. Portrait ── */
      
        function makePortrait() {
          const hero   = document.getElementById('hero-portrait');
          const canvas = document.getElementById('waveCanvasPortrait');
          const ctx    = canvas.getContext('2d');
          const title  = hero.querySelector('.hero-title-portrait');
      
          const TITLE_INSET = 24;      // px: + moves the title edges (yTop/yBot) outward, - inward
          const FEATHER     = 24;     // px: softness of the dimmed band's edges
          const DIM         = 0.07;   // opacity behind the title (same as landscape mask)

          let W, H, maxBar, yTop, yBot;
      
          function resize() {
            const heroRect  = hero.getBoundingClientRect();
            const titleRect = title.getBoundingClientRect();
      
            // The title's top margin (from --wave-reach in CSS) is the room for the wave halves.
            const reach = parseFloat(getComputedStyle(title).marginTop);
            maxBar = reach * 0.75;
      
            W = hero.clientWidth;
            H = titleRect.height + reach * 2;
            yTop = reach - TITLE_INSET;                        // baseline A (title top edge)
            yBot = reach + titleRect.height + TITLE_INSET;     // baseline B (title bottom edge)
      
            // crisp bars on high-DPI screens
            const dpr = window.devicePixelRatio || 1;
            canvas.width  = Math.round(W * dpr);
            canvas.height = Math.round(H * dpr);
            canvas.style.width  = W + 'px';
            canvas.style.height = H + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
            canvas.style.top = (titleRect.top - heroRect.top - reach) + 'px';
            const mask = `linear-gradient(to bottom,
              black 0, black ${yTop - FEATHER}px,
              rgba(0,0,0,${DIM}) ${yTop + FEATHER}px, rgba(0,0,0,${DIM}) ${yBot - FEATHER}px,
              black ${yBot + FEATHER}px, black 100%)`;
            canvas.style.maskImage = mask;
            canvas.style.webkitMaskImage = mask;   // older Safari
          }
      
          function draw(t, c) {
            ctx.clearRect(0, 0, W, H);
      
            const count   = Math.floor(W / STEP);
            const offsetX = (W - count * STEP) / 2;
      
            for (let i = 0; i < count; i++) {
              const bx   = offsetX + i * STEP + BAR_W / 2;
              const norm = i / count;
              const shape = Math.abs(Math.sin(norm * Math.PI * 3.2)) * 0.7
                          + Math.abs(Math.sin(norm * Math.PI * 1.7 + 1.3)) * 0.3;
              const breathe = 0.5 + 0.5 * Math.sin(t * 0.04 + i * 0.9);
      
              const len = Math.min((shape * 0.6 + breathe * 0.4) * maxBar + 4, maxBar);

              const top    = yTop - len;
              const bottom = yBot + len;
              const total  = bottom - top;
              const f      = 0.24 * len / total;   // tip fade = 24% of len, as in the split version

              const grad = ctx.createLinearGradient(0, top, 0, bottom);
              grad.addColorStop(0,     `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
              grad.addColorStop(f,     `rgba(${c.r}, ${c.g}, ${c.b}, 0.85)`);
              grad.addColorStop(0.5,   `rgba(${c.r}, ${c.g}, ${c.b}, 0.95)`);
              grad.addColorStop(1 - f, `rgba(${c.r}, ${c.g}, ${c.b}, 0.85)`);
              grad.addColorStop(1,     `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.roundRect(bx - BAR_W / 2, top, BAR_W, total, 1.5);
              ctx.fill();
            }
          }
      
          return { hero, title, accentWord: hero.querySelector('.accent-word'), resize, draw };
        }
      
        /* ── 4. Switcher: pick the right version, run the loop, keep observers in sync ── */
      
        const landscape = makeLandscape();
        const portrait  = makePortrait();
      
        let active = null;     // whichever of the two is currently shown
        let t = 0;             // animation clock (shared, so the colour cycle continues across a switch)
        let animId = null;
      
        function frame() {
          const c = getColors(t);
      
          // recolour the VISIBLE hero's accent word, and the buttons
          active.accentWord.style.color = `rgb(${c.r}, ${c.g}, ${c.b})`;
          buttons.forEach(el => { el.style.background = `rgb(${c.rb}, ${c.gb}, ${c.bb})`; });
      
          active.draw(t, c);
          t++;
          animId = requestAnimationFrame(frame);
        }
        function start() { if (!animId) frame(); }
        function stop()  { cancelAnimationFrame(animId); animId = null; }
      
        // Re-measure when the active hero or its title changes size
        // (window resize, rotation, web font finishing loading).
        const ro = new ResizeObserver(() => active.resize());
      
        // Pause the animation while the active hero is scrolled out of view (perf).
        // An observer always reports once right after observe(), so this also starts the loop.
        const visObs = new IntersectionObserver(entries => {
          const e = entries[entries.length - 1];
          if (e.isIntersecting) start(); else stop();
        }, { threshold: 0 });
      
        function activate(version) {
          stop();
          active = version;
      
          ro.disconnect();
          ro.observe(active.hero);
          ro.observe(active.title);
      
          visObs.disconnect();
          visObs.observe(active.hero);
      
          active.resize();
        }
      
        // Switch automatically whenever the window crosses the breakpoint.
        mq.addEventListener('change', e => activate(e.matches ? portrait : landscape));
        document.fonts.ready.then(() => active.resize());
      
        activate(mq.matches ? portrait : landscape);
      
      })();

/* ── Active nav link on scroll ── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const navObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.25 });
sections.forEach(s => navObs.observe(s));

/* ── Wave divider setup + trigger ── */
(function() {
  const BAR_COUNT = 26;

  function buildDividers() {
    document.querySelectorAll('.wave-divider-bars').forEach(function(zone) {
      zone.innerHTML = '';
      for (var i = 0; i < BAR_COUNT; i++) {
        var p = i / (BAR_COUNT - 1); // 0..1, no symmetry
        // two independent sine components at inharmonic frequencies — no shared symmetry axis
        var a = Math.pow(Math.abs(Math.sin(p * Math.PI * 5.3 + 0.4)), 0.45) * 0.55;
        var b = Math.pow(Math.abs(Math.sin(p * Math.PI * 3.7 + 1.9)), 0.45) * 0.45;
        var shape = a + b;
        // edge fade: multiplier that goes from ~0.3 at ends to 1.0 in middle
        var fade = 0.2 + 0.7 * Math.sin(p * Math.PI);
        var barH = Math.max(2, fade * (0.03 + shape * 1.5) * 32);
        var bar = document.createElement('span');
        bar.className = 'wave-divider-bar';
        bar.style.height = barH + 'px';
        bar.style.animationDuration = '600ms';
        bar.style.animationDelay = (i * 28) + 'ms';
        zone.appendChild(bar);
      }
    });
  }

  buildDividers();

  // IntersectionObserver: trigger once when divider enters viewport
  var divObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !entry.target.classList.contains('triggered')) {
        entry.target.classList.add('triggered');
        divObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.wave-divider').forEach(function(d) {
    divObs.observe(d);
  });
})();

// IPA rain effect for div corners
// Each string is one logical glyph (some are multi-codepoint clusters).
const RAW = `m̥ m ɱ̊ ɱ n̼ n̪̊ n̪ n̥ n n̠̊ n̠ ɳ̊ ɳ ɲ̊ ɲ ŋ̊ ŋ ɴ̥ ɴ
p b p̪ b̪ t̼ d̼ t̪ d̪ t d ʈ ɖ c ɟ k ɡ q ɢ ʡ ʔ
t̪s̪ d̪z̪ ts dz t̠ʃ d̠ʒ tʂ dʐ tɕ dʑ
pɸ bβ p̪f b̪v t̪θ d̪ð tɹ̝̊ dɹ̝ t̠ɹ̠̊˔ d̠ɹ̠˔ cç ɟʝ kx ɡɣ qχ ɢʁ ʡʜ ʡʢ ʔh
s̪ z̪ s z ʃ ʒ ʂ ʐ ɕ ʑ
ɸ β f v θ̼ ð̼ θ ð θ̠ ð̠ ɹ̠̊˔ ɹ̠˔ ɻ̊˔ ɻ˔ ç ʝ x ɣ χ ʁ ħ ʕ h ɦ
β̞ ʋ ð̞ ɹ ɹ̠ ɻ j ɰ
ⱱ̟ ⱱ ɾ̥ ɾ ɽ̊ ɽ ɢ̆ ʡ̮
ʙ̥ ʙ r̥ r r̠ ɽ̊r̥ ɽr ʀ̥ ʀ ʜ ʢ
tɬ dɮ tꞎ ɟʎ̝ k𝼄 ɡʟ̝
ɬ̪ ɬ ɮ ꞎ ʎ̝ ʟ̝
l̪ l̥ l l̠ ɭ̊ ɭ ʎ̥ ʎ ʟ̥ ʟ ʟ̠
ɺ̥ ɺ ʎ̮ ʟ̆`;

// Split on whitespace, filter blanks, deduplicate
const SYMBOLS = [...new Set(
  RAW.split(/\s+/).map(s => s.trim()).filter(Boolean)
)];

// ── Config ───────────────────────────────────────────────────────────────────
const CFG = {
  fontSize:       13,           // px — also sets column & row pitch
  canvasWidthPct: 0.5,         // fraction of card width devoted to rain
  accentHex:      '#ff2d78',
  font:           "'DM Mono', monospace",

  // How many colour stops we generate (bright head → dim tail → noise floor)
  streamBrightStops: 3,         // top N chars in a stream get full colour
  streamFadeStops:   7,         // next M chars fade to near-transparent
  noiseOpacity:      0.045,     // opacity of background scatter characters

  // Stream length as fraction of canvas height (min / max)
  streamMinFrac: 0.25,
  streamMaxFrac: 0.90,

  // Horizontal mask: the rain fades from opaque (right edge) to transparent
  maskWidthPct: 0.42,           // fraction of canvas width used for the gradient fade
};

// ── Colour helpers ───────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r, g, b];
}

function rgba([r,g,b], a) {
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

// Blend accent toward white for the "head" glow
function headColor([r,g,b], t) { // t 0→1 blends accent → white
  const mix = v => Math.round(v + (255-v)*t);
  return [mix(r), mix(g), mix(b)];
}

// ── Draw ─────────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rnd(min, max) { return min + Math.random() * (max - min); }

function drawRain(canvas) {
  const ctx    = canvas.getContext('2d');
  const W      = canvas.width;
  const H      = canvas.height;
  const fz     = CFG.fontSize;
  const cols   = Math.floor(W / fz);
  const rows   = Math.floor(H / fz);
  const accent = hexToRgb(CFG.accentHex);

  ctx.clearRect(0, 0, W, H);
  ctx.font = `${fz}px ${CFG.font}`;
  ctx.textBaseline = 'top';

  // ── For every column, build 1-3 vertical streams ──────────────────────────
  for (let col = 0; col < cols; col++) {
    const x = col * fz;

    // Number of streams per column: 1 or 2 (occasionally 3 for dense feel)
    const streamCount = Math.random() < 0.25 ? 2 : 1;

    // Occupied row ranges so streams don't fully overlap
    const occupied = [];

    for (let s = 0; s < streamCount; s++) {
      const streamLen = Math.round(rows * rnd(CFG.streamMinFrac, CFG.streamMaxFrac));
      // Pick a random top, ensuring it fits
      const topRow    = Math.floor(Math.random() * Math.max(1, rows - streamLen));
      const bottomRow = topRow + streamLen;

      occupied.push([topRow, bottomRow]);

      for (let row = topRow; row < bottomRow; row++) {
        const posInStream = row - topRow;          // 0 = head
        const distFromHead = posInStream;
        const distFromTail = streamLen - 1 - posInStream;

        let color, alpha;

        if (distFromHead < CFG.streamBrightStops) {
          // Head: bright → accent, slight white tint at very top
          const t = 1 - distFromHead / CFG.streamBrightStops; // 1 at tip
          color = headColor(accent, t * 0.55);
          alpha = 0.85 + t * 0.15;
        } else if (distFromTail < CFG.streamFadeStops) {
          // Tail: fade out
          const t = distFromTail / CFG.streamFadeStops;       // 0 at tail tip
          color = accent;
          alpha = 0.05 + t * 0.35;
        } else {
          // Body
          color = accent;
          alpha = rnd(0.25, 0.52);
        }

        ctx.fillStyle = rgba(color, alpha);
        ctx.fillText(pick(SYMBOLS), x, row * fz);
      }
    }

    // ── Noise floor: sparse dim characters outside streams ─────────────────
    for (let row = 0; row < rows; row++) {
      const inStream = occupied.some(([a,b]) => row >= a && row < b);
      if (!inStream && Math.random() < 0.18) {
        ctx.fillStyle = rgba(accent, CFG.noiseOpacity + Math.random() * 0.04);
        ctx.fillText(pick(SYMBOLS), x, row * fz);
      }
    }
  }

  // ── Horizontal mask: fade left edge to transparent ────────────────────────
  const fadeW = Math.round(W * CFG.maskWidthPct);
  const grad  = ctx.createLinearGradient(0, 0, fadeW, 0);
  grad.addColorStop(0, 'rgba(0,0,0,1)');    // fully erase on left
  grad.addColorStop(1, 'rgba(0,0,0,0)');    // keep right side

  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, fadeW, H);
  ctx.globalCompositeOperation = 'source-over';

  // ── Subtle vertical vignette at top & bottom ─────────────────────────────
  const vGrad = ctx.createLinearGradient(0, 0, 0, H);
  vGrad.addColorStop(0,    'rgba(0,0,0,0.55)');
  vGrad.addColorStop(0.12, 'rgba(0,0,0,0)');
  vGrad.addColorStop(0.85, 'rgba(0,0,0,0)');
  vGrad.addColorStop(1,    'rgba(0,0,0,0.65)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = vGrad;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
function init() {
  const cards = document.querySelectorAll('.challenge-card');

  cards.forEach(card => {
    const canvas = card.querySelector('.ipa-rain-canvas');
    if (!canvas) return;

    function resize() {
      const cw = card.clientWidth;
      const ch = card.clientHeight;
      const rainW = Math.round(cw * CFG.canvasWidthPct);

      canvas.width  = rainW;
      canvas.height = ch;

      canvas.style.width  = rainW + 'px';
      canvas.style.height = ch    + 'px';

      drawRain(canvas);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(card);

    document.fonts.ready.then(resize);
  });
}

init();