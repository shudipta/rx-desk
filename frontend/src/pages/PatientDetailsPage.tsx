import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Table,
  Button,
  Spin,
  Result,
  Space,
  Tag,
  Row,
  Col,
  Empty,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons'
import { fetchPatient } from '../api/patients'
import { fetchPatientPrescriptions } from '../api/prescriptions'
import type { Patient } from '../types/patient'
import type { PatientPrescription } from '../types/prescription'

function PatientDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    Promise.all([
      fetchPatient(Number(id)),
      fetchPatientPrescriptions(Number(id)),
    ])
      .then(([patientData, prescriptionsData]) => {
        setPatient(patientData)
        setPrescriptions(prescriptionsData)
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : 'Failed to load patient details',
        )
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 100 }}>
        <Spin size="large" />
        <Typography.Text
          style={{ display: 'block', marginTop: 16, color: '#9ca3af' }}
        >
          Loading patient details...
        </Typography.Text>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <Result
        status="error"
        title="Failed to load patient details"
        subTitle={error}
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/')}
            style={{ borderRadius: 10 }}
          >
            Back to Patient List
          </Button>
        }
      />
    )
  }

  const columns: ColumnsType<PatientPrescription> = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#9ca3af' }} />
          <span style={{ fontWeight: 500 }}>
            {new Date(date).toLocaleDateString()}
          </span>
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{title}</span>
      ),
    },
    {
      title: 'Visit Type',
      dataIndex: 'visit_type',
      key: 'visit_type',
      width: 140,
      render: (type: string) => (
        <Tag
          color={
            type === 'Emergency'
              ? 'red'
              : type === 'Follow-up'
                ? 'blue'
                : type === 'Review'
                  ? 'purple'
                  : 'cyan'
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: 'Follow-up',
      dataIndex: 'followup',
      key: 'followup',
      width: 120,
      render: (fu: string) => fu || <span style={{ color: '#d9d9d9' }}>—</span>,
    },
  ]

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')}
        style={{
          marginBottom: 20,
          color: '#6b7280',
          fontWeight: 500,
          padding: '4px 8px',
        }}
      >
        Back to Patients
      </Button>

      <Card
        style={{
          borderRadius: 16,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <Row gutter={24} align="middle">
          <Col>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #006D77, #83C5BE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {patient.name.charAt(0).toUpperCase()}
            </div>
          </Col>
          <Col flex="auto">
            <Typography.Title
              level={3}
              style={{ margin: 0, fontWeight: 700 }}
            >
              {patient.name}
            </Typography.Title>
            <Space style={{ marginTop: 4 }}>
              <Tag icon={<UserOutlined />} color="#006D77">
                {patient.gender}, {patient.age} yrs
              </Tag>
              <Tag icon={<PhoneOutlined />} color="#6b7280">
                {patient.phone}
              </Tag>
              <Tag icon={<MedicineBoxOutlined />} color="#E29578">
                {prescriptions.length} prescription
                {prescriptions.length !== 1 ? 's' : ''}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/patients/${id}/new-prescription`)}
              style={{
                borderRadius: 12,
                height: 44,
                fontWeight: 600,
              }}
            >
              New Prescription
            </Button>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <span style={{ fontWeight: 700 }}>
            <MedicineBoxOutlined
              style={{ marginRight: 8, color: '#006D77' }}
            />
            Prescription History
          </span>
        }
        style={{ borderRadius: 16 }}
      >
        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="id"
          pagination={false}
          onRow={(record) => ({
            onClick: () => navigate(`/prescriptions/${record.id}`),
            style: {
              cursor: 'pointer',
              transition: 'background 0.15s',
            },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <span>No prescriptions yet</span>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        navigate(`/patients/${id}/new-prescription`)
                      }
                    >
                      Create First Prescription
                    </Button>
                  </Space>
                }
              />
            ),
          }}
        />
      </Card>
    </div>
  )
}

export default PatientDetailsPage
