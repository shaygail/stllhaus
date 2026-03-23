export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
};

export const menuItems: MenuItem[] = [
  {
    id: "matcha-cloud",
    name: "Matcha Cloud",
    description: "Ceremonial matcha, oat milk cloud, subtle maple sweetness.",
    price: 7.5,
    image: "/matcha-cloud.jpg",
  },
  {
    id: "ube-cloud",
    name: "Ube Cloud",
    description: "Creamy ube blend with vanilla foam and toasted coconut dust.",
    price: 8,
    image: "/ube-cloud.jpg",
  },
  {
    id: "coconut-still",
    name: "Coconut Still",
    description: "Fresh coconut water, pandan hint, and lime blossom finish.",
    price: 6.5,
    image: "/coconut-still.jpg",
  },
  {
    id: "coconut-mocha-whisk",
    name: "Coconut Mocha Whisk",
    description: "Coconut cream, cacao, and soft espresso swirl over ice.",
    price: 7.75,
    image: "/coconut-mocha.jpg",
  },
];