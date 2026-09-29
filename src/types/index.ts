export type CustomerType = "particulier" | "professionnel";

export type Client = {
  id: string;
  customerType?: CustomerType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  siret?: string;
  address?: string;
  postalCode?: string;
  city?: string;
};

/** Client en cours de saisie dans le formulaire du devis (tous les champs contrôlés). */
export type ClientDraft = Required<Omit<Client, "id">>;

/** Cycle de vie d'une commande (devis accepté), de la boutique au centre de traitement. */
export type OrderStatus = "En boutique" | "Expédié" | "Réceptionné" | "En traitement" | "Clôturé";

/** « Devis Envoyé » : devis en cours d'édition, pas encore accepté. */
export type DeviceStatus = "Devis Envoyé" | OrderStatus;

export type DeviceGrade = "A" | "B" | "C" | "D";

/** Téléphone ou PC (portable ou fixe) : choisit le catalogue et l'orchestrateur de prix. */
export type DeviceCategory = "phone" | "laptop";

export type Device = {
  id: string;
  model: string;
  brand: string;
  /** Absent sur les devis antérieurs aux PC : ce sont des téléphones. */
  category?: DeviceCategory;
  imei?: string; // Optional for bulk
  /** N° de série d'un PC (les téléphones sont identifiés par leur IMEI). */
  serialNumber?: string;
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

export type PaymentMethod = "virement" | "especes" | "bon_achat";

export type Payment = {
  method: PaymentMethod;
  amount: number;
  paidAt: string;
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
  /** Renseignés une fois le devis accepté et le client payé. */
  payment?: Payment;
  acceptedAt?: string;
  statusHistory?: { status: OrderStatus; at: string }[];
  /** Expédition vers le centre de traitement qui contient cette commande. */
  shipmentId?: string;
};

export type Expedition = {
  id: string;
  createdAt: string;
  /** Centre de traitement destinataire (ex. 3stepIT). */
  facility: string;
  carrier?: string;
  trackingNumber?: string;
  orderIds: string[];
  deviceCount: number;
  totalValue: number;
  receivedAt?: string;
  createdBy?: { prenom: string; nom: string };
};
