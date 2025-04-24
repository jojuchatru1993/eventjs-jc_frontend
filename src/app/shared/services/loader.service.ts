import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private isLoading = signal<boolean>(false);
    private loadingCount = signal<number>(0);

    readonly isLoading$ = this.isLoading.asReadonly();

    show(): void {
        this.loadingCount.update(count => count + 1);
        this.isLoading.set(true);
    }

    hide(): void {
        this.loadingCount.update(count => {
            const newCount = Math.max(0, count - 1);
            if (newCount === 0) {
                this.isLoading.set(false);
            }
            return newCount;
        });
    }

    forceHide(): void {
        this.loadingCount.set(0);
        this.isLoading.set(false);
    }
}
