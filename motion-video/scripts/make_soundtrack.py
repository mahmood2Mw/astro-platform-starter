"""Synthesize an original, royalty-free soundtrack + SFX timed to the video scenes.
Usage: python3 scripts/make_soundtrack.py public/soundtrack.wav"""
import sys, wave
import numpy as np

SR = 44100
DUR = 38.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    j = min(N, i + len(sig))
    if i >= N: return
    s = sig[: j - i] * gain
    mix[i:j, 0] += s * (1 - pan) / 1.0
    mix[i:j, 1] += s * (1 + pan) / 1.0

def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[n - nr:] *= np.linspace(1, 0, nr)
    return e

def lowpass(x, alpha):
    y = np.zeros_like(x); acc = 0.0
    for k in range(len(x)):
        acc += alpha * (x[k] - acc); y[k] = acc
    return y

BPM = 100; beat = 60 / BPM
# Chord progression (A minor - F - C - G), 2 bars each
chords = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]]
f = lambda m: 440 * 2 ** ((m - 69) / 12)
bar = beat * 4
pos, ci = 0.0, 0
while pos < DUR:
    d = bar * 2
    n = int(d * SR); tt = np.arange(n) / SR
    pad = np.zeros(n)
    for m in chords[ci % 4]:
        for det in (-0.12, 0.12):
            pad += np.sin(2 * np.pi * f(m) * (1 + det / 100) * tt)
            pad += 0.3 * np.sin(2 * np.pi * f(m + 12) * tt + det)
    pad *= env(n, 0.8, 0.8) * 0.035
    add(pad, pos)
    # sub bass
    bass = np.sin(2 * np.pi * f(chords[ci % 4][0] - 24) * tt) * env(n, 0.05, 0.3) * 0.12
    add(bass, pos)
    pos += d; ci += 1

# Arp plucks
arp_t = 0.0; k = 0
while arp_t < DUR - 1:
    ch = chords[int(arp_t // (bar * 2)) % 4]
    m = ch[k % 3] + 12 + (12 if k % 8 >= 6 else 0)
    n = int(0.35 * SR); tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * f(m) * tt) * np.exp(-tt * 12)
    level = 0.05 if 3 < arp_t < 33.5 else 0.02
    add(s, arp_t, level, pan=0.4 * np.sin(k))
    arp_t += beat / 2; k += 1

# Drums (start after intro, stop before outro)
def kick():
    n = int(0.4 * SR); tt = np.arange(n) / SR
    fr = 50 + 90 * np.exp(-tt * 30)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 9)
def hat():
    n = int(0.06 * SR); x = rng.standard_normal(n)
    x = x - lowpass(x, 0.3)
    return x * np.exp(-np.arange(n) / SR * 60)
b = 3.0
i = 0
while b < 33.3:
    add(kick(), b, 0.35)
    add(hat(), b + beat / 2, 0.06, pan=0.3)
    if i % 4 == 2: add(hat(), b + beat * 0.75, 0.04, pan=-0.3)
    b += beat; i += 1

# Whooshes at cuts
def whoosh(d=0.7):
    n = int(d * SR); x = rng.standard_normal(n)
    e = np.sin(np.linspace(0, np.pi, n)) ** 2
    alpha = np.linspace(0.02, 0.35, n)
    y = np.zeros(n); acc = 0.0
    for k in range(n):
        acc += alpha[k] * (x[k] - acc); y[k] = acc
    return y * e
for c in [3, 7, 11, 15.5, 20, 24, 29.5, 33.5]:
    add(whoosh(), c - 0.45, 0.35, pan=0.5 if c % 2 else -0.5)

# Impact (low boom + shimmer)
def impact():
    n = int(1.5 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 45 * tt) * np.exp(-tt * 3) * 0.8 + np.sin(2 * np.pi * 1760 * tt) * np.exp(-tt * 5) * 0.08)
for c in [0.15, 11.5, 20.4, 29.7]:
    add(impact(), c, 0.5)

# Typing ticks (scene 5)
for k in range(14):
    n = int(0.03 * SR); x = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 200)
    add(x, 15.8 + k * 0.07 + rng.random() * 0.02, 0.08, pan=rng.uniform(-0.3, 0.3))

# Price count ticks + ding (scene 7)
for k in range(16):
    n = int(0.05 * SR); tt = np.arange(n) / SR
    add(np.sin(2 * np.pi * (900 + k * 40) * tt) * np.exp(-tt * 80), 26.2 + k * 0.07, 0.07)
def ding():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * fr * tt) * np.exp(-tt * d) * a for fr, d, a in [(1318, 3, 0.5), (1976, 4, 0.3), (2637, 6, 0.2)])
add(ding(), 27.35, 0.25)
add(ding(), 20.7, 0.15)

# Riser into outro
n = int(2.0 * SR); tt = np.arange(n) / SR
riser = rng.standard_normal(n) * (tt / 2.0) ** 2 * 0.3 + np.sin(2 * np.pi * (200 + 600 * (tt / 2) ** 2) * tt) * (tt / 2) * 0.1
add(riser, 31.5, 0.35)

# Master: fades, normalize, soft clip
mix[: int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))[:, None]
fo = int(3.0 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.3) * 0.85
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes(pcm.tobytes())
print('wrote', sys.argv[1])
