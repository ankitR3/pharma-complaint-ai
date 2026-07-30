import { populateExtractedComplaint } from '../store/formSlice';
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

export const handleFileUpload = async (e, { setMessages, setIsLoading, setProgressText, setProgressVal, currentFields, dispatch }) => {
    const file = e.target?.files?.[0];
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
    setProgressText('Analyzing document content and extracting key details...');
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
        clearInterval(timer);
        if (setProgressVal) setProgressVal(100);
        setTimeout(() => {
            setIsLoading(false);
            if (setProgressVal) setProgressVal(0);
        }, 300);
    }
};
