import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

def summarize_events(events: list[dict], user_query: str) -> str:
    """
    Summarizes the given list of events using Gemini based on the user's query.
    """
    if not events:
        return "이번 달 일정이 없습니다."

    # Format events for the prompt
    events_text = ""
    for event in events:
        start_time = event['start']
        end_time = event['end']
        summary = event['summary']
        description = event.get('description', '설명 없음')
        events_text += f"- {start_time} ~ {end_time}: {summary} ({description})\n"

    prompt = f"""
    아래는 전체 일정 목록입니다 (범위: 오늘 기준 과거 1년 ~ 미래 1년).
    사용자의 질문: "{user_query}"
    
    [지침]
    1. 사용자의 질문과 관련된 일정만 골라내세요.
    2. 골라낸 일정들을 보기 좋게 요약해 주세요.
    3. 날짜별로 그룹화하거나 중요한 정보를 강조해 주세요.
    4. 만약 질문과 관련된 일정이 하나도 없다면 "관련된 일정이 없습니다."라고 답변해 주세요.
    5. 한국어로 정중하게 답변해 주세요.

    [전체 일정 목록]
    {events_text}
    """

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Gemini API 호출 중 오류가 발생했습니다: {str(e)}"

if __name__ == "__main__":
    # Test script
    dummy_events = [
        {"summary": "팀 회의", "start": "2023-10-01T10:00:00", "end": "2023-10-01T11:00:00", "description": "주간 보고"},
        {"summary": "프로젝트 회의", "start": "2023-10-05T14:00:00", "end": "2023-10-05T15:00:00", "description": "기획안 검토"}
    ]
    print(summarize_events(dummy_events, "회의"))
