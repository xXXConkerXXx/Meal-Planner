window.HolidayAudioEngine = (function () {
    const VOL_KEY = "mealPlannerHolidayVolume";
    let savedVol = parseFloat(localStorage.getItem(VOL_KEY));
    if (Number.isNaN(savedVol) || savedVol < 0 || savedVol > 1) savedVol = 0.75;

    let ctx = null, masterBus = null, playing = false, userPaused = false;
    let stepIdx = 0, timerId = null, lastMonth = -1;
    let activePlaylistMonth = null, monthPlaylistPos = 0, shuffleAll = false, loopSingle = false;
    let onUpdate = null, volume = savedVol;

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

    function getCalendarMonthIdx() {
        const h1 = document.querySelector("h1");
        const title = (h1 ? h1.textContent : "").toLowerCase();
        const months = Array.of("january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december");
        const idx = months.findIndex(m => title.includes(m));
        return idx !== -1 ? idx : (typeof viewMonth === "number" ? viewMonth : new Date().getMonth());
    }

    function getSongMonth(song, idx) {
        return typeof song.month === "number" ? song.month : (idx % 12);
    }

    function getPlaylistIndicesForMonth(mIdx) {
        const songs = window.HOLIDAY_SONGS || [];
        const indices = [];
        songs.forEach((s, idx) => {
            if (getSongMonth(s, idx) === mIdx) indices.push(idx);
        });
        return indices.length ? indices : Array.of(0);
    }

    function getTargetMonth(calMonth) {
        return activePlaylistMonth !== null ? activePlaylistMonth : calMonth;
    }

    function getActiveSongIndex(calMonth) {
        const songs = window.HOLIDAY_SONGS || [];
        if (!songs.length) return 0;
        const targetMonth = getTargetMonth(calMonth);
        const playlist = getPlaylistIndicesForMonth(targetMonth);
        return playlist.at(monthPlaylistPos % playlist.length);
    }

    function advanceTrack(isManualSkip = false) {
        const songs = window.HOLIDAY_SONGS || [];
        if (!songs.length) return;

        if (!isManualSkip && loopSingle) {
            clearTimeout(timerId);
            stepIdx = 0;
            if (onUpdate) onUpdate();
            if (playing && ctx && ctx.state === "running") {
                timerId = setTimeout(scheduleNext, 900);
            }
            return;
        }

        if (shuffleAll && songs.length > 1) {
            const currentIdx = getActiveSongIndex(getCalendarMonthIdx());
            let nextIdx = currentIdx;
            while (nextIdx === currentIdx) {
                nextIdx = Math.floor(Math.random() * songs.length);
            }
            const nextSongObj = songs.at(nextIdx);
            const nextMonth = getSongMonth(nextSongObj, nextIdx);
            const nextMonthList = getPlaylistIndicesForMonth(nextMonth);
            activePlaylistMonth = nextMonth;
            monthPlaylistPos = Math.max(0, nextMonthList.indexOf(nextIdx));
        } else {
            const targetMonth = getTargetMonth(getCalendarMonthIdx());
            const playlist = getPlaylistIndicesForMonth(targetMonth);
            monthPlaylistPos = (monthPlaylistPos + 1) % playlist.length;
        }

        clearTimeout(timerId);
        stepIdx = 0;
        if (ctx && isManualSkip) rebuildBus();
        if (onUpdate) onUpdate();
        if (playing && ctx && ctx.state === "running") {
            timerId = setTimeout(scheduleNext, isManualSkip ? 120 : 900);
        }
    }

    function scheduleNext() {
        if (!playing || !ctx || ctx.state !== "running") return;

        const songs = window.HOLIDAY_SONGS || [];
        const calMonth = getCalendarMonthIdx();

        if (calMonth !== lastMonth) {
            lastMonth = calMonth;
            activePlaylistMonth = null;
            shuffleAll = false;
            loopSingle = false;
            monthPlaylistPos = 0;
            stepIdx = 0;
            if (onUpdate) onUpdate();
        }

        const song = songs.at(getActiveSongIndex(calMonth)) || songs.at(0);
        if (song && Array.isArray(song.notes) && song.notes.length > 0 && stepIdx >= song.notes.length) {
            advanceTrack(false);
            return;
        }

        const waitMs = window.HolidayArranger.playStep(ctx, masterBus, song, stepIdx, () => playing);
        stepIdx++;
        timerId = setTimeout(scheduleNext, waitMs);
    }

    function startWithGesture() {
        initGraph();
        if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
        playing = true;
        clearTimeout(timerId);
        lastMonth = getCalendarMonthIdx();
        if (onUpdate) onUpdate();
        if (ctx && ctx.state === "running") {
            scheduleNext();
        } else {
            timerId = setTimeout(scheduleNext, 80);
        }
    }

    return {
        setListener(fn) { onUpdate = fn; },
        getSongMonth,
        getPlaylistIndicesForMonth,
        getState() {
            const songs = window.HOLIDAY_SONGS || [];
            const calMonth = getCalendarMonthIdx();
            const activeIdx = getActiveSongIndex(calMonth);
            const song = songs.at(activeIdx) || { name: "Holiday Music", ensemble: "Ensemble" };
            const waitingForClick = playing && (!ctx || ctx.state !== "running");
            const isOverridden = (activePlaylistMonth !== null && activePlaylistMonth !== calMonth) || shuffleAll || loopSingle;
            return { playing, waitingForClick, song, activeIdx, shuffleAll, loopSingle, isOverridden, volume };
        },
        setSongIndex(idx) {
            const songs = window.HOLIDAY_SONGS || [];
            const numIdx = Number(idx);
            const chosenSong = songs.at(numIdx);
            if (!chosenSong) return;

            shuffleAll = false;
            const chosenMonth = getSongMonth(chosenSong, numIdx);
            const playlist = getPlaylistIndicesForMonth(chosenMonth);
            activePlaylistMonth = chosenMonth;
            monthPlaylistPos = Math.max(0, playlist.indexOf(numIdx));

            clearTimeout(timerId);
            stepIdx = 0;
            if (ctx) rebuildBus();
            if (onUpdate) onUpdate();
            if (playing && ctx && ctx.state === "running") {
                timerId = setTimeout(scheduleNext, 120);
            }
        },
        resetToCalendarMonth() {
            const calMonth = getCalendarMonthIdx();
            lastMonth = calMonth;
            activePlaylistMonth = null;
            shuffleAll = false;
            loopSingle = false;
            monthPlaylistPos = 0;

            clearTimeout(timerId);
            stepIdx = 0;
            if (ctx) rebuildBus();
            if (onUpdate) onUpdate();
            if (playing && ctx && ctx.state === "running") {
                timerId = setTimeout(scheduleNext, 120);
            }
        },
        nextSong() {
            advanceTrack(true);
        },
        toggleShuffle() {
            shuffleAll = !shuffleAll;
            if (shuffleAll) {
                loopSingle = false;
                advanceTrack(true);
            } else {
                if (onUpdate) onUpdate();
            }
        },
        toggleLoopSingle() {
            loopSingle = !loopSingle;
            if (loopSingle) shuffleAll = false;
            if (onUpdate) onUpdate();
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
            if (userPaused) return;
            playing = true;
            lastMonth = getCalendarMonthIdx();
            if (onUpdate) onUpdate();
        },
        unlockOnGesture() {
            if (userPaused) return;
            if (!ctx || ctx.state !== "running") {
                startWithGesture();
            }
        },
        onMonthChange() {
            const calMonth = getCalendarMonthIdx();
            if (calMonth === lastMonth) return;
            lastMonth = calMonth;
            activePlaylistMonth = null;
            shuffleAll = false;
            loopSingle = false;
            monthPlaylistPos = 0;

            clearTimeout(timerId);
            stepIdx = 0;
            if (ctx) rebuildBus();

            if (onUpdate) onUpdate();
            if (playing && ctx && ctx.state === "running") {
                timerId = setTimeout(scheduleNext, 2500);
            }
        },
        togglePlay() {
            if (playing && ctx && ctx.state === "running") {
                playing = false;
                userPaused = true;
                clearTimeout(timerId);
                rebuildBus();
                if (onUpdate) onUpdate();
            } else {
                userPaused = false;
                startWithGesture();
            }
        }
    };
})();
