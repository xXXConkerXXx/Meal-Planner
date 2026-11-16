let modalDateKey = "";

function openCellModal(dateKey) {
    modalDateKey = dateKey;
    const parts = dateKey.split("-").map(Number);
    const dateObj = new Date(parts.at(0), parts.at(1) - 1, parts.at(2));
    document.getElementById("modal-date-title").textContent = dateObj.toLocaleString("default", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
    document.getElementById("modal-slot").value = activeTab;
    populateModalDishes();
    document.getElementById("cell-modal").classList.remove("hidden");
}

function populateModalDishes() {
    const slot = document.getElementById("modal-slot").value;
    const sel = document.getElementById("modal-dish-select");
    const filtered = meals.filter(m => mealSupportsSlot(m, slot));
    const currentDish = yearlyPlan[modalDateKey]?.[slot];

    sel.innerHTML = filtered.length
        ? filtered.map(m => `<option value="${meals.indexOf(m)}" ${currentDish && currentDish.name === m.name ? "selected" : ""}>${m.name}</option>`).join("")
        : `<option value="">No ${slot} dishes saved yet</option>`;
}

function saveCellModal() {
    const slot = document.getElementById("modal-slot").value;
    const idx = document.getElementById("modal-dish-select").value;
    if (idx === "") return showToast("Add a dish in Edit Mode first!", true);

    if (!yearlyPlan[modalDateKey]) yearlyPlan[modalDateKey] = {};
    yearlyPlan[modalDateKey][slot] = meals.at(Number(idx));

    saveToDisk();
    closeCellModal();
    refreshAllViews();
    showToast("Updated day meal!");
}

function clearCellModal() {
    const slot = document.getElementById("modal-slot").value;
    if (yearlyPlan[modalDateKey]) {
        delete yearlyPlan[modalDateKey][slot];
    }
    saveToDisk();
    closeCellModal();
    refreshAllViews();
    showToast("Cleared meal from day.");
}

function closeCellModal() {
    document.getElementById("cell-modal").classList.add("hidden");
}
