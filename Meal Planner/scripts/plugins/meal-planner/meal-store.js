window.MealStore = (function () {
    const store = window.CoreStore.createNamespace("mealPlanner", {
        dishes: [],
        yearlyPlan: {},
        holidayRepeats: []
    });

    const formatDateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isSideDish = m => Boolean(m && m.role === "side");
    const getMealTypesList = m => Array.isArray(m?.types) ? m.types : (m?.type ? [m.type] : []);
    const mealSupportsSlot = (m, slot) => Boolean(m && getMealTypesList(m).includes(slot));

    function normalizePlanSlot(raw) {
        if (!raw) return { main: null, sides: [] };
        if (raw.main !== undefined || Array.isArray(raw.sides)) {
            return { main: raw.main || null, sides: Array.isArray(raw.sides) ? raw.sides : [] };
        }
        return { main: raw, sides: [] };
    }

    const getMeals = () => store.get("dishes", []);
    const getPlan = () => store.get("yearlyPlan", {});
    const getRepeats = () => store.get("holidayRepeats", []);

    function saveMeals(list) { store.set("dishes", Array.isArray(list) ? list : []); }
    function savePlan(plan) { store.set("yearlyPlan", plan && typeof plan === "object" ? plan : {}); }

    function applyHolidayRulesToPlan(planObj, rulesList, mealsList) {
        if (!window.HolidayDates) return;
        const baseYear = window.CoreCalendar?.getViewDate?.()?.year ?? new Date().getFullYear();
        const findDish = name => (mealsList || []).find(m => m.name === name) || null;

        (rulesList || []).forEach(rule => {
            const mainDish = findDish(rule.mainName);
            if (!mainDish) return;
            const sideDishes = (rule.sideNames || []).map(findDish).filter(Boolean);
            for (let y = baseYear - 1; y <= baseYear + 10; y++) {
                const dk = window.HolidayDates.getDateKeyForYear(rule.holidayId, y);
                if (!dk) continue;
                if (!planObj[dk]) planObj[dk] = {};
                planObj[dk][rule.slot] = { main: mainDish, sides: sideDishes };
            }
        });
    }

    function syncHolidayRepeats() {
        const plan = Object.assign({}, getPlan());
        applyHolidayRulesToPlan(plan, getRepeats(), getMeals());
        savePlan(plan);
    }

    function upsertHolidayRepeat(rule) {
        const next = getRepeats().filter(r => !(r.holidayId === rule.holidayId && r.slot === rule.slot));
        next.push(rule);
        store.set("holidayRepeats", next);
        syncHolidayRepeats();
    }

    function removeHolidayRepeat(idx) {
        const rules = Array.from(getRepeats());
        const removed = rules.at(idx);
        const plan = Object.assign({}, getPlan());
        if (removed && window.HolidayDates) {
            const baseYear = window.CoreCalendar?.getViewDate?.()?.year ?? new Date().getFullYear();
            for (let y = baseYear - 1; y <= baseYear + 10; y++) {
                const dk = window.HolidayDates.getDateKeyForYear(removed.holidayId, y);
                if (dk && plan[dk]?.[removed.slot]?.main?.name === removed.mainName) {
                    delete plan[dk][removed.slot];
                }
            }
        }
        rules.splice(idx, 1);
        store.set("holidayRepeats", rules);
        savePlan(plan);
    }

    function autoFillMonth(year, month, season) {
        const dishes = getMeals();
        const plan = Object.assign({}, getPlan());
        const days = new Date(year, month + 1, 0).getDate();
        const slots = ["breakfast", "lunch", "dinner"];
        let added = 0;

        for (let d = 1; d <= days; d++) {
            const dk = formatDateKey(year, month, d);
            if (!plan[dk]) plan[dk] = {};
            const usedToday = new Set();

            slots.forEach(s => {
                const cur = normalizePlanSlot(plan[dk][s]);
                if (cur.main) usedToday.add(cur.main.name);
            });

            slots.forEach(slot => {
                const cur = normalizePlanSlot(plan[dk][slot]);
                if (cur.main) return;

                const recent = new Set();
                for (let back = 1; back <= 5; back++) {
                    const prev = new Date(year, month, d - back);
                    const pSlot = normalizePlanSlot(plan[formatDateKey(prev.getFullYear(), prev.getMonth(), prev.getDate())]?.[slot]);
                    if (pSlot.main) recent.add(pSlot.main.name);
                }

                const candidates = dishes.filter(m =>
                    !isSideDish(m) &&
                    mealSupportsSlot(m, slot) &&
                    (!Array.isArray(m.seasons) || !m.seasons.length || m.seasons.includes(season)) &&
                    !usedToday.has(m.name) &&
                    !recent.has(m.name)
                );
                const fallback = dishes.filter(m => !isSideDish(m) && mealSupportsSlot(m, slot) && !usedToday.has(m.name));
                const pool = candidates.length ? candidates : fallback;
                if (!pool.length) return;

                const pick = pool.at(Math.floor(Math.random() * pool.length));
                usedToday.add(pick.name);
                plan[dk][slot] = { main: pick, sides: cur.sides };
                added++;
            });
        }

        savePlan(plan);
        return added;
    }

    function exportBackup() {
        const data = { meals: getMeals(), yearlyPlan: getPlan(), holidayRepeats: getRepeats() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "meals.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function importBackup(file) {
        return new Promise((resolve, reject) => {
            if (!file) return reject(new Error("No file selected"));
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result || "{}"));
                    const nextMeals = Array.isArray(parsed.meals) ? parsed.meals : (Array.isArray(parsed.dishes) ? parsed.dishes : []);
                    const nextPlan = parsed.yearlyPlan && typeof parsed.yearlyPlan === "object" ? parsed.yearlyPlan : {};
                    const nextRepeats = Array.isArray(parsed.holidayRepeats) ? parsed.holidayRepeats : [];
                    saveMeals(nextMeals);
                    store.set("holidayRepeats", nextRepeats);
                    applyHolidayRulesToPlan(nextPlan, nextRepeats, nextMeals);
                    savePlan(nextPlan);
                    resolve(nextMeals.length);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsText(file);
        });
    }

    return {
        formatDateKey, isSideDish, getMealTypesList, mealSupportsSlot, normalizePlanSlot,
        getMeals, saveMeals, getPlan, savePlan,
        getRepeats, syncHolidayRepeats, upsertHolidayRepeat, removeHolidayRepeat,
        autoFillMonth, exportBackup, importBackup
    };
})();
