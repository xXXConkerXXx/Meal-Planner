let selectedWeek = "";
let monthWeeks = [];

function buildMonthWeeks() {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);

    let cur = new Date(firstOfMonth);
    while (cur.getDay() !== 0) {
        cur.setDate(cur.getDate() - 1);
    }

    monthWeeks = [];
    let weekNum = 1;

    while (cur <= lastOfMonth) {
        const end = new Date(cur);
        end.setDate(end.getDate() + 6);

        const sStr = cur.toLocaleString("default", { month: "short", day: "numeric" });
        const eStr = end.toLocaleString("default", { month: "short", day: "numeric" });
        const iso = formatDateKey(cur.getFullYear(), cur.getMonth(), cur.getDate());

        monthWeeks.push({
            iso: iso,
            label: `Week ${weekNum}: Sun ${sStr} – Sat ${eStr}`,
            isCurrent: today >= cur && today <= end
        });

        cur.setDate(cur.getDate() + 7);
        weekNum++;
    }

    if (!selectedWeek || !monthWeeks.some(w => w.iso === selectedWeek)) {
        const currentMatch = monthWeeks.find(w => w.isCurrent);
        selectedWeek = currentMatch ? currentMatch.iso : (monthWeeks.length ? monthWeeks.at(0).iso : "");
    }
}

function changeGroceryWeek(delta) {
    if (!monthWeeks.length) return;
    const idx = monthWeeks.findIndex(w => w.iso === selectedWeek);
    const nextIdx = Math.max(0, Math.min(monthWeeks.length - 1, idx + delta));
    selectedWeek = monthWeeks.at(nextIdx).iso;
    renderGroceryList();
}

function renderGroceryList() {
    const box = document.getElementById("grocery-summary");
    const labelEl = document.getElementById("grocery-week-label");
    if (!selectedWeek) return;

    const activeWeekObj = monthWeeks.find(w => w.iso === selectedWeek);
    if (labelEl && activeWeekObj) {
        labelEl.textContent = activeWeekObj.label;
    }

    const parts = selectedWeek.split("-").map(Number);
    const start = new Date(parts.at(0), parts.at(1) - 1, parts.at(2));
    const totals = {};
    let count = 0;

    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const dayMeals = yearlyPlan[formatDateKey(day.getFullYear(), day.getMonth(), day.getDate())];
        if (!dayMeals) continue;

        ["breakfast", "lunch", "dinner"].forEach(slot => {
            const meal = dayMeals[slot];
            if (!meal) return;
            count++;
            (meal.itemsList || []).forEach(line => {
                const match = line.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+(.+)$/);
                const qty = match ? parseFloat(match.at(1)) : 1;
                const unit = match ? match.at(2).toLowerCase() : "x";
                const name = match ? match.at(3).trim() : line.trim();
                const key = `${name.toLowerCase()}|${unit}`;
                if (!totals[key]) totals[key] = { name: name, unit: unit, qty: 0 };
                totals[key].qty += qty;
            });
        });
    }

    const list = Object.values(totals);
    box.innerHTML = list.length
        ? `<p><strong>Scheduled Meals This Week:</strong> ${count}</p><ul class="grocery-items">` +
          list.map(i => `<li><input type="checkbox"><span><span class="qty-badge">${Number(i.qty.toFixed(2))} ${i.unit}</span> ${i.name}</span></li>`).join("") + `</ul>`
        : `<p>No meals planned for this week yet.</p>`;
}

function refreshAllViews() {
    const label = new Date(viewYear, viewMonth, 1).toLocaleString("default", { month: "long", year: "numeric" });
    document.getElementById("month-title").textContent = label;
    document.getElementById("edit-month-label").textContent = label;
    document.getElementById("season-badge").textContent = `Season: ${getSeason(viewMonth)}`;

    renderCalendar();
    populateDayDropdown();
    updateAssignMealDropdown();
    renderSavedMealsList();
    buildMonthWeeks();
    renderGroceryList();
}

document.getElementById("theme-select").value = activeTheme;
applyClasses();
loadBackupData();
refreshAllViews();
