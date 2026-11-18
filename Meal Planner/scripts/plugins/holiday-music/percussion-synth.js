window.HolidayPercussionSynth = (function () {
    let cachedSleighCtx = null;
    let cachedSleighBuf = null;

    function disconnectAll(...nodes) {
        nodes.forEach(node => {
            if (!node) return;
            try { node.disconnect(); } catch (e) {}
        });
    }

    function bindCleanup(sourceNode, ...extraNodes) {
        if (!sourceNode) return;
        sourceNode.onended = () => disconnectAll(sourceNode, ...extraNodes);
    }

    function getSleighBuffer(ctx) {
        if (cachedSleighCtx === ctx && cachedSleighBuf) return cachedSleighBuf;
        const len = Math.floor(ctx.sampleRate * 0.14);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
        }
        cachedSleighCtx = ctx;
        cachedSleighBuf = buf;
        return buf;
    }

    function play(ctx, dest, type) {
        if (!ctx || !dest || !type || type === "none") return;
        const now = ctx.currentTime;

        if (type === "sleigh") {
            const src = ctx.createBufferSource();
            src.buffer = getSleighBuffer(ctx);
            const hp = ctx.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.value = 4800;

            const env = ctx.createGain();
            env.gain.setValueAtTime(0.032, now);
            env.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);
            src.connect(hp);
            hp.connect(env);
            env.connect(dest);
            bindCleanup(src, hp, env);
            src.start(now);
        } else if (type === "timpani") {
            const osc = ctx.createOscillator();
            const env = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(110, now);
            osc.frequency.exponentialRampToValueAtTime(65, now + 0.35);
            env.gain.setValueAtTime(0.08, now);
            env.gain.exponentialRampToValueAtTime(0.0008, now + 0.38);
            osc.connect(env);
            env.connect(dest);
            bindCleanup(osc, env);
            osc.start(now);
            osc.stop(now + 0.40);
        } else if (type === "chime") {
            const osc = ctx.createOscillator();
            const env = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1760, now);
            env.gain.setValueAtTime(0.012, now);
            env.gain.exponentialRampToValueAtTime(0.0005, now + 0.45);
            osc.connect(env);
            env.connect(dest);
            bindCleanup(osc, env);
            osc.start(now);
            osc.stop(now + 0.48);
        }
    }

    return { bindCleanup, play };
})();
