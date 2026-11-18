window.MealAppGuide = (function () {
    let activeTab = "start";
    const TABS = ["start", "recipes", "calendar", "grocery", "backup"];

    const CONTENT = {
        start: `
            <h3>1. Quick Start Overview</h3>
            <p>Plan your family meals, attach side dishes, generate weekly shopping lists, and display your menu on a kitchen monitor.</p>
            <ol style="padding-left: 20px;">
                <li><strong>Add Dishes:</strong> Open <em>Edit &amp; Scatter Meals</em> to save Main Dishes and Side Dishes with ingredients, optional recipe links, meal times, and seasons.</li>
                <li><strong>Fill Calendar:</strong> Use <em>Auto-Fill This Month</em> for smart no-repeat menus or click any day cell to pick a Main Dish and Sides.</li>
                <li><strong>View &amp; Shop:</strong> Click any day cell to view its full ingredients, or open <em>Weekly Grocery List</em> for automatic shopping math.</li>
                <li><strong>Display &amp; Save:</strong> Use <em>Kitchen Mode</em> for a counter screen and click <em>Save meals.json</em> for backups.</li>
            </ol>
        `,
        recipes: `
            <h3>2. Main vs. Side Dishes &amp; Measuring Guide</h3>
            <p>Choose <strong>Main Dish</strong> or <strong>Side Dish</strong>, add an optional recipe website link, and list <strong>one ingredient per line</strong>: <code>Amount + Unit + Item</code>.</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 0.81rem; text-align: left; margin-bottom: 10px;">
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--title-color);"><th style="padding: 4px;">Unit Type</th><th style="padding: 4px;">Recognized Words</th><th style="padding: 4px;">What It Means &amp; Equivalents</th></tr>
                <tr style="border-bottom: 1px solid var(--grid-line);"><td style="padding: 4px;"><strong>Spoons &amp; Small</strong></td><td style="padding: 4px;"><code>pinch</code>, <code>dash</code>, <code>tsp</code>, <code>tbsp</code></td><td style="padding: 4px;"><strong>Pinch:</strong> ~1/16 tsp • <strong>Dash:</strong> ~1/8 tsp • <strong>3 tsp = 1 tbsp</strong>.</td></tr>
                <tr style="border-bottom: 1px solid var(--grid-line);"><td style="padding: 4px;"><strong>Cups &amp; Liquids</strong></td><td style="padding: 4px;"><code>cup(s)</code>, <code>ml</code>, <code>l</code>, <code>liter(s)</code></td><td style="padding: 4px;"><strong>1 cup</strong> = 16 tbsp (8 fl oz) • <strong>1 liter</strong> = 1000 ml (~4.2 cups).</td></tr>
                <tr style="border-bottom: 1px solid var(--grid-line);"><td style="padding: 4px;"><strong>Weight</strong></td><td style="padding: 4px;"><code>oz</code>, <code>lb</code>, <code>lbs</code>, <code>g</code>, <code>kg</code></td><td style="padding: 4px;"><strong>16 oz = 1 lb</strong> • <strong>28 g ≈ 1 oz</strong> • <strong>1000 g = 1 kg</strong>.</td></tr>
                <tr style="border-bottom: 1px solid var(--grid-line);"><td style="padding: 4px;"><strong>Containers</strong></td><td style="padding: 4px;"><code>stick</code>, <code>can</code>, <code>jar</code>, <code>bag</code>, <code>box</code>, <code>pack</code></td><td style="padding: 4px;"><strong>Stick:</strong> 1 stick butter = 1/2 cup (8 tbsp / 4 oz).</td></tr>
                <tr><td style="padding: 4px;"><strong>Item Parts</strong></td><td style="padding: 4px;"><code>clove(s)</code>, <code>slice(s)</code>, <code>piece(s)</code></td><td style="padding: 4px;"><strong>Clove:</strong> 1 garlic wedge (~1 tsp minced).</td></tr>
            </table>
        `,
        calendar: `
            <h3>3. Calendar, Sides &amp; Viewing Ingredients</h3>
            <ul style="padding-left: 20px;">
                <li><strong>Clean Calendar Boxes:</strong> Each day shows your Main Dish and attached Sides without cluttering the grid.</li>
                <li><strong>Click Any Day Cell:</strong> Opens the day popup with <strong>View Ingredients</strong> (plus serving scaler &amp; Copy to Tomorrow) and <strong>Edit Meal &amp; Sides</strong>.</li>
                <li><strong>Smart Auto-Fill:</strong> Matches Main Dishes to the active season and avoids repeating meals within 5 days or twice on the same day.</li>
                <li><strong>Custom Placement:</strong> Schedule Main Dishes on a single date, every chosen weekday, once per week, or every year on a holiday.</li>
            </ul>
        `,
        grocery: `
            <h3>4. Grocery List &amp; Kitchen Mode</h3>
            <ul style="padding-left: 20px;">
                <li><strong>Combined Main + Side Math:</strong> Step through Sunday–Saturday weeks with <em>Prev/Next Week</em>; ingredients add together and group by grocery aisle automatically.</li>
                <li><strong>Clean Printing:</strong> Print your weekly checklist or print Breakfast, Lunch, and Dinner on 3 separate calendar pages.</li>
                <li><strong>Kitchen Mode:</strong> Expands the calendar edge-to-edge in fullscreen for a counter display.</li>
            </ul>
        `,
        backup: `
            <h3>5. Keeping Your Recipes Safe</h3>
            <p>Changes save automatically in Firefox storage while you work, but clearing browser data erases browser storage.</p>
            <ul style="padding-left: 20px;">
                <li><strong>Save meals.json:</strong> Export a permanent backup file whenever you add new recipes.</li>
                <li><strong>Load meals.json:</strong> Restore your dishes, calendar, and recurring holiday meals anytime.</li>
            </ul>
        `
    };

    function ensureModal() {
        if (document.getElementById("guide-modal")) return;
        const modal = document.createElement("div");
        modal.id = "guide-modal";
        modal.className = "modal-backdrop hidden";
        modal.addEventListener("click", close);
        modal.innerHTML = `
            <div class="modal-box panel" style="max-width: 680px; max-height: 86vh; overflow-y: auto;" onclick="event.stopPropagation()">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h2 style="border: none; margin: 0;">App &amp; Measuring Guide</h2>
                    <button type="button" id="gd-close-btn" class="btn-outline" style="padding: 4px 10px;">✕</button>
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
                    <button type="button" class="guide-tab-btn" data-gtab="start">1. Start</button>
                    <button type="button" class="guide-tab-btn" data-gtab="recipes">2. Measuring</button>
                    <button type="button" class="guide-tab-btn" data-gtab="calendar">3. Calendar</button>
                    <button type="button" class="guide-tab-btn" data-gtab="grocery">4. Kitchen</button>
                    <button type="button" class="guide-tab-btn" data-gtab="backup">5. Backups</button>
                </div>
                <div id="guide-body" style="font-size: 0.92rem; line-height: 1.55;"></div>
                <div style="margin-top: 16px; display: flex; justify-content: space-between;">
                    <button type="button" id="guide-prev-btn" class="btn-outline">◀ Prev</button>
                    <button type="button" id="guide-next-btn" class="btn-green">Next ▶</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector("#gd-close-btn").addEventListener("click", close);
        modal.querySelectorAll(".guide-tab-btn").forEach(b => b.addEventListener("click", () => switchTab(b.dataset.gtab)));
        modal.querySelector("#guide-prev-btn").addEventListener("click", () => step(-1));
        modal.querySelector("#guide-next-btn").addEventListener("click", () => step(1));
    }

    function switchTab(tabKey) {
        activeTab = tabKey;
        document.getElementById("guide-body").innerHTML = CONTENT[tabKey] || "";
        document.querySelectorAll(".guide-tab-btn").forEach(btn => {
            btn.className = `guide-tab-btn ${btn.dataset.gtab === tabKey ? "btn-green" : "btn-outline"}`;
        });
        const idx = TABS.indexOf(tabKey);
        document.getElementById("guide-prev-btn").style.visibility = idx > 0 ? "visible" : "hidden";
        document.getElementById("guide-next-btn").textContent = idx === TABS.length - 1 ? "Done ✓" : "Next ▶";
    }

    function step(delta) {
        const nextIdx = TABS.indexOf(activeTab) + delta;
        if (nextIdx >= TABS.length) return close();
        if (nextIdx >= 0) switchTab(TABS.at(nextIdx));
    }

    function open() { ensureModal(); switchTab("start"); document.getElementById("guide-modal").classList.remove("hidden"); }
    function close() { document.getElementById("guide-modal")?.classList.add("hidden"); }
    return { open, close };
})();
