import imaplib
import email
from email.header import decode_header
import json
import re
from datetime import datetime
from html.parser import HTMLParser

EMAIL = "1737370459@qq.com"
PASSWORD = "oaepkmpfqywgdief"
IMAP_SERVER = "imap.qq.com"
IMAP_PORT = 993
PROCESSED_FILE = "processed.json"

class Web3FormsParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_value = False
        self.current_label = ""
        self.values = {}
        self.labels = []

    def handle_data(self, data):
        data = data.strip()
        if not data:
            return
        if data.endswith(":"):
            self.current_label = data[:-1].strip()
        elif self.current_label:
            self.values[self.current_label] = data
            self.current_label = ""

def get_unread_inquiries():
    """获取未读的数源科技需求邮件"""
    mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
    mail.login(EMAIL, PASSWORD)
    result, data = mail.select("INBOX")
    
    if result != "OK":
        mail.logout()
        return []

    # 搜索来自web3forms的未读邮件
    status, messages = mail.search(None, 'UNSEEN')
    if status != "OK" or not messages[0]:
        mail.logout()
        return []

    results = []
    for num in messages[0].split():
        status, data = mail.fetch(num, "(RFC822)")
        if status != "OK":
            continue

        msg = email.message_from_bytes(data[0][1])
        subject = decode_header(msg["Subject"])[0][0]
        if isinstance(subject, bytes):
            subject = subject.decode("utf-8", errors="ignore")
        
        # Check if it's a web3forms email
        if "数源科技" not in subject and "Web3Forms" not in str(subject):
            continue

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                if content_type == "text/html":
                    charset = part.get_content_charset() or "utf-8"
                    body = part.get_payload(decode=True).decode(charset, errors="ignore")
                    break
                elif content_type == "text/plain":
                    charset = part.get_content_charset() or "utf-8"
                    body = part.get_payload(decode=True).decode(charset, errors="ignore")
        else:
            charset = msg.get_content_charset() or "utf-8"
            body = msg.get_payload(decode=True).decode(charset, errors="ignore")

        # Parse HTML to extract fields
        info = parse_web3forms_html(body)
        info["subject"] = str(subject)
        results.append(info)

        # Mark as read
        mail.store(num, "+FLAGS", "\\Seen")

    mail.logout()
    return results

def parse_web3forms_html(body):
    """从web3forms HTML邮件中提取客户信息"""
    info = {
        "name": "",
        "phone": "",
        "email": "",
        "company": "",
        "service": "",
        "message": ""
    }
    
    # Try regex on stripped HTML first
    text = re.sub(r'<[^>]+>', ' ', body)
    text = re.sub(r'\s+', ' ', text).strip()
    
    patterns = {
        "name": r"Name[：:\s]+([^\n]+?)(?:\s*(?:Phone|Email|Company|Service|Message|$))",
        "phone": r"Phone[：:\s]+([^\n]+?)(?:\s*(?:Email|Company|Service|Message|$))",
        "email": r"Email[：:\s]+([^\n]+?)(?:\s*(?:Company|Service|Message|$))",
        "company": r"Company[：:\s]+([^\n]+?)(?:\s*(?:Service|Message|$))",
        "service": r"Service[：:\s]+([^\n]+?)(?:\s*(?:Message|$))",
        "message": r"Message[：:\s]+([\s\S]+?)$",
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            info[key] = match.group(1).strip()
    
    # If regex didn't work well, try HTML parser approach
    if not info["name"]:
        # Look for table cells with field labels
        fields = re.findall(r'(?:Name|Phone|Email|Company|Service|Message)\s*[：:]\s*([^<\n]+)', body)
        field_names = ["name", "phone", "email", "company", "service", "message"]
        for i, val in enumerate(fields):
            if i < len(field_names):
                info[field_names[i]] = val.strip()
    
    return info

def load_processed():
    try:
        with open(PROCESSED_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_processed(ids):
    with open(PROCESSED_FILE, "w") as f:
        json.dump(ids, f, ensure_ascii=False)

if __name__ == "__main__":
    inquiries = get_unread_inquiries()
    for i in inquiries:
        print(json.dumps(i, ensure_ascii=False, indent=2))
    if not inquiries:
        print("NO_NEW_INQUIRIES")
