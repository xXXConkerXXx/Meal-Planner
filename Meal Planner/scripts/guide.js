let activeGuideTab = "start";
const GUIDE_TABS = ["start", "recipes", "calendar", "grocery", "backup"];

const GUIDE_CONTENT = {
    start: `
        <h3>1. Quick Start Overview</h3>
        <p>Plan your family meals, generate weekly shopping lists, and display your menu on a kitchen monitor.</p>
        <ol style="padding-left: 20px;">
            <li><strong>Add Dishes:</strong> Open <em>Edit &amp; Scatter Meals</em> to save dishes with ingredients, meal times, and seasons.</li>
            <li><strong>Fill Calendar:</strong> Use <em>Auto-Fill This Month</em> for smart no-repeat menus or click any day cell directly.</li>
            <li><strong>Shop Smarter:</strong> Open <em>Weekly Grocery List</em> to see combined ingredient totals for the week.</li>
            <li><strong>Display &amp; Save:</strong> Use <em>Kitchen Mode</em> for a counter screen and click <em>Save meals.json</em> for backups.</li>
        </ol>
    `,
    recipes: `
        <h3>2. Supported Units &amp; Kitchen Meanings</h3>
        <p>Format <strong>one ingredient per line</strong>: <code>Amount + Unit + Item</code> (e.g., <code>3 cloves garlic</code> or <code>1/2 tsp salt</code>).</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.81rem; text-align: left; margin-bottom: 10px;">
            <tr style="border-bottom: 1px solid var(--border-color); color: var(--title-color);"><th style="padding: 4px;">Unit Type</th><th style="padding: 4px;">Recognized Words</th><th style="padding: 4px;">What It Means &amp; Equivalents</th></tr>
            <tr style="border-bottom: 1px solid var(--grid-line);">
                <td style="padding: 4px;"><strong>Spoons &amp; Small</strong></td>
                <td style="padding: 4px;"><code>pinch</code>, <code>dash</code>, <code>tsp</code>, <code>teaspoon(s)</code>, <code>tbsp</code>, <code>tablespoon(s)</code></td>
                <td style="padding: 4px;"><strong>Pinch:</strong> Amount held between thumb and finger (~1/16 tsp).<br><strong>Dash:</strong> Quick shake from a bottle (~1/8 tsp).<br><strong>3 tsp = 1 tbsp</strong> (1/2 fl oz).</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--grid-line);">
                <td style="padding: 4px;"><strong>Cups &amp; Liquids</strong></td>
                <td style="padding: 4px;"><code>cup(s)</code>, <code>ml</code>, <code>l</code>, <code>liter(s)</code></td>
                <td style="padding: 4px;"><strong>1 cup</strong> = 16 tbsp (8 fl oz). <strong>1/2 cup</strong> = 8 tbsp.<br><strong>1 liter (l)</strong> = 1000 ml (~4.2 cups).</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--grid-line);">
                <td style="padding: 4px;"><strong>Weight</strong></td>
                <td style="padding: 4px;"><code>oz</code>, <code>ounce(s)</code>, <code>lb</code>, <code>lbs</code>, <code>pound(s)</code>, <code>g</code>, <code>gram(s)</code>, <code>kg</code></td>
                <td style="padding: 4px;"><strong>16 oz = 1 lb</strong> (used for meat, cheese, seafood).<br><strong>28 g ≈ 1 oz</strong> • <strong>1000 g = 1 kg</strong> (~2.2 lbs).</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--grid-line);">
                <td style="padding: 4px;"><strong>Containers</strong></td>
                <td style="padding: 4px;"><code>stick(s)</code>, <code>can(s)</code>, <code>jar(s)</code>, <code>bag(s)</code>, <code>box(es)</code>, <code>pack(s)</code>, <code>package(s)</code></td>
                <td style="padding: 4px;"><strong>Stick:</strong> 1 standard stick of butter = 1/2 cup (8 tbsp / 4 oz).<br>Others count whole store containers (e.g., <code>2 cans tomato sauce</code>).</td>
            </tr>
            <tr>
                <td style="padding: 4px;"><strong>Item Parts</strong></td>
                <td style="padding: 4px;"><code>clove(s)</code>, <code>slice(s)</code>, <code>piece(s)</code></td>
                <td style="padding: 4px;"><strong>Clove:</strong> One single wedge peeled from a garlic bulb (~1 tsp minced).<br><strong>Slice:</strong> One cut piece (bread, bacon, cheese).<br><strong>Piece:</strong> Individual cut portion (e.g., <code>4 pieces chicken</code>).</td>
            </tr>
        </table>
        <p style="font-size: 0.79rem; color: var(--text-muted); margin: 0;"><em>Tip: Leave out the unit for whole items (e.g., <code>8 chicken thighs</code>), and use consistent unit spellings across recipes so totals add together cleanly.</em></p>
    `,
    calendar: `
        <h3>3. Calendar &amp; Scattering</h3>
        <ul style="padding-left: 20px;">
            <li><strong>Meal Tabs:</strong> Switch between Breakfast (Orange), Lunch (Green), and Dinner (Purple).</li>
            <li><strong>Click Any Day:</strong> Click directly on any calendar box to set, swap, or clear that day's meal.</li>
            <li><strong>Smart Auto-Fill:</strong> Matches dishes to the active season and avoids repeating meals within 5 days or twice on the same day.</li>
            <li><strong>Custom Placement:</strong> Schedule dishes on a single date, every chosen weekday, or once per week.</li>
        </ul>
    `,
    grocery: `
        <h3>4. Grocery List &amp; Kitchen Mode</h3>
        <ul style="padding-left: 20px;">
            <li><strong>Weekly Math:</strong> Step through Sunday–Saturday weeks with <em>Prev/Next Week</em>; fractions and counts add up automatically.</li>
            <li><strong>Clean Printing:</strong> Print your weekly checklist or print Breakfast, Lunch, and Dinner on 3 separate calendar pages.</li>
            <li><strong>Kitchen Mode:</strong> Expands the calendar edge-to-edge in fullscreen with larger fonts for a counter display.</li>
        </ul>
    `,
    backup: `
        <h3>5. Keeping Your Recipes Safe</h3>
        <p>Changes save automatically in Firefox storage while you work, but clearing browser data erases browser storage.</p>
        <ul style="padding-left: 20px;">
            <li><strong>Save meals.json:</strong> Export a permanent backup file to your folder whenever you add new recipes.</li>
            <li><strong>Load meals.json:</strong> Restore your dishes and calendar anytime or move them to another computer.</li>
        </ul>
    `
};

function ensureGuideModal() {
    if (document.getElementById("guide-modal")) return;
    const modal = document.createElement("div");
    modal.id = "guide-modal";
    modal.className = "modal-backdrop hidden";
    modal.onclick = closeGuideModal;
    modal.innerHTML = `
        <div class="modal-box panel" style="max-width: 680px; max-height: 86vh; overflow-y: auto;" onclick="event.stopPropagation()">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h2 style="border: none; margin: 0;">App &amp; Measuring Guide</h2>
                <button type="button" class="btn-outline" style="padding: 4px 10px;" onclick="closeGuideModal()">✕</button>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
                <button type="button" class="guide-tab-btn" data-gtab="start" onclick="switchGuideTab('start')">1. Start</button>
                <button type="button" class="guide-tab-btn" data-gtab="recipes" onclick="switchGuideTab('recipes')">2. Measuring</button>
                <button type="button" class="guide-tab-btn" data-gtab="calendar" onclick="switchGuideTab('calendar')">3. Calendar</button>
                <button type="button" class="guide-tab-btn" data-gtab="grocery" onclick="switchGuideTab('grocery')">4. Kitchen</button>
                <button type="button" class="guide-tab-btn" data-gtab="backup" onclick="switchGuideTab('backup')">5. Backups</button>
            </div>
            <div id="guide-body" style="font-size: 0.92rem; line-height: 1.55;"></div>
            <div style="margin-top: 16px; display: flex; justify-content: space-between;">
                <button type="button" id="guide-prev-btn" class="btn-outline" onclick="stepGuideTab(-1)">◀ Prev</button>
                <button type="button" id="guide-next-btn" class="btn-green" onclick="stepGuideTab(1)">Next ▶</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function switchGuideTab(tabKey) {
    activeGuideTab = tabKey;
    document.getElementById("guide-body").innerHTML = GUIDE_CONTENT[tabKey] || "";
    document.querySelectorAll(".guide-tab-btn").forEach(btn => {
        btn.className = `guide-tab-btn ${btn.getAttribute("data-gtab") === tabKey ? "btn-green" : "btn-outline"}`;
    });
    const idx = GUIDE_TABS.indexOf(tabKey);
    document.getElementById("guide-prev-btn").style.visibility = idx > 0 ? "visible" : "hidden";
    document.getElementById("guide-next-btn").textContent = idx === GUIDE_TABS.length - 1 ? "Done ✓" : "Next ▶";
}

function stepGuideTab(delta) {
    const nextIdx = GUIDE_TABS.indexOf(activeGuideTab) + delta;
    if (nextIdx >= GUIDE_TABS.length) return closeGuideModal();
    if (nextIdx >= 0) switchGuideTab(GUIDE_TABS.at(nextIdx));
}

function openGuideModal() {
    ensureGuideModal();
    switchGuideTab("start");
    document.getElementById("guide-modal").classList.remove("hidden");
}

function closeGuideModal() {
    const modal = document.getElementById("guide-modal");
    if (modal) modal.classList.add("hidden");
}
