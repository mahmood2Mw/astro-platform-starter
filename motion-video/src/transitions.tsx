import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { enterStyle, exitStyle, TransitionFX, TT } from './layers';
import { C } from './theme';

/* ------------------------------------------------------------------ */
/* Custom TransitionSeries presentations (zoom-through, glitch, iris)  */
/* built on the same style engine, with their FX overlay on top        */
/* ------------------------------------------------------------------ */
type CustomProps = { kind: TT };

const CustomPresentation: React.FC<TransitionPresentationComponentProps<CustomProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
  passedProps,
}) => {
  const f = useCurrentFrame();
  const entering = presentationDirection === 'entering';
  const style = entering ? enterStyle(passedProps.kind, presentationProgress, f) : exitStyle(passedProps.kind, presentationProgress, f);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ ...style, transformOrigin: '50% 46%' }}>{children}</AbsoluteFill>
      {entering && <TransitionFX t={passedProps.kind} p={presentationProgress} f={f} />}
    </AbsoluteFill>
  );
};

export const custom = (kind: TT): TransitionPresentation<CustomProps> => ({
  component: CustomPresentation,
  props: { kind },
});

/* ------------------------------------------------------------------ */
/* Cinematic light leak (gold / amber / crimson), drawn with layered   */
/* screen-blended gradients. Used as a TransitionSeries.Overlay and as */
/* a decorative pass over the logo reveal.                            */
/* ------------------------------------------------------------------ */
export const LightLeak: React.FC<{ seed?: number; strength?: number }> = ({ seed = 0, strength = 1 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bell = Math.sin(p * Math.PI);
  const blobs = [
    { c: '255,214,120', x: 10, y: 30, r: 900, dx: 70, dy: 10 },
    { c: '255,150,60', x: 80, y: 15, r: 800, dx: -60, dy: 25 },
    { c: '227,36,94', x: 90, y: 75, r: 900, dx: -40, dy: -30 },
    { c: '255,245,220', x: 45, y: 50, r: 600, dx: 20, dy: -10 },
  ];
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: bell * strength, pointerEvents: 'none' }}>
      {blobs.map((b, i) => {
        const k = (i + seed) % blobs.length;
        const bb = blobs[k];
        const x = b.x + bb.dx * p;
        const y = b.y + bb.dy * p;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              width: b.r,
              height: b.r * 1.4,
              marginLeft: -b.r / 2,
              marginTop: -b.r * 0.7,
              borderRadius: '50%',
              background: `radial-gradient(closest-side, rgba(${b.c},0.95), rgba(${b.c},0.35) 55%, transparent)`,
              filter: 'blur(40px)',
              transform: `rotate(${30 + i * 40 + p * 40}deg) scale(${0.6 + bell * 0.7})`,
            }}
          />
        );
      })}
      {/* anamorphic streak */}
      <div
        style={{
          position: 'absolute',
          left: -200,
          right: -200,
          top: `${40 + p * 10}%`,
          height: 14,
          background: `linear-gradient(90deg, transparent, ${C.gold2}, #fff, ${C.gold2}, transparent)`,
          filter: 'blur(4px)',
          opacity: bell,
        }}
      />
    </AbsoluteFill>
  );
};
