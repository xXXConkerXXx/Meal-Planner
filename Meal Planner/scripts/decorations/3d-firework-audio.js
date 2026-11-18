window.FireworkAudio = (function () {
    const STORAGE_KEY = "mealPlannerFireworksMuted";

    function readSavedMute() {
        const cookieMatch = document.cookie.match(/(?:^|;\s*)mealPlannerFireworksMuted=(1|0)/);
        if (cookieMatch) return cookieMatch[1] === "1";
        return localStorage.getItem(STORAGE_KEY) === "1";
    }

    function writeSavedMute(isMuted) {
        const val = isMuted ? "1" : "0";
        document.cookie = `${STORAGE_KEY}=${val}; max-age=31536000; path=/; SameSite=Lax`;
        try { localStorage.setItem(STORAGE_KEY, val); } catch (e) {}
    }

    let ctx = null, muted = readSavedMute(), pinkNoiseBuf = null;

    function unlock() {
        if (!ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            ctx = new Ctx();
            pinkNoiseBuf = buildPinkNoise(ctx, 2.5);
        }
        if (ctx && ctx.state === "suspended") ctx.resume();
    }

    function buildPinkNoise(audioCtx, seconds) {
        const len = Math.floor(audioCtx.sampleRate * seconds);
        const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
        const out = buf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < len; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
            b6 = white * 0.115926;
        }
        return buf;
    }

    function createPanner(panVal) {
        if (ctx.createStereoPanner) {
            const p = ctx.createStereoPanner();
            p.pan.value = Math.max(-0.85, Math.min(0.85, panVal));
            p.connect(ctx.destination);
            return p;
        }
        return ctx.destination;
    }

    function playLaunchSizzle(panVal = 0, climbSec = 0.85) {
        if (muted || !ctx || ctx.state !== "running" || !pinkNoiseBuf) return;
        const now = ctx.currentTime;
        const dest = createPanner(panVal);

        const thump = ctx.createOscillator();
        const thumpEnv = ctx.createGain();
        thump.type = "sine";
        thump.frequency.setValueAtTime(140, now);
        thump.frequency.exponentialRampToValueAtTime(45, now + 0.14);
        thumpEnv.gain.setValueAtTime(0.001, now);
        thumpEnv.gain.linearRampToValueAtTime(0.20, now + 0.008);
        thumpEnv.gain.exponentialRampToValueAtTime(0.0008, now + 0.15);
        thump.connect(thumpEnv);
        thumpEnv.connect(dest);
        thump.start(now);
        thump.stop(now + 0.16);

        const air = ctx.createBufferSource();
        air.buffer = pinkNoiseBuf;

        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 4.2;
        bp.frequency.setValueAtTime(360, now);
        bp.frequency.exponentialRampToValueAtTime(1280, now + climbSec * 0.45);
        bp.frequency.exponentialRampToValueAtTime(580, now + climbSec);

        const airEnv = ctx.createGain();
        airEnv.gain.setValueAtTime(0.001, now);
        airEnv.gain.linearRampToValueAtTime(0.20, now + 0.07);
        airEnv.gain.exponentialRampToValueAtTime(0.0008, now + climbSec);

        air.connect(bp);
        bp.connect(airEnv);
        airEnv.connect(dest);
        air.start(now, Math.random() * 0.6, climbSec);

        const whistle = ctx.createOscillator();
        const wEnv = ctx.createGain();
        whistle.type = "sine";
        const basePitch = 560 + Math.random() * 140;
        whistle.frequency.setValueAtTime(basePitch, now + 0.03);
        whistle.frequency.exponentialRampToValueAtTime(basePitch * 1.6, now + climbSec * 0.42);
        whistle.frequency.exponentialRampToValueAtTime(basePitch * 0.92, now + climbSec);

        wEnv.gain.setValueAtTime(0.0001, now + 0.03);
        wEnv.gain.linearRampToValueAtTime(0.018, now + 0.12);
        wEnv.gain.exponentialRampToValueAtTime(0.0001, now + climbSec * 0.92);

        whistle.connect(wEnv);
        wEnv.connect(dest);
        whistle.start(now + 0.03);
        whistle.stop(now + climbSec);
    }

    function playBurstBoom(panVal = 0) {
        if (muted || !ctx || ctx.state !== "running" || !pinkNoiseBuf) return;
        const t0 = ctx.currentTime;
        const dest = createPanner(panVal);

        const sub = ctx.createOscillator();
        const subEnv = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(115, t0);
        sub.frequency.exponentialRampToValueAtTime(28, t0 + 0.72);
        subEnv.gain.setValueAtTime(0.001, t0);
        subEnv.gain.linearRampToValueAtTime(0.52, t0 + 0.008);
        subEnv.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.78);
        sub.connect(subEnv);
        subEnv.connect(dest);
        sub.start(t0);
        sub.stop(t0 + 0.80);

        Array.of(
            Array.of(0, 0.48, 360, 1.45),
            Array.of(0.18, 0.20, 240, 1.25),
            Array.of(0.38, 0.10, 170, 1.05)
        ).forEach(([delay, level, cutoff, dur]) => {
            const start = t0 + delay;
            const src = ctx.createBufferSource();
            src.buffer = pinkNoiseBuf;

            const lp = ctx.createBiquadFilter();
            lp.type = "lowpass";
            lp.Q.value = 0.8;
            lp.frequency.setValueAtTime(cutoff, start);
            lp.frequency.exponentialRampToValueAtTime(48, start + dur);

            const env = ctx.createGain();
            env.gain.setValueAtTime(0.001, start);
            env.gain.linearRampToValueAtTime(level, start + 0.022);
            env.gain.exponentialRampToValueAtTime(0.0008, start + dur);

            src.connect(lp);
            lp.connect(env);
            env.connect(dest);
            src.start(start, Math.random() * 0.5, dur);
        });

        for (let i = 0; i < 9; i++) {
            const cStart = t0 + 0.16 + Math.random() * 0.65;
            const cDur = 0.045 + Math.random() * 0.03;
            const cSrc = ctx.createBufferSource();
            cSrc.buffer = pinkNoiseBuf;

            const bp = ctx.createBiquadFilter();
            bp.type = "bandpass";
            bp.frequency.value = 1600 + Math.random() * 1200;
            bp.Q.value = 2.5;

            const cPan = createPanner(panVal + (Math.random() - 0.5) * 0.5);
            const cEnv = ctx.createGain();
            cEnv.gain.setValueAtTime(0.001, cStart);
            cEnv.gain.linearRampToValueAtTime(0.14 + Math.random() * 0.10, cStart + 0.006);
            cEnv.gain.exponentialRampToValueAtTime(0.0008, cStart + cDur);

            cSrc.connect(bp);
            bp.connect(cEnv);
            cEnv.connect(cPan);
            cSrc.start(cStart, Math.random() * 1.4, cDur);
        }
    }

    return {
        unlock,
        playLaunchSizzle,
        playBurstBoom,
        toggleMute() {
            muted = !muted;
            if (!muted) unlock();
            writeSavedMute(muted);
            return muted;
        },
        isMuted() { return muted; }
    };
})();
