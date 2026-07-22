import { apiGet, apiPost, apiPut } from './client'
import type { Prescription, PatientPrescription, CreatePrescriptionPayload } from '../types/prescription'

export function createPrescription(data: CreatePrescriptionPayload): Promise<Prescription> {
  return apiPost<Prescription>('/prescriptions', data)
}

export function updatePrescription(id: number, data: CreatePrescriptionPayload): Promise<Prescription> {
  return apiPut<Prescription>(`/prescriptions/${id}`, data)
}

export function fetchPrescription(id: number): Promise<Prescription> {
  return apiGet<Prescription>(`/prescriptions/${id}`)
}

export function fetchPatientPrescriptions(patientId: number): Promise<PatientPrescription[]> {
  return apiGet<PatientPrescription[]>(`/patients/${patientId}/prescriptions`)
}
