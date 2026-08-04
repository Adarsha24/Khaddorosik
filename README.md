# Khaddorosik POS

Khaddorosik POS is a restaurant management application built with Next.js. It separates the main work areas into real routes so staff can move directly between dashboard, table management, billing, kitchen, inventory, reports, CRM, and employee screens.

## Main Routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Live business overview, revenue, active KOTs, occupied tables, payment breakdown, top items |
| `/tables` | Table selection, table status, active table sessions, start/open table orders |
| `/billing` | Menu selection, cart, KOT creation, bill/payment flow |
| `/kitchen` | Kitchen Order Ticket tracking and preparation status updates |
| `/reservations` | Guest/table reservation management |
| `/reports` | Sales, item-wise, tax, payment, and business reporting |
| `/inventory` | Stock and supplier workflows |
| `/employees` | Staff management |
| `/crm` | Customer records and loyalty/customer management |
| `/api-docs` | API documentation screen |

The home route `/` redirects to `/dashboard`.

## Standard Dine-In Execution Flow

This is the normal table-to-food-to-payment process.

### 1. Select or Book a Table

1. Go to `/tables`.
2. Select a table card, for example Table 1.
3. The detail panel opens on the right.
4. Check the table status:
   - `AVAILABLE`: table is free.
   - `OCCUPIED`: table has an active/open session or order.
   - `RESERVED`: table is reserved.
   - `CLEANING`: table is waiting to be cleaned after payment.
5. Click `New Order` to start a new order for the selected table.

The app redirects to billing with table context:

```txt
/billing?tableId=<table-id>&tableNo=<table-number>
```

Example:

```txt
/billing?tableId=abc-123&tableNo=1
```

Billing now displays the selected table, such as `Table 1`, instead of a hardcoded table label.

### 2. Take the Food Order in Billing

1. In `/billing`, confirm the table label at the top of the current order panel.
2. Search or filter menu items.
3. Add dishes to the cart.
4. Adjust item quantity with plus/minus controls.
5. Select order type:
   - `Dine In`
   - `Takeaway`
   - `Delivery`
6. For table service, keep the order type as `Dine In`.

The cart is still local until the order is sent to KOT.

### 3. Send KOT

Click the `KOT` button in Billing.

When `KOT` is clicked, the frontend calls:

```txt
POST /api/orders
```

For a dine-in table order, the request includes:

```ts
{
  tableId: "<selected-table-id>",
  orderType: "DINE_IN",
  items: [
    { menuItemId: "<menu-item-id>", quantity: 2 }
  ]
}
```

The backend then performs these actions in one order transaction:

1. Validates menu items and availability.
2. Calculates subtotal, tax, CGST, SGST, discount, and total.
3. Creates an `Order` with status `PENDING`.
4. Creates `OrderItem` rows.
5. Creates a `KOT` with status `PENDING`.
6. Creates `KOTItem` rows linked to order items.
7. Links the order to the selected table.
8. Marks the table as `OCCUPIED`.
9. Returns the created order to the billing screen.

After success:

```txt
KOT sent to kitchen
```

The billing screen stores the created `orderId`. That `orderId` is required for real payment processing.

Important: in the current implementation, **the order is placed when KOT is sent**, not when payment is completed.

```txt
KOT click = order placed
Payment complete = order paid/closed
```

### 4. Kitchen Execution

1. Go to `/kitchen`.
2. The kitchen screen loads active KOTs from:

```txt
GET /api/kot?status=PENDING,PREPARING,READY
```

3. Kitchen staff can update KOT status:
   - `PENDING`: order is waiting.
   - `PREPARING`: cooking has started.
   - `READY`: food is ready to serve.
   - `COMPLETED`: food has been served/completed.

KOT item status can also be updated item by item where supported by the UI/API.

Status updates use:

```txt
PATCH /api/kot/[id]
PATCH /api/kot/[id]/items/[itemId]
```

Kitchen status is operational; payment is still handled from Billing.

### 5. Proceed to Payment

After the food order is created and the bill is ready:

1. Return to `/billing`.
2. Confirm the cart/order.
3. Click `Proceed to Payment`.
4. Select payment method:
   - Cash
   - Card
   - UPI
   - Wallet
   - Split payment, where supported
5. Confirm payment.

Payment is processed through:

```txt
POST /api/payments
```

The payment request requires an existing `orderId`.

The backend payment flow:

1. Finds the order by `orderId`.
2. Rejects payment if the order is already `PAID`.
3. Rejects payment if the order is `CANCELLED`.
4. Validates split payment totals when method is `SPLIT`.
5. Creates a `Payment` record.
6. Marks the order as `PAID`.
7. If the order has a table:
   - marks the table as `CLEANING`
   - closes the open table session
8. If the order has a customer:
   - increments total visits
   - increments total spent
   - increments loyalty points

After payment:

```txt
Order status = PAID
Table status = CLEANING
Table session = CLOSED
```

### 6. Reset Table After Cleaning

After the table is cleaned:

1. Go to `/tables`.
2. Select the table.
3. Change status from `CLEANING` to `AVAILABLE`.

The table can now be used for the next guest.

## Takeaway and Delivery Flow

Takeaway and delivery orders also start from `/billing`.

1. Go to `/billing`.
2. Select order type:
   - `Takeaway`
   - `Delivery`
3. Add menu items.
4. Click `KOT`.
5. Kitchen receives the KOT.
6. Complete payment from Billing.

For takeaway/delivery, there may be no `tableId`.

## Reservation Flow

Reservations are handled from `/reservations`.

Typical reservation process:

1. Go to `/reservations`.
2. Create a reservation with guest details, date, time, party size, and optional table.
3. Confirm the reservation.
4. If a table is assigned and confirmed, the table may become `RESERVED`.
5. When the guest arrives, staff can move to table/order handling.

Reservation API endpoints:

```txt
GET /api/reservations
POST /api/reservations
PATCH /api/reservations/[id]
```

## Reports Flow

Reports are available at `/reports`.

The reports screen uses reporting APIs such as:

```txt
GET /api/reports/dashboard
GET /api/reports/sales
GET /api/reports/items
```

Reports include:

| Report Area | What It Shows |
| --- | --- |
| Dashboard summary | Today, weekly, monthly revenue and order counts |
| Sales report | Orders, revenue, order type breakdown, payment method breakdown |
| Item-wise report | Top-selling items and category breakdown |
| Tax summary | Taxable amount, CGST, SGST, total tax |
| Payment methods | Cash/card/UPI/wallet revenue split |
| Live operations | Active KOTs, occupied tables, low-stock items |

Payment reports only become accurate after payment is completed through `/api/payments`.

## Important Status Lifecycle

### Table Status

```txt
AVAILABLE -> OCCUPIED -> CLEANING -> AVAILABLE
```

Optional reservation path:

```txt
AVAILABLE -> RESERVED -> OCCUPIED -> CLEANING -> AVAILABLE
```

### Order Status

```txt
PENDING -> PAID
```

Other possible states handled by backend checks:

```txt
CANCELLED
```

### KOT Status

```txt
PENDING -> PREPARING -> READY -> COMPLETED
```

## Important Implementation Notes

1. The order is created when the user clicks `KOT`.
2. Payment requires the created order's `orderId`.
3. If payment is attempted before KOT/order creation, there is no real backend order to pay.
4. For dine-in orders, `/billing` receives table context through URL query params:

```txt
tableId
tableNo
```

5. The billing screen attaches `tableId` to the order only when order type is `Dine In`.
6. After payment, the backend marks the table as `CLEANING`, not `AVAILABLE`.
7. Staff should mark the table `AVAILABLE` after cleaning.

## Recommended Staff Workflow

Use this process for a normal restaurant table order:

```txt
1. /tables
2. Select table
3. New Order
4. /billing opens with selected table
5. Add food items
6. Click KOT
7. Kitchen prepares from /kitchen
8. Return to /billing
9. Proceed to Payment
10. Confirm payment
11. Table becomes CLEANING
12. After cleaning, mark table AVAILABLE
```

This workflow keeps table status, KOT, order, payment, and reports connected correctly.

## Developer API Flow Summary

### Create Order and KOT

```txt
POST /api/orders
```

Creates:

```txt
Order
OrderItem
KOT
KOTItem
```

Updates:

```txt
RestaurantTable.status = OCCUPIED
```

### Process Payment

```txt
POST /api/payments
```

Creates:

```txt
Payment
PaymentSplit, when split payment is used
```

Updates:

```txt
Order.status = PAID
RestaurantTable.status = CLEANING
TableSession.status = CLOSED
Customer loyalty/visit totals, when customer is linked
```

### Kitchen Updates

```txt
PATCH /api/kot/[id]
PATCH /api/kot/[id]/items/[itemId]
```

Updates:

```txt
KOT.status
KOTItem.done
```

## Current Known Behavior To Improve

The current payment button can open even if KOT has not been sent yet. In that case, there may be no `orderId` for a real backend payment. A recommended future improvement is:

```txt
Disable Proceed to Payment until KOT/order exists
```

or:

```txt
Auto-create the order before opening payment
```

For strict restaurant billing, the safer rule is:

```txt
No payment without an orderId
```
