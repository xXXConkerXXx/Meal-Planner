(function () {
    function syncUI() {
        if (!window.HolidayAudioEngine) return;
        const { playing, song, volume } = window.HolidayAudioEngine.getState();
        const titleEl = document.getElementById("holiday-audio-title");
        const ensEl = document.getElementById("holiday-audio-ensemble");
        const btnEl = document.getElementById("holiday-audio-btn");
        const volIcon = document.getElementById("holiday-vol-icon");
        const volSlider = document.getElementById("holiday-vol-slider");
        const volPct = document.getElementById("holiday-vol-pct");

        if (titleEl) titleEl.textContent = song.name;
        if (ensEl) ensEl.textContent = `• ${song.ensemble}`;
        if (btnEl) btnEl.textContent = playing ? "⏸ Pause" : "▶ Play";

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
            <div style="display: flex; align-items: center; gap: 10px;">
                <button type="button" id="holiday-audio-btn" style="padding: 4px 12px; font-size: 0.78rem; border-radius: 6px;">⏸ Pause</button>
                <span id="holiday-audio-title" style="font-weight: bold; color: var(--text-main);"></span>
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
        pill.querySelector("#holiday-audio-btn").addEventListener("click", () => window.HolidayAudioEngine.togglePlay());
        pill.querySelector("#holiday-vol-slider").addEventListener("input", e => {
            window.HolidayAudioEngine.setVolume(Number(e.target.value) / 100);
        });

        window.HolidayAudioEngine.startAutoplay();
        const unlock = () => window.HolidayAudioEngine.unlockOnGesture();
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
