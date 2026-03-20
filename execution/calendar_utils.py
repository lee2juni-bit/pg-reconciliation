import os
import datetime
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import pytz

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def get_calendar_service():
    """Shows basic usage of the Google Calendar API.
    Prints the start and name of the next 10 events on the user's calendar.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    service = build("calendar", "v3", credentials=creds)
    return service


def get_events() -> list[dict]:
    """
    Fetches all events for the current month.
    """
    service = get_calendar_service()

    now = datetime.datetime.now()
    # 1 year before today
    start_date = now - datetime.timedelta(days=365)
    # 1 year after today
    end_date = now + datetime.timedelta(days=365)

    time_min = start_date.isoformat() + "Z"
    time_max = end_date.isoformat() + "Z"

    print(f"Fetching events from {time_min} to {time_max}...")

    events = []
    page_token = None
    while True:
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                timeMin=time_min,
                timeMax=time_max,
                singleEvents=True,
                orderBy="startTime",
                pageToken=page_token
            )
            .execute()
        )
        events.extend(events_result.get("items", []))
        if events_result.get("items"):
            print(f"Fetched {len(events_result['items'])} events. Total so far: {len(events)}")
        
        page_token = events_result.get("nextPageToken")
        if not page_token:
            break

    filtered_events = []

    if not events:
        print("No events found.")
    else:
        for event in events:
            summary = event.get("summary", "")
            description = event.get("description", "")
            
            start = event["start"].get("dateTime", event["start"].get("date"))
            end = event["end"].get("dateTime", event["end"].get("date"))
            
            filtered_events.append({
                "summary": summary,
                "start": start,
                "end": end,
                "description": description
            })

    return filtered_events

if __name__ == "__main__":
    result = get_events()
    print(f"Found {len(result)} events.")
    for r in result:
        print(f"- {r['summary']} ({r['start']})")
