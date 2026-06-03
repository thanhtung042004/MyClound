require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function fixFilenames() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(' Connected to MongoDB');

  const files = await mongoose.connection.collection('files').find({}).toArray();
  let fixed = 0;

  for (const file of files) {
    // Detect if name looks like mojibake (contains latin-1 encoded UTF-8)
    // Try decoding: treat the string as latin-1 bytes, re-encode to utf-8
    const tryFix = (str) => {
      if (!str) return str;
      try {
        const decoded = Buffer.from(str, 'latin1').toString('utf8');
        // Check if decoded looks more "normal" (has valid Vietnamese chars)
        // If decoded has more printable Vietnamese than original, use it
        const isLatin1Encoded = /[ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]/.test(str);
        return isLatin1Encoded ? decoded : str;
      } catch {
        return str;
      }
    };

    const fixedName = tryFix(file.name);
    const fixedOriginalName = tryFix(file.originalName);

    if (fixedName !== file.name || fixedOriginalName !== file.originalName) {
      await mongoose.connection.collection('files').updateOne(
        { _id: file._id },
        { $set: { name: fixedName, originalName: fixedOriginalName } }
      );
      console.log(`  Fixed: "${file.name}" → "${fixedName}"`);
      fixed++;
    }
  }

  console.log(`\n Fixed ${fixed}/${files.length} file(s)`);
  await mongoose.disconnect();
}

fixFilenames().catch((err) => {
  console.error(' Error:', err.message);
  process.exit(1);
});
