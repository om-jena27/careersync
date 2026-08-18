import io
import pdfplumber
from docx import Document

def parse_file(filename: str, content: bytes) -> str:
    """
    Parses a file (PDF, DOCX, TXT) from raw bytes and returns its text content.
    """
    ext = filename.split(".")[-1].lower()
    
    if ext == "pdf":
        return parse_pdf(content)
    elif ext in ["docx", "doc"]:
        return parse_docx(content)
    elif ext in ["txt", "md"]:
        return parse_txt(content)
    else:
        raise ValueError(f"Unsupported file type: .{ext}. Supported types: .pdf, .docx, .txt")

def parse_pdf(content: bytes) -> str:
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise RuntimeError(f"Error parsing PDF file: {str(e)}")

def parse_docx(content: bytes) -> str:
    try:
        doc = Document(io.BytesIO(content))
        text = []
        for para in doc.paragraphs:
            if para.text:
                text.append(para.text)
        return "\n".join(text).strip()
    except Exception as e:
        raise RuntimeError(f"Error parsing DOCX file: {str(e)}")

def parse_txt(content: bytes) -> str:
    try:
        return content.decode("utf-8", errors="ignore").strip()
    except Exception as e:
        raise RuntimeError(f"Error parsing TXT file: {str(e)}")
