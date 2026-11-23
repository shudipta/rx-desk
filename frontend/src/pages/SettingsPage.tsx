import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Spin, Result, message, Modal, Space, Typography, Divider } from 'antd'
import {
  SaveOutlined, PlusOutlined, EditOutlined, DeleteOutlined, MedicineBoxOutlined, ExperimentOutlined, MessageOutlined,
  CalendarOutlined, CommentOutlined, HistoryOutlined, DashboardOutlined, FileTextOutlined,
} from '@ant-design/icons'
import { getDoctorProfile, updateDoctorProfile } from '../api/doctor'
import {
  fetchFavoriteMedicines, createFavoriteMedicine, updateFavoriteMedicine, deleteFavoriteMedicine,
  fetchFavoriteTests, createFavoriteTest, updateFavoriteTest, deleteFavoriteTest,
  fetchAdviceTemplates, createAdviceTemplate, updateAdviceTemplate, deleteAdviceTemplate,
  fetchFollowupTemplates, createFollowupTemplate, updateFollowupTemplate, deleteFollowupTemplate,
  fetchClinicalTemplates, createClinicalTemplate, updateClinicalTemplate, deleteClinicalTemplate,
} from '../api/templates'
import type {
  FavoriteMedicine, FavoriteTest, AdviceTemplate, FollowupTemplate, ClinicalTemplate, ClinicalSection,
} from '../types/template'

type TemplateType = 'medicine' | 'test' | 'advice' | 'followup' | ClinicalSection
const CLINICAL_SECTIONS: ClinicalSection[] = ['cc', 'ph', 'oe', 'dx']
const isClinical = (t: TemplateType): t is ClinicalSection => (CLINICAL_SECTIONS as string[]).includes(t)
const bnInput = { fontFamily: "'Noto Sans Bengali', 'Kohinoor Bangla', 'Nirmala UI', 'Vrinda', sans-serif" }

function SettingsPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Template data
  const [medicines, setMedicines] = useState<FavoriteMedicine[]>([])
  const [tests, setTests] = useState<FavoriteTest[]>([])
  const [advices, setAdvices] = useState<AdviceTemplate[]>([])
  const [followups, setFollowups] = useState<FollowupTemplate[]>([])
  const [clinical, setClinical] = useState<ClinicalTemplate[]>([])

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TemplateType>('medicine')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Modal form values
  const [field1, setField1] = useState('')
  const [field2, setField2] = useState('')

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      getDoctorProfile().then((p) => form.setFieldsValue(p)),
      fetchFavoriteMedicines().then(setMedicines),
      fetchFavoriteTests().then(setTests),
      fetchAdviceTemplates().then(setAdvices),
      fetchFollowupTemplates().then(setFollowups),
      fetchClinicalTemplates().then(setClinical),
    ]).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      await updateDoctorProfile(values)
      message.success('Profile saved successfully')
    } catch (err) {
      if (err instanceof Error) message.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openAdd = (type: TemplateType) => {
    setModalType(type)
    setEditingId(null)
    setField1('')
    setField2('')
    setModalOpen(true)
  }

  const openEdit = (type: TemplateType, id: number, v1: string, v2: string) => {
    setModalType(type)
    setEditingId(id)
    setField1(v1)
    setField2(v2)
    setModalOpen(true)
  }

  const handleModalOk = async () => {
    if (!field1.trim()) {
      message.error('Name/Title is required')
      return
    }
    if ((modalType === 'advice' || modalType === 'followup') && !field2.trim()) {
      message.error(`${modalType === 'advice' ? 'Content' : 'Value'} is required`)
      return
    }
    setModalLoading(true)
    try {
      if (isClinical(modalType)) {
        if (editingId) {
          const updated = await updateClinicalTemplate(editingId, modalType, field1.trim())
          setClinical((prev) => prev.map((c) => c.id === editingId ? updated : c))
        } else {
          const created = await createClinicalTemplate(modalType, field1.trim())
          setClinical((prev) => [...prev, created])
        }
      } else if (modalType === 'medicine') {
        if (editingId) {
          const updated = await updateFavoriteMedicine(editingId, field1.trim())
          setMedicines((prev) => prev.map((m) => m.id === editingId ? updated : m))
        } else {
          const created = await createFavoriteMedicine(field1.trim())
          setMedicines((prev) => [...prev, created])
        }
      } else if (modalType === 'test') {
        if (editingId) {
          const updated = await updateFavoriteTest(editingId, field1.trim())
          setTests((prev) => prev.map((t) => t.id === editingId ? updated : t))
        } else {
          const created = await createFavoriteTest(field1.trim())
          setTests((prev) => [...prev, created])
        }
      } else if (modalType === 'advice') {
        if (editingId) {
          const updated = await updateAdviceTemplate(editingId, field1.trim(), field2.trim())
          setAdvices((prev) => prev.map((a) => a.id === editingId ? updated : a))
        } else {
          const created = await createAdviceTemplate(field1.trim(), field2.trim())
          setAdvices((prev) => [...prev, created])
        }
      } else if (modalType === 'followup') {
        if (editingId) {
          const updated = await updateFollowupTemplate(editingId, field1.trim(), field2.trim())
          setFollowups((prev) => prev.map((f) => f.id === editingId ? updated : f))
        } else {
          const created = await createFollowupTemplate(field1.trim(), field2.trim())
          setFollowups((prev) => [...prev, created])
        }
      }
      setModalOpen(false)
      message.success(editingId ? 'Updated' : 'Added')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (type: TemplateType, id: number) => {
    try {
      if (isClinical(type)) {
        await deleteClinicalTemplate(id)
        setClinical((prev) => prev.filter((c) => c.id !== id))
      } else if (type === 'medicine') {
        await deleteFavoriteMedicine(id)
        setMedicines((prev) => prev.filter((m) => m.id !== id))
      } else if (type === 'test') {
        await deleteFavoriteTest(id)
        setTests((prev) => prev.filter((t) => t.id !== id))
      } else if (type === 'advice') {
        await deleteAdviceTemplate(id)
        setAdvices((prev) => prev.filter((a) => a.id !== id))
      } else if (type === 'followup') {
        await deleteFollowupTemplate(id)
        setFollowups((prev) => prev.filter((f) => f.id !== id))
      }
      message.success('Deleted')
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', paddingTop: 80 }}><Spin size="large" /></div>
  }

  if (error) {
    return <Result status="error" title="Failed to load" subTitle={error} extra={<Button onClick={() => window.location.reload()}>Retry</Button>} />
  }

  const sectionMeta: Record<TemplateType, { title: string; singular: string; icon: React.ReactNode; emptyText: string }> = {
    cc: { title: 'C/C — Chief Complaints', singular: 'Chief Complaint', icon: <CommentOutlined style={{ color: '#c2410c', fontSize: 16 }} />, emptyText: 'No complaint templates yet' },
    ph: { title: 'P/H — Past History', singular: 'Past History', icon: <HistoryOutlined style={{ color: '#7c3aed', fontSize: 16 }} />, emptyText: 'No past history templates yet' },
    oe: { title: 'O/E — On Examination', singular: 'Examination Finding', icon: <DashboardOutlined style={{ color: '#0f766e', fontSize: 16 }} />, emptyText: 'No examination templates yet' },
    dx: { title: 'Diagnosis', singular: 'Diagnosis', icon: <FileTextOutlined style={{ color: '#006D77', fontSize: 16 }} />, emptyText: 'No diagnosis templates yet' },
    medicine: { title: 'Favorite Medicines', singular: 'Favorite Medicine', icon: <MedicineBoxOutlined style={{ color: '#006D77', fontSize: 16 }} />, emptyText: 'No favorite medicines added yet' },
    test: { title: 'Favorite Tests', singular: 'Favorite Test', icon: <ExperimentOutlined style={{ color: '#7c3aed', fontSize: 16 }} />, emptyText: 'No favorite tests added yet' },
    advice: { title: 'Advice Templates', singular: 'Advice Template', icon: <MessageOutlined style={{ color: '#b45309', fontSize: 16 }} />, emptyText: 'No advice templates added yet' },
    followup: { title: 'Followup Templates', singular: 'Followup Template', icon: <CalendarOutlined style={{ color: '#2563eb', fontSize: 16 }} />, emptyText: 'No followup templates added yet' },
  }

  const modalTitle = `${editingId ? 'Edit' : 'Add'} ${sectionMeta[modalType].singular}`
  const label1 = isClinical(modalType) ? 'Text' : modalType === 'advice' || modalType === 'followup' ? 'Title' : 'Name'
  const label2 = modalType === 'advice' ? 'Content' : modalType === 'followup' ? 'Value' : null

  const renderSection = (type: TemplateType) => {
    const meta = sectionMeta[type]
    let items: { id: number; label: string; sub?: string }[]
    if (isClinical(type)) items = clinical.filter((c) => c.section === type).map((c) => ({ id: c.id, label: c.text }))
    else if (type === 'medicine') items = medicines.map((m) => ({ id: m.id, label: m.name }))
    else if (type === 'test') items = tests.map((t) => ({ id: t.id, label: t.name }))
    else if (type === 'advice') items = advices.map((a) => ({ id: a.id, label: a.title, sub: a.content }))
    else items = followups.map((f) => ({ id: f.id, label: f.title, sub: f.value }))

    return (
      <Card
        key={type}
        title={
          <Space size={8}>
            {meta.icon}
            <span style={{ fontSize: 15, fontWeight: 600 }}>{meta.title}</span>
          </Space>
        }
        extra={
          <Button type="primary" ghost size="small" icon={<PlusOutlined />} onClick={() => openAdd(type)}>
            Add
          </Button>
        }
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        {items.length === 0 ? (
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>{meta.emptyText}</Typography.Text>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</div>
                  {item.sub && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{item.sub}</div>
                  )}
                </div>
                <Space size={2} style={{ flexShrink: 0, marginLeft: 12 }}>
                  <Button type="text" size="small" icon={<EditOutlined />} onClick={() => {
                    if (type === 'advice') {
                      const a = advices.find((x) => x.id === item.id)
                      openEdit(type, item.id, item.label, a?.content ?? '')
                    } else if (type === 'followup') {
                      const f = followups.find((x) => x.id === item.id)
                      openEdit(type, item.id, item.label, f?.value ?? '')
                    } else {
                      openEdit(type, item.id, item.label, '')
                    }
                  }} />
                  <Button type="text" size="small" danger icon={<DeleteOutlined />} onClick={() => {
                    Modal.confirm({
                      title: `Delete "${item.label}"?`,
                      content: 'This action cannot be undone.',
                      okText: 'Delete',
                      okType: 'danger',
                      onOk: () => handleDelete(type, item.id),
                    })
                  }} />
                </Space>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Card
        title="Doctor Profile"
        extra={
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            Save
          </Button>
        }
        style={{ borderRadius: 12, marginBottom: 24 }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item label="Doctor Name" name="doctor_name" rules={[{ required: true, message: 'Please enter doctor name' }]}>
            <Input placeholder="e.g. Dr. John Doe" />
          </Form.Item>
          <Form.Item label="Qualification" name="qualification">
            <Input.TextArea rows={3} placeholder="e.g. MBBS&#10;MD (Endocrinology)&#10;DM (Endocrinology)" />
          </Form.Item>
          <Form.Item label="Specialization" name="specialization">
            <Input placeholder="e.g. Senior Endocrinologist & Diabetologist" />
          </Form.Item>
          <Form.Item label="Registration No." name="registration_no">
            <Input placeholder="e.g. BMDC/2026/A-12345" />
          </Form.Item>
          <Form.Item label="Clinic Name" name="clinic_name">
            <Input placeholder="e.g. OPD Endocrinology Clinic" />
          </Form.Item>
          <Form.Item label="Hospital Name" name="hospital_name" rules={[{ required: true, message: 'Please enter hospital name' }]}>
            <Input placeholder="e.g. RxDesk Hospital, OPD-1" />
          </Form.Item>
          <Form.Item label="Visiting Schedule" name="visiting_schedule">
            <Input placeholder="e.g. Sat-Thu: 9AM - 5PM" />
          </Form.Item>
          <Form.Item label="Appointment Contact" name="appointment_contact">
            <Input placeholder="e.g. +880-1XXX-XXXXXX" />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input.TextArea rows={3} placeholder="Clinic address" />
          </Form.Item>
          <Form.Item label="Phone" name="phone">
            <Input placeholder="e.g. +880-2-1234567" />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input type="email" placeholder="doctor@example.com" />
          </Form.Item>

          <Divider orientation="left" plain style={{ fontWeight: 600, color: '#006D77' }}>
            বাংলা — Bangla header (right column of the printed prescription)
          </Divider>
          <Form.Item label="ডাক্তারের নাম (Doctor name)" name="doctor_name_bn">
            <Input style={bnInput} placeholder="যেমন: ডাঃ মোঃ রহিম" />
          </Form.Item>
          <Form.Item label="ডিগ্রি (Qualification)" name="qualification_bn">
            <Input.TextArea style={bnInput} rows={2} placeholder="যেমন: এমবিবিএস, এমডি (এন্ডোক্রাইনোলজি)" />
          </Form.Item>
          <Form.Item label="পদবি / বিশেষজ্ঞতা (Specialization)" name="specialization_bn">
            <Input style={bnInput} placeholder="যেমন: হরমোন ও ডায়াবেটিস রোগ বিশেষজ্ঞ" />
          </Form.Item>
          <Form.Item label="রেজি নং (Registration no)" name="registration_no_bn">
            <Input style={bnInput} placeholder="যেমন: বিএমডিসি এ-১২৩৪৫" />
          </Form.Item>
          <Form.Item label="হাসপাতাল (Hospital)" name="hospital_name_bn">
            <Input style={bnInput} />
          </Form.Item>
          <Form.Item label="ক্লিনিক / চেম্বার (Clinic)" name="clinic_name_bn">
            <Input style={bnInput} />
          </Form.Item>
          <Form.Item label="ঠিকানা (Address)" name="address_bn">
            <Input.TextArea style={bnInput} rows={2} />
          </Form.Item>
          <Form.Item label="সাক্ষাতের সময় (Visiting schedule)" name="visiting_schedule_bn">
            <Input style={bnInput} placeholder="যেমন: শনি-বৃহস্পতি: সকাল ৯টা - বিকাল ৫টা" />
          </Form.Item>
          <Form.Item label="সিরিয়ালের জন্য (Appointment contact)" name="appointment_contact_bn">
            <Input style={bnInput} />
          </Form.Item>
        </Form>
      </Card>

      <Divider plain style={{ fontSize: 16, fontWeight: 600, color: '#006D77' }}>Clinical Section Templates</Divider>
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        One-click picks on the prescription form. End a template with “:” (e.g. <b>BP:</b>) and clicking it puts
        the cursor after it so you can type the value.
      </Typography.Paragraph>

      {CLINICAL_SECTIONS.map((section) => renderSection(section))}

      <Divider plain style={{ fontSize: 16, fontWeight: 600, color: '#006D77' }}>Quick Reference Templates</Divider>

      {renderSection('medicine')}
      {renderSection('test')}
      {renderSection('advice')}
      {renderSection('followup')}

      <Modal
        title={modalTitle}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        okText={editingId ? 'Update' : 'Add'}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          <div>
            <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label1}</Typography.Text>
            <Input value={field1} onChange={(e) => setField1(e.target.value)} placeholder={`Enter ${label1.toLowerCase()}`} onPressEnter={handleModalOk} />
          </div>
          {label2 && (
            <div>
              <Typography.Text style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 }}>{label2}</Typography.Text>
              {modalType === 'advice' ? (
                <Input.TextArea rows={3} value={field2} onChange={(e) => setField2(e.target.value)} placeholder={`Enter ${label2.toLowerCase()}`} />
              ) : (
                <Input value={field2} onChange={(e) => setField2(e.target.value)} placeholder={`Enter ${label2.toLowerCase()}`} onPressEnter={handleModalOk} />
              )}
            </div>
          )}
        </Space>
      </Modal>
    </div>
  )
}

export default SettingsPage
