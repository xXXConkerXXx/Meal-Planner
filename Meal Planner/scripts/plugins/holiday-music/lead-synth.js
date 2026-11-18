window.HolidayLeadSynth = {
    play(ctx, dest, freq, durSec, mode) {
        if (!ctx || !dest || !freq) return;
        const bind = window.HolidayPercussionSynth?.bindCleanup || (() => {});
        const now = ctx.currentTime;
        const tail = Math.max(1.1, durSec * 1.45);

        if (mode === "piano") {
            Array.of(Array.of(freq, 0.095, "triangle"), Array.of(freq * 2, 0.028, "sine")).forEach(([f, peak, wave]) => {
                const osc = ctx.createOscillator();
                const lp = ctx.createBiquadFilter();
                const env = ctx.createGain();
                osc.type = wave;
                osc.frequency.setValueAtTime(f, now);
                lp.type = "lowpass";
                lp.frequency.setValueAtTime(1850, now);
                lp.frequency.exponentialRampToValueAtTime(460, now + tail);

                env.gain.setValueAtTime(0.0001, now);
                env.gain.linearRampToValueAtTime(peak, now + 0.018);
                env.gain.exponentialRampToValueAtTime(0.0001, now + tail);

                osc.connect(lp);
                lp.connect(env);
                env.connect(dest);
                bind(osc, lp, env);
                osc.start(now);
                osc.stop(now + tail + 0.04);
            });
        } else if (mode === "strings") {
            Array.of(-4, 4).forEach(detune => {
                const osc = ctx.createOscillator();
                const lp = ctx.createBiquadFilter();
                const env = ctx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(freq, now);
                osc.detune.value = detune;
                lp.type = "lowpass";
                lp.frequency.value = 1150;

                env.gain.setValueAtTime(0.0001, now);
                env.gain.linearRampToValueAtTime(0.024, now + 0.14);
                env.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 1.3);

                osc.connect(lp);
                lp.connect(env);
                env.connect(dest);
                bind(osc, lp, env);
                osc.start(now);
                osc.stop(now + durSec * 1.35);
            });
        } else if (mode === "flute") {
            const osc = ctx.createOscillator();
            const vib = ctx.createOscillator();
            const vibGain = ctx.createGain();
            const env = ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            vib.frequency.setValueAtTime(5.0, now);
            vibGain.gain.setValueAtTime(3.0, now);
            vib.connect(vibGain);
            vibGain.connect(osc.frequency);

            env.gain.setValueAtTime(0.0001, now);
            env.gain.linearRampToValueAtTime(0.08, now + 0.08);
            env.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 1.2);

            osc.connect(env);
            env.connect(dest);
            bind(osc, vib, vibGain, env);
            osc.start(now);
            vib.start(now);
            osc.stop(now + durSec * 1.25);
            vib.stop(now + durSec * 1.25);
        } else if (mode === "brass" || mode === "organ") {
            Array.of(Array.of(freq * 0.5, 0.03), Array.of(freq, 0.055), Array.of(freq * 2, 0.02)).forEach(([f, peak]) => {
                const osc = ctx.createOscillator();
                const lp = ctx.createBiquadFilter();
                const env = ctx.createGain();
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(f, now);
                lp.type = "lowpass";
                lp.frequency.setValueAtTime(mode === "brass" ? 650 : 1050, now);
                if (mode === "brass") lp.frequency.linearRampToValueAtTime(1550, now + 0.14);

                env.gain.setValueAtTime(0.0001, now);
                env.gain.linearRampToValueAtTime(peak, now + 0.07);
                env.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 1.15);

                osc.connect(lp);
                lp.connect(env);
                env.connect(dest);
                bind(osc, lp, env);
                osc.start(now);
                osc.stop(now + durSec * 1.2);
            });
        } else {
            Array.of(Array.of(freq, 0.09, tail), Array.of(freq * 2, 0.026, tail * 0.6)).forEach(([f, peak, dec]) => {
                const osc = ctx.createOscillator();
                const env = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(f, now);
                env.gain.setValueAtTime(0.0001, now);
                env.gain.linearRampToValueAtTime(peak, now + 0.022);
                env.gain.exponentialRampToValueAtTime(0.0001, now + dec);
                osc.connect(env);
                env.connect(dest);
                bind(osc, env);
                osc.start(now);
                osc.stop(now + dec + 0.04);
            });
        }
    }
};
