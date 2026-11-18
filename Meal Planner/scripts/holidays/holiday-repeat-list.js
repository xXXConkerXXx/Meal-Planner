window.HolidayRepeatList = {
    render(container) {
        if (!container || !window.HolidayRepeatStore) return;
        let listEl = document.getElementById("holiday-repeat-list");
        if (!listEl) {
            listEl = document.createElement("div");
            listEl.id = "holiday-repeat-list";
            listEl.style.cssText = "margin-top: 10px; display: flex; flex-direction: column; gap: 6px;";
            container.appendChild(listEl);
        }

        const rules = window.HolidayRepeatStore.getAll();
        if (!rules.length) {
            listEl.innerHTML = "";
            return;
        }

        listEl.innerHTML = rules.map((r, idx) => {
            const hol = (window.HolidayRules?.LIST || []).find(h => h.id === r.holidayId);
            const label = hol ? `${hol.icon} ${hol.name}` : r.holidayId;
            const sidesStr = (r.sideNames && r.sideNames.length) ? ` + ${r.sideNames.join(" + ")}` : "";
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-main); font-size: 0.82rem;">
                    <span>🔁 <strong>${label}</strong> (${r.slot}): ${r.mainName}${sidesStr}</span>
                    <button type="button" data-del-idx="${idx}" class="btn-outline" style="padding: 2px 8px; font-size: 0.74rem; color: #b32428; border-color: #b32428;">✕</button>
                </div>
            `;
        }).join("");

        listEl.querySelectorAll("button[data-del-idx]").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-del-idx"), 10);
                window.HolidayRepeatStore.removeAt(idx);
                if (typeof saveToDisk === "function") saveToDisk();
                window.HolidayRepeatList.render(container);
                if (typeof refreshAllViews === "function") refreshAllViews();
                if (typeof showToast === "function") showToast("Removed yearly holiday meal.");
            });
        });
    }
};
