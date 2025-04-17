from tensorflow.keras.preprocessing import image
import numpy as np

def preprocess_xception(img_path):
    """
    Preprocess an image for the Xception model.
    
    Args:
        img_path (str): Path to the uploaded image file.
    
    Returns:
        np.ndarray: Preprocessed image ready for prediction.
    """
    try:
        # Load the image and resize it to (299, 299)
        img = image.load_img(img_path, target_size=(299, 299))
        
        # Convert the image to a NumPy array
        img_array = image.img_to_array(img)
        
        # Normalize pixel values to [0, 1]
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        raise


def preprocess_cnn(img_path):
    """
    Preprocess an image for the CNN model (Model2CNN).
    
    Args:
        img_path (str): Path to the uploaded image file.
    
    Returns:
        np.ndarray: Preprocessed image ready for prediction.
    """
    try:
        # Load the image and resize it to (224, 224)
        img = image.load_img(img_path, target_size=(224, 224))
        
        # Convert the image to a NumPy array
        img_array = image.img_to_array(img)
        
        # Normalize pixel values to [0, 1] using rescale=1./255
        img_array = img_array / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        raise


def preprocess_efficientnetb4(img_path):
    """
    Preprocess an image for the EfficientNetB4 model.
    
    Args:
        img_path (str): Path to the uploaded image file.
    
    Returns:
        np.ndarray: Preprocessed image ready for prediction.
    """
    try:
        # Load the image and resize it to (224, 224)
        img = image.load_img(img_path, target_size=(224, 224))
        
        # Convert the image to a NumPy array
        img_array = image.img_to_array(img)
        
        # No normalization required for EfficientNetB4
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    
    except Exception as e:
        print(f"Error during preprocessing: {e}")
        raise


# Generic preprocessing function
def preprocess_image(model_name, img_path):
    """
    Select and apply the appropriate preprocessing function based on the model name.
    
    Args:
        model_name (str): Name of the selected model.
        img_path (str): Path to the uploaded image file.
    
    Returns:
        np.ndarray: Preprocessed image ready for prediction.
    """
    if model_name == "brain_tumor_xception":
        return preprocess_xception(img_path)
    elif model_name == "Model2CNN":
        return preprocess_cnn(img_path)
    elif model_name == "brain_tumor_efficientnetb4":
        return preprocess_efficientnetb4(img_path)
    else:
        raise ValueError(f"Preprocessing for model '{model_name}' is not defined.")