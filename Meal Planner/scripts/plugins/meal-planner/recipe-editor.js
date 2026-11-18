window.MealEditor = (function () {
    let editingIndex = -1;

    function startEdit(i) {
        const dish = window.MealStore.getMeals().at(i);
        if (!dish) return;
        editingIndex = i;
        window.SavedDishesModal?.close();
        window.MealPlannerPlugin?.switchView("edit");

        document.getElementById("form-heading").textContent = "1. Edit Dish";
        document.getElementById("save-dish-btn").textContent = "Update Dish";
        document.getElementById("cancel-edit-btn").classList.remove("hidden");

        document.getElementById("meal-name").value = dish.name;
        document.getElementById("meal-role").value = dish.role || "main";
        document.getElementById("meal-url").value = dish.url || "";
        document.getElementById("meal-items").value = (dish.itemsList || []).join("\n");

        const dishTypes = window.MealStore.getMealTypesList(dish);
        document.querySelectorAll("#meal-type-checks input").forEach(cb => { cb.checked = dishTypes.includes(cb.value); });
        document.querySelectorAll("#meal-season-checks input").forEach(cb => { cb.checked = (dish.seasons || []).includes(cb.value); });
        document.getElementById("form-heading").scrollIntoView({ behavior: "smooth" });
    }

    function cancelEdit() {
        editingIndex = -1;
        document.getElementById("meal-form")?.reset();
        const heading = document.getElementById("form-heading");
        if (heading) heading.textContent = "1. Add Dish";
        const saveBtn = document.getElementById("save-dish-btn");
        if (saveBtn) saveBtn.textContent = "Save Dish";
        document.getElementById("cancel-edit-btn")?.classList.add("hidden");
    }

    function bindEvents() {
        const form = document.getElementById("meal-form");
        if (!form || form.dataset.bound) return;
        form.dataset.bound = "1";

        form.addEventListener("submit", e => {
            e.preventDefault();
            const types = Array.from(document.querySelectorAll("#meal-type-checks input:checked")).map(cb => cb.value);
            if (!types.length) return window.CoreCalendar?.showToast("Select at least one meal time.", true);
            const seasons = Array.from(document.querySelectorAll("#meal-season-checks input:checked")).map(cb => cb.value);
            if (!seasons.length) return window.CoreCalendar?.showToast("Select at least one season.", true);

            const lines = document.getElementById("meal-items").value.split(/\n/).map(l => l.trim()).filter(Boolean);
            const name = document.getElementById("meal-name").value.trim();
            const dishObj = {
                name, role: document.getElementById("meal-role").value,
                url: document.getElementById("meal-url").value.trim(),
                itemsList: lines, items: lines.map(i => "• " + i).join("\n"), types, seasons
            };

            const meals = Array.from(window.MealStore.getMeals());
            if (editingIndex >= 0) {
                const oldName = meals.at(editingIndex).name;
                meals.splice(editingIndex, 1, dishObj);
                const plan = Object.assign({}, window.MealStore.getPlan());
                Object.values(plan).forEach(daySlots => {
                    ["breakfast", "lunch", "dinner"].forEach(s => {
                        if (!daySlots[s]) return;
                        const norm = window.MealStore.normalizePlanSlot(daySlots[s]);
                        if (norm.main?.name === oldName) norm.main = dishObj;
                        norm.sides = norm.sides.map(side => side.name === oldName ? dishObj : side);
                        daySlots[s] = norm;
                    });
                });
                window.MealStore.savePlan(plan);
                cancelEdit();
                window.CoreCalendar?.showToast(`Updated "${name}"`);
            } else {
                meals.push(dishObj);
                e.target.reset();
                window.CoreCalendar?.showToast(`Saved "${name}"`);
            }

            window.MealStore.saveMeals(meals);
            window.MealPlannerPlugin?.refreshAll();
        });

        document.getElementById("cancel-edit-btn")?.addEventListener("click", cancelEdit);
        document.getElementById("assign-slot")?.addEventListener("change", () => window.MealPlannerPlugin?.refreshPlacementDropdowns());
        document.getElementById("assign-pattern")?.addEventListener("change", e => {
            const p = e.target.value;
            document.getElementById("single-day-box")?.classList.toggle("hidden", p !== "single");
            document.getElementById("weekday-box")?.classList.toggle("hidden", !p.startsWith("weekday"));
            document.getElementById("holiday-box")?.classList.toggle("hidden", p !== "repeat-holiday");
        });
        document.getElementById("place-meal-btn")?.addEventListener("click", () => window.MealScheduler?.placeOnCalendar());

        const patternLabel = Array.from(document.querySelectorAll("#mp-edit-view label")).find(l => l.textContent.trim().startsWith("Placement Pattern"));
        window.AssignSidesPicker?.mountBefore(patternLabel || document.getElementById("assign-pattern"));
        window.RecipeAutocomplete?.attach();
        window.MealScheduler?.renderHolidayRepeats();
    }

    return { startEdit, cancelEdit, bindEvents };
})();
