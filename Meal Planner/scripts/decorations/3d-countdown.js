(function () {
    let wrap = null, fxCanvas = null, fxCtx = null, bursts = [], lastLaunch = 0, testUntil = 0;

    window.addEventListener("pointerdown", () => {
        if (window.FireworkAudio) window.FireworkAudio.unlock();
    }, { once: true });

    function isKitchenModeActive() {
        if (document.body.className.toLowerCase().includes("kitchen")) return true;
        const grid = document.getElementById("calendar-grid");
        if (grid) {
            const w = grid.getBoundingClientRect().width;
            if (w > 0 && w > window.innerWidth * 0.88) return true;
        }
        return false;
    }

    function launchBurst() {
        if (!fxCanvas) return;
        const colors = Array.of("#ff4d4f", "#ffd166", "#4cc9f0", "#ff9f1c", "#c77dff", "#80ed99");
        const color = colors.at(Math.floor(Math.random() * colors.length));
        const normX = 0.18 + Math.random() * 0.64;
        const cx = normX * fxCanvas.width;
        const cy = (0.12 + Math.random() * 0.36) * fxCanvas.height;

        for (let i = 0; i < 48; i++) {
            const ang = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
            const spd = 1.6 + Math.random() * 3.6;
            bursts.push({
                x: cx, y: cy,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                alpha: 1,
                color
            });
        }
        if (window.FireworkAudio) window.FireworkAudio.playLaunchAndBurst(normX * 2 - 1);
    }

    function stepFireworks(active) {
        if (!fxCanvas) {
            fxCanvas = document.createElement("canvas");
            fxCanvas.className = "screen-only";
            fxCanvas.style.cssText = "position: fixed; inset: 0; pointer-events: none; z-index: 4;";
            document.body.appendChild(fxCanvas);
            fxCtx = fxCanvas.getContext("2d");
            const fit = () => { fxCanvas.width = window.innerWidth; fxCanvas.height = window.innerHeight; };
            fit();
            window.addEventListener("resize", fit);
        }

        const nowMs = performance.now();
        if (active && nowMs - lastLaunch > 900) {
            lastLaunch = nowMs;
            launchBurst();
        }

        fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
        for (let i = bursts.length - 1; i >= 0; i--) {
            const p = bursts.at(i);
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.045;
            p.vx *= 0.985;
            p.alpha -= 0.015;
            if (p.alpha <= 0) { bursts.splice(i, 1); continue; }
            fxCtx.globalAlpha = p.alpha;
            fxCtx.fillStyle = p.color;
            fxCtx.beginPath();
            fxCtx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
            fxCtx.fill();
        }
        fxCtx.globalAlpha = 1;
    }

    function buildClockCorner(side) {
        const box = document.createElement("div");
        box.className = `ny-3d-clock ny-clock-${side}`;
        box.style.cssText = `
            position: fixed;
            top: 44px;
            ${side}: 84px;
            width: 156px;
            height: 184px;
            perspective: 650px;
            pointer-events: auto;
            z-index: 5;
        `;

        const body = document.createElement("div");
        body.className = "ny-clock-body";
        body.style.cssText = `
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 18px;
            background: radial-gradient(circle at 35% 30%, #2d261e, #161310);
            border: 3px solid #d4a328;
            box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45), inset 0 0 14px rgba(212, 163, 40, 0.35);
            padding: 10px 8px;
            color: #fdf6e3;
            font-family: Georgia, serif;
            text-align: center;
        `;

        body.innerHTML = `
            <div style="font-size: 0.68rem; font-weight: bold; letter-spacing: 0.8px; color: #f4c95d; text-transform: uppercase;">🎆 New Year 🎆</div>
            <div class="ny-clock-year" style="font-size: 1.05rem; font-weight: bold; color: #ffffff; margin: 2px 0 4px 0;">2027</div>
            <div class="ny-clock-days" style="font-size: 1.25rem; font-weight: bold; color: #ffcf56; line-height: 1.1;">00d</div>
            <div class="ny-clock-hms" style="font-size: 0.82rem; font-family: monospace; color: #f0e6d2; margin-top: 4px; background: rgba(0,0,0,0.35); padding: 3px 6px; border-radius: 6px; border: 1px solid rgba(212,163,40,0.4);">00:00:00</div>
            <div style="display: flex; gap: 6px; margin-top: 7px;">
                <button type="button" class="ny-test-btn" title="Test Fireworks" style="padding: 2px 7px; font-size: 0.68rem; border-radius: 5px; background: #8b261d; color: #fff; border: 1px solid #d4a328; cursor: pointer;">🎆 Show</button>
                <button type="button" class="ny-mute-btn" title="Toggle Sound" style="padding: 2px 7px; font-size: 0.68rem; border-radius: 5px; background: #2d261e; color: #f4c95d; border: 1px solid #d4a328; cursor: pointer;">🔊</button>
            </div>
        `;

        body.querySelector(".ny-test-btn").addEventListener("click", () => {
            if (window.FireworkAudio) window.FireworkAudio.unlock();
            testUntil = performance.now() + 8000;
            launchBurst();
        });
        body.querySelector(".ny-mute-btn").addEventListener("click", () => {
            if (!window.FireworkAudio) return;
            const isMuted = window.FireworkAudio.toggleMute();
            wrap.querySelectorAll(".ny-mute-btn").forEach(btn => { btn.textContent = isMuted ? "🔇" : "🔊"; });
        });

        box.appendChild(body);
        return box;
    }

    function updateCountdownClocks() {
        requestAnimationFrame(updateCountdownClocks);

        const h1 = document.querySelector("h1");
        const title = (h1 ? h1.textContent : "").toLowerCase();
        const isDecOrJan = title.includes("december") || title.includes("january");
        const isKitchen = isKitchenModeActive();

        if (!isDecOrJan || isKitchen) {
            if (wrap) wrap.style.display = "none";
            stepFireworks(false);
            return;
        }

        if (!wrap) {
            wrap = document.createElement("div");
            wrap.id = "ny-countdown-corners";
            wrap.className = "screen-only";
            wrap.appendChild(buildClockCorner("left"));
            wrap.appendChild(buildClockCorner("right"));
            document.body.appendChild(wrap);
        }
        wrap.style.display = "block";

        const now = new Date();
        const isNewYearsDay = now.getMonth() === 0 && now.getDate() === 1;
        const nextYear = isNewYearsDay ? now.getFullYear() : now.getFullYear() + 1;
        const target = new Date(nextYear, 0, 1, 0, 0, 0);
        const diff = isNewYearsDay ? 0 : Math.max(0, target - now);

        const days = Math.floor(diff / 86400000);
        const hrs = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        const pad = n => String(n).padStart(2, "0");

        const t = performance.now() * 0.0014;
        const swingLeft = Math.sin(t) * 22;
        const swingRight = -Math.sin(t) * 22;
        const tiltX = Math.cos(t * 0.8) * 6;

        wrap.querySelectorAll(".ny-3d-clock").forEach(clock => {
            const isLeft = clock.classList.contains("ny-clock-left");
            const body = clock.querySelector(".ny-clock-body");
            if (body) body.style.transform = `rotateY(${isLeft ? swingLeft : swingRight}deg) rotateX(${tiltX}deg)`;

            const yEl = clock.querySelector(".ny-clock-year");
            const dEl = clock.querySelector(".ny-clock-days");
            const hmsEl = clock.querySelector(".ny-clock-hms");
            if (yEl) yEl.textContent = String(nextYear);
            if (dEl) dEl.textContent = isNewYearsDay ? "🎉 HAPPY" : `${days}d`;
            if (hmsEl) hmsEl.textContent = isNewYearsDay ? "NEW YEAR!" : `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
        });

        stepFireworks(isNewYearsDay || performance.now() < testUntil);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", updateCountdownClocks);
    else updateCountdownClocks();
})();
