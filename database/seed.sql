/* =====================================================================
   CloudRestaurant - Seed data
   Run AFTER schema.sql. Safe to re-run (clears and reloads sample data).

   NOTE: This script avoids DBCC CHECKIDENT (which breaks the ODBC sqlcmd
   used in the Docker db-init container) and references categories by name
   instead of hard-coded IDs, so it is portable across SSMS and sqlcmd.
   ===================================================================== */

USE CloudRestaurant;
GO

SET NOCOUNT ON;
GO

/* Clear existing demo data (respect FK order) */
DELETE FROM dbo.OrderItems;
DELETE FROM dbo.Orders;
DELETE FROM dbo.MenuItems;
DELETE FROM dbo.Categories;
DELETE FROM dbo.Reservations;
DELETE FROM dbo.ContactMessages;
GO

/* ---------- Categories ---------- */
INSERT INTO dbo.Categories (Name, Description, SortOrder) VALUES
 (N'Starters',    N'Light bites to begin your meal',   1),
 (N'Main Course', N'Hearty signature dishes',          2),
 (N'Desserts',    N'Sweet endings',                    3),
 (N'Beverages',   N'Refreshing drinks and hot brews',  4);
GO

/* ---------- Menu items (CategoryId looked up by name) ---------- */
INSERT INTO dbo.MenuItems (CategoryId, Name, Description, Price, ImageUrl, IsAvailable, IsFeatured) VALUES
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Starters'),    N'Bruschetta',       N'Grilled bread, tomato, basil, olive oil',       6.50, N'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600', 1, 1),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Starters'),    N'Crispy Calamari',  N'Lightly fried squid with aioli',                9.00, N'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600', 1, 0),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Main Course'), N'Grilled Salmon',   N'Atlantic salmon, lemon butter, asparagus',     18.50, N'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600', 1, 1),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Main Course'), N'Ribeye Steak',     N'300g prime ribeye, herb butter, fries',        24.00, N'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600', 1, 1),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Main Course'), N'Margherita Pizza', N'San Marzano tomato, mozzarella, basil',        12.00, N'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', 1, 0),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Desserts'),    N'Tiramisu',         N'Classic mascarpone and espresso',               7.00, N'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 1, 1),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Desserts'),    N'Chocolate Lava',   N'Warm molten chocolate cake, vanilla ice cream', 7.50, N'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600', 1, 0),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Beverages'),   N'Fresh Lemonade',   N'House-made with mint',                          4.00, N'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600', 1, 0),
 ((SELECT Id FROM dbo.Categories WHERE Name = N'Beverages'),   N'Espresso',         N'Single origin, double shot',                    3.00, N'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600', 1, 0);
GO

/* ---------- Admin user ----------
   The admin account is created by the backend on first start (db.js -> seedAdmin),
   which generates a correct bcrypt hash from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
   Defaults:  admin@cloud.com  /  Admin@123
   You can also POST /api/auth/register to create customer accounts.
*/

PRINT 'CloudRestaurant seed data inserted successfully.';
GO
