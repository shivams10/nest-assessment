import React from 'react'

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 700,
      fontSize: size * 0.36,
      flexShrink: 0,
    }}>{initials}</div>
  )
}
