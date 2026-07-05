/** Mirrors the backend `HealthResponse` record. */
export interface HealthResponse {
  status: string;
  service: string;
  apiVersion: string;
}
