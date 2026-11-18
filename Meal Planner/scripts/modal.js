let modalDateKey = "";

function ensureCellModal() {
    if (document.getElementById("cell-modal")) return;
    const modal = document.createElement("div");
    modal.id = "cell-modal";
    modal.className = "modal-backdrop hidden";
    modal.onclick = closeCellModal;

    modal.innerHTML = `
        <div class="modal-box panel" style="max-width: 480px; max-height: 86vh; overflow-y: auto;" onclick="event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 12px;">
                <h2 id="modal-date-title" style="border: none; margin: 0; padding: 0;">Day Details</h2>
                <button type="button" class="btn-outline" style="padding: 4px 10px;" onclick="closeCellModal()">✕</button>
            </div>

            <div style="margin-bottom: 12px;">
                <label style="font-weight: bold; font-size: 0.85rem; display: block; margin-bottom: 4px;">Meal Slot</label>
                <select id="modal-slot" onchange="onModalSlotChange()" style="width: 100%; padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                    <option value="breakfast">Breakfast (Orange)</option>
                    <option value="lunch">Lunch (Green)</option>
                    <option value="dinner">Dinner (Purple)</option>
                </select>
            </div>

            <div style="display: flex; gap: 6px; margin-bottom: 14px;">
                <button type="button" id="mtab-view-btn" class="btn-green" style="flex: 1;" onclick="switchModalTab('view')">View Ingredients</button>
                <button type="button" id="mtab-edit-btn" class="btn-outline" style="flex: 1;" onclick="switchModalTab('edit')">Edit Meal &amp; Sides</button>
            </div>

            <div id="modal-view-pane">
                <div id="modal-ingredients-body" style="background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px 14px; font-size: 0.92rem; line-height: 1.55;"></div>
            </div>

            <div id="modal-edit-pane" class="stacked-form hidden">
                <label>Main Dish</label>
                <select id="modal-dish-select" onchange="updateModalRecipeLink()"></select>

                <a id="modal-recipe-link" href="#" target="_blank" rel="noopener noreferrer" class="btn-outline hidden" style="text-align: center; text-decoration: none; padding: 8px;">Open Main Recipe Website ↗</a>

                <label>Side Dishes (Check all that apply)</label>
                <div id="modal-sides-list" style="max-height: 140px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: var(--bg-main); display: flex; flex-direction: column; gap: 6px; font-size: 0.9rem;"></div>

                <div class="form-actions">
                    <button type="button" class="btn-green btn-full" onclick="saveCellModal()">Save Meal</button>
                    <button type="button" class="btn-outline" onclick="clearCellModal()">Clear</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function openCellModal(dateKey) {
    ensureCellModal();
    if (window.ModalExtras) window.ModalExtras.resetScale();
    modalDateKey = dateKey;
    const parts = dateKey.split("-").map(Number);
    const dateObj = new Date(parts.at(0), parts.at(1) - 1, parts.at(2));
    document.getElementById("modal-date-title").textContent = dateObj.toLocaleString("default", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
    document.getElementById("modal-slot").value = activeTab;
    onModalSlotChange();
    const plan = normalizePlanSlot(yearlyPlan[modalDateKey]?.[activeTab]);
    switchModalTab(plan.main || plan.sides.length ? "view" : "edit");
    document.getElementById("cell-modal").classList.remove("hidden");
}

function switchModalTab(tab) {
    const isView = tab === "view";
    document.getElementById("modal-view-pane").classList.toggle("hidden", !isView);
    document.getElementById("modal-edit-pane").classList.toggle("hidden", isView);
    document.getElementById("mtab-view-btn").className = isView ? "btn-green" : "btn-outline";
    document.getElementById("mtab-edit-btn").className = !isView ? "btn-green" : "btn-outline";
}

function onModalSlotChange() {
    renderModalIngredientsView();
    populateModalDishes();
}

function renderModalIngredientsView() {
    const slot = document.getElementById("modal-slot").value;
    const plan = normalizePlanSlot(yearlyPlan[modalDateKey]?.[slot]);
    const box = document.getElementById("modal-ingredients-body");

    if (!plan.main && !plan.sides.length) {
        box.innerHTML = `<p style="margin: 0; color: var(--text-muted);">No ${slot} planned for this day yet. Switch to <strong>Edit Meal &amp; Sides</strong> to add one.</p>`;
        return;
    }

    const scale = window.ModalExtras ? window.ModalExtras.getScale() : 1;
    const formatLine = line => window.ModalExtras ? window.ModalExtras.scaleIngredientLine(line, scale) : line;

    const renderDishSection = (dish, label) => {
        const link = dish.url ? ` <a href="${dish.url}" target="_blank" rel="noopener noreferrer" style="font-size: 0.82rem; color: var(--mode-color); font-weight: bold;">Recipe ↗</a>` : "";
        const items = (dish.itemsList || []).map(i => `<li>${formatLine(i)}</li>`).join("");
        return `<div style="margin-bottom: 12px;"><div style="font-weight: bold; color: var(--mode-color);">${label}: ${dish.name}${link}</div><ul style="margin: 4px 0 0 0; padding-left: 20px;">${items}</ul></div>`;
    };

    let html = "";
    if (plan.main) html += renderDishSection(plan.main, "Main");
    plan.sides.forEach(side => { html += renderDishSection(side, "Side"); });
    if (window.ModalExtras) html += window.ModalExtras.renderControlsHTML(true);
    box.innerHTML = html;
}

function updateModalRecipeLink() {
    const idx = document.getElementById("modal-dish-select").value;
    const linkEl = document.getElementById("modal-recipe-link");
    const dish = idx !== "" ? meals.at(Number(idx)) : null;
    if (dish && dish.url) {
        linkEl.href = dish.url;
        linkEl.classList.remove("hidden");
    } else {
        linkEl.href = "#";
        linkEl.classList.add("hidden");
    }
}

function populateModalDishes() {
    const slot = document.getElementById("modal-slot").value;
    const sel = document.getElementById("modal-dish-select");
    const sidesBox = document.getElementById("modal-sides-list");
    const plan = normalizePlanSlot(yearlyPlan[modalDateKey]?.[slot]);

    const mainDishes = meals.filter(m => !isSideDish(m) && mealSupportsSlot(m, slot));
    sel.innerHTML = `<option value="">-- No Main Dish --</option>` + mainDishes.map(m =>
        `<option value="${meals.indexOf(m)}" ${plan.main && plan.main.name === m.name ? "selected" : ""}>${m.name}</option>`
    ).join("");
    updateModalRecipeLink();

    const sideDishes = meals.filter(m => isSideDish(m) && mealSupportsSlot(m, slot));
    sidesBox.innerHTML = sideDishes.length
        ? sideDishes.map(s => {
            const checked = plan.sides.some(ps => ps.name === s.name) ? "checked" : "";
            return `<label style="font-weight: normal; display: flex; align-items: center; gap: 8px; margin: 0;"><input type="checkbox" value="${meals.indexOf(s)}" ${checked}> ${s.name}</label>`;
        }).join("")
        : `<span style="color: var(--text-muted); font-size: 0.85rem;">No ${slot} side dishes saved yet.</span>`;
}

function saveCellModal() {
    const slot = document.getElementById("modal-slot").value;
    const mainIdx = document.getElementById("modal-dish-select").value;
    const sideIndices = Array.from(document.querySelectorAll("#modal-sides-list input:checked")).map(cb => Number(cb.value));

    if (!yearlyPlan[modalDateKey]) yearlyPlan[modalDateKey] = {};
    if (mainIdx === "" && !sideIndices.length) {
        delete yearlyPlan[modalDateKey][slot];
    } else {
        yearlyPlan[modalDateKey][slot] = {
            main: mainIdx !== "" ? meals.at(Number(mainIdx)) : null,
            sides: sideIndices.map(i => meals.at(i))
        };
    }

    saveToDisk();
    closeCellModal();
    refreshAllViews();
    showToast("Saved meal!");
}

function clearCellModal() {
    const slot = document.getElementById("modal-slot").value;
    if (yearlyPlan[modalDateKey]) delete yearlyPlan[modalDateKey][slot];
    saveToDisk();
    closeCellModal();
    refreshAllViews();
    showToast("Cleared meal from day.");
}

function closeCellModal() {
    const modal = document.getElementById("cell-modal");
    if (modal) modal.classList.add("hidden");
}
