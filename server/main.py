from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import pandas as pd
import os

# Initialize users dictionary (in production, use a database)
users = {}

# Create data directory if it doesn't exist
if not os.path.exists('data'):
    os.makedirs('data')

# Excel file path
EXCEL_FILE = 'data/sleep_data.xlsx'

# Create Excel file if it doesn't exist
if not os.path.exists(EXCEL_FILE):
    df = pd.DataFrame(columns=['username', 'date', 'Q1', 'Q4', 'Q5', 'Q6', 'sleep_quality'])
    df.to_excel(EXCEL_FILE, index=False)

# Load the model and scaler (if needed)
with open("sleepPredict.pkl", "rb") as file:
    data = pickle.load(file)
    loaded_model = data["model"]
    loaded_scaler = data.get("scaler")

app = Flask(__name__)
CORS(app)

# Setup JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
jwt = JWTManager(app)

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
            
        if username in users:
            return jsonify({"error": "Username already exists"}), 400
            
        hashed_password = generate_password_hash(password)
        users[username] = {
            "password": hashed_password
        }
        
        return jsonify({"message": "User registered successfully"}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")
        
        if not username or not password:
            return jsonify({"error": "Missing username or password"}), 400
            
        user = users.get(username)
        if not user or not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid username or password"}), 401
            
        access_token = create_access_token(identity=username)
        return jsonify({
            "access_token": access_token,
            "username": username
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Protect routes that require authentication
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"logged_in_as": current_user}), 200

# Enhanced response dictionary for the chatbot
CHATBOT_RESPONSES = {
    "greetings": [
        "Hello! How can I help you with your sleep today?",
        "Hi there! What would you like to know about sleep?",
        "Greetings! I'm here to help with any sleep-related questions."
    ],
    "goodbye": [
        "Goodbye! Sleep well!",
        "Take care and have a good night!",
        "See you later! Sweet dreams!"
    ],
    "help": [
        "Here are some topics you can ask about:",
        "1. How can I improve my sleep quality?",
        "2. What's the recommended sleep duration?",
        "3. What are good sleep hygiene practices?",
        "4. How to establish a sleep routine?",
        "5. What factors affect sleep quality?",
        "Just click on any of these options or type your own question!"
    ],
    "sleep_quality": [
        "To improve your sleep quality, try these tips:",
        "1. Maintain a consistent sleep schedule",
        "2. Create a relaxing bedtime routine",
        "3. Keep your bedroom cool, dark, and quiet",
        "4. Avoid screens and blue light before bed",
        "5. Exercise regularly but not close to bedtime",
        "6. Limit caffeine and alcohol intake",
        "7. Manage stress through meditation or relaxation techniques"
    ],
    "sleep_duration": [
        "Recommended sleep duration varies by age:",
        "• Newborns (0-3 months): 14-17 hours",
        "• Infants (4-11 months): 12-15 hours",
        "• Toddlers (1-2 years): 11-14 hours",
        "• Preschoolers (3-5 years): 10-13 hours",
        "• School-age children (6-13 years): 9-11 hours",
        "• Teenagers (14-17 years): 8-10 hours",
        "• Young adults (18-25 years): 7-9 hours",
        "• Adults (26-64 years): 7-9 hours",
        "• Older adults (65+ years): 7-8 hours"
    ],
    "sleep_hygiene": [
        "Good sleep hygiene practices include:",
        "1. Regular sleep schedule",
        "2. Comfortable sleep environment",
        "3. Limited daytime naps",
        "4. Regular exercise",
        "5. Balanced diet",
        "6. Limited caffeine and alcohol",
        "7. Stress management",
        "8. Screen time management before bed"
    ],
    "sleep_routine": [
        "To establish a good sleep routine:",
        "1. Set a consistent bedtime and wake time",
        "2. Create a relaxing pre-sleep ritual",
        "3. Avoid large meals close to bedtime",
        "4. Exercise regularly but not near bedtime",
        "5. Limit exposure to screens before bed",
        "6. Keep your bedroom cool and dark",
        "7. Use your bed only for sleep and intimacy"
    ],
    "sleep_quality_factors": [
        "Factors that affect sleep quality include:",
        "1. Stress and anxiety levels",
        "2. Physical activity and exercise",
        "3. Diet and nutrition",
        "4. Caffeine and alcohol consumption",
        "5. Screen time and blue light exposure",
        "6. Sleep environment (temperature, light, noise)",
        "7. Medical conditions and medications",
        "8. Sleep schedule consistency"
    ],
    "default": [
        "I'm not sure about that. Could you rephrase your question?",
        "I don't have information about that specific topic. Try asking about sleep quality, duration, or hygiene.",
        "I'm here to help with sleep-related questions. Could you try asking something else?"
    ]
}

def get_chatbot_response(message):
    message = message.lower()
    
    # Check for help command
    if 'help' in message:
        return '\n'.join(CHATBOT_RESPONSES['help'])
    
    # Check for greetings
    if any(word in message for word in ['hi', 'hello', 'hey', 'greetings']):
        return np.random.choice(CHATBOT_RESPONSES['greetings'])
    
    # Check for goodbye
    if any(word in message for word in ['bye', 'goodbye', 'see you', 'later']):
        return np.random.choice(CHATBOT_RESPONSES['goodbye'])
    
    # Check for sleep quality related queries
    if any(word in message for word in ['improve', 'better', 'quality', 'enhance']):
        return '\n'.join(CHATBOT_RESPONSES['sleep_quality'])
    
    # Check for sleep duration related queries
    if any(word in message for word in ['duration', 'long', 'hours', 'time']):
        return '\n'.join(CHATBOT_RESPONSES['sleep_duration'])
    
    # Check for sleep hygiene related queries
    if any(word in message for word in ['hygiene', 'practice', 'habit', 'routine']):
        return '\n'.join(CHATBOT_RESPONSES['sleep_hygiene'])
    
    # Check for sleep routine related queries
    if any(word in message for word in ['routine', 'schedule', 'pattern', 'regular']):
        return '\n'.join(CHATBOT_RESPONSES['sleep_routine'])
    
    # Check for sleep quality factors related queries
    if any(word in message for word in ['factor', 'affect', 'influence', 'cause']):
        return '\n'.join(CHATBOT_RESPONSES['sleep_quality_factors'])
    
    # Default response
    return np.random.choice(CHATBOT_RESPONSES['default'])

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

        # Make prediction
        prediction = loaded_model.predict(input_data)[0]
        
        # Important: Fix the prediction logic here
        sleep_quality = "Good Sleep" if prediction == 0 else "Bad Sleep"

        # Recommendations based on the prediction and input values
        recommendations = []
        if prediction == 0:  # Good Sleep
            recommendations.append("Your sleep quality is predicted to be good! Here are tips to maintain it:")
            if Q1 > 5:
                recommendations.append("Consider stress management techniques to maintain good sleep")
            if Q4 < 5:
                recommendations.append("Keep up with regular exercise for optimal sleep")
            if Q5 > 5:
                recommendations.append("Monitor your caffeine intake to maintain sleep quality")
            if Q6 > 5:
                recommendations.append("Consider reducing screen time before bed")
        else:  # Bad Sleep
            recommendations.append("Here are recommendations to improve your sleep quality:")
            if Q1 > 5:
                recommendations.append("Practice relaxation techniques to reduce stress levels")
            if Q4 < 5:
                recommendations.append("Increase your daily physical activity")
            if Q5 > 5:
                recommendations.append("Reduce caffeine intake, especially in the afternoon")
            if Q6 > 5:
                recommendations.append("Limit screen exposure before bedtime")

        return jsonify({
            "sleep_quality": sleep_quality,
            "recommendations": recommendations
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/save-prediction", methods=["POST"])
@jwt_required()
def save_prediction():
    try:
        current_user = get_jwt_identity()
        data = request.get_json()
        
        # Extract prediction data
        prediction_data = {
            'username': current_user,
            'date': datetime.datetime.now().strftime('%Y-%m-%d'),
            'Q1': data['Q1'],
            'Q4': data['Q4'],
            'Q5': data['Q5'],
            'Q6': data['Q6'],
            'sleep_quality': "Bad Sleep" if data.get('prediction') == 1 else "Good Sleep"
        }
        
        # Read existing data
        df = pd.read_excel(EXCEL_FILE)
        
        # Append new data
        df = pd.concat([df, pd.DataFrame([prediction_data])], ignore_index=True)
        
        # Save back to Excel
        df.to_excel(EXCEL_FILE, index=False)
        
        return jsonify({"message": "Data saved successfully"}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route("/get-user-stats", methods=["GET"])
@jwt_required()
def get_user_stats():
    try:
        current_user = get_jwt_identity()
        
        # Read Excel file
        df = pd.read_excel(EXCEL_FILE)
        
        # Filter data for current user
        user_data = df[df['username'] == current_user]
        
        if user_data.empty:
            return jsonify({
                "message": "No data found for user",
                "stats": None
            }), 200
            
        # Calculate statistics
        total_predictions = len(user_data)
        good_sleep_count = len(user_data[user_data['sleep_quality'] == 'Good Sleep'])
        bad_sleep_count = len(user_data[user_data['sleep_quality'] == 'Bad Sleep'])
        
        # Get last 7 days of data
        last_7_days = user_data.sort_values('date', ascending=False).head(7)
        daily_stats = last_7_days.groupby('date')['sleep_quality'].value_counts().unstack(fill_value=0).to_dict()
        
        # Average scores
        avg_scores = {
            'Q1': user_data['Q1'].mean(),
            'Q4': user_data['Q4'].mean(),
            'Q5': user_data['Q5'].mean(),
            'Q6': user_data['Q6'].mean()
        }
        
        return jsonify({
            "total_predictions": total_predictions,
            "good_sleep_count": good_sleep_count,
            "bad_sleep_count": bad_sleep_count,
            "daily_stats": daily_stats,
            "avg_scores": avg_scores
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
