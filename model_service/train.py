import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.calibration import CalibratedClassifierCV

# 1. Load Data
df = pd.read_csv('data/diabetes.csv')

# Drop Pregnancies column — not used in this model
df = df.drop('Pregnancies', axis=1)

# 2. Preprocessing (Handle zeros in physical parameters)
cols_fix = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[cols_fix] = df[cols_fix].replace(0, np.nan)
for col in cols_fix:
    df[col] = df[col].fillna(df[col].median())

# 3. Handle outliers using IQR Method
# This significantly boosts accuracy on noisy clinical data
Q1 = df.quantile(0.15)
Q3 = df.quantile(0.85)
IQR = Q3 - Q1
# Only keep rows within 1.5 * IQR for all columns
df_clean = df[~((df < (Q1 - 1.5 * IQR)) | (df > (Q3 + 1.5 * IQR))).any(axis=1)]

# 4. Features & Target
X = df_clean.drop('Outcome', axis=1)
y = df_clean['Outcome']

# 4. Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 6. Train Model (Tuned parameters from GridSearch + Calibration)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

rf_model = RandomForestClassifier(
    n_estimators=500, 
    max_depth=15, 
    min_samples_split=2, 
    min_samples_leaf=4, 
    bootstrap=True, 
    random_state=42
)

# Apply Platt Scaling (sigmoid calibration) to fix Random Forest's natural probability compression
model = CalibratedClassifierCV(estimator=rf_model, method='sigmoid', cv=5)
model.fit(X_train, y_train)

# 6. Evaluate Model
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
cm  = confusion_matrix(y_test, y_pred)

print("\n" + "=" * 56)
print("        [+] MODEL PERFORMANCE REPORT")
print("=" * 56)
print(f"  [+] Accuracy Score     : {acc * 100:.2f}%")
print(f"  [info] Total Records      : {len(y)}")
print(f"  [info] Train / Test Split : {len(y_train)} / {len(y_test)}")
print(f"  [info] Features Used      : {X.shape[1]}")
print("\n  Classification Report:")
print(classification_report(y_test, y_pred,
      target_names=['No Diabetes', 'Diabetes'], digits=4))
print("  Confusion Matrix (rows = Actual, cols = Predicted):")
print(f"                  No Diabetes   Diabetes")
print(f"  No Diabetes  :  {cm[0][0]:>11}   {cm[0][1]:>8}")
print(f"  Diabetes     :  {cm[1][0]:>11}   {cm[1][1]:>8}")
print("=" * 56 + "\n")

# 7. Save Artifacts
joblib.dump(model, 'model_service/diabetes_model.pkl')
joblib.dump(scaler, 'model_service/scaler.pkl')
print("[+] Model and Scaler saved successfully!")
