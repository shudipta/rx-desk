import { Routes, Route } from 'react-router-dom'
import PatientListPage from '../pages/PatientListPage'
import PatientDetailsPage from '../pages/PatientDetailsPage'
import PrescriptionCreatePage from '../pages/PrescriptionCreatePage'
import PrescriptionViewPage from '../pages/PrescriptionViewPage'
import SettingsPage from '../pages/SettingsPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PatientListPage />} />
      <Route path="/patients/:id" element={<PatientDetailsPage />} />
      <Route path="/patients/:id/new-prescription" element={<PrescriptionCreatePage />} />
      <Route path="/prescriptions/:id" element={<PrescriptionViewPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}

export default AppRoutes
