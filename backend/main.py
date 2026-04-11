from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load Model and Scaler
model = joblib.load(os.path.join(BASE_DIR, 'model_service', 'diabetes_model.pkl'))
scaler = joblib.load(os.path.join(BASE_DIR, 'model_service', 'scaler.pkl'))

class HealthData(BaseModel):
    glucose: float = Field(..., ge=0, le=400, description="Plasma glucose concentration")
    bloodPressure: float = Field(..., ge=0, le=200, description="Diastolic blood pressure")
    skinThickness: float = Field(..., ge=0, le=100, description="Triceps skin fold thickness")
    insulin: float = Field(..., ge=0, le=1000, description="2-Hour serum insulin")
    bmi: float = Field(..., ge=10, le=80, description="Body mass index")
    dpf: float = Field(..., ge=0.0, le=3.0, description="Diabetes pedigree function")
    age: float = Field(..., ge=1, le=120, description="Age in years")

@app.post("/predict")
async def predict_risk(data: HealthData):
    input_data = np.array([[data.glucose, data.bloodPressure,
                           data.skinThickness, data.insulin, data.bmi, data.dpf, data.age]])
    
    # Scale input
    scaled_data = scaler.transform(input_data)
    prediction = model.predict(scaled_data)[0]
    probability = model.predict_proba(scaled_data)[0][1]

    # Analysis & Comprehensive Action Plan
    result = "High Risk" if prediction == 1 else "Low Risk"
    
    # Generate dynamic, personalized advice
    action_plan = []
    
    if prediction == 1:
        action_plan.append("🔴 Immediate: Schedule a clinical blood test (HbA1c) with your doctor.")
        if data.glucose > 140:
            action_plan.append("🍽️ Diet: Consider a low-glycemic index diet. Significantly limit refined carbohydrates and added sugars.")
        if data.bmi >= 30:
            action_plan.append("🏃 Exercise: Aim for 150 minutes of moderate aerobic activity weekly to help manage insulin resistance.")
        if data.bloodPressure > 80:
            action_plan.append("💓 Heart Health: Monitor your blood pressure. Reduce sodium intake and manage stress.")
        action_plan.append("🩸 Monitoring: Begin daily monitoring of blood glucose levels as advised by a healthcare provider.")
    else:
        action_plan.append("🟢 Health Maintenance: Continue your current healthy lifestyle habits.")
        action_plan.append("🥗 Preventive Diet: Maintain a balanced diet rich in whole foods, fiber, and lean proteins.")
        action_plan.append("🏃 Preventive Exercise: Consistent physical activity helps maintain insulin sensitivity.")
        if data.bmi >= 25:
            action_plan.append("⚖️ Weight Management: Slight reduction in BMI can drastically lower future risk of diabetes.")
        action_plan.append("📅 Checkups: Schedule an annual metabolic screening with your physician.")

    return {
        "prediction": result,
        "probability": f"{round(probability * 100, 2)}%",
        "precautions": action_plan,
        "analysis": f"Based on your profile (Glucose: {data.glucose} mg/dL, BMI: {data.bmi}), our AI model evaluates your clinical status as {result}."
    }
