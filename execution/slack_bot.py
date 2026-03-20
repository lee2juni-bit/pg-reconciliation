import os
import logging
from slack_sdk import WebClient
from slack_sdk.socket_mode import SocketModeClient
from slack_sdk.socket_mode.response import SocketModeResponse
from slack_sdk.socket_mode.request import SocketModeRequest
from dotenv import load_dotenv
import threading

# Import utils
import calendar_utils
import gemini_utils
import ssl
import certifi

# Load environment variables
load_dotenv()

SLACK_APP_TOKEN = os.getenv("SLACK_APP_TOKEN")
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if not SLACK_APP_TOKEN or not SLACK_BOT_TOKEN:
    logger.error("SLACK_APP_TOKEN or SLACK_BOT_TOKEN not found in environment variables.")

# Initialize WebClient
ssl_context = ssl.create_default_context(cafile=certifi.where())
client = WebClient(token=SLACK_BOT_TOKEN, ssl=ssl_context)

def process(client: SocketModeClient, req: SocketModeRequest):
    if req.type == "events_api":
        # Acknowledge the request immediately
        response = SocketModeResponse(envelope_id=req.envelope_id)
        client.send_socket_mode_response(response)

        event = req.payload["event"]
        
        # Log all events for debugging
        logger.info(f"Received event type: {event.get('type')}")
        
        text = event.get("text", "")
        channel_id = event["channel"]
        user_id = event.get("user")
        thread_ts = event.get("thread_ts", event.get("ts"))
        
        # Ignore bot's own messages
        if event.get("bot_id"):
            return

        is_mention = event["type"] == "app_mention"
        is_dm = event["type"] == "message" and event.get("channel_type") == "im"
        
        if is_mention or is_dm:
            logger.info(f"Processing message from {user_id}: {text}")

            # Parse command
            user_query = ""
            command_found = False
            
            # Simple keyword check
            if "일정요약" in text:
                command_found = True
                # Extract query: everything after "일정요약"
                try:
                    split_text = text.split("일정요약", 1)
                    if len(split_text) > 1:
                        user_query = split_text[1].strip()
                except Exception as e:
                    logger.error(f"Error parsing query: {e}")

            if not command_found:
                if is_dm:
                     client.web_client.chat_postMessage(
                        channel=channel_id,
                        thread_ts=thread_ts,
                        text="안녕하세요! 일정을 요약하려면 '일정요약 [검색어]' 형태로 입력해주세요.\n예: `일정요약 1월 미팅`"
                    )
                else: 
                     client.web_client.chat_postMessage(
                        channel=channel_id,
                        thread_ts=thread_ts,
                        text="명령어를 확인해주세요. 사용법: `@BotName 일정요약 [원하는 내용]`"
                    )
                return

            if not user_query:
                client.web_client.chat_postMessage(
                    channel=channel_id,
                    thread_ts=thread_ts,
                    text="검색할 내용을 입력해주세요. 예: `일정요약 1월 서비스 종료 일정`"
                )
                return

            # Notify processing
            client.web_client.chat_postMessage(
                    channel=channel_id,
                    thread_ts=thread_ts,
                    text=f"🔍 '{user_query}' 관련 일정을 찾고 분석 중입니다... (최대 30초 소요)"
            )

            try:
                # 1. Get ALL events
                logger.info("Calling calendar_utils.get_events()...")
                events = calendar_utils.get_events()
                logger.info(f"Fetched {len(events)} events from Calendar.")
                
                if not events:
                     client.web_client.chat_postMessage(
                        channel=channel_id,
                        thread_ts=thread_ts,
                        text="조회 기간 내 일정이 하나도 없습니다."
                    )
                     return

                # 2. Filter and Summarize with Gemini
                logger.info(f"Calling gemini_utils.summarize_events() with query: {user_query}")
                summary = gemini_utils.summarize_events(events, user_query)
                logger.info("Gemini summary received.")
                
                # 3. Send back to Slack
                client.web_client.chat_postMessage(
                    channel=channel_id,
                    thread_ts=thread_ts,
                    text=summary
                )
                logger.info("Response sent to Slack.")

            except Exception as e:
                logger.error(f"Error processing request: {e}", exc_info=True)
                client.web_client.chat_postMessage(
                    channel=channel_id,
                    thread_ts=thread_ts,
                    text=f"오류가 발생했습니다: {str(e)}"
                )

if __name__ == "__main__":
    if not SLACK_APP_TOKEN:
        print("SLACK_APP_TOKEN is missing.")
    else:
        # Check permissions
        try:
            auth_response = client.auth_test()
            bot_user_id = auth_response["user_id"]
            logger.info(f"Bot User ID: {bot_user_id}")
            logger.info("Auth test successful.")
        except Exception as e:
            logger.error(f"Auth test failed: {e}")

        socket_mode_client = SocketModeClient(
            app_token=SLACK_APP_TOKEN,
            web_client=client
        )
        socket_mode_client.socket_mode_request_listeners.append(process)
        socket_mode_client.connect()
        
        # Keep alive
        from threading import Event
        Event().wait()


