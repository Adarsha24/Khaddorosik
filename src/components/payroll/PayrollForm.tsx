'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
}

export default function PayrollForm({ onClose }: Props) {
  const [employee, setEmployee] = useState('')
  const [month, setMonth] = useState('')
  const [basicSalary, setBasicSalary] = useState(0)
  const [bonus, setBonus] = useState(0)
  const [deduction, setDeduction] = useState(0)
  const [notes, setNotes] = useState('')

  const netSalary = basicSalary + bonus - deduction

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    console.log({
      employee,
      month,
      basicSalary,
      bonus,
      deduction,
      netSalary,
      notes,
    })

    alert('Payroll generated successfully!')

    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--surface)',
    color: 'var(--text1)',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: 520,
          background: 'var(--bg)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 20,
            color: 'var(--text1)',
          }}
        >
          💰 Generate Payroll
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>Employee</label>

            <select
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              style={inputStyle}
              required
            >
              <option value="">Select Employee</option>
              <option>Rahul Sharma</option>
              <option>Anjali Roy</option>
              <option>Priya Das</option>
              <option>Kitchen Staff</option>
              <option>Cashier</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>Salary Month</label>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            <div>
              <label>Basic Salary</label>

              <input
                type="number"
                value={basicSalary}
                onChange={(e) =>
                  setBasicSalary(Number(e.target.value))
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label>Bonus</label>

              <input
                type="number"
                value={bonus}
                onChange={(e) =>
                  setBonus(Number(e.target.value))
                }
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Deduction</label>

            <input
              type="number"
              value={deduction}
              onChange={(e) =>
                setDeduction(Number(e.target.value))
              }
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label>Notes</label>

            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                ...inputStyle,
                resize: 'none',
              }}
            />
          </div>

          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: 'var(--text2)',
              }}
            >
              Net Salary
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: 'var(--gold)',
              }}
            >
              ₹ {netSalary.toLocaleString('en-IN')}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 24,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text1)',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '10px 22px',
                border: 'none',
                borderRadius: 8,
                background: 'var(--gold)',
                color: '#000',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Save Payroll
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}