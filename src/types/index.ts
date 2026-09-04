export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
};

export type DeviceStatus = "En attente" | "Reçu" | "Expertisé" | "Devis Envoyé" | "Terminé" | "Annulé";

export type DeviceGrade = "A" | "B" | "C" | "D";

export type Device = {
  id: string;
  model: string;
  brand: string;
  imei?: string; // Optional for bulk
  storage?: string;
  color?: string;
  basePrice: number; // The generic market price for a flawless device
};

export type DevisItem = {
  id: string;
  device: Device;
  grade: DeviceGrade;
  quantity: number;
  unitPrice: number; // After grade deduction
  repairs?: { name: string, price: number }[];
};

export type Expertise = {
  id: string;
  client: Client;
  status: DeviceStatus;
  type: "unitaire" | "flotte";
  items: DevisItem[];
  totalProposedPrice: number;
  date: string;
  notes?: string;
};
