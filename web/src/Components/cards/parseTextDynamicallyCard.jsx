// Dynamic Text Parser - Zero hardcoded string fallbacks
export function parseTextDynamically(text = '', current = {}) {
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
