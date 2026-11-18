window.ModalExtras = (function () {
    let activeScale = 1;

    function scaleIngredientLine(line, multiplier) {
        if (multiplier === 1 || typeof parseIngredientLine !== "function" || typeof formatFraction !== "function") {
            return line;
        }
        const match = line.trim().match(/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s+(.+)$/);
        if (!match) return line;

        const parsed = parseIngredientLine(line);
        const scaledQty = parsed.qty * multiplier;
        const formatted = formatFraction(scaledQty);
        return parsed.unit ? `${formatted} ${parsed.unit} ${parsed.name}` : `${formatted} ${parsed.name}`;
    }

    function getNextDateKey(dateKey) {
        const parts = dateKey.split("-").map(Number);
        const d = new Date(parts.at(0), parts.at(1) - 1, parts.at(2));
        d.setDate(d.getDate() + 1);
        return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
    }

    function copyMealToTomorrow(dateKey, fromSlot, targetSlot) {
        const plan = normalizePlanSlot(yearlyPlan[dateKey]?.[fromSlot]);
        if (!plan.main && !plan.sides.length) {
            showToast("No meal to copy.", true);
            return;
        }

        const nextKey = getNextDateKey(dateKey);
        if (!yearlyPlan[nextKey]) yearlyPlan[nextKey] = {};
        yearlyPlan[nextKey][targetSlot] = {
            main: plan.main ? Object.assign({}, plan.main) : null,
            sides: plan.sides.map(s => Object.assign({}, s))
        };

        saveToDisk();
        refreshAllViews();
        showToast(`Copied to tomorrow's ${targetSlot}!`);
    }

    function renderControlsHTML(hasMeal) {
        if (!hasMeal) return "";
        const scales = [0.5, 1, 2, 3];
        const scaleBtns = scales.map(sc => {
            const cls = sc === activeScale ? "btn-green" : "btn-outline";
            return `<button type="button" class="${cls}" style="padding: 3px 8px; font-size: 0.78rem;" onclick="window.ModalExtras.setScale(${sc})">${sc}x</button>`;
        }).join("");

        return `
            <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                    <span style="font-size: 0.80rem; font-weight: bold; color: var(--text-muted);">Scale Servings:</span>
                    <div style="display: flex; gap: 4px;">${scaleBtns}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span style="font-size: 0.80rem; font-weight: bold; color: var(--text-muted);">Copy to Tomorrow:</span>
                    <select id="modal-copy-target" style="flex: 1; min-width: 115px; padding: 5px 8px; font-size: 0.80rem; background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
                        <option value="lunch" selected>Lunch (Leftovers)</option>
                        <option value="dinner">Dinner</option>
                        <option value="breakfast">Breakfast</option>
                    </select>
                    <button type="button" class="btn-outline" style="padding: 5px 10px; font-size: 0.80rem;" onclick="window.ModalExtras.copyFromDropdown()">📋 Copy</button>
                </div>
            </div>
        `;
    }

    return {
        getScale: () => activeScale,
        resetScale() { activeScale = 1; },
        setScale(sc) {
            activeScale = sc;
            if (typeof renderModalIngredientsView === "function") renderModalIngredientsView();
        },
        scaleIngredientLine,
        renderControlsHTML,
        copyFromDropdown() {
            if (typeof modalDateKey !== "string" || !modalDateKey) return;
            const slot = document.getElementById("modal-slot")?.value || activeTab;
            const target = document.getElementById("modal-copy-target")?.value || "lunch";
            copyMealToTomorrow(modalDateKey, slot, target);
        }
    };
})();
