// Wedding Invitation — Scrollable Website
// Sukiflee & Asyah · 30 April 2026 · Baroh, Yaha, Yala

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── RSVP → Google Sheet ─────────────────────────────────────────
// วาง "Web app URL" ที่ได้จากการ Deploy Google Apps Script ตรงนี้
// (ขั้นตอนอยู่ในไฟล์ apps-script/README.md) ถ้าเว้นว่างไว้ ฟอร์มจะยัง
// ทำงานได้แต่ไม่บันทึกลงชีต
const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycby6HBn2CSGRkh42CO3PnKons3zowH4aQDtm2ll3YXHhi1CVspKRZpDy_pObOgTGiAE-/exec";

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "groomFirst": "Sukiflee",
  "groomNick": "Sukiflee",
  "groomPhone": "0653318250",
  "brideFirst": "Asyah",
  "brideNick": "Asyah",
  "bridePhone": "0650168536",
  "monogramLeft": "S",
  "monogramRight": "A",
  "dateISO": "2026-07-26",
  "ceremonyTime": "09:00",
  "venueName": "Baroh, Yaha, Yala",
  "venueAddr": "Baroh, Yaha District, Yala, Thailand",
  "mapQuery": "6.408009,101.114843",
  "palette": "cute",
  "petalDensity": "gentle"
} /*EDITMODE-END*/;

const PALETTES = {
  cute: { rose: '#eab5b3', roseDeep: '#d18d8b', gold: '#d8b078', goldDeep: '#b58756' },
  sage: { rose: '#b5cba5', roseDeep: '#8aa878', gold: '#d8b078', goldDeep: '#b58756' },
  peach: { rose: '#f6c4a0', roseDeep: '#dca080', gold: '#d8b078', goldDeep: '#b58756' },
  midnight: { rose: '#a3b0c4', roseDeep: '#7387a3', gold: '#d8b078', goldDeep: '#b58756' }
};

const PETAL_COLORS = [
['#fbe2e0', '#eab5b3'], // soft blush
['#fbe0cb', '#f6c4a0'], // peach
['#dbecd0', '#b5cba5'], // sage
['#fbf0d6', '#ecd2a8'], // cream-gold
['#f5d6e4', '#dca0bc'], // dusty pink
['#e6dfc8', '#c4b88f'] // soft cream
];

// ───────────────────────── Floral SVGs ─────────────────────────

function FancyFloralBouquet({ className, style, variant = 'right' }) {
  // Beautiful watercolor-style bouquet — layered peonies, eucalyptus, garden roses.
  const flip = variant === 'left' ? -1 : 1;

  // A single peony petal path centered at (0,0), pointing up. Original size ~24x20.
  const outerPetal = "M 0 -16 C 7 -14, 11 -8, 10 -2 C 9 1, 5 3, 0 3 C -5 3, -9 1, -10 -2 C -11 -8, -7 -14, 0 -16 Z";
  const innerPetal = "M 0 -11 C 5 -10, 8 -6, 7 -1 C 6 1, 3 2, 0 2 C -3 2, -6 1, -7 -1 C -8 -6, -5 -10, 0 -11 Z";

  const Peony = ({ cx, cy, scale = 1, fill, innerFill, accent }) =>
  <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {/* outer ring (8 petals) */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) =>
    <path key={'o' + a} d={outerPetal} fill={fill} opacity=".92"
    transform={`rotate(${a}) translate(0 -4)`} />
    )}
      {/* inner ring (8 petals) */}
      {[22, 67, 112, 157, 202, 247, 292, 337].map((a) =>
    <path key={'i' + a} d={innerPetal} fill={fill} opacity=".96"
    transform={`rotate(${a}) translate(0 -2)`} />
    )}
      {/* center */}
      <circle r="6" fill={innerFill} />
      <circle cx="-1.5" cy="-2" r="1.6" fill="#fff" opacity=".7" />
      <circle cx="2" cy="1.5" r=".9" fill={accent} opacity=".7" />
      <circle cx="-2" cy="2" r=".7" fill={accent} opacity=".6" />
    </g>;


  const Rose = ({ cx, cy, scale = .8, fill, innerFill, accent }) =>
  <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {[0, 60, 120, 180, 240, 300].map((a) =>
    <path key={'o' + a} d={outerPetal} fill={fill} opacity=".93"
    transform={`rotate(${a}) translate(0 -4)`} />
    )}
      {[30, 90, 150, 210, 270, 330].map((a) =>
    <path key={'i' + a} d={innerPetal} fill={fill} opacity=".96"
    transform={`rotate(${a}) translate(0 -1)`} />
    )}
      <circle r="4.5" fill={innerFill} />
      <circle cx="-1" cy="-1.2" r="1.3" fill="#fff" opacity=".68" />
    </g>;


  const Bud = ({ cx, cy, scale = .55, fill, accent }) =>
  <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {[0, 72, 144, 216, 288].map((a) =>
    <path key={a} d={outerPetal} fill={fill} opacity=".9"
    transform={`rotate(${a}) translate(0 -3)`} />
    )}
      <circle r="2.5" fill={accent} opacity=".75" />
    </g>;


  return (
    <svg className={className} style={style} viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="fb-peony" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset="25%" stopColor="#fde4e2" />
          <stop offset="60%" stopColor="#f1bab8" />
          <stop offset="100%" stopColor="#c98886" />
        </radialGradient>
        <radialGradient id="fb-peony-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d18d8b" />
          <stop offset="100%" stopColor="#b06a68" stopOpacity=".5" />
        </radialGradient>

        <radialGradient id="fb-rose" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff5ec" />
          <stop offset="35%" stopColor="#fbd5b8" />
          <stop offset="100%" stopColor="#e3a37f" />
        </radialGradient>
        <radialGradient id="fb-rose-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dca080" />
          <stop offset="100%" stopColor="#b27a5a" stopOpacity=".5" />
        </radialGradient>

        <radialGradient id="fb-cream" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#fbf0d6" />
          <stop offset="100%" stopColor="#e5c89a" />
        </radialGradient>
        <radialGradient id="fb-cream-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#d4a87a" />
          <stop offset="100%" stopColor="#b58756" stopOpacity=".5" />
        </radialGradient>

        <radialGradient id="fb-bud" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f6d6e0" />
          <stop offset="100%" stopColor="#dca0bc" />
        </radialGradient>

        <radialGradient id="fb-euc" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d0deca" />
          <stop offset="100%" stopColor="#88a378" />
        </radialGradient>
        <radialGradient id="fb-euc-2" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#cad6c0" />
          <stop offset="100%" stopColor="#7a9468" />
        </radialGradient>

        <linearGradient id="fb-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b5cba5" />
          <stop offset="100%" stopColor="#7a9468" />
        </linearGradient>
      </defs>

      <g transform={`translate(${flip < 0 ? 200 : 0}, 0) scale(${flip}, 1)`}>
        {/* Curving stems */}
        <path d="M 4 145 Q 30 110, 60 100 T 120 70 Q 150 60, 185 35"
        stroke="#88a378" strokeWidth="1.4" fill="none" opacity=".5" strokeLinecap="round" />
        <path d="M 12 150 Q 40 120, 70 110 T 135 80 Q 160 75, 188 50"
        stroke="#a8c39a" strokeWidth=".9" fill="none" opacity=".4" strokeLinecap="round" />

        {/* Eucalyptus branch top-right */}
        <g transform="translate(170 30) rotate(20)">
          <path d="M -32 0 L 0 0" stroke="#88a378" strokeWidth=".9" opacity=".5" />
          <ellipse cx="-26" cy="-3.2" rx="3.6" ry="2.5" fill="url(#fb-euc)" opacity=".88" />
          <ellipse cx="-26" cy="3.2" rx="3.6" ry="2.5" fill="url(#fb-euc-2)" opacity=".85" />
          <ellipse cx="-18" cy="-3.4" rx="3.8" ry="2.7" fill="url(#fb-euc-2)" opacity=".85" />
          <ellipse cx="-18" cy="3.4" rx="3.8" ry="2.7" fill="url(#fb-euc)" opacity=".88" />
          <ellipse cx="-9" cy="-3.4" rx="3.8" ry="2.7" fill="url(#fb-euc)" opacity=".9" />
          <ellipse cx="-9" cy="3.4" rx="3.8" ry="2.7" fill="url(#fb-euc-2)" opacity=".88" />
          <ellipse cx="0" cy="-3.2" rx="3.4" ry="2.4" fill="url(#fb-euc-2)" opacity=".88" />
          <ellipse cx="0" cy="3.2" rx="3.4" ry="2.4" fill="url(#fb-euc)" opacity=".92" />
        </g>

        {/* Eucalyptus branch bottom-left */}
        <g transform="translate(22 138) rotate(-25)">
          <path d="M 0 0 L 36 0" stroke="#88a378" strokeWidth=".9" opacity=".5" />
          <ellipse cx="8" cy="-3.2" rx="3.4" ry="2.4" fill="url(#fb-euc-2)" opacity=".85" />
          <ellipse cx="8" cy="3.2" rx="3.4" ry="2.4" fill="url(#fb-euc)" opacity=".88" />
          <ellipse cx="17" cy="-3.4" rx="3.8" ry="2.7" fill="url(#fb-euc)" opacity=".88" />
          <ellipse cx="17" cy="3.4" rx="3.8" ry="2.7" fill="url(#fb-euc-2)" opacity=".85" />
          <ellipse cx="27" cy="-3.4" rx="3.6" ry="2.6" fill="url(#fb-euc-2)" opacity=".88" />
          <ellipse cx="27" cy="3.4" rx="3.6" ry="2.6" fill="url(#fb-euc)" opacity=".9" />
          <ellipse cx="35" cy="-3" rx="3.2" ry="2.3" fill="url(#fb-euc)" opacity=".88" />
          <ellipse cx="35" cy="3" rx="3.2" ry="2.3" fill="url(#fb-euc-2)" opacity=".88" />
        </g>

        {/* Pointed sage leaves scattered */}
        <ellipse cx="52" cy="118" rx="3" ry="9" fill="url(#fb-leaf)" opacity=".78" transform="rotate(-50 52 118)" />
        <ellipse cx="92" cy="92" rx="3" ry="9" fill="url(#fb-leaf)" opacity=".74" transform="rotate(-15 92 92)" />
        <ellipse cx="132" cy="62" rx="3" ry="9" fill="url(#fb-leaf)" opacity=".76" transform="rotate(15 132 62)" />
        <ellipse cx="156" cy="42" rx="2.6" ry="8" fill="url(#fb-leaf)" opacity=".72" transform="rotate(30 156 42)" />
        <ellipse cx="40" cy="100" rx="2.4" ry="7" fill="url(#fb-leaf)" opacity=".72" transform="rotate(-25 40 100)" />
        <ellipse cx="110" cy="50" rx="2.4" ry="7" fill="url(#fb-leaf)" opacity=".7" transform="rotate(45 110 50)" />

        {/* BIG layered blush peony — main focal */}
        <Peony cx={78} cy={94} scale={2.0} fill="url(#fb-peony)" innerFill="url(#fb-peony-inner)" accent="#b06a68" />

        {/* Medium peach garden rose */}
        <Rose cx={132} cy={66} scale={1.45} fill="url(#fb-rose)" innerFill="url(#fb-rose-inner)" accent="#b27a5a" />

        {/* Small cream peony */}
        <Peony cx={48} cy={126} scale={1.1} fill="url(#fb-cream)" innerFill="url(#fb-cream-inner)" accent="#b58756" />

        {/* Tiny pink bud right */}
        <Bud cx={108} cy={108} scale={.95} fill="url(#fb-bud)" accent="#b8728a" />

        {/* Tiny filler flower top-right */}
        <Bud cx={166} cy={60} scale={.8} fill="url(#fb-bud)" accent="#d18d8b" />

        {/* Baby's breath dots */}
        <g opacity=".75">
          <circle cx="64" cy="78" r="1.3" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="68" cy="82" r="1.1" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="60" cy="84" r="1" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="148" cy="86" r="1.3" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="152" cy="90" r="1.1" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="144" cy="92" r="1" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="32" cy="108" r="1" fill="#fff" stroke="#b5cba5" strokeWidth=".5" />
          <circle cx="118" cy="50" r="1.1" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
          <circle cx="100" cy="124" r="1" fill="#fff" stroke="#dca0bc" strokeWidth=".5" />
        </g>

        {/* Tiny berries */}
        <circle cx="100" cy="84" r="2.2" fill="#b8728a" opacity=".82" />
        <circle cx="103" cy="87" r="1.5" fill="#9b5d72" opacity=".75" />
        <circle cx="58" cy="108" r="1.6" fill="#d18d8b" opacity=".75" />
        <circle cx="62" cy="111" r="1.2" fill="#b8728a" opacity=".7" />
      </g>
    </svg>);

}

function FloralSpray({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="hs-blush" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".95" />
          <stop offset="40%" stopColor="#fbe2e0" />
          <stop offset="100%" stopColor="#eab5b3" />
        </radialGradient>
        <radialGradient id="hs-peach" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".95" />
          <stop offset="40%" stopColor="#fbe0cb" />
          <stop offset="100%" stopColor="#f6c4a0" />
        </radialGradient>
        <radialGradient id="hs-cream" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#fbf0d6" />
          <stop offset="100%" stopColor="#ecd2a8" />
        </radialGradient>
        <radialGradient id="hs-pink" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="50%" stopColor="#f5d6e4" />
          <stop offset="100%" stopColor="#dca0bc" />
        </radialGradient>
        <linearGradient id="hs-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b5cba5" />
          <stop offset="100%" stopColor="#8aa878" />
        </linearGradient>
        <linearGradient id="hs-leaf2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#d8e5cb" />
          <stop offset="100%" stopColor="#a8c39a" />
        </linearGradient>
      </defs>
      <g>
        <path d="M 6 70 Q 30 50, 50 48 T 110 30" stroke="#8aa878" strokeWidth="1.1" fill="none" opacity=".55" />
        <path d="M 14 72 Q 32 58, 58 60 T 100 50" stroke="#b5cba5" strokeWidth=".9" fill="none" opacity=".5" />

        <ellipse cx="22" cy="60" rx="9" ry="3.6" fill="url(#hs-leaf)" opacity=".82" transform="rotate(-35 22 60)" />
        <ellipse cx="38" cy="52" rx="7" ry="3" fill="url(#hs-leaf2)" opacity=".85" transform="rotate(-25 38 52)" />
        <ellipse cx="72" cy="44" rx="8" ry="3.2" fill="url(#hs-leaf)" opacity=".78" transform="rotate(15 72 44)" />
        <ellipse cx="98" cy="38" rx="6" ry="2.6" fill="url(#hs-leaf2)" opacity=".82" transform="rotate(25 98 38)" />
        <ellipse cx="30" cy="68" rx="5" ry="2.2" fill="url(#hs-leaf2)" opacity=".7" transform="rotate(-45 30 68)" />

        {/* tiny berries */}
        <circle cx="50" cy="54" r="2" fill="#dca0bc" opacity=".75" />
        <circle cx="54" cy="58" r="1.6" fill="#d18d8b" opacity=".7" />
        <circle cx="110" cy="36" r="1.5" fill="#f6c4a0" opacity=".8" />
        <circle cx="108" cy="40" r="1.2" fill="#eab5b3" opacity=".75" />

        {/* big blush rose */}
        <g transform="translate(58 38) scale(1.15)">
          {[0, 72, 144, 216, 288].map((a) =>
          <ellipse key={a} cx="0" cy="-5" rx="3.5" ry="6" fill="url(#hs-blush)" opacity=".96" transform={`rotate(${a})`} />
          )}
          <circle cx="0" cy="0" r="2" fill="#d18d8b" opacity=".8" />
        </g>
        {/* medium peach */}
        <g transform="translate(86 32) scale(.85)">
          {[0, 72, 144, 216, 288].map((a) =>
          <ellipse key={a} cx="0" cy="-5" rx="3.5" ry="6" fill="url(#hs-peach)" opacity=".94" transform={`rotate(${a})`} />
          )}
          <circle cx="0" cy="0" r="1.8" fill="#dca080" opacity=".8" />
        </g>
        {/* small cream */}
        <g transform="translate(36 48) scale(.7)">
          {[0, 72, 144, 216, 288].map((a) =>
          <ellipse key={a} cx="0" cy="-5" rx="3.5" ry="6" fill="url(#hs-cream)" opacity=".92" transform={`rotate(${a})`} />
          )}
          <circle cx="0" cy="0" r="1.6" fill="#b58756" opacity=".75" />
        </g>
        {/* tiny pink bud top-left */}
        <g transform="translate(20 26) scale(.5)">
          {[0, 72, 144, 216, 288].map((a) =>
          <ellipse key={a} cx="0" cy="-5" rx="3.5" ry="6" fill="url(#hs-pink)" opacity=".88" transform={`rotate(${a})`} />
          )}
          <circle cx="0" cy="0" r="1.4" fill="#d18d8b" opacity=".8" />
        </g>
      </g>
    </svg>);

}

function Ornament() {
  return (
    <div className="ornament" aria-hidden="true">
      <span className="bar"></span>
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2 C 14 6, 18 8, 22 8 C 18 10, 16 14, 16 18 C 14 16, 12 16, 10 16 C 8 16, 6 18, 4 20 C 6 14, 4 10, 2 8 C 6 8, 10 6, 12 2 Z" />
      </svg>
      <span className="bar"></span>
    </div>);

}

// ───────────────────────── Falling petals ─────────────────────────

function Petals({ density }) {
  const fxRef = useRef(null);
  const liveRef = useRef([]);
  const rafRef = useRef(0);
  const ambientPerSec = density === 'lush' ? 4 : density === 'gentle' ? 1.5 : density === 'minimal' ? .5 : 0;

  useEffect(() => {
    if (density === 'off' || ambientPerSec === 0) return;
    const root = fxRef.current;
    if (!root) return;
    let alive = true;

    const spawn = () => {
      const id = Math.random().toString(36).slice(2);
      const kindRoll = Math.random();
      const kind = kindRoll < .55 ? 'flower' : kindRoll < .85 ? 'petal' : 'sparkle';
      const size = kind === 'sparkle' ? 7 + Math.random() * 6 : 14 + Math.random() * 20;
      const el = document.createElement('div');
      el.className = 'petal';
      el.style.width = el.style.height = size + 'px';
      const driftX = (Math.random() * 2 - 1) * 200;
      const duration = 9000 + Math.random() * 6000;
      const swayAmp = 30 + Math.random() * 60;
      const swayFreq = 1.2 + Math.random() * 1.4;
      const startY = -40;
      const startX = Math.random() * window.innerWidth;
      el.style.left = startX + 'px';
      el.style.top = startY + 'px';
      el.style.opacity = '0';
      const inst = document.createElement('div');
      inst.style.width = '100%';inst.style.height = '100%';
      el.appendChild(inst);
      const colors = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
      const gid = 'g' + id;
      inst.innerHTML = (() => {
        if (kind === 'flower') {
          const petals = [0, 72, 144, 216, 288].map((a) =>
          `<ellipse cx="12" cy="6.5" rx="3.4" ry="5.2" fill="url(#${gid})" transform="rotate(${a} 12 12)" opacity=".95"/>`
          ).join('');
          return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.15))">
            <defs><radialGradient id="${gid}" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#fff" stop-opacity=".75"/>
              <stop offset="40%" stop-color="${colors[0]}"/>
              <stop offset="100%" stop-color="${colors[1]}"/>
            </radialGradient></defs>
            ${petals}
            <circle cx="12" cy="12" r="1.6" fill="${colors[1]}" opacity=".7"/>
          </svg>`;
        } else if (kind === 'sparkle') {
          return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z" fill="#f1d896" opacity=".85"/>
          </svg>`;
        } else {
          return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.12))">
            <defs><radialGradient id="${gid}" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#fff" stop-opacity=".75"/>
              <stop offset="40%" stop-color="${colors[0]}"/>
              <stop offset="100%" stop-color="${colors[1]}"/>
            </radialGradient></defs>
            <path d="M12 2 C 16 6, 18 12, 12 22 C 6 12, 8 6, 12 2 Z" fill="url(#${gid})" opacity=".95"/>
          </svg>`;
        }
      })();
      root.appendChild(el);
      liveRef.current.push({ el, t0: performance.now(), duration, startX, startY, driftX, startRot: Math.random() * 360, swayAmp, swayFreq });
    };

    let ambientTimer;
    const tick = () => {
      if (!alive) return;
      spawn();
      const wait = 1000 / ambientPerSec * (0.7 + Math.random() * 0.6);
      ambientTimer = setTimeout(tick, wait);
    };
    ambientTimer = setTimeout(tick, 500);

    const loop = (now) => {
      const arr = liveRef.current;
      const winH = window.innerHeight;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        const t = (now - p.t0) / p.duration;
        if (t >= 1) {
          p.el.remove();
          arr.splice(i, 1);
          continue;
        }
        const y = p.startY + t * (winH + 200);
        const sway = Math.sin(t * Math.PI * p.swayFreq * 2) * p.swayAmp;
        const x = sway + t * p.driftX;
        const rot = p.startRot + t * 480;
        const fadeIn = Math.min(1, t * 8);
        const fadeOut = Math.min(1, (1 - t) * 4);
        p.el.style.opacity = (Math.min(fadeIn, fadeOut) * 0.85).toFixed(3);
        p.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      alive = false;
      clearTimeout(ambientTimer);
      cancelAnimationFrame(rafRef.current);
      liveRef.current.forEach((p) => p.el.remove());
      liveRef.current = [];
    };
  }, [density, ambientPerSec]);

  return <div className="fx" ref={fxRef}></div>;
}

// ───────────────────────── Calendar ─────────────────────────

function Calendar({ dateISO }) {
  const target = useMemo(() => {
    const d = new Date(dateISO + 'T00:00:00');
    return isNaN(d) ? new Date(2026, 3, 30) : d;
  }, [dateISO]);
  const [view, setView] = useState(() => new Date(target.getFullYear(), target.getMonth(), 1));
  useEffect(() => {setView(new Date(target.getFullYear(), target.getMonth(), 1));}, [target]);

  const TH_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const TH_DOWS = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const TH_DOWS_FULL = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const monthName = TH_MONTHS[view.getMonth()];
  const year = view.getFullYear();
  const firstDow = new Date(year, view.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, view.getMonth() + 1, 0).getDate();
  const prevDays = new Date(year, view.getMonth(), 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: prevDays - firstDow + 1 + i, muted: true });
  for (let i = 1; i <= daysInMonth; i++) {
    const isEvent = i === target.getDate() && view.getMonth() === target.getMonth() && view.getFullYear() === target.getFullYear();
    cells.push({ day: i, muted: false, event: isEvent });
  }
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDow + 1, muted: true });

  const dows = TH_DOWS;
  const eventDow = TH_DOWS_FULL[target.getDay()];
  const eventDay = target.getDate();
  const eventMonth = TH_MONTHS[target.getMonth()];

  return (
    <div className="calendar">
      <FloralSpray className="cal-corner cal-corner-tl" />
      <FloralSpray className="cal-corner cal-corner-tr" />
      <FloralSpray className="cal-corner cal-corner-bl" />
      <FloralSpray className="cal-corner cal-corner-br" />
      <div className="cal-head">
        <div className="cal-nav">
          <button aria-label="Previous month" onClick={() => setView(new Date(year, view.getMonth() - 1, 1))}>‹</button>
        </div>
        <div className="cal-title">
          <div className="month">{monthName}</div>
          <div className="year">{year}</div>
        </div>
        <div className="cal-nav">
          <button aria-label="Next month" onClick={() => setView(new Date(year, view.getMonth() + 1, 1))}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {dows.map((d, i) => <div key={'h' + i} className="cal-dow">{d}</div>)}
        {cells.map((c, i) =>
        <div key={i} className={`cal-cell ${c.muted ? 'muted' : ''} ${c.event ? 'event' : ''}`}>{c.day}</div>
        )}
      </div>
      <div className="cal-footer">
        <span className="dot"></span>
        <span>{eventDow}ที่ {eventDay} {eventMonth} {year}</span>
      </div>
    </div>);

}

// ───────────────────────── Countdown ─────────────────────────

function useCountdown(dateISO, timeStr) {
  const target = useMemo(() => {
    const d = new Date(`${dateISO}T${timeStr || '09:00'}:00`);
    return isNaN(d) ? new Date('2026-04-30T09:00:00') : d;
  }, [dateISO, timeStr]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = target - now;
  const past = diff < 0;
  const ad = Math.abs(diff);
  const days = Math.floor(ad / 86400000);
  const hours = Math.floor(ad % 86400000 / 3600000);
  const mins = Math.floor(ad % 3600000 / 60000);
  const secs = Math.floor(ad % 60000 / 1000);
  return { days, hours, mins, secs, past, target };
}

function Countdown({ dateISO, timeStr }) {
  const { days, hours, mins, secs, past } = useCountdown(dateISO, timeStr);
  return (
    <div>
      <div className="countdown">
        <div className="unit"><div className="n">{String(days).padStart(2, '0')}</div><div className="l">Days</div></div>
        <div className="colon">:</div>
        <div className="unit"><div className="n">{String(hours).padStart(2, '0')}</div><div className="l">Hrs</div></div>
        <div className="colon">:</div>
        <div className="unit"><div className="n">{String(mins).padStart(2, '0')}</div><div className="l">Min</div></div>
        <div className="colon">:</div>
        <div className="unit"><div className="n">{String(secs).padStart(2, '0')}</div><div className="l">Sec</div></div>
      </div>
      <div className="countdown-tag">{past ? 'Since we said “I do”' : 'Until we say “I do”'}</div>
    </div>);

}

// ───────────────────────── Sections ─────────────────────────

function Hero({ t }) {
  const date = useMemo(() => {
    const d = new Date(t.dateISO + 'T00:00:00');
    return isNaN(d) ? new Date(2026, 3, 30) : d;
  }, [t.dateISO]);
  const heroDate = date.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const scrollNext = () => {
    document.getElementById('welcome')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="hero" data-screen-label="01 Hero">
      <FancyFloralBouquet className="hero-floral hero-floral-tl" variant="right" />
      <FancyFloralBouquet className="hero-floral hero-floral-tr" variant="right" />
      <FancyFloralBouquet className="hero-floral hero-floral-bl" variant="right" />
      <FancyFloralBouquet className="hero-floral hero-floral-br" variant="right" />

      <div className="eyebrow">The Wedding of</div>

      <div className="monogram-circle" style={{ marginTop: '24px' }}>
        <div className="m-text">
          {t.monogramRight}
          <span className="amp">&amp;</span>
          {t.monogramLeft}
        </div>
      </div>

      <div className="display hero-names">
        {t.brideFirst}
        <span className="amp">&amp;</span>
        {t.groomFirst}
      </div>

      <div className="hero-date">{heroDate}</div>
      <div className="hero-loc italic">{t.venueName}</div>

      <button className="scroll-cue" type="button" onClick={scrollNext} aria-label="Scroll to invitation">
        <span>Open Invitation</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 9 L12 15 L18 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>);

}

function Welcome({ t }) {
  return (
    <section id="welcome" className="welcome" data-screen-label="02 Welcome">
      <div className="bismillah-arabic" aria-label="Bismillah ar-Rahman ar-Rahim">
        بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
      </div>
      <div className="bismillah-translit">Bismillahirrahmanirrahim</div>

      <div className="welcome-divider" aria-hidden="true">
        <span className="line"></span>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2 C 14 6, 18 8, 22 8 C 18 10, 16 14, 16 18 C 14 16, 12 16, 10 16 C 8 16, 6 18, 4 20 C 6 14, 4 10, 2 8 C 6 8, 10 6, 12 2 Z"/>
        </svg>
        <span className="line"></span>
      </div>

      <div className="eyebrow">Welcome</div>
      <h2 className="display welcome-title">สู่งานวาลีมะห์ของเรา</h2>

      <p className="welcome-body">
        ด้วยความเมตตาแห่งอัลลอฮฺ <br/>
        ครอบครัวของเราขอเรียนเชิญท่าน <br/>
        ร่วมเป็นเกียรติในงานวาลีมะห์ <br/>
        พิธีสมรสตามหลักศาสนาอิสลาม
      </p>

      <div className="welcome-quote">
        <span className="quote-mark">“</span>
        <span className="quote-text">และส่วนหนึ่งจากสัญญาณทั้งหลายของพระองค์<br/>คือทรงสร้างคู่ครองให้แก่พวกเจ้าจากตัวของพวกเจ้าเอง<br/>เพื่อพวกเจ้าจะได้สงบสุขอยู่กับนาง<br/>และทรงให้มีความรักใคร่และความเมตตาระหว่างพวกเจ้า</span>
        <span className="quote-source">— Al-Qur'an 30:21</span>
      </div>
    </section>);

}

function DateSection({ t }) {
  const date = useMemo(() => {
    const d = new Date(t.dateISO + 'T00:00:00');
    return isNaN(d) ? new Date(2026, 3, 30) : d;
  }, [t.dateISO]);
  const day = date.getDate();
  const monthShort = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const dow = date.toLocaleString('en-US', { weekday: 'long' });

  return (
    <section id="date" className="date-section" data-screen-label="03 Date">
      <div className="eyebrow">Save the Date</div>
      <Ornament />
      <div className="big-date">
        <div className="part">
          <div className="label">{dow}</div>
          <div className="value">{day}</div>
          <div className="sub">{monthShort} {year}</div>
        </div>
        <div className="divider"></div>
        <div className="part">
          <div className="label">Ceremony</div>
          <div className="value">{t.ceremonyTime}</div>
          <div className="sub">From 09:00 onwards</div>
        </div>
      </div>
      <Countdown dateISO={t.dateISO} timeStr={t.ceremonyTime} />
    </section>);

}

function CalSection({ t }) {
  return (
    <section id="calendar" className="cal-section" data-screen-label="04 Calendar">
      <div className="eyebrow">Mark Your Calendar</div>
      <Ornament />
      <Calendar dateISO={t.dateISO} />
    </section>);

}

function LocationSection({ t }) {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(t.mapQuery || t.venueName)}&output=embed`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.mapQuery || t.venueName)}`;
  return (
    <section id="location" className="loc-section" data-screen-label="05 Location">
      <div className="eyebrow">Location</div>
      <Ornament />
      <div className="map-card">
        <iframe
          src={mapSrc}
          loading="lazy"
          title="Venue map"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen />
        
        <div className="map-foot">
          <div>
            <div className="v-name">{t.venueName}</div>
            <div className="v-addr">{t.venueAddr}</div>
          </div>
          <div className="map-actions">
            <a className="btn primary" href={mapHref} target="_blank" rel="noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Directions
            </a>
          </div>
        </div>
      </div>
    </section>);

}

function ProgramSection({ t }) {
  return (
    <section id="program" className="prog-section" data-screen-label="06 Program">
      <div className="eyebrow">Program of the Day</div>
      <Ornament />
      <p className="italic" style={{ maxWidth: '520px', margin: '0 auto', fontSize: '18px', lineHeight: 1.7 }}>
        ขอเชิญร่วมเป็นส่วนหนึ่งของวันแห่งความสุขของเรา
      </p>
      <div className="program">
        <div className="prog-row">
          <div className="prog-time">{t.ceremonyTime}</div>
          <div className="prog-bar"></div>
          <div className="prog-body">
            <div className="ttl">เริ่มงานวลีมะห์</div>
            <div className="sub">ร่วมรับประทานอาหาร พบปะแสดงความยินดีกับเจ้าบ่าวเจ้าสาวและแขกผู้มาร่วมงาน</div>
          </div>
        </div>
        <div className="prog-row">
          <div className="prog-time">18:00</div>
          <div className="prog-bar"></div>
          <div className="prog-body">
            <div className="ttl">สิ้นสุดงานวลีมะห์</div>
            <div className="sub">ขอขอบคุณทุกท่านที่มาร่วมแบ่งปันความสุขในวันนี้</div>
          </div>
        </div>
      </div>
    </section>);

}

// 0650168536 → "065 016 8536" (อ่านง่ายขึ้น) — ส่วน href tel: ใช้ตัวเลขดิบ
function fmtPhone(p) {
  const d = String(p || '').replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : (p || '');
}

function RsvpSection({ t }) {
  const calHref = useMemo(() => {
    const start = new Date(`${t.dateISO}T${t.ceremonyTime}:00`);
    const end = new Date(start.getTime() + 9 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = encodeURIComponent(`${t.brideFirst} & ${t.groomFirst} — Wedding`);
    const loc = encodeURIComponent(t.venueName);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&location=${loc}`;
  }, [t]);

  const [rsvp, setRsvp] = useState(null);
  const [name, setName] = useState('');
  const [guests, setGuests] = useState(1);
  const [status, setStatus] = useState('idle'); // idle | sending | done

  const submit = useCallback((choice) => {
    if (status === 'sending') return;
    setRsvp(choice);
    setStatus('sending');
    const payload = {
      response: choice,
      name: name.trim(),
      guests: choice === 'yes' ? Math.max(1, parseInt(guests, 10) || 1) : 1
    };
    const finish = () => setStatus('done');
    if (!RSVP_ENDPOINT) { finish(); return; }
    fetch(RSVP_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(finish).catch(finish);
  }, [name, guests, status]);

  const sending = status === 'sending';
  const done = status === 'done';

  return (
    <section id="rsvp" className="rsvp-section" data-screen-label="07 RSVP">
      <div className="eyebrow">Kindly Reply</div>
      <Ornament />
      <h2 className="display" style={{ fontSize: 'clamp(36px,4.5vw,52px)', margin: '8px 0 0' }}>ท่านจะมาร่วมงานกับเราไหม?</h2>
      {done ?
      <div className="rsvp-thanks">
          {rsvp === 'yes' ?
        <>ขอบคุณมากค่ะ/ครับ 💖<br />แล้วพบกันในวันงานนะคะ</> :

        <>ขอบคุณที่แจ้งให้เราทราบค่ะ/ครับ<br />เสียดายที่ไม่ได้พบกัน แต่เราเข้าใจนะคะ 🤍</>}
        </div> :

      <>
          <p>
            การมาร่วมงานของท่านคือของขวัญที่ล้ำค่าที่สุดสำหรับเรา<br />
            หากท่านสะดวก อยากให้ท่านแจ้งให้เราทราบล่วงหน้าได้เลยนะครับ
          </p>
          <div className="rsvp-form">
            <input
            className="rsvp-input"
            type="text"
            placeholder="ชื่อของท่าน (ไม่บังคับ)"
            value={name}
            onChange={(e) => setName(e.target.value)} />

            <label className="rsvp-guests">
              <span>ถ้ามา จะมาด้วยกันกี่ท่าน?</span>
              <input
              className="rsvp-input rsvp-num"
              type="number"
              min="1"
              value={guests}
              onChange={(e) => setGuests(e.target.value)} />
            </label>
          </div>
          <div className="rsvp-actions">
            <button className="btn th primary" disabled={sending} onClick={() => submit('yes')}>
              {sending && rsvp === 'yes' ? 'กำลังส่ง…' : 'ตอบรับด้วยความยินดี'}
            </button>
            <button className="btn th" disabled={sending} onClick={() => submit('no')}>
              {sending && rsvp === 'no' ? 'กำลังส่ง…' : 'ขออภัย ไม่สามารถมาได้'}
            </button>
            <a className="btn th" href={calHref} target="_blank" rel="noreferrer">เพิ่มในปฏิทิน</a>
          </div>
        </>}

      <div className="rsvp-contact">
        <div className="rsvp-contact-title">สอบถามเพิ่มเติม / ยืนยันการเข้าร่วม</div>
        <div className="rsvp-contact-list">
          {t.bridePhone &&
          <a className="contact-item" href={`tel:${t.bridePhone}`}>
              <span className="contact-role">เจ้าสาว · {t.brideNick}</span>
              <span className="contact-phone">☎ {fmtPhone(t.bridePhone)}</span>
            </a>
          }
          {t.groomPhone &&
          <a className="contact-item" href={`tel:${t.groomPhone}`}>
              <span className="contact-role">เจ้าบ่าว · {t.groomNick}</span>
              <span className="contact-phone">☎ {fmtPhone(t.groomPhone)}</span>
            </a>
          }
        </div>
      </div>
    </section>);

}

function Footer({ t }) {
  return (
    <footer className="footer">
      <div className="signoff">With all our love,</div>
      <div className="names-small">
        {t.brideNick}<span className="heart">♥</span>{t.groomNick}
      </div>
    </footer>);

}

// ───────────────────────── App ─────────────────────────

function IntroCover({ t, open, onOpen }) {
  const date = useMemo(() => {
    const d = new Date(t.dateISO + 'T00:00:00');
    return isNaN(d) ? new Date(2026, 3, 30) : d;
  }, [t.dateISO]);
  const dateLabel = date.toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className={`intro-cover ${open ? 'opened' : ''}`} aria-hidden={open}>
      <FancyFloralBouquet className="intro-bouquet intro-bouquet-tl" variant="right" />
      <FancyFloralBouquet className="intro-bouquet intro-bouquet-tr" variant="right" />
      <FancyFloralBouquet className="intro-bouquet intro-bouquet-bl" variant="right" />
      <FancyFloralBouquet className="intro-bouquet intro-bouquet-br" variant="right" />

      {/* Floating petals/sparkles inside cover */}
      <div className="intro-sparkles" aria-hidden="true">
        {[...Array(10)].map((_, i) =>
        <span key={i} className={`spark s${i}`}></span>
        )}
      </div>

      <div className="intro-content">
        <div className="intro-eyebrow">Save the Date</div>
        <div className="intro-divider">MMXXVI</div>
        <div className="intro-couple">{t.brideFirst}</div>
        <div className="intro-amp">&amp;</div>
        <div className="intro-couple">{t.groomFirst}</div>
        <div className="intro-date">{dateLabel}</div>

        <button
          type="button"
          className="intro-seal-wrap"
          onClick={onOpen}
          aria-label="Press the seal to open the invitation">
          
          <div className="intro-seal">
            <div className="intro-seal-ring"></div>
            <div className="intro-seal-inner">
              {t.monogramRight}
              <span className="amp">&amp;</span>
              {t.monogramLeft}
            </div>
          </div>
        </button>

        <div className="intro-prompt">Press the seal to open</div>
      </div>
    </div>);

}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.cute;
    const r = document.documentElement;
    r.style.setProperty('--rose', p.rose);
    r.style.setProperty('--rose-deep', p.roseDeep);
    r.style.setProperty('--gold', p.gold);
    r.style.setProperty('--gold-deep', p.goldDeep);
  }, [t.palette]);

  useEffect(() => {
    if (opened) document.body.classList.remove('intro-active');else
    document.body.classList.add('intro-active');
    return () => document.body.classList.remove('intro-active');
  }, [opened]);

  const handleOpen = useCallback(() => {
    setOpened(true);
    setTimeout(() => window.scrollTo({ top: 0, left: 0 }), 50);
  }, []);

  return (
    <>
      <IntroCover t={t} open={opened} onOpen={handleOpen} />

      <nav className="topnav" aria-label="Section navigation">
        <a href="#welcome">Welcome</a>
        <a href="#date">Date</a>
        <a href="#location">Location</a>
        <a href="#program">Program</a>
        <a href="#rsvp">RSVP</a>
      </nav>

      <Hero t={t} />

      <main>
        <Welcome t={t} />
        <DateSection t={t} />
        <CalSection t={t} />
        <LocationSection t={t} />
        <ProgramSection t={t} />
      </main>

      <RsvpSection t={t} />

      <Footer t={t} />

      <Petals density={t.petalDensity} />

      <TweaksPanel>
        <TweakSection label="The Couple" />
        <TweakText label="Groom" value={t.groomFirst} onChange={(v) => setTweak('groomFirst', v)} />
        <TweakText label="Bride" value={t.brideFirst} onChange={(v) => setTweak('brideFirst', v)} />
        <TweakText label="Groom monogram" value={t.monogramLeft} onChange={(v) => setTweak('monogramLeft', v)} />
        <TweakText label="Bride monogram" value={t.monogramRight} onChange={(v) => setTweak('monogramRight', v)} />
        <TweakText label="Groom nickname" value={t.groomNick} onChange={(v) => setTweak('groomNick', v)} />
        <TweakText label="Bride nickname" value={t.brideNick} onChange={(v) => setTweak('brideNick', v)} />
        <TweakText label="Groom phone" value={t.groomPhone} onChange={(v) => setTweak('groomPhone', v)} />
        <TweakText label="Bride phone" value={t.bridePhone} onChange={(v) => setTweak('bridePhone', v)} />

        <TweakSection label="Date & Time" />
        <TweakText label="Date (YYYY-MM-DD)" value={t.dateISO} onChange={(v) => setTweak('dateISO', v)} />
        <TweakText label="Time (HH:MM)" value={t.ceremonyTime} onChange={(v) => setTweak('ceremonyTime', v)} />

        <TweakSection label="Venue" />
        <TweakText label="Venue name" value={t.venueName} onChange={(v) => setTweak('venueName', v)} />
        <TweakText label="Address" value={t.venueAddr} onChange={(v) => setTweak('venueAddr', v)} />
        <TweakText label="Map query" value={t.mapQuery} onChange={(v) => setTweak('mapQuery', v)} />

        <TweakSection label="Style" />
        <TweakSelect label="Palette" value={t.palette}
        options={['cute', 'sage', 'peach', 'midnight']}
        onChange={(v) => setTweak('palette', v)} />
        <TweakSelect label="Petals" value={t.petalDensity}
        options={['lush', 'gentle', 'minimal', 'off']}
        onChange={(v) => setTweak('petalDensity', v)} />
      </TweaksPanel>
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);