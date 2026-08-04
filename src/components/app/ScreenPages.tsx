'use client'

import { useRouter } from 'next/navigation'
import BillingScreen from '@/components/billing/BillingScreen'
import CRMScreen from '@/components/crm/CRMScreen'
import DashboardScreen from '@/components/dashboard/DashboardScreen'
import EmployeesScreen from '@/components/employee/EmployeeScreen'
import InventoryScreen from '@/components/inventory/InventoryScreen'
import KitchenScreen from '@/components/kitchen/KitchenScreen'
import ReportsScreen from '@/components/reports/ReportsScreen'
import ReservationScreen from '@/components/reservation/ReservationScreen'
import TablesScreen from '@/components/tables/TablesScreen'
import type { ScreenId } from '@/types'
import { usePayment } from './PaymentProvider'
import { useToast } from './ToastProvider'

const ROUTES: Record<ScreenId, string> = {
  dashboard: '/dashboard',
  billing: '/billing',
  tables: '/tables',
  kitchen: '/kitchen',
  reservation: '/reservations',
  reports: '/reports',
  inventory: '/inventory',
  employees: '/employees',
  crm: '/crm',
}

function useRouteNavigation() {
  const router = useRouter()
  return (id: string) => {
    if (id.startsWith('/')) {
      router.push(id)
      return
    }
    router.push(ROUTES[id as ScreenId] ?? '/dashboard')
  }
}

export function DashboardPage() {
  const toast = useToast()
  return <DashboardScreen toast={toast} />
}

export function BillingPage() {
  const toast = useToast()
  const navigate = useRouteNavigation()
  const { openPayment } = usePayment()
  return <BillingScreen toast={toast} onPayment={openPayment} onNavigate={navigate} />
}

export function TablesPage() {
  const toast = useToast()
  const navigate = useRouteNavigation()
  return <TablesScreen toast={toast} onNavigate={navigate} />
}

export function KitchenPage() {
  const toast = useToast()
  return <KitchenScreen toast={toast} />
}

export function ReservationsPage() {
  const toast = useToast()
  return <ReservationScreen toast={toast} />
}

export function ReportsPage() {
  return <ReportsScreen />
}

export function InventoryPage() {
  const toast = useToast()
  return <InventoryScreen toast={toast} />
}

export function EmployeesPage() {
  const toast = useToast()
  return <EmployeesScreen toast={toast} />
}

export function CRMPage() {
  const toast = useToast()
  return <CRMScreen toast={toast} />
}
