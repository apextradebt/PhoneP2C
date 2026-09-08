export type User = {
    _id?: string;
    email: string;
    nom: string;
    prenom: string;
    magasin: string;
    role: Role;
    auth0Id: string;
    [key: string]: any;
}

export type Role = "Employe" | "Manager" | "Admin" | string;