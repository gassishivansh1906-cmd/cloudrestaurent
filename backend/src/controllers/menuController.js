import { query } from '../config/db.js';

export async function listCategories(req, res, next) {
  try {
    const result = await query('SELECT * FROM dbo.Categories ORDER BY SortOrder, Name');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function listMenu(req, res, next) {
  try {
    const { categoryId, featured } = req.query;
    let where = 'WHERE m.IsAvailable = 1';
    const params = {};
    if (categoryId) {
      where += ' AND m.CategoryId = @CategoryId';
      params.CategoryId = parseInt(categoryId, 10);
    }
    if (featured === 'true') where += ' AND m.IsFeatured = 1';

    const result = await query(
      `SELECT m.*, c.Name AS CategoryName
       FROM dbo.MenuItems m
       JOIN dbo.Categories c ON c.Id = m.CategoryId
       ${where}
       ORDER BY c.SortOrder, m.Name`,
      params
    );
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function createMenuItem(req, res, next) {
  try {
    const { categoryId, name, description, price, imageUrl, isFeatured } = req.body;
    if (!categoryId || !name || price == null) {
      return res.status(400).json({ message: 'categoryId, name and price are required' });
    }
    const result = await query(
      `INSERT INTO dbo.MenuItems (CategoryId, Name, Description, Price, ImageUrl, IsFeatured)
       OUTPUT INSERTED.*
       VALUES (@CategoryId, @Name, @Description, @Price, @ImageUrl, @IsFeatured)`,
      {
        CategoryId: parseInt(categoryId, 10),
        Name: name,
        Description: description || null,
        Price: price,
        ImageUrl: imageUrl || null,
        IsFeatured: isFeatured ? 1 : 0,
      }
    );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    await query('DELETE FROM dbo.MenuItems WHERE Id = @Id', { Id: parseInt(req.params.id, 10) });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
