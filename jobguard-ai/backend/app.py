import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from .scanner import RuleScanner

# 1. Initialize Flask App and CORS (allows React frontend to communicate)
app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. Load the exported fitted model using dependency-free inference.
from .inference import analyze_text

# 3. Initialize the Rule-Based Scanner
scanner = RuleScanner()

# The expected keys from the React frontend JSON payload
TEXT_COLUMNS = [
    "title", "company_profile", "description", "requirements", "benefits",
    "employment_type", "required_experience", "required_education", "industry", "function"
]

@app.route('/api/analyze', methods=['POST'])
def analyze_job():
    data = request.json
    
    if not data:
        return jsonify({"error": "No JSON payload provided"}), 400

    # 1. Extract and combine the structured input into the Master Text format
    extracted_text = []
    for col in TEXT_COLUMNS:
        # Get the value, default to empty string if missing, and clean it
        value = str(data.get(col, "")).strip()
        extracted_text.append(value)
        
    master_text = " ".join(extracted_text)
    
    if not master_text.strip():
         return jsonify({"error": "Job details cannot be completely empty"}), 400

    # 2. Run the Rule-Based Heuristic Scanner
    scanner_results = scanner.scan_posting(master_text)
    
    # 3. Run the Machine Learning Model
    ml_prediction, confidence_score = analyze_text(master_text)

    # 4. Determine Final Threat Level
    # If the rules flag it, escalate the threat level even if ML missed it
    is_fraudulent = ml_prediction == 1 or scanner_results["flagged_by_rules"]
    
    status = "High-Risk Scam" if is_fraudulent else "Legitimate Job"

    # 5. Return the JSON response to the frontend
    return jsonify({
        "status": status,
        "is_fraudulent": is_fraudulent,
        "ml_confidence": round(confidence_score, 2),
        "rule_warnings": scanner_results["rule_warnings"]
    })

if __name__ == '__main__':
    print("Starting JobGuard AI Backend on http://localhost:5000...")
    app.run(debug=True, port=5000)