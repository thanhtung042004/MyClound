require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function fixIndex() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  try {
    const result = await mongoose.connection.collection('files').dropIndex('shareToken_1');
    console.log('Dropped old index:', result);
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index shareToken_1 not found, nothing to drop.');
    } else {
      console.error('Error dropping index:', err.message);
    }
  }

  // Mongoose will automatically recreate the index with sparse:true 
  // when we start the server again, or we can force it here:
  await mongoose.model('File', require('../src/models/File').schema).syncIndexes();
  console.log('Indexes synced');

  await mongoose.disconnect();
}

fixIndex().catch(console.error);
