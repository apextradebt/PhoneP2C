import { CheckCircle, Smartphone, Clock } from "lucide-react";

export const mockActivities = [
  { 
    id: 1, 
    title: "Colis reçu", 
    desc: "Le colis pour le devis #DEV-041 a été scanné par l'atelier.", 
    time: "Il y a 10 min", 
    icon: CheckCircle, 
    color: "text-green-500", 
    details: "Le transporteur Chronopost a livré le colis. L'état de l'emballage est intact. L'appareil est en attente d'expertise." 
  },
  { 
    id: 2, 
    title: "Nouveau Devis", 
    desc: "Création d'un devis pour un iPhone 14 Pro Max.", 
    time: "Il y a 1 heure", 
    icon: Smartphone, 
    color: "text-[var(--color-brand-terracotta)]", 
    details: "Devis initié par le client depuis la borne en boutique. Estimation initiale à 650€." 
  },
  { 
    id: 3, 
    title: "Étiquette générée", 
    desc: "Étiquette d'expédition envoyée au client (M. Dupont).", 
    time: "Il y a 2 heures", 
    icon: Clock, 
    color: "text-blue-500", 
    details: "Étiquette Colissimo n° 8V123456789. Le client a été notifié par email avec les instructions d'emballage." 
  },
  { 
    id: 4, 
    title: "Prix marché MAJ", 
    desc: "Les prix de référence ont été synchronisés depuis BackMarket.", 
    time: "Ce matin", 
    icon: CheckCircle, 
    color: "text-gray-400", 
    details: "Mise à jour de 125 modèles de la marque Apple et Samsung. Variation moyenne constatée : -2%." 
  },
  { 
    id: 5, 
    title: "Paiement émis", 
    desc: "Virement de 450€ initié pour le devis #DEV-038.", 
    time: "Hier", 
    icon: CheckCircle, 
    color: "text-green-500", 
    details: "Ordre de virement transmis à la banque. Le client devrait recevoir les fonds sous 48h." 
  },
  { 
    id: 6, 
    title: "Anomalie signalée", 
    desc: "Colis endommagé à la réception (#DEV-045).", 
    time: "Hier", 
    icon: Smartphone, 
    color: "text-red-500", 
    details: "Des réserves ont été émises auprès du transporteur. Une photo a été jointe au dossier." 
  }
];
