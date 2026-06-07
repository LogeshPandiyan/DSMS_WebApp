const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, getDocumentById, updateDocument, deleteDocument, getDocumentCounts } = require('../controllers/documentController');
const { signDocument, updateDocumentFields } = require('../controllers/documentSignController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// All document routes are protected
router.use(protect);

router.post('/upload', upload.single('document'), uploadDocument);
router.get('/get-counts', getDocumentCounts);
router.get('/get-all', getDocuments);
router.get('/get-details/:id', getDocumentById);
router.post('/sign/:id', signDocument);
router.put('/save-fields/:id', updateDocumentFields);
router.put('/update/:id', updateDocument);
router.delete('/delete/:id', deleteDocument);

module.exports = router;
