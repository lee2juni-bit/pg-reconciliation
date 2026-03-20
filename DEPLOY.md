# Deployment Guide



이 문서는 구글 캘린더 요약 봇을 서버에 배포하는 방법을 설명합니다.







## Prerequisites (사전 준비)

서버에 다음 소프트웨어가 설치되어 있어야 합니다.
1. [Docker](https://docs.docker.com/get-docker/)
2. [Docker Compose](https://docs.docker.com/compose/install/)

## Deployment Steps (배포 절차)

### 1. 파일 준비
로컬 개발 환경에서 다음 파일들을 서버의 한 디렉토리(예: `calendar-bot/`)로 복사하세요.
- `Dockerfile`
- `docker-compose.yml`
- `requirements.txt`
- `execution/` (디렉토리 전체)
- `.env` (API 키가 포함된 설정 파일)
- `token.json` (**중요**: 로컬에서 최초 1회 인증 완료 후 생성된 파일을 복사해야 합니다)
- `credentials.json`

> **Note**: `token.json`은 OAuth 인증 정보입니다. 서버 환경(터미널)에서는 브라우저 인증이 어려우므로, 반드시 로컬 PC에서 `python3 execution/calendar_utils.py`를 한 번 실행하여 생성된 파일을 가져가야 합니다.

### 2. 서버에서 실행
파일이 복사된 디렉토리에서 다음 명령어를 실행하여 컨테이너를 빌드하고 백그라운드에서 실행합니다.

```bash
docker-compose up -d --build
```

### 3. 상태 확인
봇이 정상적으로 실행되고 있는지 로그를 통해 확인합니다.

```bash
docker-compose logs -f
```
`Auth test successful` 메시지가 보이면 성공입니다.

### 4. 업데이트
코드가 수정되었을 경우, 파일을 업데이트한 후 다음 명령어로 재배포합니다.

```bash
docker-compose up -d --build
```

### 5. 중지
봇을 중지하려면 다음 명령어를 사용하세요.

```bash
docker-compose down
```
