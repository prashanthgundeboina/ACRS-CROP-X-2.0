import google.generativeai as genai
import os
import json
import io
from PIL import Image, ImageEnhance

class AdvisorEngine:
    def __init__(self):
        # The environment provides GEMINI_API_KEY
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-3.7-flash')
        else:
            self.model = None

    def get_rotation_strategy(self, current_crop, soil_metrics):
        """Recommends a 3-season crop rotation strategy."""
        if not self.model:
            return [f"Next: Legumes (Nitrogen fixing)", "Next: Root vegetables", "Next: Cover crops"]

        prompt = f"""
        Given the current crop '{current_crop}' and soil conditions {soil_metrics},
        propose a sustainable 3-season crop rotation strategy.
        Consider nutrient depletion and pest cycles.
        Return the result as a simple bulleted list of 3 crops with a 1-sentence reason for each.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text.split('\n')
        except:
            return ["Strategy optimization pending..."]

    def diagnose_plant_health(self, image_bytes):
        """Preprocesses the image to enhance subtle pest/disease signatures and identifies them using Gemini."""
        if not self.model:
            return "AI Diagnosis requires a valid GEMINI_API_KEY."

        try:
            # 1. Image Preprocessing for Advanced Diagnostics (Contrast & Sharpness Enhancement)
            image = Image.open(io.BytesIO(image_bytes))
            # Resize while keeping aspect ratio if too large
            image.thumbnail((1024, 1024))
            
            # Enhance contrast slightly to make fungal lesions/spot margins stand out
            contrast = ImageEnhance.Contrast(image)
            image = contrast.enhance(1.25)
            
            # Enhance sharpness to highlight fine insect legs, mites, or spores
            sharpness = ImageEnhance.Sharpness(image)
            image = sharpness.enhance(1.35)
            
            # Save preprocessed image back to bytes for API transfer
            buffered = io.BytesIO()
            image.save(buffered, format="JPEG", quality=85)
            optimized_bytes = buffered.getvalue()
        except Exception as e:
            # Fallback to original bytes if PIL fails
            optimized_bytes = image_bytes

        prompt = """
        You are a Senior Agronomist and Plant Pathologist specializing in digital precision crop diagnosis.
        Examine this crop image closely (note: it has been contrast-and-sharpness-enhanced to expose micro-details like lesions, egg clutches, fungal mycelia, or tiny insect pests).
        
        Provide a highly accurate, structured diagnostic report including:
        1. **Primary Diagnosis**: Identify the exact pest, pathogen (fungal, bacterial, viral), or abiotic nutrient deficiency. Use both common and scientific names if applicable.
        2. **Visual Evidence**: Describe the specific symptoms detected (e.g., chlorosis patterns, necrotic spots, frass, webbings).
        3. **Confidence Level**: Estimate your confidence (0-100%) based on the visual details.
        4. **Actionable Containment Strategy**: Provide immediate, clear, non-jargon steps for treatment:
           - Organic/Biological solutions (e.g., neem oil, Bacillus thuringiensis).
           - Chemical solutions (with recommended dose/compounds if critical).
        5. **Long-Term Preventive Measures**: Suggest cultural practices (crop spacing, soil health, moisture levels) to prevent recurrence.
        """
        
        try:
            response = self.model.generate_content([prompt, {"mime_type": "image/jpeg", "data": optimized_bytes}])
            return response.text
        except Exception as e:
            return f"Diagnostic Engine Error: {e}"

    def get_soil_advice(self, score, metrics):
        """Provides expert advice based on the soil health score."""
        if not self.model:
            return "Optimize your soil by increasing organic matter and balancing pH."

        prompt = f"""
        Soil Health Score: {score}/100.
        Current Matrix: {metrics}.
        As an expert agronomist, provide 3 punchy, high-impact pieces of advice to improve this soil's productivity.
        """
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except:
            return "Advice compilation failed. Please check parameters."
