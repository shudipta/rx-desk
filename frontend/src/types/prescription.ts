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
  meal_timing: MealTiming
}

/** When to take a medicine relative to food; '' = not specified */
export type MealTiming = '' | 'before' | 'after'

export interface PrescriptionComplaint {
  id: number
  complaint_text: string
}

export interface PrescriptionHistory {
  id: number
  history_text: string
}

export interface PrescriptionExamination {
  id: number
  examination_text: string
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
  created_at: string
  patient?: Patient
  medicines: PrescriptionMedicine[]
  tests: PrescriptionTest[]
  advices: PrescriptionAdvice[]
  diagnoses: PrescriptionDiagnosis[]
  complaints?: PrescriptionComplaint[]
  histories?: PrescriptionHistory[]
  examinations?: PrescriptionExamination[]
}

export interface CreatePrescriptionPayload {
  patient_id: number
  title: string
  visit_type: string
  followup: string
  notes: string
  complaints: { complaint_text: string }[]
  histories: { history_text: string }[]
  examinations: { examination_text: string }[]
  diagnoses: { diagnosis_text: string }[]
  medicines: {
    medicine_name: string
    dosage: string
    duration: string
    instructions: string
    meal_timing: MealTiming
  }[]
  tests: { test_name: string }[]
  advices: { advice_text: string }[]
}
