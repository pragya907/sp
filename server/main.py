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

# Simple response dictionary for the chatbot
CHATBOT_RESPONSES = {
    "greeting": ["Hello!", "Hi there!", "Hey! How can I help you with your sleep today?"],
    "goodbye": ["Goodbye!", "Take care!", "Sleep well!"],
    "sleep_tips": [
        "Here are some tips for better sleep:\n1. Maintain a consistent sleep schedule\n2. Create a relaxing bedtime routine\n3. Keep your bedroom cool and dark\n4. Avoid screens before bedtime\n5. Exercise regularly but not close to bedtime",
        "Try these sleep hygiene practices:\n- Avoid caffeine late in the day\n- Create a comfortable sleep environment\n- Manage stress through relaxation techniques\n- Limit daytime naps\n- Stay active during the day"
    ],
    "sleep_duration": [
        "Most adults need 7-9 hours of sleep per night. However, individual needs may vary.",
        "The recommended sleep duration is:\n- Adults: 7-9 hours\n- Teenagers: 8-10 hours\n- Children: 9-11 hours\n- Infants: 12-15 hours"
    ],
    "default": ["I'm not sure about that. Could you rephrase your question?", "I'm here to help with sleep-related questions. Could you ask something specific about sleep?"]
}

def get_chatbot_response(message):
    message = message.lower()
    
    # Check for greetings
    if any(word in message for word in ["hi", "hello", "hey"]):
        return np.random.choice(CHATBOT_RESPONSES["greeting"])
    
    # Check for goodbyes
    if any(word in message for word in ["bye", "goodbye", "see you"]):
        return np.random.choice(CHATBOT_RESPONSES["goodbye"])
    
    # Check for sleep tips requests
    if any(word in message for word in ["tips", "advice", "help", "improve", "better"]):
        return np.random.choice(CHATBOT_RESPONSES["sleep_tips"])
    
    # Check for sleep duration questions
    if any(word in message for word in ["how long", "duration", "hours", "sleep time"]):
        return np.random.choice(CHATBOT_RESPONSES["sleep_duration"])
    
    # Default response
    return np.random.choice(CHATBOT_RESPONSES["default"])

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message", "")
        
        if not message:
            return jsonify({"error": "No message provided"}), 400
            
        response = get_chatbot_response(message)
        return jsonify({"response": response})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

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
