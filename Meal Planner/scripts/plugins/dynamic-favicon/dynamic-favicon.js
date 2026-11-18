window.DynamicFavicon = (function () {
    let lastMonth = -1;

    function setFaviconCanvas(canvas) {
        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
        }
        link.type = "image/png";
        link.href = canvas.toDataURL("image/png");
    }

    function drawDefaultCalendarIcon() {
        lastMonth = -1;
        const c = document.createElement("canvas");
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext("2d");

        ctx.fillStyle = "#fdf8f0";
        ctx.beginPath();
        ctx.roundRect(4, 6, 56, 54, 12);
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#5c5652";
        ctx.stroke();

        ctx.fillStyle = "#8b261d";
        ctx.beginPath();
        ctx.roundRect(4, 6, 56, 17,);
        ctx.fill();

        ctx.fillStyle = "#2c1e16";
        ctx.fillRect(18, 2, 5, 9);
        ctx.fillRect(41, 2, 5, 9);

        ctx.fillStyle = "#5c5652";
        Array.of(18, 32, 46).forEach(x => {
            Array.of(34, 47).forEach(y => {
                ctx.beginPath();
                ctx.arc(x, y, 3.2, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        setFaviconCanvas(c);
    }

    function drawHolidayIcon(ctx, mIdx) {
        ctx.fillStyle = "#261f1a";
        ctx.beginPath();
        ctx.roundRect(2, 2, 60, 60, 14);
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = "#d4a328";
        ctx.stroke();

        ctx.save();
        ctx.translate(32, 32);

        if (mIdx === 0 || mIdx === 6) {
            ctx.rotate(-0.45);
            ctx.fillStyle = "#e63946";
            ctx.fillRect(-7, -10, 14, 24);
            ctx.fillStyle = "#f8f9fa";
            ctx.fillRect(-7, -4, 14, 5);
            ctx.fillRect(-7, 6, 14, 5);
            ctx.fillStyle = "#ffb703";
            ctx.beginPath();
            ctx.moveTo(0, -23); ctx.lineTo(-11, -10); ctx.lineTo(11, -10);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffd166";
            ctx.beginPath();
            ctx.arc(0, 19, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (mIdx === 1) {
            ctx.fillStyle = "#e63963";
            ctx.beginPath();
            ctx.moveTo(0, 18);
            ctx.bezierCurveTo(-24, 2, -22, -18, -8, -18);
            ctx.bezierCurveTo(-2, -18, 0, -12, 0, -10);
            ctx.bezierCurveTo(0, -12, 2, -18, 8, -18);
            ctx.bezierCurveTo(22, -18, 24, 2, 0, 18);
            ctx.fill();
        } else if (mIdx === 2) {
            ctx.fillStyle = "#2e9e4b";
            for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2 + Math.PI / 4;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * 9, Math.sin(a) * 9, 9.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.strokeStyle = "#1f7a38";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(0, 8); ctx.quadraticCurveTo(2, 18, 7, 22);
            ctx.stroke();
        } else if (mIdx === 3) {
            ctx.fillStyle = "#b589f2";
            ctx.beginPath();
            ctx.ellipse(0, 2, 15, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffd166";
            ctx.fillRect(-14, -1, 28, 5);
            ctx.fillStyle = "#ff758f";
            Array.of(-7, 0, 7).forEach(x => {
                ctx.beginPath();
                ctx.arc(x, -9, 2.3, 0, Math.PI * 2);
                ctx.arc(x, 11, 2.3, 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (mIdx === 4 || mIdx === 7) {
            ctx.fillStyle = "#f472b6";
            for (let i = 0; i < 6; i++) {
                const a = (i * Math.PI) / 3;
                ctx.beginPath();
                ctx.arc(Math.cos(a) * 11, Math.sin(a) * 11, 8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (mIdx === 5) {
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3;
            for (let i = 0; i < 10; i++) {
                const a = (i * Math.PI) / 5;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
                ctx.lineTo(Math.cos(a) * 21, Math.sin(a) * 21);
                ctx.stroke();
            }
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.fill();
        } else if (mIdx === 8) {
            ctx.fillStyle = "#d99345";
            ctx.beginPath();
            ctx.ellipse(0, 5, 13, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#6e3f1d";
            ctx.beginPath();
            ctx.ellipse(0, -5, 15, 8, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(-2.5, -18, 5, 6);
        } else if (mIdx === 9) {
            ctx.fillStyle = "#2d7a36";
            ctx.fillRect(-3, -21, 6, 7);
            ctx.fillStyle = "#f26a1b";
            ctx.beginPath();
            ctx.ellipse(0, 3, 19, 15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffe033";
            ctx.beginPath();
            ctx.moveTo(-8, -1); ctx.lineTo(-4, -1); ctx.lineTo(-6, -5);
            ctx.moveTo(8, -1); ctx.lineTo(4, -1); ctx.lineTo(6, -5);
            ctx.fill();
            ctx.fillRect(-8, 6, 16, 3);
        } else if (mIdx === 10) {
            const cols = Array.of("#d95d1e", "#f2b71f", "#c92a2a", "#f2b71f", "#d95d1e");
            cols.forEach((c, i) => {
                const a = (i - 2) * 0.42 - Math.PI / 2;
                ctx.fillStyle = c;
                ctx.beginPath();
                ctx.ellipse(Math.cos(a) * 11, Math.sin(a) * 11 + 2, 5, 13, a + Math.PI / 2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.fillStyle = "#7a411f";
            ctx.beginPath();
            ctx.arc(0, 8, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, -2, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f59f00";
            ctx.beginPath();
            ctx.moveTo(-3, -2); ctx.lineTo(3, -2); ctx.lineTo(0, 3);
            ctx.fill();
        } else {
            ctx.fillStyle = "#6e4222";
            ctx.fillRect(-4, 13, 8, 8);
            ctx.fillStyle = "#208c47";
            ctx.beginPath();
            ctx.moveTo(0, -16); ctx.lineTo(-17, 14); ctx.lineTo(17, 14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#ffd12e";
            ctx.beginPath();
            ctx.arc(0, -17, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(-5, 4, 2.5, 0, Math.PI * 2);
            ctx.arc(6, 9, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    function update(mIdx) {
        if (window.CorePlugins && !window.CorePlugins.isEnabled("dynamic-favicon")) return;
        const month = typeof mIdx === "number" ? mIdx : (window.CoreCalendar?.getViewDate?.().month ?? new Date().getMonth());
        if (month === lastMonth) return;
        lastMonth = month;

        const c = document.createElement("canvas");
        c.width = 64;
        c.height = 64;
        drawHolidayIcon(c.getContext("2d"), month);
        setFaviconCanvas(c);
    }

    window.CoreBus?.on("calendar:monthChanged", info => update(info?.month));

    window.CorePlugins?.register({
        id: "dynamic-favicon",
        requires: Array.of("calendar"),
        icon: "🗓️",
        title: "Seasonal Tab Icon",
        description: "Updates the browser tab icon to match each month",
        defaultEnabled: true,
        enable() { lastMonth = -1; update(); },
        disable() { drawDefaultCalendarIcon(); }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            if (!window.CorePlugins || window.CorePlugins.isEnabled("dynamic-favicon")) update();
        });
    } else if (!window.CorePlugins || window.CorePlugins.isEnabled("dynamic-favicon")) {
        update();
    }

    return { update };
})();
