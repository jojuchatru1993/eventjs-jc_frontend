import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../../pages/auth/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                authService.logout();
                router.navigate(['/auth/login']);
            }
            return throwError(() => error);
        })
    );
};
