window.HolidayRules = (function () {
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

    const LIST = Array.of(
        { id: "new_years_day", icon: "🎆", name: "New Year's Day", fn: () => Array.of(0, 1) },
        { id: "mlk_day", icon: "🕊️", name: "MLK Jr. Day", fn: y => Array.of(0, nthWeekday(y, 0, 1, 3)) },
        { id: "valentines_day", icon: "❤️", name: "Valentine's Day", fn: () => Array.of(1, 14) },
        { id: "presidents_day", icon: "🏛️", name: "Presidents' Day", fn: y => Array.of(1, nthWeekday(y, 1, 1, 3)) },
        { id: "mardi_gras", icon: "🎭", name: "Mardi Gras", fn: y => { const d = getEaster(y); d.setDate(d.getDate() - 47); return Array.of(d.getMonth(), d.getDate()); } },
        { id: "st_patricks", icon: "☘️", name: "St. Patrick's Day", fn: () => Array.of(2, 17) },
        { id: "easter", icon: "🐣", name: "Easter Sunday", fn: y => { const d = getEaster(y); return Array.of(d.getMonth(), d.getDate()); } },
        { id: "mothers_day", icon: "💐", name: "Mother's Day", fn: y => Array.of(4, nthWeekday(y, 4, 0, 2)) },
        { id: "memorial_day", icon: "🇺🇸", name: "Memorial Day", fn: y => Array.of(4, lastWeekday(y, 4, 1)) },
        { id: "fathers_day", icon: "👔", name: "Father's Day", fn: y => Array.of(5, nthWeekday(y, 5, 0, 3)) },
        { id: "juneteenth", icon: "✊", name: "Juneteenth", fn: () => Array.of(5, 19) },
        { id: "independence_day", icon: "🇺🇸", name: "Independence Day", fn: () => Array.of(6, 4) },
        { id: "labor_day", icon: "🛠️", name: "Labor Day", fn: y => Array.of(8, nthWeekday(y, 8, 1, 1)) },
        { id: "halloween", icon: "🎃", name: "Halloween", fn: () => Array.of(9, 31) },
        { id: "veterans_day", icon: "🎖️", name: "Veterans Day", fn: () => Array.of(10, 11) },
        { id: "thanksgiving", icon: "🦃", name: "Thanksgiving", fn: y => Array.of(10, nthWeekday(y, 10, 4, 4)) },
        { id: "christmas_eve", icon: "🕯️", name: "Christmas Eve", fn: () => Array.of(11, 24) },
        { id: "christmas_day", icon: "🎄", name: "Christmas Day", fn: () => Array.of(11, 25) },
        { id: "new_years_eve", icon: "🥂", name: "New Year's Eve", fn: () => Array.of(11, 31) }
    );

    return {
        LIST,
        getDateKeyForYear(holidayId, year) {
            const rule = LIST.find(r => r.id === holidayId);
            if (!rule) return null;
            const pair = rule.fn(year);
            return formatDateKey(year, pair.at(0), pair.at(1));
        }
    };
})();
