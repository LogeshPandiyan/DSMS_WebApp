import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { PenTool, Trash2, Save, Loader2, Upload } from 'lucide-react';

const SIGNATURE_TYPE_OPTIONS = [
    { 
        id: 'draw', 
        label: 'DRAW' 
    },
    { 
        id: 'upload', 
        label: 'UPLOAD' 
    }
];

const SignatureTab = ({ 
    sigType, 
    setSigType, 
    sigPad, 
    userData, 
    clearSignature, 
    saveSignature, 
    loading, 
    uploadedSignature, 
    handleSignatureUpload 
}) => {
    const fileInputRef = useRef(null);
    
    return (
        <div className="space-y-10 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="h-8 w-8 rounded-[5px] bg-primary-600/10 flex items-center justify-center">
                        <PenTool className="h-4 w-4 text-primary-600" />
                    </div>
                    <span>
                        Digital signature
                    </span>
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                    Create and manage your official signature for document signing.
                </p>
            </div>

            <div className="space-y-6">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-[5px] w-fit">
                    {SIGNATURE_TYPE_OPTIONS.map((signatureOption) => (
                        <button
                            key={signatureOption.id}
                            onClick={() => setSigType(signatureOption.id)}
                            className={`px-6 py-2 rounded-[4px] text-[11px] font-medium tracking-widest transition-all ${
                                sigType === signatureOption.id 
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {signatureOption.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] p-6 shadow-sm">
                    {sigType === 'draw' ? (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[5px] overflow-hidden bg-slate-50/50 flex justify-center touch-none">
                                <SignatureCanvas
                                    ref={sigPad}
                                    penColor="#000"
                                    clearOnResize={false}
                                    canvasProps={{ 
                                        width: 600, 
                                        height: 200, 
                                        className: 'signature-canvas max-w-full' 
                                    }}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <button 
                                    onClick={clearSignature} 
                                    className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-[11px] font-medium tracking-wide transition-colors"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>
                                        Clear canvas
                                    </span>
                                </button>
                                <button 
                                    onClick={saveSignature}
                                    disabled={loading}
                                    style={{ backgroundColor: '#12b79f' }}
                                    className="text-white px-6 py-2.5 rounded-[5px] text-[11px] font-medium tracking-wide flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            <span>
                                                Saving signature...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-3.5 w-3.5" />
                                            <span>
                                                Save signature
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div 
                                className={`h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[5px] flex flex-col items-center justify-center gap-3 bg-slate-50/50 group cursor-pointer transition-colors ${!uploadedSignature ? 'hover:bg-slate-100' : ''}`}
                                onClick={() => !uploadedSignature && fileInputRef.current?.click()}
                            >
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleSignatureUpload} 
                                />
                                {uploadedSignature ? (
                                    <div className="h-full w-full p-2 relative flex items-center justify-center group-hover:opacity-90">
                                        <img 
                                            src={uploadedSignature} 
                                            alt="Uploaded signature" 
                                            className="max-h-full max-w-full object-contain" 
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-10 w-10 rounded-full bg-primary-600/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="h-5 w-5 text-primary-600" />
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500">
                                            Click to browse or <span className="text-primary-600">upload signature</span>
                                        </p>
                                    </>
                                )}
                            </div>
                            
                            {/* Actions for Upload Mode */}
                            <div className="flex justify-between items-center h-10">
                                {uploadedSignature && (
                                    <button 
                                        onClick={clearSignature} 
                                        className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-[11px] font-medium tracking-wide transition-colors"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>
                                            Clear image
                                        </span>
                                    </button>
                                )}
                                
                                <div className="ml-auto">
                                    <button 
                                        onClick={saveSignature}
                                        disabled={loading || !uploadedSignature}
                                        style={{ backgroundColor: '#12b79f' }}
                                        className="text-white px-6 py-2.5 rounded-[5px] text-[11px] font-medium tracking-wide flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                <span>
                                                    Saving uploaded signature...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-3.5 w-3.5" />
                                                <span>
                                                    Save uploaded signature
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {userData?.signature && (
                    <div className="space-y-3">
                        <label className="text-[11px] font-medium tracking-widest text-slate-400">
                            Current signature
                        </label>
                        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[5px] w-fit shadow-sm">
                            <img 
                                src={userData.signature} 
                                alt="Current Signature" 
                                className="max-h-16 grayscale opacity-80" 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignatureTab;
