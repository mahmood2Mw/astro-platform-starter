import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { C } from './theme';
import { Background, HeaderBanner, HudFrame, SceneShell, Ticker, TT } from './layers';
import { SApps, SCert, SCTA, SDetails, SHook, SLogo, SOutro, SSkills, STitle } from './scenes';

export const TOTAL_FRAMES = 900; // 30 s @ 30 fps

/* [component, start, duration, transition INTO the next scene]
 * Scenes overlap by T (16) frames; every cut uses a different technique. */
const TIMELINE: [React.FC<{ dur: number }>, number, number, TT][] = [
  [SLogo, 0, 84, 'zoom'],
  [SHook, 68, 120, 'iris'],
  [SSkills, 172, 116, 'glitch'],
  [STitle, 272, 112, 'push'],
  [SApps, 368, 134, 'flash'],
  [SCert, 486, 106, 'diagonal'],
  [SDetails, 576, 136, 'flip'],
  [SCTA, 696, 104, 'blinds'],
  [SOutro, 784, 116, 'none'],
];

export const AlyaqinPromo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
    <Background />
    {TIMELINE.map(([Comp, from, dur, exit], i) => {
      const enter: TT = i === 0 ? 'none' : TIMELINE[i - 1][3];
      return (
        <Sequence key={i} from={from} durationInFrames={dur}>
          <SceneShell dur={dur} enter={enter} exit={exit}>
            <Comp dur={dur} />
          </SceneShell>
        </Sequence>
      );
    })}
    <HudFrame from={72} to={792} />
    <HeaderBanner from={70} to={792} />
    <Ticker from={110} to={782} />
    <Audio src={staticFile('soundtrack.wav')} />
  </AbsoluteFill>
);
