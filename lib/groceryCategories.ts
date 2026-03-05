export const CATEGORIES = ['Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Frozen', 'Beverages', 'Household', 'Other'] as const
export const STORES = ['Hannaford', 'Healthy Living', 'Costco'] as const

// Ordered: more specific / multi-word entries first to win substring matching
const ITEM_CATEGORY_MAP: [string, string][] = [
  // Multi-word first
  ['sour cream', 'Dairy'], ['cream cheese', 'Dairy'], ['cottage cheese', 'Dairy'],
  ['half and half', 'Dairy'], ['heavy cream', 'Dairy'],
  ['ice cream', 'Frozen'], ['whipped cream', 'Frozen'], ['frozen', 'Frozen'],
  ['ground beef', 'Meat'], ['ground turkey', 'Meat'],
  ['paper towel', 'Household'], ['toilet paper', 'Household'], ['trash bag', 'Household'],
  ['peanut butter', 'Pantry'], ['almond butter', 'Pantry'],
  ['olive oil', 'Pantry'],
  // Beverages before produce so "orange juice" → Beverages, not Produce
  ['lemonade', 'Beverages'], ['juice', 'Beverages'], ['coffee', 'Beverages'],
  ['tea', 'Beverages'], ['soda', 'Beverages'], ['kombucha', 'Beverages'],
  ['beer', 'Beverages'], ['wine', 'Beverages'], ['sparkling water', 'Beverages'],
  // Dairy
  ['milk', 'Dairy'], ['egg', 'Dairy'], ['cheese', 'Dairy'], ['butter', 'Dairy'],
  ['yogurt', 'Dairy'], ['cream', 'Dairy'],
  // Meat
  ['chicken', 'Meat'], ['beef', 'Meat'], ['pork', 'Meat'], ['salmon', 'Meat'],
  ['tuna', 'Meat'], ['turkey', 'Meat'], ['bacon', 'Meat'], ['sausage', 'Meat'],
  ['shrimp', 'Meat'], ['steak', 'Meat'], ['ham', 'Meat'], ['lamb', 'Meat'],
  ['fish', 'Meat'],
  // Produce
  ['apple', 'Produce'], ['banana', 'Produce'], ['orange', 'Produce'],
  ['lettuce', 'Produce'], ['spinach', 'Produce'], ['tomato', 'Produce'],
  ['onion', 'Produce'], ['garlic', 'Produce'], ['carrot', 'Produce'],
  ['broccoli', 'Produce'], ['celery', 'Produce'], ['cucumber', 'Produce'],
  ['pepper', 'Produce'], ['potato', 'Produce'], ['avocado', 'Produce'],
  ['lemon', 'Produce'], ['lime', 'Produce'], ['strawberr', 'Produce'],
  ['blueberr', 'Produce'], ['raspberry', 'Produce'], ['grape', 'Produce'],
  ['kale', 'Produce'], ['zucchini', 'Produce'], ['mushroom', 'Produce'],
  ['mango', 'Produce'], ['peach', 'Produce'], ['pear', 'Produce'],
  ['asparagus', 'Produce'], ['arugula', 'Produce'], ['cauliflower', 'Produce'],
  ['eggplant', 'Produce'], ['corn', 'Produce'],
  // Bakery
  ['bread', 'Bakery'], ['bagel', 'Bakery'], ['muffin', 'Bakery'],
  ['croissant', 'Bakery'], ['bun', 'Bakery'], ['roll', 'Bakery'],
  ['cookie', 'Bakery'], ['cake', 'Bakery'], ['pie', 'Bakery'],
  // Household
  ['soap', 'Household'], ['shampoo', 'Household'], ['conditioner', 'Household'],
  ['detergent', 'Household'], ['bleach', 'Household'], ['toothpaste', 'Household'],
  ['toothbrush', 'Household'], ['floss', 'Household'], ['sponge', 'Household'],
  ['tissue', 'Household'], ['dish soap', 'Household'],
  // Pantry
  ['rice', 'Pantry'], ['pasta', 'Pantry'], ['flour', 'Pantry'], ['sugar', 'Pantry'],
  ['salt', 'Pantry'], ['oil', 'Pantry'], ['vinegar', 'Pantry'], ['sauce', 'Pantry'],
  ['soup', 'Pantry'], ['bean', 'Pantry'], ['lentil', 'Pantry'], ['oat', 'Pantry'],
  ['cereal', 'Pantry'], ['cracker', 'Pantry'], ['chip', 'Pantry'], ['nut', 'Pantry'],
  ['honey', 'Pantry'], ['jam', 'Pantry'], ['jelly', 'Pantry'], ['syrup', 'Pantry'],
  ['broth', 'Pantry'], ['stock', 'Pantry'], ['canned', 'Pantry'],
  ['seasoning', 'Pantry'], ['spice', 'Pantry'],
]

export function guessCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const [keyword, cat] of ITEM_CATEGORY_MAP) {
    if (lower.includes(keyword)) return cat
  }
  return ''
}
