(function () {
    let wrap = null, lastMonthTitle = "";

    window.addEventListener("pointerdown", () => window.FireworkAudio?.unlock(), { once: true });

    function isKitchenModeActive() {
        if (document.body.className.toLowerCase().includes("kitchen")) return true;
        const grid = document.getElementById("calendar-grid");
        return grid ? grid.getBoundingClientRect().width > window.innerWidth * 0.88 : false;
    }

    function handleMute() {
        if (!window.FireworkAudio || !wrap) return;
        const isMuted = window.FireworkAudio.toggleMute();
        if (isMuted) window.FireworkParticles?.clearAll();
        wrap.querySelectorAll(".ny-mute-btn").forEach(btn => {
            btn.textContent = isMuted ? "🔇" : "🔊";
        });
    }

    function tick() {
        requestAnimationFrame(tick);
        if (!window.CountdownTargets || !window.ClockWidget3D || !window.FireworkParticles) return;

        const now = new Date();
        const title = (document.querySelector("h1")?.textContent || "").toLowerCase();
        if (title !== lastMonthTitle) {
            lastMonthTitle = title;
            window.CountdownTargets.resetAuto();
        }

        const isKitchen = isKitchenModeActive();
        const isImmersive = document.body.dataset.immersive3d === "1";
        const isActiveMonth = title.includes("december") || title.includes("january") || title.includes("july");
        const isJuly4Today = now.getMonth() === 6 && now.getDate() === 4;

        if (isKitchen || (!isActiveMonth && !isJuly4Today)) {
            if (wrap) wrap.style.display = "none";
            window.FireworkParticles.step(false);
            return;
        }

        const data = window.CountdownTargets.getData(now, title);

        if (isImmersive) {
            if (wrap) wrap.style.display = "none";
            window.FireworkParticles.step((!data.isXmas && data.isCelebrationDay) || isJuly4Today);
            return;
        }

        if (!wrap) {
            wrap = document.createElement("div");
            wrap.id = "ny-countdown-corners";
            wrap.className = "screen-only";
            wrap.appendChild(window.ClockWidget3D.createCorner("left", handleMute));
            wrap.appendChild(window.ClockWidget3D.createCorner("right", handleMute));
            document.body.appendChild(wrap);
        }
        wrap.style.display = "block";

        window.ClockWidget3D.updateAll(wrap, data);
        window.FireworkParticles.step((!data.isXmas && data.isCelebrationDay) || isJuly4Today);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
    else tick();
})();
