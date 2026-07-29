# AIVOA Complaint Management System — Implementation Specification

## Overview
An AI-powered Customer Complaint Management System for pharmaceutical manufacturing (API & FDF Quality Assurance Module). The system utilizes an interactive AI Copilot (powered by LangGraph and Groq LLMs) to extract complaint details from raw customer text or documents and automatically populate the QMS complaint logging form and risk assessment.

---

## Key Operating Rules
1. **Strict AI-Driven Form Population:** The form fields on the left panel **cannot** be filled manually. All fields must be automatically populated by the AI Assistant (LangGraph agent) upon analyzing user input (text/email/document upload).
2. **Interactive AI Copilot:** The right-side copilot processes natural language prompts and document uploads (PDF/DOCX/EML/TXT), providing structured feedback, status updates, and risk classification.
3. **QMS Ledger Persistence:** Clicking **"Commit to QMS Ledger"** saves the processed complaint record to the SQL database.

---

## Tech Stack Requirements
* **Frontend:** React UI with Redux state management, Google Inter font, Vanilla CSS styling matching reference visuals.
* **Backend:** Python with FastAPI.
* **AI Framework:** LangGraph agent workflow with Groq LLMs (`gemma2-9b-it` / `llama-3.3-70b-versatile`).
* **Database:** PostgreSQL (Neon DB).

---

## UI Layout & Component Architecture

### 1. Left Panel — "Log Customer Complaint"
* **Header:**
  * Title: `Log Customer Complaint`
  * Subtitle: `API & FDF Quality Assurance Module`
  * Status Badge: `Pending Triage` (Amber pill badge) ➔ transitions to `● Ready to Commit` (Green pill badge) upon successful AI extraction.

* **Section 1: ORIGIN & CUSTOMER DETAILS**
  * `Complaint Source` (Text input / Auto-extracted, e.g., "Pharmacy")
  * `Customer Name` (Text input / Auto-extracted, e.g., "Apollo Pharmacy")

* **Section 2: PRODUCT & BATCH IDENTIFICATION**
  * `Product Name (API/FDF)` (Auto-extracted, e.g., "Amoxicillin Capsules")
  * `Product Strength` (Auto-extracted, e.g., "500 mg")
  * `Batch / Lot Number` (Auto-extracted, e.g., "AMX240602")
  * `Affected Quantity` (Auto-extracted, e.g., "12 capsules")
  * `Manufacturing Date` (Auto-extracted, e.g., "March 2026")
  * `Expiry Date` (Auto-extracted, e.g., "February 2028")

* **Section 3: FACILITY & MATERIAL IMPACT**
  * `Originating Site Block` (Dropdown, e.g., "Manufacturing", "Packaging", "Quality Control")
  * `Impacted Non-Product Materials (NPM)` (Text input, e.g., "Primary Packaging (Bottle)")

* **Section 4: DEFECT ANALYSIS**
  * `Complaint Category` (Text input / Select, e.g., "Product Defect - Discoloration")
  * `Complaint Description` (Textarea: synthesized formal QMS complaint description)

* **Section 5: AI COPILOT RISK ASSESSMENT** *(Card with shield icon)*
  * `Severity (Suggested)` (Auto-classified: "Critical", "Major", "Minor")
  * `Suggested Next Action` (AI Recommendation, e.g., "Route to QA Investigation & Issue Replacement")
  * `Initial Risk Assessment` (AI Reasoning text, e.g., "Potential moisture ingress or primary packaging seal failure leading to capsule discoloration.")

* **Bottom Action:**
  * Full-width button: **`Commit to QMS Ledger`** (saves record to DB).

---

### 2. Right Panel — "AIVOA Copilot"
* **Header:**
  * Title: `AIVOA Copilot` with Flask icon and status indicator.
  * Subtitle: `Drop complaint files or paste text below.`
* **Chat / Workspace Feed:**
  * Bot Welcome Card: *"Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment."*
  * User Prompt Bubble (User input message).
  * Copilot Response Card (Confirmation & extraction summary): *"Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment..."*
* **Input Control Bar:**
  * Paperclip Icon (for uploading PDF/DOCX/EML/TXT documents).
  * Input field: *"Type a message or paste a complaint..."*
  * Submit button (purple checkmark/send icon).
  * Subtext: `POWERED BY LANGGRAPH`

---

## Backend & LangGraph Agent Architecture

### FastAPI Services & Routers
1. `POST /api/complaints/extract` — Accepts raw text or file upload, passes to LangGraph graph, returns extracted form fields and risk assessment.
2. `POST /api/complaints/chat` — Contextual chat endpoint for Q&A with the copilot.
3. `POST /api/complaints/commit` — Persists the finalized complaint to PostgreSQL DB.
4. `GET /api/complaints` — Retrieves log of complaints from DB.

### LangGraph Workflow Nodes
* **`extract_node`**: Uses Groq LLM to parse raw input text into structured JSON matching the form schema.
* **`risk_classifier_node`**: Analyzes defect description to suggest severity, next action, and risk explanation.
* **`duplicate_check_node`**: Checks existing database records for similar batch numbers or defect patterns.

---

## Interactive Conversational Correction & State Updates (Part 2 Workflow)

### Key Capability: Conversational State Editing
The user can send natural language correction messages to the AIVOA Copilot after initial extraction. The system must perform **stateful state updates**:
* **Preserve Unchanged Fields:** All previously extracted complaint information (Customer, Product, Manufacturing Date, Expiry Date, Site Block, Risk Assessment, etc.) must remain intact.
* **Partial Field Updates:** Only the fields specified in the follow-up prompt are updated.
* **Dynamic Re-Assessment:** If the updated fields affect risk or severity (e.g. quantity increased from 12 to 48 or batch number change), the AI re-evaluates risk as appropriate.

---

### Example Interaction & Visual Feedback

#### **User Follow-Up Prompt:**
> *"ah sorry the batch number is BMX240602 and affected quantity is 48 capcules"*

#### **AI Copilot Response Card:**
> **Checkmark message:** *"Got it. I have updated the Batch / Lot Number to "BMX240602" and the Affected Quantity to "48 capcules" in the form."*

#### **UI Visual Highlighting:**
* **Green Field Highlight:** Fields that were modified during the latest AI interaction (`Batch / Lot Number` and `Affected Quantity`) display a **light green border / background tint** to immediately draw attention to updated data.
* **Form State:**
  * `Batch / Lot Number`: updated from `"AMX240602"` to **`"BMX240602"`**
  * `Affected Quantity`: updated from `"12 capsules"` to **`"48 capcules"`**
  * `Customer Name`: retained as **`"Apollo Pharmacy"`**
  * `Product Name`: retained as **`"Amoxicillin Capsules"`**
  * `Manufacturing / Expiry Dates`: retained intact.

---

---

## Document Upload & Extraction Workflow (PDF / Email Parsing)

### Feature Overview
Users can upload pharmaceutical customer complaint documents (PDF, DOCX, TXT, EML) by clicking the paperclip icon in the AIVOA Copilot input bar. The system processes the document through an extraction pipeline (PDF parsing / OCR text extraction + LangGraph LLM parsing) to populate all form fields and risk assessment details automatically.

---

### Step-by-Step UI Flow

1. **File Selection:**
   * User clicks the **Paperclip Icon** in the Copilot chat input box.
   * Native File Browser opens permitting PDF, EML, DOCX, TXT selection (e.g. `Fictional_Pharma_Customer_Complaint_Report.pdf`, `Customer_Complaint_Email.eml`).

2. **Uploaded Document Card & Processing Status:**
   * The chat feed displays an **Uploaded Document Card**:
     * Icon: PDF/Doc icon
     * Name: `Fictional_Pharma_Customer_Complaint_Report.pdf`
     * Subtext: `PDF Document`
   * Progress status card renders immediately below:
     * Label: `"Extracting tabular data via OCR..."`
     * Animated blue extraction progress bar (0% ➔ 100%).

3. **Copilot Extraction Completion Message:**
   * Message card:
     > *"PDF analysis complete. I've successfully extracted the Zenith Life Sciences complaint report (CC-2026-00154). The issue is foreign matter contamination in the Metformin API drum. Form populated on the left."*

4. **Extracted Form Fields (Populated from Document):**
   * `Complaint Source`: **"Email"**
   * `Customer Name`: **"ABC Formulations Ltd."**
   * `Product Name`: **"Metformin Hydrochloride API"**
   * `Product Strength/Grade`: **"IP/BP"**
   * `Batch / Lot Number`: **"MFH260712A"**
   * `Affected Quantity`: **"25 kg (1 HDPE Drum)"**
   * `Manufacturing Date`: **"25 June 2026"**
   * `Expiry Date`: **"Not Provided"**
   * `Originating Site Block`: **"Manufacturing"**
   * `Impacted Non-Product Materials (NPM)`: **"HDPE Drum"**
   * `Complaint Category`: **"Foreign Matter Contamination"**

---

---

## Post-Extraction Natural Language Editing & UI Loading States

### Post-Document Correction Flow
* Even after a PDF or email document is extracted, the user can continue to refine or correct fields via natural language prompts (e.g., *"ah sorry the batch number is CHG 260712A and affected quantity is 50 kg (2 HDPE Drum)"*).
* The copilot processes the follow-up, updates the target fields, and preserves all other extracted document data.

### UI Loading & Thinking States
* **Typing Indicator Card:** While the LangGraph agent is processing text, documents, or corrections, a copilot message card displays an animated **`...`** (pulsing three dots) loading indicator.
* **Field Highlighting:** Updated fields highlight in light green upon completion.

### Dynamic Risk Assessment Rules
* **Minor/Major Defect (Discoloration):** Classified as `Severity: Major`, Next Action: *"Route to QA Investigation & Issue Replacement"*.
* **Critical Defect (Foreign Matter Contamination in API):** Classified as `Severity: Critical`, Next Action: *"Laboratory investigation & manufacturing record audit"*.



