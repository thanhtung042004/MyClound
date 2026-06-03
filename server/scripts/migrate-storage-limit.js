require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const NEW_LIMIT = 25 * 1024 * 1024 * 1024; // 25GB

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.collection('users').updateMany(
    {},
    { $set: { storageLimit: NEW_LIMIT } }
  );

  console.log(`Updated ${result.modifiedCount} user(s) -> storageLimit = 25GB`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
