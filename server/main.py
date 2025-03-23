from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from user_manager import UserManager

app = Flask(__name__)
CORS(app)

# Initialize user manager
user_manager = UserManager()

# Load the model and scaler
with open('sleepPredict.pkl', 'rb') as f:
    model, scaler = pickle.load(f)

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

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    
    if not username or not email:
        return jsonify({'success': False, 'message': 'Username and email are required'}), 400
    
    success, message = user_manager.create_user(username, email)
    return jsonify({'success': success, 'message': message})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '').lower()
    username = data.get('username')
    
    response = get_chatbot_response(message, username)
    
    # Save chat history if username is provided
    if username:
        user_manager.save_chat_history(username, message, response)
    
    return jsonify({'response': response})

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    username = data.get('username')
    
    # Extract features from request
    features = [
        float(data.get('sleep_duration', 0)),
        float(data.get('stress_level', 0)),
        float(data.get('physical_activity', 0)),
        float(data.get('screen_time', 0)),
        float(data.get('caffeine_intake', 0))
    ]
    
    # Scale features
    features_scaled = scaler.transform([features])
    
    # Make prediction
    prediction = model.predict(features_scaled)[0]
    
    # Generate recommendations based on prediction
    recommendations = generate_recommendations(prediction, features)
    
    # Save sleep data if username is provided
    if username:
        sleep_data = {
            'sleep_duration': features[0],
            'stress_level': features[1],
            'physical_activity': features[2],
            'screen_time': features[3],
            'caffeine_intake': features[4],
            'sleep_quality': float(prediction)
        }
        user_manager.save_sleep_data(username, sleep_data)
    
    return jsonify({
        'prediction': float(prediction),
        'recommendations': recommendations
    })

def generate_recommendations(prediction, features):
    recommendations = []
    
    if prediction < 0.5:
        recommendations.append("Your sleep quality is below average. Consider these tips:")
        if features[0] < 7:
            recommendations.append("- Try to get at least 7-8 hours of sleep")
        if features[1] > 0.7:
            recommendations.append("- Practice stress-reduction techniques before bed")
        if features[2] < 0.3:
            recommendations.append("- Increase physical activity during the day")
        if features[3] > 0.7:
            recommendations.append("- Reduce screen time before bedtime")
        if features[4] > 0.5:
            recommendations.append("- Limit caffeine intake, especially in the evening")
    else:
        recommendations.append("Your sleep quality is good! Keep up these habits:")
        if features[0] >= 7:
            recommendations.append("- Maintain your healthy sleep duration")
        if features[1] < 0.3:
            recommendations.append("- Continue managing stress effectively")
        if features[2] >= 0.5:
            recommendations.append("- Keep up your good physical activity level")
        if features[3] < 0.3:
            recommendations.append("- Maintain your healthy screen time habits")
        if features[4] < 0.3:
            recommendations.append("- Keep your caffeine intake moderate")
    
    return recommendations

if __name__ == '__main__':
    app.run(debug=True)
