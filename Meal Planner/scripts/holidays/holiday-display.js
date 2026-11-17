(function () {
    function getEaster(y) {
        const a = y % 19, b = Math.floor(y / 100), c = y % 100;
        const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
    }

    function nthWeekday(y, m, wd, n) {
        const first = new Date(y, m, 1).getDay();
        return 1 + ((wd - first + 7) % 7) + (n - 1) * 7;
    }

    function lastWeekday(y, m, wd) {
        const last = new Date(y, m + 1, 0).getDate();
        const day = new Date(y, m, last).getDay();
        return last - ((day - wd + 7) % 7);
    }

    const RULES = Array.of(
        { icon: "🎆", name: "New Year's Day", color: "#c99a2e", fn: () => Array.of(0, 1) },
        { icon: "🕊️", name: "MLK Jr. Day", color: "#4a6fa5", fn: y => Array.of(0, nthWeekday(y, 0, 1, 3)) },
        { icon: "❤️", name: "Valentine's Day", color: "#c94a6a", fn: () => Array.of(1, 14) },
        { icon: "🏛️", name: "Presidents' Day", color: "#2c4c7c", fn: y => Array.of(1, nthWeekday(y, 1, 1, 3)) },
        { icon: "🎭", name: "Mardi Gras", color: "#7b3fa0", fn: y => { const d = getEaster(y); d.setDate(d.getDate() - 47); return Array.of(d.getMonth(), d.getDate()); } },
        { icon: "☘️", name: "St. Patrick's Day", color: "#2e7d32", fn: () => Array.of(2, 17) },
        { icon: "🐣", name: "Easter Sunday", color: "#9c6ade", fn: y => { const d = getEaster(y); return Array.of(d.getMonth(), d.getDate()); } },
        { icon: "💐", name: "Mother's Day", color: "#d15b88", fn: y => Array.of(4, nthWeekday(y, 4, 0, 2)) },
        { icon: "🇺🇸", name: "Memorial Day", color: "#1d4e89", fn: y => Array.of(4, lastWeekday(y, 4, 1)) },
        { icon: "👔", name: "Father's Day", color: "#2f6690", fn: y => Array.of(5, nthWeekday(y, 5, 0, 3)) },
        { icon: "✊", name: "Juneteenth", color: "#b22222", fn: () => Array.of(5, 19) },
        { icon: "🇺🇸", name: "Independence Day", color: "#1d4e89", fn: () => Array.of(6, 4) },
        { icon: "🛠️", name: "Labor Day", color: "#3b6998", fn: y => Array.of(8, nthWeekday(y, 8, 1, 1)) },
        { icon: "🎃", name: "Halloween", color: "#d96b1f", fn: () => Array.of(9, 31) },
        { icon: "🎖️", name: "Veterans Day", color: "#2c4c7c", fn: () => Array.of(10, 11) },
        { icon: "🦃", name: "Thanksgiving", color: "#b85d19", fn: y => Array.of(10, nthWeekday(y, 10, 4, 4)) },
        { icon: "🕯️", name: "Christmas Eve", color: "#1b6b3a", fn: () => Array.of(11, 24) },
        { icon: "🎄", name: "Christmas Day", color: "#b32428", fn: () => Array.of(11, 25) },
        { icon: "🥂", name: "New Year's Eve", color: "#c99a2e", fn: () => Array.of(11, 31) }
    );

    const BANNERS = Array.of(
        { icons: "🎆 ✨ 🥂", title: "New Year & Winter Season", border: "#c99a2e", bg: "rgba(201, 154, 46, 0.14)" },
        { icons: "❤️ 🎭 💌", title: "Valentine & Mardi Gras Season", border: "#c94a6a", bg: "rgba(201, 74, 106, 0.14)" },
        { icons: "☘️ 🌱 🌈", title: "St. Patrick & Early Spring", border: "#2e7d32", bg: "rgba(46, 125, 50, 0.14)" },
        { icons: "🐣 🌷 🐇", title: "Easter & Spring Bloom", border: "#9c6ade", bg: "rgba(156, 106, 222, 0.14)" },
        { icons: "💐 🇺🇸 ☀️", title: "Mother's Day & Memorial Season", border: "#d15b88", bg: "rgba(209, 91, 136, 0.14)" },
        { icons: "☀️ 👔 🍉", title: "Summer & Father's Day Season", border: "#e09f3e", bg: "rgba(224, 159, 62, 0.14)" },
        { icons: "🇺🇸 🎆 🌭", title: "Independence Day & Mid-Summer", border: "#1d4e89", bg: "rgba(29, 78, 137, 0.14)" },
        { icons: "🌻 🍋 🏖️", title: "Late Summer Harvest", border: "#d4a328", bg: "rgba(212, 163, 40, 0.14)" },
        { icons: "🍂 🍎 🛠️", title: "Labor Day & Early Autumn", border: "#b5651d", bg: "rgba(181, 101, 29, 0.14)" },
        { icons: "🎃 🦇 🕸️", title: "Spooky Halloween Month", border: "#d96b1f", bg: "rgba(217, 107, 31, 0.16)" },
        { icons: "🦃 🍂 🥧", title: "Thanksgiving & Gratitude Month", border: "#b85d19", bg: "rgba(184, 93, 25, 0.16)" },
        { icons: "🎄 ❄️ 🎁", title: "Christmas & Holiday Season", border: "#b32428", bg: "rgba(179, 36, 40, 0.16)" }
    );

    function getActiveYearMonth() {
        const h1 = document.querySelector("h1");
        const txt = (h1 ? h1.textContent : "").trim();
        const months = Array.of("january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december");
        const mIdx = months.findIndex(m => txt.toLowerCase().includes(m));
        const yMatch = txt.match(/\b(20\d{2}|19\d{2})\b/);
        return {
            year: yMatch ? parseInt(yMatch.at(0), 10) : (typeof viewYear === "number" ? viewYear : new Date().getFullYear()),
            month: mIdx !== -1 ? mIdx : (typeof viewMonth === "number" ? viewMonth : new Date().getMonth())
        };
    }

    function buildMonthMap(year, month) {
        const map = {};
        RULES.forEach(r => {
            const pair = r.fn(year);
            if (pair.at(0) === month) map[pair.at(1)] = r;
        });
        return map;
    }

    let isDecorating = false;

    function decorateCalendar() {
        if (isDecorating) return;
        const grid = document.getElementById("calendar-grid");
        const preview = document.getElementById("preview-view");
        if (!grid || !preview) return;

        isDecorating = true;
        const { year, month } = getActiveYearMonth();
        const theme = BANNERS.at(month);

        let banner = document.getElementById("holiday-ambient-banner");
        if (!banner) {
            banner = document.createElement("div");
            banner.id = "holiday-ambient-banner";
            banner.className = "screen-only";
            preview.insertBefore(banner, preview.firstChild);
        }
        banner.style.cssText = `
            max-width: 1100px;
            margin: 0 auto 12px auto;
            padding: 7px 14px;
            border-radius: 8px;
            border: 1px solid ${theme.border};
            background: ${theme.bg};
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.88rem;
            font-weight: bold;
        `;
        banner.innerHTML = `<span>${theme.icons}</span><span>${theme.title}</span><span>${theme.icons}</span>`;

        const holidayMap = buildMonthMap(year, month);
        grid.querySelectorAll(".day-cell").forEach(cell => {
            const old = cell.querySelector(".holiday-label");
            if (old) old.remove();
            if (cell.classList.contains("adjacent-month") || cell.classList.contains("empty")) return;

            const numEl = cell.querySelector(".day-num");
            if (!numEl) return;
            const dayNum = parseInt(numEl.textContent, 10);
            const hol = holidayMap[dayNum];
            if (!hol) return;

            numEl.style.display = "flex";
            numEl.style.justifyContent = "space-between";
            numEl.style.alignItems = "center";
            numEl.style.gap = "4px";

            const badge = document.createElement("span");
            badge.className = "holiday-label";
            badge.textContent = `${hol.icon} ${hol.name}`;
            badge.title = hol.name;
            badge.style.cssText = `
                font-size: 0.68rem;
                font-weight: bold;
                color: #ffffff;
                background: ${hol.color};
                padding: 1px 6px;
                border-radius: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 82%;
            `;
            numEl.appendChild(badge);
        });

        isDecorating = false;
    }

    function watchCalendar() {
        decorateCalendar();
        const grid = document.getElementById("calendar-grid");
        if (grid) {
            new MutationObserver(() => decorateCalendar()).observe(grid, { childList: true });
        }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchCalendar);
    else watchCalendar();
})();
