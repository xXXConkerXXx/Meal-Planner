let editingMealIndex = -1;

function mealSupportsSlot(meal, slot) {
    if (Array.isArray(meal.types)) return meal.types.includes(slot);
    return meal.type === slot;
}

function getMealTypesList(meal) {
    if (Array.isArray(meal.types)) return meal.types;
    return meal.type ? [meal.type] : [];
}

document.getElementById("meal-form").addEventListener("submit", e => {
    e.preventDefault();
    const types = Array.from(document.querySelectorAll("#meal-type-checks input:checked")).map(cb => cb.value);
    if (!types.length) return showToast("Select at least one meal time.", true);

    const seasons = Array.from(document.querySelectorAll("#meal-season-checks input:checked")).map(cb => cb.value);
    if (!seasons.length) return showToast("Select at least one season.", true);

    const lines = document.getElementById("meal-items").value.split(/\n/).map(l => l.trim()).filter(Boolean);
    const name = document.getElementById("meal-name").value.trim();
    const dishObj = {
        name: name,
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
                if (daySlots[s] && daySlots[s].name === oldName) daySlots[s] = dishObj;
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

    document.getElementById("form-heading").textContent = "1. Edit Dish";
    document.getElementById("save-dish-btn").textContent = "Update Dish";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    document.getElementById("meal-name").value = dish.name;
    document.getElementById("meal-items").value = (dish.itemsList || []).join("\n");

    const dishTypes = getMealTypesList(dish);
    document.querySelectorAll("#meal-type-checks input").forEach(cb => {
        cb.checked = dishTypes.includes(cb.value);
    });

    document.querySelectorAll("#meal-season-checks input").forEach(cb => {
        cb.checked = dish.seasons.includes(cb.value);
    });
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
    const filtered = meals.filter(m => mealSupportsSlot(m, slot));
    document.getElementById("assign-meal").innerHTML = filtered.length
        ? filtered.map(m => `<option value="${meals.indexOf(m)}">${m.name}</option>`).join("")
        : `<option value="">No ${slot} dishes saved</option>`;
}

function applyMealPlacement() {
    const slot = document.getElementById("assign-slot").value;
    const idx = document.getElementById("assign-meal").value;
    const pattern = document.getElementById("assign-pattern").value;
    if (idx === "") return showToast("Add a dish first!", true);
    const dish = meals.at(Number(idx));

    const setSlot = (y, m, d) => {
        const k = formatDateKey(y, m, d);
        if (!yearlyPlan[k]) yearlyPlan[k] = {};
        yearlyPlan[k][slot] = dish;
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

function renderSavedMealsList() {
    document.getElementById("recipe-count").textContent = meals.length;
    document.getElementById("saved-meals-list").innerHTML = meals.map((m, i) => `
        <li>
            <span><strong>${m.name}</strong> (${getMealTypesList(m).join(", ")})</span>
            <div class="saved-item-actions">
                <button type="button" class="btn-edit" onclick="startEditDish(${i})">Edit</button>
                <button type="button" class="btn-delete" onclick="deleteMeal(${i})">Remove</button>
            </div>
        </li>`
    ).join("");
}

function deleteMeal(i) {
    if (editingMealIndex === i) cancelEditDish();
    meals.splice(i, 1);
    saveToDisk();
    refreshAllViews();
    showToast("Removed dish.");
}
