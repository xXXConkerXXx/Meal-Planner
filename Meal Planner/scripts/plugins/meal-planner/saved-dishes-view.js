window.SavedDishesView = {
    analyze(dish, terms) {
        const items = dish.itemsList || [];
        const matched = items.filter(line => terms.some(t => line.toLowerCase().includes(t)));
        const nameHit = terms.some(t => (dish.name || "").toLowerCase().includes(t));
        const ratio = items.length ? matched.length / items.length : 0;
        return { nameHit, matched, total: items.length, score: matched.length * 2 + ratio + (nameHit ? 0.5 : 0) };
    },

    buildModalHTML() {
        return `
            <div class="modal-box panel" style="max-width: 640px; max-height: 85vh; display: flex; flex-direction: column;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px; gap: 8px; flex-wrap: wrap;">
                    <h2 style="border: none; margin: 0; padding: 0;">Saved Dishes (<span id="modal-recipe-count">0</span>)</h2>
                    <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                        <button type="button" id="restore-starters-btn" class="btn-outline" style="padding: 4px 10px; font-size: 0.78rem;">🍱 Restore Starters</button>
                        <button type="button" id="delete-all-dishes-btn" class="btn-outline" style="padding: 4px 10px; font-size: 0.78rem; color: #b32428; border-color: #b32428;">Delete All</button>
                        <button type="button" id="sd-close-btn" class="btn-outline" style="padding: 4px 10px;">✕</button>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                    <input type="text" id="dish-search-input" placeholder="Search dish or ingredients you have..." style="flex: 1; min-width: 160px; padding: 8px 10px; background: var(--bg-main); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 6px; font-family: inherit;">
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
    },

    getCategoryMeta(dish) {
        const order = ["breakfast", "lunch", "dinner"];
        const types = order.filter(t => window.MealStore.getMealTypesList(dish).includes(t));
        const key = types.join("+") || "other";
        const labels = {
            "breakfast": { rank: 1, title: "🌅 Breakfast" },
            "lunch": { rank: 2, title: "🥪 Lunch" },
            "dinner": { rank: 3, title: "🍽️ Dinner" },
            "breakfast+lunch": { rank: 4, title: "🌅🥪 Breakfast & Lunch" },
            "breakfast+dinner": { rank: 5, title: "🌅🍽️ Breakfast & Dinner" },
            "lunch+dinner": { rank: 6, title: "🥪🍽️ Lunch & Dinner" },
            "breakfast+lunch+dinner": { rank: 7, title: "🌟 Breakfast, Lunch & Dinner" },
            "other": { rank: 8, title: "📋 Other Dishes" }
        };
        return Object.assign({ key }, labels[key] || labels.other);
    },

    renderRow({ m, i, info }, terms, expanded) {
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
    },

    groupAndRenderRows(filtered, terms, expanded, collapsedCats) {
        const sorted = Array.from(filtered).sort((a, b) => {
            if (terms.length && b.info.score !== a.info.score) return b.info.score - a.info.score;
            const catA = this.getCategoryMeta(a.m);
            const catB = this.getCategoryMeta(b.m);
            if (catA.rank !== catB.rank) return catA.rank - catB.rank;
            return a.m.name.localeCompare(b.m.name);
        });

        const groups = [];
        sorted.forEach(row => {
            const meta = this.getCategoryMeta(row.m);
            let grp = groups.find(g => g.key === meta.key);
            if (!grp) {
                grp = { key: meta.key, title: meta.title, rows: [] };
                groups.push(grp);
            }
            grp.rows.push(row);
        });

        return groups.map((grp, gIdx) => {
            const isCollapsed = !terms.length && collapsedCats?.has(grp.key);
            const arrow = isCollapsed ? "▸" : "▾";
            const header = `
                <li data-cat-toggle="${grp.key}" title="Click to minimize or expand" style="background: var(--bg-tab); font-weight: bold; color: var(--title-color); font-size: 0.85rem; padding: 6px 10px; border: none; border-radius: 6px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; margin-top: ${gIdx ? "6px" : "0"};">
                    <span>${grp.title} <small style="color: var(--text-muted); font-weight: normal;">(${grp.rows.length})</small></span>
                    <span>${arrow}</span>
                </li>`;
            const body = isCollapsed ? "" : grp.rows.map(r => this.renderRow(r, terms, expanded)).join("");
            return header + body;
        }).join("");
    }
};
