import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [MatTableModule],
  templateUrl: './booking-list.component.html',
})
export class BookingListComponent implements OnInit {
  bookings: any[] = [];
  displayedColumns: string[] = ['pickup_location', 'dropoff_location', 'pickup_datetime'];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookingService.getAllBookings().subscribe((data) => {
      this.bookings = data.payload;
    });
  }
}