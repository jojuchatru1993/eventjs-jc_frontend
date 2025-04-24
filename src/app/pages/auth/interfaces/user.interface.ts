export type UserRole = 'ADMINISTRADOR' | 'CLIENTE';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    address: string;
    roles: UserRole[];
    isActive: boolean;
    resetTokenUsed: string | null;
    resetTokenExpires: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
} 