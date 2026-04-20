# DiabCheck — Complete Project Study Guide
## Diabetes Risk Checker: A Full Technical & Conceptual Reference for Presentation Preparation

---

> **How to use this guide:**  
> Read it from top to bottom at least once. Every section builds on the previous one.  
> The final section contains real questions that judges/mentors typically ask, along with model answers drawn directly from the code.

---

# PART 1: WHAT IS THIS PROJECT?

## 1.1 Project Summary

**DiabCheck** is an AI-powered web application that estimates a person's risk of developing diabetes. A user enters 7 health measurements (like blood sugar level and BMI), submits them through a clean clinical website, and receives an instant risk assessment — categorized into one of five levels from "Very Low Risk" to "Very High Risk" — along with personalized medical recommendations.

The entire system is hosted and run locally on a single computer. There is no cloud, no database, and no user accounts. Everything is private.

## 1.2 The Core Problem It Solves

Diabetes affects over 537 million adults globally. A huge portion of Type 2 diabetes cases go undiagnosed until complications arise. Medical consultations are expensive and inaccessible. This tool uses machine learning trained on clinically validated data to give anyone an instant, evidence-based preliminary health screening — for free.

## 1.3 Project Folder Structure (Every File Explained)

```
diabetes-risk-checker/
│
├── backend/
│   ├── main.py              ← The FastAPI web server. Receives health data
│   │                          from the frontend, runs predictions, and
│   │                          returns the risk result as JSON.
│   └── requirements.txt     ← List of Python packages required to run main.py
│
├── data/
│   └── diabetes.csv         ← The raw training dataset (768 rows, 9 columns).
│                              This is where the AI "learned" diabetes patterns from.
│
├── frontend/
│   ├── public/
│   │   └── index.html       ← The root HTML file. React attaches itself here.
│   ├── src/
│   │   ├── App.js           ← ALL of the UI logic: components, state, API calls.
│   │   ├── App.css          ← ALL styles: color palette, layout, dark mode,
│   │   │                      sliders, cards, animations, print/PDF rules.
│   │   └── index.js         ← Entry point: connects React to index.html's
│   │                          <div id="root"></div>
│   ├── .env                 ← Environment variable file (e.g., API URL)
│   └── package.json         ← Declares all frontend npm dependencies and
│                              run scripts (start, build, test).
│
└── model_service/
    ├── train.py             ← Script that loads dataset, cleans data, trains
    │                          the Random Forest model, and saves output files.
    ├── diabetes_model.pkl   ← The finished, trained AI model (21 MB). This is
    │                          what the backend loads to make predictions.
    └── scaler.pkl           ← The saved StandardScaler. Normalizes new user
                               data before it is fed into the model.
```

---

# PART 2: THE TECHNOLOGY STACK (Every Tool Explained)

## 2.1 Programming Languages

### Python (Backend & Machine Learning)
- **Version used**: Python 3.x (compatible with all packages used)
- **Why Python?**: Python is the global standard for machine learning. Libraries like `scikit-learn`, `pandas`, and `numpy` are mature, well-documented, and trusted in production clinical and research environments.
- **Where it is used**: In `backend/main.py` (API server) and `model_service/train.py` (model training).

### JavaScript (Frontend)
- **Version used**: ES2022+ (modern JavaScript with arrow functions, async/await, destructuring)
- **Why JavaScript?**: JavaScript is the only language that runs inside a web browser natively. It is the standard for building interactive user interfaces.
- **Where it is used**: In `frontend/src/App.js` and `frontend/src/index.js`.

### CSS (Styling)
- **Version used**: CSS3 with Custom Properties (variables)
- **Why vanilla CSS?**: Using a raw CSS file (rather than a framework like Tailwind or Bootstrap) gave full, pixel-perfect control over the clinical design system. Every color, animation, and spacing value is precisely tuned.
- **Where it is used**: `frontend/src/App.css`

### Markdown
- `README.md` and this study guide use Markdown for clean, portable document formatting.

---

## 2.2 Backend Dependencies (requirements.txt — Explained Line by Line)

```
fastapi==0.104.1
uvicorn==0.24.0
joblib==1.3.2
numpy==1.26.2
scikit-learn==1.3.2
pydantic==2.5.0
pandas==2.1.3
```

### `fastapi==0.104.1`
- **What it is**: A modern Python web framework for building APIs.
- **Why we chose it**: FastAPI is significantly faster than older frameworks like Flask or Django for API-only backends. It has built-in support for async code (handling multiple requests simultaneously), automatic OpenAPI documentation, and automatic data validation via Pydantic.
- **What it does in our project**: Receives the POST request from React at `/predict`, passes it through Pydantic validation, runs the ML model, and returns a JSON response.

### `uvicorn==0.24.0`
- **What it is**: An ASGI (Asynchronous Server Gateway Interface) web server.
- **Why we use it**: FastAPI is an async framework and needs an async server to run. Uvicorn is the standard choice.
- **How to start**: `uvicorn main:app --reload --port 8000`
  - `main` = the Python filename (`main.py`)
  - `app` = the FastAPI instance object name in that file
  - `--reload` = restarts the server automatically when code changes (development mode)
  - `--port 8000` = serves on http://localhost:8000

### `joblib==1.3.2`
- **What it is**: A library for saving and loading Python objects efficiently.
- **Why we use it**: The trained ML model (`RandomForestClassifier`) and the data scaler (`StandardScaler`) are Python objects. `joblib.dump()` serializes (saves) them as `.pkl` files so they don't need to be re-trained every time the server starts. `joblib.load()` deserializes (loads) them back.
- **What `.pkl` means**: "Pickle" — Python's binary format for serializing arbitrary objects.

### `numpy==1.26.2`
- **What it is**: The foundational numerical computation library for Python.
- **Why we use it**: The ML model requires data in the form of a NumPy array, not a plain Python dictionary. In `main.py`, `np.array([[...]])` converts the user's 7 health numbers into a 2D array (shape `[1, 7]`) before passing it to the model.
- **Key function used**: `np.array([[data.glucose, data.bloodPressure, ...]])`

### `scikit-learn==1.3.2`
- **What it is**: The most widely used Python machine learning library.
- **Why we use it**: It provides a clean, standardized interface for training models, preprocessing data, and evaluating results. All ML components in this project come from it.
- **Specific classes used**:
  - `RandomForestClassifier` — the main classification algorithm
  - `StandardScaler` — feature normalization
  - `train_test_split` — splits data into training and testing sets
  - `GridSearchCV` — searches for the best hyperparameters
  - `CalibratedClassifierCV` — probability calibration (Platt Scaling)
  - `accuracy_score`, `classification_report`, `confusion_matrix` — evaluation metrics

### `pydantic==2.5.0`
- **What it is**: A Python data validation library that uses Python type hints.
- **Why we use it**: FastAPI integrates deeply with Pydantic. When the frontend sends a JSON body, Pydantic automatically parses it, checks all data types, and enforces the clinical min/max limits we defined. Any invalid request is automatically rejected with an HTTP 422 error before the ML model ever runs.

### `pandas==2.1.3`
- **What it is**: A data manipulation and analysis library. Works with tabular data (like spreadsheets/CSV files).
- **Why we use it**: Used exclusively in `train.py` to load the CSV dataset, drop columns, replace zero values, compute medians, and apply the IQR filter row-by-row.
- **Key functions used**: `pd.read_csv()`, `df.drop()`, `df.replace()`, `df.fillna()`, `df.quantile()`

---

## 2.3 Frontend Dependencies (package.json — Explained Line by Line)

```json
"react": "^18.2.0"
"react-dom": "^18.2.0"
"react-scripts": "5.0.1"
"axios": "^1.6.0"
"html2pdf.js": "^0.14.0"
```

### `react: ^18.2.0`
- **What it is**: The core React library for building user interfaces with components.
- **What is React?**: React is a JavaScript library (developed by Meta/Facebook) that lets you build UIs as a "tree" of reusable components. Each component manages its own state and renders itself — React efficiently updates only what changed using a Virtual DOM.
- **New in React 18**: Concurrent rendering features. In our project, we use standard React 18 features: hooks (`useState`, `useEffect`, `useRef`, `useCallback`).

### `react-dom: ^18.2.0`
- **What it is**: The bridge between React and the actual browser DOM.
- **How it's used**: In `index.js`, `ReactDOM.createRoot(document.getElementById('root')).render(<App />)` mounts the entire React app inside the `<div id="root">` in `public/index.html`.

### `react-scripts: 5.0.1`
- **What it is**: Part of Create React App (CRA) — a pre-configured build toolchain.
- **What it provides**: Webpack bundling, Babel transpilation (converts modern JS to browser-compatible JS), ESLint integration, a local dev server, and an optimized production build.
- **Commands it enables**: `npm start` (dev server), `npm run build` (production build), `npm test` (test runner).

### `axios: ^1.6.0`
- **What it is**: A promise-based HTTP client for JavaScript.
- **Why not just use `fetch()`?**: Axios automatically parses JSON responses, provides better error handling (errors are thrown as exceptions, not resolved promises), and allows easy request/response interception. It is widely used in professional React projects.
- **How it's used**: In `Checker` component: `const res = await axios.post('http://localhost:8000/predict', payload)` sends the form data as JSON to the FastAPI backend and waits for the response.

### `html2pdf.js: ^0.14.0`
- **What it is**: A client-side JavaScript library that converts an HTML DOM element to a downloadable PDF.
- **How it works internally**: It uses `html2canvas` to "screenshot" the result card as a canvas image, then uses `jsPDF` to embed that image into a PDF document.
- **How it's used**: `html2pdf().set({ ... options ... }).from(resultRef.current).save()` — targets the result card DOM element via React's `useRef`, captures it, and triggers a browser download.

---

# PART 3: THE DATASET

## 3.1 Pima Indians Diabetes Database

- **Full name**: Pima Indians Diabetes Database
- **Origin**: National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK), USA.
- **Subject Group**: Adult females of Pima Indian heritage, at least 21 years old.
- **Total Records**: 768 rows (patient records)
- **Total Features (Columns)**: 9 (8 input features + 1 output label)
- **File name in project**: `data/diabetes.csv`
- **File size**: ~23 KB

## 3.2 All 9 Columns in the Raw Dataset

| Column | Type | Biological Meaning |
|:---|:---|:---|
| **Pregnancies** | Integer | Number of times patient was pregnant |
| **Glucose** | Integer | Plasma glucose concentration at 2 hours in an oral glucose tolerance test (mg/dL) |
| **BloodPressure** | Integer | Diastolic blood pressure (mmHg) |
| **SkinThickness** | Integer | Triceps skin fold thickness (mm) |
| **Insulin** | Integer | 2-Hour serum insulin (μU/mL) |
| **BMI** | Float | Body mass index (weight kg / height m²) |
| **DiabetesPedigreeFunction** | Float | A score that rates the genetic/family-history likelihood of diabetes |
| **Age** | Integer | Age in years |
| **Outcome** | Integer | **Label**: 0 = No Diabetes, 1 = Has Diabetes |

## 3.3 Why "Pregnancies" Was Dropped

The original dataset only includes **female subjects** of Pima Indian heritage. The "Pregnancies" feature is biologically exclusive to females and heavily tied to a specific ethnic group. Including it:
1. Makes the model unable to assess **male** users fairly.
2. Introduces genetic/population-specific bias.

**Code**: `df = df.drop('Pregnancies', axis=1)` removes the column entirely before training. After this, only **7 features** remain, making the model universally applicable across genders.

---

# PART 4: THE MACHINE LEARNING MODEL (train.py — Line by Line)

## 4.1 Step 1: Loading the Data

```python
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.calibration import CalibratedClassifierCV

df = pd.read_csv('data/diabetes.csv')
df = df.drop('Pregnancies', axis=1)
```

- `pd.read_csv()`: Loads the 768-row CSV file into a Pandas DataFrame (think of it as a table in RAM).
- After dropping Pregnancies, the DataFrame has **768 rows × 8 columns** (7 features + Outcome).

---

## 4.2 Step 2: Fixing Zero Values (Median Imputation)

```python
cols_fix = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[cols_fix] = df[cols_fix].replace(0, np.nan)
for col in cols_fix:
    df[col] = df[col].fillna(df[col].median())
```

**The Problem**: In the raw dataset, many rows have `0` for values like Glucose or Blood Pressure. A glucose of 0 mg/dL is biologically impossible — it indicates a **missing/unrecorded value** in the original data collection.

**The Fix**: 
1. Replace all `0` values in these columns with `NaN` (Python's "Not a Number" — means "missing").
2. Fill each missing value with the **median** (middle value) of that column.

**Why median, not mean (average)?**: The median is resistant to extreme outliers. If a few records have unrealistically high insulin values, the mean would be skewed upward. The median is the stable midpoint of the dataset.

**Columns treated**: Glucose, Blood Pressure, Skin Thickness, Insulin, BMI. (Age and DiabetesPedigreeFunction rarely have true zeros.)

---

## 4.3 Step 3: Removing Statistical Outliers (IQR Method)

```python
Q1 = df.quantile(0.15)
Q3 = df.quantile(0.85)
IQR = Q3 - Q1
df_clean = df[~((df < (Q1 - 1.5 * IQR)) | (df > (Q3 + 1.5 * IQR))).any(axis=1)]
```

**What is an Outlier?**: A value so extreme it is likely a data entry error or a genuine anomaly that will confuse the model.

**What is the IQR?**: Interquartile Range = Q3 − Q1. It measures the "spread" of the middle portion of the data.

**Our IQR Settings**:
- We use the 15th percentile as Q1 and the 85th percentile as Q3 (instead of the traditional 25th/75th). This is more aggressive and removes more noise.
- Any row where ANY column's value falls below `Q1 − 1.5 × IQR` or above `Q3 + 1.5 × IQR` is removed.

**The `~` symbol**: In Python, `~` means "NOT". So `df[~(...)]` means "keep only rows that do NOT have any extreme values."

**Result**: The dataset shrinks from ~768 to roughly 650–700 rows after removing noisy records. This cleans the training data significantly.

---

## 4.4 Step 4: Splitting Features from the Target Label

```python
X = df_clean.drop('Outcome', axis=1)
y = df_clean['Outcome']
```

- `X`: The **feature matrix** — all 7 input columns (Glucose, Blood Pressure, etc.). Shape: roughly `[680, 7]`.
- `y`: The **target vector** — the Outcome column (0 or 1). Shape: `[680]`.
- This is standard ML convention: `X` = inputs, `y` = outputs/labels.

---

## 4.5 Step 5: StandardScaler (Feature Normalization)

```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
```

**What StandardScaler does**: Transforms each feature column so that it has:
- **Mean = 0** (the average value of each column becomes 0)
- **Standard Deviation = 1** (the spread becomes 1)

**Why normalize?**: Each feature has different units and ranges. Glucose ranges 0–400, Age 21–81, BMI 18–67. Without scaling, features with larger ranges dominate the model incorrectly. After scaling, all features are on a fair, comparable numerical footing.

**`fit_transform()` vs `transform()`**: 
- `fit_transform()` is used on training data: it **learns** the mean and std of each column, then applies scaling.
- `transform()` is used later on new (user) input: it applies the **already-learned** scaling parameters.
- **Critical**: The scaler must be saved (`scaler.pkl`) so the same transformation can be applied to user data at prediction time. Using different scaling parameters would produce meaningless results.

---

## 4.6 Step 6: Train/Test Split

```python
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
```

- **`test_size=0.2`**: 20% of the data is reserved for testing only — the model never sees it during training. This is how we measure real-world performance.
- **`random_state=42`**: A fixed "seed" for the random split so results are reproducible. The number 42 is conventional but arbitrary.
- **Approximate split**: ~544 training rows, ~136 test rows.

---

## 4.7 Step 7: GridSearchCV (Hyperparameter Tuning)

```python
param_grid = {
    'n_estimators': [400, 500, 600, 700],
    'max_depth': [12, 15, 18, None],
    'min_samples_split': [2, 3, 4],
    'min_samples_leaf': [2, 3, 4],
    'bootstrap': [True]
}

rf_base = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(estimator=rf_base, param_grid=param_grid, cv=5, n_jobs=-1, scoring='accuracy')
grid_search.fit(X_train, y_train)
```

**What are hyperparameters?**: Settings that control HOW the model learns. They are not learned from data — they must be set before training begins.

**What is GridSearchCV?**: It systematically tries every combination of hyperparameters and finds the combination that produces the highest cross-validation accuracy.

**Parameter meanings**:
| Hyperparameter | Our Values | Meaning |
|:---|:---|:---|
| `n_estimators` | 400–700 | Number of individual decision trees in the forest |
| `max_depth` | 12–18 or None | Maximum depth (levels) of each tree. Prevents overfitting. None = unlimited. |
| `min_samples_split` | 2–4 | Minimum samples required to split a node. Higher = simpler trees. |
| `min_samples_leaf` | 2–4 | Minimum samples required at each leaf node. |
| `bootstrap` | True | Each tree is trained on a random subset of training data (with replacement). |

**`cv=5`**: 5-Fold Cross-Validation. The training data is split 5 ways; the model is trained 5 times, each time using a different "fold" as a mini test set. The average accuracy across all 5 rounds is the score for that hyperparameter combination.

**`n_jobs=-1`**: Use all available CPU cores. This speeds up the search significantly.

**Output**: `grid_search.best_params_` reveals which combination won.

---

## 4.8 Step 8: Platt Scaling — The Critical Calibration Step

```python
model = CalibratedClassifierCV(estimator=best_rf, method='sigmoid', cv=5)
model.fit(X_train, y_train)
```

**The Problem with Raw Random Forest Probabilities**:
A standard Random Forest estimates probability as "the fraction of trees that voted for class 1." Because trees vote discretely, this creates a compressed S-curve: most probabilities cluster near the extremes (0.1 or 0.9). A 60% raw probability might genuinely represent only a 45% clinical risk.

**Platt Scaling Fix**: `CalibratedClassifierCV(method='sigmoid')` trains a logistic regression (sigmoid) curve on top of the Random Forest's raw outputs. This "stretches" the probability distribution to be more linear and accurate across the full 0–100% range.

**Why this matters for our project**: Our 5-tier risk system directly maps probability percentages to risk categories. Without calibration, the tier boundaries would be meaningless. With calibration, 40% really means 40% clinical risk.

---

## 4.9 Step 9: Model Evaluation

```python
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
cm  = confusion_matrix(y_test, y_pred)
print(classification_report(y_test, y_pred, target_names=['No Diabetes', 'Diabetes']))
```

**Accuracy Score**: Percentage of predictions that were correct. Our model achieves approximately **80% accuracy**.

**Confusion Matrix — What it Means**:
```
                  Predicted: No Diabetes    Predicted: Diabetes
Actual: No Diabetes  [True Negatives]        [False Positives]
Actual: Diabetes     [False Negatives]       [True Positives]
```
- **True Positive (TP)**: Model predicted diabetes, patient actually has it. ✅
- **True Negative (TN)**: Model predicted no diabetes, patient is clear. ✅
- **False Positive (FP)**: Model raised alarm incorrectly. "Unnecessary worry."
- **False Negative (FN)**: Model missed a real case. **Most dangerous for medical tools.**

**Classification Report Metrics**:
- **Precision**: Of all cases the model predicted as diabetes, how many actually had diabetes?
- **Recall (Sensitivity)**: Of all actual diabetes cases, what percentage did the model detect?
- **F1-Score**: Harmonic mean of precision and recall. Balances both.

---

## 4.10 Step 10: Saving the Artifacts

```python
joblib.dump(model, 'model_service/diabetes_model.pkl')
joblib.dump(scaler, 'model_service/scaler.pkl')
```

- `diabetes_model.pkl`: 21 MB — contains the full calibrated Random Forest (hundreds of trees, each with their learned split rules).
- `scaler.pkl`: ~1 KB — contains just the mean and standard deviation for each of the 7 features.
- Both `.pkl` files are loaded by `backend/main.py` at server startup using `joblib.load()`.

---

# PART 5: THE BACKEND API (main.py — Explained in Full)

## 5.1 Imports and Setup

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
```

- `FastAPI()` creates an application instance. Everything is built onto this `app` object.
- `HTTPException` allows sending proper HTTP error codes if something goes wrong.

## 5.2 CORS Middleware

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**What is CORS?**: Cross-Origin Resource Sharing. A browser security policy that blocks websites from making API requests to a different domain/port than their own.

**The problem**: Our React frontend runs at `http://localhost:3000`. Our FastAPI backend runs at `http://localhost:8000`. Though both are on "localhost," they use **different ports** — browsers treat this as a cross-origin request and block it by default.

**The fix**: Adding `CORSMiddleware` with `allow_origins=["*"]` tells the browser: "This API accepts requests from any origin." This is safe in development. In a production deployment, you would restrict `allow_origins` to your specific domain.

## 5.3 Loading the Model at Startup

```python
import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model = joblib.load(os.path.join(BASE_DIR, 'model_service', 'diabetes_model.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, 'model_service', 'scaler.pkl'))
```

- `os.path.abspath(__file__)`: Gets the full path of `main.py`.
- `os.path.dirname(...)` called twice: Goes up two directories, landing at the project root.
- `os.path.join(BASE_DIR, 'model_service', 'diabetes_model.pkl')`: Constructs the correct path regardless of which operating system or directory the server is run from.
- **Both files are loaded once when the server starts** — not on every request. This keeps response time fast.

## 5.4 The Pydantic Input Model (Data Validation)

```python
class HealthData(BaseModel):
    glucose:       float = Field(..., ge=0,   le=400, description="Plasma glucose concentration")
    bloodPressure: float = Field(..., ge=0,   le=200, description="Diastolic blood pressure")
    skinThickness: float = Field(..., ge=0,   le=100, description="Triceps skin fold thickness")
    insulin:       float = Field(..., ge=0,   le=1000,description="2-Hour serum insulin")
    bmi:           float = Field(..., ge=10,  le=80,  description="Body mass index")
    dpf:           float = Field(..., ge=0.0, le=3.0, description="Diabetes pedigree function")
    age:           float = Field(..., ge=1,   le=120, description="Age in years")
```

- `BaseModel`: All Pydantic models inherit from this. It enables automatic JSON parsing and validation.
- `Field(...)`: The `...` means the field is **required** (no default value).
- `ge=`: "greater than or equal to" — minimum value allowed.
- `le=`: "less than or equal to" — maximum value allowed.
- If any field fails validation, FastAPI returns HTTP **422 Unprocessable Entity** automatically.
- Field names use **camelCase** (`bloodPressure`) to match JavaScript conventions on the frontend.

## 5.5 The Prediction Endpoint

```python
@app.post("/predict")
async def predict_risk(data: HealthData):
```

- `@app.post("/predict")`: Registers this function to handle HTTP POST requests at the URL `/predict`.
- `async def`: This function is asynchronous — it can handle multiple requests concurrently without blocking.
- `data: HealthData`: FastAPI automatically parses the incoming JSON body into a validated `HealthData` object.

## 5.6 The Prediction Logic

```python
input_data = np.array([[data.glucose, data.bloodPressure,
                       data.skinThickness, data.insulin, data.bmi, data.dpf, data.age]])
scaled_data = scaler.transform(input_data)
prediction = model.predict(scaled_data)[0]
probability = model.predict_proba(scaled_data)[0][1]
```

- **Step 1**: Pack all 7 values into a 2D NumPy array of shape `[1, 7]` (1 sample, 7 features). The double brackets `[[...]]` are critical — scikit-learn expects this shape, not a flat list.
- **Step 2**: `scaler.transform()` applies the same normalization learned during training (NOT `fit_transform` — we must NOT re-learn the scaling from just one sample!).
- **Step 3**: `model.predict(scaled_data)[0]` gives the class label: `0` (no diabetes) or `1` (diabetes). The `[0]` extracts the first (and only) prediction from the result array.
- **Step 4**: `model.predict_proba(scaled_data)[0][1]` gives the calibrated probability array. `[0]` = first sample's probabilities; `[1]` = probability of class 1 (diabetes). This is the raw decimal risk score (e.g., `0.73` = 73% risk).

## 5.7 The 5-Tier Risk Categorization

```python
if probability < 0.20:
    result = "Very Low Risk";   emoji = "🟢"
elif probability < 0.40:
    result = "Low Risk";        emoji = "🟢"
elif probability < 0.60:
    result = "Moderate Risk";  emoji = "🟡"
elif probability < 0.80:
    result = "High Risk";      emoji = "🟠"
else:
    result = "Very High Risk"; emoji = "🔴"
```

| Probability Range | Risk Label | Color |
|:---|:---|:---|
| 0% – 19% | Very Low Risk | Green 🟢 |
| 20% – 39% | Low Risk | Green 🟢 |
| 40% – 59% | Moderate Risk | Yellow 🟡 |
| 60% – 79% | High Risk | Orange 🟠 |
| 80% – 100% | Very High Risk | Red 🔴 |

## 5.8 Dynamic Action Plan Generation

```python
action_plan = []

if probability >= 0.50:
    action_plan.append("🔴 Immediate: Schedule a clinical blood test (HbA1c)...")
    if data.glucose > 140:
        action_plan.append("🍽️ Diet: Consider a low-glycemic index diet...")
    if data.bmi >= 30:
        action_plan.append("🏃 Exercise: Aim for 150 minutes of moderate aerobic activity...")
    if data.bloodPressure > 80:
        action_plan.append("💓 Heart Health: Monitor your blood pressure...")
    action_plan.append("🩸 Monitoring: Begin daily monitoring of blood glucose...")
else:
    action_plan.append("🟢 Health Maintenance: Continue your current healthy lifestyle habits.")
    action_plan.append("🥗 Preventive Diet: Maintain a balanced diet...")
    action_plan.append("🏃 Preventive Exercise: Consistent physical activity helps...")
    if data.bmi >= 25:
        action_plan.append("⚖️ Weight Management: Slight reduction in BMI can drastically lower risk...")
    action_plan.append("📅 Checkups: Schedule an annual metabolic screening...")
```

This logic generates a **personalized** list of recommendations. The advice changes per user:
- If glucose is high (>140), dietary advice is added.
- If BMI is obese (≥30), exercise recommendations are injected.
- If diastolic pressure is elevated (>80), cardiovascular warnings are added.

## 5.9 The JSON Response

```python
return {
    "prediction": result,
    "probability": f"{round(probability * 100, 2)}%",
    "precautions": action_plan,
    "analysis": f"Based on your profile (Glucose: {data.glucose} mg/dL, BMI: {data.bmi}), ..."
}
```

The response is automatically serialized to JSON by FastAPI. The frontend receives exactly these four keys.

---

# PART 6: THE FRONTEND (App.js — Explained in Full)

## 6.1 Imports

```javascript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './App.css';
```

- **`useState`**: Adds local state to a function component (e.g., form values, result data, dark mode).
- **`useEffect`**: Runs side effects (code that interacts with things outside React, like `localStorage`, scroll events, or the IntersectionObserver API) after the component renders.
- **`useRef`**: Holds a reference to a DOM element. Used to target the result card for PDF generation and to track if the stats section is visible.
- **`useCallback`**: Memoizes (caches) a function so it's not re-created on every render. Used for `handleChange` to prevent unnecessary re-renders of child components.

## 6.2 Constants — FIELDS Array

```javascript
const FIELDS = [
  { key: 'glucose', label: 'Glucose', Icon: Icons.Glucose, min: 0, max: 400, step: 1, unit: 'mg/dL', info: '...' },
  ...
];
```

The `FIELDS` array is the single source of truth for all form fields. Each object defines:
- `key`: Matches the Pydantic field name on the backend exactly (camelCase).
- `label`: What the user sees on screen.
- `Icon`: Which SVG icon component to display.
- `min`, `max`, `step`: Used to validate the number input AND control the range slider.
- `unit`: Displayed next to the field (mg/dL, mmHg, etc.).
- `info`: A small explanation tooltip shown below the slider.

This design means adding a new field only requires adding one object here — the whole form renders automatically.

## 6.3 Custom Hooks

### `useCountUp(target, duration, trigger)`
```javascript
function useCountUp(target, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return count;
}
```

Used to animate the Global Statistics section numbers counting up (0 → 537M, etc.) when the section scrolls into view.

- `requestAnimationFrame`: A browser API that calls a function before the next screen repaint (typically 60fps). Smoother than `setInterval`.
- `trigger`: Starts the animation only once when the section becomes visible.

### `useInView(threshold)`
```javascript
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}
```

- **IntersectionObserver**: A browser API that fires when an element enters or exits the visible viewport.
- `threshold = 0.15`: The observer fires when 15% of the element is visible.
- `observer.disconnect()`: Unsubscribe after the first trigger — the animation should only happen once.
- Returns `[ref, inView]` — the ref is attached to the element, inView is the boolean state.

## 6.4 Component: DisclaimerModal

```javascript
function DisclaimerModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('diabetesDisclaimerAccepted')) setOpen(true);
  }, []);
  const accept = () => {
    localStorage.setItem('diabetesDisclaimerAccepted', 'true');
    setOpen(false);
  };
  ...
}
```

- Shown once to every new visitor.
- `localStorage.getItem()`: Checks if the user has already accepted. If they have, the modal stays hidden.
- `localStorage.setItem()`: Permanently records acceptance in the browser's local storage (persists after the tab is closed).
- After accepting, the modal un-mounts entirely (`if (!open) return null`).

## 6.5 Component: Navbar

- **Scroll detection**: A `useEffect` attaches a `scroll` event listener. When `window.scrollY > 40`, the `.nav-scrolled` CSS class is added — this triggers the backdrop blur and border.
- **Smooth scrolling**: `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })` — the `?.` is optional chaining (safe navigation if element doesn't exist).
- **Hamburger menu**: On mobile, navigation links are hidden and replaced with a hamburger icon. Clicking toggles `menuOpen` state.
- **Dark mode toggle**: Passes `theme` and `toggleTheme` props from the parent `App` component.

## 6.6 Component: GlobalStats

```javascript
const [ref, inView] = useInView(0.1);
const v1 = useCountUp(537, 2000, inView);
const v2 = useCountUp(10,  1800, inView);
```

- `ref` is attached to the `<section>` element.
- When that section becomes 10% visible, `inView` flips to `true`.
- Passing `inView` as the `trigger` to `useCountUp` starts the animation simultaneously for all four numbers.

## 6.7 Component: CircProgress (Circular Progress Ring)

```javascript
function CircProgress({ pct, tier }) {
  const R = 56, C = 2 * Math.PI * R;
  const [offset, setOffset] = useState(C);
  useEffect(() => {
    const t = setTimeout(() => setOffset(C - (pct / 100) * C), 120);
    return () => clearTimeout(t);
  }, [pct, C]);
  ...
}
```

**The SVG Math Explained**:
- `R = 56`: Radius of the circle in SVG units.
- `C = 2π × 56 ≈ 351.86`: The full circumference of the circle.
- `stroke-dasharray={C}`: Makes the circle's border composed of one long dash segment equal to its full circumference.
- `stroke-dashoffset`: How much of that dash to "offset" (hide). Setting it to `C` hides the entire ring. Setting it to `0` shows the entire ring.
- **The formula** `C - (pct / 100) * C`: For a 73% risk score, offset = `351.86 - (0.73 × 351.86) = 94.9`. This reveals 73% of the ring.
- `setTimeout(..., 120)`: 120ms delay before starting so the animation is visible after the result card mounts.
- The CSS transition `stroke-dashoffset 1.2s cubic-bezier(...)` animates the ring drawing smoothly — a bezier curve with a slight anticipation/deceleration feel.

## 6.8 Component: Checker (The Main Form)

### State Management:
```javascript
const [formData, setFormData]       = useState(() => { /* load from localStorage */ });
const [lifestyleMode, setLifestyleMode] = useState(false);
const [result, setResult]           = useState(null);
const [loading, setLoading]         = useState(false);
const [error, setError]             = useState(null);
const [fieldErrors, setFieldErrors] = useState({});
const resultRef = useRef(null);
```

Six state variables manage the form's full lifecycle:
- `formData`: Object containing current values of all 7 fields.
- `lifestyleMode`: Boolean toggle for hiding lab-specific fields.
- `result`: The JSON response from the backend (null until a submission succeeds).
- `loading`: Boolean shown to disable the submit button and show the spinner during the API call.
- `error`: String shown in the error card if validation or the API call fails.
- `fieldErrors`: Object mapping each field key to an error string (or null).

### localStorage Persistence:
```javascript
useEffect(() => {
  localStorage.setItem('diabetesFormData', JSON.stringify(formData));
}, [formData]);
```
Every time `formData` changes, it is saved to localStorage as a JSON string. On the next page load, the initial `useState` reads it back. Users don't lose their entered values if they accidentally refresh.

### Field Validation:
```javascript
const validateField = (key, value) => {
  const field = FIELDS.find(f => f.key === key);
  const v = parseFloat(value);
  if (isNaN(v))       return 'Required';
  if (v < field.min)  return `Min ${field.min}`;
  if (v > field.max)  return `Max ${field.max}`;
  return null;
};
```
Validates each field against its min/max rules (sourced from the `FIELDS` array). Called both on each keystroke (real-time feedback) and on form submission.

### Lifestyle Mode Logic:
```javascript
if (lifestyleMode && ['glucose', 'skinThickness', 'insulin'].includes(k)) return;
// ...
if (lifestyleMode) {
    payload.glucose       = DEFAULT_VALUES.glucose;       // 120 mg/dL
    payload.skinThickness = DEFAULT_VALUES.skinThickness; // 20 mm
    payload.insulin       = DEFAULT_VALUES.insulin;       // 80 μU/mL
}
```
When Lifestyle Mode is active:
1. Lab-specific fields are hidden from the form.
2. Their validation is skipped.
3. At submission, clinically reasonable median defaults are substituted in the payload sent to the backend.

### API Call:
```javascript
const res = await axios.post('http://localhost:8000/predict', payload);
setResult(res.data);
setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
```
- `await` pauses execution until the API responds.
- `res.data` is the JSON response object (with `prediction`, `probability`, `precautions`, `analysis`).
- 200ms after setting the result, the page auto-scrolls to the result card.

### PDF Download:
```javascript
const downloadPDF = () => {
  html2pdf().set({
    margin: 0.5,
    filename: 'DiabCheck_Risk_Report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
  }).from(resultRef.current).save();
};
```
- `scale: 2`: Renders at double resolution for crisp text (basically 2× retina density).
- `useCORS: true`: Allows cross-origin images (needed if any assets come from external URLs).
- `format: 'letter'`: Standard US letter size (8.5 × 11 inches).
- `resultRef.current`: The React ref pointing to the `<div id="pdf-container">` DOM element.

## 6.9 Root App Component

```javascript
export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('diabetesTheme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('diabetesTheme', theme);
  }, [theme]);
  ...
}
```

- `data-theme` attribute on `<html>`: CSS variables in `App.css` have two sets of values — one for `:root` (light mode) and one for `[data-theme='dark']`. Toggling this attribute switches the entire color system instantly.
- The theme preference is saved to localStorage so it persists across sessions.

---

# PART 7: THE CSS DESIGN SYSTEM (App.css — Complete Breakdown)

## 7.1 Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Sans+3:wght@400;600;700;800;900&display=swap');
```

Two professional typefaces are loaded:
- **Inter**: A humanist sans-serif optimized for UI text and reading. Used for body text, labels, buttons.
- **Source Sans 3**: A slightly wider, more editorial sans-serif. Used for all headings and large display text.
- `display=swap`: Renders system font first, then swaps to the web font when it loads — prevents invisible text during load.

## 7.2 CSS Custom Properties (Design Tokens)

All colors, fonts, and radius values are defined as CSS variables:

```css
:root {
  --teal:       #0D7C66;   /* Primary brand color — clinical trust blue-green */
  --teal-light: #10A37F;   /* Hover/lighter variant of brand */
  --amber:      #C6922A;   /* Secondary action color — warm and urgent */
  --success:    #16A34A;   /* Green for healthy/low-risk indicators */
  --warning:    #CA8A04;   /* Yellow for moderate risk */
  --danger:     #DC2626;   /* Red for high/very-high risk */
  
  --font:    'Inter', ...;         /* Body font */
  --font-hd: 'Source Sans 3', ...; /* Heading font */
  
  --r-sm: 6px;   /* Small border-radius */
  --r-md: 10px;  /* Medium border-radius */
  --r-lg: 14px;  /* Large border-radius (cards) */
}
```

## 7.3 Dark Mode via [data-theme='dark']

```css
[data-theme='dark'] {
  --bg:      #101827;     /* Very dark navy background */
  --surface: #1B2538;     /* Slightly lighter surface for cards */
  --text:    #E8ECF1;     /* Light text for readability */
  --accent:  #2DD4A8;     /* Brighter teal in dark mode for contrast */
  ...
}
```

Every component uses CSS variables, so the entire visual theme switches by changing just the `:root` overrides through this selector — no inline JavaScript style manipulation is needed.

## 7.4 Animations

```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes spinner  { to { transform: rotate(360deg); } }

.anim-up { animation: slideUp 0.4s ease-out both; }
```

- **`slideUp`**: Applied to the result card and error card when they appear. Combines a fade-in with a 12px upward slide for a polished entrance effect.
- **`spinner`**: Rotates the circular loading indicator on the submit button.
- `ease-out`: Starts fast, slows down — feels natural.
- `both`: Applies animation's initial state immediately (prevents flash before animation starts).

## 7.5 PDF Print Overrides

```css
@media print {
  .result-card { background: #fff !important; color: #1A1A2E !important; }
  .result-header-print { display: block !important; }
  ...
}
```

When the PDF is generated, the browser simulates a "print" environment. These rules:
- Force white background (dark mode colors don't print well).
- Show the `.result-header-print` div (hidden on screen, visible only in PDF) — contains "DiabCheck Clinical Report" as the PDF header.
- Ensure all colors have sufficient contrast for print.

## 7.6 Responsive Design (Media Queries)

```css
@media (max-width: 900px) {
  .hero-container { grid-template-columns: 1fr; }  /* Stack vertically */
  .about-grid, .steps-grid { grid-template-columns: 1fr; }
  .stats-layout { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .nav-links { display: none; /* Mobile: hidden, shown via hamburger */ }
  .hamburger { display: flex; }
  .checker-card { padding: 24px 16px; } /* Less padding on small screens */
}
```

Two responsive breakpoints:
- **900px**: Tablet/medium screen — multi-column grids stack to single column.
- **600px**: Mobile — navigation collapses to hamburger menu, sections get less padding, stats stack vertically.

---

# PART 8: THE SVG ICON LIBRARY

All 15 icons are pure inline SVG functions in `App.js`. No icon library dependency (like Font Awesome or Heroicons) is used.

```javascript
const Icons = {
  Pulse:    () => <svg viewBox="0 0 24 24" ...>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>,
  Syringe:  () => <svg ...><path d="m18 2-3 3M2 22l1.5-1.5..."/></svg>,
  Dna:      () => <svg ...><path d="M2 15c6.667-6 13.333 0 20-6"/></svg>,
  ...
}
```

**Why custom SVG?**: 
- Zero network requests — icons are embedded in the JavaScript bundle.
- Inherits CSS color via `stroke="currentColor"` — adapts to dark/light mode automatically.
- Perfectly scaled to any size via `viewBox`.
- Each icon is a mathematical path drawn using SVG path commands (`M` = Move, `L` = Line, `C` = Cubic Bezier, `Z` = Close path).

---

# PART 9: HOW TO RUN THE PROJECT

## Step 1: Train the Model (Only needed once — model already pre-trained)
```bash
cd c:\Users\Pc\OneDrive\Desktop\diabetes-risk-checker
pip install -r backend/requirements.txt
python model_service/train.py
```
This creates `diabetes_model.pkl` and `scaler.pkl` in the `model_service/` folder.

## Step 2: Start the Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
**Verify it's working**: Open `http://localhost:8000/docs` in your browser — FastAPI serves an automatic interactive Swagger API documentation page.

## Step 3: Start the Frontend
```bash
cd frontend
npm install
npm start
```
React development server starts at `http://localhost:3000`.

---

# PART 10: THE COMPLETE PRESENTATION Q&A

These are the most likely questions you will face. Answers are drawn directly from the code.

---

**Q: What exactly does your project do?**  
A: DiabCheck is an AI-powered web application that takes 7 clinical health parameters — glucose, blood pressure, skin thickness, insulin, BMI, diabetes pedigree score, and age — and predicts the user's probabilistic risk of having diabetes. The output is a 5-tier risk label (Very Low to Very High) with a percentage score and personalized medical recommendations. It's powered by a Random Forest machine learning model trained on the Pima Indians Diabetes Dataset.

---

**Q: Why did you choose Random Forest over other algorithms like Logistic Regression, SVM, or Neural Networks?**  
A: Random Forest is the ideal fit here for 3 key reasons:  
1. Our dataset has only 768 rows. Neural networks require tens of thousands of samples to train well — they would massively overfit.  
2. Random Forest is an ensemble method: it trains 400–700 different decision trees on random data subsets and combines their votes. This naturally prevents overfitting better than a single tree.  
3. It natively handles non-linear relationships between health features without needing feature engineering, and provides `predict_proba()` which gives calibrated probability scores — essential for our 5-tier system.

---

**Q: What is the accuracy of your model and why is 80% acceptable?**  
A: Our model achieves approximately 80% accuracy on the held-out test set. For a screening tool on a dataset of 768 samples with significant inherent noise (missing values replaced with medians), 80% is a strong result. Clinical research papers on the same Pima dataset typically report 75–82% accuracy. Our aggressive data cleaning (zero imputation + IQR outlier removal) and hyperparameter tuning via GridSearchCV bring us to the higher end of this range.

---

**Q: What is Platt Scaling and why did you use it?**  
A: Without calibration, a Random Forest's `predict_proba()` returns a ratio — simply the fraction of its trees that voted "yes." This creates a systematic bias where probabilities cluster near 0 and 1, making midrange values unreliable. Platt Scaling (`CalibratedClassifierCV(method='sigmoid')`) fits a logistic regression curve on top of the tree outputs during a second training pass. This mathematically realigns the probabilities to be accurate and linear across the full 0–100% range. This was critical for us because we map probabilities directly to 5 specific risk tiers — a 50% prediction must genuinely mean 50% clinical risk.

---

**Q: The Pima Indians dataset only contains female subjects. How did you handle this gender bias?**  
A: This is a known and important limitation of the dataset. Our primary mitigation was removing the "Pregnancies" column entirely. Pregnancies is the most gender-specific feature. The remaining 7 features — Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Pedigree Score, and Age — are universal physiological measurements that apply equally to all genders. We acknowledge that the model's accuracy on male users may be slightly lower, and the disclaimer in the app notes this.

---

**Q: What is the Diabetes Pedigree Function (DPF)?**  
A: The Diabetes Pedigree Function is a numerical score that estimates the genetic influence of family history on an individual's diabetes risk. It was computed by the original dataset researchers using a complex formula that factors in the number of relatives with diabetes, their age at time of diagnosis, and the biological relatedness to the patient. A score below 0.5 generally indicates lower hereditary risk; above 1.0 indicates significant family-linked predisposition. It is essentially a proxy for genetic risk in the absence of actual genomic data.

---

**Q: What is StandardScaler and why must it be saved as a .pkl file?**  
A: StandardScaler converts each feature column to have a mean of 0 and a standard deviation of 1. `fit_transform()` during training learns the actual mean and standard deviation of each feature from the training data (e.g., average glucose = 121 mg/dL, std = 30). When a user submits their data, we must apply the EXACT SAME transformation — dividing by those same learned parameters. If we ran `fit_transform()` on a single user's data, it would incorrectly normalize their row relative to itself (making everything 0), producing completely wrong model inputs. Saving the scaler ensures the transformation is always consistent.

---

**Q: What is CORS and why do you need it?**  
A: CORS stands for Cross-Origin Resource Sharing. Web browsers enforce a "Same-Origin Policy" — they block JavaScript from making requests to servers at a different domain, port, or protocol than the page itself. Our React frontend is at port 3000; the FastAPI backend is at port 8000. Even though both are on localhost, the different ports make it a cross-origin request. Adding `CORSMiddleware` with `allow_origins=["*"]` sends CORS response headers that tell the browser these requests are permitted. In production, we would replace `"*"` with the actual deployed domain.

---

**Q: What happens if a user enters invalid data?**  
A: There are two layers of validation:  
1. **Frontend (React)**: The `validateField()` function checks every value against the min/max defined in the `FIELDS` array on every keystroke and on form submit. If any field is invalid, a red error message appears directly under that field and submission is blocked.  
2. **Backend (Pydantic)**: Even if someone bypasses the UI, the `HealthData` model enforces the same bounds using `Field(ge=..., le=...)`. Any request with invalid data returns HTTP 422 Unprocessable Entity automatically. The ML model is never reached.

---

**Q: How does Lifestyle Mode work technically?**  
A: When the user toggles Lifestyle Mode, React sets `lifestyleMode = true`. This causes three things in the `Checker` component:  
1. The `glucose`, `skinThickness`, and `insulin` field components are not rendered (returned as `null`).  
2. Validation for those three fields is skipped in the submit handler.  
3. Before the API call, the payload object has those three fields overwritten with the default median values from `DEFAULT_VALUES` (glucose=120, skinThickness=20, insulin=80). The backend receives and processes these as if the user had entered them. The user is assessed primarily on BMI, Blood Pressure, Pedigree, and Age.

---

**Q: How is the circular risk meter drawn?**  
A: It uses SVG mathematics. A circle with radius R=56 is drawn using two `<circle>` elements. The foreground circle uses `stroke-dasharray` set to the full circumference (C = 2π × 56 ≈ 351.86 units). `stroke-dashoffset` controls how much of the stroke to "push off" and thus how much of the ring is visible. For a 73% risk score: offset = C − (0.73 × C) = 94.9. The CSS `stroke-dashoffset` transition with a cubic-bezier easing animates this value over 1.2 seconds, creating the smooth fill animation.

---

**Q: How does the PDF generation work?**  
A: `html2pdf.js` converts a live HTML element into a PDF entirely on the client side (no server needed). It uses `html2canvas` to render the result card div (referenced by `resultRef`) as a canvas bitmap at 2× resolution. Then it passes that canvas to `jsPDF`, which embeds it as a JPEG image (98% quality) in a standard US Letter portrait PDF. The file is directly downloaded to the user's device. The CSS `@media print` rules ensure the printed result looks clean — hiding the dark mode colors and showing the "DiabCheck Clinical Report" header.

---

**Q: Why did you use Axios instead of the native fetch() API?**  
A: Both work, but Axios is preferred for three reasons:  
1. Axios automatically parses JSON responses — no need to call `response.json()` manually.  
2. Error handling is cleaner — HTTP errors (4xx, 5xx) throw exceptions that fall into the `catch` block, unlike `fetch()` which only rejects on network failure.  
3. The error object structure `err.response?.data?.detail?.[0]?.msg` allows extracting Pydantic's specific validation error message to show the user exactly what went wrong.

---

**Q: Can this tool replace a real doctor or medical lab test?**  
A: Absolutely not, and this is explicitly stated throughout the app. The disclaimer modal shown on first visit, the result card disclaimer, and the footer all state clearly that this tool provides "probabilistic screening data" for informational purposes only, and that it does not replace professional medical advice or clinical blood tests like HbA1c. The tool is useful for awareness and early screening motivation, not diagnosis.

---

*End of DiabCheck Comprehensive Study Guide.*  
*Prepared for project presentation by the DiabCheck development team.*
