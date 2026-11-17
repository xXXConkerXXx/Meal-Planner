window.FireworkAudio = (function () {
    let ctx = null, muted = false, pinkNoiseBuf = null;

    function unlock() {
        if (!ctx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            ctx = new Ctx();
            pinkNoiseBuf = buildPinkNoise(ctx, 2.0);
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
            out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
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

    function triggerBoom(panVal, dest) {
        const t0 = ctx.currentTime + 0.38;

        // 1. Sub-bass chest thump
        const sub = ctx.createOscillator();
        const subEnv = ctx.createGain();
        sub.type = "sine";
        sub.frequency.setValueAtTime(98, t0);
        sub.frequency.exponentialRampToValueAtTime(26, t0 + 0.65);
        subEnv.gain.setValueAtTime(0.45, t0);
        subEnv.gain.exponentialRampToValueAtTime(0.0008, t0 + 0.72);
        sub.connect(subEnv);
        subEnv.connect(dest);
        sub.start(t0);
        sub.stop(t0 + 0.75);

        // 2. Shell crack + outdoor rolling rumble (with echo taps)
        Array.of(Array.of(0, 0.42, 520, 1.35), Array.of(0.19, 0.16, 310, 1.1), Array.of(0.42, 0.08, 210, 0.9)).forEach(([delay, level, cutoff, dur]) => {
            const start = t0 + delay;
            const src = ctx.createBufferSource();
            src.buffer = pinkNoiseBuf;

            const lp = ctx.createBiquadFilter();
            lp.type = "lowpass";
            lp.frequency.setValueAtTime(cutoff, start);
            lp.frequency.exponentialRampToValueAtTime(55, start + dur);

            const env = ctx.createGain();
            env.gain.setValueAtTime(0.001, start);
            env.gain.linearRampToValueAtTime(level, start + 0.015);
            env.gain.exponentialRampToValueAtTime(0.0008, start + dur);

            src.connect(lp);
            lp.connect(env);
            env.connect(dest);
            src.start(start, Math.random() * 0.4, dur);
        });

        // 3. Chrysanthemum crackling spark cascade
        const crackleCount = 11;
        for (let i = 0; i < crackleCount; i++) {
            const cStart = t0 + 0.14 + Math.random() * 0.68;
            const cDur = 0.032 + Math.random() * 0.025;
            const cSrc = ctx.createBufferSource();
            cSrc.buffer = pinkNoiseBuf;

            const bp = ctx.createBiquadFilter();
            bp.type = "bandpass";
            bp.frequency.value = 2600 + Math.random() * 2200;
            bp.Q.value = 3.2;

            const cPan = createPanner(panVal + (Math.random() - 0.5) * 0.5);
            const cEnv = ctx.createGain();
            cEnv.gain.setValueAtTime(0.18 + Math.random() * 0.14, cStart);
            cEnv.gain.exponentialRampToValueAtTime(0.0008, cStart + cDur);

            cSrc.connect(bp);
            bp.connect(cEnv);
            cEnv.connect(cPan);
            cSrc.start(cStart, Math.random() * 1.2, cDur);
        }
    }

    function playLaunchAndBurst(panVal = 0) {
        if (muted || !ctx || ctx.state !== "running" || !pinkNoiseBuf) return;
        const now = ctx.currentTime;
        const dest = createPanner(panVal);

        // Air rush launch whoosh
        const whoosh = ctx.createBufferSource();
        whoosh.buffer = pinkNoiseBuf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 3.0;
        bp.frequency.setValueAtTime(420, now);
        bp.frequency.exponentialRampToValueAtTime(1650, now + 0.36);

        const wEnv = ctx.createGain();
        wEnv.gain.setValueAtTime(0.001, now);
        wEnv.gain.linearRampToValueAtTime(0.14, now + 0.08);
        wEnv.gain.exponentialRampToValueAtTime(0.0008, now + 0.38);

        whoosh.connect(bp);
        bp.connect(wEnv);
        wEnv.connect(dest);
        whoosh.start(now, 0, 0.39);

        triggerBoom(panVal, dest);
    }

    return {
        unlock,
        playLaunchAndBurst,
        toggleMute() {
            unlock();
            muted = !muted;
            return muted;
        },
        isMuted() { return muted; }
    };
})();
