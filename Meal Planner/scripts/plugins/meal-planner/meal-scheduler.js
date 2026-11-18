window.MealScheduler = {
    renderHolidayRepeats() {
        const listEl = document.getElementById("holiday-repeat-list");
        if (!listEl || !window.MealStore) return;
        const rules = window.MealStore.getRepeats();
        if (!rules.length) { listEl.innerHTML = ""; return; }

        listEl.innerHTML = rules.map((r, idx) => {
            const hol = (window.HolidayDates?.LIST || []).find(h => h.id === r.holidayId);
            const label = hol ? `${hol.icon} ${hol.name}` : r.holidayId;
            const sidesStr = r.sideNames?.length ? ` + ${r.sideNames.join(" + ")}` : "";
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); font-size: 0.82rem;">
                    <span>🔁 <strong>${label}</strong> (${r.slot}): ${r.mainName}${sidesStr}</span>
                    <button type="button" data-del-rep="${idx}" class="btn-outline" style="padding: 2px 8px; font-size: 0.74rem; color: #b32428; border-color: #b32428;">✕</button>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("button[data-del-rep]").forEach(btn => {
            btn.addEventListener("click", () => {
                window.MealStore.removeHolidayRepeat(Number(btn.dataset.delRep));
                this.renderHolidayRepeats();
                window.MealPlannerPlugin?.refreshAll();
                window.CoreCalendar?.showToast("Removed yearly holiday meal.");
            });
        });
    },

    placeOnCalendar() {
        const slot = document.getElementById("assign-slot").value;
        const idx = document.getElementById("assign-meal").value;
        const pattern = document.getElementById("assign-pattern").value;
        if (idx === "") return window.CoreCalendar?.showToast("Add a main dish first!", true);

        const dish = window.MealStore.getMeals().at(Number(idx));
        const selectedSides = window.AssignSidesPicker?.getSelectedDishes() || [];
        window.AssignSidesPicker?.closePopover();

        if (pattern === "repeat-holiday") {
            const holidayId = document.getElementById("assign-holiday").value;
            window.MealStore.upsertHolidayRepeat({ holidayId, slot, mainName: dish.name, sideNames: selectedSides.map(s => s.name) });
            this.renderHolidayRepeats();
            window.MealPlannerPlugin?.refreshAll();
            window.CoreCalendar?.showToast(`Scheduled "${dish.name}" every year!`);
            return;
        }

        const view = window.CoreCalendar?.getViewDate?.() || { year: new Date().getFullYear(), month: new Date().getMonth() };
        const plan = Object.assign({}, window.MealStore.getPlan());
        const setSlot = (y, m, d) => {
            const k = window.MealStore.formatDateKey(y, m, d);
            if (!plan[k]) plan[k] = {};
            const cur = window.MealStore.normalizePlanSlot(plan[k][slot]);
            cur.main = dish;
            if (selectedSides.length) cur.sides = Array.from(selectedSides);
            plan[k][slot] = cur;
        };

        if (pattern === "single") setSlot(view.year, view.month, Number(document.getElementById("assign-day").value));
        else if (pattern === "weekday-month") {
            const wd = Number(document.getElementById("assign-weekday").value);
            const days = new Date(view.year, view.month + 1, 0).getDate();
            for (let d = 1; d <= days; d++) if (new Date(view.year, view.month, d).getDay() === wd) setSlot(view.year, view.month, d);
        } else if (pattern === "weekday-year") {
            const wd = Number(document.getElementById("assign-weekday").value);
            const getSeason = m => (m === 11 || m <= 1) ? "winter" : (m <= 4 ? "spring" : (m <= 7 ? "summer" : "fall"));
            for (let m = 0; m < 12; m++) {
                if (!(dish.seasons || []).includes(getSeason(m))) continue;
                const days = new Date(view.year, m + 1, 0).getDate();
                for (let d = 1; d <= days; d++) if (new Date(view.year, m, d).getDay() === wd) setSlot(view.year, m, d);
            }
        } else if (pattern === "scatter-month") {
            const days = new Date(view.year, view.month + 1, 0).getDate();
            [{ s: 1, e: 7 }, { s: 8, e: 14 }, { s: 15, e: 21 }, { s: 22, e: days }].forEach(w => {
                setSlot(view.year, view.month, Math.floor(Math.random() * (w.e - w.s + 1)) + w.s);
            });
        }

        window.MealStore.savePlan(plan);
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast(`Placed "${dish.name}" on calendar!`);
    }
};
