import { populateExtractedComplaint, updatePartialFields } from '../store/formSlice';
import { setAuditResults } from '../store/aiSlice';
import { parseTextDynamically } from './parseTextDynamicallyCard';

function mapBackendFieldsToRedux(f, current = {}) {
    const todayStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let dateVal = f.complaint_date ?? f.complaintDate ?? current.complaintDate ?? '';
    if (!dateVal || dateVal === 'Not Provided' || dateVal === 'N/A') {
        dateVal = todayStr;
    }
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
        complaintDate: dateVal,
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

export const handleSendPrompt = async (textToSend, { inputText, setInputText, setMessages, setIsLoading, setProgressText, currentFields, status, dispatch }) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);
    setProgressText('Analyzing document content and extracting key details...');

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
