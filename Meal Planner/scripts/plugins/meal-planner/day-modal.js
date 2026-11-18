window.MealDayModal = (function () {
    let modalDateKey = "";

    function ensureModal() {
        if (document.getElementById("cell-modal")) return;
        const modal = document.createElement("div");
        modal.id = "cell-modal";
        modal.className = "modal-backdrop hidden";
        modal.addEventListener("click", close);

        modal.innerHTML = `
            <div class="modal-box panel" style="max-width: 480px; max-height: 86vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">
                    <h2 id="modal-date-title" style="border: none; margin: 0; padding: 0;">Day Details</h2>
                    <button type="button" id="cm-close-btn" class="btn-outline" style="padding: 4px 10px;">✕</button>
                </div>
                <div style="margin-bottom: 12px;">
                    <label style="font-weight: bold; font-size: 0.85rem; display: block; margin-bottom: 4px;">Meal Slot</label>
                    <select id="modal-slot" style="width: 100%; padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                        <option value="breakfast">Breakfast (Orange)</option>
                        <option value="lunch">Lunch (Green)</option>
                        <option value="dinner">Dinner (Purple)</option>
                    </select>
                </div>
                <div style="display: flex; gap: 6px; margin-bottom: 14px;">
                    <button type="button" id="mtab-view-btn" class="btn-green" style="flex: 1;">View Ingredients</button>
                    <button type="button" id="mtab-edit-btn" class="btn-outline" style="flex: 1;">Edit Meal &amp; Sides</button>
                </div>
                <div id="modal-view-pane"><div id="modal-ingredients-body" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px 14px; font-size: 0.92rem; line-height: 1.55;"></div></div>
                <div id="modal-edit-pane" class="stacked-form hidden">
                    <label>Main Dish</label>
                    <select id="modal-dish-select"></select>
                    <a id="modal-recipe-link" href="#" target="_blank" rel="noopener noreferrer" class="btn-outline hidden" style="text-align: center; text-decoration: none; padding: 8px;">Open Main Recipe Website ↗</a>
                    <label>Side Dishes (Check all that apply)</label>
                    <div id="modal-sides-list" style="max-height: 140px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: var(--bg-main); display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem;"></div>
                    <div class="form-actions">
                        <button type="button" id="cm-save-btn" class="btn-green btn-full">Save Meal</button>
                        <button type="button" id="cm-clear-btn" class="btn-outline">Clear</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector("#cm-close-btn").addEventListener("click", close);
        modal.querySelector("#modal-slot").addEventListener("change", () => { renderView(); populateDishes(); });
        modal.querySelector("#mtab-view-btn").addEventListener("click", () => switchTab("view"));
        modal.querySelector("#mtab-edit-btn").addEventListener("click", () => switchTab("edit"));
        modal.querySelector("#modal-dish-select").addEventListener("change", updateLink);
        modal.querySelector("#cm-save-btn").addEventListener("click", save);
        modal.querySelector("#cm-clear-btn").addEventListener("click", clear);
    }

    function renderView() {
        const slot = document.getElementById("modal-slot").value;
        const plan = window.MealStore.normalizePlanSlot(window.MealStore.getPlan()[modalDateKey]?.[slot]);
        const box = document.getElementById("modal-ingredients-body");
        if (!plan.main && !plan.sides.length) {
            box.innerHTML = `<p style="margin: 0; color: var(--text-muted);">No ${slot} planned for this day yet. Switch to <strong>Edit Meal &amp; Sides</strong> to add one.</p>`;
            return;
        }
        const scale = window.ModalExtras?.getScale() || 1;
        const fmt = line => window.ModalExtras ? window.ModalExtras.scaleIngredientLine(line, scale) : line;
        const sec = (d, lbl) => `<div style="margin-bottom: 12px;"><div style="font-weight: bold; color: var(--mode-color);">${lbl}: ${d.name}${d.url ? ` <a href="${d.url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.82rem; color: var(--mode-color); font-weight: bold;">Recipe ↗</a>` : ""}</div><ul style="margin: 4px 0 0 0; padding-left: 20px;">${(d.itemsList || []).map(i => `<li>${fmt(i)}</li>`).join("")}</ul></div>`;

        box.innerHTML = (plan.main ? sec(plan.main, "Main") : "") + plan.sides.map(s => sec(s, "Side")).join("") + (window.ModalExtras?.renderControlsHTML(true) || "");
        box.querySelectorAll("button[data-sc]").forEach(b => b.addEventListener("click", () => { window.ModalExtras.setScale(Number(b.dataset.sc)); renderView(); }));
        box.querySelector("#cm-copy-btn")?.addEventListener("click", () => window.ModalExtras.copyMealToTomorrow(modalDateKey, slot, box.querySelector("#modal-copy-target").value));
    }

    function updateLink() {
        const idx = document.getElementById("modal-dish-select").value;
        const linkEl = document.getElementById("modal-recipe-link");
        const dish = idx !== "" ? window.MealStore.getMeals().at(Number(idx)) : null;
        linkEl.href = dish?.url || "#";
        linkEl.classList.toggle("hidden", !dish?.url);
    }

    function populateDishes() {
        const slot = document.getElementById("modal-slot").value;
        const meals = window.MealStore.getMeals();
        const plan = window.MealStore.normalizePlanSlot(window.MealStore.getPlan()[modalDateKey]?.[slot]);
        const mains = meals.filter(m => !window.MealStore.isSideDish(m) && window.MealStore.mealSupportsSlot(m, slot));
        document.getElementById("modal-dish-select").innerHTML = `<option value="">-- No Main Dish --</option>` + mains.map(m => `<option value="${meals.indexOf(m)}" ${plan.main?.name === m.name ? "selected" : ""}>${m.name}</option>`).join("");
        updateLink();

        const sides = meals.filter(m => window.MealStore.isSideDish(m) && window.MealStore.mealSupportsSlot(m, slot));
        document.getElementById("modal-sides-list").innerHTML = sides.length
            ? sides.map(s => `<label style="font-weight: normal; display: flex; align-items: center; gap: 8px; margin: 0;"><input type="checkbox" value="${meals.indexOf(s)}" ${plan.sides.some(ps => ps.name === s.name) ? "checked" : ""}> ${s.name}</label>`).join("")
            : `<span style="color: var(--text-muted); font-size: 0.85rem;">No ${slot} side dishes saved yet.</span>`;
    }

    function switchTab(tab) {
        const isView = tab === "view";
        document.getElementById("modal-view-pane").classList.toggle("hidden", !isView);
        document.getElementById("modal-edit-pane").classList.toggle("hidden", isView);
        document.getElementById("mtab-view-btn").className = isView ? "btn-green" : "btn-outline";
        document.getElementById("mtab-edit-btn").className = !isView ? "btn-green" : "btn-outline";
    }

    function save() {
        const slot = document.getElementById("modal-slot").value;
        const meals = window.MealStore.getMeals();
        const mainIdx = document.getElementById("modal-dish-select").value;
        const sideIndices = Array.from(document.querySelectorAll("#modal-sides-list input:checked")).map(cb => Number(cb.value));
        const plan = Object.assign({}, window.MealStore.getPlan());
        if (!plan[modalDateKey]) plan[modalDateKey] = {};
        if (mainIdx === "" && !sideIndices.length) delete plan[modalDateKey][slot];
        else plan[modalDateKey][slot] = { main: mainIdx !== "" ? meals.at(Number(mainIdx)) : null, sides: sideIndices.map(i => meals.at(i)) };
        window.MealStore.savePlan(plan);
        close();
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast("Saved meal!");
    }

    function clear() {
        const slot = document.getElementById("modal-slot").value;
        const plan = Object.assign({}, window.MealStore.getPlan());
        if (plan[modalDateKey]) delete plan[modalDateKey][slot];
        window.MealStore.savePlan(plan);
        close();
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast("Cleared meal from day.");
    }

    function open(dateKey) {
        ensureModal();
        window.ModalExtras?.resetScale();
        modalDateKey = dateKey;
        const [y, m, d] = dateKey.split("-").map(Number);
        document.getElementById("modal-date-title").textContent = new Date(y, m - 1, d).toLocaleString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
        const slot = window.CoreCalendar?.getViewDate?.()?.activeTab || "breakfast";
        document.getElementById("modal-slot").value = slot;
        renderView(); populateDishes();
        const entry = window.MealStore.normalizePlanSlot(window.MealStore.getPlan()[dateKey]?.[slot]);
        switchTab(entry.main || entry.sides.length ? "view" : "edit");
        document.getElementById("cell-modal").classList.remove("hidden");
    }

    function close() { document.getElementById("cell-modal")?.classList.add("hidden"); }
    return { open, close };
})();
