# Google Calendar Summary to Slack Directive

## Goal
Slack 채널에서 사용자의 요청을 받아, 특정 키워드가 포함된 이번 달의 Google Calendar 일정을 검색하고, Gemini를 통해 요약하여 Slack으로 회신합니다.

## Inputs
- **User Command**: Slack 채널에서 `@BotName 일정요약 [키워드]` 형식의 메시지.
- **Environment Variables**:
  - `SLACK_APP_TOKEN`: Socket Mode용 App Token (xapp-...)
  - `SLACK_BOT_TOKEN`: Bot User OAuth Token (xoxb-...)
  - `GEMINI_API_KEY`: Google Gemini API Key
  - `GOOGLE_APPLICATION_CREDENTIALS`: (Optional) path to service account key, or `credentials.json` for OAuth.
- **Calendar Credentials**: `credentials.json` (OAuth Client ID) and `token.json` (User Token).

## Tools / Scripts
1.  **`execution/calendar_utils.py`**
    -   **Function**: `get_events(keyword: str) -> list[dict]`
    -   **Logic**:
        -   Authenticate with Google Calendar API (using `token.json` or flow to create it).
        -   Calculate the start and end of the current month (ISO format).
        -   Query events for the current month.
        -   Filter events containing the `keyword` in summary or description (case-insensitive).
    -   **Output**: List of event dictionaries (summary, start, end, description).

2.  **`execution/gemini_utils.py`**
    -   **Function**: `summarize_events(events: list[dict], keyword: str) -> str`
    -   **Logic**:
        -   Format the event list into a readable string.
        -   Construct a prompt for Gemini: "Summarize the following schedule related to '{keyword}'. Group by date if possible. Language: Korean."
        -   Call Gemini API (`google.generativeai`).
    -   **Output**: Summary text string.

3.  **`execution/slack_bot.py`**
    -   **Logic**:
        -   Initialize Slack App with Socket Mode.
        -   Listen for app mentions (`app_mention` event).
        -   Parse message text to extract the keyword.
        -   Call `get_events(keyword)`.
        -   If no events found, reply "해당 키워드로 검색된 이번 달 일정이 없습니다."
        -   If events found, Call `summarize_events(events, keyword)`.
        -   Reply to the thread or channel with the summary.

## Flow
1.  User mentions Bot in Slack: `@BotName 일정요약 회의`
2.  `slack_bot.py` receives the event.
3.  Parses "회의" as keyword.
4.  Calls `calendar_utils.get_events("회의")`.
5.  `calendar_utils` returns list of meeting events for this month.
6.  `slack_bot.py` calls `gemini_utils.summarize_events(events, "회의")`.
7.  `gemini_utils` returns "이번 달 회의 일정은 총 3건입니다..."
8.  `slack_bot.py` sends the summary back to Slack.

## Edge Cases
-   **No Keyword**: If user types just `@BotName 일정요약`, ask for a keyword.
-   **No Events**: Handle empty list gracefully.
-   **API Errors**: Handle Calendar API auth errors or Gemini API rate limits.
-   **Token Expiry**: `token.json` needs refresh (handled by library usually).
