from flask import Flask, render_template, request, jsonify
import tensorflow as tf
from preprocess import preprocess_image  # Import preprocessing functions
import os
import json

app = Flask(__name__)

# Load model metadata (including class labels and evaluation metrics for each model)
with open('metadata.json', 'r') as f:
    model_metadata = json.load(f)

# Load only the models that exist in the "models/" directory
models = {}
for model_name in model_metadata['models'].keys():
    # Check for both .h5 and .keras file extensions
    h5_path = f'models/{model_name}.h5'
    keras_path = f'models/{model_name}.keras'
    
    if os.path.exists(h5_path):  # Check if the .h5 file exists
        model_path = h5_path
    elif os.path.exists(keras_path):  # Check if the .keras file exists
        model_path = keras_path
    else:
        print(f"Skipping model (file not found): {model_name}")
        continue  # Skip this model if neither file exists

    # Load the model
    models[model_name] = tf.keras.models.load_model(model_path)
    print(f"Loaded model: {model_name}")

@app.route('/')
def index():
    """
    Render the main webpage with model options.
    """
    return render_template('index.html', models=model_metadata['models'])

@app.route('/get-model-details', methods=['GET'])
def get_model_details():
    """
    Return the metadata for all models.
    """
    try:
        # Return the metadata as JSON
        return jsonify(model_metadata)
    except Exception as e:
        print(f"Error loading metadata: {e}")
        return jsonify({"error": "Failed to load model details"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """
    Handle image uploads and return predictions.
    """
    try:
        # Get selected model and uploaded image
        selected_model = request.form['model']
        image = request.files['image']

        # Check if the selected model is loaded
        if selected_model not in models:
            return jsonify({"error": f"Model '{selected_model}' is not available."}), 400

        # Save the uploaded image temporarily
        img_path = "temp_image.jpg"
        image.save(img_path)

        # Preprocess the image based on the selected model
        preprocessed_image = preprocess_image(selected_model, img_path)

        # Make prediction using the selected model
        model = models[selected_model]
        predictions = model.predict(preprocessed_image)
        probs = list(predictions[0])  # Extract probabilities for each class

        # Dynamically fetch class labels from metadata
        CLASS_TYPES = model_metadata['models'][selected_model]["class_labels"]

        # Get the predicted class and confidence
        predicted_class_index = max(range(len(probs)), key=probs.__getitem__)  # Equivalent to np.argmax
        predicted_class = CLASS_TYPES[predicted_class_index]
        confidence = round(probs[predicted_class_index] * 100, 2)

        # Return the result as JSON
        return jsonify({
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)