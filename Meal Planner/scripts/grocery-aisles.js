window.GroceryAisleSorter = (function () {
    const AISLES = [
        {
            name: "🥬 Produce",
            keywords: ["apple", "banana", "berry", "berries", "blackberry", "blueberry", "broccoli", "cabbage", "carrot", "celery", "cherry", "cherries", "cilantro", "corn", "cranberry", "cranberries", "cucumber", "garlic", "ginger", "grape", "green bean", "herb", "jalapeno", "kale", "lemon", "lettuce", "lime", "mango", "mushroom", "okra", "onion", "orange", "parsley", "peach", "pear", "pepper", "pineapple", "plum", "potato", "pumpkin", "raspberry", "romaine", "scallion", "shallot", "spinach", "squash", "strawberry", "sweet potato", "tomato", "watermelon", "zucchini"]
        },
        {
            name: "🥩 Meat & Seafood",
            keywords: ["andouille", "bacon", "beef", "boudin", "brisket", "chicken", "chorizo", "cod", "crab", "crawfish", "fish", "ham", "kielbasa", "lamb", "meatball", "pork", "roast", "salmon", "sausage", "shrimp", "steak", "tilapia", "tuna", "turkey"]
        },
        {
            name: "🧀 Dairy & Refrigerated",
            keywords: ["butter", "buttermilk", "cheddar", "cheese", "cool whip", "cream", "cream cheese", "egg", "feta", "half and half", "milk", "monterey", "mozzarella", "parmesan", "pepper jack", "ricotta", "sour cream", "whipped cream", "yogurt"]
        },
        {
            name: "🍞 Bakery & Bread",
            keywords: ["bagel", "baguette", "biscuit", "bread", "bun", "croissant", "crust", "dinner roll", "english muffin", "naan", "pita", "roll", "sourdough", "tortilla"]
        },
        {
            name: "🧊 Frozen",
            keywords: ["frozen", "ice cream", "peas", "tater tot", "waffle"]
        },
        {
            name: "🥫 Pantry, Baking & Spices",
            keywords: ["baking", "basil", "bean", "bisquick", "broth", "brown sugar", "cajun", "can", "canned", "cereal", "cinnamon", "cocoa", "coffee", "condensed", "cornmeal", "cornstarch", "cracker", "cranberry sauce", "crouton", "cumin", "curry", "evaporated", "extract", "flour", "fritos", "garlic powder", "grits", "honey", "hot sauce", "jam", "jelly", "ketchup", "maple", "marshmallow", "mayo", "mayonnaise", "mustard", "noodle", "nut", "nutmeg", "oat", "oil", "olive oil", "onion powder", "oregano", "paprika", "pasta", "peanut butter", "pecan", "pie filling", "powder", "pumpkin puree", "quinoa", "raisin", "ranch", "rice", "rosemary", "rotel", "salt", "sauce", "seasoning", "soup", "soy sauce", "spice", "sprinkles", "stock", "sugar", "syrup", "tea", "thyme", "tomato paste", "tomato sauce", "vanilla", "vinegar", "walnut", "worcestershire", "yeast"]
        }
    ];

    function detectAisle(itemName) {
        const lower = itemName.toLowerCase();
        for (const aisle of AISLES) {
            if (aisle.keywords.some(kw => lower.includes(kw))) {
                return aisle.name;
            }
        }
        return "🛒 Other Items";
    }

    function renderGroupedHTML(itemsList, dishCount) {
        if (!itemsList.length) {
            return `<p>No meals planned for this week yet.</p>`;
        }

        const groups = new Map();
        itemsList.forEach(item => {
            const aisle = detectAisle(item.name);
            if (!groups.has(aisle)) groups.set(aisle, []);
            groups.get(aisle).push(item);
        });

        const orderedNames = [...AISLES.map(a => a.name), "🛒 Other Items"];
        let sectionsHTML = `<p><strong>Scheduled Dishes This Week (Mains + Sides):</strong> ${dishCount}</p>`;

        orderedNames.forEach(aisleName => {
            const groupItems = groups.get(aisleName);
            if (!groupItems || !groupItems.length) return;

            groupItems.sort((a, b) => a.name.localeCompare(b.name));
            const rows = groupItems.map(i => {
                const badgeText = i.unit ? `${formatFraction(i.qty)} ${i.unit}` : formatFraction(i.qty);
                return `<li><input type="checkbox"><span><span class="qty-badge">${badgeText}</span> ${i.name}</span></li>`;
            }).join("");

            sectionsHTML += `
                <div style="margin-top: 14px;">
                    <h4 style="margin: 0 0 6px 0; padding-bottom: 4px; border-bottom: 1px solid var(--border-color); color: var(--title-color); font-size: 0.95rem;">${aisleName}</h4>
                    <ul class="grocery-items" style="margin-top: 4px;">${rows}</ul>
                </div>
            `;
        });

        return sectionsHTML;
    }

    return { detectAisle, renderGroupedHTML };
})();
