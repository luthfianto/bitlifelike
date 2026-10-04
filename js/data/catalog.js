/* Purchasable things: property, vehicles, pets, and one-off activities. */
class Catalog {
  /* Annual upkeep is deducted every year the asset is owned. */
  static HOUSES = Object.freeze([
    { id: 'h_trailer', name: 'Mobile Home', emoji: '🚐', price: 18000, upkeep: 1200, bedrooms: 1 },
    { id: 'h_condo', name: 'Studio Condo', emoji: '🏢', price: 78000, upkeep: 3100, bedrooms: 1 },
    { id: 'h_suburb', name: 'Suburban House', emoji: '🏠', price: 240000, upkeep: 6400, bedrooms: 3 },
    { id: 'h_town', name: 'Townhouse', emoji: '🏘️', price: 420000, upkeep: 8900, bedrooms: 3 },
    { id: 'h_farm', name: 'Farmhouse', emoji: '🚜', price: 690000, upkeep: 7200, bedrooms: 4 },
    { id: 'h_lux', name: 'Luxury Home', emoji: '🏰', price: 1400000, upkeep: 21000, bedrooms: 5 },
    { id: 'h_estate', name: 'Country Estate', emoji: '🏛️', price: 4200000, upkeep: 58000, bedrooms: 7 },
    { id: 'h_pent', name: 'Penthouse', emoji: '🌆', price: 9500000, upkeep: 120000, bedrooms: 4 }
  ]);

  /* Cars lose value fast; upkeep is the running cost of looking wealthy. */
  static CARS = Object.freeze([
    { id: 'c_beat', name: 'Beater Hatchback', emoji: '🚗', price: 2400, upkeep: 900, tier: 1 },
    { id: 'c_sedan', name: 'Family Sedan', emoji: '🚙', price: 16000, upkeep: 1600, tier: 2 },
    { id: 'c_pick', name: 'Pickup Truck', emoji: '🛻', price: 39000, upkeep: 2100, tier: 3 },
    { id: 'c_ev', name: 'Electric Hatchback', emoji: '🔋', price: 42000, upkeep: 1200, tier: 3 },
    { id: 'c_suv', name: 'Family SUV', emoji: '🚘', price: 34000, upkeep: 2400, tier: 3 },
    { id: 'c_sport', name: 'Sports Coupe', emoji: '🏎️', price: 96000, upkeep: 4800, tier: 4 },
    { id: 'c_lux', name: 'Luxury Sedan', emoji: '🚗', price: 145000, upkeep: 6200, tier: 4 },
    { id: 'c_suvl', name: 'Luxury SUV', emoji: '🚙', price: 118000, upkeep: 5800, tier: 4 },
    { id: 'c_hyper', name: 'Hypercar', emoji: '🏎️', price: 1400000, upkeep: 34000, tier: 5 },
    { id: 'c_sup', name: 'Exotic Supercar', emoji: '🏎️', price: 3200000, upkeep: 78000, tier: 5 }
  ]);

  static PETS = Object.freeze([
    { id: 'p_fish', name: 'Goldfish', emoji: '🐟', price: 12, upkeep: 90, lives: 6 },
    { id: 'p_ham', name: 'Hamster', emoji: '🐹', price: 35, upkeep: 200, lives: 4 },
    { id: 'p_rabbit', name: 'Rabbit', emoji: '🐰', price: 90, upkeep: 500, lives: 11 },
    { id: 'p_cat', name: 'Cat', emoji: '🐈', price: 180, upkeep: 900, lives: 17 },
    { id: 'p_dog', name: 'Dog', emoji: '🐕', price: 800, upkeep: 1400, lives: 14 },
    { id: 'p_bird', name: 'Parrot', emoji: '🦜', price: 1200, upkeep: 700, lives: 50 },
    { id: 'p_turtle', name: 'Tortoise', emoji: '🐢', price: 900, upkeep: 300, lives: 90 }
  ]);

  /* One-shot actions the player can buy from the Activities screen. */
  static ACTIVITIES = Object.freeze([
    { id: 'a_gym', name: 'Gym Membership', emoji: '🏋️', cost: 700, blurb: 'A full year of getting fit.' },
    { id: 'a_library', name: 'Library Card', emoji: '📖', cost: 0, blurb: 'Free. Studies hard all year.' },
    { id: 'a_meditate', name: 'Meditation Retreat', emoji: '🧘', cost: 2400, blurb: 'Quiet the noise for a year.' },
    { id: 'a_course', name: 'Night Course', emoji: '🕰️', cost: 1200, blurb: 'Learn something after work.' },
    { id: 'a_therapist', name: 'Therapy', emoji: '🛋️', cost: 3200, blurb: 'A year of professional help.' },
    { id: 'a_dentist', name: 'Full Dental Work', emoji: '🦷', cost: 2800, blurb: 'Fix everything in your mouth.' },
    { id: 'a_checkup', name: 'Full Physical', emoji: '🩺', cost: 900, blurb: 'Find out what is wrong.' },
    { id: 'a_casino', name: 'Night at the Casino', emoji: '🎰', cost: 5000, blurb: 'Gamble with your savings.' },
    { id: 'a_race', name: 'Street Race', emoji: '🏁', cost: 2000, blurb: 'Race your car for money.' },
    { id: 'a_lottery', name: 'Lottery Tickets', emoji: '🎟️', cost: 200, blurb: 'A stack of instant wins.' },
    { id: 'a_crypto', name: 'Crypto Venture', emoji: '₿', cost: 3000, blurb: 'YOLO into the market.' },
    { id: 'a_stocks', name: 'Stock Portfolio', emoji: '📊', cost: 6000, blurb: 'Put real money into the market.' },
    { id: 'a_give', name: 'Family Donation', emoji: '🎁', cost: 5000, blurb: 'Help your family out.' },
    { id: 'a_charity', name: 'Charity Gala', emoji: '🎭', cost: 8000, blurb: 'Name on the wall, name in the papers.' },
    { id: 'a_vacation', name: 'Tropical Vacation', emoji: '🏝️', cost: 7500, blurb: 'Two weeks of doing nothing.' },
    { id: 'a_spa', name: 'Spa Day', emoji: '💆', cost: 1800, blurb: 'Look and feel younger.' },
    { id: 'a_bar', name: 'Night at the Bar', emoji: '🍸', cost: 600, blurb: 'Let loose, sometimes too well.' }
  ]);

  static #index = null;

  static #build() {
    Catalog.#index = new Map(
      [...Catalog.HOUSES, ...Catalog.CARS, ...Catalog.PETS].map((a) => [a.id, a])
    );
  }

  static assetById(id) {
    Catalog.#index ??= Catalog.#build();
    return Catalog.#index.get(id) ?? null;
  }

  static activityById(id) {
    return Catalog.ACTIVITIES.find((a) => a.id === id) ?? null;
  }
}