require('dotenv').config();
const pool = require('./config/database');

async function run() {
  try {
    // 1. Update any existing COMPLETED to CONFIRMED
    await pool.query("UPDATE reservations SET status = 'CONFIRMED' WHERE status = 'COMPLETED'");
    
    // 2. Drop old constraint
    await pool.query("ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check");
    
    // 3. Add new constraint
    await pool.query("ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (status::text = ANY (ARRAY['PENDING'::text, 'CONFIRMED'::text, 'REJECT'::text, 'CANCELLED'::text]))");
    
    console.log('Database constraint updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating DB:', error);
    process.exit(1);
  }
}

run();
