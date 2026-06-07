import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { getDocumentById, signDocument } from '../../services/documentService';
import {
    PenTool,
    RotateCcw,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Info,
    Keyboard
} from 'lucide-react';
import { toast } from 'sonner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const SignDocument = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useOutletContext();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [fieldSignatures, setFieldSignatures] = useState({}); // { fieldId: dataUrl }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState(null);
    const [sigType, setSigType] = useState('draw'); // 'draw' or 'type'
    const [sigColor, setSigColor] = useState('#000000');
    const [typedName, setTypedName] = useState(currentUser?.name || '');
    const sigPad = useRef(null);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                const response = await getDocumentById(id);
                setDocument(response.data);

                // If user has a field, jump to that page
                const userField = response.data.fields?.find(f => (f.user?._id || f.user) === currentUser?._id);
                if (userField) {
                    setPageNumber(userField.page);
                }

                // Initialize fieldSignatures from existing signatures if any 
                // (though usually signing happens in one session)
                const existingSigs = {};
                response.data.signatures?.forEach(sig => {
                    if ((sig.user?._id || sig.user) === currentUser?._id) {
                        existingSigs[sig.fieldId] = sig.signatureData;
                    }
                });
                setFieldSignatures(existingSigs);
            } catch {
                toast.error('Failed to load document');
                navigate('/documents');
            } finally {
                setLoading(false);
            }
        };
        fetchDoc();
    }, [id, navigate, currentUser]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleAcceptSignature = () => {
        let signatureData = '';

        if (sigType === 'draw') {
            if (!sigPad.current || sigPad.current.isEmpty()) {
                return toast.error('Please provide your signature');
            }
            signatureData = sigPad.current.toDataURL('image/png');
        } else {
            if (!typedName.trim()) {
                return toast.error('Please type your name');
            }
            // Generate image from text using canvas
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = sigColor;
            ctx.font = 'italic 60px "Dancing Script", cursive, "Brush Script MT", "Apple Chancery"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedName, 300, 100);
            signatureData = canvas.toDataURL('image/png');
        }

        setFieldSignatures(prev => ({
            ...prev,
            [(selectedField._id || selectedField.id)]: signatureData
        }));
        setIsModalOpen(false);
        setSelectedField(null);
        toast.success('Signature accepted');
    };

    const handleOpenModal = (field) => {
        setSelectedField(field);
        setIsModalOpen(true);
    };

    const handleSign = async () => {
        // Finish Signing Logic
        let currentSigs = { ...fieldSignatures };

        // DEBUG: Log to identify ID mismatch
        console.log('=== SIGN DEBUG ===');
        console.log('currentUser._id:', currentUser?._id);
        console.log('All fields:', document.fields?.map(f => ({ fieldId: f._id, userId: f.user?._id || f.user })));
        console.log('currentSigs keys:', Object.keys(currentSigs));

        // Validation: Verify ALL fields for this user are signed
        const myFields = document.fields?.filter(f => 
            (f.user?._id || f.user)?.toString() === currentUser?._id?.toString()
        ) || [];

        console.log('myFields found:', myFields.length);

        const unsignedFields = myFields.filter(f => {
            const fId = (f._id || f.id)?.toString();
            return !Object.keys(currentSigs).some(k => k.toString() === fId);
        });

        if (unsignedFields.length > 0) {
            setPageNumber(unsignedFields[0].page);
            return toast.error(`Please sign all ${myFields.length} required fields. ${unsignedFields.length} remaining.`);
        }

        // Safety guard: Never send empty signatures to backend
        if (Object.keys(currentSigs).length === 0) {
            return toast.error('Please draw and accept your signature first before finishing.');
        }

        setSigning(true);
        try {
            // Include color metadata if available
            const signaturesWithMeta = {};
            Object.entries(currentSigs).forEach(([fId, data]) => {
                signaturesWithMeta[fId] = typeof data === 'string' ? { dataUrl: data, color: sigColor } : data;
            });

            await signDocument(id, { signatures: signaturesWithMeta });
            toast.success('Document signed successfully!');
            navigate('/documents');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sign document');
        } finally {
            setSigning(false);
        }
    };

    const getAssetUrl = (filePath) => {
        if (!filePath) return '';
        const baseUrl = import.meta.env.VITE_API_URL.split('/api')[0];
        const formattedPath = filePath.replace(/\\/g, '/');
        const finalPath = formattedPath.startsWith('/') ? formattedPath.substring(1) : formattedPath;
        return `${baseUrl}/${finalPath}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
                <p className="text-xs text-slate-400 font-medium tracking-tight capitalize tracking-wide font-black">Preparing Signing Environment...</p>
            </div>
        );
    }

    const myFields = document.fields?.filter(f =>
        (f.user?._id || f.user)?.toString() === currentUser?._id?.toString()
    ) || [];
    const hasAlreadySigned = document.signatures?.some(s =>
        (s.user?._id || s.user)?.toString() === currentUser?._id?.toString()
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/documents')}
                        className="h-10 w-10 rounded-[5px] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{document.title}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-emerald-600 capitalize tracking-wide flex items-center gap-1.5">
                                <ShieldCheck className="h-3 w-3" />
                                Secured Signing
                            </span>
                            <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                            <span className="text-[10px] text-slate-400 font-medium">{document.fileName}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasAlreadySigned ? (
                        <div className="px-6 py-2.5 bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30 rounded-[5px] flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span className="text-xs font-black capitalize tracking-wide text-emerald-700 dark:text-emerald-400">Signed</span>
                        </div>
                    ) : (
                        <button
                            onClick={handleSign}
                            disabled={signing}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-[5px] text-xs font-black capitalize tracking-wide flex items-center gap-2 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Finish Signing
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* PDF Viewer Central */}
                <div className="col-span-12 lg:col-span-9 flex flex-col items-center gap-6">
                    <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-[5px] border border-slate-200 dark:border-slate-800 p-8 min-h-[800px] flex flex-col items-center overflow-auto">
                        {/* Toolbar */}
                        <div className="flex items-center gap-6 mb-8 py-2 px-6 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 sticky top-0 z-[100]">
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

                        {/* PDF Page Container */}
                        <div className="relative shadow-2xl bg-white border border-slate-200 dark:border-slate-700 overflow-hidden" style={{ width: 'fit-content' }}>
                            <Document
                                file={getAssetUrl(document.filePath)}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<Loader2 className="h-8 w-8 animate-spin text-slate-200 m-40" />}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    width={800}
                                />
                            </Document>

                            {/* Signature Fields Overlay */}
                            {document.fields?.filter(f => f.page === pageNumber).map(field => {
                                const isMyField = (field.user?._id || field.user)?.toString() === currentUser?._id?.toString();

                                return (
                                    <div
                                        key={field._id}
                                        style={{
                                            position: 'absolute',
                                            left: field.x,
                                            top: field.y,
                                            width: field.width,
                                            height: field.height,
                                            zIndex: 50
                                        }}
                                        className={`group rounded-[4px] border-2 transition-all ${isMyField
                                                ? 'bg-primary-500/10 border-primary-500 border-dashed cursor-pointer hover:bg-primary-500/20 shadow-lg shadow-primary-500/10'
                                                : 'bg-slate-500/5 border-slate-200 opacity-40 grayscale'
                                            }`}
                                        onClick={() => isMyField && !hasAlreadySigned && handleOpenModal(field)}
                                    >
                                        <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded-t-[4px] text-[9px] font-black capitalize tracking-wide flex items-center gap-1.5 whitespace-nowrap ${isMyField ? 'bg-primary-600 text-white' : 'bg-slate-400 text-white'
                                            }`}>
                                            <PenTool className="h-2.5 w-2.5" />
                                            {isMyField ? 'Your Signature Here' : `${field.user?.name || 'Assigned User'}'s Field`}
                                        </div>

                                        {fieldSignatures[field._id] || fieldSignatures[field.id] ? (
                                            <div className="w-full h-full bg-white flex items-center justify-center p-1 rounded-[2px]">
                                                <img
                                                    src={fieldSignatures[field._id] || fieldSignatures[field.id]}
                                                    alt="Signature"
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                                <PenTool className={`h-6 w-6 ${isMyField ? 'text-primary-500' : 'text-slate-300'}`} />
                                                <span className={`text-[9px] font-bold capitalize ${isMyField ? 'text-primary-600' : 'text-slate-400'}`}>Sign Here</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Context & Info */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 dark:border-white/5 pb-4">
                            <div className="h-8 w-8 rounded-[5px] bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                                <Info className="h-4 w-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize tracking-tight">Instructions</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">1</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    Navigate through the document to find your assigned signature boxes (highlighted in blue).
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">2</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    Click on a box to activate the signature pad and draw your signature.
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">3</div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    Once all fields are signed, click the <b>"Finish Signing"</b> button at the top.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-[5px] space-y-2">
                            <p className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold leading-relaxed capitalize tracking-wide">
                                Status: {myFields.length} Required Field(s)
                            </p>
                            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${(Object.keys(fieldSignatures).length / myFields.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Participants Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-[5px] p-6 space-y-4">
                        <h4 className="text-[10px] font-black capitalize tracking-wide text-slate-500">Signing Matrix</h4>
                        <div className="space-y-3">
                            {document.assignedTo.map(signer => {
                                const isSigner = signer._id === currentUser?._id;
                                const hasSigned = document.signatures.some(sig => (sig.user?._id || sig.user) === signer._id);
                                return (
                                    <div key={signer._id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${hasSigned ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                            <span className={`text-xs font-bold ${isSigner ? 'text-primary-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {signer.name} {isSigner && '(You)'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Signature Drawing Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[10px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Adopt Your Signature</h3>
                                <div className="flex items-center gap-1 mt-1.5 p-[3px] bg-slate-100 dark:bg-slate-800 rounded-[5px] w-fit">
                                    <button 
                                        onClick={() => setSigType('draw')}
                                        className={`px-3 py-1 text-[10px] font-black capitalize tracking-wide rounded-[4px] transition-all flex items-center gap-2 ${sigType === 'draw' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <PenTool className="h-3 w-3" />
                                        Draw
                                    </button>
                                    <button 
                                        onClick={() => setSigType('type')}
                                        className={`px-3 py-1 text-[10px] font-black capitalize tracking-wide rounded-[4px] transition-all flex items-center gap-2 ${sigType === 'type' ? 'bg-white dark:bg-slate-900 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Keyboard className="h-3 w-3" />
                                        Type
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[
                                    { color: '#000000', label: 'Black' },
                                    { color: '#0033cc', label: 'Blue' },
                                    { color: '#cc0000', label: 'Red' }
                                ].map((c) => (
                                    <button
                                        key={c.color}
                                        onClick={() => setSigColor(c.color)}
                                        className={`h-6 w-6 rounded-full border-2 transition-all ${sigColor === c.color ? 'border-primary-500 scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                                        style={{ backgroundColor: c.color }}
                                        title={c.label}
                                    />
                                ))}
                                <button onClick={() => setIsModalOpen(false)} className="ml-4 text-slate-400 hover:text-slate-600">
                                    <ChevronLeft className="h-6 w-6 rotate-90" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8 bg-slate-50 dark:bg-slate-950/50">
                            {sigType === 'draw' ? (
                                <div className="bg-white rounded-[5px] border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner h-[280px]">
                                    <SignatureCanvas
                                        ref={sigPad}
                                        penColor={sigColor}
                                        canvasProps={{
                                            className: "w-full h-full cursor-crosshair"
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[5px] flex items-center justify-center h-[280px] shadow-sm">
                                        <input 
                                            type="text"
                                            value={typedName}
                                            onChange={(e) => setTypedName(e.target.value)}
                                            placeholder="Type your name here."
                                            className="absolute inset-0 w-full h-full bg-transparent text-center text-4xl outline-none focus:ring-2 focus:ring-primary-500/20 transition-all px-4 placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                            style={{ color: sigColor, fontFamily: '"Dancing Script", cursive' }}
                                        />
                                    </div>
                                </div>
                            )}
                            <p className="text-center text-[10px] text-slate-400 font-bold capitalize tracking-wide mt-4">
                                {sigType === 'draw' ? 'Signature Area' : 'Click inside the box to type your signature'}
                            </p>
                        </div>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-900">
                            {sigType === 'draw' && (
                                <button
                                    onClick={() => sigPad.current.clear()}
                                    className="px-6 py-2.5 rounded-[5px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] capitalize tracking-wide hover:bg-slate-200 transition-all"
                                >
                                    <RotateCcw className="h-3.5 w-3.5 inline mr-2" />
                                    Clear Pad
                                </button>
                            )}
                            <button
                                onClick={handleAcceptSignature}
                                className="px-8 py-2.5 rounded-[5px] bg-primary-600 text-white font-black text-[10px] capitalize tracking-wide shadow-lg shadow-primary-600/20 hover:bg-primary-500 transition-all"
                            >
                                Accept & Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignDocument;
