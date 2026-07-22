import { apiGet, apiPost, apiPut } from './client'
import type { Patient } from '../types/patient'

export interface DashboardStats {
  total_patients: number
  today_consultations: number
}

export function fetchPatients(): Promise<Patient[]> {
  return apiGet<Patient[]>('/patients')
}

export function searchPatients(query: string): Promise<Patient[]> {
  return apiGet<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`)
}

export function fetchPatient(id: number): Promise<Patient> {
  return apiGet<Patient>(`/patients/${id}`)
}

export function createPatient(data: Partial<Patient>): Promise<Patient> {
  return apiPost<Patient>('/patients', data)
}

export function updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
  return apiPut<Patient>(`/patients/${id}`, data)
}

export function fetchDashboardStats(): Promise<DashboardStats> {
  return apiGet<DashboardStats>('/stats/dashboard')
}
