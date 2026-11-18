window.MealPlannerPlugin = (function () {
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

    function mountHeaderControls() {
        const switcher = document.getElementById("view-switcher");
        if (switcher && !switcher.dataset.mpMounted) {
            switcher.dataset.mpMounted = "1";
            switcher.innerHTML = `
                <button type="button" class="view-btn active" data-mp-view="preview">📅 Calendar</button>
                <button type="button" class="view-btn" data-mp-view="edit">✏️ Edit &amp; Scatter Meals</button>
                <button type="button" class="view-btn" data-mp-view="grocery">🛒 Weekly Grocery List</button>
            `;
            switcher.querySelectorAll(".view-btn").forEach(btn => btn.addEventListener("click", () => switchView(btn.dataset.mpView)));
        }

        const headerActions = document.getElementById("plugin-header-actions");
        if (headerActions && !document.getElementById("mp-guide-btn")) {
            headerActions.innerHTML = `
                <button type="button" id="mp-saved-btn" class="btn-outline">Dishes (<span id="recipe-count">0</span>)</button>
                <button type="button" id="mp-guide-btn" class="btn-outline">Guide</button>
                <button type="button" id="mp-export-btn" class="btn-outline">Save meals.json</button>
                <label class="btn-outline" style="margin: 0; cursor: pointer; display: inline-flex; align-items: center; padding: 8px 14px; border-radius: 6px; font-size: 0.9rem;">
                    Load meals.json <input type="file" id="mp-import-input" accept=".json" style="display: none;">
                </label>
            `;
            headerActions.querySelector("#mp-saved-btn").addEventListener("click", () => window.SavedDishesModal?.open());
            headerActions.querySelector("#mp-guide-btn").addEventListener("click", () => window.MealAppGuide?.open());
            headerActions.querySelector("#mp-export-btn").addEventListener("click", () => window.MealStore.exportBackup());
            headerActions.querySelector("#mp-import-input").addEventListener("change", async e => {
                try {
                    const count = await window.MealStore.importBackup(e.target.files);
                    refreshAll();
                    window.CoreCalendar?.showToast(`Loaded ${count} dishes!`);
                } catch (err) { window.CoreCalendar?.showToast("Invalid meals.json file.", true); }
                e.target.value = "";
            });
        }
    }

    function switchView(view) {
        document.querySelectorAll("#view-switcher .view-btn").forEach(b => b.classList.toggle("active", b.dataset.mpView === view));
        document.getElementById("calendar-view")?.classList.toggle("hidden", view !== "preview");
        document.getElementById("mp-edit-view")?.classList.toggle("hidden", view !== "edit");
        document.getElementById("mp-grocery-view")?.classList.toggle("hidden", view !== "grocery");
        refreshAll();
    }

    function refreshPlacementDropdowns() {
        const view = window.CoreCalendar?.getViewDate?.() || { year: new Date().getFullYear(), month: new Date().getMonth() };
        const editLbl = document.getElementById("edit-month-label");
        if (editLbl) editLbl.textContent = new Date(view.year, view.month, 1).toLocaleString("default", { month: "long", year: "numeric" });

        const daySel = document.getElementById("assign-day");
        if (daySel) {
            const days = new Date(view.year, view.month + 1, 0).getDate();
            const mName = new Date(view.year, view.month, 1).toLocaleString("default", { month: "short" });
            daySel.innerHTML = Array.from({ length: days }, (_, i) => {
                const d = i + 1, wd = new Date(view.year, view.month, d).toLocaleString("default", { weekday: "short" });
                return `<option value="${d}">${mName} ${d} (${wd})</option>`;
            }).join("");
        }

        const slot = document.getElementById("assign-slot")?.value || "dinner";
        const meals = window.MealStore.getMeals();
        const filtered = meals.filter(m => !window.MealStore.isSideDish(m) && window.MealStore.mealSupportsSlot(m, slot));
        const mealSel = document.getElementById("assign-meal");
        if (mealSel) {
            mealSel.innerHTML = filtered.length
                ? filtered.map(m => `<option value="${meals.indexOf(m)}">${m.name}</option>`).join("")
                : `<option value="">No ${slot} main dishes saved</option>`;
        }
        window.AssignSidesPicker?.refresh();
    }

    function refreshAll() {
        window.CoreCalendar?.render();
        refreshPlacementDropdowns();
        window.SavedDishesModal?.render();
        window.GroceryCalculator?.render();
    }

    function activate() {
        window.MealPlannerViews?.mount();
        mountHeaderControls();
        window.PresetMeals?.seedIfEmpty();
        window.MealStore.syncHolidayRepeats();
        window.CoreCalendar?.registerPlugin({
            tabs: Array.of({ id: "breakfast", label: "Breakfast" }, { id: "lunch", label: "Lunch" }, { id: "dinner", label: "Dinner" }),
            actions: Array.of(
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
                            refreshAll();
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
                            refreshAll();
                            window.CoreCalendar.showToast(`Cleared all of ${v.year}.`);
                        });
                    }
                },
                {
                    label: "Clear All", className: "btn-outline",
                    onClick(e) {
                        confirmAction("all", e.currentTarget, "Clear All", "Confirm Clear All?", () => {
                            window.MealStore.savePlan({});
                            refreshAll();
                            window.CoreCalendar.showToast("Cleared entire calendar.");
                        });
                    }
                }
            ),
            renderDay({ dateKey, activeTab }) {
                const entry = window.MealStore.normalizePlanSlot(window.MealStore.getPlan()[dateKey]?.[activeTab]);
                return (entry.main ? `<div class="meal-title">${entry.main.name}</div>` : "") +
                       (entry.sides.length ? `<div class="meal-items">${entry.sides.map(s => `+ ${s.name}`).join("\n")}</div>` : "");
            }
        });
        switchView("preview");
    }

    window.CoreBus?.on("calendar:dayClicked", info => { if (!window.CorePlugins || window.CorePlugins.isEnabled("meal-planner")) window.MealDayModal?.open(info?.dateKey); });
    window.CoreBus?.on("calendar:monthChanged", () => { if (!window.CorePlugins || window.CorePlugins.isEnabled("meal-planner")) { refreshPlacementDropdowns(); window.GroceryCalculator?.render(); } });

    window.CorePlugins?.register({
        id: "meal-planner",
        requires: Array.of("calendar"),
        icon: "🍽️",
        title: "Meal Planner & Grocery List",
        description: "Breakfast/Lunch/Dinner planning, recipes, pantry matcher & weekly grocery list",
        defaultEnabled: true,
        enable() { activate(); },
        disable() {
            document.getElementById("meal-planner-views")?.remove();
            const sw = document.getElementById("view-switcher");
            if (sw) { sw.innerHTML = ""; delete sw.dataset.mpMounted; }
            const ha = document.getElementById("plugin-header-actions");
            if (ha) ha.innerHTML = "";
            document.getElementById("calendar-view")?.classList.remove("hidden");
            window.CoreCalendar?.registerPlugin(null);
        }
    });

    return { switchView, refreshPlacementDropdowns, refreshAll };
})();
