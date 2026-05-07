// Centralized mock data for the property management module.
// Replace with real Supabase queries when wiring backend.

export type PropertyStatus = "Active" | "Vacant" | "Maintenance";
export type PropertyType = "Short stay" | "Long stay" | "Mixed";

export type Property = {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  coordinates: { lat: number; lng: number };
  price: string;
  monthlyIncome: number;
  currency: string;
  status: PropertyStatus;
  type: PropertyType;
  roi: number;
  occupancy: number;
  rating: number;
  reviews: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  built: number;
  description: string;
  gradient: string;
};

export const properties: Property[] = [
  {
    id: "1", name: "Príncipe Real Loft", city: "Lisbon", country: "Portugal",
    address: "Rua da Escola Politécnica 42, 1250-100 Lisboa",
    coordinates: { lat: 38.7178, lng: -9.1486 },
    price: "€2,450", monthlyIncome: 3200, currency: "EUR",
    status: "Active", type: "Short stay", roi: 14.2, occupancy: 92,
    rating: 4.9, reviews: 218, bedrooms: 2, bathrooms: 2, area: 98, built: 2022,
    description: "A meticulously designed loft in Lisbon's most iconic neighborhood. Floor-to-ceiling windows, custom oak interiors, full smart-home integration.",
    gradient: "from-emerald/40 to-skyblue/30",
  },
  {
    id: "2", name: "Skyline Tower 22F", city: "Tokyo", country: "Japan",
    address: "2-7-1 Marunouchi, Chiyoda City, Tokyo 100-0005",
    coordinates: { lat: 35.6812, lng: 139.7671 },
    price: "¥320,000", monthlyIncome: 2150, currency: "JPY",
    status: "Active", type: "Long stay", roi: 11.8, occupancy: 88,
    rating: 4.8, reviews: 142, bedrooms: 1, bathrooms: 1, area: 64, built: 2020,
    description: "High-rise apartment with panoramic Tokyo skyline views. Premium concierge and rooftop access.",
    gradient: "from-skyblue/40 to-emerald/30",
  },
  {
    id: "3", name: "Beach Villa Kuta", city: "Bali", country: "Indonesia",
    address: "Jl. Pantai Kuta No. 88, Kuta 80361",
    coordinates: { lat: -8.7184, lng: 115.1686 },
    price: "$1,250", monthlyIncome: 4800, currency: "USD",
    status: "Active", type: "Short stay", roi: 17.8, occupancy: 94,
    rating: 4.95, reviews: 412, bedrooms: 4, bathrooms: 3, area: 220, built: 2021,
    description: "Tropical beachfront villa with private pool, yoga deck and 24/7 staff.",
    gradient: "from-emerald-glow/50 to-emerald/20",
  },
  {
    id: "4", name: "Marina Penthouse", city: "Dubai", country: "UAE",
    address: "Marina Promenade, Dubai Marina",
    coordinates: { lat: 25.0772, lng: 55.1408 },
    price: "AED 8,200", monthlyIncome: 0, currency: "AED",
    status: "Maintenance", type: "Long stay", roi: 13.1, occupancy: 0,
    rating: 4.7, reviews: 96, bedrooms: 3, bathrooms: 3, area: 180, built: 2019,
    description: "Sky-high penthouse on Dubai Marina with private terrace and infinity pool view.",
    gradient: "from-silver/40 to-skyblue/30",
  },
  {
    id: "5", name: "Eixample Apt 4B", city: "Barcelona", country: "Spain",
    address: "Carrer de Mallorca 250, 08008 Barcelona",
    coordinates: { lat: 41.3954, lng: 2.1619 },
    price: "€2,100", monthlyIncome: 2780, currency: "EUR",
    status: "Active", type: "Short stay", roi: 12.4, occupancy: 89,
    rating: 4.85, reviews: 184, bedrooms: 2, bathrooms: 1, area: 86, built: 2018,
    description: "Modernist Eixample apartment with restored heritage details and rooftop terrace.",
    gradient: "from-skyblue/40 to-emerald-glow/30",
  },
  {
    id: "6", name: "Brooklyn Studio 7C", city: "New York", country: "USA",
    address: "56 N 9th St, Brooklyn, NY 11249",
    coordinates: { lat: 40.7193, lng: -73.9573 },
    price: "$3,800", monthlyIncome: 0, currency: "USD",
    status: "Vacant", type: "Long stay", roi: 9.8, occupancy: 0,
    rating: 4.6, reviews: 58, bedrooms: 1, bathrooms: 1, area: 52, built: 2017,
    description: "Industrial-chic Williamsburg studio steps from waterfront and L-train.",
    gradient: "from-emerald/30 to-skyblue/20",
  },
];

export const propertyTypes: PropertyType[] = ["Short stay", "Long stay", "Mixed"];

export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}
