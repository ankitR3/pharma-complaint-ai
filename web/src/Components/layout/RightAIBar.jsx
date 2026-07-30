import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { populateExtractedComplaint, updatePartialFields } from '../store/formSlice';
import { setAuditResults } from '../store/aiSlice';
import { Paperclip, CheckCircle2, User, FlaskConical, FileText, UploadCloud, Info } from 'lucide-react';
import { parseTextDynamically } from '../cards/parseTextDynamicallyCard';
import { handleSendPrompt } from '../cards/SendPromptCard';
import { handleFileUpload } from '../cards/FileUploadCard';

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
            handleFileUpload({ target: { files: [files[0]] } }, { setMessages, setIsLoading, setProgressText, setProgressVal, currentFields, dispatch });
        }
    };

    return (
        <div className="w-full md:w-[500px] lg:w-[540px] bg-slate-50 flex flex-col h-screen border-l border-slate-200/80">

            {/* Header */}
            <div className="p-5 bg-white border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-indigo-600 border border-indigo-700 flex items-center justify-center text-white shadow-xs">
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
            <div className="px-5 pt-4 bg-slate-50 space-y-3">
                <label
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-md p-5 flex flex-col items-center justify-center text-center cursor-pointer transition shadow-xs ${
                        isDragging ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                >
                    <input type="file" accept=".pdf,.docx,.txt,.eml" className="hidden" onChange={(e) => handleFileUpload(e, { setMessages, setIsLoading, setProgressText, setProgressVal, currentFields, dispatch })} />
                    <UploadCloud className="w-7 h-7 text-slate-500 mb-1.5" />
                    <p className="text-xs font-bold text-slate-800">
                        Drag & drop complaint document here
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                        or <span className="text-indigo-600 font-semibold underline">click to browse</span>
                    </p>
                </label>

                {/* OR Divider Line */}
                <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="shrink-0 mx-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Paste Complaint Text / Email Button */}
                <button
                    type="button"
                    onClick={() => {
                        const inputEl = document.querySelector('input[placeholder*="Ask me"]');
                        if (inputEl) inputEl.focus();
                    }}
                    className="w-full py-2.5 bg-white border border-slate-200 rounded-md text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs focus:outline-none focus:ring-0 active:bg-white select-none cursor-default"
                >
                    <FileText className="w-4 h-4 text-slate-500" />
                    Paste Complaint Text / Email
                </button>

                {/* Green Supported Formats Info Card */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-md p-3 flex items-start gap-2.5 text-xs text-emerald-800 shadow-xs">
                    <Info className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-emerald-900">Supported formats: PDF, DOCX, TXT, EML</p>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Max file size: 10MB</p>
                    </div>
                </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-md bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                <FlaskConical className="w-4.5 h-4.5 text-indigo-600" />
                            </div>
                        )}

                        {/* Document File Card Message */}
                        {msg.file ? (
                            <div className="bg-white border border-slate-200 rounded-md p-3.5 flex items-center gap-3 shadow-xs max-w-[85%]">
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
                                className={`p-4 rounded-md max-w-[85%] text-sm leading-relaxed shadow-xs ${msg.sender === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-slate-800 border border-slate-200/80'
                                    }`}
                            >
                                {msg.text}
                            </div>
                        )}

                        {msg.sender === 'user' && (
                            <div className="w-8 h-8 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}

                {/* OCR / Document Extraction Progress Bar */}
                {isLoading && (
                    <div className="bg-white border border-slate-200/80 rounded-md p-4 max-w-[85%] space-y-2 shadow-xs">
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
                <div className="relative flex items-center border border-slate-200 rounded-md bg-white p-1.5 focus-within:border-slate-300 transition shadow-xs">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendPrompt(undefined, { inputText, setInputText, setMessages, setIsLoading, setProgressText, currentFields, status, dispatch });
                            }
                        }}
                        placeholder="Ask me anything about this complaint..."
                        className="flex-1 bg-transparent px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none placeholder-slate-400"
                    />
                    <button
                        type="button"
                        onClick={() => handleSendPrompt(undefined, { inputText, setInputText, setMessages, setIsLoading, setProgressText, currentFields, status, dispatch })}
                        disabled={!inputText.trim()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-md transition shadow-xs cursor-pointer"
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
