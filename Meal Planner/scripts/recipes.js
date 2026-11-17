let editingMealIndex = -1;

function mealSupportsSlot(meal, slot) {
    if (Array.isArray(meal.types)) return meal.types.includes(slot);
    return meal.type === slot;
}

function getMealTypesList(meal) {
    if (Array.isArray(meal.types)) return meal.types;
    return meal.type ? [meal.type] : [];
}

function isSideDish(meal) {
    return meal && meal.role === "side";
}

document.getElementById("meal-form").addEventListener("submit", e => {
    e.preventDefault();
    const types = Array.from(document.querySelectorAll("#meal-type-checks input:checked")).map(cb => cb.value);
    if (!types.length) return showToast("Select at least one meal time.", true);

    const seasons = Array.from(document.querySelectorAll("#meal-season-checks input:checked")).map(cb => cb.value);
    if (!seasons.length) return showToast("Select at least one season.", true);

    const lines = document.getElementById("meal-items").value.split(/\n/).map(l => l.trim()).filter(Boolean);
    const name = document.getElementById("meal-name").value.trim();
    const role = document.getElementById("meal-role").value;
    const url = document.getElementById("meal-url").value.trim();

    const dishObj = {
        name: name,
        role: role,
        url: url,
        itemsList: lines,
        items: lines.map(i => "• " + i).join("\n"),
        types: types,
        seasons: seasons
    };

    if (editingMealIndex >= 0) {
        const oldName = meals.at(editingMealIndex).name;
        meals.splice(editingMealIndex, 1, dishObj);
        Object.values(yearlyPlan).forEach(daySlots => {
            ["breakfast", "lunch", "dinner"].forEach(s => {
                if (!daySlots[s]) return;
                const norm = normalizePlanSlot(daySlots[s]);
                if (norm.main && norm.main.name === oldName) norm.main = dishObj;
                norm.sides = norm.sides.map(side => side.name === oldName ? dishObj : side);
                daySlots[s] = norm;
            });
        });
        cancelEditDish();
        showToast(`Updated "${name}"`);
    } else {
        meals.push(dishObj);
        e.target.reset();
        showToast(`Saved "${name}"`);
    }

    saveToDisk();
    refreshAllViews();
});

function startEditDish(i) {
    const dish = meals.at(i);
    if (!dish) return;
    editingMealIndex = i;
    if (typeof closeSavedDishesModal === "function") closeSavedDishesModal();

    document.getElementById("form-heading").textContent = "1. Edit Dish";
    document.getElementById("save-dish-btn").textContent = "Update Dish";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    document.getElementById("meal-name").value = dish.name;
    document.getElementById("meal-role").value = dish.role || "main";
    document.getElementById("meal-url").value = dish.url || "";
    document.getElementById("meal-items").value = (dish.itemsList || []).join("\n");

    const dishTypes = getMealTypesList(dish);
    document.querySelectorAll("#meal-type-checks input").forEach(cb => {
        cb.checked = dishTypes.includes(cb.value);
    });

    document.querySelectorAll("#meal-season-checks input").forEach(cb => {
        cb.checked = dish.seasons.includes(cb.value);
    });

    document.getElementById("form-heading").scrollIntoView({ behavior: "smooth" });
}

function cancelEditDish() {
    editingMealIndex = -1;
    document.getElementById("meal-form").reset();
    document.getElementById("form-heading").textContent = "1. Add Dish";
    document.getElementById("save-dish-btn").textContent = "Save Dish";
    document.getElementById("cancel-edit-btn").classList.add("hidden");
}

function togglePatternInputs() {
    const p = document.getElementById("assign-pattern").value;
    document.getElementById("single-day-box").classList.toggle("hidden", p !== "single");
    document.getElementById("weekday-box").classList.toggle("hidden", !p.startsWith("weekday"));
}

function populateDayDropdown() {
    const sel = document.getElementById("assign-day");
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    const mName = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "short" });
    sel.innerHTML = Array.from({ length: days }, (_, i) => {
        const d = i + 1;
        const wd = new Date(viewYear, viewMonth, d).toLocaleString("default", { weekday: "short" });
        return `<option value="${d}">${mName} ${d} (${wd})</option>`;
    }).join("");
}

function updateAssignMealDropdown() {
    const slot = document.getElementById("assign-slot").value;
    const filtered = meals.filter(m => !isSideDish(m) && mealSupportsSlot(m, slot));
    document.getElementById("assign-meal").innerHTML = filtered.length
        ? filtered.map(m => `<option value="${meals.indexOf(m)}">${m.name}</option>`).join("")
        : `<option value="">No ${slot} main dishes saved</option>`;
}

function applyMealPlacement() {
    const slot = document.getElementById("assign-slot").value;
    const idx = document.getElementById("assign-meal").value;
    const pattern = document.getElementById("assign-pattern").value;
    if (idx === "") return showToast("Add a main dish first!", true);
    const dish = meals.at(Number(idx));

    const setSlot = (y, m, d) => {
        const k = formatDateKey(y, m, d);
        if (!yearlyPlan[k]) yearlyPlan[k] = {};
        const current = normalizePlanSlot(yearlyPlan[k][slot]);
        current.main = dish;
        yearlyPlan[k][slot] = current;
    };

    if (pattern === "single") {
        setSlot(viewYear, viewMonth, Number(document.getElementById("assign-day").value));
    } else if (pattern === "weekday-month") {
        const wd = Number(document.getElementById("assign-weekday").value);
        const days = new Date(viewYear, viewMonth + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
            if (new Date(viewYear, viewMonth, d).getDay() === wd) setSlot(viewYear, viewMonth, d);
        }
    } else if (pattern === "weekday-year") {
        const wd = Number(document.getElementById("assign-weekday").value);
        for (let m = 0; m < 12; m++) {
            if (!dish.seasons.includes(getSeason(m))) continue;
            const days = new Date(viewYear, m + 1, 0).getDate();
            for (let d = 1; d <= days; d++) {
                if (new Date(viewYear, m, d).getDay() === wd) setSlot(viewYear, m, d);
            }
        }
    } else if (pattern === "scatter-month") {
        const days = new Date(viewYear, viewMonth + 1, 0).getDate();
        const weeks = [
            { start: 1, end: 7 },
            { start: 8, end: 14 },
            { start: 15, end: 21 },
            { start: 22, end: days }
        ];
        weeks.forEach(w => {
            const randDay = Math.floor(Math.random() * (w.end - w.start + 1)) + w.start;
            setSlot(viewYear, viewMonth, randDay);
        });
    }

    saveToDisk();
    showToast(`Placed "${dish.name}" on calendar!`);
}
