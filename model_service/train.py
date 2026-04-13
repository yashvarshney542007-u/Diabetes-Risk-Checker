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

# 6. Train Model (Hyperparameter Tuning with GridSearch + Calibration)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

from sklearn.model_selection import GridSearchCV

# Define the parameter grid
param_grid = {
    'n_estimators': [400, 500, 600, 700],
    'max_depth': [12, 15, 18, None],
    'min_samples_split': [2, 3, 4],
    'min_samples_leaf': [2, 3, 4],
    'bootstrap': [True]
}

print("[+] Running GridSearchCV for Hyperparameter Tuning (this may take a minute)...")
rf_base = RandomForestClassifier(random_state=42)
grid_search = GridSearchCV(estimator=rf_base, param_grid=param_grid, cv=5, n_jobs=-1, scoring='accuracy')
grid_search.fit(X_train, y_train)

print(f"[+] Best Parameters: {grid_search.best_params_}")
best_rf = grid_search.best_estimator_

# Apply Platt Scaling (sigmoid calibration) to fix Random Forest's natural probability compression
model = CalibratedClassifierCV(estimator=best_rf, method='sigmoid', cv=5)
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
