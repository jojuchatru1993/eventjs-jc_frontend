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
import { LoaderService } from '../../../shared/services/loader.service';
import { StorageService } from '../../../shared/services/storage.service';
import { Dialog } from 'primeng/dialog';
import { finalize, Subject, takeUntil } from 'rxjs';
import { RegisterRequest } from '../interfaces/register.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, ReactiveFormsModule, AppFloatingConfigurator, MessageModule, Dialog],
    templateUrl: './register.html',
    styleUrls: ['./register.scss']
})
export class Register implements OnInit, OnDestroy {
    authService = inject(AuthService);
    loaderService = inject(LoaderService);
    storageService = inject(StorageService);
    router = inject(Router);
    fb = inject(FormBuilder);

    registerForm!: FormGroup;

    visible: boolean = false;
    header: string = 'Error';
    message: string = 'Datos de acceso incorrectos';

    private _destroyer$ = new Subject<void>();

    ngOnInit(): void {
        this.initRegisterForm();
    }

    initRegisterForm() {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
            telephone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
            address: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
            rememberMe: [false]
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

    onRegister() {
        if (this.registerForm.valid) {
            this.loaderService.show();

            const registerData: RegisterRequest = {
                firstName: this.registerForm.get('firstName')?.value,
                lastName: this.registerForm.get('lastName')?.value,
                email: this.registerForm.get('email')?.value,
                telephone: this.registerForm.get('telephone')?.value,
                address: this.registerForm.get('address')?.value,
                password: this.registerForm.get('password')?.value
            };

            this.authService
                .register(registerData)
                .pipe(
                    takeUntil(this._destroyer$),
                    finalize(() => this.loaderService.hide())
                )
                .subscribe({
                    next: () => {
                        this.router.navigate(['/auth/login']);
                    },
                    error: (error: HttpErrorResponse) => {
                        this.header = 'Error de registro';

                        if (error.status === 403) {
                            this.message = 'El usuario ya existe';
                        } else {
                            this.message = 'Error en el registro. Contacte al administrador';
                        }

                        this.visible = true;
                    }
                });
        } else {
            Object.keys(this.registerForm.controls).forEach((key) => {
                const control = this.registerForm.get(key);
                control?.markAsTouched();
            });
        }
    }

    ngOnDestroy(): void {
        this._destroyer$.next();
        this._destroyer$.complete();
    }
}
