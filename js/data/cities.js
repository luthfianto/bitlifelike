/*
 * Birthplaces. `cost` is a 1-3 tier (1 = cheap, 3 = expensive) that scales
 * housing prices and salary bands in the career system.
 */
class Cities {
  static #ALL = Object.freeze([
    { name: 'Detroit', country: 'USA', cost: 1 },
    { name: 'Cleveland', country: 'USA', cost: 1 },
    { name: 'Memphis', country: 'USA', cost: 1 },
    { name: 'St. Louis', country: 'USA', cost: 1 },
    { name: 'Kansas City', country: 'USA', cost: 1 },
    { name: 'Houston', country: 'USA', cost: 1 },
    { name: 'Phoenix', country: 'USA', cost: 1 },
    { name: 'Atlanta', country: 'USA', cost: 1 },
    { name: 'Nashville', country: 'USA', cost: 1 },
    { name: 'Las Vegas', country: 'USA', cost: 1 },
    { name: 'Miami', country: 'USA', cost: 2 },
    { name: 'Philadelphia', country: 'USA', cost: 2 },
    { name: 'Chicago', country: 'USA', cost: 2 },
    { name: 'Denver', country: 'USA', cost: 2 },
    { name: 'Seattle', country: 'USA', cost: 3 },
    { name: 'San Francisco', country: 'USA', cost: 3 },
    { name: 'New York', country: 'USA', cost: 3 },
    { name: 'Los Angeles', country: 'USA', cost: 3 },
    { name: 'Boston', country: 'USA', cost: 3 },
    { name: 'Miami Beach', country: 'USA', cost: 3 },
    { name: 'Toronto', country: 'CA', cost: 2 },
    { name: 'Vancouver', country: 'CA', cost: 2 },
    { name: 'Montreal', country: 'CA', cost: 1 },
    { name: 'Calgary', country: 'CA', cost: 1 },
    { name: 'Guadalajara', country: 'MX', cost: 1 },
    { name: 'Monterrey', country: 'MX', cost: 1 },
    { name: 'London', country: 'UK', cost: 3 },
    { name: 'Manchester', country: 'UK', cost: 2 },
    { name: 'Dublin', country: 'IE', cost: 2 },
    { name: 'Paris', country: 'FR', cost: 2 },
    { name: 'Lyon', country: 'FR', cost: 2 },
    { name: 'Berlin', country: 'DE', cost: 2 },
    { name: 'Munich', country: 'DE', cost: 3 },
    { name: 'Milan', country: 'IT', cost: 2 },
    { name: 'Rome', country: 'IT', cost: 2 },
    { name: 'Madrid', country: 'ES', cost: 1 },
    { name: 'Lisbon', country: 'PT', cost: 1 },
    { name: 'Amsterdam', country: 'NL', cost: 3 },
    { name: 'Warsaw', country: 'PL', cost: 1 },
    { name: 'Kyiv', country: 'UA', cost: 1 },
    { name: 'Cairo', country: 'EG', cost: 1 },
    { name: 'Lagos', country: 'NG', cost: 1 },
    { name: 'Nairobi', country: 'KE', cost: 1 },
    { name: 'Cape Town', country: 'ZA', cost: 1 },
    { name: 'Mumbai', country: 'IN', cost: 1 },
    { name: 'Delhi', country: 'IN', cost: 1 },
    { name: 'Bengaluru', country: 'IN', cost: 1 },
    { name: 'Jakarta', country: 'ID', cost: 1 },
    { name: 'Manila', country: 'PH', cost: 1 },
    { name: 'Bangkok', country: 'TH', cost: 1 },
    { name: 'Hanoi', country: 'VN', cost: 1 },
    { name: 'Seoul', country: 'KR', cost: 2 },
    { name: 'Tokyo', country: 'JP', cost: 3 },
    { name: 'Osaka', country: 'JP', cost: 2 },
    { name: 'Shanghai', country: 'CN', cost: 2 },
    { name: 'Beijing', country: 'CN', cost: 2 },
    { name: 'Taipei', country: 'TW', cost: 2 },
    { name: 'Sydney', country: 'AU', cost: 3 },
    { name: 'Melbourne', country: 'AU', cost: 2 },
    { name: 'Auckland', country: 'NZ', cost: 2 },
    { name: 'Rio de Janeiro', country: 'BR', cost: 1 },
    { name: 'Sao Paulo', country: 'BR', cost: 1 },
    { name: 'Buenos Aires', country: 'AR', cost: 1 },
    { name: 'Santiago', country: 'CL', cost: 1 },
    { name: 'Bogota', country: 'CO', cost: 1 },
    { name: 'Lima', country: 'PE', cost: 1 }
  ]);

  static all() {
    return Cities.#ALL;
  }

  static pick(rng) {
    return rng.pick(Cities.#ALL);
  }

  static byName(name) {
    return Cities.#ALL.find((c) => c.name === name) ?? Cities.#ALL[0];
  }

  /* Cost-of-living multiplier applied to salaries and property prices. */
  static costMultiplier(name) {
    return [0, 0.85, 1, 1.2][Cities.byName(name).cost] ?? 1;
  }

  static countryOf(name) {
    return Cities.byName(name).country;
  }
}