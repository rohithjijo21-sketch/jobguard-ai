# JobGuard AI

A job-posting risk assessment application with a React frontend, Flask API, a trained TF-IDF/logistic-regression model, and a rule-based scanner.

**Live website:** https://jobguard-ai-five.vercel.app

## Repository layout

- `jobguard-ai/`: React + Vite frontend, tests, generated logo, and Vercel deployment package.
- `app.py` and `scanner.py`: original local Flask backend and heuristic scanner.
- `train_model.py`: training pipeline.
- `model.pkl` and `vectorizer.pkl`: original fitted model artifacts.
- `fake_job_postings.csv`: training dataset used by the pipeline.
- `requirements.txt`: original local Python environment dependencies.

## Run locally

Use Python 3.11+ and Node.js 22.12+.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

In another terminal:

```powershell
cd jobguard-ai
npm install
Copy-Item .env.example .env
npm run dev
```

The local frontend calls http://localhost:5000/api/analyze. Both title and description are required. Other fields are optional.

## Verify

```powershell
cd jobguard-ai
npm test
npm run build
```

The compact hosted model can be compared with the original model from the repository root:

```powershell
.\.venv\Scripts\python.exe jobguard-ai/backend/test_inference.py
```

It was verified against 1,006 postings, with identical predictions and confidence values rounded to two decimals.

## Deployment

The Vercel project root is **jobguard-ai**, not this repository root. That folder includes vercel.json, api/analyze.py, the model export, and .env.production. Production uses the same-domain /api/analyze endpoint. Deploy from that folder with `vercel deploy --prod` after linking the existing project.

The hosted API uses a compact standard-library inference implementation exported from the existing fitted model. This avoids large scientific-library deployment bundles without retraining or changing the heuristic scanner. Original backend/model files remain at the repository root. See jobguard-ai/README.md for details.

## Safety and privacy

Predictions are advisory and do not verify employers or guarantee legitimacy. Submitted posting content is not saved in browser storage. It is sent to the configured analysis server. Only the theme preference is saved locally.

The fictional sample listings are for testing. No API secrets are needed in the frontend. Local credentials, dependency folders, Python environments, and build artifacts are excluded from Git.
