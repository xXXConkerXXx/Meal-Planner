window.ClockWidget3D = {
    createCorner(side) {
        const isMuted = window.FireworkAudio?.isMuted() || false;
        const box = document.createElement("div");
        box.className = `ny-3d-clock ny-clock-${side}`;
        box.style.cssText = `position: fixed; top: 44px; ${side}: 84px; width: 184px; height: 210px; perspective: 650px; pointer-events: auto; z-index: 5;`;
        box.innerHTML = `
            <div class="ny-clock-body" style="width: 100%; height: 100%; transform-style: preserve-3d; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 18px; border: 3px solid #d4a328; box-shadow: 0 10px 24px rgba(0,0,0,0.45), inset 0 0 14px rgba(212,163,40,0.35); padding: 8px; color: #fdf6e3; font-family: Georgia, serif; text-align: center;">
                <div class="ny-mode-tabs" style="display: flex; gap: 4px; margin-bottom: 5px;">
                    <button type="button" data-mode="xmas" class="ny-mode-btn" style="padding: 2px 6px; font-size: 0.64rem; border-radius: 5px; border: 1px solid #d4a328; cursor: pointer;">🎄 Xmas</button>
                    <button type="button" data-mode="ny" class="ny-mode-btn" style="padding: 2px 6px; font-size: 0.64rem; border-radius: 5px; border: 1px solid #d4a328; cursor: pointer;">🎆 New Yr</button>
                </div>
                <div class="ny-clock-heading" style="font-size: 0.66rem; font-weight: bold; letter-spacing: 0.6px; color: #f4c95d; text-transform: uppercase;"></div>
                <div class="ny-clock-year" style="font-size: 0.98rem; font-weight: bold; color: #ffffff; margin: 1px 0 3px 0;"></div>
                <div class="ny-clock-days" style="font-size: 1.22rem; font-weight: bold; color: #ffcf56; line-height: 1.1;"></div>
                <div class="ny-clock-hms" style="font-size: 0.80rem; font-family: monospace; color: #f0e6d2; margin-top: 4px; background: rgba(0,0,0,0.35); padding: 3px 6px; border-radius: 6px; border: 1px solid rgba(212,163,40,0.4);"></div>
                <div style="display: flex; gap: 3px; margin-top: 6px; flex-wrap: wrap; justify-content: center;">
                    <button type="button" class="ny-test-btn" style="padding: 2px 5px; font-size: 0.62rem; border-radius: 5px; background: #8b261d; color: #fff; border: 1px solid #d4a328; cursor: pointer;">🎆 Show</button>
                    <button type="button" class="ny-c8-btn" style="padding: 2px 5px; font-size: 0.62rem; border-radius: 5px; background: #9c5a14; color: #fff; border: 1px solid #d4a328; cursor: pointer;">✨ x8</button>
                    <button type="button" class="ny-c25-btn" style="padding: 2px 5px; font-size: 0.62rem; border-radius: 5px; background: #b85d19; color: #fff; border: 1px solid #d4a328; cursor: pointer;">💥 x25</button>
                    <button type="button" class="ny-mute-btn" style="padding: 2px 5px; font-size: 0.62rem; border-radius: 5px; background: #2d261e; color: #f4c95d; border: 1px solid #d4a328; cursor: pointer;">${isMuted ? "🔇" : "🔊"}</button>
                </div>
            </div>
        `;
        box.querySelectorAll(".ny-mode-btn").forEach(b => b.addEventListener("click", () => window.CountdownTargets?.setMode(b.dataset.mode)));
        box.querySelector(".ny-test-btn").addEventListener("click", () => { window.FireworkAudio?.unlock(); window.FireworkParticles?.toggleShow(); });
        box.querySelector(".ny-c8-btn").addEventListener("click", () => { window.FireworkAudio?.unlock(); window.FireworkParticles?.triggerCluster(8); });
        box.querySelector(".ny-c25-btn").addEventListener("click", () => { window.FireworkAudio?.unlock(); window.FireworkParticles?.triggerCluster(25); });
        box.querySelector(".ny-mute-btn").addEventListener("click", () => { if (window.FireworkAudio?.toggleMute()) window.FireworkParticles?.clearAll(); });
        return box;
    },

    updateAll(wrap, data) {
        const t = performance.now() * 0.0014;
        const swingL = Math.sin(t) * 22, swingR = -Math.sin(t) * 22, tiltX = Math.cos(t * 0.8) * 6;
        const isMuted = window.FireworkAudio?.isMuted() || false;
        const isShowOn = window.FireworkParticles?.isShowOn() || false;
        const bg = data.isXmas ? "radial-gradient(circle at 35% 30%, #1b4d2e, #0d2818)" : (data.isJuly4 ? "radial-gradient(circle at 35% 30%, #1d2b4a, #0f172a)" : "radial-gradient(circle at 35% 30%, #2e1a47, #160c24)");

        wrap.querySelectorAll(".ny-3d-clock").forEach(clock => {
            const isLeft = clock.classList.contains("ny-clock-left");
            const body = clock.querySelector(".ny-clock-body");
            if (body) { body.style.transform = `rotateY(${isLeft ? swingL : swingR}deg) rotateX(${tiltX}deg)`; body.style.background = bg; }
            const tabs = clock.querySelector(".ny-mode-tabs");
            if (tabs) tabs.style.display = data.showModeTabs ? "flex" : "none";
            clock.querySelectorAll(".ny-mode-btn").forEach(b => {
                const active = b.dataset.mode === data.mode;
                b.style.background = active ? (data.isXmas ? "#8b261d" : "#5b2a86") : "rgba(0,0,0,0.35)";
                b.style.color = active ? "#fff" : "#cfc3ae";
            });
            const showBtn = clock.querySelector(".ny-test-btn");
            if (showBtn) { showBtn.style.background = isShowOn ? "#1b6b3a" : "#8b261d"; showBtn.textContent = isShowOn ? "⏹ Stop" : "🎆 Show"; }
            const muteBtn = clock.querySelector(".ny-mute-btn");
            if (muteBtn) muteBtn.textContent = isMuted ? "🔇" : "🔊";
            clock.querySelector(".ny-clock-heading").textContent = data.headingText;
            clock.querySelector(".ny-clock-year").textContent = data.subLabel;
            clock.querySelector(".ny-clock-days").textContent = data.daysDisplay;
            clock.querySelector(".ny-clock-hms").textContent = data.hmsDisplay;
        });
    }
};
