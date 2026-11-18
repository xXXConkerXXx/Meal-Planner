window.HolidayCountdowns = (function () {
    let wrap = null, lastMonth = -1;

    window.addEventListener("pointerdown", () => window.FireworkAudio?.unlock(), { once: true });

    function tick() {
        requestAnimationFrame(tick);
        if (!window.CountdownTargets || !window.ClockWidget3D) return;

        const currentMonth = window.CoreCalendar?.getViewDate?.()?.month ?? new Date().getMonth();
        if (currentMonth !== lastMonth) {
            lastMonth = currentMonth;
            window.CountdownTargets.resetAuto();
        }

        const enabled = !window.CorePlugins || window.CorePlugins.isEnabled("holiday-countdowns");
        const now = new Date();
        const isKitchen = document.body.classList.contains("kiosk-active");
        const isImmersive = document.body.dataset.immersive3d === "1";
        const isActiveMonth = currentMonth === 11 || currentMonth === 0 || currentMonth === 6;
        const isJuly4Today = now.getMonth() === 6 && now.getDate() === 4;

        if (!enabled || isKitchen || (!isActiveMonth && !isJuly4Today)) {
            if (wrap) wrap.style.display = "none";
            window.FireworkParticles?.step(false);
            return;
        }

        const data = window.CountdownTargets.getData(now, currentMonth);
        const autoFire = (!data.isXmas && data.isCelebrationDay) || isJuly4Today;

        if (isImmersive) {
            if (wrap) wrap.style.display = "none";
            window.FireworkParticles?.step(autoFire);
            return;
        }

        if (!wrap) {
            wrap = document.createElement("div");
            wrap.id = "ny-countdown-corners";
            wrap.className = "screen-only";
            wrap.appendChild(window.ClockWidget3D.createCorner("left"));
            wrap.appendChild(window.ClockWidget3D.createCorner("right"));
            document.body.appendChild(wrap);
        }
        wrap.style.display = "block";
        window.ClockWidget3D.updateAll(wrap, data);
        window.FireworkParticles?.step(autoFire);
    }

    window.CorePlugins?.register({
        id: "holiday-countdowns",
        requires: Array.of("calendar"),
        icon: "🎆",
        title: "Holiday Countdowns & Fireworks",
        description: "Swinging corner clocks and firework shows in Dec, Jan & Jul",
        defaultEnabled: true,
        enable() {},
        disable() { if (wrap) wrap.style.display = "none"; window.FireworkParticles?.clearAll(); }
    });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => requestAnimationFrame(tick));
    else requestAnimationFrame(tick);
})();
