import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });

    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`\n=== users collection (${users.length}) ===`);
    users.forEach(u => console.log(`- _id: ${u._id} | username: ${u.username} | email: ${u.email} | role: ${u.role} | customerName: ${u.customerName}`));

    const invoiceUsers = await mongoose.connection.db.collection('invoice_users').find({}).toArray();
    console.log(`\n=== invoice_users collection (${invoiceUsers.length}) ===`);
    invoiceUsers.forEach(u => console.log(`- _id: ${u._id} | username: ${u.username} | email: ${u.email} | fullName: ${u.fullName} | company: ${u.companyName}`));

    const invoices = await mongoose.connection.db.collection('invoices').find({}).toArray();
    console.log(`\n=== invoices collection (${invoices.length}) ===`);
    invoices.forEach(inv => {
      console.log(`- _id: ${inv._id} | invoiceNumber: ${inv.invoiceNumber} | userId: ${inv.userId || inv.user} | docType: ${inv.docType} | total: ${inv.grandTotal}`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
