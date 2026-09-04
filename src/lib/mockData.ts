import { Expertise } from "@/types";

export const mockExpertises: Expertise[] = [
  {
    id: "DEV-042",
    date: "2026-09-02T10:00:00Z",
    status: "Terminé",
    type: "unitaire",
    totalProposedPrice: 450,
    items: [
      {
        id: "item1",
        quantity: 1,
        grade: "B",
        unitPrice: 450,
        repairs: [{ name: "Batterie", price: 45 }, { name: "Écran", price: 120 }],
        device: {
          id: "d1",
          brand: "Apple",
          model: "iPhone 13 Pro",
          imei: "351234567890123",
          storage: "256 Go",
          color: "Graphite",
          basePrice: 600,
        }
      }
    ],
    client: {
      id: "c1",
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
      phone: "06 12 34 56 78",
    }
  },
  {
    id: "DEV-043",
    date: "2026-09-01T14:30:00Z",
    status: "En attente",
    type: "flotte",
    totalProposedPrice: 3400,
    items: [
      {
        id: "item2",
        quantity: 10,
        grade: "A",
        unitPrice: 340,
        device: {
          id: "d2",
          brand: "Samsung",
          model: "Galaxy S22",
          basePrice: 400,
        }
      }
    ],
    client: {
      id: "c2",
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      phone: "06 98 76 54 32",
      company: "TechCorp"
    }
  }
];
