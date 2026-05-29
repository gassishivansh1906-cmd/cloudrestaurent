/* =====================================================================
   CloudRestaurant - SQL Server Schema
   Compatible with SQL Server 2019+ and SSMS 22
   Run this script once to create the database and all tables.
   ===================================================================== */

IF DB_ID('CloudRestaurant') IS NULL
BEGIN
    CREATE DATABASE CloudRestaurant;
END
GO

USE CloudRestaurant;
GO

/* ---------- Users (SaaS auth) ---------- */
IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        Id            INT IDENTITY(1,1) PRIMARY KEY,
        FullName      NVARCHAR(150)  NOT NULL,
        Email         NVARCHAR(256)  NOT NULL UNIQUE,
        PasswordHash  NVARCHAR(256)  NOT NULL,
        Role          NVARCHAR(20)   NOT NULL DEFAULT 'customer',  -- customer | admin
        CreatedAt     DATETIME2      NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

/* ---------- Menu categories ---------- */
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        Name        NVARCHAR(100) NOT NULL UNIQUE,
        Description NVARCHAR(500) NULL,
        SortOrder   INT NOT NULL DEFAULT 0
    );
END
GO

/* ---------- Menu items ---------- */
IF OBJECT_ID('dbo.MenuItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MenuItems (
        Id          INT IDENTITY(1,1) PRIMARY KEY,
        CategoryId  INT NOT NULL FOREIGN KEY REFERENCES dbo.Categories(Id),
        Name        NVARCHAR(150) NOT NULL,
        Description NVARCHAR(1000) NULL,
        Price       DECIMAL(10,2) NOT NULL,
        ImageUrl    NVARCHAR(500) NULL,
        IsAvailable BIT NOT NULL DEFAULT 1,
        IsFeatured  BIT NOT NULL DEFAULT 0,
        CreatedAt   DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

/* ---------- Reservations ---------- */
IF OBJECT_ID('dbo.Reservations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Reservations (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        CustomerName NVARCHAR(150) NOT NULL,
        Email        NVARCHAR(256) NOT NULL,
        Phone        NVARCHAR(40)  NOT NULL,
        PartySize    INT NOT NULL,
        ReserveDate  DATE NOT NULL,
        ReserveTime  NVARCHAR(20) NOT NULL,
        Notes        NVARCHAR(1000) NULL,
        Status       NVARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | confirmed | cancelled
        CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

/* ---------- Orders ---------- */
IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Orders (
        Id           INT IDENTITY(1,1) PRIMARY KEY,
        UserId       INT NULL FOREIGN KEY REFERENCES dbo.Users(Id),
        CustomerName NVARCHAR(150) NOT NULL,
        Email        NVARCHAR(256) NOT NULL,
        TotalAmount  DECIMAL(10,2) NOT NULL,
        Status       NVARCHAR(20) NOT NULL DEFAULT 'received', -- received | preparing | delivered | cancelled
        CreatedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

/* ---------- Order items ---------- */
IF OBJECT_ID('dbo.OrderItems', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.OrderItems (
        Id         INT IDENTITY(1,1) PRIMARY KEY,
        OrderId    INT NOT NULL FOREIGN KEY REFERENCES dbo.Orders(Id) ON DELETE CASCADE,
        MenuItemId INT NOT NULL FOREIGN KEY REFERENCES dbo.MenuItems(Id),
        Quantity   INT NOT NULL,
        UnitPrice  DECIMAL(10,2) NOT NULL
    );
END
GO

/* ---------- Contact messages ---------- */
IF OBJECT_ID('dbo.ContactMessages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ContactMessages (
        Id        INT IDENTITY(1,1) PRIMARY KEY,
        Name      NVARCHAR(150) NOT NULL,
        Email     NVARCHAR(256) NOT NULL,
        Subject   NVARCHAR(200) NULL,
        Message   NVARCHAR(2000) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

PRINT 'CloudRestaurant schema created successfully.';
GO
