let deleteAllDishesArmed = false;

function ensureSavedDishesModal() {
    if (document.getElementById("saved-dishes-modal")) return;

    const modal = document.createElement("div");
    modal.id = "saved-dishes-modal";
    modal.className = "modal-backdrop hidden";
    modal.onclick = closeSavedDishesModal;

    modal.innerHTML = `
        <div class="modal-box panel" style="max-width: 640px; max-height: 85vh; display: flex; flex-direction: column;" onclick="event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px; gap: 8px;">
                <h2 style="border: none; margin: 0; padding: 0;">Saved Dishes (<span id="modal-recipe-count">0</span>)</h2>
                <div style="display: flex; gap: 6px; align-items: center;">
                    <button type="button" id="delete-all-dishes-btn" class="btn-outline" style="padding: 4px 10px; font-size: 0.78rem; color: #b32428; border-color: #b32428;" onclick="deleteAllMeals(this)">Delete All</button>
                    <button type="button" class="btn-outline" style="padding: 4px 10px;" onclick="closeSavedDishesModal()">✕</button>
                </div>
            </div>

            <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                <input type="text" id="dish-search-input" placeholder="Search dishes..." oninput="renderSavedMealsList()" style="flex: 1; min-width: 160px; padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                <select id="dish-role-filter" onchange="renderSavedMealsList()" style="padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                    <option value="all">All Roles</option>
                    <option value="main">Main Dishes</option>
                    <option value="side">Side Dishes</option>
                </select>
                <select id="dish-time-filter" onchange="renderSavedMealsList()" style="padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                    <option value="all">All Meal Times</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                </select>
            </div>

            <ul id="saved-meals-list" class="saved-list" style="max-height: 55vh; overflow-y: auto;"></ul>
        </div>
    `;

    document.body.appendChild(modal);
}

function openSavedDishesModal() {
    ensureSavedDishesModal();
    resetDeleteAllDishesBtn();
    renderSavedMealsList();
    document.getElementById("saved-dishes-modal").classList.remove("hidden");
}

function closeSavedDishesModal() {
    resetDeleteAllDishesBtn();
    const modal = document.getElementById("saved-dishes-modal");
    if (modal) modal.classList.add("hidden");
}

function resetDeleteAllDishesBtn() {
    deleteAllDishesArmed = false;
    const btn = document.getElementById("delete-all-dishes-btn");
    if (btn) {
        btn.textContent = "Delete All";
        btn.classList.remove("btn-danger-confirm");
    }
}

function deleteAllMeals(btn) {
    if (!meals.length) {
        showToast("No saved dishes to delete.", true);
        return;
    }
    if (!deleteAllDishesArmed) {
        deleteAllDishesArmed = true;
        btn.textContent = "Confirm Delete All?";
        btn.classList.add("btn-danger-confirm");
        setTimeout(() => { resetDeleteAllDishesBtn(); }, 4000);
        return;
    }
    resetDeleteAllDishesBtn();
    if (typeof cancelEditDish === "function") cancelEditDish();
    meals = [];
    saveToDisk();
    refreshAllViews();
    showToast("Deleted all saved dishes.");
}

function renderSavedMealsList() {
    const countBadge = document.getElementById("recipe-count");
    if (countBadge) countBadge.textContent = meals.length;

    const modalCount = document.getElementById("modal-recipe-count");
    if (modalCount) modalCount.textContent = meals.length;

    const listEl = document.getElementById("saved-meals-list");
    if (!listEl) return;

    const query = (document.getElementById("dish-search-input")?.value || "").toLowerCase().trim();
    const roleFilter = document.getElementById("dish-role-filter")?.value || "all";
    const timeFilter = document.getElementById("dish-time-filter")?.value || "all";

    const filtered = meals.map((m, i) => ({ m, i })).filter(({ m }) => {
        const matchesQuery = !query || m.name.toLowerCase().includes(query);
        const matchesRole = roleFilter === "all" || (roleFilter === "side" ? isSideDish(m) : !isSideDish(m));
        const matchesTime = timeFilter === "all" || mealSupportsSlot(m, timeFilter);
        return matchesQuery && matchesRole && matchesTime;
    });

    listEl.innerHTML = filtered.length
        ? filtered.map(({ m, i }) => {
            const roleTag = isSideDish(m) ? "Side" : "Main";
            return `
            <li>
                <span><strong>${m.name}</strong> <small style="color: var(--text-muted);">[${roleTag} • ${getMealTypesList(m).join(", ")}]</small></span>
                <div class="saved-item-actions">
                    ${m.url ? `<a href="${m.url}" target="_blank" rel="noopener noreferrer" class="btn-edit" style="text-decoration: none;">Link ↗</a>` : ""}
                    <button type="button" class="btn-edit" onclick="startEditDish(${i})">Edit</button>
                    <button type="button" class="btn-delete" onclick="deleteMeal(${i})">Remove</button>
                </div>
            </li>`;
        }).join("")
        : `<li style="color: var(--text-muted); justify-content: center;">No matching dishes found.</li>`;
}

function deleteMeal(i) {
    if (editingMealIndex === i) cancelEditDish();
    meals.splice(i, 1);
    saveToDisk();
    refreshAllViews();
    showToast("Removed dish.");
}
