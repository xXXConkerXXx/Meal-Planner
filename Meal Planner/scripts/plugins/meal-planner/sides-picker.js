window.AssignSidesPicker = (function () {
    let selectedIndices = new Set();

    function getSelectedDishes() {
        const meals = window.MealStore?.getMeals() || [];
        return Array.from(selectedIndices).map(i => meals.at(i)).filter(Boolean);
    }

    function updateLabel() {
        const btn = document.getElementById("assign-sides-trigger");
        if (!btn) return;
        const chosen = getSelectedDishes();
        if (!chosen.length) btn.textContent = "None selected (Click to choose) ▾";
        else if (chosen.length <= 2) btn.textContent = `${chosen.map(s => s.name).join(", ")} ▾`;
        else btn.textContent = `${chosen.length} side dishes selected ▾`;
    }

    function renderList() {
        const listEl = document.getElementById("assign-sides-list");
        const slotSel = document.getElementById("assign-slot");
        const searchEl = document.getElementById("assign-sides-search");
        if (!listEl || !slotSel || !window.MealStore) return;

        const slot = slotSel.value;
        const meals = window.MealStore.getMeals();
        const query = (searchEl ? searchEl.value : "").toLowerCase().trim();
        const validSides = meals.filter(m => window.MealStore.isSideDish(m) && window.MealStore.mealSupportsSlot(m, slot));
        const validSet = new Set(validSides.map(m => meals.indexOf(m)));

        selectedIndices = new Set(Array.from(selectedIndices).filter(idx => validSet.has(idx)));
        updateLabel();

        const filtered = validSides.filter(m => !query || m.name.toLowerCase().includes(query));
        if (!filtered.length) {
            listEl.innerHTML = `<div style="color: var(--text-muted); font-size: 0.84rem; padding: 6px; text-align: center;">No matching ${slot} side dishes.</div>`;
            return;
        }

        listEl.innerHTML = filtered.map(s => {
            const idx = meals.indexOf(s);
            const checked = selectedIndices.has(idx) ? "checked" : "";
            return `
                <label style="font-weight: normal; display: flex; align-items: center; gap: 8px; padding: 4px 6px; border-radius: 4px; margin: 0; cursor: pointer;">
                    <input type="checkbox" value="${idx}" ${checked} style="width: auto; margin: 0;">
                    <span>${s.name}</span>
                </label>
            `;
        }).join("");

        listEl.querySelectorAll("input[type='checkbox']").forEach(cb => {
            cb.addEventListener("change", () => {
                const idx = Number(cb.value);
                if (cb.checked) selectedIndices.add(idx);
                else selectedIndices.delete(idx);
                updateLabel();
            });
        });
    }

    function buildWidget() {
        const wrap = document.createElement("div");
        wrap.id = "assign-sides-box";
        wrap.style.cssText = "position: relative; margin: 8px 0;";
        wrap.innerHTML = `
            <label for="assign-sides-trigger">Side Dishes (Optional)</label>
            <button type="button" id="assign-sides-trigger" class="btn-outline" style="width: 100%; text-align: left; display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; font-weight: normal; background: var(--bg-main); color: var(--text-main);">
                None selected (Click to choose) ▾
            </button>
            <div id="assign-sides-popover" class="hidden" style="position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 30; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 8px; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);">
                <div style="display: flex; gap: 6px; margin-bottom: 6px;">
                    <input type="text" id="assign-sides-search" placeholder="Filter sides..." style="flex: 1; padding: 5px 8px; font-size: 0.82rem; margin: 0;">
                    <button type="button" id="assign-sides-clear" class="btn-outline" style="padding: 4px 8px; font-size: 0.76rem;">Clear</button>
                </div>
                <div id="assign-sides-list" style="max-height: 165px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px; font-size: 0.88rem;"></div>
            </div>
        `;

        const trigger = wrap.querySelector("#assign-sides-trigger");
        const popover = wrap.querySelector("#assign-sides-popover");
        const search = wrap.querySelector("#assign-sides-search");

        trigger.addEventListener("click", e => {
            e.stopPropagation();
            const opening = popover.classList.contains("hidden");
            popover.classList.toggle("hidden", !opening);
            if (opening) { renderList(); search.focus(); }
        });
        popover.addEventListener("click", e => e.stopPropagation());
        document.addEventListener("click", () => popover.classList.add("hidden"));
        search.addEventListener("input", renderList);
        wrap.querySelector("#assign-sides-clear").addEventListener("click", () => { selectedIndices.clear(); renderList(); });
        return wrap;
    }

    return {
        mountBefore(targetEl) {
            if (!targetEl || document.getElementById("assign-sides-box")) return;
            targetEl.parentNode.insertBefore(buildWidget(), targetEl);
            renderList();
        },
        refresh: renderList,
        getSelectedDishes,
        closePopover() { document.getElementById("assign-sides-popover")?.classList.add("hidden"); }
    };
})();
