import json
import os
from datetime import datetime
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.oauth2 import service_account

class UserManager:
    def __init__(self):
        self.users_file = 'users.json'
        self.users = self._load_users()
        self.SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        self.SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'  # Replace with your Google Sheet ID
        self.credentials = self._get_google_credentials()
        self.service = build('sheets', 'v4', credentials=self.credentials)

    def _get_google_credentials(self):
        try:
            # Try to load service account credentials
            creds = service_account.Credentials.from_service_account_file(
                'credentials.json', scopes=self.SCOPES)
        except:
            # Fallback to user credentials
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secrets.json', self.SCOPES)
            creds = flow.run_local_server(port=0)
        return creds

    def _load_users(self):
        if os.path.exists(self.users_file):
            with open(self.users_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_users(self):
        with open(self.users_file, 'w') as f:
            json.dump(self.users, f)

    def create_user(self, username, email):
        if username in self.users:
            return False, "Username already exists"
        
        self.users[username] = {
            'email': email,
            'created_at': datetime.now().isoformat(),
            'sleep_data': []
        }
        self._save_users()
        return True, "User created successfully"

    def get_user(self, username):
        return self.users.get(username)

    def save_sleep_data(self, username, sleep_data):
        if username not in self.users:
            return False, "User not found"
        
        sleep_data['timestamp'] = datetime.now().isoformat()
        self.users[username]['sleep_data'].append(sleep_data)
        self._save_users()
        self._update_google_sheets(username, sleep_data)
        return True, "Sleep data saved successfully"

    def _update_google_sheets(self, username, sleep_data):
        try:
            # Prepare the data for Google Sheets
            values = [[
                username,
                sleep_data['timestamp'],
                sleep_data.get('sleep_duration', ''),
                sleep_data.get('sleep_quality', ''),
                sleep_data.get('stress_level', ''),
                sleep_data.get('physical_activity', ''),
                sleep_data.get('screen_time', ''),
                sleep_data.get('caffeine_intake', '')
            ]]
            
            body = {
                'values': values
            }
            
            # Append to the sheet
            self.service.spreadsheets().values().append(
                spreadsheetId=self.SPREADSHEET_ID,
                range='SleepData!A:H',  # Adjust range as needed
                valueInputOption='RAW',
                body=body
            ).execute()
            
        except Exception as e:
            print(f"Error updating Google Sheets: {str(e)}")