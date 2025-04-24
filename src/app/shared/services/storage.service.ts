import { Injectable } from '@angular/core';
import { User } from '../../pages/auth/interfaces/user.interface';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    setItem(key: string, value: string): void {
        localStorage.setItem(key, value);
    }

    getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    setToken(token: string): void {
        this.setItem('token', token);
    }

    getToken(): string | null {
        return this.getItem('token');
    }

    setUserId(userId: string): void {
        this.setItem('userId', userId);
    }

    getUserId(): string | null {
        return this.getItem('userId');
    }

    setUser(user: User): void {
        this.setItem('user', JSON.stringify(user));
    }

    getUser(): User | null {
        const userString = this.getItem('user');
        return userString ? JSON.parse(userString) : null;
    }
}
