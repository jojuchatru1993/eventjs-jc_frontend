import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

import { LoaderService } from '../../../shared/services/loader.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { StorageService } from '../../../shared/services/storage.service';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { EventItem } from '../../bookings/interfaces/even-item.interface';
import { EventService } from '../../bookings/services/event.service';
import { BookingItem } from '../../bookings/interfaces/booking-item.interface';

@Component({
    selector: 'events-widget',
    standalone: true,
    imports: [
        DividerModule,
        ButtonModule,
        RippleModule,
        PaginatorModule,
        CommonModule,
        InputTextModule,
        FormsModule,
        IconFieldModule,
        InputIconModule,
        DialogModule,
        TextareaModule,
        ReactiveFormsModule,
        CalendarModule,
        InputNumberModule,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    template: `
        <div id="events" class="py-6 px-6 lg:px-20 my-2 md:my-6">
            <div class="text-center mb-6">
                <div class="text-surface-900 dark:text-surface-0 font-normal mb-2 text-4xl">Eventos</div>
                <span class="text-muted-color text-2xl">Reserva el evento que más te guste...</span>
            </div>

            <div class="flex justify-center mb-5">
                <div class="w-full flex gap-3">
                    <div class="flex-grow">
                        <p-iconfield iconPosition="left">
                            <input pInputText type="text" class="w-full" placeholder="Buscar eventos..." [(ngModel)]="searchTerm" (input)="searchEvents()" />
                            <p-inputicon class="pi pi-search" />
                        </p-iconfield>
                    </div>
                    <div *ngIf="isAdmin()">
                        <button pButton pRipple type="button" label="Crear Evento" icon="pi pi-plus" class="p-button-primary" (click)="openNew()"></button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4 justify-between mt-6">
                <div *ngFor="let event of eventsVisible()" class="col-span-12 md:col-span-6 lg:col-span-4 p-0 md:p-3">
                    <div class="p-4 flex flex-col border-surface-200 dark:border-surface-600 event-card cursor-pointer border-2 hover:border-primary duration-300 transition-all h-full" style="border-radius: 10px">
                        <div class="text-surface-900 dark:text-surface-0 text-center my-4 text-2xl font-bold">{{ event.title }}</div>
                        <img [src]="event.image" class="w-full h-48 object-cover mx-auto rounded-lg" [alt]="event.title" />
                        <div class="my-4">
                            <p class="text-surface-700 dark:text-surface-300">{{ event.description }}</p>
                        </div>
                        <p-divider class="w-full bg-surface-200"></p-divider>
                        <ul class="my-4 list-none p-0 flex text-surface-900 dark:text-surface-0 flex-col">
                            <li class="py-1">
                                <i class="pi pi-calendar text-lg text-blue-500 mr-2"></i>
                                <span class="text-lg leading-normal"><span class="font-bold">Fecha:</span> {{ event.date | date: 'dd/MM/yyyy HH:mm' }}</span>
                            </li>
                            <li class="py-1">
                                <i class="pi pi-map-marker text-lg text-green-500 mr-2"></i>
                                <span class="text-lg leading-normal"><span class="font-bold">Lugar:</span> {{ event.location }}</span>
                            </li>
                            <li class="py-1">
                                <i class="pi pi-user text-lg text-orange-500 mr-2"></i>
                                <span class="text-lg leading-normal"><span class="font-bold">Organizador:</span> {{ event.organizer }}</span>
                            </li>
                            <li class="py-1">
                                <i class="pi pi-users text-lg text-purple-500 mr-2"></i>
                                <span class="text-lg leading-normal"><span class="font-bold">Reservados:</span> {{ event.bookingsCount }} personas</span>
                            </li>
                            <li class="py-1">
                                <i class="pi pi-users text-lg text-red-500 mr-2"></i>
                                <span class="text-lg leading-normal"><span class="font-bold">Capacidad total:</span> {{ event.capacity }} personas</span>
                            </li>
                        </ul>
                        <div class="mt-auto pt-3 flex gap-2">
                            <ng-container *ngIf="isAuthenticated(); else notAuthenticated">
                                <button *ngIf="!event.hasBooking" pButton pRipple label="Reservar" class="p-button-rounded flex-grow font-light leading-tight bg-blue-500 text-white" (click)="createBooking(event.id.toString())"></button>
                                <button *ngIf="event.hasBooking" pButton pRipple label="Cancelar reserva" class="p-button-rounded flex-grow font-light leading-tight p-button-danger" (click)="deleteBooking(event.id.toString())"></button>
                            </ng-container>
                            <ng-template #notAuthenticated>
                                <button pButton pRipple label="Iniciar sesión" class="p-button-rounded flex-grow font-light leading-tight bg-blue-500 text-white" (click)="navigateToLogin()"></button>
                            </ng-template>
                            <button *ngIf="isAdmin()" pButton pRipple icon="pi pi-pencil" class="p-button-rounded p-button-warning" (click)="editEvent(event)"></button>
                            <button *ngIf="isAdmin()" pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger" (click)="deleteEvent(event.id.toString())"></button>
                        </div>
                    </div>
                </div>
            </div>

            <div *ngIf="eventsVisible().length === 0" class="text-center my-8">
                <div class="flex flex-col items-center justify-center p-6 bg-surface-50 dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-primary mb-4">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div class="text-2xl font-semibold text-surface-800 dark:text-surface-100 mb-2">No se encontraron eventos</div>
                    <div class="text-lg text-surface-600 dark:text-surface-400">No hay eventos que coincidan con tu búsqueda</div>
                    <button pButton pRipple type="button" label="Limpiar búsqueda" icon="pi pi-times" class="p-button-outlined mt-4" (click)="clearSearch()"></button>
                </div>
            </div>

            <div *ngIf="filteredEvents().length > 0" class="flex justify-center mt-6">
                <p-paginator [rows]="elementsPerPage()" [totalRecords]="filteredEvents().length" (onPageChange)="changePage($event)" [rowsPerPageOptions]="[5, 10, 20, 50]"> </p-paginator>
            </div>
        </div>

        <p-dialog [(visible)]="eventDialog" [style]="{ width: '600px' }" [header]="editMode ? 'Actualizar evento' : 'Crear evento'" [modal]="true" [draggable]="false" [resizable]="false">
            <form [formGroup]="eventForm" (ngSubmit)="saveEvent()">
                <div class="flex flex-col gap-4 p-4">
                    <div class="field">
                        <label for="title" class="font-bold mb-2 block">Título <span class="text-red-500">*</span></label>
                        <input pInputText id="title" formControlName="title" class="w-full" />
                        <small *ngIf="(eventForm.get('title')?.invalid && eventForm.get('title')?.touched) || (submitted && eventForm.get('title')?.invalid)" class="p-error text-red-500">El título es requerido</small>
                    </div>

                    <div class="field">
                        <label for="description" class="font-bold mb-2 block">Descripción <span class="text-red-500">*</span></label>
                        <textarea pTextarea id="description" formControlName="description" rows="4" class="w-full"></textarea>
                        <small *ngIf="(eventForm.get('description')?.invalid && eventForm.get('description')?.touched) || (submitted && eventForm.get('description')?.invalid)" class="p-error text-red-500">La descripción es requerida</small>
                    </div>

                    <div class="field">
                        <label for="date" class="font-bold mb-2 block">Fecha <span class="text-red-500">*</span></label>
                        <p-calendar formControlName="date" [showTime]="true" inputId="date" [showIcon]="true" styleClass="w-full"></p-calendar>
                        <small *ngIf="(eventForm.get('date')?.invalid && eventForm.get('date')?.touched) || (submitted && eventForm.get('date')?.invalid)" class="p-error text-red-500">La fecha es requerida</small>
                    </div>

                    <div class="field">
                        <label for="location" class="font-bold mb-2 block">Ubicación <span class="text-red-500">*</span></label>
                        <input pInputText id="location" formControlName="location" class="w-full" />
                        <small *ngIf="(eventForm.get('location')?.invalid && eventForm.get('location')?.touched) || (submitted && eventForm.get('location')?.invalid)" class="p-error text-red-500">La ubicación es requerida</small>
                    </div>

                    <div class="field">
                        <label for="capacity" class="font-bold mb-2 block">Capacidad <span class="text-red-500">*</span></label>
                        <p-inputNumber id="capacity" formControlName="capacity" [min]="1" [showButtons]="true" styleClass="w-full"></p-inputNumber>
                        <small *ngIf="(eventForm.get('capacity')?.invalid && eventForm.get('capacity')?.touched) || (submitted && eventForm.get('capacity')?.invalid)" class="p-error text-red-500">
                            <ng-container *ngIf="eventForm.get('capacity')?.errors?.['required']">La capacidad es requerida</ng-container>
                            <ng-container *ngIf="eventForm.get('capacity')?.errors?.['min']">La capacidad mínima es 1</ng-container>
                            <ng-container *ngIf="eventForm.get('capacity')?.errors?.['max']">La capacidad máxima permitida es 99999</ng-container>
                        </small>
                    </div>

                    <div class="field">
                        <label for="organizer" class="font-bold mb-2 block">Organizador <span class="text-red-500">*</span></label>
                        <input pInputText id="organizer" formControlName="organizer" class="w-full" />
                        <small *ngIf="(eventForm.get('organizer')?.invalid && eventForm.get('organizer')?.touched) || (submitted && eventForm.get('organizer')?.invalid)" class="p-error text-red-500">El organizador es requerido</small>
                    </div>

                    <div class="field">
                        <label for="image" class="font-bold mb-2 block">URL de imagen <span class="text-red-500">*</span></label>
                        <input pInputText id="image" formControlName="image" class="w-full" />
                        <small *ngIf="(eventForm.get('image')?.invalid && eventForm.get('image')?.touched) || (submitted && eventForm.get('image')?.invalid)" class="p-error text-red-500">La URL de la imagen es requerida</small>
                    </div>
                </div>

                <div class="flex justify-end mt-4 p-4 pt-0 gap-2">
                    <button pButton pRipple type="button" label="Cancelar" class="p-button-text" (click)="hideDialog()"></button>
                    <button pButton pRipple type="submit" label="Guardar" [disabled]="eventForm.invalid"></button>
                </div>
            </form>
        </p-dialog>

        <p-confirmDialog header="Confirmación" icon="pi pi-exclamation-triangle" acceptLabel="Sí" rejectLabel="No"></p-confirmDialog>
    `
})
export class EventsWidget implements OnInit, OnDestroy {
    private loaderService = inject(LoaderService);
    private eventService = inject(EventService);
    private storageService = inject(StorageService);
    private formBuilder = inject(FormBuilder);
    private router = inject(Router);
    private confirmationService = inject(ConfirmationService);

    events = signal<EventItem[]>([]);
    eventsVisible = signal<EventItem[]>([]);
    filteredEvents = signal<EventItem[]>([]);
    elementsPerPage = signal<number>(5);
    currentPage = signal<number>(0);
    searchTerm = '';

    eventDialog: boolean = false;
    eventForm!: FormGroup;
    editMode: boolean = false;
    submitted: boolean = false;

    private _destroyer$ = new Subject<void>();

    constructor() {
        this.initForm();
    }

    initForm() {
        this.eventForm = this.formBuilder.group({
            id: [null],
            title: ['', Validators.required],
            description: ['', Validators.required],
            date: [null, Validators.required],
            location: ['', Validators.required],
            capacity: [1000, [Validators.required, Validators.min(1), Validators.max(99999)]],
            organizer: ['', Validators.required],
            image: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.generateEvents();
        this.filteredEvents.set([...this.events()]);
        this.updateEventsVisible();
    }

    isAdmin(): boolean {
        const user = this.storageService.getUser();
        return user?.roles.includes('ADMINISTRADOR') || false;
    }

    openNew() {
        this.editMode = false;
        this.submitted = false;
        this.eventForm.reset({
            capacity: 1000
        });
        this.eventForm.markAsUntouched();
        this.eventForm.markAsPristine();
        this.eventDialog = true;
    }

    editEvent(event: EventItem) {
        this.editMode = true;
        this.submitted = false;
        this.eventForm.patchValue({
            id: event.id,
            title: event.title,
            description: event.description,
            date: new Date(event.date),
            location: event.location,
            capacity: event.capacity,
            organizer: event.organizer,
            image: event.image
        });
        this.eventForm.markAsPristine();
        this.eventForm.markAsUntouched();
        this.eventDialog = true;
    }

    hideDialog() {
        this.eventDialog = false;
        this.submitted = false;
        this.eventForm.reset();
    }

    saveEvent() {
        this.submitted = true;

        if (this.eventForm.invalid) {
            return;
        }

        let eventData = { ...this.eventForm.value };

        if (eventData.date instanceof Date) {
            eventData.date = eventData.date.toISOString();
        }

        this.loaderService.show();

        if (this.editMode) {
            const eventId = eventData.id?.toString();
            const { id, ...eventDataWithoutId } = eventData;

            this.eventService
                .updateEvent(eventId, eventDataWithoutId)
                .pipe(
                    takeUntil(this._destroyer$),
                    finalize(() => this.loaderService.hide())
                )
                .subscribe({
                    next: () => {
                        this.generateEvents();
                        this.hideDialog();
                    },
                    error: (error) => {
                        console.error(error);
                    }
                });
        } else {
            const { id, ...newEventData } = eventData;
            this.eventService
                .createEvent(newEventData)
                .pipe(
                    takeUntil(this._destroyer$),
                    finalize(() => this.loaderService.hide())
                )
                .subscribe({
                    next: () => {
                        this.generateEvents();
                        this.hideDialog();
                    },
                    error: (error) => {
                        console.error(error);
                    }
                });
        }
    }

    deleteEvent(eventId: string) {
        this.confirmationService.confirm({
            message: '¿Estás seguro de que deseas eliminar este evento?',
            accept: () => {
                this.loaderService.show();
                this.eventService
                    .deleteEvent(eventId)
                    .pipe(
                        takeUntil(this._destroyer$),
                        finalize(() => this.loaderService.hide())
                    )
                    .subscribe({
                        next: () => {
                            this.generateEvents();
                        },
                        error: (error) => {
                            console.error(error);
                        }
                    });
            }
        });
    }

    generateEvents() {
        this.loaderService.show();
        this.eventService
            .getEvents()
            .pipe(
                takeUntil(this._destroyer$),
                finalize(() => this.loaderService.hide())
            )
            .subscribe({
                next: (resp: EventItem[]) => {
                    this.events.set(resp);
                    this.filteredEvents.set([...resp]);
                    this.updateEventsVisible();
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    updateEventsVisible() {
        const init = this.currentPage() * this.elementsPerPage();
        this.eventsVisible.set(this.filteredEvents().slice(init, init + this.elementsPerPage()));
    }

    changePage(event: any) {
        this.currentPage.set(event.page);
        this.elementsPerPage.set(event.rows);
        this.updateEventsVisible();
    }

    searchEvents() {
        if (this.searchTerm.trim() === '') {
            this.filteredEvents.set([...this.events()]);
        } else {
            const term = this.searchTerm.toLowerCase().trim();
            this.filteredEvents.set(
                this.events().filter((event) => event.title.toLowerCase().includes(term) || event.description.toLowerCase().includes(term) || event.location.toLowerCase().includes(term) || event.organizer.toLowerCase().includes(term))
            );
        }
        this.currentPage.set(0);
        this.updateEventsVisible();
    }

    clearSearch() {
        this.searchTerm = '';
        this.filteredEvents.set([...this.events()]);
        this.currentPage.set(0);
        this.updateEventsVisible();
    }

    createBooking(eventId: string) {
        this.loaderService.show();
        this.eventService
            .createBooking(eventId)
            .pipe(
                takeUntil(this._destroyer$),
                finalize(() => this.loaderService.hide())
            )
            .subscribe({
                next: () => {
                    this.generateEvents();
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    deleteBooking(bookingId: string) {
        this.loaderService.show();
        this.eventService
            .deleteBooking(bookingId)
            .pipe(
                takeUntil(this._destroyer$),
                finalize(() => this.loaderService.hide())
            )
            .subscribe({
                next: () => {
                    this.generateEvents();
                },
                error: (error) => {
                    console.error(error);
                }
            });
    }

    isAuthenticated(): boolean {
        return !!this.storageService.getUser();
    }

    navigateToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    ngOnDestroy() {
        this._destroyer$.next();
        this._destroyer$.complete();
    }
}
