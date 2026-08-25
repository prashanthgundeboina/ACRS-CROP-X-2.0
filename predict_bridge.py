import sys
import json
import joblib
import numpy as np
import pandas as pd
import os

def load_artifacts():
    try:
        model = joblib.load('model.pkl')
        scaler = joblib.load('scaler.pkl')
        le = joblib.load('label_encoder.pkl')
        yield_model = joblib.load('yield_model.pkl')
        return model, scaler, le, yield_model
    except Exception as e:
        print(json.dumps({"error": f"Failed to load artifacts: {str(e)}"}))
        sys.exit(1)

def preprocess_input(input_dict, scaler):
    cols = [
        'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall',
        'soil_moisture', 'soil_type', 'sunlight_exposure', 'wind_speed',
        'co2_concentration', 'organic_matter', 'irrigation_frequency',
        'crop_density', 'pest_pressure', 'fertilizer_usage', 'growth_stage',
        'urban_area_proximity', 'water_source_type', 'frost_risk',
        'water_usage_efficiency'
    ]
    input_data = [input_dict[col] for col in cols]
    input_df = pd.DataFrame([input_data], columns=cols)
    scaled_data = scaler.transform(input_df)
    return scaled_data

def main():
    try:
        # Read JSON string from stdin or command line arguments
        if len(sys.argv) > 1:
            input_str = sys.argv[1]
        else:
            input_str = sys.stdin.read()
            
        input_dict = json.loads(input_str)
        
        model, scaler, le, yield_model = load_artifacts()
        processed = preprocess_input(input_dict, scaler)
        
        # 1. Get Classification Probabilities
        probs = model.predict_proba(processed)[0]
        top_indices = np.argsort(probs)[-3:][::-1]
        
        recommendations = []
        for idx in top_indices:
            recommendations.append({
                'crop': le.inverse_transform([idx])[0],
                'confidence': round(float(probs[idx]) * 100, 2)
            })
            
        # 2. Get Regression Yield prediction
        yield_pred = yield_model.predict(processed)[0]
        
        # Calculate prediction variance/std across forest estimators for confidence
        preds = []
        for estimator in yield_model.estimators_:
            preds.append(estimator.predict(processed)[0])
        std_dev = np.std(preds)
        yield_confidence = max(50.0, min(99.0, 100.0 - (std_dev * 15.0)))
        
        output = {
            "recommendations": recommendations,
            "expected_yield": round(float(yield_pred), 2),
            "yield_confidence": round(float(yield_confidence), 2)
        }
        
        print(json.dumps(output))
        
    except Exception as e:
        print(json.dumps({"error": f"Execution error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
