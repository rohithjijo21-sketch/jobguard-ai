import os
import logging
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# Configure logging for production visibility
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LABEL_COLUMN = "fraudulent"
TEXT_COLUMNS = [
    "title", 
    "company_profile", 
    "description", 
    "requirements", 
    "benefits",
    "employment_type", 
    "required_experience", 
    "required_education",
    "industry", 
    "function"
]

def load_dataset(csv_path: str) -> pd.DataFrame:
    """Safely finds, loads, validates, and cleans the training dataset."""
    resolved_path = csv_path
    if not os.path.isabs(resolved_path) or not os.path.exists(resolved_path):
        candidates = [
            csv_path,
            os.path.join(BASE_DIR, csv_path),
            os.path.join(BASE_DIR, "fake_job_postings.csv")
        ]
        for candidate in candidates:
            if os.path.exists(candidate):
                resolved_path = candidate
                break

    logger.info("Loading dataset from %s", resolved_path)
    df = pd.read_csv(resolved_path)

    missing = [c for c in TEXT_COLUMNS + [LABEL_COLUMN] if c not in df.columns]
    if missing:
        raise ValueError(
            f"CSV is missing expected column(s): {missing}. "
            f"Expected at least: {TEXT_COLUMNS + [LABEL_COLUMN]}"
        )

    for col in TEXT_COLUMNS:
        df[col] = df[col].fillna("")

    df[LABEL_COLUMN] = df[LABEL_COLUMN].astype(int)
    return df

def build_text_column(df: pd.DataFrame) -> pd.Series:
    """Concatenate the separate posting fields into one master blob of text."""
    return df[TEXT_COLUMNS].agg(" ".join, axis=1)

if __name__ == "__main__":
    # 1. Load Data
    df = load_dataset("fake_job_postings.csv")
    
    # 2. Prepare Features and Labels
    logger.info("Building Master Text column...")
    X = build_text_column(df)
    y = df[LABEL_COLUMN]
    
    # 3. Train-Test Split (Stratified to maintain 95/5 ratio)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    logger.info(f"Data split: {len(X_train)} training samples, {len(X_test)} test samples.")

    # 4. Text Vectorization (N-Grams to catch word phrases)
    logger.info("Vectorizing text with TF-IDF (N-Grams 1-2)...")
    vectorizer = TfidfVectorizer(stop_words='english', max_features=5000, ngram_range=(1, 2), sublinear_tf=True)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # 5. Model Training (Logistic Regression with Balanced Weights)
    logger.info("Training Logistic Regression model...")
    model = LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42)
    model.fit(X_train_vec, y_train)

    # 6. Evaluation
    logger.info("Evaluating model on test data...")
    y_pred = model.predict(X_test_vec)
    print("\n--- Confusion Matrix ---")
    print(confusion_matrix(y_test, y_pred))
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred))

    # 7. Export Artifacts for the Flask Backend
    logger.info("Exporting vectorizer and model to .pkl files...")
    joblib.dump(vectorizer, os.path.join(BASE_DIR, "vectorizer.pkl"))
    joblib.dump(model, os.path.join(BASE_DIR, "model.pkl"))
    logger.info("Pipeline complete! Artifacts are ready for the web app.")