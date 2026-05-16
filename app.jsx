// Wedding Invitation app
// Single-file React: state machine for letter open, petal system, calendar, tweaks.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "groomFirst": "Asyah",
  "groomNick": "Asyah",
  "brideFirst": "Sukiflee",
  "brideNick": "Suki",
  "surnameLine": "The Wedding of Asyah & Sukiflee",
  "monogramLeft": "A",
  "monogramRight": "S",
  "dateISO": "2026-07-18",
  "ceremonyTime": "09:00",
  "venueName": "Baroh, Yaha, Yala",
  "venueAddr": "Baroh, Yaha District, Yala, Thailand",
  "mapQuery": "Baroh, Yaha, Yala, Thailand",
  "palette": "blush",
  "petalDensity": "lush"
}/*EDITMODE-END*/;

const PALETTES = {
  rose:    { rose:'#c08a8a', roseDeep:'#9b6868', gold:'#b8924d', goldDeep:'#8a6a30' },
  blush:   { rose:'#d4a5a5', roseDeep:'#a87575', gold:'#c9a36b', goldDeep:'#9a7a45' },
  sage:    { rose:'#9bb18a', roseDeep:'#6a8559', gold:'#b8924d', goldDeep:'#8a6a30' },
  midnight:{ rose:'#7a89a8', roseDeep:'#4d5d7a', gold:'#c9a36b', goldDeep:'#9a7a45' },
};

// ============================================================
// Petals — falling flower petals & gold sparkles
// ============================================================

const PETAL_COLORS = [
  ['#f5c0bf','#d98a8c'],    // soft pink
  ['#f7d6c4','#df9b85'],    // peach
  ['#e9ccdb','#b88aa3'],    // rose
  ['#fbe8c8','#c9a36b'],    // cream/gold
  ['#dfead0','#8fb380'],    // sage tint
];

function makePetal(i, kind){
  const colors = PETAL_COLORS[i % PETAL_COLORS.length];
  // 5-petal rose-style flower SVG
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`pg${i}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".7"/>
          <stop offset="40%" stopColor={colors[0]}/>
          <stop offset="100%" stopColor={colors[1]}/>
        </radialGradient>
      </defs>
      {kind === 'flower' ? (
        <g>
          {[0,72,144,216,288].map(a => (
            <ellipse key={a} cx="12" cy="6.5" rx="3.4" ry="5.2"
              fill={`url(#pg${i})`}
              transform={`rotate(${a} 12 12)`}
              opacity=".95"/>
          ))}
          <circle cx="12" cy="12" r="1.6" fill={colors[1]} opacity=".7"/>
        </g>
      ) : kind === 'sparkle' ? (
        <g>
          <path d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z"
                fill="#f1d896" opacity=".85"/>
        </g>
      ) : (
        // single petal
        <path d="M12 2 C 16 6, 18 12, 12 22 C 6 12, 8 6, 12 2 Z"
              fill={`url(#pg${i})`} opacity=".95"/>
      )}
    </svg>
  );
}

function Petals({ active, density }){
  const fxRef = useRef(null);
  const liveRef = useRef([]);
  const rafRef = useRef(0);

  // burst count when letter opens
  const burstCount = density === 'lush' ? 70 : density === 'gentle' ? 35 : density === 'minimal' ? 14 : 0;
  // ambient continuous rate
  const ambientPerSec = density === 'lush' ? 6 : density === 'gentle' ? 3 : density === 'minimal' ? 1.2 : 0;

  useEffect(() => {
    if(!active || density === 'off') return;
    const root = fxRef.current;
    if(!root) return;

    let alive = true;

    const spawn = (overrides = {}) => {
      const id = Math.random().toString(36).slice(2);
      const kindRoll = Math.random();
      const kind = kindRoll < .55 ? 'flower' : kindRoll < .85 ? 'petal' : 'sparkle';
      const size = kind === 'sparkle' ? (8 + Math.random()*8) : (14 + Math.random()*22);
      const el = document.createElement('div');
      el.className = 'petal';
      el.style.left = (Math.random()*100) + '%';
      el.style.width = el.style.height = size + 'px';
      const startRot = Math.random()*360;
      const driftX = (Math.random()*2 - 1) * 240;
      const duration = 6000 + Math.random()*5000;
      const swayAmp = 40 + Math.random()*60;
      const swayFreq = 1.5 + Math.random()*1.5;
      const startY = overrides.startY ?? -40;
      const startX = overrides.startX ?? (Math.random() * window.innerWidth);
      el.style.left = startX + 'px';
      el.style.top = startY + 'px';
      el.style.opacity = '0';

      const inst = document.createElement('div');
      inst.style.width='100%';inst.style.height='100%';
      el.appendChild(inst);

      // simple SVG (string) — petal shape
      const colors = PETAL_COLORS[Math.floor(Math.random()*PETAL_COLORS.length)];
      const gid = 'g' + id;
      inst.innerHTML = (() => {
        if(kind === 'flower'){
          const petals = [0,72,144,216,288].map(a => 
            `<ellipse cx="12" cy="6.5" rx="3.4" ry="5.2" fill="url(#${gid})" transform="rotate(${a} 12 12)" opacity=".95"/>`
          ).join('');
          return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))">
            <defs><radialGradient id="${gid}" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#fff" stop-opacity=".7"/>
              <stop offset="40%" stop-color="${colors[0]}"/>
              <stop offset="100%" stop-color="${colors[1]}"/>
            </radialGradient></defs>
            ${petals}
            <circle cx="12" cy="12" r="1.6" fill="${colors[1]}" opacity=".7"/>
          </svg>`;
        } else if(kind === 'sparkle'){
          return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z" fill="#f1d896" opacity=".9"/>
          </svg>`;
        } else {
          return `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.2))">
            <defs><radialGradient id="${gid}" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#fff" stop-opacity=".7"/>
              <stop offset="40%" stop-color="${colors[0]}"/>
              <stop offset="100%" stop-color="${colors[1]}"/>
            </radialGradient></defs>
            <path d="M12 2 C 16 6, 18 12, 12 22 C 6 12, 8 6, 12 2 Z" fill="url(#${gid})" opacity=".95"/>
          </svg>`;
        }
      })();

      root.appendChild(el);
      const rec = { el, t0: performance.now(), duration, startX, startY, driftX, startRot, swayAmp, swayFreq };
      liveRef.current.push(rec);
      return rec;
    };

    // initial burst
    for(let i=0;i<burstCount;i++){
      setTimeout(() => alive && spawn({startY: -60 - Math.random()*200}), Math.random()*1200);
    }

    // ambient
    let ambientTimer;
    const tick = () => {
      if(!alive) return;
      spawn();
      const wait = (1000/ambientPerSec) * (0.6 + Math.random()*0.8);
      ambientTimer = setTimeout(tick, wait);
    };
    if(ambientPerSec > 0) ambientTimer = setTimeout(tick, 500);

    // animation loop
    const loop = (now) => {
      const arr = liveRef.current;
      const winH = window.innerHeight;
      for(let i = arr.length - 1; i >= 0; i--){
        const p = arr[i];
        const t = (now - p.t0) / p.duration;
        if(t >= 1){
          p.el.remove();
          arr.splice(i, 1);
          continue;
        }
        const y = p.startY + t * (winH + 200);
        const sway = Math.sin(t * Math.PI * p.swayFreq * 2) * p.swayAmp;
        const x = p.startX + sway + t * p.driftX;
        const rot = p.startRot + t * 540;
        const fadeIn = Math.min(1, t * 8);
        const fadeOut = Math.min(1, (1 - t) * 4);
        p.el.style.opacity = (Math.min(fadeIn, fadeOut) * 0.95).toFixed(3);
        p.el.style.transform = `translate(${(x - p.startX).toFixed(1)}px, ${(y - p.startY).toFixed(1)}px) rotate(${rot.toFixed(1)}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      alive = false;
      clearTimeout(ambientTimer);
      cancelAnimationFrame(rafRef.current);
      liveRef.current.forEach(p => p.el.remove());
      liveRef.current = [];
    };
  }, [active, density, burstCount, ambientPerSec]);

  return <div className="fx" ref={fxRef}></div>;
}

// ============================================================
// Calendar component
// ============================================================

function Calendar({ dateISO }){
  const target = useMemo(() => {
    const d = new Date(dateISO + 'T00:00:00');
    if(isNaN(d)) return new Date(2026, 10, 22);
    return d;
  }, [dateISO]);

  const [view, setView] = useState(() => new Date(target.getFullYear(), target.getMonth(), 1));

  useEffect(() => {
    setView(new Date(target.getFullYear(), target.getMonth(), 1));
  }, [target]);

  const monthName = view.toLocaleString('en-US', { month: 'long' });
  const year = view.getFullYear();
  const firstDow = new Date(year, view.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, view.getMonth()+1, 0).getDate();
  const prevDays = new Date(year, view.getMonth(), 0).getDate();
  const cells = [];
  for(let i=0;i<firstDow;i++) cells.push({ day: prevDays - firstDow + 1 + i, muted: true });
  for(let i=1;i<=daysInMonth;i++){
    const isEvent = i === target.getDate() && view.getMonth() === target.getMonth() && view.getFullYear() === target.getFullYear();
    cells.push({ day: i, muted:false, event: isEvent });
  }
  while(cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - firstDow + 1, muted: true });

  const dows = ['S','M','T','W','T','F','S'];

  return (
    <div className="calendar">
      <div className="cal-head">
        <button className="btn-gold" style={{padding:'4px 10px',fontSize:'9px'}}
          onClick={() => setView(new Date(year, view.getMonth()-1, 1))}>‹</button>
        <div className="cal-title">{monthName} {year}</div>
        <button className="btn-gold" style={{padding:'4px 10px',fontSize:'9px'}}
          onClick={() => setView(new Date(year, view.getMonth()+1, 1))}>›</button>
      </div>
      <div className="cal-grid">
        {dows.map((d,i) => <div key={'h'+i} className="cal-dow">{d}</div>)}
        {cells.map((c,i) => (
          <div key={i} className={`cal-cell ${c.muted?'muted':''} ${c.event?'event':''}`}>
            {c.day}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Countdown
// ============================================================

function useCountdown(dateISO, timeStr){
  const target = useMemo(() => {
    const d = new Date(`${dateISO}T${timeStr || '16:30'}:00`);
    return isNaN(d) ? new Date('2026-11-22T16:30:00') : d;
  }, [dateISO, timeStr]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs, target };
}

function Countdown({ dateISO, timeStr }){
  const { days, hours, mins, secs } = useCountdown(dateISO, timeStr);
  const Cell = ({n, l}) => (
    <div style={{textAlign:'center',minWidth:'56px'}}>
      <div style={{fontFamily:'"Italiana",serif',fontSize:'28px',color:'var(--ink)',lineHeight:1,fontVariantNumeric:'tabular-nums'}}>
        {String(n).padStart(2,'0')}
      </div>
      <div style={{fontFamily:'"Cinzel",serif',fontSize:'9px',letterSpacing:'.25em',color:'var(--gold-deep)',marginTop:'4px',textTransform:'uppercase'}}>{l}</div>
    </div>
  );
  return (
    <div style={{display:'flex',justifyContent:'center',gap:'18px',alignItems:'center',margin:'16px 0 4px'}}>
      <Cell n={days} l="Days"/>
      <div style={{color:'var(--gold)',fontFamily:'"Italiana"',fontSize:'22px',opacity:.5}}>:</div>
      <Cell n={hours} l="Hrs"/>
      <div style={{color:'var(--gold)',fontFamily:'"Italiana"',fontSize:'22px',opacity:.5}}>:</div>
      <Cell n={mins} l="Min"/>
      <div style={{color:'var(--gold)',fontFamily:'"Italiana"',fontSize:'22px',opacity:.5}}>:</div>
      <Cell n={secs} l="Sec"/>
    </div>
  );
}

// ============================================================
// Closed letter face
// ============================================================

function ClosedFace({ t, open }){
  return (
    <div className="closed-deco" style={{opacity: open ? 0 : 1}}>
      {/* floral sprays in corners */}
      <FloralSpray className="closed-floral closed-floral-tl"/>
      <FloralSpray className="closed-floral closed-floral-tr"/>
      <FloralSpray className="closed-floral closed-floral-bl"/>
      <FloralSpray className="closed-floral closed-floral-br"/>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'14px'}}>
        <div className="mono">Save the Date</div>
        <div className="divider">{(() => {
          const y = parseInt(t.dateISO?.slice(0,4)) || 2026;
          const toRoman = (n) => {
            const map = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
            let r='';for(const [k,v] of map){while(n>=v){r+=k;n-=v}}return r;
          };
          return toRoman(y);
        })()}</div>
        <div className="script" style={{fontSize:'clamp(22px,3.4vw,30px)'}}>Welcome to the wedding of</div>
      </div>

      {/* center space reserved for wax seal */}
      <div aria-hidden="true" style={{height:'180px'}}></div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
        <div className="divider">{t.groomNick} &amp; {t.brideNick}</div>
        <div className="script" style={{fontSize:'clamp(16px,2.4vw,22px)',color:'var(--ink-soft)'}}>press the seal to open</div>
      </div>
    </div>
  );
}

// ============================================================
// Invitation (inside)
// ============================================================

function FloralSpray({className, style, scale = 1}){
  // A small watercolor-feel floral sprig. ~120x80 viewBox.
  return (
    <svg className={className} style={style} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="fs-pink" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".85"/>
          <stop offset="40%" stopColor="#f3bdc0"/>
          <stop offset="100%" stopColor="#c98a8d"/>
        </radialGradient>
        <radialGradient id="fs-peach" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".85"/>
          <stop offset="40%" stopColor="#f6d2bb"/>
          <stop offset="100%" stopColor="#d9956f"/>
        </radialGradient>
        <radialGradient id="fs-cream" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="50%" stopColor="#fae6c5"/>
          <stop offset="100%" stopColor="#caa56a"/>
        </radialGradient>
        <linearGradient id="fs-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a8b88f"/>
          <stop offset="100%" stopColor="#6b7e57"/>
        </linearGradient>
        <linearGradient id="fs-leaf2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#cdd6b9"/>
          <stop offset="100%" stopColor="#8a9a7a"/>
        </linearGradient>
      </defs>
      <g style={{filter:'blur(.3px)'}} transform={`scale(${scale})`}>
        {/* curving stem */}
        <path d="M 6 70 Q 30 50, 50 48 T 110 30" stroke="#8a9a7a" strokeWidth="1.1" fill="none" opacity=".6"/>
        <path d="M 14 72 Q 32 58, 58 60 T 100 50" stroke="#a8b88f" strokeWidth=".9" fill="none" opacity=".5"/>

        {/* leaves */}
        <ellipse cx="22" cy="60" rx="9" ry="3.6" fill="url(#fs-leaf)" opacity=".8" transform="rotate(-35 22 60)"/>
        <ellipse cx="38" cy="52" rx="7" ry="3" fill="url(#fs-leaf2)" opacity=".85" transform="rotate(-25 38 52)"/>
        <ellipse cx="72" cy="44" rx="8" ry="3.2" fill="url(#fs-leaf)" opacity=".75" transform="rotate(15 72 44)"/>
        <ellipse cx="98" cy="38" rx="6" ry="2.6" fill="url(#fs-leaf2)" opacity=".8" transform="rotate(25 98 38)"/>
        <ellipse cx="30" cy="68" rx="5" ry="2.2" fill="url(#fs-leaf2)" opacity=".7" transform="rotate(-45 30 68)"/>

        {/* little berries / buds */}
        <circle cx="50" cy="54" r="2" fill="#b88aa3" opacity=".7"/>
        <circle cx="54" cy="58" r="1.6" fill="#9b6868" opacity=".65"/>

        {/* primary flowers — rose-like rosettes */}
        {/* big pink */}
        <g transform="translate(58 38) scale(1.1)">
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-pink)" opacity=".95"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-pink)" opacity=".9" transform="rotate(72)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-pink)" opacity=".9" transform="rotate(144)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-pink)" opacity=".9" transform="rotate(216)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-pink)" opacity=".9" transform="rotate(288)"/>
          <circle cx="0" cy="0" r="2" fill="#9b6868" opacity=".7"/>
        </g>
        {/* medium peach */}
        <g transform="translate(86 32) scale(.85)">
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-peach)" opacity=".9"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-peach)" opacity=".85" transform="rotate(72)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-peach)" opacity=".85" transform="rotate(144)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-peach)" opacity=".85" transform="rotate(216)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-peach)" opacity=".85" transform="rotate(288)"/>
          <circle cx="0" cy="0" r="1.8" fill="#a87575" opacity=".7"/>
        </g>
        {/* small cream */}
        <g transform="translate(36 48) scale(.7)">
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-cream)" opacity=".9"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-cream)" opacity=".85" transform="rotate(72)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-cream)" opacity=".85" transform="rotate(144)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-cream)" opacity=".85" transform="rotate(216)"/>
          <ellipse cx="0" cy="-5" rx="3.5" ry="6" fill="url(#fs-cream)" opacity=".85" transform="rotate(288)"/>
          <circle cx="0" cy="0" r="1.6" fill="#9a7a45" opacity=".7"/>
        </g>
      </g>
    </svg>
  );
}

function FloralWreath({size = 180, style}){
  // Symmetric floral wreath — circle of leaves with rose-rosettes at top
  return (
    <svg width={size} height={size*.7} viewBox="0 0 200 140" style={style} aria-hidden="true">
      <defs>
        <radialGradient id="wr-pink" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".9"/>
          <stop offset="40%" stopColor="#f3bdc0"/>
          <stop offset="100%" stopColor="#c98a8d"/>
        </radialGradient>
        <radialGradient id="wr-peach" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".9"/>
          <stop offset="40%" stopColor="#f6d2bb"/>
          <stop offset="100%" stopColor="#d9956f"/>
        </radialGradient>
        <radialGradient id="wr-cream" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="50%" stopColor="#fae6c5"/>
          <stop offset="100%" stopColor="#caa56a"/>
        </radialGradient>
        <linearGradient id="wr-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a8b88f"/>
          <stop offset="100%" stopColor="#6b7e57"/>
        </linearGradient>
      </defs>
      {/* arching stems */}
      <path d="M 30 70 Q 100 0, 170 70" stroke="#8a9a7a" strokeWidth="1.2" fill="none" opacity=".65"/>
      <path d="M 40 78 Q 100 18, 160 78" stroke="#a8b88f" strokeWidth=".9" fill="none" opacity=".5"/>

      {/* leaves along left side */}
      {[
        {x:38, y:60, rx:9, ry:3.4, rot:-65},
        {x:48, y:42, rx:8, ry:3,   rot:-50},
        {x:62, y:28, rx:7, ry:2.8, rot:-30},
        {x:80, y:20, rx:6, ry:2.6, rot:-12},
      ].map((l,i)=> <ellipse key={'l'+i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="url(#wr-leaf)" opacity=".75" transform={`rotate(${l.rot} ${l.x} ${l.y})`}/>)}
      {/* leaves along right side (mirror) */}
      {[
        {x:162, y:60, rx:9, ry:3.4, rot:65},
        {x:152, y:42, rx:8, ry:3,   rot:50},
        {x:138, y:28, rx:7, ry:2.8, rot:30},
        {x:120, y:20, rx:6, ry:2.6, rot:12},
      ].map((l,i)=> <ellipse key={'r'+i} cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="url(#wr-leaf)" opacity=".75" transform={`rotate(${l.rot} ${l.x} ${l.y})`}/>)}

      {/* flowers — clustered at top */}
      {[
        {tx:78, ty:32, s:1.0, fill:'url(#wr-pink)', cc:'#9b6868'},
        {tx:100, ty:22, s:1.15, fill:'url(#wr-cream)', cc:'#9a7a45'},
        {tx:124, ty:32, s:1.0, fill:'url(#wr-peach)', cc:'#a87575'},
        {tx:62, ty:48, s:.75, fill:'url(#wr-peach)', cc:'#a87575'},
        {tx:140, ty:48, s:.75, fill:'url(#wr-pink)', cc:'#9b6868'},
      ].map((f,i)=>(
        <g key={'f'+i} transform={`translate(${f.tx} ${f.ty}) scale(${f.s})`}>
          <ellipse cx="0" cy="-5" rx="3.6" ry="6.2" fill={f.fill} opacity=".95"/>
          <ellipse cx="0" cy="-5" rx="3.6" ry="6.2" fill={f.fill} opacity=".9" transform="rotate(72)"/>
          <ellipse cx="0" cy="-5" rx="3.6" ry="6.2" fill={f.fill} opacity=".9" transform="rotate(144)"/>
          <ellipse cx="0" cy="-5" rx="3.6" ry="6.2" fill={f.fill} opacity=".9" transform="rotate(216)"/>
          <ellipse cx="0" cy="-5" rx="3.6" ry="6.2" fill={f.fill} opacity=".9" transform="rotate(288)"/>
          <circle cx="0" cy="0" r="2" fill={f.cc} opacity=".7"/>
        </g>
      ))}
      {/* small berries */}
      <circle cx="56" cy="56" r="1.6" fill="#b88aa3" opacity=".7"/>
      <circle cx="60" cy="62" r="1.4" fill="#9b6868" opacity=".65"/>
      <circle cx="144" cy="56" r="1.6" fill="#b88aa3" opacity=".7"/>
      <circle cx="148" cy="62" r="1.4" fill="#9b6868" opacity=".65"/>
    </svg>
  );
}

function FloralDivider({width = 140}){
  return (
    <svg width={width} height="22" viewBox="0 0 140 22" aria-hidden="true">
      <defs>
        <radialGradient id="fd-flower" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff"/>
          <stop offset="50%" stopColor="#f3bdc0"/>
          <stop offset="100%" stopColor="#c98a8d"/>
        </radialGradient>
      </defs>
      <line x1="6" y1="11" x2="58" y2="11" stroke="currentColor" strokeWidth=".8" opacity=".55"/>
      <line x1="82" y1="11" x2="134" y2="11" stroke="currentColor" strokeWidth=".8" opacity=".55"/>
      <ellipse cx="64" cy="11" rx="2.4" ry="4" fill="url(#fd-flower)" opacity=".9"/>
      <ellipse cx="70" cy="11" rx="2.4" ry="4" fill="url(#fd-flower)" opacity=".9" transform="rotate(72 70 11)"/>
      <ellipse cx="76" cy="11" rx="2.4" ry="4" fill="url(#fd-flower)" opacity=".9" transform="rotate(-72 76 11)"/>
      <circle cx="70" cy="11" r="1.4" fill="#9b6868" opacity=".7"/>
    </svg>
  );
}

function Invitation({ t }){
  const date = useMemo(() => {
    const d = new Date(t.dateISO + 'T00:00:00');
    return isNaN(d) ? new Date(2026,10,22) : d;
  }, [t.dateISO]);
  const day = date.getDate();
  const month = date.toLocaleString('en-US',{month:'long'});
  const year = date.getFullYear();
  const dow = date.toLocaleString('en-US',{weekday:'long'});

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(t.mapQuery || t.venueName)}&output=embed`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t.mapQuery || t.venueName)}`;

  const calHref = useMemo(() => {
    // Build a Google Calendar add-to-cal URL
    const start = new Date(`${t.dateISO}T${t.ceremonyTime}:00`);
    const end = new Date(start.getTime() + 4*60*60*1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const title = encodeURIComponent(`${t.groomFirst} & ${t.brideFirst} — Wedding`);
    const loc = encodeURIComponent(t.venueName);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${fmt(start)}/${fmt(end)}&location=${loc}`;
  }, [t]);

  return (
    <div className="card" data-screen-label="02 Invitation">
      <div className="frame"></div>

      {/* corner floral sprays */}
      <FloralSpray className="card-corner card-corner-tl"/>
      <FloralSpray className="card-corner card-corner-tr"/>
      <FloralSpray className="card-corner card-corner-bl"/>
      <FloralSpray className="card-corner card-corner-br"/>

      {/* Wreath topper */}
      <div style={{display:'flex',justifyContent:'center',marginBottom:'-8px'}}>
        <FloralWreath size={200}/>
      </div>

      <div className="eyebrow">Welcome to the wedding of</div>

      <div className="names">
        {t.groomFirst}
        <span className="amp">&amp;</span>
        {t.brideFirst}
      </div>
      <div className="surname">{t.surnameLine}</div>

      <div className="ornament" aria-hidden="true">
        <span className="bar"></span>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 C 14 6, 18 8, 22 8 C 18 10, 16 14, 16 18 C 14 16, 12 16, 10 16 C 8 16, 6 18, 4 20 C 6 14, 4 10, 2 8 C 6 8, 10 6, 12 2 Z"/></svg>
        <span className="bar"></span>
      </div>

      <p className="invite-line">
        Together with our families,<br/>
        we joyfully invite you to share in<br/>
        the celebration of our wedding day.
      </p>

      {/* Date / time */}
      <div className="meta">
        <div className="col">
          <div className="lbl">The Day</div>
          <div className="day">{day}</div>
          <div className="year" style={{marginTop:'4px'}}>{month}</div>
        </div>
        <div className="v-bar"></div>
        <div className="col">
          <div className="lbl">At</div>
          <div className="time">{t.ceremonyTime}</div>
          <div className="dow">{dow}, {year}</div>
        </div>
      </div>

      {/* Countdown */}
      <div style={{textAlign:'center',marginTop:'18px'}}>
        <div className="eyebrow" style={{marginBottom:'4px'}}>Until we say "I do"</div>
      </div>
      <Countdown dateISO={t.dateISO} timeStr={t.ceremonyTime} />

      {/* Calendar */}
      <Calendar dateISO={t.dateISO} />

      {/* Schedule */}
      <div className="schedule">
        <h3>Program of the Day</h3>
        <div className="sch-row">
          <div className="sch-time">{t.ceremonyTime}</div>
          <div className="sch-bar"></div>
          <div className="sch-body">
            <div className="ttl">Wedding Ceremony</div>
            <div className="sub">We invite you to witness this momentous occasion as we begin a new chapter together.</div>
          </div>
        </div>
        <div className="sch-row">
          <div className="sch-time">11:00</div>
          <div className="sch-bar"></div>
          <div className="sch-body">
            <div className="ttl">Reception &amp; Dining</div>
            <div className="sub">Refreshments and a celebratory meal will be served until 6:00 PM.</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="map-wrap">
        <iframe
          src={mapSrc}
          loading="lazy"
          title="Venue map"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="map-foot">
          <div>
            <div className="v-name">{t.venueName}</div>
            <div className="v-addr">{t.venueAddr}</div>
          </div>
          <a className="btn-gold" href={mapHref} target="_blank" rel="noreferrer">Directions</a>
        </div>
      </div>

      {/* RSVP */}
      <div className="rsvp">
        <div className="ttl">Kindly Reply</div>
        <p className="msg">Your presence is the greatest gift.<br/>Please confirm your attendance by 15 April 2026.</p>
        <div className="rsvp-actions">
          <button className="primary">Joyfully Accept</button>
          <button>Regretfully Decline</button>
          <a className="btn-gold" href={calHref} target="_blank" rel="noreferrer">Add to Calendar</a>
        </div>
      </div>

      <div className="signoff" style={{marginTop:'30px'}}>
        with love,
        <span className="small">{t.groomNick} &amp; {t.brideNick}</span>
      </div>

      {/* bottom floral */}
      <div style={{display:'flex',justifyContent:'center',marginTop:'18px',transform:'rotate(180deg)'}}>
        <FloralWreath size={140}/>
      </div>
    </div>
  );
}

// ============================================================
// App
// ============================================================

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [open, setOpen] = useState(false);

  // Apply palette as CSS vars on root
  useEffect(() => {
    const p = PALETTES[t.palette] || PALETTES.rose;
    const r = document.documentElement;
    r.style.setProperty('--rose', p.rose);
    r.style.setProperty('--rose-deep', p.roseDeep);
    r.style.setProperty('--gold', p.gold);
    r.style.setProperty('--gold-deep', p.goldDeep);
  }, [t.palette]);

  // Re-close handler
  const replay = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <div data-screen-label="01 Sealed Letter">
      {/* Replay button (top-left) */}
      <button className={`replay ${open?'show':''}`} onClick={replay}>↺ Re-seal Letter</button>

      <div className="stage">
        <div className={`letter ${open?'open':''}`}>
          {/* Base paper (always visible) */}
          <div className="paper"></div>

          {/* Inside content (revealed when flap opens) */}
          <div className="inside" style={{opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none'}}>
            <Invitation t={t} />
          </div>

          {/* fold shadow */}
          <div className="fold-shadow"></div>

          {/* Front flap that opens like a book cover */}
          <div className="flap"
               style={{transform: open ? 'rotateY(-168deg)' : 'rotateY(0deg)',
                       boxShadow: open ? '0 30px 50px rgba(0,0,0,.4)' : undefined}}
               aria-hidden={open}>
            <div className="flap-inner">
              <ClosedFace t={t} open={open} />
            </div>
            <div className="flap-back"></div>
          </div>

          {/* Seal — only visible when closed */}
          <div
            className={`seal-wrap ${open?'hidden':''}`}
            role="button"
            tabIndex={0}
            aria-label="Press the seal to open the letter"
            onClick={() => setOpen(true)}
            onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); setOpen(true); } }}
          >
            <div className="seal">
              <div className="seal-ring"></div>
              <div className="seal-inner">
                {t.monogramLeft}
                <span className="amp">&amp;</span>
                {t.monogramRight}
              </div>
            </div>
          </div>
          <div className={`seal-prompt ${open?'hidden':''}`}
               style={{opacity: open ? 0 : 1}}>tap the seal</div>
        </div>
      </div>

      <Petals active={open} density={t.petalDensity} />

      {/* Tweaks panel */}
      <TweaksPanel>
        <TweakSection label="The Couple"/>
        <TweakText label="Groom" value={t.groomFirst} onChange={v=>setTweak('groomFirst', v)}/>
        <TweakText label="Bride" value={t.brideFirst} onChange={v=>setTweak('brideFirst', v)}/>
        <TweakText label="Groom monogram" value={t.monogramLeft} onChange={v=>setTweak('monogramLeft', v)}/>
        <TweakText label="Bride monogram" value={t.monogramRight} onChange={v=>setTweak('monogramRight', v)}/>
        <TweakText label="Surname line" value={t.surnameLine} onChange={v=>setTweak('surnameLine', v)}/>

        <TweakSection label="Date & Time"/>
        <TweakText label="Date (YYYY-MM-DD)" value={t.dateISO} onChange={v=>setTweak('dateISO', v)}/>
        <TweakText label="Time (HH:MM)" value={t.ceremonyTime} onChange={v=>setTweak('ceremonyTime', v)}/>

        <TweakSection label="Venue"/>
        <TweakText label="Venue name" value={t.venueName} onChange={v=>setTweak('venueName', v)}/>
        <TweakText label="Address" value={t.venueAddr} onChange={v=>setTweak('venueAddr', v)}/>
        <TweakText label="Map query" value={t.mapQuery} onChange={v=>setTweak('mapQuery', v)}/>

        <TweakSection label="Style"/>
        <TweakSelect label="Palette" value={t.palette}
          options={['rose','blush','sage','midnight']}
          onChange={v=>setTweak('palette', v)}/>
        <TweakSelect label="Petals" value={t.petalDensity}
          options={['lush','gentle','minimal','off']}
          onChange={v=>setTweak('petalDensity', v)}/>

        <TweakSection label="Preview"/>
        <TweakButton label={open?'Re-seal letter':'Open letter'}
          onClick={() => setOpen(o => !o)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
