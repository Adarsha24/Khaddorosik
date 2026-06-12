const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Khaddorosik POS API',
    version: '1.0.0',
    description:
      'Restaurant Point of Sale System — full REST API covering auth, menu, tables, orders, KOT, payments, reservations, inventory, employees, customers, and reports.',
  },
  servers: [{ url: '/api', description: 'Local dev server' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token obtained from POST /auth/login',
      },
    },
    schemas: {
      // ─── Generic ──────────────────────────────────────────────────────────
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Something went wrong' },
        },
      },
      PaginatedMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      // ─── Auth ─────────────────────────────────────────────────────────────
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@khaddo.com' },
          password: { type: 'string', minLength: 6, example: 'secret123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'] },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      // ─── Category ─────────────────────────────────────────────────────────
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          displayOrder: { type: 'integer', default: 0 },
          active: { type: 'boolean', default: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 100, example: 'Starters' },
          displayOrder: { type: 'integer', default: 0 },
          active: { type: 'boolean', default: true },
        },
      },
      // ─── Menu Item ────────────────────────────────────────────────────────
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          price: { type: 'number' },
          veg: { type: 'boolean' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
          available: { type: 'boolean' },
          bestSeller: { type: 'boolean' },
          category: { $ref: '#/components/schemas/Category' },
        },
      },
      MenuItemRequest: {
        type: 'object',
        required: ['categoryId', 'name', 'price'],
        properties: {
          categoryId: { type: 'string', format: 'uuid' },
          name: { type: 'string', maxLength: 200, example: 'Paneer Tikka' },
          price: { type: 'number', example: 280 },
          veg: { type: 'boolean', default: false },
          description: { type: 'string' },
          imageUrl: { type: 'string', format: 'uri' },
          available: { type: 'boolean', default: true },
          bestSeller: { type: 'boolean', default: false },
        },
      },
      AvailabilityRequest: {
        type: 'object',
        required: ['available'],
        properties: { available: { type: 'boolean' } },
      },
      // ─── Table ────────────────────────────────────────────────────────────
      Table: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          number: { type: 'integer' },
          capacity: { type: 'integer' },
          section: { type: 'string' },
          status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'] },
        },
      },
      TableRequest: {
        type: 'object',
        required: ['number', 'capacity'],
        properties: {
          number: { type: 'integer', example: 5 },
          capacity: { type: 'integer', example: 4 },
          section: { type: 'string', example: 'Ground Floor' },
        },
      },
      TableStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'] },
          waiterId: { type: 'string', format: 'uuid' },
        },
      },
      // ─── Order ────────────────────────────────────────────────────────────
      OrderItemInput: {
        type: 'object',
        required: ['menuItemId', 'quantity'],
        properties: {
          menuItemId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer', minimum: 1 },
          notes: { type: 'string' },
        },
      },
      CreateOrderRequest: {
        type: 'object',
        required: ['items'],
        properties: {
          tableId: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          orderType: { type: 'string', enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'], default: 'DINE_IN' },
          notes: { type: 'string' },
          items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/OrderItemInput' } },
        },
      },
      OrderStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED'],
          },
        },
      },
      UpdateOrderItemRequest: {
        type: 'object',
        required: ['quantity'],
        properties: {
          quantity: { type: 'integer', minimum: 1 },
          notes: { type: 'string' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tableId: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          orderType: { type: 'string', enum: ['DINE_IN', 'TAKEAWAY', 'DELIVERY'] },
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED'] },
          subtotal: { type: 'number' },
          taxAmount: { type: 'number' },
          total: { type: 'number' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Payment ──────────────────────────────────────────────────────────
      PaymentSplit: {
        type: 'object',
        required: ['method', 'amount'],
        properties: {
          method: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'WALLET'] },
          amount: { type: 'number', minimum: 0.01 },
        },
      },
      PaymentRequest: {
        type: 'object',
        required: ['orderId', 'method'],
        properties: {
          orderId: { type: 'string', format: 'uuid' },
          method: { type: 'string', enum: ['CASH', 'CARD', 'UPI', 'WALLET', 'SPLIT'] },
          splits: { type: 'array', items: { $ref: '#/components/schemas/PaymentSplit' } },
          reference: { type: 'string', example: 'UPI-REF-12345' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          amount: { type: 'number' },
          method: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] },
          reference: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ─── KOT ──────────────────────────────────────────────────────────────
      KOTStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PENDING', 'PREPARING', 'READY', 'CANCELLED'] },
        },
      },
      KOTItemStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PENDING', 'PREPARING', 'READY', 'CANCELLED'] },
        },
      },
      // ─── Reservation ──────────────────────────────────────────────────────
      ReservationRequest: {
        type: 'object',
        required: ['guestName', 'date', 'time', 'partySize'],
        properties: {
          guestName: { type: 'string', example: 'Adrsha Das' },
          guestPhone: { type: 'string', example: '9876543210' },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '2025-08-15' },
          time: { type: 'string', pattern: '^\\d{2}:\\d{2}$', example: '19:30' },
          partySize: { type: 'integer', minimum: 1, example: 4 },
          tableId: { type: 'string', format: 'uuid' },
          customerId: { type: 'string', format: 'uuid' },
          notes: { type: 'string' },
        },
      },
      ReservationStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] },
        },
      },
      // ─── Inventory ────────────────────────────────────────────────────────
      InventoryItemRequest: {
        type: 'object',
        required: ['name', 'category', 'unit', 'currentStock', 'reorderLevel'],
        properties: {
          name: { type: 'string', example: 'Tomatoes' },
          category: { type: 'string', example: 'Vegetables' },
          unit: { type: 'string', example: 'kg' },
          currentStock: { type: 'number', minimum: 0, example: 10 },
          reorderLevel: { type: 'number', minimum: 0, example: 2 },
        },
      },
      InventoryAdjustRequest: {
        type: 'object',
        required: ['quantity', 'type'],
        properties: {
          quantity: { type: 'number', example: 5 },
          type: { type: 'string', enum: ['IN', 'OUT', 'ADJUSTMENT', 'WASTE'] },
          notes: { type: 'string', example: 'Weekly restock' },
        },
      },
      // ─── Employee ─────────────────────────────────────────────────────────
      EmployeeRequest: {
        type: 'object',
        required: ['name', 'role'],
        properties: {
          name: { type: 'string', example: 'Priya Nair' },
          role: { type: 'string', enum: ['MANAGER', 'HEAD_WAITER', 'WAITER', 'CASHIER', 'KITCHEN_STAFF', 'CHEF'] },
          phone: { type: 'string', example: '9876543210' },
          email: { type: 'string', format: 'email', example: 'priya@khaddo.com' },
          password: { type: 'string', minLength: 6 },
          userRole: { type: 'string', enum: ['SUPER_ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'KITCHEN'] },
        },
      },
      // ─── Customer ─────────────────────────────────────────────────────────
      CustomerRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Anita Desai' },
          phone: { type: 'string', example: '9123456789' },
          email: { type: 'string', format: 'email', example: 'anita@example.com' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth', description: 'Login, logout, token refresh, and current user' },
    { name: 'Menu — Categories', description: 'Manage menu categories' },
    { name: 'Menu — Items', description: 'Manage individual menu items' },
    { name: 'Tables', description: 'Restaurant table management' },
    { name: 'Orders', description: 'Create and manage dine-in / takeaway / delivery orders' },
    { name: 'KOT', description: 'Kitchen Order Tickets' },
    { name: 'Payments', description: 'Process payments (cash, card, UPI, split)' },
    { name: 'Reservations', description: 'Table reservation management' },
    { name: 'Inventory', description: 'Stock and inventory tracking' },
    { name: 'Employees', description: 'Staff management' },
    { name: 'Customers', description: 'Customer / CRM management' },
    { name: 'Reports', description: 'Sales and item performance reports' },
  ],
  paths: {
    // ═══════════════════════════════════════════════════════════════════════
    // AUTH
    // ═══════════════════════════════════════════════════════════════════════
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: { description: 'Tokens + user info', content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } } },
          400: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (invalidate refresh token)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } },
        },
        responses: {
          200: { description: 'Logged out successfully' },
          400: { description: 'Invalid token' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        responses: {
          200: { description: 'Authenticated user profile' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshRequest' } } },
        },
        responses: {
          200: { description: 'New access token' },
          401: { description: 'Invalid or expired refresh token' },
        },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // MENU — CATEGORIES
    // ═══════════════════════════════════════════════════════════════════════
    '/menu/categories': {
      get: {
        tags: ['Menu — Categories'],
        summary: 'List all categories',
        responses: { 200: { description: 'Array of categories' } },
      },
      post: {
        tags: ['Menu — Categories'],
        summary: 'Create a category',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CategoryRequest' } } },
        },
        responses: {
          201: { description: 'Created category', content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } },
          400: { description: 'Validation error' },
        },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // MENU — ITEMS
    // ═══════════════════════════════════════════════════════════════════════
    '/menu/items': {
      get: {
        tags: ['Menu — Items'],
        summary: 'List menu items (paginated)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by category ID' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Name search (case-insensitive)' },
          { name: 'veg', in: 'query', schema: { type: 'boolean' }, description: 'Filter vegetarian items' },
          { name: 'available', in: 'query', schema: { type: 'boolean' }, description: 'Filter by availability' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
        ],
        responses: { 200: { description: 'Paginated list of menu items' } },
      },
      post: {
        tags: ['Menu — Items'],
        summary: 'Create a menu item',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuItemRequest' } } },
        },
        responses: {
          201: { description: 'Created menu item', content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuItem' } } } },
          400: { description: 'Validation error' },
        },
      },
    },
    '/menu/items/{id}': {
      get: {
        tags: ['Menu — Items'],
        summary: 'Get a menu item by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Menu item', content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuItem' } } } },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Menu — Items'],
        summary: 'Update a menu item',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/MenuItemRequest' } } },
        },
        responses: { 200: { description: 'Updated menu item' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Menu — Items'],
        summary: 'Delete a menu item',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/menu/items/{id}/availability': {
      patch: {
        tags: ['Menu — Items'],
        summary: 'Toggle item availability',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AvailabilityRequest' } } },
        },
        responses: { 200: { description: 'Availability updated' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // TABLES
    // ═══════════════════════════════════════════════════════════════════════
    '/tables': {
      get: {
        tags: ['Tables'],
        summary: 'List all tables',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING'] } },
          { name: 'section', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Array of tables with active session info' } },
      },
      post: {
        tags: ['Tables'],
        summary: 'Create a table',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TableRequest' } } },
        },
        responses: {
          201: { description: 'Created table', content: { 'application/json': { schema: { $ref: '#/components/schemas/Table' } } } },
          409: { description: 'Table number already exists' },
        },
      },
    },
    '/tables/{id}': {
      get: {
        tags: ['Tables'],
        summary: 'Get a table by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Table detail' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Tables'],
        summary: 'Update table details',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TableRequest' } } },
        },
        responses: { 200: { description: 'Updated table' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Tables'],
        summary: 'Delete a table',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/tables/{id}/status': {
      patch: {
        tags: ['Tables'],
        summary: 'Update table status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/TableStatusRequest' } } },
        },
        responses: { 200: { description: 'Status updated' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // ORDERS
    // ═══════════════════════════════════════════════════════════════════════
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders (paginated)',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED'] } },
          { name: 'tableId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filter from date' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Filter to date' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
        ],
        responses: { 200: { description: 'Paginated orders with items and payments' } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create an order (auto-generates KOT)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderRequest' } } },
        },
        responses: {
          201: { description: 'Created order with kotId' },
          400: { description: 'Validation error or unavailable item' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get an order by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Order detail' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Orders'],
        summary: 'Update order status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderStatusRequest' } } },
        },
        responses: { 200: { description: 'Updated order' }, 404: { description: 'Not found' } },
      },
    },
    '/orders/{id}/items': {
      post: {
        tags: ['Orders'],
        summary: 'Add items to an existing order',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: { items: { type: 'array', minItems: 1, items: { $ref: '#/components/schemas/OrderItemInput' } } },
              },
            },
          },
        },
        responses: { 201: { description: 'Items added, new KOT created' }, 400: { description: 'Unavailable item' } },
      },
    },
    '/orders/{id}/items/{itemId}': {
      put: {
        tags: ['Orders'],
        summary: 'Update an order item (quantity / notes)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOrderItemRequest' } } },
        },
        responses: { 200: { description: 'Updated item' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Remove an item from an order',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'Item removed' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // KOT
    // ═══════════════════════════════════════════════════════════════════════
    '/kot': {
      get: {
        tags: ['KOT'],
        summary: 'List KOTs (default: PENDING,PREPARING)',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', example: 'PENDING,PREPARING' },
            description: 'Comma-separated statuses',
          },
        ],
        responses: { 200: { description: 'KOTs with items and menu info' } },
      },
    },
    '/kot/{id}': {
      get: {
        tags: ['KOT'],
        summary: 'Get a KOT by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'KOT detail' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['KOT'],
        summary: 'Update KOT status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/KOTStatusRequest' } } },
        },
        responses: { 200: { description: 'Updated KOT' }, 404: { description: 'Not found' } },
      },
    },
    '/kot/{id}/items/{itemId}': {
      put: {
        tags: ['KOT'],
        summary: 'Update a KOT item status',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'itemId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/KOTItemStatusRequest' } } },
        },
        responses: { 200: { description: 'KOT item updated' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // PAYMENTS
    // ═══════════════════════════════════════════════════════════════════════
    '/payments': {
      get: {
        tags: ['Payments'],
        summary: 'List payments',
        parameters: [{ name: 'orderId', in: 'query', schema: { type: 'string', format: 'uuid' }, description: 'Filter by order' }],
        responses: { 200: { description: 'Payments with splits' } },
      },
      post: {
        tags: ['Payments'],
        summary: 'Process a payment',
        description: 'Marks order as PAID, frees the table, and updates customer loyalty points.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentRequest' } } },
        },
        responses: {
          201: { description: 'Payment processed', content: { 'application/json': { schema: { $ref: '#/components/schemas/Payment' } } } },
          400: { description: 'Order already paid / invalid split amounts' },
          404: { description: 'Order not found' },
        },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // RESERVATIONS
    // ═══════════════════════════════════════════════════════════════════════
    '/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'List reservations',
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] } },
        ],
        responses: { 200: { description: 'Array of reservations' } },
      },
      post: {
        tags: ['Reservations'],
        summary: 'Create a reservation',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReservationRequest' } } },
        },
        responses: { 201: { description: 'Created reservation' }, 400: { description: 'Validation error' } },
      },
    },
    '/reservations/{id}': {
      get: {
        tags: ['Reservations'],
        summary: 'Get a reservation',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Reservation detail' }, 404: { description: 'Not found' } },
      },
      patch: {
        tags: ['Reservations'],
        summary: 'Update reservation status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ReservationStatusRequest' } } },
        },
        responses: { 200: { description: 'Updated reservation' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // INVENTORY
    // ═══════════════════════════════════════════════════════════════════════
    '/inventory': {
      get: {
        tags: ['Inventory'],
        summary: 'List inventory items (paginated)',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'lowStock', in: 'query', schema: { type: 'boolean' }, description: 'Show only items below reorder level' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Paginated inventory items with isLowStock flag' } },
      },
      post: {
        tags: ['Inventory'],
        summary: 'Create an inventory item',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InventoryItemRequest' } } },
        },
        responses: { 201: { description: 'Created inventory item' }, 400: { description: 'Validation error' } },
      },
    },
    '/inventory/{id}': {
      get: {
        tags: ['Inventory'],
        summary: 'Get an inventory item',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Inventory item detail' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Inventory'],
        summary: 'Update an inventory item',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InventoryItemRequest' } } },
        },
        responses: { 200: { description: 'Updated item' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Inventory'],
        summary: 'Delete an inventory item',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/inventory/{id}/adjust': {
      post: {
        tags: ['Inventory'],
        summary: 'Adjust stock level (IN / OUT / WASTE / ADJUSTMENT)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/InventoryAdjustRequest' } } },
        },
        responses: { 200: { description: 'Stock adjusted, log entry created' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // EMPLOYEES
    // ═══════════════════════════════════════════════════════════════════════
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List employees',
        parameters: [{ name: 'active', in: 'query', schema: { type: 'boolean' }, description: 'Filter by active status' }],
        responses: { 200: { description: 'Employees with linked user account info' } },
      },
      post: {
        tags: ['Employees'],
        summary: 'Create an employee (optionally creates login account)',
        description: 'Requires SUPER_ADMIN or MANAGER role. Supply `email` + `password` + `userRole` to also create a login account.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeRequest' } } },
        },
        responses: { 201: { description: 'Created employee' }, 409: { description: 'Email already in use' } },
      },
    },
    '/employees/{id}': {
      get: {
        tags: ['Employees'],
        summary: 'Get an employee by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Employee detail' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Employees'],
        summary: 'Update employee details',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeRequest' } } },
        },
        responses: { 200: { description: 'Updated employee' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Employees'],
        summary: 'Deactivate / delete employee',
        description: 'Requires SUPER_ADMIN or MANAGER role.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // CUSTOMERS
    // ═══════════════════════════════════════════════════════════════════════
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'List customers',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Customers with loyalty stats' } },
      },
      post: {
        tags: ['Customers'],
        summary: 'Create a customer',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerRequest' } } },
        },
        responses: { 201: { description: 'Created customer' }, 409: { description: 'Phone/email already in use' } },
      },
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Get a customer by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Customer detail with order history' }, 404: { description: 'Not found' } },
      },
      put: {
        tags: ['Customers'],
        summary: 'Update customer info',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerRequest' } } },
        },
        responses: { 200: { description: 'Updated customer' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Customers'],
        summary: 'Delete a customer',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Deleted' }, 404: { description: 'Not found' } },
      },
    },
    // ═══════════════════════════════════════════════════════════════════════
    // REPORTS
    // ═══════════════════════════════════════════════════════════════════════
    '/reports/sales': {
      get: {
        tags: ['Reports'],
        summary: 'Sales report',
        description: 'Requires SUPER_ADMIN, MANAGER, or CASHIER role.',
        parameters: [
          {
            name: 'period',
            in: 'query',
            schema: { type: 'string', enum: ['today', 'week', 'month', 'custom'], default: 'today' },
          },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Required when period=custom' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Required when period=custom' },
        ],
        responses: {
          200: {
            description: 'Summary, by-payment-method, by-order-type, and hourly distribution',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    period: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' } } },
                    summary: {
                      type: 'object',
                      properties: {
                        totalOrders: { type: 'integer' },
                        revenue: { type: 'number' },
                        tax: { type: 'number' },
                        discount: { type: 'number' },
                        avgOrderValue: { type: 'number' },
                      },
                    },
                    byPaymentMethod: { type: 'object', additionalProperties: { type: 'number' } },
                    byOrderType: { type: 'object', additionalProperties: { type: 'object' } },
                    hourlyDistribution: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/reports/items': {
      get: {
        tags: ['Reports'],
        summary: 'Top selling items report',
        description: 'Requires SUPER_ADMIN, MANAGER, or CASHIER role.',
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'string', enum: ['today', 'week', 'month', 'custom'], default: 'today' } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Number of top items to return' },
        ],
        responses: { 200: { description: 'Top items ranked by quantity sold' } },
      },
    },
  },
}

export default swaggerSpec
