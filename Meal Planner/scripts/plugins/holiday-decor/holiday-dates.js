window.HolidayDates = (function () {
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
        { id: "new_years_day", icon: "🎆", name: "New Year's Day", color: "#c99a2e", fn: () => Array.of(0, 1) },
        { id: "mlk_day", icon: "🕊️", name: "MLK Jr. Day", color: "#4a6fa5", fn: y => Array.of(0, nthWeekday(y, 0, 1, 3)) },
        { id: "valentines_day", icon: "❤️", name: "Valentine's Day", color: "#c94a6a", fn: () => Array.of(1, 14) },
        { id: "presidents_day", icon: "🏛️", name: "Presidents' Day", color: "#2c4c7c", fn: y => Array.of(1, nthWeekday(y, 1, 1, 3)) },
        { id: "mardi_gras", icon: "🎭", name: "Mardi Gras", color: "#7b3fa0", fn: y => { const d = getEaster(y); d.setDate(d.getDate() - 47); return Array.of(d.getMonth(), d.getDate()); } },
        { id: "st_patricks", icon: "☘️", name: "St. Patrick's Day", color: "#2e7d32", fn: () => Array.of(2, 17) },
        { id: "easter", icon: "🐣", name: "Easter Sunday", color: "#9c6ade", fn: y => { const d = getEaster(y); return Array.of(d.getMonth(), d.getDate()); } },
        { id: "mothers_day", icon: "💐", name: "Mother's Day", color: "#d15b88", fn: y => Array.of(4, nthWeekday(y, 4, 0, 2)) },
        { id: "memorial_day", icon: "🇺🇸", name: "Memorial Day", color: "#1d4e89", fn: y => Array.of(4, lastWeekday(y, 4, 1)) },
        { id: "fathers_day", icon: "👔", name: "Father's Day", color: "#2f6690", fn: y => Array.of(5, nthWeekday(y, 5, 0, 3)) },
        { id: "juneteenth", icon: "✊", name: "Juneteenth", color: "#b22222", fn: () => Array.of(5, 19) },
        { id: "independence_day", icon: "🇺🇸", name: "Independence Day", color: "#1d4e89", fn: () => Array.of(6, 4) },
        { id: "labor_day", icon: "🛠️", name: "Labor Day", color: "#3b6998", fn: y => Array.of(8, nthWeekday(y, 8, 1, 1)) },
        { id: "halloween", icon: "🎃", name: "Halloween", color: "#d96b1f", fn: () => Array.of(9, 31) },
        { id: "veterans_day", icon: "🎖️", name: "Veterans Day", color: "#2c4c7c", fn: () => Array.of(10, 11) },
        { id: "thanksgiving", icon: "🦃", name: "Thanksgiving", color: "#b85d19", fn: y => Array.of(10, nthWeekday(y, 10, 4, 4)) },
        { id: "christmas_eve", icon: "🕯️", name: "Christmas Eve", color: "#1b6b3a", fn: () => Array.of(11, 24) },
        { id: "christmas_day", icon: "🎄", name: "Christmas Day", color: "#b32428", fn: () => Array.of(11, 25) },
        { id: "new_years_eve", icon: "🥂", name: "New Year's Eve", color: "#c99a2e", fn: () => Array.of(11, 31) }
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

    return {
        LIST: RULES,
        BANNERS,
        getMonthMap(year, month) {
            const map = {};
            RULES.forEach(r => {
                const pair = r.fn(year);
                if (pair.at(0) === month) map[pair.at(1)] = r;
            });
            return map;
        },
        getDateKeyForYear(holidayId, year) {
            const rule = RULES.find(r => r.id === holidayId);
            if (!rule) return null;
            const pair = rule.fn(year);
            return `${year}-${String(pair.at(0) + 1).padStart(2, "0")}-${String(pair.at(1)).padStart(2, "0")}`;
        }
    };
})();
