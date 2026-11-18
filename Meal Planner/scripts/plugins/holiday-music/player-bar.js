(function () {
    const MONTH_NAMES = Array.of("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

    function populateSongOptions(selectEl) {
        if (!selectEl || !window.HOLIDAY_SONGS) return;
        const total = Object.values(window.HOLIDAY_SONGS).reduce((acc, arr) => acc + (arr?.length || 0), 0);
        if (selectEl.dataset.songCount === String(total) && total > 0) return;

        selectEl.innerHTML = MONTH_NAMES.map((mName, mIdx) => {
            const list = window.HOLIDAY_SONGS[mIdx] || [];
            if (!list.length) return "";
            const opts = list.map((song, pos) => `<option value="${mIdx}:${pos}">${song.name}</option>`).join("");
            return `<optgroup label="${mName}">${opts}</optgroup>`;
        }).join("");

        selectEl.dataset.songCount = String(total);
    }

    function syncUI() {
        if (!window.HolidayAudioEngine) return;
        const { playing, waitingForClick, song, activeKey, shuffleAll, loopSingle, isOverridden, volume } = window.HolidayAudioEngine.getState();
        const selectEl = document.getElementById("holiday-song-select");
        const ensEl = document.getElementById("holiday-audio-ensemble");
        const btnEl = document.getElementById("holiday-audio-btn");
        const loopEl = document.getElementById("holiday-loop-btn");
        const shufEl = document.getElementById("holiday-shuffle-btn");
        const resetEl = document.getElementById("holiday-reset-month-btn");
        const volIcon = document.getElementById("holiday-vol-icon");
        const volSlider = document.getElementById("holiday-vol-slider");
        const volPct = document.getElementById("holiday-vol-pct");

        if (selectEl) {
            populateSongOptions(selectEl);
            if (document.activeElement !== selectEl) selectEl.value = activeKey;
        }
        if (ensEl) ensEl.textContent = `• ${song.ensemble}`;
        if (btnEl) btnEl.textContent = waitingForClick ? "🔊 Click to Start" : (playing ? "⏸ Pause" : "▶ Play");
        if (loopEl) {
            loopEl.className = loopSingle ? "btn-green" : "btn-outline";
            loopEl.title = loopSingle ? "Repeat Current Song: ON" : "Repeat Current Song: OFF";
        }
        if (shufEl) {
            shufEl.className = shuffleAll ? "btn-green" : "btn-outline";
            shufEl.title = shuffleAll ? "Shuffle All Months: ON" : "Shuffle All Months: OFF";
        }
        if (resetEl) {
            resetEl.className = isOverridden ? "btn-green" : "btn-outline";
            resetEl.style.opacity = isOverridden ? "1" : "0.75";
        }

        const pct = Math.round(volume * 100);
        if (volIcon) volIcon.textContent = pct === 0 ? "🔇" : (pct < 45 ? "🔉" : "🔊");
        if (volSlider && document.activeElement !== volSlider) volSlider.value = String(pct);
        if (volPct) volPct.textContent = `${pct}%`;
    }

    function mountPlayer() {
        if (document.getElementById("holiday-audio-pill") || !window.HolidayAudioEngine) return;

        const pill = document.createElement("div");
        pill.id = "holiday-audio-pill";
        pill.className = "screen-only";
        pill.style.cssText = "position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 20; padding: 7px 14px; border-radius: 8px; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-family: Georgia, serif; font-size: 0.84rem; max-width: calc(100vw - 240px);";

        pill.innerHTML = `
            <div style="display: flex; align-items: center; gap: 7px; flex-wrap: wrap;">
                <button type="button" id="holiday-audio-btn" style="padding: 4px 12px; font-size: 0.78rem; border-radius: 6px;">🔊 Click to Start</button>
                <button type="button" id="holiday-next-btn" title="Next Song" style="padding: 4px 9px; font-size: 0.78rem; border-radius: 6px;">⏭</button>
                <button type="button" id="holiday-loop-btn" class="btn-outline" title="Repeat Current Song" style="padding: 4px 9px; font-size: 0.78rem; border-radius: 6px;">🔂</button>
                <button type="button" id="holiday-shuffle-btn" class="btn-outline" title="Shuffle All Months" style="padding: 4px 9px; font-size: 0.78rem; border-radius: 6px;">🔀</button>
                <button type="button" id="holiday-reset-month-btn" class="btn-outline" title="Reset Music to Active Calendar Month" style="padding: 4px 9px; font-size: 0.78rem; border-radius: 6px;">📅</button>
                <select id="holiday-song-select" title="Choose Song (Plays that month's playlist)" style="padding: 4px 8px; font-size: 0.80rem; font-weight: bold; border-radius: 6px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); font-family: inherit; cursor: pointer;"></select>
                <span id="holiday-audio-ensemble" style="font-style: italic; color: var(--text-muted); font-size: 0.78rem;"></span>
            </div>
            <div style="display: flex; align-items: center; gap: 7px;">
                <span id="holiday-vol-icon" style="font-size: 0.9rem;">🔊</span>
                <input type="range" id="holiday-vol-slider" min="0" max="100" value="75" title="Music Volume" style="width: 92px; margin: 0; accent-color: var(--primary); cursor: pointer;">
                <span id="holiday-vol-pct" style="font-size: 0.76rem; color: var(--text-muted); min-width: 34px; text-align: right;">75%</span>
            </div>
        `;

        document.body.appendChild(pill);
        window.HolidayAudioEngine.setListener(syncUI);

        pill.querySelector("#holiday-audio-btn").addEventListener("click", () => {
            const { waitingForClick } = window.HolidayAudioEngine.getState();
            if (waitingForClick) { window.HolidayAudioEngine.unlockOnGesture(); syncUI(); }
            else window.HolidayAudioEngine.togglePlay();
        });
        pill.querySelector("#holiday-next-btn").addEventListener("click", () => { window.HolidayAudioEngine.unlockOnGesture(); window.HolidayAudioEngine.nextSong(); });
        pill.querySelector("#holiday-loop-btn").addEventListener("click", () => { window.HolidayAudioEngine.unlockOnGesture(); window.HolidayAudioEngine.toggleLoopSingle(); });
        pill.querySelector("#holiday-shuffle-btn").addEventListener("click", () => { window.HolidayAudioEngine.unlockOnGesture(); window.HolidayAudioEngine.toggleShuffle(); });
        pill.querySelector("#holiday-reset-month-btn").addEventListener("click", () => { window.HolidayAudioEngine.unlockOnGesture(); window.HolidayAudioEngine.resetToCalendarMonth(); });
        pill.querySelector("#holiday-song-select").addEventListener("change", e => { window.HolidayAudioEngine.unlockOnGesture(); window.HolidayAudioEngine.selectSong(e.target.value); });
        pill.querySelector("#holiday-vol-slider").addEventListener("input", e => window.HolidayAudioEngine.setVolume(Number(e.target.value) / 100));

        window.HolidayAudioEngine.startAutoplay();
        const unlock = () => { window.HolidayAudioEngine.unlockOnGesture(); setTimeout(syncUI, 60); };
        window.addEventListener("pointerdown", unlock, { passive: true });
        window.addEventListener("keydown", unlock, { passive: true });
        syncUI();

        window.CorePlugins?.register({
            id: "holiday-music",
            requires: Array.of("calendar"),
            icon: "🎵",
            title: "Holiday Ensemble Music",
            description: "Monthly seasonal Web Audio ensemble & playlist player",
            defaultEnabled: true,
            enable() { pill.style.display = "flex"; syncUI(); },
            disable() { window.HolidayAudioEngine.pause(); pill.style.display = "none"; }
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPlayer);
    else mountPlayer();
})();
