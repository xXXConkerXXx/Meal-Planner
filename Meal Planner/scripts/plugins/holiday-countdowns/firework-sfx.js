window.FireworkAudio = (function () {
    const MUTE_KEY = "mealPlannerFireworkMuted";
    let ctx = null, limiter = null, masterGain = null, noiseBuffer = null;
    let muted = localStorage.getItem(MUTE_KEY) === "true";
    let lastBoomTime = 0, lastSizzleTime = 0;

    function ensureContext() {
        if (!ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            ctx = new Ctx();
            limiter = ctx.createDynamicsCompressor();
            limiter.threshold.setValueAtTime(-14, ctx.currentTime);
            limiter.knee.setValueAtTime(12, ctx.currentTime);
            limiter.ratio.setValueAtTime(12, ctx.currentTime);
            limiter.attack.setValueAtTime(0.003, ctx.currentTime);
            limiter.release.setValueAtTime(0.18, ctx.currentTime);
            limiter.connect(ctx.destination);

            masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(muted ? 0 : 0.65, ctx.currentTime);
            masterGain.connect(limiter);

            const len = Math.floor(ctx.sampleRate * 1.5);
            noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
            const data = noiseBuffer.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        }
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        return ctx;
    }

    function createPanner(pan) {
        if (typeof ctx.createStereoPanner === "function") {
            const panner = ctx.createStereoPanner();
            panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan || 0)), ctx.currentTime);
            panner.connect(masterGain);
            return panner;
        }
        return masterGain;
    }

    return {
        isMuted: () => muted,
        unlock() { if (!muted) ensureContext(); },
        toggleMute() {
            muted = !muted;
            localStorage.setItem(MUTE_KEY, String(muted));
            if (masterGain && ctx) masterGain.gain.setTargetAtTime(muted ? 0 : 0.65, ctx.currentTime, 0.02);
            return muted;
        },
        playLaunchSizzle(pan = 0, durationSec = 0.9) {
            if (muted) return;
            const audio = ensureContext();
            if (!audio || audio.state !== "running" || !noiseBuffer) return;
            const now = audio.currentTime;
            if (now - lastSizzleTime < 0.09) return;
            lastSizzleTime = now;

            const dur = Math.max(0.4, Math.min(1.4, durationSec));
            const src = audio.createBufferSource();
            src.buffer = noiseBuffer;
            const filter = audio.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(3200, now + dur);
            filter.Q.setValueAtTime(2.4, now);

            const gain = audio.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);

            src.connect(filter);
            filter.connect(gain);
            gain.connect(createPanner(pan));
            src.start(now);
            src.stop(now + dur + 0.02);
            src.onended = () => { try { src.disconnect(); filter.disconnect(); gain.disconnect(); } catch (e) {} };
        },
        playBurstBoom(pan = 0) {
            if (muted) return;
            const audio = ensureContext();
            if (!audio || audio.state !== "running" || !noiseBuffer) return;
            const now = audio.currentTime;
            if (now - lastBoomTime < 0.055) return;
            lastBoomTime = now;

            const dest = createPanner(pan);
            const osc = audio.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(125 + Math.random() * 25, now);
            osc.frequency.exponentialRampToValueAtTime(34, now + 0.42);
            const oscGain = audio.createGain();
            oscGain.gain.setValueAtTime(0.001, now);
            oscGain.gain.linearRampToValueAtTime(0.28, now + 0.015);
            oscGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);
            osc.connect(oscGain);
            oscGain.connect(dest);
            osc.start(now);
            osc.stop(now + 0.48);
            osc.onended = () => { try { osc.disconnect(); oscGain.disconnect(); } catch (e) {} };

            const noise = audio.createBufferSource();
            noise.buffer = noiseBuffer;
            const lp = audio.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.setValueAtTime(1100, now);
            lp.frequency.exponentialRampToValueAtTime(220, now + 0.55);
            const nGain = audio.createGain();
            nGain.gain.setValueAtTime(0.001, now);
            nGain.gain.linearRampToValueAtTime(0.20, now + 0.012);
            nGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.58);
            noise.connect(lp);
            lp.connect(nGain);
            nGain.connect(dest);
            noise.start(now);
            noise.stop(now + 0.60);
            noise.onended = () => { try { noise.disconnect(); lp.disconnect(); nGain.disconnect(); } catch (e) {} };
        }
    };
})();
