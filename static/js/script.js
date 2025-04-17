// Theme Toggle Logic
const themeButton = document.getElementById('theme-button');
const themeIcon = document.getElementById('theme-icon');

// Check for saved user preference in localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Update icon based on current theme
if (savedTheme === 'dark') {
    themeIcon.classList.remove('fa-sun');
    themeIcon.classList.add('fa-moon');
}

// Toggle theme on button click
themeButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Set the new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update the icon
    if (newTheme === 'dark') {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
});

// Drag-and-Drop for File Uploads
const dropArea = document.getElementById('drop-area');
const imagePreview = document.getElementById('image-preview');
const fileInput = document.getElementById('file-input');
const predictButton = document.getElementById('predict-button');
const predictionResult = document.getElementById('prediction-result');

// Highlight drop area when user drags files over it
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    imagePreview.addEventListener(eventName, preventDefaults, false); // Add listeners for image preview
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

dropArea.addEventListener('dragenter', () => dropArea.classList.add('highlight'));
dropArea.addEventListener('dragleave', () => dropArea.classList.remove('highlight'));

// Function to preview the uploaded image
function previewImage(file) {
    const previewContainer = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const fileNameElement = document.getElementById('file-name');

    // Ensure the preview container is visible
    previewContainer.classList.remove('hidden'); // Remove the 'hidden' class
    previewContainer.style.display = 'block'; // Explicitly set display to block

    // Set the file name
    fileNameElement.textContent = `File selected: ${file.name}`;

    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result; // Set the image source

        // Add a "remove image" button if it doesn't already exist
        let removeButton = document.getElementById('remove-image');
        if (!removeButton) {
            removeButton = document.createElement('button');
            removeButton.id = 'remove-image';
            removeButton.innerHTML = '×'; // Red cross symbol
            previewContainer.appendChild(removeButton);

            // Add functionality to the remove button
            removeButton.addEventListener('click', resetUpload);
        }
    };
    reader.onerror = (error) => {
        console.error('Error reading file:', error); // Debugging log
    };
    reader.readAsDataURL(file); // Read the file as a data URL

    // Hide the drag-and-drop area
    dropArea.classList.add('hidden');
    dropArea.style.display = 'none';

    // Enable the predict button
    predictButton.disabled = false;
}

// Function to reset the upload section
function resetUpload() {
    const previewContainer = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const fileNameElement = document.getElementById('file-name');
    const removeButton = document.getElementById('remove-image');

    // Reset the file input
    fileInput.value = '';

    // Reset the preview
    previewImage.src = '#';
    fileNameElement.textContent = '';
    previewContainer.classList.add('hidden');
    previewContainer.style.display = 'none';

    // Remove the "remove image" button if it exists
    if (removeButton) {
        removeButton.remove();
    }

    // Show the drag-and-drop area
    dropArea.classList.remove('hidden');
    dropArea.style.display = 'flex'; // Ensure flexbox alignment is restored
    dropArea.classList.remove('highlight'); // Remove any highlight

    // Disable the predict button
    predictButton.disabled = true;

    // Clear the prediction result
    predictionResult.innerHTML = ''; // Clear any previous prediction
    predictionResult.classList.remove('error'); // Remove error styling
}


function handleFile(file) {
    // Validate the file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    // Clear the current preview only if a file already exists
    if (fileInput.files.length > 0) {
        resetUpload();
    }

    // Use DataTransfer to assign the file to the file input
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files; // Assign the FileList to the file input

    // Preview the image
    previewImage(file);
}

// Click to open file input
dropArea.addEventListener('click', () => fileInput.click());

// Handle file selection via input
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        handleFile(file); // Process the selected file
    }
});

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const imageUrl = dt.getData('text/plain'); // Check if it's a sample image URL
    const files = dt.files;

    if (imageUrl) {
        // Handle sample image drops
        try {
            fetch(imageUrl)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    return response.blob();
                })
                .then(blob => {
                    // Extract the filename from the URL
                    const urlParts = imageUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1]; // Get the last part of the URL (e.g., glioma.jpg)

                    // Create a File object with the correct filename
                    const file = new File([blob], fileName, { type: 'image/jpeg' });
                    handleFile(file); // Process the file
                })
                .catch(error => {
                    console.error('Error fetching sample image:', error);
                    alert('Failed to load the sample image. Please try again.');
                });
        } catch (error) {
            console.error('Error fetching sample image:', error);
        }
    } else if (files.length > 0) {
        // Handle regular file drops
        const file = files[0];
        handleFile(file); // Process the file
    }
}

// Add drop event listeners to both dropArea and imagePreview
dropArea.addEventListener('drop', handleDrop);
imagePreview.addEventListener('drop', handleDrop);

// Drag-and-Drop for Sample Images
document.querySelectorAll('.sample-images').forEach(sampleImage => {
    sampleImage.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', sampleImage.dataset.image);
    });
});

// Fetch Model Details
document.getElementById('info-button').addEventListener('click', async () => {
    const modelInfo = document.getElementById('model-info');
    modelInfo.classList.toggle('hidden'); // Toggle visibility

    if (!modelInfo.classList.contains('hidden')) {
        // Dynamically populate model details only when shown
        const selectedModel = document.getElementById('model').value;
        try {
            const response = await fetch('/get-model-details'); // Replace with your Flask route
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            // Access the model details from the "models" object
            const modelDetails = data.models[selectedModel];
            if (modelDetails) {
                document.getElementById('description').textContent = modelDetails.description || 'N/A';
                document.getElementById('accuracy').textContent = (modelDetails.accuracy * 100).toFixed(2) + '%';
                document.getElementById('precision').textContent = (modelDetails.precision * 100).toFixed(2) + '%';
                document.getElementById('recall').textContent = (modelDetails.recall * 100).toFixed(2) + '%';
            } else {
                console.error('Model details not found for:', selectedModel);
                alert(`No details available for the selected model: ${selectedModel}`);
            }
        } catch (error) {
            console.error('Error fetching model details:', error);
            alert('An error occurred while fetching model details.');
        }
    }
});


// Prediction Button
predictButton.addEventListener('click', async () => {
    // Disable the button and show a loading state
    predictButton.disabled = true;
    predictButton.textContent = 'Predicting...';

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('model', document.getElementById('model').value);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            predictionResult.innerHTML = `
                <p><strong>Predicted Class:</strong> ${result.predicted_class}</p>
                <p><strong>Confidence:</strong> ${result.confidence}%</p>
            `;
            predictionResult.classList.remove('error');
        } else {
            predictionResult.innerHTML = `<p>Error: ${result.error}</p>`;
            predictionResult.classList.add('error');
        }
    } catch (error) {
        console.error('Error during prediction:', error);
        alert('An unexpected error occurred. Please try again.');
    } finally {
        // Re-enable the button and reset its text
        predictButton.disabled = false;
        predictButton.textContent = 'Predict';
    }
});
// Intersection Observer for Developer Cards
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // Trigger CSS animation
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, {
        threshold: 0.2 // Trigger when 20% of the element is visible
    });

    // Observe each developer card
    document.querySelectorAll('.developer-card').forEach(card => {
        observer.observe(card);
    });
});