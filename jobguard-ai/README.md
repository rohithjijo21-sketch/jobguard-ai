# JobGuard AI

React + Vite frontend for the existing Flask risk engine in the parent folder. Includes ten-field submissions, fictional samples, model confidence, heuristic alerts, safety guidance, light/dark themes, cancellation, retry, and stale-result protection.

## Prerequisites and installation

Install Node.js 22.12+ (Node 24 recommended) and npm or pnpm. In PowerShell:

```powershell
cd 'C:\Users\Rohith\OneDrive\Desktop\MY WORKSPACE\PROJECTS\jobguard-ai'
npm install
Copy-Item .env.example .env
npm run dev
```

Alternatively use `pnpm install` and `pnpm dev`. The included pnpm lockfile records verified versions. Open the local URL Vite prints, normally http://localhost:5173.

Run the existing Flask backend in a second terminal:

```powershell
cd 'C:\Users\Rohith\OneDrive\Desktop\MY WORKSPACE\PROJECTS'
.\.venv\Scripts\python.exe app.py
```

For a fresh Python environment, install the parent requirements with `python -m pip install -r requirements.txt`. Keep model.pkl and vectorizer.pkl alongside app.py. Existing artifacts do not require retraining.

## Environment and integration

Set `VITE_API_BASE_URL=http://localhost:5000` in .env. Restart Vite after changes. Use only the server base URL; the client appends `/api/analyze`. Vite variables are public: never put API secrets in them.

The app calls Flask directly using the backend's existing `CORS(app)` configuration, without a Vite proxy. Restrict backend CORS to your frontend origin for deployment. The backend has no health endpoint. Connectivity starts Unverified and changes after a real analysis request; no dummy analysis requests are sent. HTTP errors establish reachability, while network/CORS failures show Disconnected.

Only title and description are mandatory. Requests contain exactly the ten snake_case keys in app.py, with trimmed string values. Optional selects start empty. Responses must include string status, boolean is_fraudulent, finite numeric ml_confidence, and an array of string rule_warnings. Confidence is already a percentage, and display values are clamped to 0–100. The boolean controls the verdict; contradictory status labels are hidden and the original response is retained in memory for diagnostics.

Backend nuance: heuristic rules may override the ML classification. The ML confidence therefore does not necessarily describe the final, rule-escalated verdict. The interface explains this. No external company verification is performed.

## Tests and production build

```powershell
npm test
npm run build
npm run preview
```

Or use `pnpm test`, `pnpm build`, and `pnpm preview`. Unit tests mock fetch and do not need Flask. They cover form validation, samples, clearing, exact payload, loading, duplicate prevention, both verdicts, confidence, warnings, empty warnings, network and response failures, HTTP errors, timeout, cancellation, stale results, and theme persistence.

If managed pnpm attempts to reinstall or encounters Windows symlink restrictions, invoke installed tools directly:

```powershell
node node_modules/vitest/vitest.mjs run
node node_modules/vite/bin/vite.js build
node node_modules/vite/bin/vite.js --host 127.0.0.1
```

## Deploy on Vercel

1. Commit the frontend to GitHub, excluding .env, node_modules, and dist.
2. Import that repository into Vercel and select the Vite framework preset.
3. Set Root Directory to `jobguard-ai` if the repository contains the whole workspace. If it contains only the frontend contents, use the repository root.
4. Set build command `npm run build` (or `pnpm build`), output directory `dist`.
5. Set `VITE_API_BASE_URL` to the separately hosted HTTPS Flask base URL.
6. Deploy, then configure Flask CORS to allow the deployed frontend origin.
7. Test a real posting. Redeploy after changing any Vite environment variable.

Frontend deployment does not deploy Flask, dependencies, or model artifacts. Deploy Flask separately on Python-capable hosting, include model.pkl/vectorizer.pkl, disable debug mode, and use a production WSGI server. Public visitors cannot use your localhost API URL: localhost points at each visitor's computer. Use HTTPS for both services.

## Troubleshooting

- **Connection refused:** start Flask separately and check port 5000.
- **CORS error:** confirm the backend allows the actual frontend origin. Browser fetch cannot reliably distinguish CORS from a network failure. An HTTPS frontend must call an HTTPS backend.
- **Wrong endpoint/404:** use a base URL without `/api/analyze`. The route supports POST; opening it in an address bar sends GET.
- **Invalid JSON:** inspect backend logs and response formatting. Missing/malformed properties show an error, never a safe verdict.
- **Wrong environment variable:** use exactly VITE_API_BASE_URL, restart Vite, and rebuild production.
- **Deployment changes absent:** check the selected commit and Root Directory; redeploy after environment changes and refresh the browser cache.
- **Timeout:** requests cancel after 30 seconds. Restore backend availability and retry manually.

## Structure and privacy

UI components are in src/components, API requests in src/services/api.js, samples in src/data, and input/response validation in src/utils. Tests are in src/test. The frontend preserves the existing Python backend.

Only theme preference is stored in localStorage. Job details and results stay in React memory and are transmitted to your configured backend. This does not imply backend non-retention or encryption. Avoid sharing personal information. Fictional samples do not guarantee model predictions. Results are advisory.

## Full-stack Vercel package

The deployment now includes `api/analyze.py`, which imports the existing Flask application copied into `backend/`. That folder contains the scanner and the two trained model artifacts. The parent workspace backend remains unchanged. The training CSV is excluded.

`.env.production` sets `VITE_API_BASE_URL=/` to call the deployed function on the website's own domain. Local Vite development still defaults to localhost:5000. `vercel.json` configures Vite and the Python function. `.python-version` selects Python 3.12, and requirements.txt pins model runtime dependencies. The first hosted deployment must confirm Linux/Python package compatibility.

From this frontend folder, run `npx vercel login`, then `npx vercel --prod`. Select the intended account/team and project, using the Vite preset. CLI deployment does not require GitHub. The generated .vercel directory is gitignored.

Verify both the website and POST /api/analyze after deployment; a static build alone does not verify the model function. Flask debug mode is disabled because the server module is imported. Update copied backend files and model artifacts if the parent implementation changes. The production API environment variable can be overridden if you later host Flask separately.

## Compact hosted model runtime

The deployed Python function uses `backend/inference.py` and `backend/inference.json` rather than importing scikit-learn, NumPy, SciPy, or pandas. The JSON is exported from the original fitted model.pkl/vectorizer.pkl, retaining vocabulary, IDF values, coefficients, intercept, class order, stop words, token pattern, and n-gram settings. The standard-library implementation applies the same sublinear TF, IDF weighting, L2 normalization, and binary logistic decision function. The heuristic scanner and API response contract are unchanged.

This reduces the function bundle to fit the standard Vercel deployment limit without enabling larger-function settings. The original local backend is preserved. The .pkl files in backend are excluded from upload. If retraining the model, re-export inference.json and verify equivalence before deploying.

`backend/test_inference.py` compares the compact inference against the original model on 1,000 reproducibly sampled dataset rows plus six edge cases. Run it using the parent Python environment, which has the original model dependencies:

```powershell
.\.venv\Scripts\python.exe jobguard-ai/backend/test_inference.py
```

Verified: all 1,006 predictions and confidence values rounded to two decimals matched; maximum raw confidence percentage difference was below 5e-14. The test script and training CSV are not deployed. requirements.txt for the hosted function now needs only Flask and flask-cors.
