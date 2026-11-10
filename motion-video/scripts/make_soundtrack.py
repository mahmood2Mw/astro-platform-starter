"""Original, royalty-free soundtrack + sound design, synced to the video timeline.

Usage: python3 scripts/make_soundtrack.py public/soundtrack.wav   (needs numpy + scipy)

- Music: 120 BPM cinematic-tech groove (Am-F-C-G), side-chained pads, plucks with
  ping-pong delay, soft kick/clap/shaker. Drums drop at the first cut, stop for the outro.
- Transition & accent FX are built from REAL recorded CC0 samples (Kenney, see
  assets/sfx): slowed card-slides become soft cinematic swishes, glass hits become
  shimmers, plus reversed-reverb pre-swells and sub hits. Each cut has its own sound
  matching its visual technique; everything sits under the music, nothing harsh.
"""
import sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 44100
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(11)

dry = np.zeros((N, 2))
verb_send = np.zeros((N, 2))
music_bus = np.zeros((N, 2))  # gets side-chained by the kick


def bus_add(bus, sig, start, gain=1.0, pan=0.0):
    if sig.ndim == 1:
        sig = np.stack([sig * (1 - pan) ** 0.5, sig * (1 + pan) ** 0.5], 1) / 2 ** 0.5 * 1.41
    i = int(start * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    bus[i:j] += sig[: j - i] * gain


def add(sig, start, gain=1.0, pan=0.0, verb=0.0, bus=None):
    bus_add(dry if bus is None else bus, sig, start, gain, pan)
    if verb:
        bus_add(verb_send, sig, start, gain * verb, pan)


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x)


def tvec(d):
    return np.arange(int(d * SR)) / SR


def adsr(n, a, r):
    e = np.ones(n)
    na, nr = max(1, min(n // 2, int(a * SR))), max(1, min(n // 2, int(r * SR)))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr)
    return e


mid = lambda m: 440 * 2 ** ((m - 69) / 12)

# ------------------------------------------------------------------ MUSIC
BPM = 120
beat = 60 / BPM
bar = beat * 4
CHORDS = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 64], [55, 59, 62, 67]]
DROP = 76 / 30          # first cut: drums come in
OUTRO = 800 / 30        # last cut: drums stop

# pads (2 bars per chord) — detuned saws, low-passed
pos, ci = 0.0, 0
while pos < DUR:
    d = bar * 2
    t = tvec(d)
    pad = np.zeros(len(t))
    for m in CHORDS[ci % 4]:
        for det in (-0.15, 0.0, 0.15):
            ph = 2 * np.pi * mid(m) * (1 + det / 100) * t + rng.random() * 6
            pad += 2 / np.pi * np.arctan(np.tan(ph / 2)) * 0.5 + np.sin(ph) * 0.5
    pad = filt(pad, 'lowpass', 1400 if pos > DROP else 900)
    pad *= adsr(len(t), 0.6, 0.6) * 0.022
    add(pad, pos, pan=0.0, verb=0.6, bus=music_bus)
    # sub bass following the root, 8th notes after the drop
    if pos + d > DROP:
        for k in range(16):
            st = pos + k * beat / 2
            if st < DROP or st > OUTRO:
                continue
            tb = tvec(beat / 2 * 0.9)
            b = np.sin(2 * np.pi * mid(CHORDS[ci % 4][0] - 24) * tb) * adsr(len(tb), 0.005, 0.08)
            add(b, st, 0.16, bus=music_bus)
    pos += d
    ci += 1

# plucks with ping-pong delay
k = 0
st = 0.0
while st < DUR - 1.5:
    ch = CHORDS[int(st // (bar * 2)) % 4]
    pattern = [0, 2, 1, 3, 2, 1, 3, 2]
    m = ch[pattern[k % 8]] + 12
    t = tvec(0.5)
    s = (np.sin(2 * np.pi * mid(m) * t) + 0.3 * np.sin(4 * np.pi * mid(m) * t)) * np.exp(-t * 9)
    lvl = 0.035 if st < DROP else 0.03
    for rep, (dl, pn) in enumerate([(0, 0), (beat * 0.75, -0.6), (beat * 1.5, 0.6)]):
        add(s, st + dl, lvl * (0.45 ** rep), pan=pn, verb=0.25, bus=music_bus)
    st += beat / 2
    k += 1

# drums
def kick():
    t = tvec(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    return filt(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7), 'lowpass', 900)


def clap():
    t = tvec(0.25)
    x = rng.standard_normal(len(t))
    env = np.exp(-t * 30) + 0.5 * np.exp(-np.maximum(t - 0.012, 0) * 35) * (t > 0.012)
    return filt(x * env, 'bandpass', [900, 3500])


def shaker():
    t = tvec(0.07)
    return filt(rng.standard_normal(len(t)) * np.exp(-t * 70), 'highpass', 6000)


kicks = []
b = DROP
i = 0
while b < OUTRO - 0.05:
    add(kick(), b, 0.5)
    kicks.append(b)
    if i % 2 == 1:
        add(clap(), b, 0.12, verb=0.5)
    for h in range(4):
        add(shaker(), b + h * beat / 4, 0.03 if h % 2 else 0.018, pan=0.35)
    b += beat
    i += 1

# side-chain ducking of the music bus on every kick
duck = np.ones(N)
for kt in kicks:
    i0 = int(kt * SR)
    n = int(0.28 * SR)
    seg = 1 - 0.55 * np.exp(-np.arange(n) / SR * 14)
    j = min(N, i0 + n)
    duck[i0:j] = np.minimum(duck[i0:j], seg[: j - i0])
music_bus *= duck[:, None]

# ------------------------------------------------------------------ SOUND DESIGN
# Real recorded CC0 samples (Kenney, assets/sfx) processed into cinematic FX:
# slowed/pitched-down swishes, reversed-reverb swells, soft sub hits, glassy shimmers.
import os, subprocess
SFX_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'sfx')


def load(name):
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', os.path.join(SFX_DIR, name), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
        capture_output=True, check=True,
    ).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(float)
    return x / (np.max(np.abs(x)) + 1e-9)


def speed(x, factor):
    """resample: factor < 1 = slower + lower (tape-style pitch down)"""
    n = int(len(x) / factor)
    return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)


def fade(x, a=0.01, r=0.05):
    return x * adsr(len(x), a, r)


def pan_sweep(x, p0, p1):
    p = np.linspace(p0, p1, len(x))
    return np.stack([x * np.sqrt((1 - p) / 2), x * np.sqrt((1 + p) / 2)], 1) * 1.41


def rev_swell(x, d=1.0):
    """reversed reverb tail: the classic pre-cut 'suck-in' swell"""
    t = tvec(d)
    ir = rng.standard_normal(len(t)) * np.exp(-t * 3.5)
    tail = fftconvolve(x, filt(ir, 'lowpass', 7000))[: len(t) + len(x)]
    sw = tail[::-1]
    return sw / (np.max(np.abs(sw)) + 1e-9) * np.linspace(0, 1, len(sw)) ** 1.5


def sub_hit(f=48, d=1.4):
    t = tvec(d)
    fr = f + 25 * np.exp(-t * 14)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 3.2)


slide = [load(f'card-slide-{i}.ogg') for i in (1, 3, 5, 7)]
fan = load('card-fan-1.ogg')
shove = load('card-shove-2.ogg')
click = load('click_002.ogg')
ticks = [load('tick_001.ogg'), load('tick_002.ogg')]
glass = [load('glass_001.ogg'), load('glass_003.ogg')]
confirm = load('confirmation_002.ogg')
thud = [load('impactSoft_heavy_001.ogg'), load('impactSoft_heavy_003.ogg')]
bellhit = load('impactBell_heavy_002.ogg')

cut = lambda fr: fr / 30


def swish(x, factor, lp=5000):
    s = filt(speed(x, factor), 'lowpass', lp)
    s = filt(s, 'highpass', 120)
    return fade(s / (np.max(np.abs(s)) + 1e-9), 0.03, 0.15)


# cut 1 — zoom-through: reversed-reverb swell into a deep slowed swish + sub
c = cut(76)
sw = rev_swell(swish(slide[0], 0.6), 0.9)
add(sw, c - len(sw) / SR, 0.10)
s = swish(slide[0], 0.45, 3500)
add(s, c - 0.12, 0.30, verb=0.35)
add(sub_hit(42), c, 0.40)

# cut 2 — clock wipe: fluttering card fan, slowed, swept across the stereo field
c = cut(179)
s = swish(fan, 0.7, 6000)
add(pan_sweep(s, -0.7, 0.7), c - len(s) / SR * 0.5, 0.26, verb=0.3)

# cut 3 — glitch: micro-stutters built from real UI ticks/clicks
c = cut(279)
for j in range(6):
    x = speed(ticks[j % 2] if j % 3 else click, rng.uniform(0.8, 1.6))
    add(fade(x[: int(0.05 * SR)], 0.001, 0.01), c - 0.16 + j * 0.05, 0.14, pan=rng.uniform(-0.7, 0.7))
add(thud[0] * 0.6, c + 0.02, 0.22)

# cut 4 — cube turn: heavy slow slide + soft body
c = cut(374)
s = swish(shove, 0.55, 3000)
add(pan_sweep(s, 0.8, -0.8), c - len(s) / SR * 0.55, 0.30, verb=0.3)
add(speed(thud[1], 0.8), c + 0.05, 0.25)

# cut 5 — light leak: glass shimmer slowed into an airy bloom (+ reversed lead-in)
c = cut(498)
g = filt(speed(glass[0], 0.5), 'highpass', 400)
sw = rev_swell(g, 0.8)
add(sw, c - len(sw) / SR, 0.10)
add(g, c, 0.16, verb=1.0)
add(speed(glass[1], 0.75), c + 0.05, 0.10, verb=0.8, pan=0.3)

# cut 6 — diagonal wipe: crisp swish, top-right to bottom-left
c = cut(595)
s = swish(slide[2], 0.75, 7000)
add(pan_sweep(s, 0.7, -0.6), c - len(s) / SR * 0.5, 0.26, verb=0.25)

# cut 7 — push-cut with flash: tight swish + punchy soft impact on the cut
c = cut(714)
s = swish(slide[3], 0.6, 5000)
add(s, c - len(s) / SR * 0.85, 0.26, verb=0.2)
add(thud[0], c, 0.32)
add(speed(glass[1], 1.0), c, 0.05, verb=0.6)

# cut 8 — iris into outro: long reversed swell, then bell + sub, the finale
c = cut(800)
sw = rev_swell(filt(speed(bellhit, 0.6), 'lowpass', 6000), 1.4)
add(sw, c - len(sw) / SR, 0.16)
add(speed(bellhit, 0.7), c, 0.20, verb=0.9)
add(sub_hit(38, 2.5), c, 0.55, verb=0.3)

# ---- scene accents ----
# logo reveal: slowed glass bloom + sub as the logo lights up
add(rev_swell(filt(speed(glass[0], 0.6), 'highpass', 300), 0.9), 0.05, 0.08)
add(speed(glass[0], 0.55), 1.0, 0.14, verb=0.9)
add(sub_hit(40), 1.0, 0.30, verb=0.3)

# hook (starts 68): rising ticks as the figure climbs, success chime at the briefcase
for j in range(4):
    add(speed(ticks[0], 1.0 + j * 0.18), cut(68 + 26 + (j + 1) * 11), 0.16, pan=-0.3 + j * 0.2, verb=0.3)
add(confirm, cut(68 + 26 + 44 + 6), 0.16, verb=0.5)

# apps (starts 364): key taps while typing, mouse clicks on each app, sent swish
for j in range(16):
    add(speed(ticks[j % 2], rng.uniform(1.4, 1.9)), cut(376) + j * 0.065 + rng.random() * 0.015, 0.07, pan=rng.uniform(-0.3, 0.3))
for j in range(4):
    add(click, cut(364 + 12 + j * 27 + 13), 0.22)
add(swish(slide[1], 1.2, 8000), cut(364 + 12 + 81 + 18), 0.10, pan=-0.5)

# cert (starts 498): stamp
st = cut(498 + 30)
add(speed(thud[1], 0.7), st, 0.42, verb=0.3)
add(speed(glass[1], 0.9), st + 0.03, 0.08, verb=0.9)

# details (starts 586): calendar flip, price ticks, price ding
add(swish(fan, 1.1, 8000), cut(586 + 16), 0.10)
for j in range(14):
    add(speed(ticks[1], 1.0 + j * 0.05), cut(586 + 52) + j * 0.075, 0.07)
add(confirm, cut(586 + 86), 0.18, verb=0.6)
add(speed(glass[0], 1.0), cut(586 + 86), 0.07, verb=0.8)

# CTA (starts 706): meter completes
add(confirm, cut(706 + 50), 0.14, verb=0.6)

# outro (starts 790): register button pop
add(speed(glass[1], 1.1), cut(790 + 50), 0.08, verb=0.8)

# ------------------------------------------------------------------ MIX
# reverb: stereo exponentially-decaying noise IR
ir_t = tvec(2.2)
irL = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.0)
irR = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 3.0)
irL, irR = filt(irL, 'lowpass', 6000), filt(irR, 'lowpass', 6000)
irL /= np.sqrt((irL ** 2).sum())
irR /= np.sqrt((irR ** 2).sum())
wet = np.stack([fftconvolve(verb_send[:, 0], irL)[:N], fftconvolve(verb_send[:, 1], irR)[:N]], 1)

mix = dry + music_bus + wet * 0.35
mix = np.stack([filt(mix[:, 0], 'highpass', 25), filt(mix[:, 1], 'highpass', 25)], 1)
fi = int(0.4 * SR)
mix[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(2.0 * SR)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.2) * 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as wf:
    wf.setnchannels(2)
    wf.setsampwidth(2)
    wf.setframerate(SR)
    wf.writeframes(pcm.tobytes())
print('wrote', sys.argv[1], f'{DUR}s')
