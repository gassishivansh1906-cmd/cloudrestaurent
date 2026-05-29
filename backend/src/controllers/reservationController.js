import { query } from '../config/db.js';

export async function createReservation(req, res, next) {
  try {
    const { customerName, email, phone, partySize, reserveDate, reserveTime, notes } = req.body;
    if (!customerName || !email || !phone || !partySize || !reserveDate || !reserveTime) {
      return res.status(400).json({ message: 'All reservation fields are required' });
    }
    const result = await query(
      `INSERT INTO dbo.Reservations (CustomerName, Email, Phone, PartySize, ReserveDate, ReserveTime, Notes)
       OUTPUT INSERTED.*
       VALUES (@CustomerName, @Email, @Phone, @PartySize, @ReserveDate, @ReserveTime, @Notes)`,
      {
        CustomerName: customerName,
        Email: email,
        Phone: phone,
        PartySize: parseInt(partySize, 10),
        ReserveDate: reserveDate,
        ReserveTime: reserveTime,
        Notes: notes || null,
      }
    );
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
}

export async function listReservations(req, res, next) {
  try {
    const result = await query('SELECT * FROM dbo.Reservations ORDER BY CreatedAt DESC');
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

export async function updateReservationStatus(req, res, next) {
  try {
    const { status } = req.body;
    await query('UPDATE dbo.Reservations SET Status = @Status WHERE Id = @Id', {
      Status: status,
      Id: parseInt(req.params.id, 10),
    });
    res.json({ message: 'Reservation updated' });
  } catch (err) {
    next(err);
  }
}
