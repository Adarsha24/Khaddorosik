import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'


/* ===========================
   GET - List Payroll
=========================== */
export async function GET() {
  try {
    const payroll = await prisma.payroll.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        year: 'desc',
      },
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll.' },
      { status: 500 }
    )
  }
}

/* ===========================
   POST - Create Payroll
=========================== */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: body.employeeId,
        month: body.month,
        year: body.year,
        basicSalary: body.basicSalary,
        bonus: body.bonus ?? 0,
        deduction: body.deduction ?? 0,
        netSalary:
          body.basicSalary +
          (body.bonus ?? 0) -
          (body.deduction ?? 0),
      },
    })

    return NextResponse.json(payroll)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to create payroll.' },
      { status: 500 }
    )
  }
}