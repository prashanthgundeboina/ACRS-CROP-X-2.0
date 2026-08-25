from model_manager import ModelManager

def train_model():
    manager = ModelManager()
    try:
        manager.train_all_models()
        print("Hybrid Model Training and ModelManager setup successful.")
    except Exception as e:
        print(f"Training failed: {e}")

if __name__ == "__main__":
    train_model()
