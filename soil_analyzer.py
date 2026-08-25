def calculate_soil_health_score(input_dict):
    """
    Calculates a nuanced soil health score (0-100) based on soil types and agronomic benchmarks.
    Types: 1: Sandy, 2: Loamy, 3: Silty, 4: Clay, 5: Peaty
    """
    score = 100
    soil_type = input_dict.get('soil_type', 2)
    
    # 1. pH Penalty (Ideal is 6.0 to 7.0 for most, but Peaty (5) can handle lower)
    ph = input_dict.get('ph', 6.5)
    if soil_type == 5: # Peaty
        if ph < 4.5 or ph > 7.5: score -= 20
        elif ph < 5.0 or ph > 7.0: score -= 10
    else:
        if ph < 5.5 or ph > 8.0: score -= 20
        elif ph < 6.0 or ph > 7.5: score -= 10
        
    # 2. Nutrient Retention (N) - Sandy soils (1) leach faster, so higher requirements
    n = input_dict.get('N', 80)
    if soil_type == 1: # Sandy
        if n < 70: score -= 15 # Sandy needs more N to be considered "healthy"
    else:
        if n < 40 or n > 150: score -= 15
        elif n < 60: score -= 5
        
    # 3. Organic Matter (Ideal is > 3%, but Clay (4) and Peaty (5) usually have more)
    organic = input_dict.get('organic_matter', 3.0)
    if soil_type in [4, 5]: # Clay or Peaty
        if organic < 4.0: score -= 15 # Expecting higher carbon content
    else:
        if organic < 2.0: score -= 20
        elif organic < 3.0: score -= 10
        
    # 4. Soil Moisture (Nuanced by type)
    moisture = input_dict.get('soil_moisture', 40.0)
    if soil_type == 1: # Sandy (Drains fast)
        if moisture < 20.0: score -= 20 # Low moisture is critical in sandy
    elif soil_type == 4: # Clay (Holds too much)
        if moisture > 70.0: score -= 20 # High moisture causes aeration issues in clay
    else:
        if moisture < 15.0 or moisture > 85.0: score -= 15
        elif moisture < 25.0 or moisture > 75.0: score -= 5
        
    # 5. P & K 
    p = input_dict.get('P', 50)
    k = input_dict.get('K', 50)
    if p < 35: score -= 5
    if k < 35: score -= 5
    
    # 6. Pest Pressure
    pest = input_dict.get('pest_pressure', 0)
    if pest > 50: score -= 20
    elif pest > 25: score -= 10
        
    return max(0, score)

def get_soil_health_label(score):
    if score >= 85: return "Exemplary", "Strong biological activity and nutrient balance.", "#2e7d32"
    if score >= 70: return "Healthy", "Good condition, maintain existing soil maintenance.", "#43a047"
    if score >= 50: return "Stressed", "Moderate deficiency or environmental strain detected.", "#fb8c00"
    return "Degraded", "Urgent intervention required (pH correction or organic loading).", "#e53935"
