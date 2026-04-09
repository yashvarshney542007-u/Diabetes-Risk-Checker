import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier

# 1. Load Data
df = pd.read_csv('data/diabetes.csv')

# 2. Preprocessing (Handle zeros in physical parameters)
cols_fix = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[cols_fix] = df[cols_fix].replace(0, np.nan)
for col in cols_fix:
    df[col] = df[col].fillna(df[col].median())

# 3. Features & Target
X = df.drop('Outcome', axis=1)
y = df['Outcome']

# 4. Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 5. Train Model (Random Forest is robust for this data)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# 6. Save Artifacts
joblib.dump(model, 'model_service/diabetes_model.pkl')
joblib.dump(scaler, 'model_service/scaler.pkl')
print("Model and Scaler saved successfully!")
