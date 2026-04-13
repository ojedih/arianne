/**
 * US vehicle makes as they appear in the NHTSA vPIC API (GetAllMakes endpoint).
 * Sorted alphabetically. Covers all commonly serviced makes in the US market.
 */
export const VEHICLE_MAKES: string[] = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Daewoo",
  "Dodge",
  "Eagle",
  "Ferrari",
  "Fiat",
  "Fisker",
  "Ford",
  "Genesis",
  "Geo",
  "GMC",
  "Honda",
  "Hummer",
  "Hyundai",
  "Infiniti",
  "Isuzu",
  "Jaguar",
  "Jeep",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Lotus",
  "Lucid",
  "Maserati",
  "Maybach",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "Mercury",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Oldsmobile",
  "Plymouth",
  "Polestar",
  "Pontiac",
  "Porsche",
  "Ram",
  "Rivian",
  "Rolls-Royce",
  "Saab",
  "Saturn",
  "Scion",
  "Smart",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

/**
 * Returns makes that start with the given query (case-insensitive).
 * Shows up to `limit` results.
 */
export function filterMakes(query: string, limit = 8): string[] {
  if (!query) return [];
  const q = query.toLowerCase();
  return VEHICLE_MAKES.filter((m) => m.toLowerCase().startsWith(q)).slice(0, limit);
}
