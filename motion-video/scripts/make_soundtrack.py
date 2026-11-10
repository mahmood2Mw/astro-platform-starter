"""Original, royalty-free soundtrack + sound design, synced to the video timeline.

Usage: python3 scripts/make_soundtrack.py public/soundtrack.wav   (needs numpy + scipy)

- Music: 120 BPM cinematic-tech groove (Am-F-C-G), side-chained pads, plucks with
  ping-pong delay, soft kick/clap/shaker. Drums drop at the first cut, stop for the outro.
- Each scene cut has its OWN transition sound matching the visual technique
  (zoom, iris, glitch, push, flash, diagonal, flip, blinds) — all soft, filtered
  and sent to a shared reverb, so nothing sounds harsh or "stock".
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
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
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
OUTRO = 792 / 30        # last cut: drums stop

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
def noise(d):
    return rng.standard_normal(int(d * SR))


def sweep_noise(d, f0, f1, q=0.6):
    """band-limited noise whose centre frequency glides f0 -> f1"""
    x = noise(d)
    out = np.zeros_like(x)
    blk = 1024
    for s in range(0, len(x), blk):
        fc = f0 + (f1 - f0) * (s / len(x))
        lo, hi = fc * (1 - q / 2), min(fc * (1 + q / 2), SR / 2 - 100)
        out[s : s + blk] = filt(x[max(0, s - 2048) : s + blk], 'bandpass', [lo, hi])[-len(x[s : s + blk]) :]
    return out


def boom(d=2.0, f=42):
    t = tvec(d)
    fr = f + 30 * np.exp(-t * 12)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 2.2)


def bell(freqs, d=2.0, decay=3.0):
    t = tvec(d)
    return sum(np.sin(2 * np.pi * fr * t) * np.exp(-t * decay * (1 + i * 0.4)) / (1 + i) for i, fr in enumerate(freqs))


def stereo_pan_sweep(x, p0, p1):
    p = np.linspace(p0, p1, len(x))
    return np.stack([x * np.sqrt((1 - p) / 2), x * np.sqrt((1 + p) / 2)], 1) * 1.41


cut = lambda f: f / 30

# zoom-through (logo -> hook): rising air + sub drop
c = cut(76)
s = sweep_noise(0.7, 400, 5000) * np.sin(np.linspace(0, np.pi, int(0.7 * SR))) ** 2
add(s, c - 0.6, 0.22, verb=0.4)
add(boom(2.0, 38), c, 0.55, verb=0.3)

# iris (hook -> skills): reverse-cymbal swell + soft bell
c = cut(180)
t = tvec(0.9)
sw = filt(noise(0.9), 'highpass', 3000) * (t / 0.9) ** 3
add(sw, c - 0.85, 0.16, verb=0.6)
add(bell([1318.5, 1975.5, 2637]), c, 0.06, verb=0.8)

# glitch (skills -> title): digital stutter blips
c = cut(280)
for j in range(7):
    d = 0.025 + rng.random() * 0.03
    tt = tvec(d)
    fr = rng.choice([220, 440, 880, 1760])
    sq = np.sign(np.sin(2 * np.pi * fr * tt)) * 0.5
    sq = np.round(sq * 4) / 4  # bitcrush
    add(sq * adsr(len(tt), 0.002, 0.005), c - 0.18 + j * 0.045, 0.06, pan=rng.uniform(-0.7, 0.7))
add(filt(noise(0.15), 'bandpass', [1500, 6000]) * np.exp(-tvec(0.15) * 20), c, 0.1)
add(boom(1.2, 50), c, 0.3)

# push (title -> apps): stereo whoosh panned right -> left
c = cut(376)
s = sweep_noise(0.8, 300, 2500) * np.sin(np.linspace(0, np.pi, int(0.8 * SR))) ** 3
add(stereo_pan_sweep(s, 0.9, -0.9), c - 0.45, 0.28, verb=0.35)

# flash (apps -> cert): airy swell + shimmer chord
c = cut(494)
t = tvec(0.6)
add(filt(noise(0.6), 'highpass', 5000) * (t / 0.6) ** 2, c - 0.55, 0.12, verb=0.5)
add(bell([1760, 2217.5, 2637, 3520], 2.5, 1.8), c, 0.045, verb=1.0)

# diagonal (cert -> details): quick swipe
c = cut(584)
s = sweep_noise(0.35, 2000, 600) * np.sin(np.linspace(0, np.pi, int(0.35 * SR)))
add(stereo_pan_sweep(s, -0.8, 0.8), c - 0.2, 0.25, verb=0.3)

# flip (details -> CTA): two card-flip transients + low whoosh
c = cut(704)
for j, dt in enumerate([-0.12, 0.05]):
    add(filt(noise(0.05), 'bandpass', [800, 4000]) * np.exp(-tvec(0.05) * 60), c + dt, 0.18, pan=0.4 - j * 0.8)
add(sweep_noise(0.5, 200, 800) * np.sin(np.linspace(0, np.pi, int(0.5 * SR))), c - 0.25, 0.15)

# blinds (CTA -> outro): 1.6 s riser into a cinematic hit
c = cut(792)
t = tvec(1.6)
riser = sweep_noise(1.6, 300, 6000) * (t / 1.6) ** 2.5 + np.sin(2 * np.pi * (220 + 660 * (t / 1.6) ** 2) * t) * (t / 1.6) ** 2 * 0.15
add(riser, c - 1.6, 0.2, verb=0.5)
add(boom(3.0, 36), c, 0.75, verb=0.5)
add(bell([880, 1318.5, 1760], 3.0, 1.2), c, 0.05, verb=1.0)

# ---- scene accents ----
# logo reveal shimmer + flare hit
add(filt(noise(1.2), 'highpass', 6000) * np.sin(np.linspace(0, np.pi, int(1.2 * SR))), 0.1, 0.06, verb=0.8)
add(bell([1046.5, 1568, 2093], 2.5, 1.5), 1.0, 0.05, verb=0.9)
add(boom(2.0, 40), 1.0, 0.35, verb=0.4)

# hops up the staircase (rising pentatonic plinks)
for j, m in enumerate([72, 74, 76, 79]):
    tt = tvec(0.3)
    add(np.sin(2 * np.pi * mid(m) * tt) * np.exp(-tt * 14), cut(68 + 26 + (j + 1) * 11), 0.07, verb=0.4, pan=-0.3 + j * 0.2)
add(bell([2093, 2637, 3136], 1.5, 3), cut(144), 0.05, verb=0.8)

# laptop: key taps during Word, mouse clicks per app
for j in range(18):
    add(filt(noise(0.02), 'bandpass', [2000, 7000]) * np.exp(-tvec(0.02) * 250), cut(382) + j * 0.06 + rng.random() * 0.02, 0.05, pan=rng.uniform(-0.3, 0.3))
for j in range(4):
    add(filt(noise(0.015), 'bandpass', [1500, 5000]) * np.exp(-tvec(0.015) * 300), cut(368 + 12 + j * 27 + 13), 0.12)
add(sweep_noise(0.4, 800, 3000) * np.sin(np.linspace(0, np.pi, int(0.4 * SR))), cut(368 + 12 + 81 + 18), 0.08)  # email sent

# certificate stamp
add(boom(1.0, 60), cut(516), 0.5, verb=0.3)
add(filt(noise(0.08), 'lowpass', 1800) * np.exp(-tvec(0.08) * 40), cut(516), 0.35)
add(bell([1568, 2349, 3136], 2.0, 2.0), cut(518), 0.04, verb=0.9)

# details: calendar flip, price count ticks + ding
add(filt(noise(0.06), 'bandpass', [1000, 5000]) * np.exp(-tvec(0.06) * 50), cut(592), 0.12)
for j in range(14):
    tt = tvec(0.04)
    add(np.sin(2 * np.pi * (1200 + j * 60) * tt) * np.exp(-tt * 90), cut(628) + j * 0.075, 0.04)
add(bell([1318.5, 1975.5, 2637], 2.0, 2.5), cut(662), 0.09, verb=0.7)

# CTA: meter fill tone
t = tvec(1.4)
add(np.sin(2 * np.pi * (300 + 500 * (t / 1.4)) * t) * np.sin(np.linspace(0, np.pi, len(t))) * 0.5, cut(704), 0.05, verb=0.5)
add(bell([2093, 2637, 3136], 1.5, 3), cut(746), 0.05, verb=0.8)

# outro: button pop
add(bell([1046.5, 1318.5, 1568], 2.0, 2.0), cut(784 + 50), 0.05, verb=0.8)

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
