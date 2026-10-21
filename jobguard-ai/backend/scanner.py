import re

class RuleScanner:
    def __init__(self):
        # Define our hardcoded red flags using Regular Expressions (re)
        
        self.financial_triggers = re.compile(
            r'\b(wire transfer|zelle|crypto|cashapp|western union|deposit.*check|processing fee|equipment vendor)\b', 
            re.IGNORECASE
        )
        self.identity_triggers = re.compile(
            r'\b(social security|ssn|bank routing|passport copy|driver\'?s license|front and back)\b', 
            re.IGNORECASE
        )
        self.suspicious_contact = re.compile(
            r'\b(telegram|whatsapp|@yahoo\.com|@hotmail\.com|@aol\.com)\b', 
            re.IGNORECASE
        )
        self.urgency_triggers = re.compile(
            r'\b(urgent hire|hire on the spot|no interview.*required|fast money|earn.*week)\b', 
            re.IGNORECASE
        )

    def scan_posting(self, text: str) -> dict:
        """
        Scans a job description for hardcoded rules and returns a list of warnings.
        """
        warnings = []
        
        if self.financial_triggers.search(text):
            warnings.append("Suspicious financial request (e.g., Wire transfer, Zelle, Crypto).")
            
        if self.identity_triggers.search(text):
            warnings.append("Premature request for sensitive personal identity information (SSN, Bank Details).")
            
        if self.suspicious_contact.search(text):
            warnings.append("Unprofessional contact method detected (e.g., Telegram, free email domain).")
            
        if self.urgency_triggers.search(text):
            warnings.append("High-pressure urgency or suspicious compensation claims.")
            
        return {
            "flagged_by_rules": len(warnings) > 0,
            "rule_warnings": warnings
        }

# Quick test if you run this file directly
if __name__ == "__main__":
    test_scanner = RuleScanner()
    test_text = "Please send your SSN and wire the processing fee via Zelle to our Telegram handle."
    print(test_scanner.scan_posting(test_text))