import type { ThemeConfig } from 'antd'

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#006D77',
    colorLink: '#006D77',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#006D77',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    borderRadius: 8,
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorText: '#1a1a2e',
    colorTextSecondary: '#6b7280',
    colorBorder: '#e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  },
  components: {
    Menu: {
      colorItemBg: 'transparent',
      colorItemBgSelected: 'rgba(255, 255, 255, 0.12)',
      colorItemBgHover: 'rgba(255, 255, 255, 0.08)',
      colorItemText: 'rgba(255, 255, 255, 0.75)',
      colorItemTextSelected: '#ffffff',
      colorItemTextHover: '#ffffff',
      fontWeightStrong: 600,
      itemBorderRadius: 10,
      itemMarginInline: 12,
      itemHeight: 44,
    },
    Card: {
      paddingLG: 20,
    },
  },
}

export default theme
