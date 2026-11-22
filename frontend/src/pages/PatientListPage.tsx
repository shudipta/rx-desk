import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Typography,
  Table,
  Input,
  InputNumber,
  Alert,
  Button,
  Card,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  message,
  Tag,
  Space,
  Empty,
  Select,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  EditOutlined,
  TeamOutlined,
  CalendarOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { fetchPatients, searchPatients, fetchDashboardStats, updatePatient, createPatient } from '../api/patients'
import type { DashboardStats } from '../api/patients'
import type { Patient } from '../types/patient'

function PatientListPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<DashboardStats | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [editForm] = Form.useForm()
  const [saving, setSaving] = useState(false)

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()
  const [creating, setCreating] = useState(false)

  const loadPatients = async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = query.trim()
        ? await searchPatients(query.trim())
        : await fetchPatients()
      setPatients(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => loadPatients(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch(() => {})
  }, [])

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient)
    editForm.setFieldsValue(patient)
    setEditModalOpen(true)
  }

  const handleEditSave = async () => {
    if (!editingPatient) return
    setSaving(true)
    try {
      const values = await editForm.validateFields()
      await updatePatient(editingPatient.id, values)
      message.success('Patient updated')
      setEditModalOpen(false)
      loadPatients(searchQuery)
    } catch (err) {
      if (err instanceof Error) message.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = async () => {
    setCreating(true)
    try {
      const values = await createForm.validateFields()
      await createPatient(values)
      message.success('Patient added')
      setCreateModalOpen(false)
      createForm.resetFields()
      loadPatients(searchQuery)
      fetchDashboardStats().then(setStats).catch(() => {})
    } catch (err) {
      if (err instanceof Error && err.message) message.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const columns: ColumnsType<Patient> = [
    {
      title: 'Patient',
      key: 'name',
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #006D77, #83C5BE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {record.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{record.phone}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Age / Gender',
      key: 'age_gender',
      width: 140,
      render: (_, record) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{record.age} yrs</span>
          <Tag
            color={record.gender.toLowerCase().startsWith('m') ? '#006D77' : '#E29578'}
            style={{ borderRadius: 6, margin: 0 }}
          >
            {record.gender}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 160,
      render: (phone: string) => (
        <span style={{ color: '#6b7280' }}>{phone}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            openEditModal(record)
          }}
          style={{ color: '#9ca3af' }}
        />
      ),
    },
  ]

  return (
    <div>
      <Row gutter={[20, 20]} style={{ marginBottom: 28 }}>
        <Col xs={24} sm={12}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #006D77 0%, #004D55 100%)',
              boxShadow: '0 4px 20px rgba(0, 109, 119, 0.25)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: 0.5 }}>
                  <TeamOutlined style={{ marginRight: 6 }} /> TOTAL PATIENTS
                </span>
              }
              value={stats?.total_patients ?? '—'}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 800, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            style={{
              borderRadius: 16,
              background: 'linear-gradient(135deg, #E29578 0%, #c47a5e 100%)',
              boxShadow: '0 4px 20px rgba(226, 149, 120, 0.3)',
            }}
          >
            <Statistic
              title={
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, letterSpacing: 0.5 }}>
                  <CalendarOutlined style={{ marginRight: 6 }} /> TODAY'S CONSULTATIONS
                </span>
              }
              value={stats?.today_consultations ?? '—'}
              valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 800, textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        variant="outlined"
        style={{
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: 20 }}
        >
          <Col>
            <Typography.Title
              level={4}
              style={{ margin: 0, fontWeight: 700, color: '#1a1a2e' }}
            >
              <TeamOutlined style={{ marginRight: 8, color: '#006D77' }} />
              Patient Directory
            </Typography.Title>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                allowClear
                style={{ width: 260, borderRadius: 10 }}
                size="large"
              />
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setCreateModalOpen(true)}
                size="large"
                style={{ borderRadius: 10 }}
              >
                Add Patient
              </Button>
            </Space>
          </Col>
        </Row>

        {error && (
          <Alert
            message="Error loading patients"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16, borderRadius: 10 }}
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => loadPatients(searchQuery)}
              >
                Retry
              </Button>
            }
          />
        )}

        <Table
          columns={columns}
          dataSource={patients}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => navigate(`/patients/${record.id}`),
            style: {
              cursor: 'pointer',
              transition: 'background 0.15s',
            },
          })}
          pagination={
            patients.length > 10
              ? { pageSize: 10, showSizeChanger: false }
              : false
          }
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  searchQuery
                    ? 'No patients match your search'
                    : 'No patients yet'
                }
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={
          <span style={{ fontWeight: 700 }}>
            <EditOutlined style={{ marginRight: 8, color: '#006D77' }} />
            Edit Patient
          </span>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSave}
        confirmLoading={saving}
        okText="Save Changes"
        cancelText="Cancel"
        okButtonProps={{
          style: { borderRadius: 10 },
        }}
      >
        <Form
          form={editForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Name</span>}
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input size="large" placeholder="Patient's full name" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="age"
                label={<span style={{ fontWeight: 600 }}>Age</span>}
                rules={[{ required: true, message: 'Age is required' }]}
              >
                <InputNumber size="large" placeholder="Age" style={{ width: '100%' }} min={0} max={150} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Gender</span>}
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select size="large" placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="phone"
            label={<span style={{ fontWeight: 600 }}>Phone</span>}
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input size="large" placeholder="Phone number" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span style={{ fontWeight: 700 }}>
            <UserAddOutlined style={{ marginRight: 8, color: '#006D77' }} />
            Add New Patient
          </span>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          createForm.resetFields()
        }}
        onOk={handleCreate}
        confirmLoading={creating}
        okText="Add Patient"
        cancelText="Cancel"
        okButtonProps={{
          style: { borderRadius: 10 },
        }}
      >
        <Form
          form={createForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Name</span>}
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input size="large" placeholder="Patient's full name" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="age"
                label={<span style={{ fontWeight: 600 }}>Age</span>}
                rules={[{ required: true, message: 'Age is required' }]}
              >
                <InputNumber size="large" placeholder="Age" style={{ width: '100%' }} min={0} max={150} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<span style={{ fontWeight: 600 }}>Gender</span>}
                rules={[{ required: true, message: 'Gender is required' }]}
              >
                <Select size="large" placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="phone"
            label={<span style={{ fontWeight: 600 }}>Phone</span>}
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input size="large" placeholder="Phone number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PatientListPage
