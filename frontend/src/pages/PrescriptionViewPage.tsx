import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Spin, Result } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons'
import { fetchPrescription } from '../api/prescriptions'
import { getDoctorProfile } from '../api/doctor'
import type { Prescription } from '../types/prescription'
import type { DoctorProfile } from '../types/doctor'

const teal = '#006D77'
const lightTeal = '#e8f4f4'
// Bangla text: web font when online, then the system Bangla fonts of macOS / Windows
const bnFont = "'Noto Sans Bengali', 'Kohinoor Bangla', 'Bangla Sangam MN', 'Nirmala UI', 'Vrinda', sans-serif"

const MEAL_TIMING: Record<string, { en: string; bn: string }> = {
  before: { en: 'Before meal', bn: 'খাবারের আগে' },
  after: { en: 'After meal', bn: 'খাবারের পরে' },
}

const styles = {
  page: {
    width: 816,
    margin: '0 auto',
    padding: 0,
    background: '#fff',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: '#1a1a1a',
    fontSize: 12.5,
    lineHeight: 1.6,
    minHeight: 1155,
    display: 'flex',
    flexDirection: 'column' as const,
    borderTop: `4px solid ${teal}`,
  },
  headerSection: {
    background: lightTeal,
    padding: '20px 44px 16px',
  },
  headerGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 700,
    color: teal,
  },
  qualification: {
    fontSize: 12,
    fontWeight: 400,
    color: '#555',
    marginTop: 2,
    whiteSpace: 'pre-line' as const,
  },
  specialization: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
    marginTop: 4,
  },
  regNo: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  rightHeader: {
    textAlign: 'right' as const,
    fontFamily: bnFont,
  },
  doctorNameBn: {
    fontSize: 19,
    fontWeight: 700,
    color: teal,
  },
  bnLine: {
    fontSize: 12.5,
    color: '#444',
    marginTop: 1,
    whiteSpace: 'pre-line' as const,
  },
  bnStrong: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
    marginTop: 4,
  },
  hospitalBlock: {
    marginTop: 8,
  },
  hospital: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a1a2e',
  },
  clinicName: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  phone: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  schedule: {
    fontSize: 12,
    color: '#555',
    marginTop: 8,
  },
  appointment: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  bodySection: {
    padding: '20px 44px',
    flex: 1,
  },
  infoBorder: {
    border: '1px solid #d0d5dd',
    borderRadius: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoLabels: {
    display: 'grid',
    gridTemplateColumns: '1fr 0.6fr 0.6fr 1fr 1fr',
    borderBottom: '1px solid #d0d5dd',
    padding: '6px 10px',
    fontWeight: 600,
    fontSize: 12,
    color: teal,
  },
  infoValues: {
    display: 'grid',
    gridTemplateColumns: '1fr 0.6fr 0.6fr 1fr 1fr',
    padding: '6px 10px',
    fontSize: 12.5,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: teal,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  sectionSub: {
    fontWeight: 400,
    color: '#888',
    textTransform: 'none' as const,
    letterSpacing: 0,
    fontSize: 11,
  },
  rxTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: teal,
    marginBottom: 6,
  },
  medicineTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 12.5,
  },
  medicineTh: {
    textAlign: 'left' as const,
    borderBottom: `2px solid ${teal}`,
    padding: '4px 8px 4px 0',
    fontWeight: 600,
    fontSize: 12,
    color: teal,
  },
  medicineTd: {
    padding: '3px 8px 3px 0',
    borderBottom: '1px solid #e5e7eb',
    verticalAlign: 'top' as const,
  },
  bodyGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 3fr',
    gap: 0,
    alignItems: 'start',
  },
  leftCol: {
    paddingRight: 24,
  },
  rightCol: {
    borderLeft: '1px solid #d0d5dd',
    paddingLeft: 24,
  },
  bullet: {
    paddingLeft: 14,
    marginBottom: 1,
  },
  footerSection: {
    background: lightTeal,
    padding: '14px 44px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end' as const,
    fontSize: 12,
  },
  signatureBlock: {
    textAlign: 'right' as const,
  },
  signatureLine: {
    display: 'inline-block' as const,
    borderBottom: '2px solid #1a1a2e',
    minWidth: 170,
    marginTop: 6,
  },
  toolbar: {
    width: 816,
    margin: '0 auto 14px',
    display: 'flex',
    gap: 10,
  },
} satisfies Record<string, React.CSSProperties>

function PrescriptionViewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const autoPrint = searchParams.get('print') === '1'
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetchPrescription(Number(id)),
      getDoctorProfile().catch(() => null),
    ])
      .then(([rx, profile]) => {
        setPrescription(rx)
        setDoctorProfile(profile)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load prescription')
      })
      .finally(() => setLoading(false))
  }, [id])

  // "Save & Print" lands here with ?print=1: open the print dialog once, then
  // drop the flag so a refresh does not print again.
  useEffect(() => {
    if (loading || !prescription || !autoPrint) return
    setSearchParams({}, { replace: true })
    const t = setTimeout(() => window.print(), 300)
    return () => clearTimeout(t)
  }, [loading, prescription, autoPrint, setSearchParams])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error || !prescription) {
    return (
      <Result
        status="error"
        title="Failed to load prescription"
        subTitle={error}
        extra={
          <Button onClick={() => navigate('/')}>Back to Patient List</Button>
        }
      />
    )
  }

  const patientPath = prescription.patient
    ? `/patients/${prescription.patient.id}`
    : '/'
  const visitDate = new Date(prescription.created_at || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const dp = doctorProfile
  const hasBangla = !!(
    dp &&
    (dp.doctor_name_bn || dp.qualification_bn || dp.specialization_bn || dp.hospital_name_bn ||
      dp.clinic_name_bn || dp.address_bn || dp.visiting_schedule_bn || dp.appointment_contact_bn)
  )
  const listSection = (title: string, sub: string, items?: string[]) =>
    items && items.length > 0 ? (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          {title}
          {sub && <span style={styles.sectionSub}> · {sub}</span>}
        </div>
        {items.map((text, i) => (
          <div key={i} style={styles.bullet}>• {text}</div>
        ))}
      </div>
    ) : null
  const p = prescription.patient
  const gender = p?.gender
    ? p.gender.toLowerCase().startsWith('m') ? 'Male' : p.gender.toLowerCase().startsWith('f') ? 'Female' : p.gender
    : '—'
  const age = p?.age ? `${p.age} Yrs` : '—'

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          @page { margin: 0.3in; }
          .ant-layout-sider { display: none !important; }
          .ant-layout-has-sider > .ant-layout { margin-left: 0 !important; }
          .ant-layout-has-sider > .ant-layout > div:first-child { display: none !important; }
          .ant-layout-content { padding: 0 !important; min-height: auto !important; }
          .prescription-sheet { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      <div style={styles.toolbar} className="no-print">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(patientPath)}>
          Back to Patient
        </Button>
        <div style={{ flex: 1 }} />
        {prescription.patient && (
          <Button
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/prescriptions/${prescription.id}/edit`)}
          >
            Edit
          </Button>
        )}
        <Button
          type="primary"
          ghost
          icon={<PrinterOutlined />}
          onClick={() => window.print()}
          style={{ borderWidth: 1.5 }}
        >
          Print
        </Button>
      </div>

      <div style={styles.page} className="prescription-sheet">
        <div style={styles.headerSection}>
          <div style={styles.headerGrid}>
            {/* Left: English */}
            <div>
              <div style={styles.doctorName}>{dp?.doctor_name || "Dr. [Doctor's Name]"}</div>
              {dp?.qualification && <div style={styles.qualification}>{dp.qualification}</div>}
              <div style={styles.specialization}>{dp?.specialization || 'Senior Endocrinologist & Diabetologist'}</div>
              {dp?.registration_no && <div style={styles.regNo}>Reg No: {dp.registration_no}</div>}
              <div style={styles.hospitalBlock}>
                <div style={styles.hospital}>{dp?.hospital_name || 'RxDesk Hospital, OPD-1'}</div>
                {dp?.clinic_name && <div style={styles.clinicName}>{dp.clinic_name}</div>}
                {dp?.address && <div style={styles.address}>{dp.address}</div>}
                {dp?.phone && <div style={styles.phone}>Phone: {dp.phone}</div>}
                {dp?.visiting_schedule && <div style={styles.schedule}>Visiting: {dp.visiting_schedule}</div>}
                {dp?.appointment_contact && <div style={styles.appointment}>Appointment: {dp.appointment_contact}</div>}
              </div>
            </div>

            {/* Right: Bangla */}
            <div style={styles.rightHeader} lang="bn">
              {dp?.doctor_name_bn && <div style={styles.doctorNameBn}>{dp.doctor_name_bn}</div>}
              {dp?.qualification_bn && <div style={styles.bnLine}>{dp.qualification_bn}</div>}
              {dp?.specialization_bn && <div style={styles.bnStrong}>{dp.specialization_bn}</div>}
              <div style={styles.hospitalBlock}>
                {dp?.hospital_name_bn && <div style={styles.bnStrong}>{dp.hospital_name_bn}</div>}
                {dp?.clinic_name_bn && <div style={styles.bnLine}>{dp.clinic_name_bn}</div>}
                {dp?.address_bn && <div style={styles.bnLine}>{dp.address_bn}</div>}
                {dp?.visiting_schedule_bn && <div style={styles.bnLine}>সাক্ষাতের সময়: {dp.visiting_schedule_bn}</div>}
                {dp?.appointment_contact_bn && <div style={styles.bnLine}>সিরিয়ালের জন্য: {dp.appointment_contact_bn}</div>}
              </div>
              {!hasBangla && (
                <div className="no-print" style={{ fontFamily: 'inherit', fontSize: 12, color: '#9ca3af' }}>
                  Add the Bangla header in Settings → Doctor Profile
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.bodySection}>
          <div style={styles.infoBorder}>
            <div style={styles.infoLabels}>
              <div>PATIENT NAME</div>
              <div>AGE</div>
              <div>GENDER</div>
              <div>CONTACT PHONE</div>
              <div>VISIT DATE</div>
            </div>
            <div style={styles.infoValues}>
              <div>{p?.name ?? '—'}</div>
              <div>{age}</div>
              <div>{gender}</div>
              <div>{p?.phone ?? '—'}</div>
              <div>{visitDate}</div>
            </div>
          </div>

          <div style={styles.bodyGrid}>
            <div style={styles.leftCol}>
              {listSection('C/C', 'Chief complaints', prescription.complaints?.map((x) => x.complaint_text))}
              {listSection('P/H', 'Past history', prescription.histories?.map((x) => x.history_text))}
              {listSection('O/E', 'On examination', prescription.examinations?.map((x) => x.examination_text))}
              {listSection('Diagnosis', '', prescription.diagnoses?.map((x) => x.diagnosis_text))}
              {listSection('Investigations', '', prescription.tests?.map((x) => x.test_name))}
            </div>

            <div style={styles.rightCol}>
              {prescription.medicines?.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.rxTitle}>Rₓ</div>
                  <table style={styles.medicineTable}>
                    <thead>
                      <tr>
                        <th style={styles.medicineTh}>Medicine / Drug Name</th>
                        <th style={{ ...styles.medicineTh, width: 100 }}>Dosage Plan</th>
                        <th style={{ ...styles.medicineTh, width: 80 }}>Duration</th>
                        <th style={styles.medicineTh}>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescription.medicines.map((m) => (
                        <tr key={m.id}>
                          <td style={{ ...styles.medicineTd, fontWeight: 600 }}>{m.medicine_name}</td>
                          <td style={styles.medicineTd}>{m.dosage}</td>
                          <td style={styles.medicineTd}>{m.duration}</td>
                          <td style={styles.medicineTd}>
                            {MEAL_TIMING[m.meal_timing] && (
                              <div>
                                <span style={{ fontFamily: bnFont, fontWeight: 600 }}>{MEAL_TIMING[m.meal_timing].bn}</span>{' '}
                                <span style={{ color: '#666', fontSize: 11 }}>({MEAL_TIMING[m.meal_timing].en})</span>
                              </div>
                            )}
                            {m.instructions && <div>{m.instructions}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {prescription.advices?.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>ADVICE &amp; INSTRUCTIONS</div>
                  {prescription.advices.flatMap((a) => {
                    const lines = a.advice_text.split('\n').filter(Boolean)
                    return lines.map((line, i) => (
                      <div key={`${a.id}-${i}`} style={styles.bullet}>• {line.replace(/^[-•]\s*/, '')}</div>
                    ))
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footerSection}>
          <div>
            <span style={{ fontWeight: 600, color: teal }}>Follow-up Interval: </span>
            {prescription.followup || 'Not specified'}
          </div>
          <div style={styles.signatureBlock}>
            <div>Authorized Signature &amp; Seal</div>
            <div style={styles.signatureLine} />
            <div style={{ marginTop: 2, color: '#555' }}>{doctorProfile?.doctor_name || "Dr. [Doctor's Name]"}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionViewPage
