window.MealPlannerPlugin = (function () {
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
        window.MealPlannerToolbar?.mountHeaderControls();
        window.MealStore.syncHolidayRepeats();
        window.CoreCalendar?.registerPlugin({
            tabs: Array.of({ id: "breakfast", label: "Breakfast" }, { id: "lunch", label: "Lunch" }, { id: "dinner", label: "Dinner" }),
            actions: window.MealPlannerToolbar?.getCalendarActions() || [],
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
