window.PantryMatcher = (function () {
    const expandedIndices = new Set();

    function parseTerms(raw) {
        return String(raw || "")
            .toLowerCase()
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
    }

    function analyzeDish(dish, terms) {
        const nameLower = (dish.name || "").toLowerCase();
        const items = dish.itemsList || [];
        const matchedLines = [];
        const missingLines = [];

        items.forEach(line => {
            const lowerLine = line.toLowerCase();
            if (terms.some(t => lowerLine.includes(t))) {
                matchedLines.push(line);
            } else {
                missingLines.push(line);
            }
        });

        const nameHit = terms.some(t => nameLower.includes(t));
        const ratio = items.length ? matchedLines.length / items.length : 0;

        return {
            nameHit,
            matchedLines,
            missingLines,
            totalItems: items.length,
            score: matchedLines.length * 2 + ratio + (nameHit ? 0.5 : 0)
        };
    }

    function toggleExpand(idx) {
        if (expandedIndices.has(idx)) expandedIndices.delete(idx);
        else expandedIndices.add(idx);
        if (typeof renderSavedMealsList === "function") renderSavedMealsList();
    }

    function hookSavedMealsModal() {
        const origRender = window.renderSavedMealsList;
        if (typeof origRender !== "function" || origRender.dataset?.pantryHooked) return;

        window.renderSavedMealsList = function () {
            const searchInput = document.getElementById("dish-search-input");
            if (searchInput) {
                searchInput.placeholder = "Search dish or ingredients you have (e.g. flour, corncob)...";
            }

            const countBadge = document.getElementById("recipe-count");
            if (countBadge) countBadge.textContent = meals.length;

            const modalCount = document.getElementById("modal-recipe-count");
            if (modalCount) modalCount.textContent = meals.length;

            const listEl = document.getElementById("saved-meals-list");
            if (!listEl) return;

            const rawQuery = searchInput?.value || "";
            const terms = parseTerms(rawQuery);
            const roleFilter = document.getElementById("dish-role-filter")?.value || "all";
            const timeFilter = document.getElementById("dish-time-filter")?.value || "all";

            const filtered = meals
                .map((m, i) => ({ m, i, info: analyzeDish(m, terms) }))
                .filter(({ m, info }) => {
                    const matchesRole = roleFilter === "all" || (roleFilter === "side" ? isSideDish(m) : !isSideDish(m));
                    const matchesTime = timeFilter === "all" || mealSupportsSlot(m, timeFilter);
                    if (!matchesRole || !matchesTime) return false;
                    if (!terms.length) return true;
                    return info.nameHit || info.matchedLines.length > 0;
                });

            if (terms.length) {
                filtered.sort((a, b) => b.info.score - a.info.score || a.m.name.localeCompare(b.m.name));
            }

            listEl.innerHTML = filtered.length
                ? filtered.map(({ m, i, info }) => {
                    const roleTag = isSideDish(m) ? "Side" : "Main";
                    const showCheckmarks = terms.length > 0 && info.matchedLines.length > 0;
                    const isOpen = expandedIndices.has(i) || showCheckmarks;
                    const statusBadge = (showCheckmarks && info.totalItems > 0)
                        ? `<small style="color: var(--mode-color); font-weight: bold; margin-left: 6px;">(${info.matchedLines.length}/${info.totalItems} ingredients)</small>`
                        : "";

                    let ingredientsHTML = "";
                    if (isOpen && info.totalItems > 0) {
                        const rows = (m.itemsList || []).map(line => {
                            const isMatched = showCheckmarks && info.matchedLines.includes(line);
                            const icon = showCheckmarks ? (isMatched ? "✅" : "⬜") : "•";
                            const style = isMatched ? "color: var(--text-main); font-weight: bold;" : "color: var(--text-muted);";
                            return `<li style="padding: 1px 0; border: none; background: transparent; ${style}">${icon} ${line}</li>`;
                        }).join("");
                        ingredientsHTML = `<ul style="margin: 6px 0 0 0; padding-left: 14px; font-size: 0.84rem; list-style: none;">${rows}</ul>`;
                    }

                    return `
                    <li style="align-items: flex-start;">
                        <div style="flex: 1; cursor: pointer;" onclick="window.PantryMatcher.toggleExpand(${i})" title="Click to view ingredients">
                            <strong>${m.name}</strong>${statusBadge}
                            <small style="color: var(--text-muted); margin-left: 4px;">${isOpen ? "▾" : "▸"}</small><br>
                            <small style="color: var(--text-muted);">[${roleTag} • ${getMealTypesList(m).join(", ")}]</small>
                            ${ingredientsHTML}
                        </div>
                        <div class="saved-item-actions">
                            ${m.url ? `<a href="${m.url}" target="_blank" rel="noopener noreferrer" class="btn-edit" style="text-decoration: none;">Link ↗</a>` : ""}
                            <button type="button" class="btn-edit" onclick="startEditDish(${i})">Edit</button>
                            <button type="button" class="btn-delete" onclick="deleteMeal(${i})">Remove</button>
                        </div>
                    </li>`;
                }).join("")
                : `<li style="color: var(--text-muted); justify-content: center;">No matching dishes found.</li>`;
        };
        window.renderSavedMealsList.dataset = { pantryHooked: "1" };
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hookSavedMealsModal);
    else hookSavedMealsModal();

    return { toggleExpand, analyzeDish };
})();
