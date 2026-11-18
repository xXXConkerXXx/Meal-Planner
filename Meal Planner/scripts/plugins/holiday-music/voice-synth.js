window.HolidayVoiceSynth = {
    playBass(ctx, dest, freq, durSec) {
        if (!ctx || !dest || !freq) return;
        const bind = window.HolidayPercussionSynth?.bindCleanup || (() => {});
        const now = ctx.currentTime;
        const rel = Math.max(1.4, durSec * 2.0);
        const osc = ctx.createOscillator();
        const lp = ctx.createBiquadFilter();
        const env = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        lp.type = "lowpass";
        lp.frequency.value = 260;

        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.11, now + 0.06);
        env.gain.exponentialRampToValueAtTime(0.0001, now + rel);

        osc.connect(lp);
        lp.connect(env);
        env.connect(dest);
        bind(osc, lp, env);
        osc.start(now);
        osc.stop(now + rel + 0.04);
    },

    playChord(ctx, dest, freqs, durSec, mode) {
        if (!ctx || !dest || !freqs) return;
        const bind = window.HolidayPercussionSynth?.bindCleanup || (() => {});
        const now = ctx.currentTime;
        freqs.forEach((f, idx) => {
            const strum = mode === "harp" ? idx * 0.055 : idx * 0.015;
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const env = ctx.createGain();

            osc.type = mode === "brass" || mode === "organ" ? "sawtooth" : (mode === "harp" ? "triangle" : "sine");
            osc.frequency.setValueAtTime(f, now + strum);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(mode === "brass" ? 880 : 1050, now + strum);

            const peak = mode === "harp" ? 0.036 : 0.025;
            const release = Math.max(1.5, durSec * 2.0);
            env.gain.setValueAtTime(0.0001, now + strum);
            env.gain.linearRampToValueAtTime(peak, now + strum + (mode === "harp" ? 0.02 : 0.16));
            env.gain.exponentialRampToValueAtTime(0.0001, now + release);

            osc.connect(filter);
            filter.connect(env);
            env.connect(dest);
            bind(osc, filter, env);
            osc.start(now + strum);
            osc.stop(now + release + 0.04);
        });
    },

    playLead(ctx, dest, freq, durSec, mode) {
        window.HolidayLeadSynth?.play(ctx, dest, freq, durSec, mode);
    },

    playPercussion(ctx, dest, type) {
        window.HolidayPercussionSynth?.play(ctx, dest, type);
    }
};
