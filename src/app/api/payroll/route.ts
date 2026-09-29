import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateRoles } from "@/lib/middleware";
import { ok, created, badRequest, notFound, serverError } from "@/lib/response";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const PayrollSchema = z.object({
  employeeId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  basicSalary: z.number().positive(),
  bonus: z.number().min(0).default(0),
  deduction: z.number().min(0).default(0),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, "SUPER_ADMIN", "MANAGER");
    if (auth instanceof Response) return auth;

    const payroll = await prisma.payroll.findMany({
      where: { employee: { restaurantId: auth.restaurantId } },
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return ok(payroll);
  } catch (error) {
    console.error("[GET /api/payroll]", error);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRoles(req, "SUPER_ADMIN", "MANAGER");
    if (auth instanceof Response) return auth;

    const body = await req.json();
    const parsed = PayrollSchema.safeParse(body);
    if (!parsed.success) {
      console.error(
        "[POST /api/payroll] validation failed:",
        JSON.stringify(body),
        parsed.error.format(),
      );
      return badRequest("Invalid payroll data");
    }

    const { employeeId, month, year, basicSalary, bonus, deduction } =
      parsed.data;

    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, restaurantId: auth.restaurantId },
      select: { id: true },
    });
    if (!employee) return notFound("Employee");

    const existing = await prisma.payroll.findFirst({
      where: { employeeId, month, year },
    });
    if (existing)
      return badRequest(
        "Payroll already exists for this employee for this month/year",
      );

    const payroll = await prisma.payroll.create({
      data: {
        employeeId,
        month,
        year,
        basicSalary,
        bonus,
        deduction,
        netSalary: basicSalary + bonus - deduction,
      },
      include: { employee: { select: { id: true, name: true, role: true } } },
    });
    logAudit({
      restaurantId: auth.restaurantId,
      userId: auth.userId,
      action: "PAYROLL_CREATED",
      entityType: "Payroll",
      entityId: payroll.id,
      details: {
        employeeId,
        employeeName: payroll.employee?.name,
        month,
        year,
        netSalary: payroll.netSalary,
      },
    });

    return created(payroll);
    return created(payroll);
  } catch (error) {
    console.error("[POST /api/payroll]", error);
    return serverError();
  }
}
