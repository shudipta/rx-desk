import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Spin, Result, Switch } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, PrinterOutlined } from '@ant-design/icons'
import { fetchPrescription } from '../api/prescriptions'
import { getDoctorProfile } from '../api/doctor'
import type { Prescription } from '../types/prescription'
import type { DoctorProfile } from '../types/doctor'
import { bnDuration, bnFollowup, bnFont, toBnDigits } from '../utils/bangla'

const teal = '#006D77'
const lightTeal = '#e8f4f4'

// A4 sheet. On a hospital's pre-printed pad the doctor info (top ~30%) and the
// visiting schedule (bottom ~12.5%) are already on the paper. Pad mode (the
// default) still shows both sections on screen, sized to the pad, but leaves
// them blank on paper and prints only the prescription between them.
const A4_HEIGHT_MM = 297
const PAD_TOP_MM = A4_HEIGHT_MM * 0.3 // 89.1mm
const PAD_BOTTOM_MM = A4_HEIGHT_MM * 0.125 // 37.1mm

const MEAL_TIMING: Record<string, string> = {
  before: 'খাবারের আগে',
  after: 'খাবারের পরে',
}

const styles = {
  page: {
    width: '210mm',
    margin: '0 auto',
    padding: 0,
    background: '#fff',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: '#1a1a1a',
    fontSize: 12.5,
    lineHeight: 1.6,
    // a hair under 297mm so rounding never spills onto a blank second page
    minHeight: `${A4_HEIGHT_MM - 0.5}mm`,
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
  hospitalBlock: {
    marginTop: 8,
  },
  clinicName: {
    fontSize: 12,
    color: '#444',
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
  footerBn: {
    fontFamily: bnFont,
    fontSize: 12.5,
    color: '#333',
    marginTop: 6,
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
    width: '210mm',
    margin: '0 auto 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  padSlot: {
    position: 'relative' as const,
    flexShrink: 0,
  },
  padBadge: {
    position: 'absolute' as const,
    top: 6,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff',
    border: '1px dashed #9ca3af',
    borderRadius: 10,
    padding: '0 10px',
    color: '#6b7280',
    fontSize: 11,
    whiteSpace: 'nowrap' as const,
    zIndex: 1,
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
  // Starts from the Settings default on every visit; flipping it here affects this print only
  const [padMode, setPadMode] = useState(true)

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
        setPadMode(!profile?.print_header_footer)
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
    (dp.doctor_name_bn || dp.qualification_bn || dp.specialization_bn || dp.registration_no_bn)
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
          @page { size: A4; margin: 0; }
          .ant-layout-sider { display: none !important; }
          .ant-layout-has-sider > .ant-layout { margin-left: 0 !important; }
          .ant-layout-has-sider > .ant-layout > div:first-child { display: none !important; }
          .ant-layout-content { padding: 0 !important; min-height: auto !important; }
          .pad-preprinted { visibility: hidden !important; }
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
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
          <Switch
            size="small"
            checked={!padMode}
            onChange={(on) => setPadMode(!on)}
          />
          Print header &amp; footer
        </label>
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

      <div style={padMode ? { ...styles.page, borderTop: 'none' } : styles.page} className="prescription-sheet">
        <div
          className={padMode ? 'pad-preprinted' : undefined}
          style={padMode ? { ...styles.padSlot, height: `${PAD_TOP_MM}mm`, overflow: 'hidden' } : undefined}
        >
          {padMode && <div style={styles.padBadge}>Not printed · already on the pad</div>}
          <div style={padMode ? { ...styles.headerSection, height: '100%', boxSizing: 'border-box' } : styles.headerSection}>
            <div style={styles.headerGrid}>
              {/* Left: English */}
              <div>
                <div style={styles.doctorName}>{dp?.doctor_name || "Dr. [Doctor's Name]"}</div>
                {dp?.qualification && <div style={styles.qualification}>{dp.qualification}</div>}
                <div style={styles.specialization}>{dp?.specialization || 'Senior Endocrinologist & Diabetologist'}</div>
                {dp?.registration_no && <div style={styles.regNo}>Reg No: {dp.registration_no}</div>}
                {dp?.clinic_name && <div style={{ ...styles.clinicName, ...styles.hospitalBlock }}>{dp.clinic_name}</div>}
              </div>

              {/* Right: Bangla */}
              <div style={styles.rightHeader} lang="bn">
                {/* Same lines and styles as the English column, line for line */}
                {dp?.doctor_name_bn && <div style={styles.doctorName}>{dp.doctor_name_bn}</div>}
                {dp?.qualification_bn && <div style={styles.qualification}>{dp.qualification_bn}</div>}
                {dp?.specialization_bn && <div style={styles.specialization}>{dp.specialization_bn}</div>}
                {(dp?.registration_no_bn || dp?.registration_no) && (
                  <div style={styles.regNo}>রেজি নং: {dp.registration_no_bn || dp.registration_no}</div>
                )}
                {dp?.clinic_name && dp?.clinic_name_bn && (
                  <div style={{ ...styles.clinicName, ...styles.hospitalBlock }}>{dp.clinic_name_bn}</div>
                )}
                {!hasBangla && (
                  <div className="no-print" style={{ fontFamily: 'inherit', fontSize: 12, color: '#9ca3af' }}>
                    Add the Bangla header in Settings → Doctor Profile
                  </div>
                )}
              </div>
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
                          <td style={{ ...styles.medicineTd, fontFamily: bnFont }}>{toBnDigits(m.dosage)}</td>
                          <td style={{ ...styles.medicineTd, fontFamily: bnFont }}>{bnDuration(m.duration)}</td>
                          <td style={styles.medicineTd}>
                            {MEAL_TIMING[m.meal_timing] && (
                              <div>
                                <span style={{ fontFamily: bnFont, fontWeight: 600 }}>{MEAL_TIMING[m.meal_timing]}</span>
                              </div>
                            )}
                            {m.instructions && <div style={{ fontFamily: bnFont }}>{m.instructions}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {prescription.advices?.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>
                    ADVICE &amp; INSTRUCTIONS
                    <span style={{ ...styles.sectionSub, fontFamily: bnFont }}> · পরামর্শ</span>
                  </div>
                  {prescription.advices.flatMap((a) => {
                    const lines = a.advice_text.split('\n').filter(Boolean)
                    return lines.map((line, i) => (
                      <div key={`${a.id}-${i}`} style={{ ...styles.bullet, fontFamily: bnFont }}>• {line.replace(/^[-•]\s*/, '')}</div>
                    ))
                  })}
                </div>
              )}

              {padMode && prescription.followup && (
                <div style={styles.section}>
                  <span style={{ fontWeight: 600, color: teal, fontFamily: bnFont }}>পরবর্তী সাক্ষাৎ: </span>
                  <span style={{ fontFamily: bnFont }}>{bnFollowup(prescription.followup)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={padMode ? 'pad-preprinted' : undefined}
          style={padMode ? { ...styles.padSlot, height: `${PAD_BOTTOM_MM}mm`, overflow: 'hidden' } : undefined}
        >
          {padMode && <div style={styles.padBadge}>Not printed · already on the pad</div>}
          <div style={padMode ? { ...styles.footerSection, height: '100%', boxSizing: 'border-box' } : styles.footerSection}>
            <div>
              {/* On the pad the follow-up prints in the Rx column instead */}
              {!padMode && (
                <>
                  <span style={{ fontWeight: 600, color: teal, fontFamily: bnFont }}>পরবর্তী সাক্ষাৎ: </span>
                  <span style={{ fontFamily: bnFont }}>{prescription.followup ? bnFollowup(prescription.followup) : '—'}</span>
                </>
              )}
              {(dp?.visiting_schedule_bn || dp?.appointment_contact_bn) && (
                <div lang="bn" style={styles.footerBn}>
                  {dp?.visiting_schedule_bn && <div>সাক্ষাতের সময়: {dp.visiting_schedule_bn}</div>}
                  {dp?.appointment_contact_bn && <div>সিরিয়ালের জন্য: {dp.appointment_contact_bn}</div>}
                </div>
              )}
            </div>
            <div style={styles.signatureBlock}>
              <div>Authorized Signature &amp; Seal</div>
              <div style={styles.signatureLine} />
              <div style={{ marginTop: 2, color: '#555' }}>{doctorProfile?.doctor_name || "Dr. [Doctor's Name]"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionViewPage
