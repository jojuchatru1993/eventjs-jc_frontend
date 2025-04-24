import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginResponse } from '../interfaces/login-response.interface';
import { RegisterRequest, RegisterResponse } from '../interfaces/register.interface';
import { User } from '../interfaces/user.interface';
import { StorageService } from '../../../shared/services/storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}`;

    http: HttpClient = inject(HttpClient);
    router: Router = inject(Router);
    storageService: StorageService = inject(StorageService);

    private getToken(): string | null {
        return this.storageService.getToken();
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${this.getToken()}`
        });
    }

    login(user: string, password: string): Observable<LoginResponse> {
        const url = `${this.apiUrl}/auth/login`;

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const body: any = { password };

        if (emailPattern.test(user)) {
            body.email = user;
        } else {
            body.telephone = user;
        }

        return this.http.post<LoginResponse>(url, body);
    }

    register(user: RegisterRequest): Observable<RegisterResponse> {
        const url = `${this.apiUrl}/auth`;
        return this.http.post<RegisterResponse>(url, user);
    }

    getUser(id: string): Observable<User> {
        const url = `${this.apiUrl}/auth/${id}`;
        return this.http.get<User>(url, { headers: this.getHeaders() });
    }

    logout(): void {
        this.storageService.removeItem('userId');
        this.storageService.removeItem('token');
        this.storageService.removeItem('user');

        this.router.navigate(['/auth/login']);
    }

    isAuthenticated(): boolean {
        return !!this.storageService.getToken();
    }
}
