import { apiGet, apiPut } from './client'
import type { DoctorProfile } from '../types/doctor'

export function getDoctorProfile(): Promise<DoctorProfile> {
  return apiGet<DoctorProfile>('/doctor/profile')
}

export function updateDoctorProfile(data: Partial<DoctorProfile>): Promise<DoctorProfile> {
  return apiPut<DoctorProfile>('/doctor/profile', data)
}
