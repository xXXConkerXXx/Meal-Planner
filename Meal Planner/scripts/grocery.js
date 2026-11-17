let selectedWeek = "";
let monthWeeks = [];

const UNICODE_FRACTIONS = {
    "¼": 0.25, "½": 0.5, "¾": 0.75,
    "⅓": 1 / 3, "⅔": 2 / 3,
    "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875
};

const FRACTION_LABELS = [
    { val: 0.125, label: "1/8" },
    { val: 0.25, label: "1/4" },
    { val: 1 / 3, label: "1/3" },
    { val: 0.375, label: "3/8" },
    { val: 0.5, label: "1/2" },
    { val: 0.625, label: "5/8" },
    { val: 2 / 3, label: "2/3" },
    { val: 0.75, label: "3/4" },
    { val: 0.875, label: "7/8" }
];

const KNOWN_UNITS = new Set([
    "cup", "cups", "tsp", "teaspoon", "teaspoons", "tbsp", "tablespoon", "tablespoons",
    "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds",
    "g", "gram", "grams", "kg", "ml", "l", "liter", "liters",
    "stick", "sticks", "can", "cans", "jar", "jars", "bag", "bags",
    "box", "boxes", "pack", "packs", "package", "packages",
    "clove", "cloves", "slice", "slices", "piece", "pieces", "pinch", "dash"
]);

function formatFraction(num) {
    const whole = Math.floor(num + 1e-6);
    const rem = num - whole;
    if (rem < 0.02) return String(whole);

    const match = FRACTION_LABELS.find(f => Math.abs(rem - f.val) < 0.02);
    if (match) {
        return whole > 0 ? `${whole} ${match.label}` : match.label;
    }
    return String(Number(num.toFixed(2)));
}

function parseQuantity(raw) {
    let text = raw.trim();
    Object.entries(UNICODE_FRACTIONS).forEach(([sym, val]) => {
        if (text.includes(sym)) {
            const parts = text.split(sym);
            const whole = parts.at(0).trim() ? parseFloat(parts.at(0).trim()) : 0;
            text = String(whole + val);
        }
    });
    if (text.includes("/")) {
        const tokens = text.split(/\s+/);
        let total = 0;
        tokens.forEach(tok => {
            if (tok.includes("/")) {
                const frac = tok.split("/").map(Number);
                if (frac.at(1)) total += frac.at(0) / frac.at(1);
            } else if (!isNaN(parseFloat(tok))) {
                total += parseFloat(tok);
            }
        });
        return total || 1;
    }
    const num = parseFloat(text);
    return isNaN(num) ? 1 : num;
}

function parseIngredientLine(line) {
    const clean = line.trim();
    const match = clean.match(/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s+(.+)$/);
    if (!match) {
        return { qty: 1, unit: "", name: clean };
    }

    const qty = parseQuantity(match.at(1));
    const rest = match.at(2).trim();
    const words = rest.split(/\s+/);
    const firstWord = words.at(0).toLowerCase().replace(/[.,]$/, "");

    if (words.length > 1 && KNOWN_UNITS.has(firstWord)) {
        return {
            qty: qty,
            unit: firstWord,
            name: words.slice(1).join(" ")
        };
    }

    return {
        qty: qty,
        unit: "",
        name: rest
    };
}

function buildMonthWeeks() {
    const now = new Date();
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
            isCurrent: now >= cur && now <= end
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
    let dishCount = 0;

    const addDishIngredients = dish => {
        if (!dish) return;
        dishCount++;
        (dish.itemsList || []).forEach(line => {
            const parsed = parseIngredientLine(line);
            const key = `${parsed.name.toLowerCase()}|${parsed.unit}`;
            if (!totals[key]) totals[key] = { name: parsed.name, unit: parsed.unit, qty: 0 };
            totals[key].qty += parsed.qty;
        });
    };

    for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const dayMeals = yearlyPlan[formatDateKey(day.getFullYear(), day.getMonth(), day.getDate())];
        if (!dayMeals) continue;

        ["breakfast", "lunch", "dinner"].forEach(slot => {
            if (!dayMeals[slot]) return;
            const plan = normalizePlanSlot(dayMeals[slot]);
            addDishIngredients(plan.main);
            plan.sides.forEach(side => addDishIngredients(side));
        });
    }

    const list = Object.values(totals);
    box.innerHTML = list.length
        ? `<p><strong>Scheduled Dishes This Week (Mains + Sides):</strong> ${dishCount}</p><ul class="grocery-items">` +
          list.map(i => {
              const badgeText = i.unit ? `${formatFraction(i.qty)} ${i.unit}` : formatFraction(i.qty);
              return `<li><input type="checkbox"><span><span class="qty-badge">${badgeText}</span> ${i.name}</span></li>`;
          }).join("") + `</ul>`
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
