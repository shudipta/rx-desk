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
import type { InputRef } from 'antd'
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
} from '@ant-design/icons'
import { fetchPatient } from '../api/patients'
import { fetchPatientPrescriptions, fetchPrescription } from '../api/prescriptions'
import {
  fetchFavoriteMedicines,
  fetchFavoriteTests,
  fetchAdviceTemplates,
  fetchFollowupTemplates,
} from '../api/templates'
import { createPrescription, updatePrescription } from '../api/prescriptions'
import type { Patient } from '../types/patient'
import type { PatientPrescription, Prescription } from '../types/prescription'
import type { FavoriteMedicine, FavoriteTest, AdviceTemplate, FollowupTemplate } from '../types/template'
import type { CreatePrescriptionPayload } from '../types/prescription'

const DURATION_OPTIONS = [
  { value: '3 days', label: '3 days' },
  { value: '5 days', label: '5 days' },
  { value: '7 days', label: '7 days' },
  { value: '10 days', label: '10 days' },
  { value: '14 days', label: '14 days' },
  { value: '21 days', label: '21 days' },
  { value: '30 days', label: '30 days' },
  { value: '45 days', label: '45 days' },
  { value: '60 days', label: '60 days' },
  { value: '3 months', label: '3 months' },
  { value: '6 months', label: '6 months' },
  { value: 'Ongoing', label: 'Ongoing' },
]

const INSTRUCTION_OPTIONS = [
  { value: 'After meals', label: 'After meals' },
  { value: 'Before meals', label: 'Before meals' },
  { value: 'With breakfast', label: 'With breakfast' },
  { value: 'At bedtime', label: 'At bedtime' },
  { value: 'As needed', label: 'As needed' },
  { value: 'Twice daily', label: 'Twice daily' },
  { value: 'Once daily', label: 'Once daily' },
  { value: 'Empty stomach', label: 'Empty stomach' },
  { value: 'With water', label: 'With water' },
]

const filterPreset = (input: string, option?: { value: string }) =>
  (option?.value ?? '').toLowerCase().includes(input.toLowerCase())

interface MedicineEntry {
  medicine_name: string
  dosage: string
  duration: string
  instructions: string
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
      <Tooltip title={`${label} dose (0-9)`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#6b7280',
              textTransform: 'uppercase',
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
              {n}
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
      <Slot label="M" val={morning} onChange={(v) => update(0, v)} />
      <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 700 }}>+</span>
      <Slot label="A" val={afternoon} onChange={(v) => update(1, v)} />
      <span style={{ color: '#d1d5db', fontSize: 11, fontWeight: 700 }}>+</span>
      <Slot label="E" val={evening} onChange={(v) => update(2, v)} />
    </div>
  )
}

function PrescriptionCreatePage() {
  // /patients/:id/new-prescription (new) or /prescriptions/:rxId/edit (edit).
  // Edit mode lives in the URL so a browser refresh cannot turn it into a new Rx.
  const { id: patientParam, rxId } = useParams<{ id?: string; rxId?: string }>()
  const editId = rxId ? Number(rxId) : undefined
  const navigate = useNavigate()
  const titleRef = useRef<InputRef>(null)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [visitType, setVisitType] = useState('OPD')
  const [followup, setFollowup] = useState('')
  const [notes, setNotes] = useState('')
  const [diagnoses, setDiagnoses] = useState<string[]>([''])
  const [medicines, setMedicines] = useState<MedicineEntry[]>([])
  const [tests, setTests] = useState<string[]>([])
  const [advices, setAdvices] = useState<string[]>([''])

  const [favoriteMedicines, setFavoriteMedicines] = useState<FavoriteMedicine[]>([])
  const [favoriteTests, setFavoriteTests] = useState<FavoriteTest[]>([])
  const [adviceTemplates, setAdviceTemplates] = useState<AdviceTemplate[]>([])
  const [followupTemplates, setFollowupTemplates] = useState<FollowupTemplate[]>([])

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

        const [patientData, favMeds, favTests, advTemplates, fuTemplates, prevRx] =
          await Promise.all([
            fetchPatient(patientId),
            fetchFavoriteMedicines(),
            fetchFavoriteTests(),
            fetchAdviceTemplates(),
            fetchFollowupTemplates(),
            fetchPatientPrescriptions(patientId),
          ])
        if (cancelled) return
        setPatient(patientData)
        setFavoriteMedicines(favMeds)
        setFavoriteTests(favTests)
        setAdviceTemplates(advTemplates)
        setFollowupTemplates(fuTemplates)
        setPreviousPrescriptions(prevRx)

        if (editRx) {
          applyPrescription(editRx)
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

  useEffect(() => {
    if (!loading && patient) {
      setTimeout(() => titleRef.current?.focus(), 100)
    }
  }, [loading, patient])

  // Replace every field, so switching between older prescriptions never
  // leaves values from the previous one behind.
  const applyPrescription = (rx: Prescription) => {
    setTitle(rx.title ?? '')
    setVisitType(rx.visit_type || 'OPD')
    setFollowup(rx.followup ?? '')
    setNotes(rx.notes ?? '')
    setDiagnoses(rx.diagnoses?.length ? rx.diagnoses.map((d) => d.diagnosis_text) : [''])
    setMedicines(
      rx.medicines?.map((m) => ({
        medicine_name: m.medicine_name,
        dosage: m.dosage,
        duration: m.duration,
        instructions: m.instructions,
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

  const handleDiagnosisChange = (index: number, value: string) => {
    setDiagnoses((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const isMedicineSelected = (name: string) => medicines.some((m) => m.medicine_name === name)

  const isTestSelected = (name: string) => tests.includes(name)

  const isAdviceSelected = (content: string) => advices.includes(content)

  const addDiagnosis = (value = '') => {
    setDiagnoses((prev) => {
      if (value && prev.length === 1 && !prev[0].trim()) {
        return [value]
      }
      return [...prev, value]
    })
  }

  const removeDiagnosis = (index: number) =>
    setDiagnoses((prev) => prev.filter((_, i) => i !== index))

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
      { medicine_name: name, dosage: '', duration: '', instructions: '' },
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
    () => JSON.stringify({ title, visitType, followup, notes, diagnoses, medicines, tests, advices }),
    [title, visitType, followup, notes, diagnoses, medicines, tests, advices],
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

  const handleSubmit = async (print = false) => {
    if (!patient || submitting) return
    const hasContent =
      diagnoses.some((d) => d.trim()) ||
      medicines.some((m) => m.medicine_name.trim()) ||
      tests.some((t) => t.trim()) ||
      advices.some((a) => a.trim())
    if (!hasContent) {
      setSubmitError('Add at least one diagnosis, medicine, test or advice')
      return
    }
    // Title is optional: fall back to the first diagnosis, then the visit type.
    const finalTitle = title.trim() || diagnoses.find((d) => d.trim())?.trim() || visitType

    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload: CreatePrescriptionPayload = {
        patient_id: patient.id,
        title: finalTitle,
        visit_type: visitType,
        followup,
        notes,
        diagnoses: diagnoses
          .filter((d) => d.trim())
          .map((d) => ({ diagnosis_text: d.trim() })),
        medicines: medicines
          .filter((m) => m.medicine_name.trim())
          .map((m) => ({
            medicine_name: m.medicine_name.trim(),
            dosage: m.dosage.trim(),
            duration: m.duration.trim(),
            instructions: m.instructions.trim(),
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
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional — uses diagnosis)"
                  size="middle"
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
                  placeholder="Follow-up (e.g., 3m)"
                  size="middle"
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

          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 14 }}>
                <FileTextOutlined style={{ marginRight: 6, color: '#006D77' }} />
                Diagnoses
              </span>
            }
            style={{ borderRadius: 16, marginBottom: 20 }}
            bodyStyle={{ padding: '14px 20px' }}
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => addDiagnosis()}
                size="small"
              >
                Add
              </Button>
            }
          >
            {diagnoses.map((d, i) => (
              <Row key={i} gutter={6} style={{ marginBottom: 6 }}>
                <Col flex="auto">
                  <Input
                    value={d}
                    onChange={(e) => handleDiagnosisChange(i, e.target.value)}
                    placeholder="Enter diagnosis"
                    size="small"
                    onPressEnter={() => addDiagnosis()}
                  />
                </Col>
                <Col>
                  <Button
                    icon={<MinusCircleOutlined />}
                    danger
                    onClick={() => removeDiagnosis(i)}
                    size="small"
                    style={{ borderRadius: 6 }}
                  />
                </Col>
              </Row>
            ))}
          </Card>

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
                    <th style={{ width: '24%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>MEDICINE</th>
                    <th style={{ width: '22%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>DOSAGE (M+A+E)</th>
                    <th style={{ width: '14%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>DURATION</th>
                    <th style={{ width: '24%', textAlign: 'left', padding: '4px 6px', fontSize: 11, fontWeight: 600, color: '#6b7280' }}>INSTRUCTIONS</th>
                    <th style={{ width: '8%', padding: '4px 6px' }} />
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
                      <td style={{ padding: '3px 4px' }}>
                        <AutoComplete
                          value={m.duration}
                          onChange={(v) => handleMedicineChange(i, 'duration', v ?? '')}
                          size="small"
                          style={{ width: '100%' }}
                          options={DURATION_OPTIONS}
                          filterOption={filterPreset}
                          placeholder="Duration"
                        />
                      </td>
                      <td style={{ padding: '3px 4px' }}>
                        <AutoComplete
                          value={m.instructions}
                          onChange={(v) => handleMedicineChange(i, 'instructions', v ?? '')}
                          size="small"
                          style={{ width: '100%' }}
                          options={INSTRUCTION_OPTIONS}
                          filterOption={filterPreset}
                          placeholder="Instructions"
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
                    placeholder="Enter advice"
                    rows={4}
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
