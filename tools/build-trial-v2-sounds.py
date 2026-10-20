"""Original procedural preview effects: bamboo, ceramic resonance, paper and card rustle.
No third-party recordings. Deliberately separate from bitmap export."""
import math, random, struct, wave
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'minigame/assets/audio'; out.mkdir(exist_ok=True)
rate=22050
def make(name,length,fn):
 rng=random.Random(10302); values=[fn(i/rate,rng) for i in range(round(length*rate))]
 peak=max(abs(x) for x in values) or 1; gain=min(1,.72/peak)
 with wave.open(str(out/name),'wb') as f:
  f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(struct.pack('<'+'h'*len(values),*(int(x*gain*32767) for x in values)))
def attack(t):return min(1,max(0,t)/.002)
def wood(t,r):return attack(t)*(.3*r.uniform(-1,1)*math.exp(-t*90)+.35*math.sin(2*math.pi*480*t)*math.exp(-t*70)+.2*math.sin(2*math.pi*1270*t)*math.exp(-t*95))
def ceramic(t,r):return attack(t)*sum(a*math.sin(2*math.pi*hz*t)*math.exp(-t*decay) for a,hz,decay in [(.24,1340,27),(.12,2137,34),(.06,3061,48)])
def paper(t,r):return r.uniform(-1,1)*(.6*math.exp(-t*100)+.25*math.exp(-((t-.055)/.015)**2))
make('v2-bamboo.wav',.08,wood)
make('v2-porcelain.wav',.17,ceramic)
make('v2-stamp.wav',.23,lambda t,r:attack(t)*(paper(t,r)*.55+.16*math.sin(2*math.pi*130*t)*math.exp(-t*35)))
make('v2-return.wav',.16,lambda t,r:attack(t)*r.uniform(-1,1)*math.sin(math.pi*t/.16)**2*.22)
make('v2-rustle.wav',.28,lambda t,r:r.uniform(-1,1)*sum(.18*math.exp(-((t-a)/.014)**2) for a in [.03,.08,.13,.19,.24]))
print('Five original preview effects exported; no voice or background music overwritten.')
