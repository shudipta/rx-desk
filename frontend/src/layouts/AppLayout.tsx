import { useState, useEffect, type ReactNode } from 'react'
import { Layout, Menu, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { TeamOutlined, MedicineBoxOutlined, SettingOutlined } from '@ant-design/icons'
import { getDoctorProfile } from '../api/doctor'
import type { DoctorProfile } from '../types/doctor'

const { Sider, Content } = Layout

const menuItems = [
  {
    key: '/',
    icon: <TeamOutlined />,
    label: 'Patients',
  },
  {
    key: '/settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
]

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)

  useEffect(() => {
    getDoctorProfile()
      .then(setDoctorProfile)
      .catch(() => {})
  }, [])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        style={{
          background: 'linear-gradient(180deg, #002b36 0%, #004d55 100%)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <MedicineBoxOutlined style={{ color: '#83c5be', fontSize: 24 }} />
          <span
            style={{
              color: '#fff',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-0.5px',
            }}
          >
            RxDesk
          </span>
        </div>
        <div style={{ padding: '16px 0' }}>
          <Typography.Text
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              paddingLeft: 24,
            }}
          >
            Main Menu
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            padding: '0 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              padding: '12px 16px',
            }}
          >
            <Typography.Text
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 11,
                display: 'block',
              }}
            >
              {doctorProfile?.specialization || 'Endocrinology Practice'}
            </Typography.Text>
            <Typography.Text
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 10,
                display: 'block',
                marginTop: 2,
              }}
            >
              v1.0.0
            </Typography.Text>
          </div>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 220, background: '#f0f2f5' }}>
        <div
          style={{
            height: 64,
            background: '#fff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <Typography.Text
            style={{
              color: '#9CA3AF',
              fontSize: 13,
            }}
          >
            {doctorProfile?.doctor_name ? `Welcome back, ${doctorProfile.doctor_name}` : 'Welcome back, Doctor'}
          </Typography.Text>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #006D77, #83C5BE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {doctorProfile?.doctor_name
              ? doctorProfile.doctor_name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              : 'DR'}
          </div>
        </div>
        <Content style={{ padding: 28, minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout
