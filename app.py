import streamlit as st
import pandas as pd
import numpy as np
from utils import predict_crop, generate_farming_tips, load_artifacts
import os
import joblib
import matplotlib.pyplot as plt
import json
import base64
import plotly.graph_objects as go
from soil_analyzer import calculate_soil_health_score, get_soil_health_label
from advisor_engine import AdvisorEngine
from weather_service import WeatherService

# Page configuration
st.set_page_config(
    page_title="CROP RECOMENDATION SYSTEM PRO",
    page_icon="🌾",
    layout="wide"
)

# Initialize AI Advisor
advisor = AdvisorEngine()

# Custom CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap');
    
    html, body, [class*="st-"] {
        font-family: 'Inter', sans-serif;
    }

    .main {
        background: radial-gradient(circle at top right, #f0f7f0, #e8eee8);
    }

    /* 3D Glassmorphism Cards */
    .card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        padding: 1.5rem;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: 10px 10px 20px rgba(0,0,0,0.05), -5px -5px 15px rgba(255,255,255,0.8);
        margin-bottom: 1.5rem;
        transition: transform 0.3s ease;
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }
    
    .card:hover {
        transform: translateY(-5px) scale(1.01);
        box-shadow: 15px 15px 30px rgba(0,0,0,0.1);
    }

    .stTitle {
        font-family: 'Orbitron', sans-serif;
        background: linear-gradient(90deg, #2e7d32, #4CAF50);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        font-weight: 700;
        letter-spacing: 2px;
    }

    .alert-banner {
        background: linear-gradient(135deg, #fff5f5 0%, #ffebee 100%);
        color: #c62828;
        padding: 1.2rem;
        border-radius: 15px;
        margin-bottom: 1.5rem;
        border: 1px solid #ffcdd2;
        box-shadow: 5px 5px 15px rgba(198, 40, 40, 0.1);
        font-weight: 600;
    }

    .metric-box {
        background: white;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        border: 1px solid #e0e0e0;
        box-shadow: inset -5px -5px 10px rgba(255,255,255,0.8), 5px 5px 10px rgba(0,0,0,0.05);
        color: #1b5e20;
    }

    .crop-img {
        width: 100px;
        height: 100px;
        border-radius: 18px;
        object-fit: cover;
        box-shadow: 5px 5px 10px rgba(0,0,0,0.1);
        border: 2px solid white;
    }

    .vitality-card {
        background: white;
        padding: 2rem;
        border-radius: 25px;
        box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
        margin-bottom: 2rem;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)

# Title Area
st.title("🌾 CROP RECOMENDATION SYSTEM PRO")

# Real-time Weather Alert Simulation
def display_weather_alerts(city):
    svc = WeatherService()
    w_data = svc.get_weather(city)
    if "error" not in w_data:
        alerts = []
        if w_data['temperature'] < 5:
            alerts.append("❄️ **Frost Alert**: Critical temperature drop detected. Inspect row covers.")
        if w_data['predicted_rain_24h'] > 30:
            alerts.append("🌧️ **Flood Risk**: Heavy precipitation forecast (24h). Optimize field drainage.")
        if w_data['wind_speed'] > 40:
            alerts.append("💨 **High Wind**: Gale force winds detected. Secure lightweight infrastructure.")
        
        for alert in alerts:
            st.markdown(f"<div class='alert-banner'>{alert}</div>", unsafe_allow_html=True)
    return w_data

if 'city' not in st.session_state: st.session_state['city'] = "Nairobi"
w_current = display_weather_alerts(st.session_state['city'])
st.markdown("---")

if not os.path.exists('model_performance_metrics.pkl'):
    with st.spinner("Initializing Futuristic Hybrid Engine..."):
        import subprocess
        subprocess.run(["python", "main.py"])
    st.success("Hybrid Intelligence Matrix Optimized!")

tab1, tab2, tab3, tab4 = st.tabs(["🌾 Prediction Engine", "📊 Model Performance", "🌦️ Weather Insights", "🏥 Health Diagnostics"])

with tab2:
    st.header("📈 Enterprise Model Benchmarking")
    try:
        metrics_data = joblib.load('model_performance_metrics.pkl')
        perf_df = pd.DataFrame(metrics_data).T
        col_m1, col_m2 = st.columns(2)
        with col_m1:
            st.subheader("Accuracy Comparison")
            st.bar_chart(perf_df['accuracy'])
        with col_m2:
            st.subheader("Model Metric Matrix")
            st.dataframe(perf_df.style.highlight_max(axis=0, color='#e8f5e9'))

        st.markdown("---")
        st.subheader("📐 3D Nutrient Space Visualization")
        if os.path.exists('dataset.csv'):
            df_plot = pd.read_csv('dataset.csv').sample(min(800, len(pd.read_csv('dataset.csv'))))
            fig_3d = go.Figure(data=[go.Scatter3d(
                x=df_plot['N'], y=df_plot['P'], z=df_plot['K'],
                mode='markers',
                marker=dict(size=3, color=df_plot['ph'], colorscale='Viridis', opacity=0.7),
                text=df_plot['label']
            )])
            fig_3d.update_layout(scene=dict(xaxis_title='N', yaxis_title='P', zaxis_title='K'), margin=dict(l=0,r=0,b=0,t=0))
            st.plotly_chart(fig_3d, use_container_width=True)

        st.markdown("---")
        st.subheader("🧬 Global Feature Importance (SHAP)")
        if os.path.exists('shap_values.pkl'):
            import shap
            shap_values = joblib.load('shap_values.pkl')
            feature_names = joblib.load('feature_names.pkl')
            fig, ax = plt.subplots(figsize=(10, 5))
            shap.summary_plot(shap_values, feature_names=feature_names, plot_type="bar", show=False)
            st.pyplot(fig)
    except Exception as e:
        st.error(f"Performance data unavailable: {e}")

with tab4:
    st.header("🏥 Plant Health Diagnostics")
    st.info("Identify pests and diseases via AI image recognition and generate real-time containment strategies.")
    
    # Alert Area for identified threats
    if 'threat_alerts' not in st.session_state: st.session_state['threat_alerts'] = []
    
    for alert in st.session_state['threat_alerts']:
        st.error(f"🚩 **DANGER ALERT**: {alert}")

    uploaded_file = st.file_uploader("Upload Crop Specimen Image", type=["jpg", "jpeg", "png"])
    if uploaded_file:
        file_bytes = uploaded_file.read()
        st.image(file_bytes, caption="Specimen Image")
        if st.button("🔬 Execute Multimodal Diagnosis"):
            with st.spinner("AI scanning cellular structures for biological threats..."):
                diagnosis = advisor.diagnose_plant_health(file_bytes)
                
                # Check for threat keywords to trigger alerts
                threat_keywords = ["pest", "disease", "infestation", "fungus", "virus", "blight", "locust"]
                if any(k in diagnosis.lower() for k in threat_keywords):
                    summary = diagnosis.split('.')[0] if '.' in diagnosis else "Biological threat identified."
                    st.session_state['threat_alerts'].insert(0, summary)
                
                st.markdown(f"""
                <div class='vitality-card' style='text-align:left;'>
                    <h3 style='color: #2e7d32; border-bottom: 2px solid #4CAF50; padding-bottom: 0.5rem;'>Diagnostic Intelligence Report</h3>
                    <div style='margin-top: 1rem; line-height: 1.8;'>{diagnosis}</div>
                </div>
                """, unsafe_allow_html=True)
                
                if st.button("Clear Alerts"):
                    st.session_state['threat_alerts'] = []
                    st.rerun()

with tab3:
    st.header("🌦️ Multi-Location Sync")
    svc = WeatherService()
    cities_in = st.text_input("Enter Cities (comma-separated)", st.session_state['city'])
    if st.button("Analyze Regional Operations"):
        clist = [c.strip() for c in cities_in.split(',')]
        comps = svc.compare_locations(clist)
        if comps:
            st.dataframe(pd.DataFrame(comps)[['city', 'temperature', 'humidity', 'predicted_rain_24h']])
            sel_city = st.selectbox("Set Primary Site", [c['city'] for c in comps])
            if st.button("Activate Site"):
                st.session_state['city'] = sel_city
                st.rerun()

with tab1:
    st.sidebar.title("Intelligence Core")
    with st.sidebar:
        try:
            m_dict = joblib.load('model_performance_metrics.pkl')
            avail = ["Auto"] + list(m_dict.keys())
        except: avail = ["Auto", "KNN", "RandomForest"]
        sel_model = st.selectbox("Inference Engine", avail)
        if sel_model == "Auto": st.caption(f"🚀 Recommended: {joblib.load('best_model_name.pkl')}")

        st.header("Matrix Inputs")
        n = st.slider("Nitrogen", 0, 140, 90)
        p = st.slider("Phosphorus", 0, 145, 42)
        k = st.slider("Potassium", 0, 205, 43)
        temp = st.number_input("Temp", 0.0, 50.0, st.session_state.get('temp_auto', 20.8))
        hum = st.number_input("Hum", 0.0, 100.0, st.session_state.get('hum_auto', 82.0))
        ph = st.number_input("pH", 0.0, 14.0, 6.5)
        rain = st.number_input("Rain", 0.0, 500.0, st.session_state.get('rain_auto', 202.9))
        
        with st.expander("Soil Detail"):
            soil_moist = st.slider("Moisture %", 0, 100, 30)
            soil_type = st.selectbox("Type", [1,2,3,4,5], index=1)
            sun = st.slider("Sun", 0.0, 12.0, 8.0)
            wind = st.slider("Wind", 0, 100, 10)
            co2 = st.number_input("CO2", 300, 600, 400)
            org = st.slider("Organic %", 0.0, 10.0, 3.0)
            irr = st.slider("Irrigation", 0, 10, 4)
            dens = st.slider("Density", 0, 100, 15)
            pest_p = st.slider("Pest %", 0, 100, 10)
            fert = st.number_input("Fertilizer", 0, 500, 200)
            growth = st.selectbox("Stage", [1,2,3], 0)
            urban = st.number_input("Urban dist", 0, 100, 10)
            wat_src = st.selectbox("Water Src", [1,2,3], 0)
            frost = st.slider("Frost %", 0, 100, 5)
            eff = st.slider("Efficiency", 0.0, 10.0, 5.0)

    in_dict = {
        'N': n, 'P': p, 'K': k, 'temperature': temp, 'humidity': hum, 'ph': ph, 'rainfall': rain,
        'soil_moisture': soil_moist, 'soil_type': soil_type, 'sunlight_exposure': sun, 'wind_speed': wind,
        'co2_concentration': co2, 'organic_matter': org, 'irrigation_frequency': irr, 'crop_density': dens,
        'pest_pressure': pest_p, 'fertilizer_usage': fert, 'growth_stage': growth, 'urban_area_proximity': urban,
        'water_source_type': wat_src, 'frost_risk': frost, 'water_usage_efficiency': eff
    }

    col_a, col_b = st.columns([1, 1.2])
    with col_a:
        st.subheader("📋 Soil Matrix")
        score = calculate_soil_health_score(in_dict)
        lbl, desc, clr = get_soil_health_label(score)
        st.markdown(f"""
        <div class='vitality-card' style='border-top: 8px solid {clr};'>
            <div style='font-size: 0.8rem; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 2px;'>Soil Vitality Quotient</div>
            <div style='position: relative; height: 12px; background: #eee; border-radius: 6px; margin: 2rem 0;'>
                <div style='position: absolute; left: 0; top: 0; height: 100%; width: {score}%; background: {clr}; border-radius: 6px; box-shadow: 0 0 15px {clr}88;'></div>
            </div>
            <div style='display: flex; align-items: baseline; justify-content: center; gap: 0.3rem;'>
                <h1 style='font-size: 5rem; font-weight: 900; color: {clr}; margin: 0;'>{score}</h1>
                <span style='font-size: 1.5rem; color: #ccc; font-weight: 600;'>/ 100</span>
            </div>
            <h3 style='margin-top: 1rem; color: #333; font-weight: 700;'>Category: <span style='color: {clr}'>{lbl}</span></h3>
            <p style='color: #666; font-size: 0.9rem; line-height: 1.6; max-width: 300px; margin: 0.5rem auto;'>{desc}</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Enhanced 3D visualization within the analyzer section
        st.markdown("### 🗺️ Spatially-Aware Nutrient Terrain")
        if os.path.exists('dataset.csv'):
            df_plot = pd.read_csv('dataset.csv').sample(min(400, len(pd.read_csv('dataset.csv'))))
            
            # User's current point
            user_point = pd.DataFrame([{
                'N': n, 'P': p, 'K': k, 'ph': ph, 'soil_moisture': soil_moist, 'label': 'Current LAND'
            }])
            
            fig_soil = go.Figure()
            
            # Historical Cloud
            fig_soil.add_trace(go.Scatter3d(
                x=df_plot['N'], y=df_plot['P'], z=df_plot['K'],
                mode='markers',
                marker=dict(size=2, color=df_plot['ph'], colorscale='YlGnBu', opacity=0.3),
                name='Global Database',
                hovertemplate="N: %{x}<br>P: %{y}<br>K: %{z}<br>pH: %{marker.color}"
            ))
            
            # User Point
            fig_soil.add_trace(go.Scatter3d(
                x=user_point['N'], y=user_point['P'], z=user_point['K'],
                mode='markers',
                marker=dict(size=12, color='#ffeb3b', opacity=1, symbol='diamond', 
                            line=dict(color='black', width=2)),
                name='Your Field',
                hovertemplate="<b>YOUR FIELD</b><br>N: %{x}<br>P: %{y}<br>K: %{z}"
            ))
            
            fig_soil.update_layout(
                paper_bgcolor='rgba(0,0,0,0)',
                plot_bgcolor='rgba(0,0,0,0)',
                scene=dict(
                    xaxis=dict(gridcolor='#eee', backgroundcolor='#f7faf7'),
                    yaxis=dict(gridcolor='#eee', backgroundcolor='#f7faf7'),
                    zaxis=dict(gridcolor='#eee', backgroundcolor='#f7faf7'),
                    xaxis_title='Nitrogen', yaxis_title='Phosphorus', zaxis_title='Potassium'
                ),
                margin=dict(l=0, r=0, b=0, t=0),
                legend=dict(yanchor="top", y=0.99, xanchor="left", x=0.01)
            )
            st.plotly_chart(fig_soil, use_container_width=True)
        
        if st.button("🚀 Run AI Inference"):
            res = predict_crop(in_dict, sel_model)
            if res: st.session_state['res'] = res

    with col_b:
        if 'res' in st.session_state:
            st.subheader("🎯 Optimization Roadmap")
            
            CROP_IMAGES = {
                'rice': "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80",
                'maize': "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80",
                'chickpea': "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
                'kidneybeans': "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
                'pigeonpeas': "https://images.unsplash.com/photo-1547058886-af77f8029163?auto=format&fit=crop&w=600&q=80",
                'mothbeans': "https://images.unsplash.com/photo-1547058886-af77f8029163?auto=format&fit=crop&w=600&q=80",
                'mungbean': "https://images.unsplash.com/photo-1582845343110-631d8f7e2fe0?auto=format&fit=crop&w=600&q=80",
                'blackgram': "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
                'lentil': "https://images.unsplash.com/photo-1547058886-af77f8029163?auto=format&fit=crop&w=600&q=80",
                'pomegranate': "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80",
                'banana': "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
                'mango': "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
                'grapes': "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
                'watermelon': "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
                'muskmelon': "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
                'apple': "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
                'orange': "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=600&q=80",
                'papaya': "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=600&q=80",
                'coconut': "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80",
                'cotton': "https://images.unsplash.com/photo-1594145413237-7751b34ea6cf?auto=format&fit=crop&w=600&q=80",
                'jute': "https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?auto=format&fit=crop&w=600&q=80",
                'coffee': "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
            }
            fallback_img = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80"

            for i, r in enumerate(st.session_state['res']):
                cname = r['crop']
                img_url = CROP_IMAGES.get(cname.lower(), fallback_img)
                st.markdown(f"""
                <div class='card'>
                    <img src='{img_url}' class='crop-img' referrerPolicy='no-referrer' />
                    <div>
                        <div class='card-title'>{i+1}. {cname.title()}</div>
                        <b>{r['confidence']}% Match</b>
                    </div>
                </div>""", unsafe_allow_html=True)
            
            st.markdown("---")
            st.subheader("🔄 Strategic Crop Rotation")
            rot_strat = advisor.get_rotation_strategy(st.session_state['res'][0]['crop'], in_dict)
            for s in rot_strat: st.write(s)
            
            st.markdown("---")
            st.subheader("💡 Agronomic Advice")
            st.write(advisor.get_soil_advice(score, in_dict))
        else: st.info("Initialize inference system...")

st.markdown("---")
st.caption("🌾 CROP RECOMENDATION SYSTEM PRO • Global Agricultural Neural Matrix • 2026")
