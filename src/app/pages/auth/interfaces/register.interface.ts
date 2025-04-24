export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    address: string;
    password: string;
}

export interface RegisterResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    address: string;
    token: string;
} 