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
