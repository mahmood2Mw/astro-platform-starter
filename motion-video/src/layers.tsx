import React from 'react';
import { AbsoluteFill, interpolate, random, useCurrentFrame } from 'remotion';
import { C, FONT, GoldLogo, Icon, clamp, ease, easeInOut, goldText } from './theme';

/* ------------------------------------------------------------------ */
/* Transitions — each cut uses a different technique                  */
/* ------------------------------------------------------------------ */
export type TT = 'none' | 'zoom' | 'iris' | 'glitch' | 'push' | 'flash' | 'diagonal' | 'flip' | 'blinds';
export const T = 16; // overlap frames between scenes

type Style = React.CSSProperties;
const enterStyle = (t: TT, p: number, f: number): Style => {
  const q = easeInOut(p);
  switch (t) {
    case 'zoom':
      return { transform: `scale(${0.55 + 0.45 * q})`, opacity: q, filter: `blur(${(1 - q) * 18}px)` };
    case 'iris':
      return { clipPath: `circle(${q * 1250}px at 50% 46%)` };
    case 'glitch': {
      if (p >= 1) return {};
      const j = (random(`gj${f}`) - 0.5) * 70 * (1 - p);
      const top = random(`gt${f}`) * 60 * (1 - p);
      const bot = random(`gb${f}`) * 60 * (1 - p);
      return {
        opacity: p < 0.35 ? (f % 2 ? 0.2 : 0.8) : 1,
        transform: `translateX(${j}px) skewX(${j * 0.08}deg)`,
        clipPath: `inset(${top}% 0 ${bot}% 0)`,
        filter: `hue-rotate(${(1 - p) * 90}deg) saturate(${1 + (1 - p) * 2})`,
      };
    }
    case 'push':
      return { transform: `translateX(${(1 - q) * -100}%)`, filter: `blur(${Math.sin(q * Math.PI) * 10}px)` };
    case 'flash':
      return { opacity: q, transform: `scale(${1.08 - 0.08 * q})` };
    case 'diagonal': {
      const L = 1900 * (1 - q) - 50;
      return { clipPath: `polygon(${L}px 0, 3000px 0, 3000px 1920px, ${L - 800}px 1920px)` };
    }
    case 'flip': {
      if (p < 0.5) return { opacity: 0 };
      return { transform: `perspective(1600px) rotateY(${-90 * (1 - easeInOut((p - 0.5) * 2))}deg)` };
    }
    case 'blinds': {
      const h = q * 96;
      const m = `repeating-linear-gradient(135deg, black 0px, black ${h}px, transparent ${h}px, transparent 96px)`;
      return p >= 1 ? {} : { WebkitMaskImage: m, maskImage: m };
    }
    default:
      return {};
  }
};

const exitStyle = (t: TT, p: number, f: number): Style => {
  if (p <= 0) return {};
  const q = easeInOut(p);
  switch (t) {
    case 'zoom':
      return { transform: `scale(${1 + q * 1.6})`, opacity: 1 - q, filter: `blur(${q * 22}px)` };
    case 'glitch': {
      const j = (random(`xj${f}`) - 0.5) * 80 * p;
      return { transform: `translateX(${j}px)`, opacity: p > 0.6 ? 0 : 1, filter: `hue-rotate(${p * -90}deg)` };
    }
    case 'push':
      return { transform: `translateX(${q * 100}%)`, filter: `blur(${Math.sin(q * Math.PI) * 10}px)` };
    case 'flash':
      return { opacity: 1 - q, filter: `brightness(${1 + q * 1.5})` };
    case 'flip': {
      if (p >= 0.5) return { opacity: 0 };
      return { transform: `perspective(1600px) rotateY(${easeInOut(p * 2) * 90}deg)` };
    }
    case 'iris':
    case 'diagonal':
    case 'blinds':
      return { transform: `scale(${1 - q * 0.08})`, filter: `brightness(${1 - q * 0.5})` };
    default:
      return {};
  }
};

const merge = (a: Style, b: Style): Style => ({
  ...a,
  ...b,
  transform: [a.transform, b.transform].filter(Boolean).join(' ') || undefined,
  filter: [a.filter, b.filter].filter(Boolean).join(' ') || undefined,
  opacity: Number(a.opacity ?? 1) * Number(b.opacity ?? 1),
});

/* Overlay FX drawn on top of the incoming scene during its entrance */
const TransitionFX: React.FC<{ t: TT; p: number; f: number }> = ({ t, p, f }) => {
  if (p <= 0 || p >= 1) return null;
  const s = Math.sin(p * Math.PI);
  const q = easeInOut(p);
  switch (t) {
    case 'zoom':
      return (
        <AbsoluteFill
          style={{
            opacity: s * 0.7,
            background: `repeating-conic-gradient(from ${f * 7}deg at 50% 45%, rgba(255,255,255,0.18) 0deg 1.2deg, transparent 1.2deg 9deg)`,
            WebkitMaskImage: 'radial-gradient(circle at 50% 45%, transparent 15%, black 70%)',
            maskImage: 'radial-gradient(circle at 50% 45%, transparent 15%, black 70%)',
          }}
        />
      );
    case 'iris': {
      const r = q * 1250;
      return (
        <div
          style={{
            position: 'absolute',
            left: 540 - r,
            top: 1920 * 0.46 - r,
            width: r * 2,
            height: r * 2,
            borderRadius: '50%',
            border: `6px solid ${C.gold}`,
            boxShadow: `0 0 40px ${C.gold}, inset 0 0 40px ${C.gold}88`,
            opacity: s,
          }}
        />
      );
    }
    case 'glitch':
      return (
        <AbsoluteFill style={{ opacity: s }}>
          {new Array(9).fill(0).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: random(`gl${i}${f}`) * 300 - 150,
                top: random(`gy${i}${f}`) * 1920,
                width: 900 + random(`gw${i}${f}`) * 600,
                height: 6 + random(`gh${i}${f}`) * 50,
                background: i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.crimson : 'rgba(255,255,255,0.7)',
                mixBlendMode: 'screen',
                opacity: 0.55,
              }}
            />
          ))}
          <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 5px)' }} />
        </AbsoluteFill>
      );
    case 'push':
      return (
        <AbsoluteFill style={{ opacity: s * 0.8 }}>
          {new Array(14).fill(0).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: random(`pl${i}`) * 1920,
                left: (1 - q) * 1400 - 600 + random(`px${i}`) * 400,
                width: 300 + random(`pw${i}`) * 500,
                height: 3,
                background: `linear-gradient(90deg, transparent, ${i % 2 ? C.gold : C.cyan}, transparent)`,
              }}
            />
          ))}
        </AbsoluteFill>
      );
    case 'flash':
      return (
        <AbsoluteFill
          style={{
            opacity: s * 0.95,
            background: `radial-gradient(circle at ${30 + q * 40}% 40%, rgba(255,250,230,1) 0%, ${C.gold}cc 25%, ${C.crimson}55 55%, transparent 80%)`,
            mixBlendMode: 'screen',
          }}
        />
      );
    case 'diagonal': {
      const L = 1900 * (1 - q) - 50;
      return (
        <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: s }}>
          <line x1={L} y1={0} x2={L - 800} y2={1920} stroke={C.gold} strokeWidth="10" style={{ filter: `drop-shadow(0 0 20px ${C.gold})` }} />
          <line x1={L + 40} y1={0} x2={L - 760} y2={1920} stroke={C.crimson} strokeWidth="4" opacity="0.8" />
        </svg>
      );
    }
    case 'flip':
      return <AbsoluteFill style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,${s * 0.15}), transparent)` }} />;
    case 'blinds':
      return null;
    default:
      return null;
  }
};

export const SceneShell: React.FC<{ dur: number; enter: TT; exit: TT; children: React.ReactNode }> = ({ dur, enter, exit, children }) => {
  const f = useCurrentFrame();
  const pin = enter === 'none' ? 1 : interpolate(f, [0, T], [0, 1], clamp);
  const pout = exit === 'none' ? 0 : interpolate(f, [dur - T, dur], [0, 1], clamp);
  const style = merge(enterStyle(enter, pin, f), exitStyle(exit, pout, f));
  return (
    <>
      <AbsoluteFill style={{ ...style, transformOrigin: '50% 46%' }}>{children}</AbsoluteFill>
      <TransitionFX t={enter} p={pin} f={f} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Background: deep navy + maroon glows, grid floor, circuits, dust    */
/* ------------------------------------------------------------------ */
const CIRCUITS = [
  'M0 360 H120 L170 410 V620 L220 670 H260',
  'M0 520 H70 L110 560 V900',
  'M1080 300 H960 L910 350 V560 L860 610 H820',
  'M1080 760 H1010 L970 800 V1100 L930 1140',
  'M0 1180 H90 L140 1230 V1420',
  'M1080 1300 H990 L950 1340 V1520 L900 1570 H860',
];
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = new Array(46).fill(0).map((_, i) => {
    const x = random(`px${i}`) * 1080;
    const sp = 0.4 + random(`ps${i}`) * 1.1;
    let y = (random(`py${i}`) * 2100 - frame * sp) % 2100;
    if (y < 0) y += 2100;
    const s = 2 + random(`pz${i}`) * 4;
    const r = random(`pc${i}`);
    const col = r > 0.75 ? C.gold : r > 0.5 ? C.crimson : C.cyan;
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(frame / 18 + i));
    return { x, y, s, col, tw };
  });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, ${C.bg1} 0%, #071028 50%, ${C.bg0} 100%)` }}>
      <div style={{ position: 'absolute', left: -300, top: 1250, width: 1000, height: 800, borderRadius: '50%', background: C.maroon, opacity: 0.38, filter: 'blur(170px)' }} />
      <div style={{ position: 'absolute', right: -300, top: 150, width: 900, height: 900, borderRadius: '50%', background: C.navy2, opacity: 0.35, filter: 'blur(180px)' }} />
      <div
        style={{
          position: 'absolute',
          left: 540 - 400 + Math.sin(frame / 60) * 120,
          top: 700,
          width: 800,
          height: 500,
          borderRadius: '50%',
          background: C.gold,
          opacity: 0.06,
          filter: 'blur(160px)',
        }}
      />
      {/* grid floor */}
      <div
        style={{
          position: 'absolute',
          left: -700,
          width: 2480,
          bottom: -200,
          height: 1000,
          transform: 'perspective(700px) rotateX(72deg)',
          transformOrigin: '50% 100%',
          backgroundImage: `linear-gradient(rgba(65,214,240,0.25) 2px, transparent 2px), linear-gradient(90deg, rgba(65,214,240,0.25) 2px, transparent 2px)`,
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${frame * 2.5}px`,
          WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          opacity: 0.5,
        }}
      />
      {/* circuit traces with travelling pulses */}
      <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>
        {CIRCUITS.map((d, i) => (
          <g key={i}>
            <path d={d} stroke="rgba(65,214,240,0.16)" strokeWidth="2" fill="none" />
            <path
              d={d}
              stroke={i % 2 ? C.gold : C.cyan}
              strokeWidth="3"
              fill="none"
              strokeDasharray="40 900"
              strokeDashoffset={-((frame * 6 + i * 150) % 940)}
              style={{ filter: `drop-shadow(0 0 6px ${i % 2 ? C.gold : C.cyan})` }}
            />
          </g>
        ))}
      </svg>
      {/* dotted texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)',
          backgroundSize: '34px 34px',
          WebkitMaskImage: 'radial-gradient(ellipse at 100% 18%, black 0%, transparent 40%), radial-gradient(ellipse at 0% 80%, black 0%, transparent 35%)',
          maskImage: 'radial-gradient(ellipse at 100% 18%, black 0%, transparent 40%), radial-gradient(ellipse at 0% 80%, black 0%, transparent 35%)',
        }}
      />
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.s,
            height: p.s,
            borderRadius: '50%',
            background: p.col,
            opacity: p.tw * 0.8,
            boxShadow: `0 0 ${p.s * 3}px ${p.col}`,
          }}
        />
      ))}
      {/* scanning line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: ((frame * 7) % 2400) - 240,
          height: 160,
          background: 'linear-gradient(180deg, transparent, rgba(65,214,240,0.06), transparent)',
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.65) 100%)' }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* Main banner (rebuilt from the supplied header banner) + HUD frame   */
/* ------------------------------------------------------------------ */
export const HeaderBanner: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [from, from + 18], [0, 1], { ...clamp, easing: ease });
  const outP = interpolate(frame, [to - 12, to], [0, 1], clamp);
  if (frame < from || frame > to) return null;
  const shine = ((frame - from) * 3) % 400 - 100;
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: 40,
        right: 40,
        height: 150,
        opacity: inP * (1 - outP),
        transform: `translateY(${(1 - inP) * -180}px)`,
        borderRadius: 34,
        background: 'linear-gradient(180deg, rgba(10,22,48,0.85), rgba(10,22,48,0.6))',
        border: `1.5px solid ${C.gold}66`,
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${C.gold}22, inset 0 1px 0 rgba(255,255,255,0.12)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 34px 0 30px',
        direction: 'rtl',
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      {/* sheen */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: `${shine}%`, width: 140, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)', transform: 'skewX(-20deg)' }} />
      {/* logo + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <GoldLogo height={118} glow={0.7} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 50, lineHeight: 1.15, ...goldText(shine * 0.6) }}>معهد اليقين الدولي</div>
          <div style={{ fontWeight: 800, fontSize: 19.5, letterSpacing: 1.2, color: C.white, direction: 'ltr', textAlign: 'right' }}>ALYAQIN INTERNATIONAL INSTITUTE</div>
        </div>
      </div>
      <div style={{ width: 3, height: 96, background: GOLD_DIVIDER, borderRadius: 2 }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 34, color: C.white, lineHeight: 1.25 }}>محافظة الظاهرة</div>
        <div style={{ fontWeight: 800, fontSize: 34, color: C.gold, lineHeight: 1.25 }}>ولاية عبري</div>
      </div>
    </div>
  );
};
const GOLD_DIVIDER = `linear-gradient(180deg, transparent, ${C.gold}, transparent)`;

export const HudFrame: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + 15, to - 10, to], [0, 1, 1, 0], clamp);
  const L = 70;
  const corner = (style: React.CSSProperties) => (
    <div style={{ position: 'absolute', width: L, height: L, borderColor: `${C.cyan}aa`, borderStyle: 'solid', borderWidth: 0, ...style }} />
  );
  return (
    <AbsoluteFill style={{ opacity: o * 0.8, pointerEvents: 'none' }}>
      {corner({ left: 26, top: 250, borderLeftWidth: 3, borderTopWidth: 3 })}
      {corner({ right: 26, top: 250, borderRightWidth: 3, borderTopWidth: 3 })}
      {corner({ left: 26, bottom: 200, borderLeftWidth: 3, borderBottomWidth: 3 })}
      {corner({ right: 26, bottom: 200, borderRightWidth: 3, borderBottomWidth: 3 })}
      <div style={{ position: 'absolute', left: 40, top: 262, fontFamily: 'monospace', fontSize: 16, color: `${C.cyan}cc`, letterSpacing: 2 }}>
        ● REC {String(Math.floor(frame / 30)).padStart(2, '0')}:{String(frame % 30).padStart(2, '0')}
      </div>
    </AbsoluteFill>
  );
};

/** Bottom contact ticker — keeps registration info on screen */
export const Ticker: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, from + 16], [0, 1], { ...clamp, easing: ease });
  const o = interpolate(frame, [to - 10, to], [1, 0], clamp);
  if (frame < from || frame > to) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        left: 120,
        right: 120,
        height: 84,
        borderRadius: 50,
        background: `linear-gradient(90deg, ${C.maroon}, ${C.crimson}, ${C.maroon})`,
        border: `2px solid ${C.gold}99`,
        boxShadow: `0 0 30px ${C.crimson}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
        direction: 'rtl',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 32,
        color: C.white,
        transform: `translateY(${(1 - p) * 200}px)`,
        opacity: o,
      }}
    >
      <span style={{ color: C.gold2 }}>للتسجيل</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, direction: 'ltr' }}>
        <Icon.phone size={34} color={C.gold} /> 91960600
      </span>
    </div>
  );
};
