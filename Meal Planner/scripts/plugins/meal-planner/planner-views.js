window.MealPlannerViews = {
    mount() {
        if (document.getElementById("mp-edit-view")) return;
        const root = document.getElementById("plugin-views");
        if (!root) return;

        const holidayOpts = (window.HolidayDates?.LIST || []).map(h => `<option value="${h.id}">${h.icon} ${h.name}</option>`).join("");
        const wrap = document.createElement("div");
        wrap.id = "meal-planner-views";
        wrap.innerHTML = `
            <div id="mp-edit-view" class="edit-grid hidden screen-only">
                <div class="panel">
                    <h2 id="form-heading">1. Add Dish</h2>
                    <form id="meal-form" class="stacked-form">
                        <label>Dish Name</label>
                        <input type="text" id="meal-name" required placeholder="e.g. Chicken Alfredo or Garlic Bread">
                        <label>Dish Role</label>
                        <select id="meal-role"><option value="main">Main Dish</option><option value="side">Side Dish</option></select>
                        <label>Recipe Link (Optional)</label>
                        <input type="url" id="meal-url" placeholder="https://...">
                        <label>Ingredients (One per line: Amount + Unit + Item)</label>
                        <textarea id="meal-items" rows="5" required placeholder="1 lb chicken breast&#10;2 cups pasta"></textarea>
                        <label>Meal Times</label>
                        <div id="meal-type-checks" class="check-row">
                            <label><input type="checkbox" value="breakfast" checked> Breakfast</label>
                            <label><input type="checkbox" value="lunch" checked> Lunch</label>
                            <label><input type="checkbox" value="dinner" checked> Dinner</label>
                        </div>
                        <label>Seasons</label>
                        <div id="meal-season-checks" class="check-row">
                            <label><input type="checkbox" value="winter" checked> Winter</label>
                            <label><input type="checkbox" value="spring" checked> Spring</label>
                            <label><input type="checkbox" value="summer" checked> Summer</label>
                            <label><input type="checkbox" value="fall" checked> Fall</label>
                        </div>
                        <div class="form-actions">
                            <button type="submit" id="save-dish-btn" class="btn-green btn-full">Save Dish</button>
                            <button type="button" id="cancel-edit-btn" class="btn-outline hidden">Cancel</button>
                        </div>
                    </form>
                </div>
                <div class="panel">
                    <h2>2. Schedule on <span id="edit-month-label"></span></h2>
                    <div class="stacked-form">
                        <label>Meal Slot</label>
                        <select id="assign-slot"><option value="breakfast">Breakfast</option><option value="lunch">Lunch</option><option value="dinner" selected>Dinner</option></select>
                        <label>Main Dish</label>
                        <select id="assign-meal"></select>
                        <label>Placement Pattern</label>
                        <select id="assign-pattern">
                            <option value="single">Single Specific Day</option>
                            <option value="weekday-month">Every Chosen Weekday (This Month)</option>
                            <option value="weekday-year">Every Chosen Weekday (Matching Seasons)</option>
                            <option value="scatter-month">Once Per Week (Random Days)</option>
                            <option value="repeat-holiday">Repeat Every Year on Holiday</option>
                        </select>
                        <div id="single-day-box"><label>Day of Month</label><select id="assign-day"></select></div>
                        <div id="weekday-box" class="hidden"><label>Day of Week</label><select id="assign-weekday"><option value="0">Sunday</option><option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option><option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option></select></div>
                        <div id="holiday-box" class="hidden"><label>Select Holiday</label><select id="assign-holiday">${holidayOpts}</select></div>
                        <button type="button" id="place-meal-btn" class="btn-green btn-full">Place on Calendar</button>
                    </div>
                    <div id="holiday-repeat-list" style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;"></div>
                </div>
            </div>

            <div id="mp-grocery-view" class="grocery-panel panel hidden">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
                    <h2 style="margin: 0; border: none;">Weekly Grocery List</h2>
                    <div class="week-controls" style="display: flex; align-items: center; gap: 8px;">
                        <button type="button" id="gc-prev-wk" class="btn-outline">◀ Prev Week</button>
                        <strong id="grocery-week-label"></strong>
                        <button type="button" id="gc-next-wk" class="btn-outline">Next Week ▶</button>
                        <button type="button" id="gc-print-btn" class="btn-green screen-only">🖨️ Print List</button>
                    </div>
                </div>
                <div id="grocery-summary"></div>
            </div>
        `;
        root.appendChild(wrap);
        wrap.querySelector("#gc-prev-wk").addEventListener("click", () => window.GroceryCalculator?.changeWeek(-1));
        wrap.querySelector("#gc-next-wk").addEventListener("click", () => window.GroceryCalculator?.changeWeek(1));
        wrap.querySelector("#gc-print-btn").addEventListener("click", () => window.print());
        window.MealEditor?.bindEvents();
    }
};
