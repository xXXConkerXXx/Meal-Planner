window.HolidayVoiceSynth = {
    playBass(ctx, dest, freq, durSec) {
        if (!ctx || !freq) return;
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
        osc.start(now);
        osc.stop(now + rel + 0.04);
    },

    playChord(ctx, dest, freqs, durSec, mode) {
        if (!ctx || !freqs) return;
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
            osc.start(now + strum);
            osc.stop(now + release + 0.04);
        });
    },

    playLead(ctx, dest, freq, durSec, mode) {
        if (!ctx || !freq) return;
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
                osc.start(now);
                osc.stop(now + durSec * 1.2);
            });
        } else {
            // Celesta bell
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
                osc.start(now);
                osc.stop(now + dec + 0.04);
            });
        }
    },

    playPercussion(ctx, dest, type) {
        if (!ctx || !type || type === "none") return;
        const now = ctx.currentTime;

        if (type === "sleigh") {
            const len = Math.floor(ctx.sampleRate * 0.14);
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));

            const src = ctx.createBufferSource();
            src.buffer = buf;
            const hp = ctx.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.value = 4800;

            const env = ctx.createGain();
            env.gain.setValueAtTime(0.032, now);
            env.gain.exponentialRampToValueAtTime(0.0008, now + 0.14);
            src.connect(hp);
            hp.connect(env);
            env.connect(dest);
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
            osc.start(now);
            osc.stop(now + 0.48);
        }
    }
};
