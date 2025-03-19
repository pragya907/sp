from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import os.path
import pickle
import json
from datetime import datetime

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'  # Replace with your Google Sheet ID

class UserManager:
    def __init__(self):
        self.creds = self._get_google_credentials()
        self.service = build('sheets', 'v4', credentials=self.creds)
        self.users = self._load_users()

    def _get_google_credentials(self):
        creds = None
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        
        return creds

    def _load_users(self):
        try:
            with open('users.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}

    def _save_users(self):
        with open('users.json', 'w') as f:
            json.dump(self.users, f)

    def create_user(self, username, email):
        if username in self.users:
            return False, "Username already exists"
        
        self.users[username] = {
            "email": email,
            "created_at": datetime.now().isoformat(),
            "chat_history": [],
            "sleep_data": []
        }
        self._save_users()
        return True, "User created successfully"

    def get_user(self, username):
        return self.users.get(username)

    def save_chat_history(self, username, message, response):
        if username not in self.users:
            return False
        
        self.users[username]["chat_history"].append({
            "timestamp": datetime.now().isoformat(),
            "message": message,
            "response": response
        })
        self._save_users()
        return True

    def save_sleep_data(self, username, sleep_data):
        if username not in self.users:
            return False
        
        self.users[username]["sleep_data"].append({
            "timestamp": datetime.now().isoformat(),
            **sleep_data
        })
        self._save_users()
        return True

    def update_google_sheets(self, username):
        if username not in self.users:
            return False
        
        user_data = self.users[username]
        
        # Prepare data for sheets
        chat_history = []
        for chat in user_data["chat_history"]:
            chat_history.append([
                username,
                chat["timestamp"],
                chat["message"],
                chat["response"]
            ])
        
        sleep_data = []
        for sleep in user_data["sleep_data"]:
            sleep_data.append([
                username,
                sleep["timestamp"],
                sleep.get("Q1", ""),
                sleep.get("Q4", ""),
                sleep.get("Q5", ""),
                sleep.get("Q6", ""),
                sleep.get("sleep_quality", ""),
                sleep.get("recommendations", "")
            ])
        
        # Update chat history sheet
        if chat_history:
            self.service.spreadsheets().values().append(
                spreadsheetId=SPREADSHEET_ID,
                range='ChatHistory!A:D',
                valueInputOption='RAW',
                body={'values': chat_history}
            ).execute()
        
        # Update sleep data sheet
        if sleep_data:
            self.service.spreadsheets().values().append(
                spreadsheetId=SPREADSHEET_ID,
                range='SleepData!A:H',
                valueInputOption='RAW',
                body={'values': sleep_data}
            ).execute()
        
        return True

    def generate_prescription(self, username):
        if username not in self.users:
            return None
        
        user_data = self.users[username]
        if not user_data["sleep_data"]:
            return "No sleep data available for prescription"
        
        latest_sleep = user_data["sleep_data"][-1]
        sleep_quality = latest_sleep.get("sleep_quality", "")
        
        prescription = {
            "timestamp": datetime.now().isoformat(),
            "sleep_quality": sleep_quality,
            "recommendations": [],
            "lifestyle_changes": [],
            "follow_up": ""
        }
        
        if sleep_quality == "Bad Sleep":
            prescription["recommendations"].extend([
                "Establish a consistent sleep schedule",
                "Create a relaxing bedtime routine",
                "Limit screen time before bed",
                "Exercise regularly but not close to bedtime"
            ])
            prescription["lifestyle_changes"].extend([
                "Avoid caffeine after mid-day",
                "Create a dark and quiet sleep environment",
                "Consider stress management techniques"
            ])
            prescription["follow_up"] = "Schedule a follow-up in 2 weeks"
        else:
            prescription["recommendations"].extend([
                "Maintain your current sleep schedule",
                "Continue practicing good sleep hygiene",
                "Keep a sleep diary to track patterns"
            ])
            prescription["lifestyle_changes"].extend([
                "Regular exercise",
                "Balanced diet",
                "Stress management"
            ])
            prescription["follow_up"] = "Schedule a follow-up in 1 month"
        
        return prescription 