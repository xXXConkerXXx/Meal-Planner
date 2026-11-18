(function () {
    const MONTH_NAMES = Array.of("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

    function populateSongOptions(selectEl) {
        if (!selectEl) return;
        const songs = window.HOLIDAY_SONGS || [];
        if (selectEl.dataset.songCount === String(songs.length) && songs.length > 0) return;

        const byMonth = Array.from({ length: 12 }, () => []);
        songs.forEach((s, idx) => {
            const mIdx = window.HolidayAudioEngine?.getSongMonth ? window.HolidayAudioEngine.getSongMonth(s, idx) : (idx % 12);
            if (byMonth.at(mIdx)) byMonth.at(mIdx).push({ song: s, idx });
        });

        selectEl.innerHTML = byMonth.map((entries, mIdx) => {
            if (!entries.length) return "";
            const opts = entries.map(({ song, idx }) => `<option value="${idx}">${song.name}</option>`).join("");
            return `<optgroup label="${MONTH_NAMES.at(mIdx)}">${opts}</optgroup>`;
        }).join("");

        selectEl.dataset.songCount = String(songs.length);
    }

    function syncUI() {
        if (!window.HolidayAudioEngine) return;
        const { playing, waitingForClick, song, activeIdx, shuffleAll, loopSingle, isOverridden, volume } = window.HolidayAudioEngine.getState();
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
            if (document.activeElement !== selectEl) {
                selectEl.value = String(activeIdx);
            }
        }
        if (ensEl) ensEl.textContent = `• ${song.ensemble}`;
        if (btnEl) {
            btnEl.textContent = waitingForClick ? "🔊 Click to Start" : (playing ? "⏸ Pause" : "▶ Play");
        }
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
        pill.style.cssText = `
            max-width: 1100px;
            margin: 14px auto 4px auto;
            padding: 7px 14px;
            border-radius: 8px;
            background: var(--bg-card);
            color: var(--text-main);
            border: 1px solid var(--border-color);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.14);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            font-family: Georgia, serif;
            font-size: 0.84rem;
        `;

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

        const preview = document.getElementById("preview-view");
        if (preview) preview.appendChild(pill);
        else document.body.appendChild(pill);

        window.HolidayAudioEngine.setListener(syncUI);
        pill.querySelector("#holiday-audio-btn").addEventListener("click", () => {
            const { waitingForClick } = window.HolidayAudioEngine.getState();
            if (waitingForClick) {
                window.HolidayAudioEngine.unlockOnGesture();
                syncUI();
            } else {
                window.HolidayAudioEngine.togglePlay();
            }
        });
        pill.querySelector("#holiday-next-btn").addEventListener("click", () => {
            window.HolidayAudioEngine.unlockOnGesture();
            window.HolidayAudioEngine.nextSong();
        });
        pill.querySelector("#holiday-loop-btn").addEventListener("click", () => {
            window.HolidayAudioEngine.unlockOnGesture();
            window.HolidayAudioEngine.toggleLoopSingle();
        });
        pill.querySelector("#holiday-shuffle-btn").addEventListener("click", () => {
            window.HolidayAudioEngine.unlockOnGesture();
            window.HolidayAudioEngine.toggleShuffle();
        });
        pill.querySelector("#holiday-reset-month-btn").addEventListener("click", () => {
            window.HolidayAudioEngine.unlockOnGesture();
            window.HolidayAudioEngine.resetToCalendarMonth();
        });
        pill.querySelector("#holiday-song-select").addEventListener("change", e => {
            window.HolidayAudioEngine.unlockOnGesture();
            window.HolidayAudioEngine.setSongIndex(Number(e.target.value));
        });
        pill.querySelector("#holiday-vol-slider").addEventListener("input", e => {
            window.HolidayAudioEngine.setVolume(Number(e.target.value) / 100);
        });

        window.HolidayAudioEngine.startAutoplay();
        const unlock = () => {
            window.HolidayAudioEngine.unlockOnGesture();
            setTimeout(syncUI, 60);
        };
        window.addEventListener("pointerdown", unlock, { passive: true });
        window.addEventListener("keydown", unlock, { passive: true });
        syncUI();

        const h1 = document.querySelector("h1");
        if (h1) {
            new MutationObserver(() => {
                window.HolidayAudioEngine.onMonthChange();
                syncUI();
            }).observe(h1, { childList: true, characterData: true, subtree: true });
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountPlayer);
    else mountPlayer();
})();
