const mongoose = require('mongoose'); 
const Document = require('./src/models/documentModel'); 
async function check() {
    await mongoose.connect('mongodb://127.0.0.1:27017/mern-auth'); 
    const doc = await Document.findOne().sort({ createdAt: -1 }).populate('uploadedBy').populate('assignedTo'); 
    console.log(JSON.stringify(doc, null, 2)); 
    process.exit(0); 
}
check();
