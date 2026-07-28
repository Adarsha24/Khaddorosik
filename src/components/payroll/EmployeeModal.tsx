'use client'
import { getToken } from '@/lib/api'
import { useState } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EmployeeModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    role: 'WAITER',
    phone: '',
    email: '',
    salary: '',
  })

  if (!open) return null

  async function saveEmployee() {
    const token = getToken()

if (!token) {
  alert('Your session has expired. Please log in again.')
  return
}
    if (!form.name || !form.salary) {
      alert('Please fill all required fields.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          phone: form.phone,
          email: form.email || undefined,
          salary: Number(form.salary),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Unable to save employee')
        return
      }

      onSuccess()

      setForm({
        name: '',
        role: 'WAITER',
        phone: '',
        email: '',
        salary: '',
      })

      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: 500,
          background: '#111827',
          borderRadius: 14,
          padding: 24,
          border: '1px solid #333',
        }}
      >
        <h2>Add Employee</h2>

        <input
          placeholder="Employee Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={input}
        />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
          style={input}
        >
          <option value="MANAGER">Manager</option>
          <option value="HEAD_WAITER">Head Waiter</option>
          <option value="WAITER">Waiter</option>
          <option value="CASHIER">Cashier</option>
          <option value="CHEF">Chef</option>
          <option value="KITCHEN_STAFF">Kitchen Staff</option>
        </select>

        <input
          placeholder="Phone"
          value={form.phone}
          onChange={(e) =>
            setForm({ ...form, phone: e.target.value })
          }
          style={input}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          style={input}
        />

        <input
          type="number"
          placeholder="Monthly Salary"
          value={form.salary}
          onChange={(e) =>
            setForm({ ...form, salary: e.target.value })
          }
          style={input}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 20,
          }}
        >
          <button onClick={onClose}>
            Cancel
          </button>

          <button
            onClick={saveEmployee}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </div>
    </div>
  )
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginTop: 15,
  borderRadius: 8,
  border: '1px solid #444',
  background: '#1f2937',
  color: 'white',
}