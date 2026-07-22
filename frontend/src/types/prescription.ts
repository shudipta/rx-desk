export interface PatientPrescription {
  id: number
  title: string
  visit_type: string
  followup: string
  created_at: string
}

export interface PrescriptionMedicine {
  id: number
  medicine_name: string
  dosage: string
  duration: string
  instructions: string
}

export interface PrescriptionTest {
  id: number
  test_name: string
}

export interface PrescriptionAdvice {
  id: number
  advice_text: string
}

export interface PrescriptionDiagnosis {
  id: number
  diagnosis_text: string
}

import type { Patient } from './patient'

export interface Prescription {
  id: number
  title: string
  visit_type: string
  followup: string
  notes: string
  patient?: Patient
  medicines: PrescriptionMedicine[]
  tests: PrescriptionTest[]
  advices: PrescriptionAdvice[]
  diagnoses: PrescriptionDiagnosis[]
}

export interface CreatePrescriptionPayload {
  patient_id: number
  title: string
  visit_type: string
  followup: string
  notes: string
  diagnoses: { diagnosis_text: string }[]
  medicines: {
    medicine_name: string
    dosage: string
    duration: string
    instructions: string
  }[]
  tests: { test_name: string }[]
  advices: { advice_text: string }[]
}
