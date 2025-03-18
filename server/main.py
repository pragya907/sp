from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

# Load the model and scaler (if needed)
with open("sleepPredict.pkl", "rb") as file:
    data = pickle.load(file)
    loaded_model = data["model"]
    loaded_scaler = data.get("scaler")  # Optional, check if the scaler is available

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        # Extracting the input values from the request
        Q1 = float(data["Q1"])
        Q4 = float(data["Q4"])
        Q5 = float(data["Q5"])
        Q6 = float(data["Q6"])

        # Prepare the data for prediction
        input_data = np.array([[Q1, Q4, Q5, Q6]])

        # Scale input if the scaler is available
        if loaded_scaler:
            input_data = loaded_scaler.transform(input_data)

        # Predicting the sleep quality using the model
        prediction = loaded_model.predict(input_data)[0]
        sleep_quality = "Bad Sleep" if prediction == 1 else "Good Sleep"

        # Recommendations based on the prediction
        recommendations = []
        if prediction == 1:
            recommendations.append("Try to improve your sleep routine.")
            recommendations.append("Consider reducing screen time before bed.")
        else:
            recommendations.append("Your sleep quality is good, keep it up!")
            recommendations.append("Maintain your healthy sleep habits.")

        # Return the result in JSON format
        return jsonify(
            {"sleep_quality": sleep_quality, "recommendations": recommendations}
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 400  # Return a JSON error message


if __name__ == "__main__":
    app.run(debug=True)
