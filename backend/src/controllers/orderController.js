import { getPool, sql, query } from '../config/db.js';

/** Create an order with line items in a single transaction. */
export async function createOrder(req, res, next) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  try {
    const { customerName, email, items } = req.body;
    if (!customerName || !email || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'customerName, email and at least one item are required' });
    }

    await tx.begin();

    // Look up authoritative prices from DB (never trust client prices).
    const priceMap = {};
    for (const it of items) {
      const r = await new sql.Request(tx)
        .input('Id', it.menuItemId)
        .query('SELECT Id, Price FROM dbo.MenuItems WHERE Id = @Id AND IsAvailable = 1');
      if (r.recordset.length === 0) throw new Error(`Menu item ${it.menuItemId} unavailable`);
      priceMap[it.menuItemId] = r.recordset[0].Price;
    }

    const total = items.reduce((sum, it) => sum + priceMap[it.menuItemId] * it.quantity, 0);

    const orderResult = await new sql.Request(tx)
      .input('UserId', req.user ? req.user.id : null)
      .input('CustomerName', customerName)
      .input('Email', email)
      .input('TotalAmount', total)
      .query(`INSERT INTO dbo.Orders (UserId, CustomerName, Email, TotalAmount)
              OUTPUT INSERTED.* VALUES (@UserId, @CustomerName, @Email, @TotalAmount)`);
    const order = orderResult.recordset[0];

    for (const it of items) {
      await new sql.Request(tx)
        .input('OrderId', order.Id)
        .input('MenuItemId', it.menuItemId)
        .input('Quantity', it.quantity)
        .input('UnitPrice', priceMap[it.menuItemId])
        .query(`INSERT INTO dbo.OrderItems (OrderId, MenuItemId, Quantity, UnitPrice)
                VALUES (@OrderId, @MenuItemId, @Quantity, @UnitPrice)`);
    }

    await tx.commit();
    res.status(201).json(order);
  } catch (err) {
    await tx.rollback().catch(() => {});
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const result = await query('SELECT * FROM dbo.Orders ORDER BY CreatedAt DESC');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}
