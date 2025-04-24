import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { AuthService } from '../services/auth.service';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { LoginResponse } from '../interfaces/login-response.interface';
import { User } from '../interfaces/user.interface';
import { LoaderService } from '../../../shared/services/loader.service';
import { StorageService } from '../../../shared/services/storage.service';
import { Dialog } from 'primeng/dialog';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, AppFloatingConfigurator, MessageModule, Dialog],
    templateUrl: './login.html',
    styleUrls: ['./login.scss']
})
export class Login implements OnInit, OnDestroy {
    authService = inject(AuthService);
    loaderService = inject(LoaderService);
    storageService = inject(StorageService);
    router = inject(Router);
    fb = inject(FormBuilder);

    loginForm!: FormGroup;

    visible: boolean = false;
    header: string = 'Error';
    message: string = 'Datos de acceso incorrectos';

    private _destroyer$ = new Subject<void>();

    ngOnInit(): void {
        this.initLoginForm();
    }

    initLoginForm() {
        this.loginForm = this.fb.group({
            user: ['', [Validators.required, Validators.maxLength(30), this.userFormatValidator()]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
        });
    }

    userFormatValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const value = control.value;

            if (!value) {
                return null;
            }

            const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            const phonePattern = /^\d{10}$/;

            if (emailPattern.test(value) || phonePattern.test(value)) {
                return null;
            }

            return { invalidUserFormat: true };
        };
    }

    onLogin() {
        if (this.loginForm.valid) {
            this.loaderService.show();

            const { user, password } = this.loginForm.value;

            this.authService
                .login(user, password)
                .pipe(
                    takeUntil(this._destroyer$),
                    finalize(() => {
                        this.loaderService.hide();
                    })
                )
                .subscribe({
                    next: (resp: LoginResponse) => {
                        if (resp.token) {
                            this.storageService.setToken(resp.token);
                            this.storageService.setUserId(resp.id);
                            
                            this.authService.getUser(resp.id)
                                .pipe(takeUntil(this._destroyer$))
                                .subscribe({
                                    next: (userData: User) => {
                                        this.storageService.setUser(userData);
                                        this.router.navigate(['/landing']);
                                    },
                                    error: () => {
                                        this.visible = true;
                                        this.message = 'Error al obtener datos del usuario';
                                    }
                                });
                        }
                    },
                    error: () => {
                        this.visible = true;
                        this.message = 'Datos de acceso incorrectos';
                    }
                });
        } else {
            Object.keys(this.loginForm.controls).forEach((key) => {
                const control = this.loginForm.get(key);
                control?.markAsTouched();
            });
        }
    }

    ngOnDestroy(): void {
        this._destroyer$.next();
        this._destroyer$.complete();
    }
}
