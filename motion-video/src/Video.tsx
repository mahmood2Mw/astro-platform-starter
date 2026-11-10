import React from 'react';
import { AbsoluteFill, Audio, Easing, Sequence, staticFile } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { clockWipe } from '@remotion/transitions/clock-wipe';
import { cube } from '@remotion/transitions/cube';
import { wipe } from '@remotion/transitions/wipe';
import { pushCut } from '@remotion/transitions/push-cut';
import { C } from './theme';
import { Background, HeaderBanner, HudFrame, Ticker } from './layers';
import { custom, LightLeak } from './transitions';
import { SApps, SCert, SCTA, SDetails, SHook, SLogo, SOutro, SSkills, STitle } from './scenes';

export const TOTAL_FRAMES = 900; // 30 s @ 30 fps

const W = 1080;
const H = 1920;
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const t = (d: number) => linearTiming({ durationInFrames: d, easing: smooth });

/*
 * Timeline (frames). Transitions overlap neighbouring scenes, overlays don't.
 * 84+120+116+112+134+106+136+104+110 − (16+18+14+20+18+16+20) = 900
 *
 *  cut 1  logo → hook       custom zoom-through          @76
 *  cut 2  hook → skills     clock wipe (official)        @179
 *  cut 3  skills → title    custom digital glitch        @279
 *  cut 4  title → apps      3D cube (official)           @374
 *  cut 5  apps → cert       gold light-leak overlay      @498
 *  cut 6  cert → details    diagonal wipe (official)     @595
 *  cut 7  details → CTA     push-cut + gold flash (off.) @714
 *  cut 8  CTA → outro       custom gold iris             @800
 */
export const AlyaqinPromo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
    <Background />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={84}>
        <SLogo />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={custom('zoom')} timing={t(16)} />
      <TransitionSeries.Sequence durationInFrames={120}>
        <SHook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={clockWipe({ width: W, height: H })} timing={t(18)} />
      <TransitionSeries.Sequence durationInFrames={116}>
        <SSkills />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={custom('glitch')} timing={linearTiming({ durationInFrames: 14 })} />
      <TransitionSeries.Sequence durationInFrames={112}>
        <STitle />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={cube({ direction: 'from-right', perspective: 1800 })} timing={t(20)} />
      <TransitionSeries.Sequence durationInFrames={134}>
        <SApps />
      </TransitionSeries.Sequence>
      <TransitionSeries.Overlay durationInFrames={30}>
        <LightLeak seed={1} />
      </TransitionSeries.Overlay>
      <TransitionSeries.Sequence durationInFrames={106}>
        <SCert />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: 'from-top-right' })} timing={t(18)} />
      <TransitionSeries.Sequence durationInFrames={136}>
        <SDetails />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={pushCut({ flashColor: C.gold2, flashOpacity: 0.55, flashFrames: 4, incomingStartScale: 1.15 })}
        timing={linearTiming({ durationInFrames: 16 })}
      />
      <TransitionSeries.Sequence durationInFrames={104}>
        <SCTA />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={custom('iris')} timing={t(20)} />
      <TransitionSeries.Sequence durationInFrames={110}>
        <SOutro dur={110} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    {/* decorative light leak over the logo reveal */}
    <Sequence from={18} durationInFrames={40}>
      <LightLeak seed={2} strength={0.6} />
    </Sequence>
    <HudFrame from={72} to={800} />
    <HeaderBanner from={70} to={800} />
    <Ticker from={110} to={790} />
    <Audio src={staticFile('soundtrack.wav')} />
  </AbsoluteFill>
);
