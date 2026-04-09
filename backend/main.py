from fastapi import FastAPI
from pydantic import BaseModel
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

# Load Model and Scaler
model = joblib.load('model_service/diabetes_model.pkl')
scaler = joblib.load('model_service/scaler.pkl')

class HealthData(BaseModel):
    pregnancies: float
    glucose: float
    bloodPressure: float
    skinThickness: float
    insulin: float
    bmi: float
    dpf: float
    age: float

@app.post("/predict")
async def predict_risk(data: HealthData):
    input_data = np.array([[data.pregnancies, data.glucose, data.bloodPressure, 
                           data.skinThickness, data.insulin, data.bmi, data.dpf, data.age]])
    
    # Scale input
    scaled_data = scaler.transform(input_data)
    prediction = model.predict(scaled_data)[0]
    probability = model.predict_proba(scaled_data)[0][1]

    # Analysis & Precautions
    result = "High Risk" if prediction == 1 else "Low Risk"
    precautions = [
        "Monitor blood sugar daily",
        "Maintain a healthy diet low in processed sugars",
        "Engage in at least 30 mins of physical activity"
    ] if prediction == 1 else ["Continue regular checkups", "Maintain balanced diet"]

    return {
        "prediction": result,
        "probability": f"{round(probability * 100, 2)}%",
        "precautions": precautions,
        "analysis": f"Based on your glucose levels ({data.glucose}) and BMI ({data.bmi}), our model suggests a {result}."
    }
