window.HolidayRepeatStore = (function () {
    const STORAGE_KEY = "meal_planner_holiday_repeats";
    let rules = [];

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            rules = raw ? JSON.parse(raw) : [];
        } catch (e) {
            rules = [];
        }
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    }

    function findDish(name) {
        return (meals || []).find(m => m.name === name) || null;
    }

    function applyRule(rule) {
        if (!window.HolidayRules || typeof yearlyPlan !== "object") return;
        const mainDish = findDish(rule.mainName);
        if (!mainDish) return;

        const sideDishes = (rule.sideNames || []).map(findDish).filter(Boolean);
        const baseYear = typeof viewYear === "number" ? viewYear : new Date().getFullYear();

        for (let y = baseYear - 1; y <= baseYear + 10; y++) {
            const dk = window.HolidayRules.getDateKeyForYear(rule.holidayId, y);
            if (!dk) continue;
            if (!yearlyPlan[dk]) yearlyPlan[dk] = {};
            yearlyPlan[dk][rule.slot] = { main: mainDish, sides: sideDishes };
        }
    }

    load();

    return {
        getAll: () => rules,
        replaceAll(nextRules) {
            rules = Array.isArray(nextRules) ? nextRules : [];
            save();
            rules.forEach(applyRule);
        },
        syncAll() {
            rules.forEach(applyRule);
        },
        upsert(rule) {
            rules = rules.filter(r => !(r.holidayId === rule.holidayId && r.slot === rule.slot));
            rules.push(rule);
            save();
            applyRule(rule);
        },
        removeAt(idx) {
            const removed = rules.at(idx);
            if (removed && window.HolidayRules) {
                const baseYear = typeof viewYear === "number" ? viewYear : new Date().getFullYear();
                for (let y = baseYear - 1; y <= baseYear + 10; y++) {
                    const dk = window.HolidayRules.getDateKeyForYear(removed.holidayId, y);
                    if (dk && yearlyPlan[dk]?.[removed.slot]?.main?.name === removed.mainName) {
                        delete yearlyPlan[dk][removed.slot];
                    }
                }
            }
            rules.splice(idx, 1);
            save();
        }
    };
})();
