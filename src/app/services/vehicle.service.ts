

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'https://api.attestr.com/api/v2/public/checkx/rc';

  constructor(private http: HttpClient) {}

  getVehicleData(vehicleNumber: string): Observable<any> {
    if (!vehicleNumber || vehicleNumber.trim() === '') {
      alert('Vehicle number is required.');
      return throwError(() => new Error('Vehicle number cannot be empty.'));
    }
  
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic T1gwaDUySnRkUFE0U3ZpMFJqLjQwOGI4ZDUxNjI3YzUxNmExNTI0ZjdlYjA0NTVmNzZmOmRkYTBmNDNjNmFlMjUwOGJjNzUyZmUzMTI4MDIwMWYyYjU1MjI0NjVjNWI4N2JjMw=='
    });
  
    const body = { reg: vehicleNumber.trim().toUpperCase() }; // Trim and uppercase just in case
  
    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      tap((response) => console.log("✅ Vehicle API response:", response)),
      catchError((error) => {
        console.error("🚨 Vehicle API error:", error);
        alert("Vehicle lookup failed: " + (error.error?.message || error.message));
        return throwError(() => new Error('Vehicle lookup failed. Please try again.'));
      })
    );
  }
  
}











// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError, map, tap } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class VehicleService {
//   private mockDataUrl = 'assets/mock-vehicle-data.json'; // Ensure this path is correct!

//   constructor(private http: HttpClient) {}

//   getVehicleData(vehicleNumber: string): Observable<any> {
//     return this.http.get<any>(this.mockDataUrl).pipe(
//       tap((data) => console.log("🔍 Raw Data Loaded:", data)), // Debugging log
//       map((data) => {
//         if (!data || !data.policy) {
//           throw new Error("❌ Invalid JSON structure: 'policy' key is missing");
//         }

//         // Clone policy and update vehicleNumber
//         let updatedPolicy = { ...data.policy, vehicleNumber: vehicleNumber };

//         return { policy: updatedPolicy, expiryWarning: data.expiryWarning };
//       }),
//       tap((vehicleData) => console.log("✅ Updated Vehicle Data:", vehicleData)),
//       catchError((error) => {
//         console.error("🚨 Error Loading Vehicle Data:", error.message);
//         return throwError(() => new Error('Vehicle data not found or incorrect format'));
//       })
//     );
//   }
// }
