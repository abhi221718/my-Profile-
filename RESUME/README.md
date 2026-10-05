# AI-Based Resume Analysis and Job Matching System Using Natural Language Processing

**Product name:** SkillMatch — AI Resume Analyzer & Job Matcher

An independent full-stack project linked from the portfolio's **Services → What I Offer → AI Resume Analyzer** card.

## What it does

- Accepts PDF and DOCX resumes (maximum 10 MB) and extracts selectable text.
- Cleans extracted text and looks for a candidate name, email, phone, skills, education, and experience indicators.
- Compares a resume with up to 10 job descriptions using scikit-learn TF-IDF and cosine similarity, combined with detected-skill coverage.
- Shows a transparent resume checklist score, matched and missing skills, job rankings, and practical improvement suggestions.
- Exports a CSV report or uses the browser's **Print / Save PDF** action.
- Optionally stores a small analysis summary in MongoDB. The application does not retain uploaded files or their full text; MongoDB history excludes resume text, email, and phone.

Scanned/image-only PDFs do not contain selectable text and need OCR before they can be analyzed. The match score and resume score are guidance, not a hiring decision or a trained job-suitability prediction model.

## Technology

- Frontend: React 19 and Vite
- API: Python 3.12.8, FastAPI, PyMuPDF, and python-docx
- NLP matching: scikit-learn TF-IDF and cosine similarity
- Optional history: MongoDB with PyMongo

## Run locally on Windows

Install Python 3.10+ and Node.js 20+ first. Open two PowerShell terminals in this `RESUME` folder.

### 1. Start the API

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API health check is at `http://127.0.0.1:8000/api/health`; interactive API docs are at `http://127.0.0.1:8000/docs`.

Run the backend unit tests from the `backend` folder with `python -m unittest discover -s tests`.

### 2. Start the React frontend

In the other terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL Vite prints (normally `http://localhost:5173`). Vite proxies `/api` requests to the FastAPI service on port 8000. MongoDB is optional; resume analysis and matching work without it.

## MongoDB history (optional)

Start a local MongoDB server, or create a MongoDB Atlas database. Copy `backend\.env.example` to `backend\.env` and set the connection details, or set these environment variables in the API terminal before starting Uvicorn:

```powershell
$env:MONGODB_URI = "mongodb://127.0.0.1:27017"
$env:MONGODB_DATABASE = "ai_resume_analyzer"
uvicorn app.main:app --reload --port 8000
```

For MongoDB Atlas, set `MONGODB_URI` to the Atlas connection URI instead. The API stores the filename, detected candidate name and skills, score, job titles, and match percentages; it does not store email, phone, or resume text. The `GET /api/history` endpoint returns the latest 20 saved summaries.

## Roadmap implementation

| Step | Roadmap item | Status |
| --- | --- | --- |
| 1 | Python / Node environment setup | Run commands and prerequisites documented above. |
| 2 | PDF / DOCX resume upload | Drag-and-drop or file picker; 10 MB limit. |
| 3 | Text extraction | PyMuPDF for PDF; python-docx for DOCX, including tables. |
| 4 | NLP text cleaning | Normalize whitespace and remove empty lines before analysis. |
| 5 | Skill extraction | Case-insensitive skill dictionary with common aliases. |
| 6 | ML job matching | TF-IDF cosine similarity combined with required-skill coverage; compare up to 10 jobs. |
| 7 | Resume score | 0–100 checklist covering contact details, sections, skills, and measurable outcomes. |
| 8 | React dashboard | Candidate details, score, skills, job matches, missing skills, and suggestions. |
| 9 | MongoDB | Optional, opt-in analysis-summary history using `MONGODB_URI`. |
| 10 | Final report | Download CSV or print / save the dashboard as PDF. |

### Matching and scoring notes

- When a job description contains recognized skills, its match score is 65% detected-skill coverage plus 35% TF-IDF cosine similarity. If no known skills are present, text similarity is used on its own.
- The resume score is a checklist, not an ML classification. The API returns each score component so the result can be explained.
- Skills not detected in the resume are presented as areas to build; only add them to a resume after gaining relevant experience.

## Deploying

The root-level `render.yaml` is a Render Blueprint for a free FastAPI web service named `skillmatch-api`. It installs the backend dependencies, starts Uvicorn, sets the GitHub Pages CORS origin, pins Python 3.12.8, and checks `/api/health`. MongoDB remains optional.

### Deploy the API on Render

1. Push the project files and `render.yaml` to the GitHub `master` or `main` branch.
2. Sign in to Render and choose **New → Blueprint**.
3. Connect the public `abhi221718/my-Profile-` GitHub repository and select the branch that contains `render.yaml`. Render reads the Blueprint and creates the `skillmatch-api` service.
4. Wait for the deployment to complete. Open the new service's URL plus `/api/health` and confirm it returns `{"status":"ok", ...}`. Copy the service's base URL, including `https://`, without a trailing slash.
5. In GitHub, open **Settings → Secrets and variables → Actions → Variables**, choose **New repository variable**, set the name to `VITE_API_BASE`, and set the value to the copied Render base URL.
6. Push or re-run the **Deploy static site to GitHub Pages** workflow. It builds the frontend with `VITE_API_BASE` and publishes both the original portfolio and the analyzer page.
7. Open the portfolio's **Services → What I Offer → AI Resume Analyzer** card. The API status should show online; upload a resume and compare it with a job description.

The GitHub Pages workflow publishes static files only; it cannot run FastAPI or MongoDB. The Render free web service may sleep while idle, so the first API request after inactivity can be slow. For optional analysis history, add `MONGODB_URI` as a secret in the Render service's environment settings (for example, a MongoDB Atlas connection string). The saved summary includes the filename, detected name and skills, score, job titles, and match percentages; it excludes resume text, email, and phone. The application reports whether history was saved. Do not commit MongoDB connection strings or other credentials.

### Current deployment prerequisites

Local project edits only become available for Render and GitHub Actions after the updated files are pushed to the connected GitHub branch. This workspace is a downloaded project folder without a Git repository, so it cannot push those updates to the account automatically. The hosting setup also requires signing in to Render and authorizing access to the GitHub repository.
