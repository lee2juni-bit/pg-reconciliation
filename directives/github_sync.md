# GitHub Sync Directive

이 문서는 사용자의 작업 결과물을 GitHub에 동기화하는 자동화 절차를 정의합니다.

## Goal
로컬 변경 사항을 `git add`, `git commit`, `git push` 과정을 거쳐 원격 저장소에 안전하게 반영하는 것을 목표로 합니다.

## Inputs
- `commit_message` (optional): 변경 사항을 설명하는 커밋 메시지. 기본값은 "Automated sync by Antigravity"입니다.

## Steps
1. **변경 사항 확인**: 스테이징(Stage)할 파일이 있는지 확인합니다.
2. **실행 스크립트 호출**: `execution/github_sync.py`를 실행합니다.
   - 명령: `python3 execution/github_sync.py "[커밋 메시지]"`
3. **결과 검증**: 스크립트의 종료 코드가 `0`이고 성공 메시지가 출력되는지 확인합니다.

## Edge Cases & Error Handling
- **변경 사항 없음**: 스크립트가 "No changes to commit." 메시지를 출력하며 정상 종료됩니다.
- **인증 실패**: Git 인증(SSH 키 또는 토큰) 문제로 푸시가 실패할 경우, 사용자에게 설정을 확인하도록 요청합니다.
- **브랜치 충돌**: 원격 저장소에 새로운 변경 사항이 있어 푸시가 거절될 경우(`rejected`), 사용자에게 수동 해결(`git pull`)을 문의합니다.

## Outputs
- GitHub 저장소에 반영된 최신 코드.
- 동기화 완료 알림 메시지.
