window.HolidayAudioEngine = (function () {
    const store = window.CoreStore.createNamespace("music", { volume: 0.75 });
    let playing = false, userPaused = false, stepIdx = 0, timerId = null, lastMonth = -1;
    let activePlaylistMonth = null, monthPlaylistPos = 0, shuffleAll = false, loopSingle = false;
    let onUpdate = null, volume = store.get("volume", 0.75);

    const getCalendarMonthIdx = () => window.CoreCalendar?.getViewDate?.()?.month ?? new Date().getMonth();
    const isPluginEnabled = () => !window.CorePlugins || window.CorePlugins.isEnabled("holiday-music");
    const getMonthSongs = mIdx => (window.HOLIDAY_SONGS && window.HOLIDAY_SONGS[mIdx]) || [];

    function getActiveSong(calMonth) {
        const targetMonth = activePlaylistMonth !== null ? activePlaylistMonth : calMonth;
        const list = getMonthSongs(targetMonth);
        const pos = list.length ? (monthPlaylistPos % list.length) : 0;
        return { song: list.at(pos) || { name: "Holiday Music", ensemble: "Ensemble" }, month: targetMonth, pos };
    }

    function advanceTrack(isManualSkip = false) {
        const calMonth = getCalendarMonthIdx();
        const targetMonth = activePlaylistMonth !== null ? activePlaylistMonth : calMonth;
        const list = getMonthSongs(targetMonth);
        if (!list.length) return;

        if (!isManualSkip && loopSingle) {
            clearTimeout(timerId);
            stepIdx = 0;
            window.HolidayAudioBus?.rebuild(volume);
            if (onUpdate) onUpdate();
            if (playing && isPluginEnabled() && window.HolidayAudioBus?.isRunning()) {
                timerId = setTimeout(scheduleNext, 900);
            }
            return;
        }

        if (shuffleAll) {
            const allMonths = Object.keys(window.HOLIDAY_SONGS || {}).map(Number).filter(m => getMonthSongs(m).length > 0);
            if (allMonths.length) {
                const randM = allMonths.at(Math.floor(Math.random() * allMonths.length));
                const randList = getMonthSongs(randM);
                activePlaylistMonth = randM;
                monthPlaylistPos = Math.floor(Math.random() * randList.length);
            }
        } else {
            monthPlaylistPos = (monthPlaylistPos + 1) % list.length;
        }

        clearTimeout(timerId);
        stepIdx = 0;
        window.HolidayAudioBus?.rebuild(volume);
        if (onUpdate) onUpdate();
        if (playing && isPluginEnabled() && window.HolidayAudioBus?.isRunning()) {
            timerId = setTimeout(scheduleNext, isManualSkip ? 120 : 900);
        }
    }

    function scheduleNext() {
        const bus = window.HolidayAudioBus;
        if (!playing || !isPluginEnabled() || !bus || !bus.isRunning()) return;

        const calMonth = getCalendarMonthIdx();
        if (calMonth !== lastMonth) {
            onMonthChange();
            return;
        }

        const { song } = getActiveSong(calMonth);
        if (song && Array.isArray(song.notes) && song.notes.length > 0 && stepIdx >= song.notes.length) {
            advanceTrack(false);
            return;
        }

        const waitMs = window.HolidayArranger.playStep(bus.getContext(), bus.getBus(), song, stepIdx, () => playing && isPluginEnabled());
        stepIdx++;
        timerId = setTimeout(scheduleNext, waitMs);
    }

    function startWithGesture() {
        if (!isPluginEnabled()) return;
        const bus = window.HolidayAudioBus;
        if (!bus) return;
        bus.init();
        bus.resume();
        playing = true;
        clearTimeout(timerId);
        lastMonth = getCalendarMonthIdx();
        bus.rebuild(volume);
        if (onUpdate) onUpdate();
        timerId = setTimeout(scheduleNext, bus.isRunning() ? 0 : 80);
    }

    function onMonthChange() {
        const calMonth = getCalendarMonthIdx();
        if (calMonth === lastMonth) return;
        lastMonth = calMonth;
        activePlaylistMonth = null;
        shuffleAll = false;
        loopSingle = false;
        monthPlaylistPos = 0;

        clearTimeout(timerId);
        stepIdx = 0;
        window.HolidayAudioBus?.rebuild(volume);
        if (onUpdate) onUpdate();
        if (playing && isPluginEnabled() && window.HolidayAudioBus?.isRunning()) {
            timerId = setTimeout(scheduleNext, 2500);
        }
    }

    window.CoreBus?.on("calendar:monthChanged", onMonthChange);

    return {
        setListener(fn) { onUpdate = fn; },
        getMonthSongs,
        getState() {
            const calMonth = getCalendarMonthIdx();
            const { song, month, pos } = getActiveSong(calMonth);
            const waitingForClick = playing && !window.HolidayAudioBus?.isRunning();
            const isOverridden = (activePlaylistMonth !== null && activePlaylistMonth !== calMonth) || shuffleAll || loopSingle;
            return { playing, waitingForClick, song, activeKey: `${month}:${pos}`, shuffleAll, loopSingle, isOverridden, volume };
        },
        selectSong(key) {
            const [mStr, pStr] = String(key).split(":");
            activePlaylistMonth = Number(mStr);
            monthPlaylistPos = Number(pStr) || 0;
            shuffleAll = false;
            clearTimeout(timerId);
            stepIdx = 0;
            window.HolidayAudioBus?.rebuild(volume);
            if (onUpdate) onUpdate();
            if (playing && isPluginEnabled() && window.HolidayAudioBus?.isRunning()) {
                timerId = setTimeout(scheduleNext, 120);
            }
        },
        resetToCalendarMonth() {
            lastMonth = -1;
            onMonthChange();
        },
        nextSong() { advanceTrack(true); },
        toggleShuffle() {
            shuffleAll = !shuffleAll;
            if (shuffleAll) { loopSingle = false; advanceTrack(true); }
            else if (onUpdate) onUpdate();
        },
        toggleLoopSingle() {
            loopSingle = !loopSingle;
            if (loopSingle) shuffleAll = false;
            if (onUpdate) onUpdate();
        },
        setVolume(val) {
            volume = Math.max(0, Math.min(1, Number(val)));
            store.set("volume", volume);
            window.HolidayAudioBus?.setGain(volume);
            if (onUpdate) onUpdate();
        },
        startAutoplay() {
            if (userPaused || !isPluginEnabled()) return;
            playing = true;
            lastMonth = getCalendarMonthIdx();
            if (onUpdate) onUpdate();
        },
        unlockOnGesture() {
            if (userPaused || !isPluginEnabled()) return;
            if (!window.HolidayAudioBus?.isRunning()) startWithGesture();
        },
        pause() {
            playing = false;
            clearTimeout(timerId);
            window.HolidayAudioBus?.rebuild(volume);
            if (onUpdate) onUpdate();
        },
        togglePlay() {
            if (playing && window.HolidayAudioBus?.isRunning()) {
                userPaused = true;
                this.pause();
            } else {
                userPaused = false;
                startWithGesture();
            }
        }
    };
})();
