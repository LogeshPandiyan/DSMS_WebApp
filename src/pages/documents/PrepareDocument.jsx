import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { getDocumentById, saveDocumentFields } from '../../services/documentService';
import {
    ChevronLeft,
    ChevronRight,
    Save,
    PenTool,
    Trash2,
    Loader2,
    AlertCircle,
    Info,
    Layout,
    User,
    Copy,
    PlusSquare,
    Search,
    X,
    CheckCircle2,
    ChevronDown,
    Check
} from 'lucide-react';
import { toast } from 'sonner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PrepareDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [fields, setFields] = useState([]);
    const [selectedRecipientId, setSelectedRecipientId] = useState('');
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [showRecipientPicker, setShowRecipientPicker] = useState(false);
    const [recipientDropdownOpen, setRecipientDropdownOpen] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [emailSettings, setEmailSettings] = useState({
        replyTo: '',
        cc: '',
        subject: '',
        message: '',
        sendEmail: true
    });
    const containerRef = useRef(null);
    const recipientDropdownRef = useRef(null);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const response = await getDocumentById(id);
                setDocData(response.data);
                // Initialize fields if they exist, otherwise empty
                setFields(response.data.fields || []);

                if (response.data.assignedTo?.length > 0) {
                    setSelectedRecipientId(response.data.assignedTo[0]._id);
                }
            } catch {
                toast.error('Failed to load document');
                navigate('/documents');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();

        const handleClickOutside = (event) => {
            if (recipientDropdownRef.current && !recipientDropdownRef.current.contains(event.target)) {
                setRecipientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [id, navigate]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const addSignatureField = () => {
        if (!selectedRecipientId) {
            return toast.error('Please select a recipient first');
        }

        const recipient = [docData.uploadedBy, ...(docData.assignedTo || [])]
            .find(r => r._id === selectedRecipientId);

        const newField = {
            id: Date.now().toString(), // Temp ID for UI tracking
            user: recipient._id,
            userName: recipient.name,
            userRole: recipient.role,
            type: 'signature',
            page: pageNumber,
            x: 50,
            y: 50,
            width: 150,
            height: 60
        };

        setFields([...fields, newField]);
        toast.success(`Signature field added for ${recipient.name}`);
    };

    const removeField = (fieldId) => {
        setFields(fields.filter(f => f.id !== fieldId && f._id !== fieldId));
    };

    const updateFieldPosition = (fieldId, d) => {
        setFields(fields.map(f => {
            if (f.id === fieldId || f._id === fieldId) {
                return { ...f, x: d.x, y: d.y };
            }
            return f;
        }));
    };

    const updateFieldSize = (fieldId, ref) => {
        setFields(fields.map(f => {
            if (f.id === fieldId || f._id === fieldId) {
                return {
                    ...f,
                    width: parseInt(ref.style.width),
                    height: parseInt(ref.style.height)
                };
            }
            return f;
        }));
    };

    const duplicateField = (field) => {
        const newField = {
            ...field,
            id: Date.now().toString(),
            _id: undefined, // Clear existing ID
            x: field.x + 20,
            y: field.y + 20
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
        toast.success('Field duplicated');
    };

    const duplicateForAllPages = (field) => {
        const newFields = [];
        for (let i = 1; i <= numPages; i++) {
            if (i === field.page) continue; // Skip current page
            newFields.push({
                ...field,
                id: `${Date.now()}-${i}`,
                _id: undefined,
                page: i
            });
        }
        setFields([...fields, ...newFields]);
        toast.success(`Field added to all ${numPages} pages`);
    };

    const changeFieldRecipient = (fieldId, recipient) => {
        setFields(fields.map(f => {
            if (f.id === fieldId || f._id === fieldId) {
                return { ...f, user: recipient._id, userName: recipient.name, userRole: recipient.role };
            }
            return f;
        }));
        setShowRecipientPicker(false);
        toast.success(`Recipient changed to ${recipient.name}`);
    };

    const handleSave = () => {
        if (fields.length === 0) {
            return toast.error('Please add at least one signature field');
        }
        setShowSendModal(true);
    };

    const confirmSend = async () => {
        setSaving(true);
        try {
            // Clean up fields before saving
            const fieldsToSave = fields.map(f => ({
                user: f.user,
                type: f.type,
                page: f.page,
                x: f.x,
                y: f.y,
                width: f.width,
                height: f.height
            }));

            await saveDocumentFields(id, {
                fields: fieldsToSave,
                emailSettings: emailSettings
            });

            toast.success('Document fields saved and document sent successfully!');
            navigate('/documents');
        } catch {
            toast.error('Failed to finalize document');
        } finally {
            setSaving(false);
            setShowSendModal(false);
        }
    };

    const getAssetUrl = (filePath) => {
        if (!filePath) return '';
        const baseUrl = import.meta.env.VITE_API_URL.split('/api')[0];
        const formattedPath = filePath.replace(/\\/g, '/');
        const finalPath = formattedPath.startsWith('/') ? formattedPath.substring(1) : formattedPath;
        return `${baseUrl}/${finalPath}`;
    };

    const getFieldColors = (role, isSelected) => {
        switch (role) {
            case 'admin':
                return isSelected 
                    ? 'bg-amber-500/20 border-amber-500 shadow-xl ring-4 ring-amber-500/10' 
                    : 'bg-amber-500/10 border-amber-500 hover:bg-amber-500/20';
            case 'manager':
                return isSelected 
                    ? 'bg-blue-500/20 border-blue-500 shadow-xl ring-4 ring-blue-500/10' 
                    : 'bg-blue-500/10 border-blue-500 hover:bg-blue-500/20';
            case 'employee':
                return isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500 shadow-xl ring-4 ring-emerald-500/10' 
                    : 'bg-emerald-500/10 border-emerald-500 hover:bg-emerald-500/20';
            default:
                return isSelected 
                    ? 'bg-primary-500/20 border-primary-500 shadow-xl ring-4 ring-primary-500/10' 
                    : 'bg-primary-500/10 border-primary-500 hover:bg-primary-500/20';
        }
    };

    const getHeaderColors = (role) => {
        switch (role) {
            case 'admin': return 'bg-amber-600';
            case 'manager': return 'bg-blue-600';
            case 'employee': return 'bg-emerald-600';
            default: return 'bg-primary-600';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                <p className="text-xs text-slate-400 font-medium tracking-tight capitalize tracking-wide font-black">Analyzing Document Structure...</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/documents')}
                        className="h-10 w-10 rounded-[5px] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Title: {docData.title}</h2>
                        <p className="text-[10px] text-slate-400 font-bold capitalize tracking-wide">Step 2: Place signature fields</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-[5px] text-xs font-black capitalize tracking-wide flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save & Complete
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* PDF Editor (Left/Center) */}
                <div className="col-span-9 flex flex-col items-center order-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-[5px] border border-slate-200 dark:border-slate-800 p-4 min-h-[800px] flex flex-col items-center">
                        {/* PDF Tools */}
                        <div className="flex items-center gap-6 mb-4 py-2 px-6 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700">
                            <button
                                disabled={pageNumber <= 1}
                                onClick={() => setPageNumber(pageNumber - 1)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-white capitalize tracking-wide whitespace-nowrap">
                                Page {pageNumber} of {numPages || '--'}
                            </span>
                            <button
                                disabled={pageNumber >= numPages}
                                onClick={() => setPageNumber(pageNumber + 1)}
                                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Relative Container for the PDF Page */}
                        <div
                            ref={containerRef}
                            className="relative shadow-2xl bg-white border border-slate-200 dark:border-slate-700 mb-10 overflow-hidden"
                            style={{ width: 'fit-content' }}
                        >
                            <Document
                                file={getAssetUrl(docData.filePath)}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={
                                    <div className="h-[800px] w-[600px] flex items-center justify-center bg-white">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-200" />
                                    </div>
                                }
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="shadow-inner"
                                    width={800} // Standard width for clarity
                                />
                            </Document>

                            {/* Overlay Draggable Fields for current page */}
                            {fields
                                .filter(f => f.page === pageNumber)
                                .map(field => (
                                    <Rnd
                                        key={field.id || field._id}
                                        size={{ width: field.width, height: field.height }}
                                        position={{ x: field.x, y: field.y }}
                                        onDragStop={(e, d) => updateFieldPosition(field.id || field._id, d)}
                                        onResizeStop={(e, direction, ref) => updateFieldSize(field.id || field._id, ref)}
                                        bounds="parent"
                                        className="z-50"
                                    >
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setSelectedFieldId(field.id || field._id); }}
                                            className={`w-full h-full rounded-[4px] relative group backdrop-blur-[1px] transition-all border-2 ${getFieldColors(field.userRole, selectedFieldId === (field.id || field._id))}`}
                                        >
                                            <div className={`absolute -top-6 left-0 text-white text-[9px] font-black px-2 py-0.5 rounded-t-[4px] capitalize tracking-wide flex items-center gap-1.5 whitespace-nowrap ${getHeaderColors(field.userRole)}`}>
                                                <PenTool className="h-2.5 w-2.5" />
                                                {field.userName || 'Signer'}
                                            </div>

                                            {/* Floating Toolbar - Visible when selected */}
                                            {selectedFieldId === (field.id || field._id) && (
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-[100] flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); 
                                                            setShowRecipientPicker(true); 
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all group/tooltip relative"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        {/* Tooltip */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[200] shadow-xl border border-slate-700">
                                                            Change Recipient
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                                                        </div>
                                                    </button>
                                                    <div className="w-px h-4 bg-slate-800 mx-0.5"></div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); 
                                                            duplicateField(field); 
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all group/tooltip relative"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                        {/* Tooltip */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[200] shadow-xl border border-slate-700">
                                                            Duplicate
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); 
                                                            duplicateForAllPages(field); 
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all group/tooltip relative"
                                                    >
                                                        <PlusSquare className="h-4 w-4" />
                                                        {/* Tooltip */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[200] shadow-xl border border-slate-700">
                                                            Add to all pages
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                                                        </div>
                                                    </button>

                                                    <div className="w-px h-4 bg-slate-800 mx-0.5"></div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); 
                                                            removeField(field.id || field._id); 
                                                            setSelectedFieldId(null); 
                                                        }}
                                                        className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-red-900/40 text-slate-400 hover:text-red-400 transition-all group/tooltip relative"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {/* Tooltip */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[200] shadow-xl border border-slate-700">
                                                            Delete Field
                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}

                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-50">
                                                <PenTool className={`h-6 w-6 ${field.userRole === 'admin' ? 
                                                    'text-amber-500' : 
                                                    field.userRole === 'manager' ? 
                                                    'text-blue-500' : 
                                                    'text-emerald-500'}`} 
                                                    />
                                                <span className={`text-[10px] font-bold capitalize 
                                                    ${field.userRole === 'admin' ? 
                                                    'text-amber-600' : 
                                                    field.userRole === 'manager' ? 
                                                    'text-blue-600' : 
                                                    'text-emerald-600'}`}>
                                                        Signature
                                                </span>
                                            </div>

                                            {/* Resize dots (purely visual for UX) */}
                                            <div className={`absolute -bottom-1 -right-1 h-3 w-3 border border-white rounded-full 
                                                ${getHeaderColors(field.userRole)}`}>
                                
                                                </div>
                                        </div>
                                    </Rnd>
                                ))}
                        </div>

                        {/* Recipient Picker Modal */}
                        {showRecipientPicker && (
                            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
                                    <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                Select a recipient
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => setShowRecipientPicker(false)}
                                            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="p-2 max-h-[400px] overflow-y-auto">
                                        <div className="px-3 py-2">
                                            <p className="text-[10px] font-black capitalize tracking-wide text-slate-400 mb-2">Signers</p>
                                        </div>
                                        {/* Deduplicated signers: uploadedBy + assignedTo, unique by _id */}
                                        {[docData.uploadedBy, ...(docData.assignedTo || [])]
                                            .filter(Boolean)
                                            .filter((s, i, arr) => arr.findIndex(x => x._id === s._id) === i)
                                            .map((signer, idx) => {
                                            const currentField = fields.find(f => f.id === selectedFieldId || f._id === selectedFieldId);
                                            const isSelected = (signer?._id || signer) === currentField?.user;

                                            return (
                                                <button
                                                    key={signer._id || idx}
                                                    onClick={() => changeFieldRecipient(selectedFieldId, signer)}
                                                    className={`w-full text-left px-3 py-3 rounded-lg flex items-center justify-between transition-all ${isSelected
                                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold">{signer.name}</span>
                                                        <span className="text-[10px] opacity-70">{signer.email}</span>
                                                    </div>
                                                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-2">
                        <Layout className="h-5 w-5 text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-bold capitalize tracking-wide">
                            Document Editor Area
                        </span>
                    </div>
                </div>

                {/* Right Sidebar: Controls (Reordered to right) */}
                <div className="col-span-3 space-y-6 order-2 relative z-[10]">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-6 shadow-sm">
                        <h3 className="text-xs font-sans font-bold text-slate-600 mb-6 flex items-center gap-2">
                            <PenTool className="h-3.5 w-3.5" />
                            Signature Fields
                        </h3>

                        <div className="space-y-4">
                            <div ref={recipientDropdownRef}>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setRecipientDropdownOpen(!recipientDropdownOpen)}
                                        className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[5px] px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${[docData.uploadedBy, ...(docData.assignedTo || [])].find(u => u._id === selectedRecipientId)?.role === 'admin' ? 'bg-amber-500' : [docData.uploadedBy, ...(docData.assignedTo || [])].find(u => u._id === selectedRecipientId)?.role === 'manager' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                            <span className="truncate">{[docData.uploadedBy, ...(docData.assignedTo || [])].find(u => u._id === selectedRecipientId)?.name || 'Select Signer'}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${recipientDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {recipientDropdownOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] shadow-2xl z-[100] p-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {[docData.uploadedBy, ...(docData.assignedTo || [])]
                                                .filter(Boolean)
                                                .filter((s, i, arr) => arr.findIndex(x => x._id === s._id) === i)
                                                .map(user => (
                                                    <button
                                                        key={user._id}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRecipientId(user._id);
                                                            setRecipientDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2.5 text-left text-[11px] font-bold flex items-center justify-between transition-colors rounded-[4px]
                                                            ${selectedRecipientId === user._id 
                                                                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' 
                                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-2 w-2 rounded-full ${user.role === 'admin' ? 'bg-amber-500' : user.role === 'manager' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                                            <span>{user.name}</span>
                                                        </div>
                                                        {selectedRecipientId === user._id && <Check className="h-3.5 w-3.5" />}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={addSignatureField}
                                className="w-full py-4 border-2 border-dashed border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-900/20 rounded-[5px] text-emerald-600 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 transition-all flex flex-col items-center justify-center gap-2 group relative"
                            >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100]">
                                    Click to add signature field
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                </div>

                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <PenTool className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-bold tracking-tight">Add Signature Box</span>
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-[5px] border border-blue-100 dark:border-blue-900/30">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                                <p className="text-[10px] text-blue-800 dark:text-blue-400 font-bold leading-relaxed tracking-tight underline-offset-4 decoration-blue-200">
                                    Drag the boxes to the exact location where you want each recipient to sign.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] p-6">
                        <h3 className="text-[10px] font-black capitalize tracking-wide text-slate-400 mb-4">
                            Field List ({fields.length})
                        </h3>

                        <div className="space-y-3">
                            {fields.map((field, idx) => (
                                <div key={field.id || field._id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-[5px] border border-slate-200 dark:border-slate-800 group">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400">
                                            #{idx + 1}</span>

                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                                Signature Field
                                            </span>

                                            <span className="text-[9px] text-slate-500 font-bold capitalize tracking-tighter">
                                                Page {field.page} • {field.userName || 'Assigned User'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeField(field.id || field._id)}
                                        className="h-7 w-7 rounded-[4px] text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Send Document Modal */}
            {showSendModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send Document</h3>
                                <p className="text-xs text-slate-500 font-bold  tracking-wide mt-1">Recipients will be able to sign the document once sent</p>
                            </div>

                            {/* Email Toggle */}
                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <button
                                    onClick={() => setEmailSettings({ ...emailSettings, sendEmail: true })}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${emailSettings.sendEmail ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                >
                                    Email
                                </button>
                                <button
                                    onClick={() => setEmailSettings({ ...emailSettings, sendEmail: false })}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!emailSettings.sendEmail ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
                                >
                                    None
                                </button>
                            </div>

                            {emailSettings.sendEmail && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-slate-500 capitalize tracking-wide">
                                            Reply To Email</label>
                                        <input
                                            type="email"
                                            value={emailSettings.replyTo}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, replyTo: e.target.value })}
                                            placeholder="reply@example.com"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-slate-500 capitalize tracking-wide">Add Sub Email (CC)</label>
                                        <input
                                            type="text"
                                            value={emailSettings.cc}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, cc: e.target.value })}
                                            placeholder="email1@example.com, email2@example.com"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                        />
                                        <p className="text-[9px] text-slate-400 font-medium">Separate multiple emails with commas</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[12px] font-semibold text-slate-500 capitalize tracking-wide">Subject (Optional)</label>
                                        <input
                                            type="text"
                                            value={emailSettings.subject}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                                            placeholder="Signature Request"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1">
                                            <label className="text-[12px] font-semibold text-slate-500 capitalize tracking-wide">Message (Optional)</label>
                                            <Info className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <textarea
                                            rows="3"
                                            value={emailSettings.message}
                                            onChange={(e) => setEmailSettings({ ...emailSettings, message: e.target.value })}
                                            placeholder="Add a custom message..."
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-xs font-medium outline-none focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    onClick={() => setShowSendModal(false)}
                                    className="px-6 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSend}
                                    disabled={saving}
                                    className="bg-primary-600 hover:bg-primary-500 text-white px-10 py-2.5 rounded-md text-xs font-semibold shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrepareDocument;
