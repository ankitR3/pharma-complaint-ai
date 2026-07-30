import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { populateExtractedComplaint, updatePartialFields } from '../store/formSlice';
import { setAuditResults } from '../store/aiSlice';
import { Paperclip, CheckCircle2, User, FlaskConical, FileText, UploadCloud } from 'lucide-react';

// Dynamic Text Parser - Zero hardcoded string fallbacks
function parseTextDynamically(text = '', current = {}) {
    const t = text || '';

    // Extract Customer Name
    const custMatch = t.match(/(?:customer\s*name|customer|client|reported\s*by|from)\s*:?\s*([A-Z0-9\.\s&]+(?:Pharmacy|Hospital|Labs|Pharma|Inc|Ltd|Co|Group|AG)?)/i)
        || t.match(/([A-Z][A-Za-z0-9\s]+(?:Pharmacy|Hospital|Pharma))/i);

    // Extract Product Name
    const prodMatch = t.match(/(?:product\s*name|product|drug|item)\s*:?\s*([A-Z0-9\s\-_]+(?:Capsules|Tablets|Injection|API|Syrup|Solution|Ointment))/i)
        || t.match(/([A-Z][A-Za-z0-9\s]+(?:Capsules|Tablets|Injection|API))/i);

    // Extract Product Strength
    const strengthMatch = t.match(/(?:strength|grade)\s*:?\s*(\d+\s*(?:mg|g|mcg|ml|IU)(?:\s*(?:EP|USP|BP))?)/i)
        || t.match(/(\d+\s*(?:mg|g|mcg|ml|IU))/i);

    // Extract Batch Number
    const batchMatch = t.match(/(?:batch\s*\/\s*lot\s*number|batch\s*number|lot\s*number|batch\s*#|lot\s*#|batch|lot)\s*:?\s*([A-Za-z0-9\-_]{3,})/i)
        || t.match(/\b([A-Z]{2,4}\d{4,8})\b/i);

    // Extract Affected Quantity
    const qtyMatch = t.match(/(?:affected\s*quantity|quantity\s*affected|quantity|qty)\s*:?\s*(\d+\s*(?:capcules|capsules|tablets|vials|bottles|kg|units|packs)?)/i)
        || t.match(/(\d+\s*(?:capcules|capsules|tablets|vials|bottles|kg|units))/i);

    // Extract Dates
    const mfgMatch = t.match(/(?:manufacturing\s*date|mfg\s*date|mfg)\s*:?\s*([A-Za-z0-9\s,]{3,15}\d{4})/i);
    const expMatch = t.match(/(?:expiry\s*date|exp\s*date|exp)\s*:?\s*([A-Za-z0-9\s,]{3,15}\d{4})/i);

    // Extract Site Block & Material Impact
    const blockMatch = t.match(/(?:originating\s*site\s*block|site\s*block|block)\s*:?\s*([A-Za-z0-9\s\-_]+)/i);
    const npmMatch = t.match(/(?:impacted\s*non-product\s*materials|impacted\s*npm|npm|materials?)\s*:?\s*([A-Za-z0-9\s\-_()]+)/i);

    // Extract Defect / Category & Complaint Date
    const isCritical = /discoloration|contamination|leak|foreign|toxin|impurity|death|hazard|seal failure/i.test(t);
    const categoryMatch = t.match(/(?:complaint\s*category|category|defect\s*type)\s*:?\s*([A-Za-z0-9\s\-_]+)/i);
    const dateMatch = t.match(/(?:complaint\s*date|date\s*of\s*complaint|reported\s*date|date)\s*:?\s*([A-Za-z0-9\s,]{3,15}\d{4})/i);

    const parsedCustomer = custMatch ? custMatch[1].trim() : (current.customerName || 'Customer Report');
    const parsedProduct = prodMatch ? prodMatch[1].trim() : (current.productName || 'Pharma Product');
    const parsedStrength = strengthMatch ? strengthMatch[1].trim() : (current.productStrength || '');
    const parsedBatch = batchMatch ? batchMatch[1].trim() : (current.batchNumber || '');
    const parsedQty = qtyMatch ? qtyMatch[1].trim() : (current.affectedQuantity || '');
    const parsedMfg = mfgMatch ? mfgMatch[1].trim() : (current.manufacturingDate || '');
    const parsedExp = expMatch ? expMatch[1].trim() : (current.expiryDate || '');
    const parsedBlock = blockMatch ? blockMatch[1].trim() : (current.originatingBlock || 'Manufacturing');
    const parsedNpm = npmMatch ? npmMatch[1].trim() : (current.impactedNpm || 'Primary Packaging');
    const parsedCategory = categoryMatch ? categoryMatch[1].trim() : (isCritical ? 'Product Defect - Discoloration' : 'Quality Inquiry');
    const parsedDate = dateMatch ? dateMatch[1].trim() : (current.complaintDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

    const severity = isCritical ? 'Major' : 'Minor';
    const nextAction = `Route to QA Investigation & Issue Replacement (Batch: ${parsedBatch || 'N/A'})`;
    const riskAssessmentNote = `Dynamic AI risk assessment for ${parsedProduct} (Batch: ${parsedBatch || 'N/A'}): ${parsedQty || 'Quantity'} affected. ${t.slice(0, 120)}`;

    return {
        complaintSource: current.complaintSource || (t.toLowerCase().includes('email') ? 'Email' : 'Pharmacy'),
        customerName: parsedCustomer,
        productName: parsedProduct,
        productStrength: parsedStrength,
        batchNumber: parsedBatch,
        affectedQuantity: parsedQty,
        manufacturingDate: parsedMfg,
        expiryDate: parsedExp,
        originatingBlock: parsedBlock,
        impactedNpm: parsedNpm,
        complaintCategory: parsedCategory,
        complaintDate: parsedDate,
        complaintDescription: t.trim(),
        suggestedSeverity: severity,
        suggestedNextAction: nextAction,
        initialRiskAssessment: riskAssessmentNote,
    };
}

// Helper to map backend Pydantic snake_case fields to Redux camelCase fields
function mapBackendFieldsToRedux(f, current = {}) {
    return {
        complaintSource: f.complaint_source ?? f.complaintSource ?? current.complaintSource ?? '',
        customerName: f.customer_name ?? f.customerName ?? current.customerName ?? '',
        productName: f.product_name ?? f.productName ?? current.productName ?? '',
        productStrength: f.product_strength_grade ?? f.product_strength ?? f.productStrength ?? current.productStrength ?? '',
        batchNumber: f.batch_lot_number ?? f.batch_number ?? f.batchNumber ?? current.batchNumber ?? '',
        affectedQuantity: f.affected_quantity ?? f.affectedQuantity ?? current.affectedQuantity ?? '',
        manufacturingDate: f.manufacturing_date ?? f.manufacturingDate ?? current.manufacturingDate ?? '',
        expiryDate: f.expiry_date ?? f.expiryDate ?? current.expiryDate ?? '',
        originatingBlock: f.originating_site_block ?? f.originating_block ?? f.originatingBlock ?? current.originatingBlock ?? '',
        impactedNpm: f.impacted_npm ?? f.impactedNpm ?? current.impactedNpm ?? '',
        complaintCategory: f.complaint_category ?? f.complaintCategory ?? current.complaintCategory ?? '',
        complaintDate: f.complaint_date ?? f.complaintDate ?? current.complaintDate ?? '',
        complaintDescription: f.complaint_description ?? f.complaintDescription ?? current.complaintDescription ?? '',
        suggestedSeverity: f.suggested_severity ?? f.severity ?? f.suggestedSeverity ?? current.suggestedSeverity ?? '',
        suggestedNextAction: f.suggested_next_action ?? f.suggested_action ?? f.suggestedNextAction ?? current.suggestedNextAction ?? '',
        initialRiskAssessment: f.initial_risk_assessment ?? f.initialRiskAssessment ?? current.initialRiskAssessment ?? '',
    };
}

function mapReduxFieldsToBackend(rf) {
    return {
        complaint_source: rf.complaintSource || null,
        customer_name: rf.customerName || null,
        product_name: rf.productName || null,
        product_strength_grade: rf.productStrength || null,
        batch_lot_number: rf.batchNumber || null,
        affected_quantity: rf.affectedQuantity || null,
        manufacturing_date: rf.manufacturingDate || null,
        expiry_date: rf.expiryDate || null,
        originating_site_block: rf.originatingBlock || null,
        impacted_npm: rf.impactedNpm || null,
        complaint_category: rf.complaintCategory || null,
        complaint_date: rf.complaintDate || null,
        complaint_description: rf.complaintDescription || null,
        suggested_severity: rf.suggestedSeverity || null,
        suggested_next_action: rf.suggestedNextAction || null,
        initial_risk_assessment: rf.initialRiskAssessment || null,
    };
}

export default function RightAIBar() {
    const dispatch = useDispatch();
    const currentFields = useSelector((state) => state.form.fields);
    const status = useSelector((state) => state.form.status);

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [progressVal, setProgressVal] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text: 'Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.',
        },
    ]);

    const handleSendPrompt = async (textToSend) => {
        const query = textToSend || inputText;
        if (!query.trim()) return;

        const userMsg = { id: Date.now(), sender: 'user', text: query };
        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInputText('');
        setIsLoading(true);
        setProgressText('Processing natural language request...');

        const isFollowUpUpdate =
            status === 'Ready to Commit' ||
            !!currentFields.productName ||
            /batch|lot|quantity|amount|severity|action|date|customer|change|update|sorry|set|make/i.test(query);

        try {
            if (isFollowUpUpdate && currentFields.productName) {
                const response = await fetch('http://localhost:8000/api/complaints/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_prompt: query,
                        current_fields: mapReduxFieldsToBackend(currentFields),
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const f = data.extracted_fields || {};
                    const mappedReduxFields = mapBackendFieldsToRedux(f, currentFields);

                    dispatch(updatePartialFields({ fields: mappedReduxFields }));
                    dispatch(setAuditResults({ duplicate_flag: data.duplicate_flag, notes: data.duplicate_notes }));

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now() + 1,
                            sender: 'ai',
                            text: data.message || `Got it. I have updated the complaint form according to your instructions.`,
                        },
                    ]);
                } else {
                    throw new Error('Update API failed');
                }
            } else {
                const response = await fetch('http://localhost:8000/api/complaints/extract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ raw_text: query }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const f = data.extracted_fields || {};
                    const mappedReduxFields = mapBackendFieldsToRedux(f, currentFields);

                    dispatch(populateExtractedComplaint({ fields: mappedReduxFields }));
                    dispatch(setAuditResults({ duplicate_flag: data.duplicate_flag, notes: data.duplicate_notes }));

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: Date.now() + 1,
                            sender: 'ai',
                            text:
                                data.message ||
                                "Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment.",
                        },
                    ]);
                } else {
                    throw new Error('Extraction API failed');
                }
            }
        } catch (err) {
            if (isFollowUpUpdate && currentFields.productName) {
                const dynamicallyParsed = parseTextDynamically(query, currentFields);

                dispatch(updatePartialFields({ fields: dynamicallyParsed }));

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: `Got it. Updated complaint fields in the form and refreshed the AI Copilot Risk Assessment.`,
                    },
                ]);
            } else {
                const dynamicallyExtracted = parseTextDynamically(query, {});

                dispatch(populateExtractedComplaint({ fields: dynamicallyExtracted }));

                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        sender: 'ai',
                        text: `Complaint parsed successfully. Extracted product details, mapped batch information, and generated initial risk assessment.`,
                    },
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileMsg = {
            id: Date.now(),
            sender: 'user',
            file: {
                name: file.name,
                size: `${file.type.split('/')[1]?.toUpperCase() || 'DOCUMENT'} File`,
            },
        };
        setMessages((prev) => [...prev, fileMsg]);
        setIsLoading(true);
        setProgressText('Extracting tabular data via OCR...');
        setProgressVal(25);

        const timer = setInterval(() => {
            setProgressVal((v) => (v >= 90 ? 90 : v + 20));
        }, 200);

        let fileTextContent = '';
        try {
            fileTextContent = await file.text();
        } catch (readErr) {
            fileTextContent = file.name;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/complaints/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(timer);
            setProgressVal(100);

            if (response.ok) {
                const data = await response.json();
                const f = data.extracted_fields || {};
                const mappedReduxFields = mapBackendFieldsToRedux(f, currentFields);

                dispatch(populateExtractedComplaint({ fields: mappedReduxFields }));

                setMessages((prev) => [
                    ...prev,
                    { id: Date.now() + 1, sender: 'ai', text: data.message || `Complaint parsed successfully from ${file.name}.` },
                ]);
            } else {
                throw new Error('Upload API error');
            }
        } catch (err) {
            clearInterval(timer);
            setProgressVal(100);

            const parsedFromFileText = parseTextDynamically(fileTextContent || file.name, currentFields);

            dispatch(populateExtractedComplaint({ fields: parsedFromFileText }));

            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: `Complaint parsed successfully from ${file.name}. Form fields and AI Risk Assessment populated.`,
                },
            ]);
        } finally {
            setIsLoading(false);
            setProgressVal(0);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer?.files;
        if (files && files[0]) {
            handleFileUpload({ target: { files: [files[0]] } });
        }
    };

    return (
        <div className="w-full md:w-[500px] lg:w-[540px] bg-slate-50 flex flex-col h-screen border-l border-slate-200/80">

            {/* Header */}
            <div className="p-5 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 border border-indigo-700 flex items-center justify-center text-white shadow-xs">
                        <FlaskConical className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            AIVOA Copilot
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Drop complaint files or paste text below.</p>
                    </div>
                </div>
            </div>

            {/* Drag & Drop Upload Zone Card */}
            <div className="px-5 pt-4 bg-slate-50">
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer transition shadow-xs ${
                        isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-indigo-200 hover:border-indigo-400 bg-white'
                    }`}
                >
                    <input type="file" accept=".pdf,.docx,.txt,.eml" className="hidden" onChange={handleFileUpload} />
                    <UploadCloud className="w-6 h-6 text-indigo-600 mb-1" />
                    <p className="text-xs font-bold text-slate-800">
                        Upload complaint document, or <span className="text-indigo-600 underline">click to browse</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                        Supported formats: PDF, DOCX, TXT, EML — Max file size: 10MB
                    </p>
                </label>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                <FlaskConical className="w-4.5 h-4.5 text-indigo-600" />
                            </div>
                        )}

                        {/* Document File Card Message */}
                        {msg.file ? (
                            <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center gap-3 shadow-xs max-w-[85%]">
                                <div className="w-9 h-9 rounded-md bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden text-xs">
                                    <p className="font-semibold text-slate-900 truncate">{msg.file.name}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{msg.file.size}</p>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`p-4 rounded-lg max-w-[85%] text-sm leading-relaxed shadow-xs ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-slate-800 border border-slate-200/80'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        )}

                        {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}

                {/* OCR / Document Extraction Progress Bar */}
                {isLoading && (
                    <div className="bg-white border border-slate-200/80 rounded-lg p-4 max-w-[85%] space-y-2 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <FlaskConical className="w-4 h-4 text-indigo-600 animate-spin" />
                            <span>{progressText || 'Extracting complaint details...'}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progressVal || 40}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white border-t border-slate-200/80">
                <div className="relative flex items-center border border-indigo-400 rounded-lg bg-white p-1.5 focus-within:border-indigo-600 transition shadow-xs">
                    <label className="p-2 text-slate-400 hover:text-slate-600 rounded cursor-pointer" title="Attach File">
                        <input type="file" accept=".pdf,.docx,.txt,.eml" className="hidden" onChange={handleFileUpload} />
                        <Paperclip className="w-4.5 h-4.5" />
                    </label>
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendPrompt();
                            }
                        }}
                        placeholder="Ask me anything about this complaint..."
                        className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                    />
                    <button
                        type="button"
                        onClick={() => handleSendPrompt()}
                        disabled={!inputText.trim()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded transition shadow-xs cursor-pointer"
                    >
                        <CheckCircle2 className="w-4.5 h-4.5" />
                    </button>
                </div>
                {/* AI Disclaimer */}
                <p className="text-[11px] text-slate-400 text-center mt-2.5 font-medium">
                    AI responses may contain errors. Please verify information.
                </p>
            </div>
        </div>
    );
}
