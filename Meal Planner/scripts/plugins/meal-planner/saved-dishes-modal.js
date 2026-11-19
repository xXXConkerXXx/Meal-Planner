window.SavedDishesModal = (function () {
    const expanded = new Set();
    const collapsedCats = new Set();
    let deleteAllArmed = false;

    function scrubDishFromPlan(dishName) {
        if (!dishName) return;
        const plan = Object.assign({}, window.MealStore.getPlan());
        let changed = false;

        Object.keys(plan).forEach(dk => {
            ["breakfast", "lunch", "dinner"].forEach(slot => {
                const raw = plan[dk]?.[slot];
                if (!raw) return;
                const norm = window.MealStore.normalizePlanSlot(raw);
                const mainMatch = norm.main?.name === dishName;
                const nextSides = norm.sides.filter(s => s.name !== dishName);

                if (mainMatch || nextSides.length !== norm.sides.length) {
                    changed = true;
                    const nextMain = mainMatch ? null : norm.main;
                    if (!nextMain && !nextSides.length) delete plan[dk][slot];
                    else plan[dk][slot] = { main: nextMain, sides: nextSides };
                }
            });
            if (!Object.keys(plan[dk]).length) delete plan[dk];
        });

        if (changed) window.MealStore.savePlan(plan);
    }

    function ensureModal() {
        if (document.getElementById("saved-dishes-modal")) return;
        const modal = document.createElement("div");
        modal.id = "saved-dishes-modal";
        modal.className = "modal-backdrop hidden";
        modal.addEventListener("click", close);
        modal.innerHTML = window.SavedDishesView.buildModalHTML();
        document.body.appendChild(modal);

        modal.querySelector("#sd-close-btn").addEventListener("click", close);
        modal.querySelector("#restore-starters-btn").addEventListener("click", handleRestoreStarters);
        modal.querySelector("#delete-all-dishes-btn").addEventListener("click", handleDeleteAll);
        modal.querySelector("#dish-search-input").addEventListener("input", render);
        modal.querySelector("#dish-role-filter").addEventListener("change", render);
        modal.querySelector("#dish-time-filter").addEventListener("change", render);
    }

    function handleRestoreStarters() {
        if (!window.PresetMeals) return;
        if (!window.PresetMeals.isActive()) {
            window.CorePlugins?.setEnabled("preset-meals", true);
        } else {
            window.PresetMeals.applyPresets(false);
        }
        window.CoreCalendar?.showToast("Restored 18 starter dishes!");
    }

    function resetDeleteAllBtn() {
        deleteAllArmed = false;
        const btn = document.getElementById("delete-all-dishes-btn");
        if (btn) { btn.textContent = "Delete All"; btn.classList.remove("btn-danger-confirm"); }
    }

    function handleDeleteAll() {
        const meals = window.MealStore.getMeals();
        if (!meals.length) return window.CoreCalendar?.showToast("No saved dishes to delete.", true);

        const btn = document.getElementById("delete-all-dishes-btn");
        if (!deleteAllArmed) {
            deleteAllArmed = true;
            btn.textContent = "Confirm Delete All?";
            btn.classList.add("btn-danger-confirm");
            setTimeout(resetDeleteAllBtn, 4000);
            return;
        }
        resetDeleteAllBtn();
        window.MealEditor?.cancelEdit();
        window.MealStore.saveMeals([]);
        window.MealStore.savePlan({});
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast("Deleted all saved dishes & cleared calendar.");
    }

    function render() {
        const meals = window.MealStore.getMeals();
        ["recipe-count", "modal-recipe-count"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = String(meals.length); });
        const listEl = document.getElementById("saved-meals-list");
        if (!listEl) return;

        const terms = String(document.getElementById("dish-search-input")?.value || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
        const role = document.getElementById("dish-role-filter")?.value || "all";
        const time = document.getElementById("dish-time-filter")?.value || "all";

        const filtered = meals.map((m, i) => ({ m, i, info: window.SavedDishesView.analyze(m, terms) })).filter(({ m, info }) =>
            (role === "all" || (role === "side" ? window.MealStore.isSideDish(m) : !window.MealStore.isSideDish(m))) &&
            (time === "all" || window.MealStore.mealSupportsSlot(m, time)) &&
            (!terms.length || info.nameHit || info.matched.length > 0)
        );

        listEl.innerHTML = filtered.length
            ? window.SavedDishesView.groupAndRenderRows(filtered, terms, expanded, collapsedCats)
            : `<li style="color: var(--text-muted); justify-content: center;">No matching dishes found.</li>`;

        listEl.querySelectorAll("[data-cat-toggle]").forEach(hdr => hdr.addEventListener("click", () => {
            const key = hdr.dataset.catToggle;
            if (collapsedCats.has(key)) collapsedCats.delete(key); else collapsedCats.add(key);
            render();
        }));
        listEl.querySelectorAll("[data-expand-idx]").forEach(el => el.addEventListener("click", () => {
            const idx = Number(el.dataset.expandIdx);
            if (expanded.has(idx)) expanded.delete(idx); else expanded.add(idx);
            render();
        }));
        listEl.querySelectorAll("[data-edit-idx]").forEach(b => b.addEventListener("click", () => window.MealEditor?.startEdit(Number(b.dataset.editIdx))));
        listEl.querySelectorAll("[data-del-idx]").forEach(b => b.addEventListener("click", () => {
            const idx = Number(b.dataset.delIdx);
            const list = Array.from(window.MealStore.getMeals());
            const removed = list.splice(idx, 1).at(0);
            window.MealStore.saveMeals(list);
            if (removed?.name) scrubDishFromPlan(removed.name);
            window.MealPlannerPlugin?.refreshAll();
            window.CoreCalendar?.showToast(`Removed "${removed?.name || "dish"}" from list & calendar.`);
        }));
    }

    function open() { ensureModal(); resetDeleteAllBtn(); render(); document.getElementById("saved-dishes-modal").classList.remove("hidden"); }
    function close() { resetDeleteAllBtn(); document.getElementById("saved-dishes-modal")?.classList.add("hidden"); }
    return { open, close, render };
})();
