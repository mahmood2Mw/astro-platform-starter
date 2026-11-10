import React from 'react';
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame } from 'remotion';
import {
  AD,
  AppTile,
  Bubble,
  C,
  Cursor,
  FONT,
  GOLD_GRAD,
  GoldLogo,
  Headline,
  HudRing,
  Icon,
  Sparks,
  clamp,
  ease,
  fadeIn,
  glass,
  goldText,
  useSpr,
} from './theme';

const spr = (frame: number, delay: number, damping = 14, stiffness = 120) =>
  spring({ frame: frame - delay, fps: 30, config: { damping, stiffness } });

/* ================================================================== */
/* 1 — Gold logo reveal                                                */
/* ================================================================== */
export const SLogo: React.FC = () => {
  const f = useCurrentFrame();
  const reveal = interpolate(f, [4, 34], [0, 1], { ...clamp, easing: ease });
  const glow = 0.6 + 0.6 * interpolate(f, [26, 34, 60], [0, 1, 0.5], clamp);
  const ring = useSpr(0, { damping: 18 });
  const flare = interpolate(f, [24, 34, 52], [0, 1, 0], clamp);
  const name = fadeIn(f, 30, 16);
  const en = fadeIn(f, 40, 16);
  const shine = interpolate(f, [36, 75], [-60, 180], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 540, top: 720, transform: `scale(${ring})` }}>
        <HudRing size={760} color={C.gold} dash="2 6" speed={0.6} opacity={0.5} />
        <HudRing size={660} color={C.gold} dash="60 20" speed={-1.2} width={3} opacity={0.75} />
        <HudRing size={560} color={C.cyan} dash="12 30" speed={2} opacity={0.6} />
      </div>
      <div style={{ position: 'absolute', left: 540, top: 720, transform: 'translate(-50%, -50%)' }}>
        <GoldLogo height={430} reveal={reveal} glow={glow} />
      </div>
      {/* anamorphic flare */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 716,
          height: 8,
          opacity: flare,
          background: `linear-gradient(90deg, transparent, ${C.gold2}, #fff, ${C.gold2}, transparent)`,
          boxShadow: `0 0 40px 10px ${C.gold}88`,
          transform: `scaleX(${0.3 + flare})`,
        }}
      />
      <div style={{ position: 'absolute', left: 540, top: 720 }}>
        <Sparks at={30} count={30} spread={480} seed="logo" />
      </div>
      <div style={{ position: 'absolute', top: 1060, width: '100%', textAlign: 'center', direction: 'rtl', fontFamily: FONT }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 112,
            opacity: name,
            transform: `translateY(${(1 - name) * 40}px)`,
            letterSpacing: (1 - name) * 20,
            filter: `drop-shadow(0 0 24px ${C.gold}88)`,
            ...goldText(shine),
          }}
        >
          معهد اليقين الدولي
        </div>
        <div style={{ fontWeight: 800, fontSize: 36, letterSpacing: 7 * en + 2, color: C.white, direction: 'ltr', opacity: en }}>
          ALYAQIN INTERNATIONAL INSTITUTE
        </div>
        <div style={{ margin: '30px auto 0', width: `${en * 60}%`, height: 3, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 2 — Hook: career staircase                                          */
/* ================================================================== */
export const SHook: React.FC = () => {
  const f = useCurrentFrame();
  const N = 5;
  const W = 150;
  const GAP = 15;
  const base = 1160;
  const bars = new Array(N).fill(0).map((_, i) => ({ x: 945 - W - i * (W + GAP), h: 110 + i * 105 }));
  // person hops from bar to bar
  const hopStart = 26;
  const hopLen = 11;
  const k = Math.min(N - 1, Math.max(0, Math.floor((f - hopStart) / hopLen)));
  const tt = interpolate(f - hopStart - k * hopLen, [0, hopLen], [0, 1], clamp);
  const from = bars[Math.max(0, k - 1)];
  const to = bars[k];
  const moving = f >= hopStart && k > 0 ? tt : 1;
  const px = (from.x + (to.x - from.x) * moving) + W / 2;
  const py = base - (from.h + (to.h - from.h) * moving) - Math.sin(moving * Math.PI) * 60;
  const arrived = f > hopStart + (N - 1) * hopLen + hopLen;
  const brief = spr(f, hopStart + (N - 1) * hopLen + 4, 9);
  const cv = spr(f, 8, 15);
  const trend = interpolate(f, [10, 70], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill>
      {/* floating CV card */}
      <div
        style={{
          ...glass,
          position: 'absolute',
          right: 70,
          top: 300,
          width: 300,
          height: 210,
          padding: 22,
          transform: `translateX(${(1 - cv) * 400}px) rotate(${6 + Math.sin(f / 14) * 2}deg)`,
          direction: 'rtl',
          fontFamily: FONT,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Bubble size={64} color={C.gold}>
            <Icon.user size={34} color={C.gold} />
          </Bubble>
          <div style={{ color: C.white, fontWeight: 800, fontSize: 30 }}>السيرة الذاتية</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
          {[0.95, 0.7, 0.85].map((v, i) => (
            <span key={i} style={{ height: 10, width: `${v * 100 * trend}%`, borderRadius: 5, background: i ? 'rgba(255,255,255,0.3)' : C.cyan }} />
          ))}
        </div>
      </div>
      {/* magnifier scanning */}
      <div style={{ position: 'absolute', left: 120 + Math.sin(f / 10) * 40, top: 340 + Math.cos(f / 13) * 20, opacity: fadeIn(f, 14) }}>
        <Bubble size={130} color={C.cyan}>
          <Icon.search size={70} color={C.cyan} />
        </Bubble>
      </div>
      {/* trend line */}
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <path
          d={`M 960 ${base - 40} Q 600 ${base - 160} 150 ${base - 640}`}
          stroke={C.gold}
          strokeWidth="5"
          strokeDasharray="14 12"
          fill="none"
          opacity={0.7}
          pathLength={1000}
          style={{ strokeDashoffset: 0, clipPath: `inset(0 0 0 ${(1 - trend) * 100}%)` }}
        />
      </svg>
      {/* staircase */}
      {bars.map((b, i) => {
        const s = spr(f, 4 + i * 4, 13);
        const active = i <= k && f >= hopStart;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: b.x,
              top: base - b.h * s,
              width: W,
              height: b.h * s,
              borderRadius: '18px 18px 6px 6px',
              background: active
                ? `linear-gradient(180deg, ${C.gold}cc, ${C.maroon}aa)`
                : 'linear-gradient(180deg, rgba(65,214,240,0.35), rgba(29,79,168,0.25))',
              border: `2px solid ${active ? C.gold : C.cyan}88`,
              boxShadow: active ? `0 0 30px ${C.gold}66` : `0 0 20px ${C.cyan}33`,
              display: 'flex',
              justifyContent: 'center',
              paddingTop: 14,
              fontFamily: AD,
              fontSize: 40,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {i + 1}
          </div>
        );
      })}
      {/* person token */}
      <div style={{ position: 'absolute', left: px - 50, top: py - 112, opacity: fadeIn(f, 18, 8) }}>
        <Bubble size={100} color={C.white}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill={C.white}>
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
          </svg>
        </Bubble>
      </div>
      {/* briefcase reward */}
      <div style={{ position: 'absolute', left: bars[N - 1].x + W / 2, top: base - bars[N - 1].h - 300 }}>
        <div style={{ transform: `translate(-50%, 0) scale(${brief})`, position: 'absolute' }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: 40,
              background: GOLD_GRAD,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 60px ${C.gold}, 0 0 120px ${C.gold}66`,
            }}
          >
            <Icon.briefcase size={96} color={C.maroon} stroke={2.4} />
          </div>
        </div>
        {arrived && <Sparks at={hopStart + (N - 1) * hopLen + 6} seed="brief" spread={300} />}
      </div>
      <Headline
        top={1200}
        start={8}
        step={4}
        lines={[
          { text: 'هل تريد زيادة', size: 96 },
          { text: 'فرصتك الوظيفية؟', size: 132, gold: true },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 3 — Computer + 3D orbit of tools                                    */
/* ================================================================== */
const ORBIT = [
  () => <AppTile letter="W" color="#2b6fe0" size={96} />,
  () => <AppTile letter="X" color="#1f9d55" size={96} />,
  () => <AppTile letter="P" color="#e2572b" size={96} />,
  () => (
    <Bubble size={96} color={C.cyan}>
      <Icon.globe size={54} color={C.cyan} />
    </Bubble>
  ),
  () => (
    <Bubble size={96} color={C.crimson}>
      <Icon.mail size={50} color={C.crimson} />
    </Bubble>
  ),
  () => (
    <Bubble size={96} color={C.gold}>
      <Icon.cloud size={54} color={C.gold} />
    </Bubble>
  ),
  () => (
    <Bubble size={96} color={C.cyan}>
      <Icon.wifi size={54} color={C.cyan} />
    </Bubble>
  ),
];

const Monitor: React.FC<{ w: number; h: number; children: React.ReactNode }> = ({ w, h, children }) => (
  <div style={{ position: 'relative', width: w, height: h + 150 }}>
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 22,
        padding: 14,
        boxSizing: 'border-box',
        background: 'linear-gradient(160deg, #2a3140, #0c0f16)',
        border: '2px solid rgba(255,255,255,0.18)',
        boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 80px ${C.cyan}33`,
      }}
    >
      <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>{children}</div>
    </div>
    <div style={{ position: 'absolute', left: w / 2 - 50, top: h, width: 100, height: 90, background: 'linear-gradient(90deg, #1b202b, #3a4252, #1b202b)' }} />
    <div style={{ position: 'absolute', left: w / 2 - 170, top: h + 86, width: 340, height: 22, borderRadius: 12, background: 'linear-gradient(180deg, #4a5366, #1b202b)' }} />
  </div>
);

const Wallpaper: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 70% 60%, #2f7df5 0%, #0d3aa8 40%, #061642 80%)' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: -200 + i * 60,
            top: 120 + i * 40,
            width: 1000,
            height: 400,
            borderRadius: '50%',
            border: `${18 - i * 4}px solid rgba(140,200,255,${0.35 - i * 0.08})`,
            transform: `rotate(${-18 + Math.sin((f + i * 20) / 30) * 6}deg)`,
            filter: 'blur(2px)',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

export const SSkills: React.FC = () => {
  const f = useCurrentFrame();
  const mon = spr(f, 2, 13);
  const cx = 540;
  const cy = 700;
  const Rx = 440;
  const Ry = 150;
  const items = ORBIT.map((El, i) => {
    const a = (i / ORBIT.length) * Math.PI * 2 + f * 0.035;
    const depth = (Math.sin(a) + 1) / 2; // 0 back .. 1 front
    const sp = spr(f, 10 + i * 3, 11);
    return { El, x: cx + Math.cos(a) * Rx, y: cy + 40 + Math.sin(a) * Ry, depth, sp };
  });
  const back = items.filter((it) => it.depth < 0.5);
  const front = items.filter((it) => it.depth >= 0.5);
  const node = (it: (typeof items)[number], i: number) => (
    <div
      key={i}
      style={{
        position: 'absolute',
        left: it.x - 48,
        top: it.y - 48,
        transform: `scale(${it.sp * (0.65 + 0.5 * it.depth)})`,
        opacity: 0.45 + 0.55 * it.depth,
        filter: `blur(${(1 - it.depth) * 2}px)`,
      }}
    >
      <it.El />
    </div>
  );
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        <ellipse cx={cx} cy={cy + 40} rx={Rx} ry={Ry} fill="none" stroke={C.gold} strokeOpacity={0.45 * mon} strokeWidth="2.5" strokeDasharray="10 12" />
        <ellipse cx={cx} cy={cy + 40} rx={Rx + 60} ry={Ry + 30} fill="none" stroke={C.cyan} strokeOpacity={0.25 * mon} strokeWidth="2" />
      </svg>
      {back.map(node)}
      <div
        style={{
          position: 'absolute',
          left: cx - 330,
          top: cy - 260,
          transform: `perspective(1400px) rotateX(${(1 - mon) * 40}deg) scale(${0.6 + 0.4 * mon})`,
          opacity: mon,
        }}
      >
        <Monitor w={660} h={410}>
          <Wallpaper />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: AD,
              direction: 'rtl',
              opacity: fadeIn(f, 20),
            }}
          >
            <div style={{ fontSize: 64, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>مهارات</div>
            <div style={{ fontSize: 76, lineHeight: 1.1, ...goldText(interpolate(f, [30, 70], [-50, 160], clamp)), filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}>
              الحاسب الآلي
            </div>
          </div>
        </Monitor>
      </div>
      {front.map(node)}
      <Headline
        top={1210}
        start={14}
        step={3}
        lines={[
          { text: 'اجعل مهارات الحاسب الآلي', size: 82 },
          { text: 'نقطة تميّزك', size: 140, gold: true },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 4 — Program title                                                   */
/* ================================================================== */
export const STitle: React.FC = () => {
  const f = useCurrentFrame();
  const pill = spr(f, 2, 11);
  const box = interpolate(f, [10, 40], [0, 1], { ...clamp, easing: ease });
  const aud = spr(f, 46, 11);
  return (
    <AbsoluteFill>
      {/* binary rain on the sides */}
      {[60, 130, 950, 1020].map((x, ci) => (
        <div key={ci} style={{ position: 'absolute', left: x, top: 260, fontFamily: 'monospace', fontSize: 22, lineHeight: 1.3, color: ci % 2 ? `${C.gold}55` : `${C.cyan}55`, whiteSpace: 'pre' }}>
          {new Array(36)
            .fill(0)
            .map((_, r) => (random(`b${ci}-${r}-${Math.floor((f + r * 3) / 4)}`) > 0.5 ? '1' : '0'))
            .join('\n')}
        </div>
      ))}
      <div style={{ position: 'absolute', left: 540, top: 820 }}>
        <HudRing size={980} color={C.cyan} dash="4 10" speed={0.4} opacity={0.35} />
        <HudRing size={880} color={C.gold} dash="80 40" speed={-0.7} opacity={0.3} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 300,
          left: '50%',
          transform: `translateX(-50%) scale(${pill})`,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '14px 46px',
          borderRadius: 60,
          background: `linear-gradient(90deg, ${C.navy}, ${C.navy2})`,
          border: `2px solid ${C.gold}88`,
          boxShadow: `0 0 40px ${C.navy2}88`,
          color: C.white,
          fontFamily: AD,
          fontSize: 58,
          direction: 'rtl',
          whiteSpace: 'nowrap',
        }}
      >
        <Icon.laptop size={56} color={C.gold} />
        <span style={{ width: 2, height: 46, background: 'rgba(255,255,255,0.4)' }} />
        برنامج تدريبي
      </div>
      {/* title box */}
      <div
        style={{
          ...glass,
          position: 'absolute',
          left: 70,
          right: 70,
          top: 460,
          height: 720,
          borderRadius: 50,
          opacity: box,
          transform: `scale(${0.9 + 0.1 * box})`,
          background: 'rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ position: 'absolute', top: -3, right: 50, height: 6, width: `${box * 55}%`, background: C.crimson, borderRadius: 3, boxShadow: `0 0 18px ${C.crimson}` }} />
        <div style={{ position: 'absolute', bottom: -3, left: 50, height: 6, width: `${box * 55}%`, background: C.crimson, borderRadius: 3, boxShadow: `0 0 18px ${C.crimson}` }} />
      </div>
      <Headline
        top={500}
        start={12}
        step={7}
        gap={-10}
        lines={[
          { text: 'أساسيات', size: 175 },
          { text: 'الحاسب الآلي', size: 190, gold: true },
          { text: 'الشاملة', size: 175 },
        ]}
      />
      <div
        style={{
          ...glass,
          position: 'absolute',
          top: 1260,
          left: '50%',
          transform: `translateX(-50%) scale(${aud})`,
          padding: '18px 50px',
          borderRadius: 70,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          direction: 'rtl',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 54,
          color: C.white,
          whiteSpace: 'nowrap',
          border: `2px solid ${C.cyan}77`,
        }}
      >
        <Icon.user size={62} color={C.crimson} />
        للباحثين عن عمل
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 5 — Hands-on: laptop screen cycling through the apps                */
/* ================================================================== */
const APPS = [
  { key: 'W', name: 'معالجة النصوص', color: '#2b6fe0' },
  { key: 'X', name: 'الجداول', color: '#1f9d55' },
  { key: 'P', name: 'العروض', color: '#e2572b' },
  { key: 'net', name: 'الإنترنت والبريد', color: '#13a6c2' },
];
const APP_START = 12;
const APP_LEN = 27;

const WordApp: React.FC<{ t: number }> = ({ t }) => {
  const lines = [0.55, 0.95, 0.9, 0.97, 0.7, 0.88];
  const prog = t * lines.length * 1.1;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#dfe6f2' }}>
      <div style={{ height: 46, background: '#2b6fe0', display: 'flex', gap: 14, alignItems: 'center', padding: '0 20px' }}>
        {[60, 46, 70, 52].map((w, i) => (
          <span key={i} style={{ width: w, height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.55)' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 130, right: 130, top: 70, bottom: 0, background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.15)', padding: '34px 40px', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-end' }}>
        {lines.map((v, i) => {
          const w = Math.max(0, Math.min(1, prog - i));
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, width: `${v * 100}%`, justifyContent: 'flex-end' }}>
              {w > 0 && w < 1 && <span style={{ width: 3, height: i === 0 ? 30 : 18, background: '#2b6fe0' }} />}
              <span style={{ width: `${w * 100}%`, height: i === 0 ? 26 : 14, borderRadius: 7, background: i === 0 ? '#2b6fe0' : '#9aa6b8' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ExcelApp: React.FC<{ t: number }> = ({ t }) => {
  const rows = 7;
  const cols = 5;
  const filled = Math.floor(t * rows * cols * 1.2);
  const bars = [0.4, 0.65, 0.5, 0.85, 0.7];
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#eef3ef', display: 'flex', direction: 'ltr' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 46, background: '#1f9d55' }} />
      <div style={{ position: 'absolute', left: 20, top: 66, display: 'grid', gridTemplateColumns: `repeat(${cols}, 92px)`, gap: 2, background: '#c9d6cc', border: '2px solid #c9d6cc' }}>
        {new Array(rows * cols).fill(0).map((_, i) => {
          const header = i < cols;
          const on = i < filled;
          return (
            <div
              key={i}
              style={{
                height: 46,
                background: header ? '#cfe9d8' : on && i % cols === 4 ? '#e3f6ea' : '#fff',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 20,
                color: header ? '#1f6b3e' : '#334',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: i === filled ? '3px solid #1f9d55' : 'none',
              }}
            >
              {on ? (header ? String.fromCharCode(65 + i) : Math.floor(random(`c${i}`) * 900 + 100)) : ''}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', right: 26, top: 80, width: 300, height: 300, background: '#fff', borderRadius: 12, padding: 20, boxSizing: 'border-box', display: 'flex', alignItems: 'flex-end', gap: 14 }}>
        {bars.map((v, i) => (
          <span key={i} style={{ flex: 1, height: `${v * 100 * Math.min(1, t * 1.6)}%`, borderRadius: 6, background: i === 3 ? C.crimson : '#1f9d55' }} />
        ))}
      </div>
    </div>
  );
};

const PptApp: React.FC<{ t: number }> = ({ t }) => {
  const title = interpolate(t, [0.05, 0.35], [0, 1], { ...clamp, easing: ease });
  const pie = interpolate(t, [0.3, 0.9], [0, 1], clamp);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f3ece8', direction: 'ltr' }}>
      <div style={{ height: 46, background: '#e2572b' }} />
      <div style={{ position: 'absolute', left: 18, top: 64, width: 150, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 84, borderRadius: 8, background: '#fff', border: i === 1 ? '3px solid #e2572b' : '1px solid #ddd' }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 190, right: 20, top: 64, bottom: 20, background: '#fff', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 30, left: 30, right: 30, height: 60, borderRadius: 10, background: `linear-gradient(90deg, ${C.maroon}, #e2572b)`, transform: `translateX(${(1 - title) * -110}%)` }} />
        <svg width="220" height="220" viewBox="0 0 42 42" style={{ position: 'absolute', left: 50, top: 130 }}>
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#f2d6cb" strokeWidth="8" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#e2572b" strokeWidth="8" strokeDasharray={`${pie * 65} 100`} transform="rotate(-90 21 21)" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke={C.gold} strokeWidth="8" strokeDasharray={`${pie * 25} 100`} strokeDashoffset={-65 * pie} transform="rotate(-90 21 21)" />
        </svg>
        <div style={{ position: 'absolute', right: 40, top: 150, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {[200, 160, 180].map((w, i) => (
            <span key={i} style={{ width: w * Math.min(1, pie * 1.5), height: 16, borderRadius: 8, background: i ? '#ccc' : '#e2572b' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

const NetApp: React.FC<{ t: number }> = ({ t }) => {
  const q = 'تطوير المهارات الرقمية';
  const typed = q.slice(0, Math.floor(interpolate(t, [0.05, 0.45], [0, q.length], clamp)));
  const fly = interpolate(t, [0.6, 0.95], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const sent = t > 0.92;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#e9f4f8' }}>
      <div style={{ height: 46, background: '#13a6c2', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
        {['#ff6b6b', '#ffd166', '#06d6a0'].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
      </div>
      <div style={{ margin: '24px 40px', height: 60, borderRadius: 30, background: '#fff', border: '2px solid #13a6c2', display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', direction: 'rtl', fontFamily: FONT, fontWeight: 700, fontSize: 26, color: '#123' }}>
        <Icon.search size={30} color="#13a6c2" />
        {typed}
        <span style={{ width: 2, height: 30, background: '#13a6c2' }} />
      </div>
      <div style={{ display: 'flex', gap: 20, margin: '0 40px', direction: 'rtl' }}>
        <div style={{ flex: 1, height: 250, borderRadius: 16, background: '#fff', padding: 20, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[0.9, 0.6, 0.8, 0.5].map((v, i) => (
            <span key={i} style={{ width: `${v * 100}%`, height: 14, borderRadius: 7, background: i ? '#c8d6dc' : '#13a6c2' }} />
          ))}
        </div>
        <div style={{ width: 300, height: 250, borderRadius: 16, background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'relative', fontFamily: FONT, fontWeight: 800, fontSize: 26, color: sent ? '#1f9d55' : '#13a6c2' }}>
          <div style={{ transform: `translate(${-fly * 500}px, ${-fly * 160}px) rotate(${-fly * 20}deg) scale(${1 - fly * 0.4})`, opacity: 1 - fly * 0.8 }}>
            <Icon.mail size={110} color={C.crimson} />
          </div>
          {sent ? 'تم الإرسال ✓' : 'إرسال البريد'}
        </div>
      </div>
    </div>
  );
};

export const SApps: React.FC = () => {
  const f = useCurrentFrame();
  const lap = spr(f, 0, 14);
  const idx = Math.max(0, Math.min(3, Math.floor((f - APP_START) / APP_LEN)));
  const t = interpolate(f - APP_START - idx * APP_LEN, [0, APP_LEN], [0, 1], clamp);
  const appT = idx === 3 ? interpolate(f - APP_START - 3 * APP_LEN, [0, APP_LEN + 14], [0, 1], clamp) : t;
  const swap = interpolate(f - APP_START - idx * APP_LEN, [0, 6], [0, 1], clamp);
  const Apps = [WordApp, ExcelApp, PptApp, NetApp];
  const App = Apps[idx];
  // cursor waypoints (inside the 900x560 screen)
  const way = [
    [620, 300],
    [300, 230],
    [420, 260],
    [180, 420],
  ];
  const prev = way[Math.max(0, idx - 1)];
  const cur = way[idx];
  const mv = interpolate(t, [0, 0.45], [0, 1], { ...clamp, easing: ease });
  const cx = prev[0] + (cur[0] - prev[0]) * mv;
  const cy = prev[1] + (cur[1] - prev[1]) * mv;
  const click = interpolate(t, [0.45, 0.7], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 90, top: 290, transform: `perspective(1600px) rotateX(${(1 - lap) * 50}deg) translateY(${(1 - lap) * 200}px)`, opacity: lap }}>
        {/* screen */}
        <div style={{ width: 900, height: 600, borderRadius: '26px 26px 8px 8px', padding: 16, boxSizing: 'border-box', background: 'linear-gradient(160deg, #2a3140, #0c0f16)', border: '2px solid rgba(255,255,255,0.18)', boxShadow: `0 0 90px ${APPS[idx].color}55, 0 40px 80px rgba(0,0,0,0.6)` }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', background: '#0b1220' }}>
            {/* title bar with app tabs */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 44, background: '#141b2a', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', direction: 'rtl', zIndex: 2 }}>
              {APPS.map((a, i) => (
                <div
                  key={a.key}
                  style={{
                    padding: '4px 16px',
                    borderRadius: 8,
                    background: i === idx ? a.color : 'rgba(255,255,255,0.08)',
                    color: C.white,
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {a.name}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 44, left: 0, right: 0, bottom: 0, opacity: swap, transform: `translateY(${(1 - swap) * 30}px)` }}>
              <App t={appT} />
            </div>
            <Cursor x={cx} y={cy + 44} click={click > 0 && click < 1 ? click : 0} />
            {/* glare */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.12) 0%, transparent 35%)', pointerEvents: 'none' }} />
          </div>
        </div>
        {/* base */}
        <div style={{ width: 1000, height: 34, marginLeft: -50, borderRadius: '0 0 30px 30px', background: 'linear-gradient(180deg, #8a93a6, #3a4252)', boxShadow: '0 30px 50px rgba(0,0,0,0.6)' }} />
      </div>
      {/* app chips */}
      <div style={{ position: 'absolute', top: 990, left: 50, right: 50, display: 'flex', justifyContent: 'center', gap: 22, direction: 'rtl' }}>
        {APPS.map((a, i) => {
          const s = spr(f, 6 + i * 4, 12);
          const on = i === idx;
          return (
            <div
              key={a.key}
              style={{
                transform: `translateY(${(1 - s) * 80}px) scale(${on ? 1.12 : 0.95})`,
                opacity: s,
                filter: on ? `drop-shadow(0 0 20px ${C.gold})` : 'none',
              }}
            >
              {a.key === 'net' ? (
                <Bubble size={96} color={on ? C.gold : C.cyan}>
                  <Icon.globe size={54} color={on ? C.gold : C.cyan} />
                </Bubble>
              ) : (
                <AppTile letter={a.key} color={a.color} size={96} />
              )}
            </div>
          );
        })}
      </div>
      <Headline
        top={1170}
        start={18}
        step={4}
        lines={[
          { text: 'تدريب عملي على', size: 88 },
          { text: 'أهم البرامج المكتبية', size: 118, gold: true },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 6 — Accredited certificate                                          */
/* ================================================================== */
const Seal: React.FC<{ size: number }> = ({ size }) => {
  const f = useCurrentFrame();
  const pts = new Array(40)
    .fill(0)
    .map((_, i) => {
      const a = (i / 40) * Math.PI * 2;
      const r = i % 2 ? 90 : 100;
      return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
    })
    .join(' ');
  return (
    <svg width={size} height={size} viewBox="-5 -5 210 210">
      <defs>
        <radialGradient id="sealbg" cx="40%" cy="35%">
          <stop offset="0" stopColor={C.navy2} />
          <stop offset="1" stopColor="#0a1f52" />
        </radialGradient>
        <linearGradient id="sealgold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.gold2} />
          <stop offset="0.5" stopColor={C.gold} />
          <stop offset="1" stopColor={C.goldDeep} />
        </linearGradient>
      </defs>
      <polygon points={pts} fill="url(#sealbg)" stroke="url(#sealgold)" strokeWidth="4" transform={`rotate(${f * 0.6} 100 100)`} />
      <circle cx="100" cy="100" r="70" fill="none" stroke="url(#sealgold)" strokeWidth="5" />
      <circle cx="100" cy="100" r="60" fill="none" stroke="url(#sealgold)" strokeWidth="1.5" strokeDasharray="3 4" />
      <path d="M72 100 l18 18 l38 -40" stroke="url(#sealgold)" strokeWidth="13" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const SCert: React.FC = () => {
  const f = useCurrentFrame();
  const paper = spr(f, 0, 15, 90);
  const stampAt = 30;
  const stamp = interpolate(f, [stampAt - 8, stampAt], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const shock = interpolate(f, [stampAt, stampAt + 18], [0, 1], clamp);
  const shake = f >= stampAt && f < stampAt + 8 ? Math.sin(f * 3) * (stampAt + 8 - f) * 1.5 : 0;
  const ribbon = interpolate(f, [stampAt + 6, stampAt + 24], [0, 1], { ...clamp, easing: ease });
  const shine = interpolate(f, [stampAt + 20, stampAt + 55], [-30, 130], clamp);
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      {/* rays */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 700,
          top: 620 - 700,
          width: 1400,
          height: 1400,
          opacity: 0.35 * fadeIn(f, stampAt, 10),
          transform: `rotate(${f * 0.5}deg)`,
          background: `repeating-conic-gradient(from 0deg, ${C.gold}55 0deg 5deg, transparent 5deg 20deg)`,
          WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 58%)',
          maskImage: 'radial-gradient(circle, black 0%, transparent 58%)',
        }}
      />
      {/* certificate paper */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 300,
          width: 860,
          height: 600,
          transform: `perspective(1500px) rotateX(${(1 - paper) * 60}deg) translateY(${(1 - paper) * 300}px) rotate(-2deg)`,
          opacity: paper,
          borderRadius: 14,
          background: 'linear-gradient(160deg, #fffaf0, #f3e7cf)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.6)',
          padding: 22,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ position: 'absolute', inset: 18, border: `5px solid ${C.gold}`, borderRadius: 10 }} />
        <div style={{ position: 'absolute', inset: 32, border: `2px solid ${C.goldDeep}`, borderRadius: 6 }} />
        <div style={{ position: 'absolute', top: 50, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ filter: 'brightness(0.85)' }}>
            <GoldLogo height={120} glow={0.15} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: 175, width: '100%', textAlign: 'center', fontFamily: AD, fontSize: 96, color: C.maroon, left: 0 }}>شهادة</div>
        <div style={{ position: 'absolute', top: 320, left: 140, right: 140, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center' }}>
          {[0.9, 0.7, 0.8].map((v, i) => (
            <span key={i} style={{ width: `${v * 100}%`, height: 12, borderRadius: 6, background: i ? '#d9cdb5' : '#c4a96a' }} />
          ))}
        </div>
        <svg width="220" height="70" viewBox="0 0 220 70" style={{ position: 'absolute', right: 90, bottom: 50 }}>
          <path d="M5 45 C 30 5, 45 65, 70 35 S 110 10, 120 45 S 170 50, 215 25" stroke={C.navy} strokeWidth="3.5" fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - fadeIn(f, 12, 22)} />
        </svg>
        {/* seal stamping */}
        <div
          style={{
            position: 'absolute',
            left: 50,
            bottom: 20,
            transform: `scale(${2.6 - 1.6 * stamp}) rotate(${(1 - stamp) * -30}deg)`,
            opacity: stamp,
            filter: `drop-shadow(0 0 ${20 + shock * 10}px ${C.gold}aa)`,
          }}
        >
          <Seal size={200} />
        </div>
        {f >= stampAt && (
          <div
            style={{
              position: 'absolute',
              left: 150 - shock * 260,
              bottom: 120 - shock * 260,
              width: shock * 520,
              height: shock * 520,
              borderRadius: '50%',
              border: `5px solid ${C.gold}`,
              opacity: 1 - shock,
            }}
          />
        )}
      </div>
      <div style={{ position: 'absolute', left: 260, top: 790 }}>
        <Sparks at={stampAt} seed="cert" count={34} spread={520} />
      </div>
      {/* ribbon */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 950,
          height: 150,
          clipPath: `inset(0 ${(1 - ribbon) * 50}% 0 ${(1 - ribbon) * 50}%)`,
          background: `linear-gradient(180deg, ${C.crimson}, ${C.maroon})`,
          border: `4px solid ${C.gold}`,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${C.crimson}66`,
          direction: 'rtl',
        }}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: 140, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)', transform: 'skewX(-20deg)' }} />
        <span style={{ fontFamily: AD, fontSize: 92, color: C.white, textShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>شهادة معتمدة</span>
      </div>
      <Headline top={1150} start={stampAt + 12} step={4} lines={[{ text: 'من وزارة العمل', size: 120, gold: true }]} />
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 7 — Course details + swinging price tag                             */
/* ================================================================== */
export const SDetails: React.FC = () => {
  const f = useCurrentFrame();
  const card = (i: number) => spr(f, 4 + i * 6, 13);
  const flip = interpolate(f, [16, 30], [-90, 0], { ...clamp, easing: ease });
  const hand = interpolate(f, [18, 46], [0, 1], { ...clamp, easing: ease });
  const weeks = [0, 1, 2].map((i) => interpolate(f, [24 + i * 8, 34 + i * 8], [0, 1], clamp));
  const tagIn = spr(f, 46, 9, 90);
  const swing = Math.sin((f - 46) / 5) * 14 * Math.exp(-(f - 46) / 22) * (f > 46 ? 1 : 0);
  const count = Math.round(interpolate(f, [52, 84], [0, 130], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const pop = interpolate(f, [84, 90, 104], [0, 1, 0.3], clamp);
  // clock: hour hand 4:30 -> 6:30
  const hourA = (4.5 + hand * 2) * 30;
  const minA = hand * 2 * 360;
  const arcStart = 4.5 * 30;
  const arcEnd = arcStart + hand * 60;
  const pt = (a: number, r: number) => [50 + Math.sin((a * Math.PI) / 180) * r, 50 - Math.cos((a * Math.PI) / 180) * r];
  const [ax, ay] = pt(arcStart, 40);
  const [bx, by] = pt(arcEnd, 40);
  const cardBase: React.CSSProperties = {
    ...glass,
    width: 300,
    height: 420,
    padding: '24px 16px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: FONT,
    direction: 'rtl',
  };
  const label = (t: string, c: string) => <div style={{ fontWeight: 800, fontSize: 32, color: c }}>{t}</div>;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 290, left: 45, right: 45, display: 'flex', justifyContent: 'space-between', direction: 'rtl' }}>
        {/* calendar */}
        <div style={{ ...cardBase, transform: `translateY(${(1 - card(0)) * 300}px)`, opacity: card(0), borderTop: `5px solid ${C.crimson}` }}>
          {label('تاريخ البدء', C.crimson)}
          <div style={{ width: 210, borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 14px 30px rgba(0,0,0,0.4)', perspective: 600 }}>
            <div style={{ background: `linear-gradient(90deg, ${C.maroon}, ${C.crimson})`, color: '#fff', fontWeight: 800, fontSize: 28, textAlign: 'center', padding: '6px 0' }}>نوفمبر 2026</div>
            <div style={{ fontFamily: AD, fontSize: 118, lineHeight: 1.25, textAlign: 'center', color: C.navy, transform: `rotateX(${flip}deg)`, transformOrigin: '50% 0' }}>22</div>
          </div>
          <div style={{ fontWeight: 900, fontSize: 40, color: C.white, direction: 'ltr' }}>22/11/2026</div>
        </div>
        {/* clock */}
        <div style={{ ...cardBase, transform: `translateY(${(1 - card(1)) * 300}px)`, opacity: card(1), borderTop: `5px solid ${C.cyan}` }}>
          {label('التوقيت', C.cyan)}
          <svg width="200" height="200" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="rgba(8,20,40,0.9)" stroke={C.cyan} strokeWidth="2" />
            {new Array(12).fill(0).map((_, i) => {
              const [x1, y1] = pt(i * 30, 40);
              const [x2, y2] = pt(i * 30, 35);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />;
            })}
            <path d={`M ${ax} ${ay} A 40 40 0 0 1 ${bx} ${by}`} stroke={C.gold} strokeWidth="7" fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${C.gold})` }} />
            <line x1="50" y1="50" x2={pt(hourA, 24)[0]} y2={pt(hourA, 24)[1]} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
            <line x1="50" y1="50" x2={pt(180 + minA, 33)[0]} y2={pt(180 + minA, 33)[1]} stroke={C.crimson} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="50" cy="50" r="3.5" fill={C.gold} />
          </svg>
          <div style={{ fontWeight: 900, fontSize: 36, color: C.white, whiteSpace: 'nowrap' }}>
            <span style={{ direction: 'ltr', display: 'inline-block' }}>4:30 - 6:30</span> مساءً
          </div>
        </div>
        {/* duration */}
        <div style={{ ...cardBase, transform: `translateY(${(1 - card(2)) * 300}px)`, opacity: card(2), borderTop: `5px solid ${C.gold}` }}>
          {label('المدة', C.gold)}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 220 }}>
            {weeks.map((w, i) => (
              <div key={i} style={{ height: 46, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${w * 100}%`, background: GOLD_GRAD, right: 0, left: 'auto' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: w > 0.5 ? C.maroon : C.white }}>الأسبوع {i + 1}</div>
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 900, fontSize: 40, color: C.white }}>3 أسابيع</div>
        </div>
      </div>
      {/* price tag */}
      <div style={{ position: 'absolute', left: 540, top: 760, transformOrigin: '0 0', transform: `rotate(${swing}deg)` }}>
        <div style={{ position: 'absolute', left: -1, top: 0, width: 3, height: 70 * tagIn, background: `linear-gradient(${C.gold}, ${C.goldDeep})` }} />
        <div style={{ position: 'absolute', left: -480, top: -300 + 70 }}>
          {/* burst behind */}
          <div
            style={{
              position: 'absolute',
              left: 480 - 330,
              top: 300 - 50,
              width: 660,
              height: 660,
              opacity: 0.4 * tagIn,
              background: `repeating-conic-gradient(from ${f}deg, ${C.gold}66 0deg 6deg, transparent 6deg 18deg)`,
              WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
              maskImage: 'radial-gradient(circle, black 0%, transparent 65%)',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: -280,
            top: 70,
            width: 560,
            height: 400,
            transform: `scale(${tagIn})`,
            transformOrigin: '50% 0',
            borderRadius: 40,
            background: `linear-gradient(150deg, ${C.crimson}, ${C.maroon} 60%, #4a0820)`,
            border: `4px solid ${C.gold}`,
            boxShadow: `0 0 ${40 + pop * 80}px ${C.crimson}aa, 0 40px 80px rgba(0,0,0,0.5)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            direction: 'rtl',
          }}
        >
          <div style={{ position: 'absolute', top: 18, left: 262, width: 30, height: 30, borderRadius: 15, background: C.bg0, border: `4px solid ${C.gold}` }} />
          <div style={{ fontFamily: AD, fontSize: 240, lineHeight: 1, marginTop: 40, transform: `scale(${1 + pop * 0.08})`, filter: `drop-shadow(0 0 ${10 + pop * 30}px ${C.gold})`, ...goldText(interpolate(f, [86, 120], [-40, 160], clamp)) }}>
            {count}
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 56, color: C.white, marginTop: -10 }}>ريال عماني فقط</div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 270 }}>
          <Sparks at={86} seed="price" count={30} spread={420} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 8 — Call to action with skill meter                                 */
/* ================================================================== */
export const SCTA: React.FC = () => {
  const f = useCurrentFrame();
  const ring = interpolate(f, [8, 50], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const meterIn = spr(f, 0, 12);
  const pct = Math.round(ring * 100);
  const under = interpolate(f, [62, 84], [0, 1], { ...clamp, easing: ease });
  const R = 180;
  const circ = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 540, top: 570, transform: `scale(${meterIn})` }}>
        <HudRing size={520} color={C.cyan} dash="3 8" speed={1} opacity={0.5} />
        <svg width="440" height="440" viewBox="0 0 440 440" style={{ position: 'absolute', left: -220, top: -220 }}>
          <defs>
            <linearGradient id="meter" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={C.gold2} />
              <stop offset="1" stopColor={C.crimson} />
            </linearGradient>
          </defs>
          <circle cx="220" cy="220" r={R} stroke="rgba(255,255,255,0.1)" strokeWidth="26" fill="rgba(8,20,40,0.7)" />
          <circle
            cx="220"
            cy="220"
            r={R}
            stroke="url(#meter)"
            strokeWidth="26"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circ * ring} ${circ}`}
            transform="rotate(-90 220 220)"
            style={{ filter: `drop-shadow(0 0 12px ${C.gold})` }}
          />
        </svg>
        <div style={{ position: 'absolute', left: -200, width: 400, top: -130, textAlign: 'center', fontFamily: FONT, direction: 'rtl' }}>
          <div style={{ fontWeight: 800, fontSize: 40, color: C.dim }}>مهاراتك</div>
          <div style={{ fontFamily: AD, fontSize: 140, lineHeight: 1.1, color: C.white, direction: 'ltr' }}>{pct}%</div>
          <div style={{ display: 'flex', justifyContent: 'center', transform: `translateY(${-Math.abs(Math.sin(f / 6)) * 10}px)` }}>
            <Icon.arrowUp size={50} color={C.gold} stroke={3} />
          </div>
        </div>
        {pct === 100 && <Sparks at={50} seed="cta" count={30} spread={360} />}
      </div>
      <Headline
        top={850}
        start={6}
        step={3}
        gap={10}
        lines={[
          { text: 'باحث عن عمل؟', size: 140, gold: true },
          { text: 'لا تفوّت فرصة تطوير مهاراتك', size: 78 },
        ]}
      />
      <div style={{ position: 'absolute', top: 1260, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            fontFamily: AD,
            fontSize: 120,
            color: C.white,
            direction: 'rtl',
            transform: `scale(${spr(f, 40, 9)})`,
            textShadow: `0 0 30px ${C.crimson}, 0 0 70px ${C.crimson}88`,
          }}
        >
          فالمهارات <span style={{ color: C.gold2, textShadow: `0 0 30px ${C.gold}` }}>تصنع الفرق</span>
        </div>
        <div style={{ height: 8, width: 760 * under, borderRadius: 4, background: `linear-gradient(90deg, ${C.gold}, ${C.crimson})`, boxShadow: `0 0 20px ${C.crimson}` }} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== */
/* 9 — Outro / contact                                                 */
/* ================================================================== */
export const SOutro: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const logo = interpolate(f, [4, 30], [0, 1], { ...clamp, easing: ease });
  const end = interpolate(f, [dur - 22, dur], [1, 0], clamp);
  const rows = [
    { icon: Icon.pin, text: 'ولاية عبري / مركز المدينة', col: C.crimson, ltr: false },
    { icon: Icon.phone, text: '91960600', col: C.cyan, ltr: true },
    { icon: Icon.camera, text: 'Alyaqin_institute', col: C.gold, ltr: true },
  ];
  const btn = spr(f, 50, 9);
  const pulse = 1 + Math.sin(f / 4) * 0.03;
  return (
    <AbsoluteFill style={{ opacity: end }}>
      <div style={{ position: 'absolute', left: 540, top: 400 }}>
        <HudRing size={500} color={C.gold} dash="50 18" speed={-1} width={3} opacity={0.6 * logo} />
        <HudRing size={430} color={C.cyan} dash="6 14" speed={1.6} opacity={0.5 * logo} />
      </div>
      <div style={{ position: 'absolute', left: 540, top: 400, transform: 'translate(-50%, -50%)' }}>
        <GoldLogo height={330} reveal={logo} glow={1.1} />
      </div>
      <div style={{ position: 'absolute', top: 680, width: '100%', textAlign: 'center', fontFamily: FONT, direction: 'rtl', opacity: fadeIn(f, 16) }}>
        <div style={{ fontWeight: 900, fontSize: 100, lineHeight: 1.2, filter: `drop-shadow(0 0 20px ${C.gold}88)`, ...goldText(interpolate(f, [20, 60], [-50, 170], clamp)) }}>معهد اليقين الدولي</div>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.white, direction: 'ltr' }}>ALYAQIN INTERNATIONAL INSTITUTE</div>
      </div>
      <div style={{ position: 'absolute', top: 900, left: 130, right: 130, display: 'flex', flexDirection: 'column', gap: 22 }}>
        {rows.map((r, i) => {
          const s = spr(f, 22 + i * 6, 14);
          const Ic = r.icon;
          return (
            <div
              key={i}
              style={{
                ...glass,
                height: 112,
                borderRadius: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '0 28px',
                direction: 'rtl',
                transform: `translateX(${(1 - s) * (i % 2 ? -600 : 600)}px)`,
                opacity: s,
                fontFamily: FONT,
              }}
            >
              <Bubble size={78} color={r.col}>
                <Ic size={40} color={r.col} />
              </Bubble>
              <span style={{ color: C.white, fontSize: 46, fontWeight: 800, direction: r.ltr ? 'ltr' : 'rtl' }}>{r.text}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1320,
          left: '50%',
          transform: `translateX(-50%) scale(${btn * pulse})`,
          padding: '14px 90px',
          borderRadius: 70,
          background: GOLD_GRAD,
          color: C.maroon,
          fontFamily: AD,
          fontSize: 92,
          boxShadow: `0 0 50px ${C.gold}aa, 0 20px 40px rgba(0,0,0,0.5)`,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${((f * 4) % 300) - 100}%`, width: 120, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', transform: 'skewX(-20deg)' }} />
        سجّل الآن
      </div>
    </AbsoluteFill>
  );
};
