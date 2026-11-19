window.PresetMeals = (function () {
    const SEED_FLAG = "meal_planner_presets_seeded_v1";
    const ALL_SEASONS = ["winter", "spring", "summer", "fall"];

    const STARTER_DISHES = [
        { name: "Bacon and Eggs", role: "main", url: "", types: ["breakfast"], seasons: ALL_SEASONS, itemsList: ["4 slices bacon", "4 eggs", "1 tbsp butter", "1 pinch salt", "1 pinch black pepper"] },
        { name: "Blueberry Pancakes", role: "main", url: "", types: ["breakfast"], seasons: ALL_SEASONS, itemsList: ["1 1/2 cups flour", "1 cup milk", "1 egg", "2 tbsp butter", "1 cup blueberries", "2 tbsp maple syrup"] },
        { name: "Breakfast Burrito", role: "main", url: "", types: ["breakfast"], seasons: ALL_SEASONS, itemsList: ["4 flour tortillas", "6 eggs", "1 cup cheddar cheese", "1/2 lb sausage", "1/4 cup salsa"] },
        { name: "Oatmeal & Fruit", role: "main", url: "", types: ["breakfast"], seasons: ["winter", "spring", "fall"], itemsList: ["2 cups oats", "4 cups milk", "1 banana", "1 tsp cinnamon", "2 tbsp honey"] },
        { name: "Chicken Caesar Salad", role: "main", url: "", types: ["lunch"], seasons: ["spring", "summer", "fall"], itemsList: ["1 lb chicken breast", "1 head romaine lettuce", "1/2 cup parmesan cheese", "1 cup croutons", "1/3 cup ranch dressing"] },
        { name: "Grilled Cheese & Tomato Soup", role: "main", url: "", types: ["lunch"], seasons: ["winter", "fall"], itemsList: ["8 slices bread", "8 slices cheddar cheese", "3 tbsp butter", "2 cans tomato soup"] },
        { name: "Turkey Club Sandwich", role: "main", url: "", types: ["lunch"], seasons: ALL_SEASONS, itemsList: ["8 slices bread", "1/2 lb turkey breast", "4 slices bacon", "4 slices swiss cheese", "2 tbsp mayonnaise", "4 leaves lettuce"] },
        { name: "Chicken Quesadilla", role: "main", url: "", types: ["lunch", "dinner"], seasons: ALL_SEASONS, itemsList: ["4 flour tortillas", "1 lb chicken breast", "2 cups monterey jack cheese", "1/2 cup salsa", "1/4 cup sour cream"] },
        { name: "Spaghetti and Meatballs", role: "main", url: "", types: ["dinner"], seasons: ALL_SEASONS, itemsList: ["1 lb spaghetti noodles", "1 lb ground beef", "1 jar marinara sauce", "1/2 cup breadcrumbs", "1/4 cup parmesan cheese"] },
        { name: "Chicken Alfredo", role: "main", url: "", types: ["dinner"], seasons: ALL_SEASONS, itemsList: ["1 lb chicken breast", "1 lb pasta", "1 cup heavy cream", "1 cup parmesan cheese", "3 cloves garlic", "2 tbsp butter"] },
        { name: "Beef Tacos", role: "main", url: "", types: ["dinner"], seasons: ALL_SEASONS, itemsList: ["1 lb ground beef", "8 corn tortillas", "1 cup cheddar cheese", "1 cup lettuce", "1 tomato", "1 tbsp cumin"] },
        { name: "Red Beans and Rice", role: "main", url: "", types: ["dinner"], seasons: ["winter", "spring", "fall"], itemsList: ["1 lb kidney beans", "1 lb smoked sausage", "2 cups white rice", "1 yellow onion", "2 stalks celery", "1 green bell pepper", "1 tbsp creole seasoning"] },
        { name: "Baked Salmon & Veggies", role: "main", url: "", types: ["dinner"], seasons: ["spring", "summer", "fall"], itemsList: ["1 lb salmon fillets", "2 tbsp olive oil", "1 lemon", "2 cloves garlic", "1 tsp dill"] },
        { name: "Garlic Bread", role: "side", url: "", types: ["lunch", "dinner"], seasons: ALL_SEASONS, itemsList: ["1 loaf bread", "4 tbsp butter", "3 cloves garlic", "2 tbsp parsley"] },
        { name: "Roasted Potatoes", role: "side", url: "", types: ["dinner"], seasons: ALL_SEASONS, itemsList: ["2 lbs red potatoes", "2 tbsp olive oil", "1 tsp rosemary", "1 tsp garlic powder"] },
        { name: "Steamed Green Beans", role: "side", url: "", types: ["lunch", "dinner"], seasons: ALL_SEASONS, itemsList: ["1 lb green beans", "1 tbsp butter", "1 pinch salt"] },
        { name: "Hash Browns", role: "side", url: "", types: ["breakfast"], seasons: ALL_SEASONS, itemsList: ["1 lb potatoes", "2 tbsp vegetable oil", "1 pinch salt"] },
        { name: "Fruit Salad", role: "side", url: "", types: ["breakfast", "lunch"], seasons: ["spring", "summer"], itemsList: ["1 cup strawberries", "1 cup blueberries", "1 banana", "1 tbsp honey"] }
    ].map(d => Object.assign({}, d, { isPreset: true, items: d.itemsList.map(i => "• " + i).join("\n") }));

    const PRESET_NAMES = new Set(STARTER_DISHES.map(d => d.name));
    const isActive = () => !window.CorePlugins || window.CorePlugins.isEnabled("preset-meals");
    let booted = false;

    function buildSamplePlanForMonth(year, month) {
        const days = new Date(year, month + 1, 0).getDate();
        const slots = ["breakfast", "lunch", "dinner"];
        const sample = {};

        for (let d = 1; d <= days; d++) {
            const dk = window.MealStore.formatDateKey(year, month, d);
            sample[dk] = {};
            slots.forEach((slot, sIdx) => {
                const mains = STARTER_DISHES.filter(m => m.role === "main" && m.types.includes(slot));
                const sides = STARTER_DISHES.filter(m => m.role === "side" && m.types.includes(slot));
                const main = mains.at((d + sIdx * 2) % mains.length);
                const attachSide = sides.length && d % 2 === (sIdx % 2) ? [sides.at(d % sides.length)] : [];
                sample[dk][slot] = { main, sides: attachSide, isPreset: true };
            });
        }
        return sample;
    }

    function applyPresets(fillCalendar = true) {
        if (!window.MealStore) return;
        localStorage.setItem(SEED_FLAG, "1");
        const userDishes = window.MealStore.getMeals().filter(m => !m.isPreset && !PRESET_NAMES.has(m.name));
        window.MealStore.saveMeals([...STARTER_DISHES, ...userDishes]);

        if (fillCalendar && !Object.keys(window.MealStore.getPlan()).length) {
            const view = window.CoreCalendar?.getViewDate?.() || { year: new Date().getFullYear(), month: new Date().getMonth() };
            window.MealStore.savePlan(buildSamplePlanForMonth(view.year, view.month));
        }
        window.MealPlannerPlugin?.refreshAll();
    }

    function removePresets() {
        if (!window.MealStore) return;
        localStorage.setItem(SEED_FLAG, "1");
        const userDishes = window.MealStore.getMeals().filter(m => !m.isPreset && !PRESET_NAMES.has(m.name));
        window.MealStore.saveMeals(userDishes);

        const plan = Object.assign({}, window.MealStore.getPlan());
        Object.keys(plan).forEach(dk => {
            ["breakfast", "lunch", "dinner"].forEach(slot => {
                const cur = plan[dk]?.[slot];
                if (!cur) return;
                if (cur.isPreset || cur.main?.isPreset || PRESET_NAMES.has(cur.main?.name)) {
                    delete plan[dk][slot];
                }
            });
            if (!Object.keys(plan[dk]).length) delete plan[dk];
        });

        window.MealStore.savePlan(plan);
        window.MealPlannerPlugin?.refreshAll();
    }

    window.CorePlugins?.register({
        id: "preset-meals",
        requires: Array.of("meal-planner"),
        icon: "🍱",
        title: "Starter Dishes & Sample Plan",
        description: "18 built-in starter recipes & sample schedule (toggle OFF for a blank slate)",
        defaultEnabled: true,
        enable() {
            const isInitialBoot = !booted;
            booted = true;
            if (isInitialBoot && localStorage.getItem(SEED_FLAG)) return;
            applyPresets(true);
        },
        disable() {
            booted = true;
            removePresets();
        }
    });

    return { applyPresets, removePresets, isActive };
})();
