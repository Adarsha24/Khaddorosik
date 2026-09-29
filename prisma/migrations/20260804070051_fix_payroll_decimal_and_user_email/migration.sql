/*
  Warnings:

  - A unique constraint covering the columns `[restaurant_id,name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurant_id,phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurant_id,number]` on the table `restaurant_tables` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[restaurant_id,email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurant_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `inventory_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `restaurant_tables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurant_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('FLAT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('PENDING', 'PAID');

-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "customers_email_key";

-- DropIndex
DROP INDEX "customers_phone_key";

-- DropIndex
DROP INDEX "employees_email_key";

-- DropIndex
DROP INDEX "restaurant_tables_number_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "joining_date" TIMESTAMP(3),
ADD COLUMN     "restaurant_id" TEXT NOT NULL,
ADD COLUMN     "salary" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "restaurant_id" TEXT NOT NULL,
ADD COLUMN     "supplier_id" TEXT;

-- AlterTable
ALTER TABLE "menu_items" ADD COLUMN     "cost_price" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "bill_no" INTEGER,
ADD COLUMN     "cgst_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "discount_code" TEXT,
ADD COLUMN     "restaurant_id" TEXT NOT NULL,
ADD COLUMN     "sgst_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "reservations" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "restaurant_tables" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "restaurant_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "pincode" TEXT,
    "logo" TEXT,
    "gst_number" TEXT,
    "fssai_number" TEXT,
    "tax_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.05,
    "cgst_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.025,
    "sgst_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.025,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL DEFAULT 'FLAT',
    "value" DECIMAL(10,2) NOT NULL,
    "min_order" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "opened_by_id" TEXT,
    "closed_by_id" TEXT,
    "opening_cash" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "closing_cash" DECIMAL(10,2),
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "basicSalary" DECIMAL(10,2) NOT NULL,
    "bonus" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deduction" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(10,2) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_email_key" ON "restaurants"("email");

-- CreateIndex
CREATE INDEX "otp_codes_email_idx" ON "otp_codes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "discounts_restaurant_id_code_key" ON "discounts"("restaurant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "categories_restaurant_id_name_key" ON "categories"("restaurant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_restaurant_id_phone_key" ON "customers"("restaurant_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_tables_restaurant_id_number_key" ON "restaurant_tables"("restaurant_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "users_restaurant_id_email_key" ON "users"("restaurant_id", "email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
