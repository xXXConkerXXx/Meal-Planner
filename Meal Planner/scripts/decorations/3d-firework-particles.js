window.FireworkParticles = (function () {
    const MAX_ROCKETS = 32;
    const MAX_BURSTS = 650;
    const MAX_TRAILS = 250;

    let canvas = null, ctx = null, rockets = [], bursts = [], trails = [];
    let pendingTimers = [];
    let lastLaunch = 0, showToggledOn = false, totalLaunched = 0, clusterBusyUntil = 0;

    function isDisabled() {
        return Boolean(window.FireworkAudio && window.FireworkAudio.isMuted());
    }

    function clearPendingTimers() {
        pendingTimers.forEach(id => clearTimeout(id));
        pendingTimers = [];
    }

    function clearAll() {
        clearPendingTimers();
        rockets = [];
        bursts = [];
        trails = [];
        showToggledOn = false;
        totalLaunched = 0;
        clusterBusyUntil = 0;
        if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function ensureCanvas() {
        if (canvas) return;
        canvas = document.createElement("canvas");
        canvas.className = "screen-only";
        canvas.style.cssText = "position: fixed; inset: 0; pointer-events: none; z-index: 4;";
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");
        const fit = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        fit();
        window.addEventListener("resize", fit);
    }

    function explodeAt(x, y, color) {
        if (isDisabled()) return;
        const available = Math.max(0, MAX_BURSTS - bursts.length);
        const sparkCount = Math.min(44, available);
        for (let i = 0; i < sparkCount; i++) {
            const ang = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.14;
            const spd = 1.8 + Math.random() * 3.8;
            bursts.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                alpha: 1,
                size: 2.2 + Math.random() * 1.4,
                color
            });
        }
        if (window.FireworkAudio && canvas) {
            const pan = (x / (canvas.width || 1)) * 2 - 1;
            window.FireworkAudio.playBurstBoom(pan);
        }
    }

    function launchSingle(quietLaunch = false) {
        if (isDisabled() || rockets.length >= MAX_ROCKETS) return;
        ensureCanvas();
        const colors = Array.of("#ff4d4f", "#ffd166", "#4cc9f0", "#ff9f1c", "#c77dff", "#80ed99");
        const color = colors.at(Math.floor(Math.random() * colors.length));
        const normX = 0.12 + Math.random() * 0.76;
        const startX = normX * canvas.width;
        const startY = canvas.height + 6;
        const targetY = (0.12 + Math.random() * 0.32) * canvas.height;

        const gravity = 0.15;
        const dist = Math.max(120, startY - targetY);
        const vy = -Math.sqrt(2 * gravity * dist);
        const vx = (Math.random() - 0.5) * 2.0;
        const climbFrames = Math.abs(vy) / gravity;
        const climbSec = Math.max(0.45, Math.min(1.4, climbFrames / 60));

        rockets.push({ x: startX, y: startY, vx, vy, gravity, color });

        if (!quietLaunch && window.FireworkAudio) {
            window.FireworkAudio.playLaunchSizzle(normX * 2 - 1, climbSec);
        }
    }

    function triggerCluster(count = 25, forceAuto = false) {
        if (isDisabled()) return;
        const now = performance.now();
        if (!forceAuto && now < clusterBusyUntil) return;

        ensureCanvas();
        const durationMs = count * 65 + 450;
        clusterBusyUntil = now + durationMs;

        for (let i = 0; i < count; i++) {
            const tid = setTimeout(() => {
                pendingTimers = pendingTimers.filter(id => id !== tid);
                if (!isDisabled()) launchSingle(i % 3 !== 0);
            }, i * 65);
            pendingTimers.push(tid);
        }
    }

    return {
        clearAll,
        isShowOn: () => showToggledOn && !isDisabled(),
        isClusterBusy: () => performance.now() < clusterBusyUntil,
        toggleShow() {
            if (isDisabled()) return false;
            showToggledOn = !showToggledOn;
            if (showToggledOn) {
                lastLaunch = performance.now();
                totalLaunched = 1;
                launchSingle(false);
            }
            return showToggledOn;
        },
        triggerCluster,
        step(isAutoActive) {
            if (isDisabled()) {
                if (rockets.length || bursts.length || trails.length || showToggledOn || pendingTimers.length) {
                    clearAll();
                }
                return;
            }

            ensureCanvas();
            const nowMs = performance.now();

            if ((isAutoActive || showToggledOn) && nowMs - lastLaunch > 950) {
                lastLaunch = nowMs;
                totalLaunched++;
                if (totalLaunched % 25 === 0) {
                    triggerCluster(25, true);
                } else if (totalLaunched % 8 === 0) {
                    triggerCluster(8, true);
                } else {
                    launchSingle(false);
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Rising rockets + glowing spark trails
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets.at(i);
                r.x += r.vx;
                r.y += r.vy;
                r.vy += r.gravity;

                if (trails.length < MAX_TRAILS) {
                    trails.push({
                        x: r.x + (Math.random() - 0.5) * 2.5,
                        y: r.y + (Math.random() - 0.5) * 2.5,
                        vx: (Math.random() - 0.5) * 0.4,
                        vy: 0.4 + Math.random() * 0.6,
                        alpha: 0.85,
                        size: 1.6 + Math.random() * 1.2
                    });
                }

                ctx.globalAlpha = 1;
                ctx.fillStyle = "#fff3b0";
                ctx.beginPath();
                ctx.arc(r.x, r.y, 3.0, 0, Math.PI * 2);
                ctx.fill();

                if (r.vy >= -0.6) {
                    explodeAt(r.x, r.y, r.color);
                    rockets.splice(i, 1);
                }
            }

            // 2. Fading golden rocket trails
            for (let i = trails.length - 1; i >= 0; i--) {
                const tr = trails.at(i);
                tr.x += tr.vx;
                tr.y += tr.vy;
                tr.alpha -= 0.042;
                if (tr.alpha <= 0) { trails.splice(i, 1); continue; }
                ctx.globalAlpha = tr.alpha;
                ctx.fillStyle = "#ffca3a";
                ctx.beginPath();
                ctx.arc(tr.x, tr.y, tr.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. Explosion burst sparks
            for (let i = bursts.length - 1; i >= 0; i--) {
                const p = bursts.at(i);
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.045;
                p.vx *= 0.985;
                p.alpha -= 0.017;
                if (p.alpha <= 0) { bursts.splice(i, 1); continue; }
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        }
    };
})();
