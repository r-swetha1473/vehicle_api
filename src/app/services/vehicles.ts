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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Basic T1gwaDUySnRkUFE0U3ZpMFJqLjQwOGI4ZDUxNjI3YzUxNmExNTI0ZjdlYjA0NTVmNzZmOmRkYTBmNDNjNmFlMjUwOGJjNzUyZmUzMTI4MDIwMWYyYjU1MjI0NjVjNWI4N2JjMw=='
    });

    const body = { reg: vehicleNumber };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      tap((response) => console.log("✅ Vehicle API response:", response)),
      catchError((error) => {
        console.error("🚨 Vehicle API error:", error);
        return throwError(() => new Error('Vehicle lookup failed. Please try again.'));
      })
    );
  }
}
