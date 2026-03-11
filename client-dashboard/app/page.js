'use client'

import { useState, useEffect } from 'react'

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}><span style={{ color: '#10b981' }}>◆ PP</span>Ventures</h1>
        <p style={{ color: '#888', fontSize: '1.2rem' }}>Dashboard loading...</p>
      </div>
    </div>
  )
}
