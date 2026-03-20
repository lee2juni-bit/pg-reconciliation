# Free Cloud Server Setup Guide

이 가이드는 로컬 PC가 꺼져도 구글 캘린더 요약 봇을 24시간 작동할 수 있도록, **무료 클라우드 서버(VPS)**를 구축하고 봇을 배포하는 방법을 설명합니다.

가장 추천하는 두 가지 무료 옵션은 **Oracle Cloud Always Free**와 **Google Cloud Platform (GCP) Free Tier**입니다.

---

## Option 1: Oracle Cloud Always Free (추천)

Oracle Cloud는 평생 무료(Always Free) 등급에서 상당히 넉넉한 자원을 제공합니다. 특히 **ARM 기반의 Ampere 인스턴스**는 4 OCPU와 24GB RAM을 제공하여 매우 강력합니다.

### 1단계: 계정 생성 및 인스턴스 만들기
1. [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)에 접속하여 가입합니다. (신용카드 등록이 필요하지만, 무료 범위를 넘지 않으면 결제되지 않습니다.)
2. 로그인 후 **"Create a VM instance"**를 클릭합니다.
3. 설정:
   - **Name**: `calendar-bot-server` 등 원하는 이름.
   - **Image and Shape**: 
     - **Image**: `Canonical Ubuntu` (최신 Ubuntu 버전 선택)
     - **Shape**: `Ampere` (VM.Standard.A1.Flex) 선택을 추천합니다. (없다면 AMD Micro 선택)
   - **Networking**: `Create new virtual cloud network` 선택.
   - **Add SSH keys**: `Save private key`를 클릭하여 **반드시 키 파일(.key)을 다운로드**하고 안전한 곳에 보관하세요. (이 키를 잃어버리면 접속 불가)
4. **Create**를 클릭하여 생성합니다.

### 2단계: 네트워크 설정 (Port 개방)
봇은 아웃바운드 통신만 주로 사용하지만, 추후 확장을 위해 기본 설정을 확인합니다.
1. 생성된 인스턴스 페이지에서 **Subnet** 링크를 클릭합니다.
2. **Default Security List**를 클릭합니다.
3. **Ingress Rules**에서 SSH(22번 포트)가 열려있는지 확인합니다.

---

## Option 2: Google Cloud Platform (GCP) Free Tier

GCP는 `e2-micro` 인스턴스를 특정 리전에서 무료로 제공합니다.

### 1단계: 인스턴스 만들기
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속하여 가입 및 프로젝트를 생성합니다.
2. 메뉴에서 **Compute Engine > VM instances**로 이동합니다.
3. **Create Instance** 클릭.
4. 설정 (**중요: 무료 조건을 정확히 맞춰야 함**):
   - **Region**: `us-west1`, `us-central1`, `us-east1` 중 하나 선택 (서울 리전은 유료입니다).
   - **Machine type**: `e2-micro` (2 vCPU, 1 GB memory).
   - **Boot disk**: `Standard persistent disk`, 30GB 이하 설정. -> OS는 `Ubuntu` 선택.
5. **Create** 클릭.

### 2단계: SSH 접속 설정
GCP 콘솔의 브라우저 기반 SSH 창을 사용하거나, 로컬 터미널에서 `gcloud` CLI를 통해 접속할 수 있습니다.

---

## Common Steps: 서버 설정 및 Docker 설치

서버에 접속한 후(SSH), 다음 명령어를 실행하여 Docker를 설치합니다. (Ubuntu 기준)

### 1. SSH 접속 (Oracle Cloud 예시)
터미널을 열고 다운로드 받은 키 파일(`ssh-key-202x.key`)이 있는 폴더로 이동합니다.
```bash
# 키 파일 권한 설정 (필수)
chmod 400 ssh-key-202x.key

# 서버 접속 (Username은 보통 ubuntu 또는 opc)
ssh -i ssh-key-202x.key ubuntu@<SERVER_PUBLIC_IP>
```
* `<SERVER_PUBLIC_IP>`는 클라우드 콘솔에서 확인 가능한 공인 IP 주소입니다.

### 2. Docker 및 Docker Compose 설치
서버 터미널에서 다음 명령어를 한 줄씩 실행하세요.

```bash
# 패키지 목록 업데이트
sudo apt-get update

# Docker 설치
sudo apt-get install -y docker.io

# Docker 권한 설정 (sudo 없이 docker 실행)
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo apt-get install -y docker-compose

# 변경 사항 적용을 위해 로그아웃 후 재접속
exit
```
다시 SSH로 접속합니다.

---

## 파일 배포 및 실행 (로컬 PC -> 서버)

이제 로컬 PC에 있는 봇 파일들을 서버로 전송해야 합니다.

### 1. 파일 전송 (SCP 사용)
로컬 PC의 터미널(새 창)에서 프로젝트 폴더로 이동한 후, 다음 명령어로 파일들을 서버로 복사합니다.

**Oracle Cloud 예시:**
```bash
# 프로젝트 폴더로 이동
cd ~/Desktop/Antigravity

# 봇 파일 전송 (실행 스크립트, 설정 파일, 인증 키 등)
# 주의: token.json은 로컬에서 이미 생성된 파일을 보내야 합니다!
scp -i /path/to/ssh-key.key -r \
  Dockerfile \
  docker-compose.yml \
  requirements.txt \
  execution \
  .env \
  token.json \
  credentials.json \
  ubuntu@<SERVER_PUBLIC_IP>:~/calendar-bot/
```
* `/path/to/ssh-key.key`는 아까 다운로드한 키 파일의 경로입니다.
* `~/calendar-bot/`은 서버에 파일이 저장될 경로입니다. (자동으로 생성되지 않을 수 있으니 서버에서 `mkdir ~/calendar-bot`을 먼저 해주면 좋습니다)

### 2. 봇 실행
다시 서버 터미널(SSH)로 돌아가서 봇을 실행합니다.

```bash
# 디렉토리 이동
cd ~/calendar-bot

# Docker 컨테이너 빌드 및 백그라운드 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

이제 봇이 클라우드 서버에서 24시간 돌아갑니다! 터미널을 꺼도 봇은 계속 실행됩니다.
