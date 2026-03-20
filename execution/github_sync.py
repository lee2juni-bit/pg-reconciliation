import subprocess
import sys
import os

def run_command(command):
    """지정된 셸 명령을 실행하고 결과를 반환합니다."""
    print(f"Executing: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return False, result.stderr
    print(result.stdout)
    return True, result.stdout

def find_git_root(start_path):
    """현재 경로에서 상위 또는 하위로 Git 저장소 루트를 찾습니다."""
    # 1. 현재 또는 상위 디렉토리 확인
    curr = os.path.abspath(start_path)
    while curr != os.path.dirname(curr):
        if os.path.exists(os.path.join(curr, ".git")):
            return curr
        curr = os.path.dirname(curr)
    
    # 2. 하위 디렉토리 1단계 확인 (사용자 환경의 특수성 고려)
    for item in os.listdir(start_path):
        item_path = os.path.join(start_path, item)
        if os.path.isdir(item_path) and os.path.exists(os.path.join(item_path, ".git")):
            return item_path
            
    return None

def github_sync(commit_message="Automated sync by Antigravity"):
    """Git add, commit, push 과정을 자동화합니다."""
    
    git_root = find_git_root(os.getcwd())
    if not git_root:
        return False, "Git repository not found in current, parent, or immediate subdirectories."
    
    print(f"Working in Git repository: {git_root}")
    
    # 1. git add .
    success, output = run_command(["git", "-C", git_root, "add", "."])
    if not success:
        return False, f"Failed to add files: {output}"

    # 2. git commit -m "..."
    # 스테이징된 내용 확인 (변경 사항이 있으면 diff가 존재함)
    # git diff-index --quiet HEAD 는 변경 사항이 없으면 exit code 0
    result = subprocess.run(["git", "-C", git_root, "diff-index", "--quiet", "HEAD", "--"], capture_output=True)
    if result.returncode == 0:
        print("No changes to commit.")
        return True, "No changes to commit."

    success, output = run_command(["git", "-C", git_root, "commit", "-m", commit_message])
    if not success:
        return False, f"Failed to commit: {output}"

    # 3. git push
    # 현재 브랜치 이름 가져오기
    success, branch_output = run_command(["git", "-C", git_root, "rev-parse", "--abbrev-ref", "HEAD"])
    if not success:
        return False, "Failed to get current branch name."
    
    branch_name = branch_output.strip()
    success, output = run_command(["git", "-C", git_root, "push", "origin", branch_name])
    if not success:
        return False, f"Failed to push to branch {branch_name}: {output}"

    return True, "Successfully synced with GitHub."

if __name__ == "__main__":
    message = sys.argv[1] if len(sys.argv) > 1 else "Automated sync by Antigravity"
    success, result_msg = github_sync(message)
    if success:
        print(result_msg)
        sys.exit(0)
    else:
        print(f"Sync failed: {result_msg}")
        sys.exit(1)
