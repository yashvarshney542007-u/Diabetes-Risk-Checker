# 🩺 Diabetes Risk Checker

An AI-powered web application that predicts diabetes risk using clinical health parameters. Built with a **FastAPI** backend, a **React** frontend, and a **Random Forest** ML model trained on the Pima Indians Diabetes Dataset.

---

## 🗂️ Project Structure

```
diabetes-risk-checker/
├── backend/
│   ├── main.py              # FastAPI server & prediction endpoint
│   └── requirements.txt     # Python dependencies
├── data/
│   └── diabetes.csv         # Training dataset
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML entry point
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   ├── App.css          # Premium dark theme styles
│   │   └── index.js         # React DOM entry
│   └── package.json         # Node dependencies
└── model_service/
    ├── train.py             # Model training script
    ├── diabetes_model.pkl   # Trained Random Forest model
    └── scaler.pkl           # StandardScaler artifact
```

---

## 🚀 Getting Started

### 1. Train the Model (Optional — model already included)

```bash
pip install -r backend/requirements.txt
python model_service/train.py
```

### 2. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend will be live at `http://localhost:8000`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend will be live at `http://localhost:3000`

---

## 🧪 Health Parameters Used

| Parameter | Description | Unit |
|---|---|---|
| Pregnancies | Number of times pregnant | times |
| Glucose | Plasma glucose concentration | mg/dL |
| Blood Pressure | Diastolic blood pressure | mmHg |
| Skin Thickness | Triceps skin fold thickness | mm |
| Insulin | 2-Hour serum insulin | μU/mL |
| BMI | Body mass index | kg/m² |
| Diabetes Pedigree | Hereditary diabetes score | score |
| Age | Age of the patient | years |

---

## 🤖 Model Details

- **Algorithm**: Random Forest Classifier
- **Estimators**: 200 trees, max depth: 10
- **Preprocessing**: Zero-value imputation with median, StandardScaler normalization
- **Dataset**: Pima Indians Diabetes Dataset (768 samples, 8 features)

---

## ⚕️ Disclaimer

This tool is for **informational and educational purposes only**. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Axios
- **Backend**: FastAPI, Uvicorn, Pydantic
- **ML**: scikit-learn, RandomForestClassifier, joblib
- **Data**: pandas, numpy