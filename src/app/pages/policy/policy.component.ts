import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Modal } from 'bootstrap'; 
import { AuthService } from '../../services/auth.service';
import { MultiLineChartComponent } from '../../components/multi-line-chart/multi-line-chart.component';
interface Policy {
  vehicleNumber: string;
  planType: string;
  make: string;
  model: string;
  fuelType: string;
  registrationYear: string;
  startDate: string;
  endDate: string;
  coverage: string[];
  owner: string;
  startDateFormatted?: string;
  endDateFormatted?: string;
}

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiLineChartComponent,  // ✅ Must be standalone
    MultiLineChartComponent ],
  templateUrl: './policy.component.html',
  styleUrls: ['./policy.component.css'],
  providers: [DatePipe],
})
export class PolicyComponent implements OnInit {
  policy: Policy | null = null;
  vehicleNumber: string = '';
  activeTab: string = 'overview';
  expiryWarning: boolean = false;
  vehicleImage: string = 'assets/default.png';
  errorMessage: string = '';
  private modalInstance: Modal | null = null;
 
user: any;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService ,
    private router: Router, // Added router for navigation
    private vehicleService: VehicleService,
    private datePipe: DatePipe
  ) {}
  ngAfterViewInit() {
    const modalElement = document.getElementById('editPolicyModal');
    if (modalElement) {
      this.modalInstance = new Modal(modalElement);
    }
  }
  ngOnInit() {
    this.user = this.authService.getUser();
    if (!this.user) this.router.navigate(['/login']);
    this.route.params.subscribe((params) => {
      this.vehicleNumber = params['vehicleNumber'];
      if (this.vehicleNumber) {
        this.fetchVehicleData();
      } else {
        this.errorMessage = 'Invalid vehicle data.';
        alert(this.errorMessage);  // ✅ Added alert
      }
    });
  }
  
  fetchVehicleData() {
    this.vehicleService.getVehicleData(this.vehicleNumber).subscribe({
      next: (data: any) => {
        if (data?.valid) {
          this.policy = {
            vehicleNumber: this.vehicleNumber,
            planType: 'Standard Plan', // Example static value
            make: data.makerDescription || 'Unknown',
            model: data.makerModel || 'Unknown',
            fuelType: data.fuelType || '',
            registrationYear: new Date(data.registered).getFullYear().toString(),
            startDate: data.insurancePolicyNumber ? data.insuranceIssued : '',
            endDate: data.insuranceUpto !== '1800-01-01' ? data.insuranceUpto : '',
            owner: data.owner || '',
            coverage: ['Own Damage', 'Third Party'], // Example default coverages

          };
          this.checkExpiry();
          this.setVehicleImage();
        } else {
          this.errorMessage = 'Invalid vehicle data';
          alert(this.errorMessage);
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to fetch vehicle data.';
        alert(this.errorMessage);
      }
    });
  }
 

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  

  checkExpiry() {
    if (this.policy?.endDate) {
      const expiryDate = new Date(this.policy.endDate);
      const today = new Date();
      this.expiryWarning = expiryDate <= new Date(today.setDate(today.getDate() + 7));
    }
  }

  setVehicleImage() {
    if (this.policy?.make?.toLowerCase().includes('car')) {
      this.vehicleImage = 'assets/car-image.svg';
    } else if (this.policy?.make?.toLowerCase().includes('bike')) {
      this.vehicleImage = 'assets/bike-image.svg';
    } else {
      this.vehicleImage = 'assets/default.png';
    }
  }
  openEditModal() {
    if (this.modalInstance) {
      this.modalInstance.show();
    } else {
      console.error('❌ Modal element not found!');
    }
  }
  // openEditModal() {
  //   const modalElement = document.getElementById('editPolicyModal');
  //   if (modalElement) {
    
  //     const modal = new (window as any).bootstrap.Modal(modalElement);
  //     modal.show();
  //   }
  // }

  savePolicy() {
    console.log('✅ Saving updated policy:', this.policy);
    alert('Policy updated successfully!');
    const modalElement = document.getElementById('editPolicyModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.hide();
    }
  }


  handleClaims() {
    console.log('Handling claims for:', this.policy?.vehicleNumber);
    this.router.navigate(['/claims', this.policy?.vehicleNumber]);
  }
  

  downloadPolicy() {
    console.log('Downloading policy for:', this.policy?.vehicleNumber);
    const policyData = JSON.stringify(this.policy, null, 2);
    const blob = new Blob([policyData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.policy?.vehicleNumber}_policy.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  cancelPolicy() {
    console.log('Canceling policy:', this.policy?.vehicleNumber);
    // Logic for cancellation
    this.router.navigate(['/home']); // Redirects to home after cancellation
  }

  goBack() {
    this.router.navigate(['/landing']); // Redirect to dashboard instead of history back
  }
}
