/** Hero marquee + planner deep links (10 cities). */
const px = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1`;

export const HERO_DESTINATION_CARDS = [
  {
    destination: "Paris",
    days: 3,
    tagline: "Cafés, museums & Seine walks",
    href: "/plan?destination=Paris%2C%20France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    alt: "Paris and the Eiffel Tower",
  },
  {
    destination: "Tokyo",
    days: 5,
    tagline: "Temples, ramen & neon nights",
    href: "/plan?destination=Tokyo%2C%20Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    alt: "Tokyo at night",
  },
  {
    destination: "Bali",
    days: 4,
    tagline: "Rice terraces, beaches & temples",
    href: "/plan?destination=Bali%2C%20Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80",
    alt: "Bali temple",
  },
  {
    destination: "London",
    days: 4,
    tagline: "Pubs, museums & Thames walks",
    href: "/plan?destination=London%2C%20UK",
    image: px(460672),
    alt: "London skyline",
  },
  {
    destination: "New York",
    days: 5,
    tagline: "Broadway, bagels & skyline views",
    href: "/plan?destination=New%20York%2C%20USA",
    image: px(378570),
    alt: "New York City",
  },
  {
    destination: "Barcelona",
    days: 4,
    tagline: "Gaudí, beaches & tapas",
    href: "/plan?destination=Barcelona%2C%20Spain",
    image: px(1388030),
    alt: "Barcelona architecture",
  },
  {
    destination: "Dubai",
    days: 4,
    tagline: "Desert, souks & skyscrapers",
    href: "/plan?destination=Dubai%2C%20UAE",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85",
    alt: "Dubai skyline with skyscrapers along Sheikh Zayed Road",
  },
  {
    destination: "Sydney",
    days: 5,
    tagline: "Harbour, beaches & coastal walks",
    href: "/plan?destination=Sydney%2C%20Australia",
    image: px(995764),
    alt: "Sydney Opera House",
  },
  {
    destination: "Lisbon",
    days: 4,
    tagline: "Trams, tiles & pastel de nata",
    href: "/plan?destination=Lisbon%2C%20Portugal",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    alt: "Lisbon",
  },
  {
    destination: "Seoul",
    days: 5,
    tagline: "Palaces, K-food & night markets",
    href: "/plan?destination=Seoul%2C%20South%20Korea",
    image: px(1440476),
    alt: "Seoul cityscape",
  },
] as const;
