import os
from google.cloud import bigquery
from google.oauth2.credentials import Credentials
from flask import jsonify

# 프로젝트 정보
PROJECT_ID = 'neon-gist-450705-r8'
DATASET_ID = 'settlement_system'
TABLE_ID = 'settlement_tasks'

def get_client():
    # 로컬 테스트용 token_bq.json 확인
    token_path = os.path.join(os.path.dirname(__file__), '..', 'token_bq.json')
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, ['https://www.googleapis.com/auth/bigquery'])
        return bigquery.Client(credentials=creds, project=PROJECT_ID)
    return bigquery.Client(project=PROJECT_ID)

client = get_client()

def get_tasks(request):
    """BigQuery에서 모든 과제 리스트를 조회하는 Cloud Function"""
    # CORS 처리
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {'Access-Control-Allow-Origin': '*'}

    query = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}` ORDER BY due_date ASC"
    query_job = client.query(query)
    results = query_job.result()

    tasks = []
    for row in results:
        tasks.append({
            "id": row.id,
            "title": row.title,
            "assignee": row.assignee,
            "status": row.status,
            "category": row.category,
            "dueDate": row.due_date.isoformat(),
            "completedDate": row.completed_date.isoformat() if row.completed_date else ""
        })

    return (jsonify(tasks), 200, headers)

def update_task(request):
    """특정 과제의 상태와 완료일을 업데이트하는 Cloud Function"""
    # CORS 처리
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    headers = {'Access-Control-Allow-Origin': '*'}

    request_json = request.get_json(silent=True)
    if not request_json or 'id' not in request_json:
        return (jsonify({"error": "Missing task ID"}), 400, headers)

    task_id = request_json['id']
    new_status = request_json.get('status')
    completed_date = request_json.get('completedDate')

    # Update Query
    update_parts = []
    if new_status:
        update_parts.append(f"status = '{new_status}'")
    if completed_date is not None:
        val = f"'{completed_date}'" if completed_date else "NULL"
        update_parts.append(f"completed_date = {val}")
    
    update_parts.append("updated_at = CURRENT_TIMESTAMP()")
    
    dml = f"""
        UPDATE `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
        SET {', '.join(update_parts)}
        WHERE id = '{task_id}'
    """
    
    try:
        query_job = client.query(dml)
        query_job.result()
        return (jsonify({"success": True}), 200, headers)
    except Exception as e:
        return (jsonify({"error": str(e)}), 500, headers)
