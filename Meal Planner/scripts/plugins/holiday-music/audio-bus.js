window.HolidayAudioBus = (function () {
    let ctx = null, masterBus = null, limiter = null;

    function effectiveGain(vol) {
        return Math.max(0, Math.min(1, Number(vol))) * 0.55;
    }

    function init() {
        if (ctx) return ctx;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        ctx = new Ctx();
        return ctx;
    }

    function rebuild(volume) {
        if (!ctx) return null;
        if (masterBus) { try { masterBus.disconnect(); } catch (e) {} }
        if (limiter) { try { limiter.disconnect(); } catch (e) {} }

        limiter = ctx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-14, ctx.currentTime);
        limiter.knee.setValueAtTime(12, ctx.currentTime);
        limiter.ratio.setValueAtTime(12, ctx.currentTime);
        limiter.attack.setValueAtTime(0.003, ctx.currentTime);
        limiter.release.setValueAtTime(0.18, ctx.currentTime);
        limiter.connect(ctx.destination);

        masterBus = ctx.createGain();
        masterBus.gain.setValueAtTime(effectiveGain(volume), ctx.currentTime);
        masterBus.connect(limiter);
        return masterBus;
    }

    function setGain(volume) {
        if (masterBus && ctx) {
            masterBus.gain.setTargetAtTime(effectiveGain(volume), ctx.currentTime, 0.02);
        }
    }

    function resume() {
        if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    }

    return {
        init, rebuild, setGain, resume,
        getContext: () => ctx,
        getBus: () => masterBus,
        isRunning: () => Boolean(ctx && ctx.state === "running")
    };
})();
