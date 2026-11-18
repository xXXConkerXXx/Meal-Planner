window.RecipeDictionary = {
    MEASUREMENT_WORDS: [
        "cup", "cups", "tsp", "teaspoon", "teaspoons", "tbsp", "tablespoon", "tablespoons",
        "oz", "ounce", "ounces", "lb", "lbs", "pound", "pounds",
        "g", "gram", "grams", "kg", "kilogram", "kilograms",
        "ml", "milliliter", "milliliters", "l", "liter", "liters",
        "stick", "sticks", "can", "cans", "jar", "jars", "bag", "bags",
        "box", "boxes", "pack", "packs", "package", "packages",
        "clove", "cloves", "slice", "slices", "piece", "pieces", "pinch", "dash",
        "gallon", "gallons", "quart", "quarts", "pint", "pints", "bottle", "bottles",
        "head", "heads", "bunch", "bunches", "stalk", "stalks", "sheet", "sheets",
        "sprig", "sprigs", "fillet", "fillets"
    ],

    getLearnedPools() {
        const dishSet = new Set(window.RECIPE_DICT_DISHES || []);
        const ingSet = new Set(window.RECIPE_DICT_INGREDIENTS || []);
        (meals || []).forEach(m => {
            if (m.name) dishSet.add(m.name.trim());
            (m.itemsList || []).forEach(line => {
                const cleaned = line
                    .replace(/^((?:\d+\s+)?(?:\d+\/\d+|\d+(?:\.\d+)?|[¼½¾⅓⅔⅛⅜⅝⅞]))\s+(?:(?:cups?|tsps?|teaspoons?|tbsps?|tablespoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|kilograms?|ml|milliliters?|l|liters?|sticks?|cans?|jars?|bags?|box(?:es)?|packs?|packages?|cloves?|slices?|pieces?|pinch|dash|gallons?|quarts?|pints?|bottles?|heads?|bunch(?:es)?|stalks?|sheets?|sprigs?|fillets?)\s+)?/i, "")
                    .trim();
                if (cleaned) ingSet.add(cleaned);
            });
        });
        return { dishes: Array.from(dishSet), ingredients: Array.from(ingSet) };
    }
};
