window.ModalExtras = (function () {
    let activeScale = 1;

    function scaleIngredientLine(line, multiplier) {
        if (multiplier === 1 || !window.GroceryCalculator) return line;
        const match = line.trim().match(/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s+(.+)$/);
        if (!match) return line;

        const parsed = window.GroceryCalculator.parseIngredientLine(line);
        const formatted = window.GroceryCalculator.formatFraction(parsed.qty * multiplier);
        return parsed.unit ? `${formatted} ${parsed.unit} ${parsed.name}` : `${formatted} ${parsed.name}`;
    }

    function copyMealToTomorrow(dateKey, fromSlot, targetSlot) {
        const plan = window.MealStore.getPlan();
        const entry = window.MealStore.normalizePlanSlot(plan[dateKey]?.[fromSlot]);
        if (!entry.main && !entry.sides.length) return window.CoreCalendar?.showToast("No meal to copy.", true);

        const parts = dateKey.split("-").map(Number);
        const d = new Date(parts.at(0), parts.at(1) - 1, parts.at(2));
        d.setDate(d.getDate() + 1);
        const nextKey = window.MealStore.formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());

        const nextPlan = Object.assign({}, plan);
        if (!nextPlan[nextKey]) nextPlan[nextKey] = {};
        nextPlan[nextKey][targetSlot] = {
            main: entry.main ? Object.assign({}, entry.main) : null,
            sides: entry.sides.map(s => Object.assign({}, s))
        };
        window.MealStore.savePlan(nextPlan);
        window.MealPlannerPlugin?.refreshAll();
        window.CoreCalendar?.showToast(`Copied to tomorrow's ${targetSlot}!`);
    }

    function renderControlsHTML(hasMeal) {
        if (!hasMeal) return "";
        const scaleBtns = [0.5, 1, 2, 3].map(sc =>
            `<button type="button" data-sc="${sc}" class="${sc === activeScale ? "btn-green" : "btn-outline"}" style="padding: 3px 8px; font-size: 0.78rem;">${sc}x</button>`
        ).join("");

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
                    <button type="button" id="cm-copy-btn" class="btn-outline" style="padding: 5px 10px; font-size: 0.80rem;">📋 Copy</button>
                </div>
            </div>
        `;
    }

    return {
        getScale: () => activeScale,
        resetScale() { activeScale = 1; },
        setScale(sc) { activeScale = sc; },
        scaleIngredientLine,
        copyMealToTomorrow,
        renderControlsHTML
    };
})();
