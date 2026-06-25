const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, getDocumentById, updateDocument, deleteDocument, getDocumentCounts } = require('../controllers/documentController');
const { signDocument, updateDocumentFields } = require('../controllers/documentSignController');
const { protect, protectOrSignToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/get-counts', protect, getDocumentCounts);
router.get('/get-all', protect, getDocuments);
router.put('/save-fields/:id', protect, updateDocumentFields);
router.put('/update/:id', protect, updateDocument);
router.delete('/delete/:id', protect, deleteDocument);

// Accessible via normal login OR guest sign token
router.get('/get-details/:id', protectOrSignToken, getDocumentById);
router.post('/sign/:id', protectOrSignToken, signDocument);

module.exports = router;
