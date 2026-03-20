import os
import os.path
from google.cloud import bigquery
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# 프로젝트 정보
PROJECT_ID = 'neon-gist-450705-r8'
DATASET_ID = 'settlement_system'
TABLE_ID = 'settlement_tasks'

# BigQuery Scope
SCOPES = ['https://www.googleapis.com/auth/bigquery']

def get_bq_client():
    creds = None
    if os.path.exists('token_bq.json'):
        creds = Credentials.from_authorized_user_file('token_bq.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Note: This might require user interaction
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES
            )
            creds = flow.run_local_server(port=0)
        
        with open('token_bq.json', 'w') as token:
            token.write(creds.to_json())
    
    return bigquery.Client(credentials=creds, project=PROJECT_ID)

def create_table():
    client = get_bq_client()

    # 데이터셋 생성 (없으면)
    dataset_ref = bigquery.DatasetReference(PROJECT_ID, DATASET_ID)
    try:
        client.get_dataset(dataset_ref)
        print(f"Dataset {DATASET_ID} already exists.")
    except Exception:
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = "ASIA-NORTHEAST3"  # 서울 리전
        client.create_dataset(dataset)
        print(f"Created dataset {DATASET_ID}")

    # 테이블 스키마 정의
    schema = [
        bigquery.SchemaField("id", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("title", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("assignee", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("status", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("category", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("due_date", "DATE", mode="REQUIRED"),
        bigquery.SchemaField("completed_date", "DATE", mode="NULLABLE"),
        bigquery.SchemaField("updated_at", "TIMESTAMP", mode="REQUIRED", default_value_expression="CURRENT_TIMESTAMP()"),
    ]

    table_ref = dataset_ref.table(TABLE_ID)
    table = bigquery.Table(table_ref, schema=schema)

    try:
        client.get_table(table_ref)
        print(f"Table {TABLE_ID} already exists.")
    except Exception:
        client.create_table(table)
        print(f"Created table {TABLE_ID}")

if __name__ == "__main__":
    create_table()
