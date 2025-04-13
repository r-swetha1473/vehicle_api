import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service'; // ✅ Import VehicleService
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-landing',
  standalone: true,
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  imports: [FormsModule, CommonModule]
})
export class LandingComponent implements OnInit {

  vehicleNumber: string = ''; // ✅ Define vehicleNumber
  errorMessage: string = ''; // ✅ Error message state
  user: any;
  constructor(private vehicleService: VehicleService, private authService: AuthService, private router: Router) {}

  searchVehicle() {
    const vehicleRegex = /^(?:[A-Z]{2}\d{2}[A-Z]{1,2}\d{4})$/; // ✅ Covers formats like MH12AB1234
  
    if (!this.vehicleNumber.trim()) {
      this.errorMessage = '❌ Please enter a vehicle number.';
      return;
    }
  
    if (!vehicleRegex.test(this.vehicleNumber.toUpperCase())) {
      this.errorMessage = '❌ Invalid format. Use format: MH12AB1234';
      return;
    }
  
    this.errorMessage = ''; // ✅ Clear error if valid
    const formattedVehicleNumber = this.vehicleNumber.toUpperCase(); // ✅ Ensure uppercase
  
    this.vehicleService.getVehicleData(formattedVehicleNumber);
    this.router.navigate([`/policy/${formattedVehicleNumber}`]);
  }
  
 ngOnInit(): void {
    this.user = this.authService.getUser();
    if (!this.user) this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
