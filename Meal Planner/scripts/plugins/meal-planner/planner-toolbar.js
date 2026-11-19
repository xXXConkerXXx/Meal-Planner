window.MealPlannerToolbar = (function () {
    const armed = { month: false, year: false, all: false };

    function confirmAction(key, btn, defaultLabel, confirmLabel, onConfirm) {
        if (!armed[key]) {
            armed[key] = true;
            btn.textContent = confirmLabel;
            btn.classList.add("btn-danger-confirm");
            setTimeout(() => {
                armed[key] = false;
                btn.textContent = defaultLabel;
                btn.classList.remove("btn-danger-confirm");
            }, 4000);
            return;
        }
        armed[key] = false;
        btn.textContent = defaultLabel;
        btn.classList.remove("btn-danger-confirm");
        onConfirm();
    }

    function shuffleList(arr) {
        const copy = Array.from(arr);
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function scatterCurrentMonth() {
        const view = window.CoreCalendar?.getViewDate?.() || { year: new Date().getFullYear(), month: new Date().getMonth() };
        const dishes = window.MealStore.getMeals();
        if (!dishes.length) {
            window.CoreCalendar?.showToast("Add some dishes first (or click Restore Starters)!", true);
            return;
        }

        const days = new Date(view.year, view.month + 1, 0).getDate();
        const plan = Object.assign({}, window.MealStore.getPlan());
        const slots = ["breakfast", "lunch", "dinner"];

        for (let d = 1; d <= days; d++) {
            delete plan[window.MealStore.formatDateKey(view.year, view.month, d)];
        }

        slots.forEach(slot => {
            const mains = dishes.filter(m => !window.MealStore.isSideDish(m) && window.MealStore.mealSupportsSlot(m, slot));
            const sides = dishes.filter(m => window.MealStore.isSideDish(m) && window.MealStore.mealSupportsSlot(m, slot));
            if (!mains.length) return;

            const randomDays = shuffleList(Array.from({ length: days }, (_, i) => i + 1));
            let deck = shuffleList(mains);

            randomDays.forEach((day, idx) => {
                if (!deck.length) deck = shuffleList(mains);
                const main = deck.pop();
                const dk = window.MealStore.formatDateKey(view.year, view.month, day);
                if (!plan[dk]) plan[dk] = {};

                const attachSide = sides.length && Math.random() < 0.45
                    ? [sides.at((idx + Math.floor(Math.random() * sides.length)) % sides.length)]
                    : [];
                plan[dk][slot] = { main, sides: attachSide };
            });
        });

        window.MealStore.savePlan(plan);
        window.MealStore.syncHolidayRepeats();
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast("Reshuffled & scattered meals across the month!");
    }

    function mountHeaderControls() {
        const switcher = document.getElementById("view-switcher");
        if (switcher && !switcher.dataset.mpMounted) {
            switcher.dataset.mpMounted = "1";
            switcher.innerHTML = `
                <button type="button" class="view-btn active" data-mp-view="preview">📅 Calendar</button>
                <button type="button" class="view-btn" data-mp-view="edit">✏️ Edit &amp; Scatter Meals</button>
                <button type="button" class="view-btn" data-mp-view="grocery">🛒 Weekly Grocery List</button>
            `;
            switcher.querySelectorAll(".view-btn").forEach(btn => btn.addEventListener("click", () => window.MealPlannerPlugin?.switchView(btn.dataset.mpView)));
        }

        const headerActions = document.getElementById("plugin-header-actions");
        if (headerActions && !document.getElementById("mp-guide-btn")) {
            headerActions.innerHTML = `
                <button type="button" id="mp-saved-btn" class="btn-outline">Dishes (<span id="recipe-count">0</span>)</button>
                <button type="button" id="mp-guide-btn" class="btn-outline">Guide</button>
                <button type="button" id="mp-export-btn" class="btn-outline">Save meals.json</button>
                <label class="btn-outline" style="margin: 0; cursor: pointer; display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 6px; font-size: 0.88rem; font-weight: bold;">
                    Load meals.json <input type="file" id="mp-import-input" accept=".json" style="display: none;">
                </label>
            `;
            headerActions.querySelector("#mp-saved-btn").addEventListener("click", () => window.SavedDishesModal?.open());
            headerActions.querySelector("#mp-guide-btn").addEventListener("click", () => window.MealAppGuide?.open());
            headerActions.querySelector("#mp-export-btn").addEventListener("click", () => window.MealStore.exportBackup());
            headerActions.querySelector("#mp-import-input").addEventListener("change", async e => {
                try {
                    const count = await window.MealStore.importBackup(e.target.files);
                    window.MealPlannerPlugin?.refreshAll();
                    window.CoreCalendar?.showToast(`Loaded ${count} dishes!`);
                } catch (err) { window.CoreCalendar?.showToast("Invalid meals.json file.", true); }
                e.target.value = "";
            });
        }
    }

    function getCalendarActions() {
        return Array.of(
            {
                label: "🎲 Scatter Month", className: "btn-green",
                onClick: scatterCurrentMonth
            },
            {
                label: "Clear Month", className: "btn-outline",
                onClick(e) {
                    const v = window.CoreCalendar.getViewDate();
                    const mName = new Date(v.year, v.month, 1).toLocaleString("default", { month: "short" });
                    confirmAction("month", e.currentTarget, "Clear Month", `Confirm Clear ${mName}?`, () => {
                        const days = new Date(v.year, v.month + 1, 0).getDate();
                        const plan = Object.assign({}, window.MealStore.getPlan());
                        for (let d = 1; d <= days; d++) delete plan[window.MealStore.formatDateKey(v.year, v.month, d)];
                        window.MealStore.savePlan(plan);
                        window.MealPlannerPlugin?.refreshAll();
                        window.CoreCalendar.showToast("Cleared current month.");
                    });
                }
            },
            {
                label: "Clear Year", className: "btn-outline",
                onClick(e) {
                    const v = window.CoreCalendar.getViewDate();
                    confirmAction("year", e.currentTarget, "Clear Year", `Confirm Clear ${v.year}?`, () => {
                        const plan = Object.assign({}, window.MealStore.getPlan());
                        Object.keys(plan).forEach(k => { if (k.startsWith(`${v.year}-`)) delete plan[k]; });
                        window.MealStore.savePlan(plan);
                        window.MealPlannerPlugin?.refreshAll();
                        window.CoreCalendar.showToast(`Cleared all of ${v.year}.`);
                    });
                }
            },
            {
                label: "Clear All", className: "btn-outline",
                onClick(e) {
                    confirmAction("all", e.currentTarget, "Clear All", "Confirm Clear All?", () => {
                        window.MealStore.savePlan({});
                        window.MealPlannerPlugin?.refreshAll();
                        window.CoreCalendar.showToast("Cleared entire calendar.");
                    });
                }
            }
        );
    }

    return { mountHeaderControls, getCalendarActions, scatterCurrentMonth };
})();
