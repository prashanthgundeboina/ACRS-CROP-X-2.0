import joblib
import numpy as np
import pandas as pd
import os

def load_artifacts():
    """Loads the model, scaler, and label encoder."""
    try:
        model = joblib.load('model.pkl')
        scaler = joblib.load('scaler.pkl')
        le = joblib.load('label_encoder.pkl')
        return model, scaler, le
    except Exception as e:
        print(f"Error loading artifacts: {e}")
        return None, None, None

def preprocess_input(input_dict, scaler):
    """Converts input dict to scaled numpy array."""
    # Ensure correct order based on training columns
    # N,P,K,temperature,humidity,ph,rainfall,soil_moisture,soil_type,
    # sunlight_exposure,wind_speed,co2_concentration,organic_matter,
    # irrigation_frequency,crop_density,pest_pressure,fertilizer_usage,
    # growth_stage,urban_area_proximity,water_source_type,frost_risk,water_usage_efficiency
    
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

def predict_crop(input_dict, model_name="Auto"):
    """Full prediction pipeline with model selection."""
    model, scaler, le = load_artifacts()
    if model is None:
        return None
    
    processed = preprocess_input(input_dict, scaler)
    
    # Use ModelManager for specific model predictions
    from model_manager import ModelManager
    manager = ModelManager()
    try:
        probs = manager.get_prediction(model_name, processed)
    except Exception as e:
        print(f"ModelManager failed for {model_name}, falling back to default model: {e}")
        probs = model.predict_proba(processed)[0]

    top_indices = np.argsort(probs)[-3:][::-1]
    
    recommendations = []
    for idx in top_indices:
        recommendations.append({
            'crop': le.inverse_transform([idx])[0],
            'confidence': round(probs[idx] * 100, 2)
        })
    
    return recommendations

def generate_farming_tips(input_dict):
    """Generates dynamic tips based on soil and environment."""
    tips = []
    
    # Nitrogen logic
    if input_dict['N'] < 30:
        tips.append(" nitrogen concentrations are low. Consider using Urea or Ammonium Nitrate.")
    elif input_dict['N'] > 100:
        tips.append("High nitrogen detected. Limit further nitrogen input to avoid crop burning.")

    # pH logic
    if input_dict['ph'] < 6:
        tips.append("Soil is acidic. Applying agricultural lime can help raise the pH balance.")
    elif input_dict['ph'] > 7.5:
        tips.append("Soil is alkaline. Consider adding sulfur or organic mulch to lower pH.")

    # Rainfall logic
    if input_dict['rainfall'] < 100:
        tips.append("Rainfall is minimal. Setting up a Drip Irrigation system is highly recommended.")
    
    # Pest Pressure
    if input_dict['pest_pressure'] > 50:
        tips.append("High pest pressure alert! Inspect your fields for infestations and apply organic bio-pesticides.")

    # Organic Matter
    if input_dict['organic_matter'] < 2:
        tips.append("Soil organic matter is low. Incorporate compost or green manure to improve soil health.")

    if not tips:
        tips.append("Your soil metrics are balanced. Maintain current sustainable farming practices.")
        
    return tips
