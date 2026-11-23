import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Input,
  Select,
  Button,
  Space,
  Spin,
  Alert,
  message,
  Row,
  Col,
  Tag,
  Tooltip,
  AutoComplete,
  Modal,
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  CopyOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  MessageOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  PrinterOutlined,
  CommentOutlined,
  HistoryOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { fetchPatient } from '../api/patients'
import { fetchPatientPrescriptions, fetchPrescription } from '../api/prescriptions'
import {
  fetchFavoriteMedicines,
  fetchFavoriteTests,
  fetchAdviceTemplates,
  fetchFollowupTemplates,
  fetchClinicalTemplates,
} from '../api/templates'
import ClinicalListCard from '../components/ClinicalListCard'
import { createPrescription, updatePrescription } from '../api/prescriptions'
import type { Patient } from '../types/patient'
import type { PatientPrescription, Prescription, MealTiming } from '../types/prescription'
import type {
  FavoriteMedicine,
  FavoriteTest,
  AdviceTemplate,
  FollowupTemplate,
  ClinicalTemplate,
  ClinicalSection,
} from '../types/template'
import { bnFont, toBnDigits } from '../utils/bangla'
import type { CreatePrescriptionPayload } from '../types/prescription'

// Everything but the medicine name is printed for the patient, so the values
// are Bangla; the English in each label lets the doctor search in either language.
const bnOption = ([bn, en]: string[]) => ({ value: bn, label: `${bn} (${en})` })

const DURATION_OPTIONS = [
  ...[3, 5, 7, 10, 14, 21, 30, 45, 60].map((n) => [`${toBnDigits(String(n))} দিন`, `${n} days`]),
  ['১ মাস', '1 month'],
  ['২ মাস', '2 months'],
  ['৩ মাস', '3 months'],
  ['৬ মাস', '6 months'],
  ['চলবে', 'Ongoing'],
].map(bnOption)

const INSTRUCTION_OPTIONS = [
  ['খালি পেটে', 'Empty stomach'],
  ['সকালের নাস্তার সাথে', 'With breakfast'],
  ['রাতে ঘুমানোর আগে', 'At bedtime'],
  ['দিনে একবার', 'Once daily'],
  ['দিনে দুইবার', 'Twice daily'],
  ['সপ্তাহে একবার', 'Once weekly'],
  ['প্রয়োজন হলে', 'As needed'],
  ['পানির সাথে', 'With water'],
].map(bnOption)

const filterPreset = (input: string, option?: { value: string; label?: string }) =>
  `${option?.value ?? ''} ${option?.label ?? ''}`.toLowerCase().includes(input.toLowerCase())

interface MedicineEntry {
  medicine_name: string
  dosage: string
  duration: string
  instructions: string
  meal_timing: MealTiming
}

/** Older prescriptions kept "After meal(s)"/"Before meal(s)" in instructions; lift it into meal_timing. */
function splitMealTiming(m: { instructions: string; meal_timing?: MealTiming }) {
  if (m.meal_timing) return { meal_timing: m.meal_timing, instructions: m.instructions }
  const match = /^\s*(before|after)\s+meals?\s*$/i.exec(m.instructions || '')
  return match
    ? { meal_timing: match[1].toLowerCase() as MealTiming, instructions: '' }
    : { meal_timing: '' as MealTiming, instructions: m.instructions }
}

/** Title used until the doctor types their own: diagnoses, else complaints, else visit type. */
function autoTitle(diagnoses: string[], complaints: string[], visitType: string) {
  const list = (xs: string[]) => {
    const v = xs.map((x) => x.trim()).filter(Boolean)
    return v.length > 2 ? `${v.slice(0, 2).join(', ')} +${v.length - 2}` : v.join(', ')
  }
  return list(diagnoses) || list(complaints) || `${visitType} consultation`
}

function MealTimingInput({ value, onChange }: { value: MealTiming; onChange: (v: MealTiming) => void }) {
  const option = (v: 'before' | 'after', label: string) => (
    <Button
      size="small"
      type={value === v ? 'primary' : 'default'}
      onClick={() => onChange(value === v ? '' : v)}
      style={{ padding: '0 8px', fontSize: 12, fontFamily: bnFont }}
    >
      {label}
    </Button>
  )
  return (
    <Tooltip title="খাবারের আগে / পরে (before / after meal) — click again to clear">
      <Space.Compact>
        {option('before', 'আগে')}
        {option('after', 'পরে')}
      </Space.Compact>
    </Tooltip>
  )
}

function DosageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parts = (value || '0+0+0').split('+').map((s) => s.trim())
  const morning = parts[0] || '0'
  const afternoon = parts[1] || '0'
  const evening = parts[2] || '0'

  const update = (index: number, val: string) => {
    const next = [morning, afternoon, evening]
    next[index] = val
    onChange(next.join('+'))
  }

  const Slot = ({
    label,
    val,
    onChange: onSlotChange,
  }: {
    label: string
    val: string
    onChange: (v: string) => void
  }) => {
    const n = parseFloat(val) || 0
    return (
      <Tooltip title={`${label} — ডোজ`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#6b7280',
              fontFamily: bnFont,
              marginBottom: 1,
            }}
          >
            {label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <button
              type="button"
              onClick={() => onSlotChange(String(Math.max(0, n - 1)))}
              style={{
                width: 24,
                height: 26,
                border: 'none',
                background: '#f3f4f6',
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              −
            </button>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 26,
                fontSize: 13,
                fontWeight: 700,
                color: '#1a1a2e',
                background: '#fff',
                borderTop: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              {toBnDigits(String(n))}
            </span>
            <button
              type="button"
              onClick={() => onSlotChange(String(n + 1))}
              style={{
                width: 24,
                height: 26,
                border: 'none',
                background: '#f3f4f6',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 600,
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              +
            </button>
          </div>
        </div>
      </Tooltip>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Slot label="সকাল" val={morning} onChange={(v) => update(0, v)} />
      <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 700 }}>+</span>
      <Slot label="দুপুর" val={afternoon} onChange={(v) => update(1, v)} />
      <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 700 }}>+</span>
      <Slot label="রাত" val={evening} onChange={(v) => update(2, v)} />
    </div>
  )
}

function PrescriptionCreatePage() {
  // /patients/:id/new-prescription (new) or /prescriptions/:rxId/edit (edit).
  // Edit mode lives in the URL so a browser refresh cannot turn it into a new Rx.
  const { id: patientParam, rxId } = useParams<{ id?: string; rxId?: string }>()
  const editId = rxId ? Number(rxId) : undefined
  const navigate = useNavigate()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  // false = the title follows the diagnoses automatically
  const [titleTouched, setTitleTouched] = useState(false)
  const [visitType, setVisitType] = useState('OPD')
  const [followup, setFollowup] = useState('')
  const [notes, setNotes] = useState('')
  const [complaints, setComplaints] = useState<string[]>([])
  const [histories, setHistories] = useState<string[]>([])
  const [examinations, setExaminations] = useState<string[]>([])
  const [diagnoses, setDiagnoses] = useState<string[]>([])
  const [medicines, setMedicines] = useState<MedicineEntry[]>([])
  const [tests, setTests] = useState<string[]>([])
  const [advices, setAdvices] = useState<string[]>([''])

  const [favoriteMedicines, setFavoriteMedicines] = useState<FavoriteMedicine[]>([])
  const [favoriteTests, setFavoriteTests] = useState<FavoriteTest[]>([])
  const [adviceTemplates, setAdviceTemplates] = useState<AdviceTemplate[]>([])
  const [followupTemplates, setFollowupTemplates] = useState<FollowupTemplate[]>([])
  const [clinicalTemplates, setClinicalTemplates] = useState<ClinicalTemplate[]>([])

  const [previousPrescriptions, setPreviousPrescriptions] = useState<PatientPrescription[]>([])
  const [cloning, setCloning] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        let editRx: Prescription | null = null
        let patientId = patientParam ? Number(patientParam) : 0
        if (editId) {
          editRx = await fetchPrescription(editId)
          patientId = editRx.patient?.id ?? 0
        }
        if (!patientId) throw new Error('Patient not found')

        const [patientData, favMeds, favTests, advTemplates, fuTemplates, prevRx, clinTemplates] =
          await Promise.all([
            fetchPatient(patientId),
            fetchFavoriteMedicines(),
            fetchFavoriteTests(),
            fetchAdviceTemplates(),
            fetchFollowupTemplates(),
            fetchPatientPrescriptions(patientId),
            fetchClinicalTemplates(),
          ])
        if (cancelled) return
        setPatient(patientData)
        setFavoriteMedicines(favMeds)
        setFavoriteTests(favTests)
        setAdviceTemplates(advTemplates)
        setFollowupTemplates(fuTemplates)
        setClinicalTemplates(clinTemplates)
        setPreviousPrescriptions(prevRx)

        if (editRx) {
          applyPrescription(editRx, true)
        } else if (prevRx.length > 0) {
          await clonePrescription(prevRx[0].id, false)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [patientParam, editId])

  // Replace every field, so switching between older prescriptions never
  // leaves values from the previous one behind.
  // asEdit: keep the saved title (unless it was the automatic one); a clone
  // for a new visit gets a fresh automatic title.
  const applyPrescription = (rx: Prescription, asEdit = false) => {
    const dx = rx.diagnoses?.map((d) => d.diagnosis_text) ?? []
    const cc = rx.complaints?.map((c) => c.complaint_text) ?? []
    const visit = rx.visit_type || 'OPD'
    const customTitle = asEdit && !!rx.title && rx.title !== autoTitle(dx, cc, visit)
    setTitle(customTitle ? rx.title : '')
    setTitleTouched(customTitle)
    setVisitType(visit)
    setFollowup(rx.followup ?? '')
    setNotes(rx.notes ?? '')
    setComplaints(cc)
    setHistories(rx.histories?.map((h) => h.history_text) ?? [])
    setExaminations(rx.examinations?.map((e) => e.examination_text) ?? [])
    setDiagnoses(dx)
    setMedicines(
      rx.medicines?.map((m) => ({
        medicine_name: m.medicine_name,
        dosage: m.dosage,
        duration: m.duration,
        ...splitMealTiming(m),
      })) ?? [],
    )
    setTests(rx.tests?.map((t) => t.test_name) ?? [])
    setAdvices(rx.advices?.length ? rx.advices.map((a) => a.advice_text) : [''])
  }

  const clonePrescription = async (prescriptionId: number, announce = true) => {
    setCloning(true)
    try {
      const rx = await fetchPrescription(prescriptionId)
      applyPrescription(rx)
      if (announce) message.success('Cloned from previous prescription')
    } catch (err) {
      message.error('Failed to load previous prescription')
    } finally {
      setCloning(false)
    }
  }

  const isMedicineSelected = (name: string) => medicines.some((m) => m.medicine_name === name)

  const isTestSelected = (name: string) => tests.includes(name)

  const isAdviceSelected = (content: string) => advices.includes(content)

  const handleMedicineChange = (index: number, field: keyof MedicineEntry, value: string) => {
    setMedicines((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addMedicine = (name = '') =>
    setMedicines((prev) => [
      ...prev,
      { medicine_name: name, dosage: '', duration: '', instructions: '', meal_timing: '' },
    ])

  const removeMedicine = (index: number) =>
    setMedicines((prev) => prev.filter((_, i) => i !== index))

  const handleTestChange = (index: number, value: string) => {
    setTests((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const addTest = (name = '') => {
    setTests((prev) => {
      if (name && prev.length === 0) return [name]
      return [...prev, name]
    })
  }

  const removeTest = (index: number) =>
    setTests((prev) => prev.filter((_, i) => i !== index))

  const handleAdviceChange = (index: number, value: string) => {
    setAdvices((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const addAdvice = (text = '') => {
    setAdvices((prev) => {
      if (text && prev.length === 1 && !prev[0].trim()) {
        return [text]
      }
      return [...prev, text]
    })
  }

  const removeAdvice = (index: number) =>
    setAdvices((prev) => prev.filter((_, i) => i !== index))

  // Quick Reference tags toggle: a second click removes the item.
  const toggleMedicine = (name: string) =>
    isMedicineSelected(name)
      ? setMedicines((prev) => prev.filter((m) => m.medicine_name !== name))
      : addMedicine(name)

  const toggleTest = (name: string) =>
    isTestSelected(name) ? setTests((prev) => prev.filter((t) => t !== name)) : addTest(name)

  const toggleAdvice = (content: string) => {
    if (!isAdviceSelected(content)) return addAdvice(content)
    setAdvices((prev) => {
      const next = prev.filter((a) => a !== content)
      return next.length ? next : ['']
    })
  }

  const toggleFollowup = (value: string) => setFollowup((prev) => (prev === value ? '' : value))

  // Unsaved-changes tracking: compare the form with what was loaded.
  const formSnapshot = useMemo(
    () =>
      JSON.stringify({
        title, visitType, followup, notes, complaints, histories, examinations, diagnoses, medicines, tests, advices,
      }),
    [title, visitType, followup, notes, complaints, histories, examinations, diagnoses, medicines, tests, advices],
  )
  const baselineRef = useRef<string | null>(null)
  useEffect(() => {
    if (!loading && !cloning) baselineRef.current = formSnapshot
    // Only re-baseline when a load or clone finishes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, cloning])
  const isDirty = baselineRef.current !== null && baselineRef.current !== formSnapshot
  const savedRef = useRef(false)

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (savedRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const leave = (path: string) => {
    if (!isDirty) return navigate(path)
    Modal.confirm({
      title: 'Discard this prescription?',
      content: 'Your changes have not been saved.',
      okText: 'Discard',
      okButtonProps: { danger: true },
      cancelText: 'Keep editing',
      onOk: () => navigate(path),
    })
  }

  const effectiveTitle = titleTouched ? title : autoTitle(diagnoses, complaints, visitType)
  const templatesFor = (section: ClinicalSection) => clinicalTemplates.filter((t) => t.section === section)
  const clean = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean)

  const handleSubmit = async (print = false) => {
    if (!patient || submitting) return
    const hasContent =
      [complaints, histories, examinations, diagnoses].some((xs) => clean(xs).length > 0) ||
      medicines.some((m) => m.medicine_name.trim()) ||
      tests.some((t) => t.trim()) ||
      advices.some((a) => a.trim())
    if (!hasContent) {
      setSubmitError('Add at least one complaint, finding, diagnosis, medicine, test or advice')
      return
    }
    const finalTitle = effectiveTitle.trim() || autoTitle(diagnoses, complaints, visitType)

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload: CreatePrescriptionPayload = {
        patient_id: patient.id,
        title: finalTitle,
        visit_type: visitType,
        followup,
        notes,
        complaints: clean(complaints).map((t) => ({ complaint_text: t })),
        histories: clean(histories).map((t) => ({ history_text: t })),
        examinations: clean(examinations).map((t) => ({ examination_text: t })),
        diagnoses: clean(diagnoses).map((t) => ({ diagnosis_text: t })),
        medicines: medicines
          .filter((m) => m.medicine_name.trim())
          .map((m) => ({
            medicine_name: m.medicine_name.trim(),
            dosage: m.dosage.trim(),
            duration: m.duration.trim(),
            instructions: m.instructions.trim(),
            meal_timing: m.meal_timing,
          })),
        tests: tests
          .filter((t) => t.trim())
          .map((t) => ({ test_name: t.trim() })),
        advices: advices
          .filter((a) => a.trim())
          .map((a) => ({ advice_text: a.trim() })),
      }

      const result = editId
        ? await updatePrescription(editId, payload)
        : await createPrescription(payload)
      message.success(editId ? 'Prescription updated' : 'Prescription created')
      savedRef.current = true
      navigate(`/prescriptions/${result.id}${print ? '?print=1' : ''}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to ${editId ? 'update' : 'create'} prescription`
      setSubmitError(errorMsg)
      message.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Ctrl/Cmd+Enter saves, adding Shift saves and prints.
  const submitRef = useRef(handleSubmit)
  submitRef.current = handleSubmit
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        submitRef.current(e.shiftKey)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div>
        <Alert
          message="Error"
          description={error || 'Patient not found'}
          type="error"
          showIcon
          style={{ marginBottom: 16, borderRadius: 10 }}
        />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => leave(`/patients/${patient.id}`)}
        style={{
          marginBottom: 16,
          color: '#6b7280',
          fontWeight: 500,
          padding: '4px 8px',
        }}
      >
        Back
      </Button>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            style={{ borderRadius: 16, marginBottom: 20, overflow: 'hidden' }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <Row gutter={16} align="middle">
              <Col>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #006D77, #83C5BE)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  {patient.name.charAt(0).toUpperCase()}
                </div>
              </Col>
              <Col flex="auto">
                <Typography.Text style={{ fontWeight: 700, fontSize: 16 }}>
                    {editId ? 'Edit' : 'New'} Prescription — {patient.name}
                </Typography.Text>
                <Space style={{ marginLeft: 12 }}>
                  <Tag icon={<UserOutlined />} color="#006D77" style={{ margin: 0 }}>
                    {patient.gender}, {patient.age} yrs
                  </Tag>
                  <Tag icon={<PhoneOutlined />} color="#6b7280" style={{ margin: 0 }}>
                    {patient.phone}
                  </Tag>
                </Space>
              </Col>
              <Col>
                {!editId && previousPrescriptions.length > 0 && (
                  <Tooltip title="Cloned from latest prescription">
                    <Tag
                      icon={<CopyOutlined />}
                      color="success"
                      style={{ margin: 0 }}
                    >
                      Auto-cloned
                    </Tag>
                  </Tooltip>
                )}
              </Col>
            </Row>
          </Card>

          {submitError && (
            <Alert
              message={submitError}
              type="error"
              showIcon
              closable
              onClose={() => setSubmitError(null)}
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
          )}

          {!editId && !cloning && previousPrescriptions.length > 1 && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                borderRadius: 10,
                background: '#f8fffe',
                border: '1px solid #d1f2eb',
              }}
              bodyStyle={{ padding: '10px 16px' }}
            >
              <Row align="middle" gutter={8}>
                <Col>
                  <CopyOutlined style={{ color: '#006D77', fontSize: 14 }} />
                </Col>
                <Col>
                  <span style={{ fontWeight: 500, color: '#006D77', fontSize: 12 }}>
                    Switch to:
                  </span>
                </Col>
                <Col flex="auto">
                  <Select
                    size="small"
                    placeholder="Older prescription..."
                    style={{ width: '100%' }}
                    loading={cloning}
                    onChange={(rxId: number) => clonePrescription(rxId)}
                    options={previousPrescriptions.slice(1).map((rx) => ({
                      value: rx.id,
                      label: `${rx.title} (${new Date(rx.created_at).toLocaleDateString()})`,
                    }))}
                  />
                </Col>
              </Row>
            </Card>
          )}

          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                <ThunderboltOutlined style={{ marginRight: 6, color: '#006D77' }} />
                Prescription Info
              </span>
            }
            style={{ borderRadius: 16, marginBottom: 20 }}
            bodyStyle={{ padding: '14px 20px' }}
          >
            <Row gutter={12}>
              <Col span={8}>
                <Input
                  value={effectiveTitle}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    // Clearing the field hands the title back to auto-fill
                    setTitleTouched(e.target.value.trim() !== '')
                  }}
                  placeholder="Title"
                  size="middle"
                  suffix={
                    !titleTouched && (
                      <Tooltip title="Filled from the diagnoses. Type to set your own; clear to go back to automatic.">
                        <Tag color="green" style={{ margin: 0, fontSize: 10, lineHeight: '16px' }}>
                          auto
                        </Tag>
                      </Tooltip>
                    )
                  }
                />
              </Col>
              <Col span={5}>
                <Select
                  value={visitType}
                  onChange={setVisitType}
                  size="middle"
                  style={{ width: '100%' }}
                  options={[
                    { value: 'OPD', label: 'OPD' },
                    { value: 'Follow-up', label: 'Follow-up' },
                    { value: 'Emergency', label: 'Emergency' },
                    { value: 'Review', label: 'Review' },
                    { value: 'Teleconsultation', label: 'Teleconsultation' },
                  ]}
                />
              </Col>
              <Col span={5}>
                <Input
                  value={followup}
                  onChange={(e) => setFollowup(e.target.value)}
                  placeholder="পরবর্তী সাক্ষাৎ (যেমন: ৩ মাস পর)"
                  size="middle"
                  style={{ fontFamily: bnFont }}
                />
              </Col>
              <Col span={6}>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes"
                  size="middle"
                />
              </Col>
            </Row>
            {followupTemplates.length > 0 && (
              <Row style={{ marginTop: 8 }}>
                <Col>
                  <Space size={4} wrap>
                    <span
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        marginRight: 4,
                      }}
                    >
                      Quick followup:
                    </span>
                    {followupTemplates.map((f) => {
                      const selected = followup === f.value
                      return (
                        <Tag
                          key={f.id}
                          color={selected ? '#2563eb' : undefined}
                          style={{
                            cursor: 'pointer',
                            margin: 0,
                            fontSize: 11,
                          }}
                          onClick={() => toggleFollowup(f.value)}
                        >
                          {selected ? <CheckOutlined /> : <PlusOutlined />}{' '}
                          {f.value}
                        </Tag>
                      )
                    })}
                  </Space>
                </Col>
              </Row>
            )}
          </Card>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <ClinicalListCard
                title={
                  <>
                    <CommentOutlined style={{ marginRight: 6, color: '#006D77' }} />
                    C/C{' '}
                    <span style={{ fontWeight: 400, fontSize: 12, color: '#9ca3af' }}>Chief complaints</span>
                  </>
                }
                color="#c2410c"
                items={complaints}
                onChange={setComplaints}
                templates={templatesFor('cc')}
                placeholder="What the patient reports"
              />
            </Col>
            <Col xs={24} md={12}>
              <ClinicalListCard
                title={
                  <>
                    <HistoryOutlined style={{ marginRight: 6, color: '#006D77' }} />
                    P/H{' '}
                    <span style={{ fontWeight: 400, fontSize: 12, color: '#9ca3af' }}>Past history</span>
                  </>
                }
                color="#7c3aed"
                items={histories}
                onChange={setHistories}
                templates={templatesFor('ph')}
                placeholder="Previous illness, surgery, ..."
              />
            </Col>
            <Col xs={24} md={12}>
              <ClinicalListCard
                title={
                  <>
                    <DashboardOutlined style={{ marginRight: 6, color: '#006D77' }} />
                    O/E{' '}
                    <span style={{ fontWeight: 400, fontSize: 12, color: '#9ca3af' }}>On examination</span>
                  </>
                }
                color="#0f766e"
                items={examinations}
                onChange={setExaminations}
                templates={templatesFor('oe')}
                placeholder="What you observe or measure"
              />
            </Col>
            <Col xs={24} md={12}>
              <ClinicalListCard
                title={
                  <>
                    <FileTextOutlined style={{ marginRight: 6, color: '#006D77' }} />
                    Diagnosis{' '}
                    <span style={{ fontWeight: 400, fontSize: 12, color: '#9ca3af' }}></span>
                  </>
                }
                color="#006D77"
                items={diagnoses}
                onChange={setDiagnoses}
                templates={templatesFor('dx')}
                placeholder="Enter diagnosis"
              />
            </Col>
          </Row>

          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                <MedicineBoxOutlined style={{ marginRight: 6, color: '#006D77' }} />
                Medicines
              </span>
            }
            style={{ borderRadius: 16, marginBottom: 20 }}
            bodyStyle={{ padding: '14px 20px' }}
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addMedicine()}
                size="small"
              >
                Add
              </Button>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width: '22%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>MEDICINE</th>
                    <th style={{ width: '21%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>DOSAGE · <span style={{ fontFamily: bnFont }}>ডোজ</span></th>
                    <th style={{ width: '13%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>MEAL · <span style={{ fontFamily: bnFont }}>খাবার</span></th>
                    <th style={{ width: '13%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>DURATION · <span style={{ fontFamily: bnFont }}>মেয়াদ</span></th>
                    <th style={{ width: '25%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>INSTRUCTIONS · <span style={{ fontFamily: bnFont }}>নির্দেশনা</span></th>
                    <th style={{ width: '6%', padding: '4px 6px' }} />
                  </tr>
                </thead>
                <tbody>
                  {medicines.map((m, i) => (
                    <tr key={i}>
                      <td style={{ padding: '3px 4px' }}>
                        <Input
                          value={m.medicine_name}
                          onChange={(e) =>
                            handleMedicineChange(i, 'medicine_name', e.target.value)
                          }
                          placeholder="Name"
                          size="small"
                        />
                      </td>
                      <td style={{ padding: '3px 4px', verticalAlign: 'middle' }}>
                        <DosageInput
                          value={m.dosage}
                          onChange={(v) => handleMedicineChange(i, 'dosage', v)}
                        />
                      </td>
                      <td style={{ padding: '3px 4px', verticalAlign: 'middle' }}>
                        <MealTimingInput
                          value={m.meal_timing}
                          onChange={(v) => handleMedicineChange(i, 'meal_timing', v)}
                        />
                      </td>
                      <td style={{ padding: '3px 4px' }}>
                        <AutoComplete
                          value={m.duration}
                          onChange={(v) => handleMedicineChange(i, 'duration', v ?? '')}
                          size="small"
                          style={{ width: '100%', fontFamily: bnFont }}
                          options={DURATION_OPTIONS}
                          filterOption={filterPreset}
                          placeholder="মেয়াদ"
                          popupMatchSelectWidth={false}
                        />
                      </td>
                      <td style={{ padding: '3px 4px' }}>
                        <AutoComplete
                          value={m.instructions}
                          onChange={(v) => handleMedicineChange(i, 'instructions', v ?? '')}
                          size="small"
                          style={{ width: '100%', fontFamily: bnFont }}
                          options={INSTRUCTION_OPTIONS}
                          filterOption={filterPreset}
                          placeholder="নির্দেশনা"
                          popupMatchSelectWidth={false}
                        />
                      </td>
                      <td style={{ padding: '3px 4px', textAlign: 'center' }}>
                        <Button
                          icon={<MinusCircleOutlined />}
                          danger
                          onClick={() => removeMedicine(i)}
                          size="small"
                          type="text"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {medicines.length === 0 && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Click a Quick Reference tag or "Add" to enter a medicine
              </Typography.Text>
            )}
          </Card>

          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                <ExperimentOutlined style={{ marginRight: 6, color: '#006D77' }} />
                Investigations
              </span>
            }
            style={{ borderRadius: 16, marginBottom: 20 }}
            bodyStyle={{ padding: '14px 20px' }}
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addTest()}
                size="small"
              >
                Add
              </Button>
            }
          >
            {tests.map((t, i) => (
              <Row key={i} gutter={6} style={{ marginBottom: 6 }}>
                <Col flex="auto">
                  <Input
                    value={t}
                    onChange={(e) => handleTestChange(i, e.target.value)}
                    placeholder="Test name"
                    size="small"
                    onPressEnter={() => addTest()}
                  />
                </Col>
                <Col>
                  <Button
                    icon={<MinusCircleOutlined />}
                    danger
                    onClick={() => removeTest(i)}
                    size="small"
                    type="text"
                  />
                </Col>
              </Row>
            ))}
            {tests.length === 0 && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Click a Quick Reference tag or "Add" to enter a test
              </Typography.Text>
            )}
          </Card>

          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                <MessageOutlined style={{ marginRight: 6, color: '#006D77' }} />
                Advices
              </span>
            }
            style={{ borderRadius: 16, marginBottom: 20 }}
            bodyStyle={{ padding: '14px 20px' }}
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addAdvice()}
                size="small"
              >
                Add
              </Button>
            }
          >
            {advices.map((a, i) => (
              <Row key={i} gutter={6} style={{ marginBottom: 8 }}>
                <Col flex="auto">
                  <Input.TextArea
                    value={a}
                    onChange={(e) => handleAdviceChange(i, e.target.value)}
                    placeholder="পরামর্শ লিখুন (Enter advice)"
                    rows={4}
                    style={{ fontFamily: bnFont }}
                  />
                </Col>
                <Col>
                  <Button
                    icon={<MinusCircleOutlined />}
                    danger
                    onClick={() => removeAdvice(i)}
                    size="small"
                    type="text"
                    style={{ marginTop: 2 }}
                  />
                </Col>
              </Row>
            ))}
            {advices.length === 0 && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Click a Quick Reference tag or "Add" to enter advice
              </Typography.Text>
            )}
          </Card>

          {submitError && (
            <Alert
              message={submitError}
              type="error"
              showIcon
              closable
              onClose={() => setSubmitError(null)}
              style={{ marginBottom: 24, borderRadius: 10 }}
            />
          )}

          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              marginBottom: 24,
            }}
          >
            <Button
              onClick={() => leave(`/patients/${patient.id}`)}
              size="large"
              style={{ borderRadius: 10 }}
            >
              Cancel
            </Button>
            <Tooltip title="Ctrl+Enter">
              <Button
                onClick={() => handleSubmit(false)}
                loading={submitting}
                size="large"
                icon={<CheckCircleOutlined />}
                style={{ borderRadius: 10 }}
              >
                {editId ? 'Update' : 'Save'}
              </Button>
            </Tooltip>
            <Tooltip title="Ctrl+Shift+Enter">
              <Button
                type="primary"
                onClick={() => handleSubmit(true)}
                loading={submitting}
                size="large"
                icon={<PrinterOutlined />}
                style={{ borderRadius: 10, paddingLeft: 24, paddingRight: 24 }}
              >
                {editId ? 'Update & Print' : 'Save & Print'}
              </Button>
            </Tooltip>
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                <ThunderboltOutlined style={{ marginRight: 6, color: '#006D77' }} />
                Quick Reference
              </span>
            }
            style={{
              borderRadius: 16,
              position: 'sticky',
              top: 92,
            }}
            bodyStyle={{ padding: '14px 16px', maxHeight: 'calc(100vh - 160px)', overflowY: 'auto' }}
            loading={loading}
          >
            {favoriteMedicines.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  <MedicineBoxOutlined style={{ marginRight: 4 }} /> Medicines
                </div>
                <Space size={4} wrap>
                  {favoriteMedicines.map((m) => {
                    const selected = isMedicineSelected(m.name)
                    return (
                      <Tag
                        key={m.id}
                        color={selected ? '#006D77' : 'cyan'}
                        style={{
                          cursor: 'pointer',
                          margin: 0,
                          fontSize: 11,
                          opacity: selected ? 1 : 0.8,
                        }}
                        onClick={() => toggleMedicine(m.name)}
                      >
                        {selected ? <CheckOutlined /> : <PlusOutlined />} {m.name}
                      </Tag>
                    )
                  })}
                </Space>
              </div>
            )}

            {favoriteTests.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  <ExperimentOutlined style={{ marginRight: 4 }} /> Tests
                </div>
                <Space size={4} wrap>
                  {favoriteTests.map((t) => {
                    const selected = isTestSelected(t.name)
                    return (
                      <Tag
                        key={t.id}
                        color={selected ? '#7c3aed' : 'purple'}
                        style={{
                          cursor: 'pointer',
                          margin: 0,
                          fontSize: 11,
                          opacity: selected ? 1 : 0.8,
                        }}
                        onClick={() => toggleTest(t.name)}
                      >
                        {selected ? <CheckOutlined /> : <PlusOutlined />} {t.name}
                      </Tag>
                    )
                  })}
                </Space>
              </div>
            )}

            {adviceTemplates.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  <MessageOutlined style={{ marginRight: 4 }} /> Advices
                </div>
                <Space size={4} wrap>
                  {adviceTemplates.map((a) => {
                    const selected = isAdviceSelected(a.content)
                    return (
                      <Tag
                        key={a.id}
                        color={selected ? '#b45309' : 'orange'}
                        style={{
                          cursor: 'pointer',
                          margin: 0,
                          fontSize: 11,
                          opacity: selected ? 1 : 0.8,
                        }}
                        onClick={() => toggleAdvice(a.content)}
                      >
                        {selected ? <CheckOutlined /> : <PlusOutlined />} {a.title}
                      </Tag>
                    )
                  })}
                </Space>
              </div>
            )}

            {followupTemplates.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6b7280',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  <CalendarOutlined style={{ marginRight: 4 }} /> Followups
                </div>
                <Space size={4} wrap>
                  {followupTemplates.map((f) => {
                    const selected = followup === f.value
                    return (
                      <Tag
                        key={f.id}
                        color={selected ? '#2563eb' : 'geekblue'}
                        style={{
                          cursor: 'pointer',
                          margin: 0,
                          fontSize: 11,
                          opacity: selected ? 1 : 0.8,
                        }}
                        onClick={() => toggleFollowup(f.value)}
                      >
                        {selected ? <CheckOutlined /> : <PlusOutlined />} {f.value}
                      </Tag>
                    )
                  })}
                </Space>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default PrescriptionCreatePage
