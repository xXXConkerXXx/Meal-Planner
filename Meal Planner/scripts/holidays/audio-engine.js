window.HolidayAudioEngine = (function () {
    const VOL_KEY = "mealPlannerHolidayVolume";
    let savedVol = parseFloat(localStorage.getItem(VOL_KEY));
    if (Number.isNaN(savedVol) || savedVol < 0 || savedVol > 1) savedVol = 0.75;

    let ctx = null, masterBus = null, playing = false, userPaused = false, stepIdx = 0, timerId = null, lastMonth = -1, onUpdate = null, volume = savedVol;

    function initGraph() {
        if (ctx) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        ctx = new Ctx();
        rebuildBus();
    }

    function rebuildBus() {
        if (!ctx) return;
        if (masterBus) {
            try { masterBus.disconnect(); } catch (e) {}
        }
        masterBus = ctx.createGain();
        masterBus.gain.value = volume;
        masterBus.connect(ctx.destination);
    }

    function getMonthIdx() {
        const h1 = document.querySelector("h1");
        const title = (h1 ? h1.textContent : "").toLowerCase();
        const months = Array.of("january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december");
        const idx = months.findIndex(m => title.includes(m));
        return idx !== -1 ? idx : (typeof viewMonth === "number" ? viewMonth : new Date().getMonth());
    }

    function scheduleNext() {
        if (!playing) return;
        if (ctx && ctx.state === "suspended") {
            ctx.resume().catch(() => {});
            timerId = setTimeout(scheduleNext, 300);
            return;
        }

        const songs = window.HOLIDAY_SONGS || [];
        const mIdx = getMonthIdx();

        if (mIdx !== lastMonth) {
            lastMonth = mIdx;
            stepIdx = 0;
            if (onUpdate) onUpdate();
        }

        const song = songs.at(mIdx) || songs.at(0);
        const waitMs = window.HolidayArranger.playStep(ctx, masterBus, song, stepIdx, () => playing);
        stepIdx++;
        timerId = setTimeout(scheduleNext, waitMs);
    }

    function startPlayback() {
        initGraph();
        if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
        playing = true;
        clearTimeout(timerId);
        lastMonth = getMonthIdx();
        if (onUpdate) onUpdate();
        scheduleNext();
    }

    return {
        setListener(fn) { onUpdate = fn; },
        getState() {
            const songs = window.HOLIDAY_SONGS || [];
            const song = songs.at(getMonthIdx()) || { name: "Holiday Music", ensemble: "Ensemble" };
            return { playing, song, volume };
        },
        setVolume(val) {
            const clamped = Math.max(0, Math.min(1, Number(val)));
            volume = clamped;
            localStorage.setItem(VOL_KEY, String(clamped));
            if (masterBus && ctx) {
                masterBus.gain.setTargetAtTime(clamped, ctx.currentTime, 0.02);
            }
            if (onUpdate) onUpdate();
        },
        startAutoplay() {
            if (userPaused || playing) return;
            startPlayback();
        },
        unlockOnGesture() {
            if (userPaused) return;
            initGraph();
            if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
            if (!playing) startPlayback();
        },
        onMonthChange() {
            const mIdx = getMonthIdx();
            if (mIdx === lastMonth) return;
            lastMonth = mIdx;

            clearTimeout(timerId);
            stepIdx = 0;
            if (ctx) rebuildBus();

            if (onUpdate) onUpdate();
            if (playing) timerId = setTimeout(scheduleNext, 2500);
        },
        togglePlay() {
            if (playing) {
                playing = false;
                userPaused = true;
                clearTimeout(timerId);
                if (ctx) rebuildBus();
                if (onUpdate) onUpdate();
            } else {
                userPaused = false;
                startPlayback();
            }
        }
    };
})();
