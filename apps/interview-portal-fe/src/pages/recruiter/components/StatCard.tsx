import React from 'react'

export const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div style={{
    background: '#fff', borderRadius: 16, padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 0', minWidth: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: '#eef2ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value.toLocaleString()}</div>
    </div>
  </div>
)
