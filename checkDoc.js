const mongoose = require('mongoose'); 
const User = require('./src/models/userModel');
const Document = require('./src/models/documentModel'); 

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/SimpleMernPorject'); 
        console.log("Connected to MongoDB.");

        const doc = await Document.findOne({ title: 'test5' })
            .populate('uploadedBy')
            .populate('assignedTo');

        if (!doc) {
            console.log("Document not found!");
            return;
        }

        console.log("DOCUMENT DETAIL FOR TEST5:");
        console.log({
            id: doc._id.toString(),
            title: doc.title,
            assignedTo: doc.assignedTo.map(a => a.email),
            emailSettings: doc.emailSettings
        });

    } catch (e) {
        console.error("Error:", e);
    } finally {
        process.exit(0);
    }
}
check();
