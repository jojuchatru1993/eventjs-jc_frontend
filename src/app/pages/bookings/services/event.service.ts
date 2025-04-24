import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroment';
import { StorageService } from '../../../shared/services/storage.service';

export interface EventItem {
    id: number;
    title: string;
    description: string;
    date: string;
    location: string;
    capacity: number;
    organizer: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    bookingsCount: number;
    hasBooking: boolean;
}

export interface BookingItem {
    eventId: string;
}

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private apiUrl = `${environment.apiUrl}/events`;
    private apiUrlBooking = `${environment.apiUrl}/bookings`;

    private http = inject(HttpClient);
    private storageService = inject(StorageService);

    private getToken(): string | null {
        return this.storageService.getToken();
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            Authorization: `Bearer ${this.getToken()}`
        });
    }

    createEvent(event: EventItem): Observable<EventItem> {
        return this.http.post<EventItem>(this.apiUrl, event, { headers: this.getHeaders() });
    }

    updateEvent(eventId: string, event: EventItem): Observable<EventItem> {
        return this.http.patch<EventItem>(`${this.apiUrl}/${eventId}`, event, { headers: this.getHeaders() });
    }

    getEvents(): Observable<EventItem[]> {
        return this.http.get<EventItem[]>(this.apiUrl, { headers: this.getHeaders() });
    }

    deleteEvent(eventId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${eventId}`, { headers: this.getHeaders() });
    }

    createBooking(eventId: string): Observable<BookingItem> {
        const body = { eventId };

        const options = {
            headers: this.getHeaders()
        };

        return this.http.post<BookingItem>(this.apiUrlBooking, body, options);
    }

    deleteBooking(eventId: string): Observable<void> {
        const params = new HttpParams().set('eventId', eventId);

        const options = {
            headers: this.getHeaders(),
            params
        };

        return this.http.delete<void>(this.apiUrlBooking, options);
    }
}
