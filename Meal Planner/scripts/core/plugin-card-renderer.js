window.CorePluginCardRenderer = {
    renderCard(p, depth, childCount, state) {
        const { missing, depsOk, active, collapsed, parentTitle, isVirtual } = state;
        const hasChildren = childCount > 0;
        const clampedPx = Math.min(depth, 3) * 14;
        const indent = depth > 0 ? `margin-left: ${clampedPx}px; border-left: 3px solid var(--title-color);` : "";
        const cursorStyle = hasChildren ? "cursor: pointer; user-select: none;" : "";
        const prefix = depth > 0 ? "↳ " : "";
        const btnLabel = missing.length ? "MISSING" : (!depsOk ? "LOCKED" : (active ? "ON" : "OFF"));
        const btnClass = !depsOk ? "btn-outline" : (active ? "btn-green" : "btn-outline");
        const extraHTML = typeof p.renderExtra === "function" ? p.renderExtra() : "";

        const countBadge = hasChildren
            ? `<span style="display: inline-block; padding: 1px 7px; font-size: 0.75rem; margin-left: 8px; border-radius: 999px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-muted);">${collapsed ? `▸ ${childCount}` : `▾ ${childCount}`}</span>`
            : "";

        const pathTag = depth >= 2 && parentTitle
            ? `<div style="font-size: 0.70rem; color: var(--title-color); font-weight: bold; margin-top: 2px;">Sub-plugin of ${parentTitle}</div>`
            : "";

        const removeBtn = isVirtual
            ? `<button type="button" data-remove-pkg="${p.id}" class="btn-outline" title="Uninstall imported plugin package" style="padding: 6px 8px; color: #b32428; border-color: #b32428;">🗑️</button>`
            : "";

        return `
            <div data-plugin-card="${p.id}" ${hasChildren ? `data-collapse-card="${p.id}" title="${collapsed ? "Click card to expand sub-plugins" : "Click card to minimize sub-plugins"}"` : ""} style="padding: 10px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); transition: all 0.18s ease; ${indent} ${cursorStyle} ${!depsOk ? "opacity: 0.65;" : ""}">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: bold; font-size: 0.92rem; display: flex; align-items: center; flex-wrap: wrap;">
                            <span>${prefix}${p.icon || "🔌"} ${p.title}</span>${countBadge}
                        </div>
                        ${pathTag}
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${missing.length ? `Requires missing plugin: ${missing.join(", ")}` : (p.description || "")}</div>
                    </div>
                    <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                        ${removeBtn}
                        <button type="button" data-toggle-plugin="${p.id}" class="${btnClass}" ${!depsOk ? "disabled" : ""} style="min-width: 68px;">
                            ${btnLabel}
                        </button>
                    </div>
                </div>
                ${extraHTML ? `<div data-stop-collapse="1">${extraHTML}</div>` : ""}
            </div>
        `;
    }
};
