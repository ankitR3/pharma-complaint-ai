import io
import logging
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split(".")[-1]
    
    if ext == "pdf":
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            if text.strip():
                return text
        except Exception as e:
            logger.error(f"Error parsing PDF with pypdf: {e}")

    elif ext in ["eml", "txt", "docx"]:
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error decoding text file: {e}")

    # Fallback to UTF-8 decoding if available
    try:
        return file_bytes.decode("utf-8", errors="ignore")
    except Exception:
        return f"Document filename: {filename}"
