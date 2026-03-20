from google.cloud import bigquery
import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

PROJECT_ID = 'neon-gist-450705-r8'
DATASET_ID = 'settlement_system'
TABLE_ID = 'settlement_tasks'
SCOPES = ['https://www.googleapis.com/auth/bigquery']

def get_bq_client():
    creds = Credentials.from_authorized_user_file('token_bq.json', SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return bigquery.Client(credentials=creds, project=PROJECT_ID)

def seed_data():
    client = get_bq_client()
    table_id = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"

    rows_to_insert = [
        {"id": "1", "title": "1월 정산 기초 자료 검토", "assignee": "이상준", "status": "completed", "category": "기초자료", "due_date": "2026-01-31", "completed_date": "2026-01-25"},
        {"id": "2", "title": "원가 정산 데이터 확정", "assignee": "이정희", "status": "pending", "category": "데이터확정", "due_date": "2026-01-31", "completed_date": None},
        {"id": "3", "title": "외부 파트너사 세금계산서 발행", "assignee": "이상준", "status": "pending", "category": "세무", "due_date": "2026-02-05", "completed_date": None},
        {"id": "4", "title": "미정산 잔액 확인 및 보고", "assignee": "박지민", "status": "completed", "category": "보고", "due_date": "2026-01-28", "completed_date": "2026-01-27"},
        {"id": "5", "title": "카드 매출 전표 대조", "assignee": "이정희", "status": "pending", "category": "데이터확정", "due_date": "2026-02-01", "completed_date": None},
        {"id": "6", "title": "수수료 정산 내역 검증", "assignee": "이상준", "status": "pending", "category": "검증", "due_date": "2026-02-03", "completed_date": None},
        {"id": "7", "title": "정산 결과 리포트 작성", "assignee": "김철수", "status": "pending", "category": "보고", "due_date": "2026-02-10", "completed_date": None},
    ]

    # Use Load Job instead of Streaming Insert for Free Tier
    job_config = bigquery.LoadJobConfig(
        write_disposition="WRITE_TRUNCATE", # 기존 데이터 덮어쓰기
    )

    job = client.load_table_from_json(rows_to_insert, table_id, job_config=job_config)
    job.result()  # Wait for the job to complete

    print(f"Loaded {len(rows_to_insert)} rows into {table_id}.")

if __name__ == "__main__":
    seed_data()
