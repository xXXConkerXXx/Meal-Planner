window.SavedDishesModal = (function () {
    const expanded = new Set();
    let deleteAllArmed = false;

    function analyze(dish, terms) {
        const items = dish.itemsList || [];
        const matched = items.filter(line => terms.some(t => line.toLowerCase().includes(t)));
        const nameHit = terms.some(t => (dish.name || "").toLowerCase().includes(t));
        const ratio = items.length ? matched.length / items.length : 0;
        return { nameHit, matched, total: items.length, score: matched.length * 2 + ratio + (nameHit ? 0.5 : 0) };
    }

    function ensureModal() {
        if (document.getElementById("saved-dishes-modal")) return;
        const modal = document.createElement("div");
        modal.id = "saved-dishes-modal";
        modal.className = "modal-backdrop hidden";
        modal.addEventListener("click", close);

        modal.innerHTML = `
            <div class="modal-box panel" style="max-width: 640px; max-height: 85vh; display: flex; flex-direction: column;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px; gap: 8px;">
                    <h2 style="border: none; margin: 0; padding: 0;">Saved Dishes (<span id="modal-recipe-count">0</span>)</h2>
                    <div style="display: flex; gap: 6px; align-items: center;">
                        <button type="button" id="delete-all-dishes-btn" class="btn-outline" style="padding: 4px 10px; font-size: 0.78rem; color: #b32428; border-color: #b32428;">Delete All</button>
                        <button type="button" id="sd-close-btn" class="btn-outline" style="padding: 4px 10px;">✕</button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <input type="text" id="dish-search-input" placeholder="Search dish or ingredients you have (e.g. flour, corncob)..." style="flex: 1; min-width: 160px; padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                    <select id="dish-role-filter" style="padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                        <option value="all">All Roles</option><option value="main">Main Dishes</option><option value="side">Side Dishes</option>
                    </select>
                    <select id="dish-time-filter" style="padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                        <option value="all">All Meal Times</option><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option>
                    </select>
                </div>
                <ul id="saved-meals-list" class="saved-list" style="max-height: 55vh; overflow-y: auto;"></ul>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector("#sd-close-btn").addEventListener("click", close);
        modal.querySelector("#delete-all-dishes-btn").addEventListener("click", handleDeleteAll);
        modal.querySelector("#dish-search-input").addEventListener("input", render);
        modal.querySelector("#dish-role-filter").addEventListener("change", render);
        modal.querySelector("#dish-time-filter").addEventListener("change", render);
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
            deleteAllArmed = true; btn.textContent = "Confirm Delete All?"; btn.classList.add("btn-danger-confirm");
            setTimeout(resetDeleteAllBtn, 4000);
            return;
        }
        resetDeleteAllBtn();
        window.MealEditor?.cancelEdit();
        window.MealStore.saveMeals([]);
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast("Deleted all saved dishes.");
    }

    function render() {
        const meals = window.MealStore.getMeals();
        ["recipe-count", "modal-recipe-count"].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = String(meals.length); });
        const listEl = document.getElementById("saved-meals-list");
        if (!listEl) return;

        const terms = String(document.getElementById("dish-search-input")?.value || "").toLowerCase().split(",").map(s => s.trim()).filter(Boolean);
        const role = document.getElementById("dish-role-filter")?.value || "all";
        const time = document.getElementById("dish-time-filter")?.value || "all";

        const filtered = meals.map((m, i) => ({ m, i, info: analyze(m, terms) })).filter(({ m, info }) =>
            (role === "all" || (role === "side" ? window.MealStore.isSideDish(m) : !window.MealStore.isSideDish(m))) &&
            (time === "all" || window.MealStore.mealSupportsSlot(m, time)) &&
            (!terms.length || info.nameHit || info.matched.length > 0)
        );
        if (terms.length) filtered.sort((a, b) => b.info.score - a.info.score || a.m.name.localeCompare(b.m.name));

        listEl.innerHTML = filtered.length ? filtered.map(({ m, i, info }) => {
            const showChecks = terms.length > 0 && info.matched.length > 0;
            const isOpen = expanded.has(i) || showChecks;
            const badge = showChecks && info.total ? `<small style="color: var(--mode-color); font-weight: bold; margin-left: 6px;">(${info.matched.length}/${info.total} ingredients)</small>` : "";
            const ingHTML = isOpen && info.total ? `<ul style="margin: 6px 0 0 0; padding-left: 14px; font-size: 0.84rem; list-style: none;">${(m.itemsList || []).map(l => {
                const hit = showChecks && info.matched.includes(l);
                return `<li style="padding: 1px 0; border: none; background: transparent; ${hit ? "color: var(--text-main); font-weight: bold;" : "color: var(--text-muted);"}">${showChecks ? (hit ? "✅" : "⬜") : "•"} ${l}</li>`;
            }).join("")}</ul>` : "";

            return `
                <li style="align-items: flex-start;">
                    <div style="flex: 1; cursor: pointer;" data-expand-idx="${i}">
                        <strong>${m.name}</strong>${badge} <small style="color: var(--text-muted);">${isOpen ? "▾" : "▸"}</small><br>
                        <small style="color: var(--text-muted);">[${window.MealStore.isSideDish(m) ? "Side" : "Main"} • ${window.MealStore.getMealTypesList(m).join(", ")}]</small>${ingHTML}
                    </div>
                    <div class="saved-item-actions">
                        ${m.url ? `<a href="${m.url}" target="_blank" rel="noopener noreferrer" class="btn-edit" style="text-decoration: none;">Link ↗</a>` : ""}
                        <button type="button" class="btn-edit" data-edit-idx="${i}">Edit</button>
                        <button type="button" class="btn-delete" data-del-idx="${i}">Remove</button>
                    </div>
                </li>`;
        }).join("") : `<li style="color: var(--text-muted); justify-content: center;">No matching dishes found.</li>`;

        listEl.querySelectorAll("[data-expand-idx]").forEach(el => el.addEventListener("click", () => {
            const idx = Number(el.dataset.expandIdx);
            if (expanded.has(idx)) expanded.delete(idx); else expanded.add(idx);
            render();
        }));
        listEl.querySelectorAll("[data-edit-idx]").forEach(b => b.addEventListener("click", () => window.MealEditor?.startEdit(Number(b.dataset.editIdx))));
        listEl.querySelectorAll("[data-del-idx]").forEach(b => b.addEventListener("click", () => {
            const list = Array.from(window.MealStore.getMeals());
            list.splice(Number(b.dataset.delIdx), 1);
            window.MealStore.saveMeals(list);
            window.MealPlannerPlugin?.refreshAll();
            window.CoreCalendar?.showToast("Removed dish.");
        }));
    }

    function open() { ensureModal(); resetDeleteAllBtn(); render(); document.getElementById("saved-dishes-modal").classList.remove("hidden"); }
    function close() { resetDeleteAllBtn(); document.getElementById("saved-dishes-modal")?.classList.add("hidden"); }
    return { open, close, render };
})();
