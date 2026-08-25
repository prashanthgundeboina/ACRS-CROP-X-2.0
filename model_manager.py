import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
import json

# Try to import XGBoost and SHAP
try:
    from xgboost import XGBClassifier
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

class ModelManager:
    def __init__(self, data_path='dataset.csv'):
        self.data_path = data_path
        self.models = {}
        self.metrics = {}  # Store accuracy, precision, recall, f1
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.best_model_name = None

    def load_and_preprocess(self):
        if not os.path.exists(self.data_path):
            raise FileNotFoundError(f"{self.data_path} not found.")

        df = pd.read_csv(self.data_path)
        df = df.dropna()

        # Encoding target
        y = self.label_encoder.fit_transform(df['label'])
        X = df.drop('label', axis=1)

        # Scaling features
        X_scaled = self.scaler.fit_transform(X)

        joblib.dump(self.label_encoder, 'label_encoder.pkl')
        joblib.dump(self.scaler, 'scaler.pkl')
        
        # Save feature names for SHAP
        joblib.dump(X.columns.tolist(), 'feature_names.pkl')

        return train_test_split(X_scaled, y, test_size=0.2, random_state=42), X

    def train_all_models(self):
        (X_train, X_test, y_train, y_test), X_raw = self.load_and_preprocess()

        # Define Models
        model_pool = {
            "KNN": KNeighborsClassifier(n_neighbors=5, metric='euclidean'),
            "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),
            "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42)
        }

        if XGB_AVAILABLE:
            model_pool["XGBoost"] = XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)

        print("--- Starting Hybrid Model Training ---")
        for name, model in model_pool.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            
            # Calculate classification metrics
            acc = accuracy_score(y_test, y_pred)
            prec = precision_score(y_test, y_pred, average='weighted')
            rec = recall_score(y_test, y_pred, average='weighted')
            f1 = f1_score(y_test, y_pred, average='weighted')
            
            self.models[name] = model
            self.metrics[name] = {
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "f1": f1
            }
            print(f"Model: {name} | Acc: {acc*100:.2f}% | Prec: {prec*100:.2f}%")
            
            # Save individual model
            joblib.dump(model, f'model_{name.lower()}.pkl')

        # Identify Best Model based on accuracy
        self.best_model_name = max(self.metrics, key=lambda k: self.metrics[k]['accuracy'])
        print(f"--- Best Model Identified: {self.best_model_name} ---")
        
        # Save model info
        joblib.dump(self.best_model_name, 'best_model_name.pkl')
        joblib.dump(self.metrics, 'model_performance_metrics.pkl')
        joblib.dump(self.models[self.best_model_name], 'model.pkl')

        # --- Secondary Regression Task (Expected Yield prediction) ---
        print("--- Training Yield Regression Model ---")
        try:
            df_raw = pd.read_csv(self.data_path).dropna()
            # Generate synthetic target yields from agronomic features
            N_vals = df_raw['N']
            P_vals = df_raw['P']
            K_vals = df_raw['K']
            ph_vals = df_raw['ph']
            rainfall_vals = df_raw['rainfall']
            organic_vals = df_raw['organic_matter']
            moisture_vals = df_raw['soil_moisture']
            pest_vals = df_raw['pest_pressure']
            fertilizer_vals = df_raw['fertilizer_usage']
            
            # Agronomic base yield
            ph_penalty = 1.2 * ((ph_vals - 6.5) ** 2)
            nutrient_benefit = 0.015 * N_vals + 0.01 * P_vals + 0.008 * K_vals
            env_benefit = 0.4 * organic_vals + 0.001 * rainfall_vals + 0.05 * moisture_vals
            pest_penalty = 0.03 * pest_vals
            fert_benefit = 0.002 * fertilizer_vals
            
            yield_vals = 3.5 + nutrient_benefit + env_benefit - ph_penalty - pest_penalty + fert_benefit
            yield_vals = np.clip(yield_vals, 1.2, 11.8)
            
            # Add subtle random noise
            np.random.seed(42)
            noise = np.random.normal(0, 0.2, size=len(df_raw))
            yield_vals = np.clip(yield_vals + noise, 1.0, 12.5)
            
            # Train regressor on the full scaled training set
            regressor = RandomForestRegressor(n_estimators=100, random_state=42)
            regressor.fit(X_train, yield_vals[:len(X_train)])
            
            joblib.dump(regressor, 'yield_model.pkl')
            print("Yield regression model trained and saved successfully.")
        except Exception as e:
            print(f"Yield regression training failed: {e}")

        # Calculate SHAP for the best model if it's tree-based (Forest/XGB) or linear
        if SHAP_AVAILABLE:
            try:
                best_model = self.models[self.best_model_name]
                # Sample background data for kernel/tree explainer
                background = X_train[:50]
                
                if self.best_model_name in ["RandomForest", "XGBoost"]:
                    explainer = shap.TreeExplainer(best_model)
                else:
                    # Generic explainer
                    explainer = shap.Explainer(best_model.predict, background)
                
                # Save feature importances based on SHAP values
                # We'll just save the global importance (mean absolute SHAP)
                # Note: Computing full shap values on test set
                shap_values = explainer(X_test[:100])
                joblib.dump(shap_values, 'shap_values.pkl')
                print("SHAP explanations generated.")
            except Exception as e:
                print(f"SHAP explanation failed: {e}")

    def get_prediction(self, model_name, input_scaled):
        if model_name == "Auto":
            model_name = joblib.load('best_model_name.pkl')
        
        # Load specific model
        model = joblib.load(f'model_{model_name.lower()}.pkl')
        probs = model.predict_proba(input_scaled)[0]
        return probs

    def get_yield_prediction(self, input_scaled):
        # Load yield regressor
        model = joblib.load('yield_model.pkl')
        yield_pred = model.predict(input_scaled)[0]
        # Generate a confidence metric/r-squared/std equivalent for error bar representation
        # Since it's a RF, we can compute prediction variance as a confidence metric
        import numpy as np
        preds = []
        for estimator in model.estimators_:
            preds.append(estimator.predict(input_scaled)[0])
        std_dev = np.std(preds)
        # Convert std dev to a 0-100% confidence score
        confidence = max(50, min(99, 100 - (std_dev * 15)))
        return float(yield_pred), float(confidence)

if __name__ == "__main__":
    manager = ModelManager()
    manager.train_all_models()
