import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private mockDataUrl = 'assets/mock-vehicle-data.json'; // Ensure this path is correct!

  constructor(private http: HttpClient) {}

  getVehicleData(vehicleNumber: string): Observable<any> {
    return this.http.get<any>(this.mockDataUrl).pipe(
      tap((data) => console.log("🔍 Raw Data Loaded:", data)), // Debugging log
      map((data) => {
        if (!data || !data.policy) {
          throw new Error("❌ Invalid JSON structure: 'policy' key is missing");
        }

        // Clone policy and update vehicleNumber
        let updatedPolicy = { ...data.policy, vehicleNumber: vehicleNumber };

        return { policy: updatedPolicy, expiryWarning: data.expiryWarning };
      }),
      tap((vehicleData) => console.log("✅ Updated Vehicle Data:", vehicleData)),
      catchError((error) => {
        console.error("🚨 Error Loading Vehicle Data:", error.message);
        return throwError(() => new Error('Vehicle data not found or incorrect format'));
      })
    );
  }
}
