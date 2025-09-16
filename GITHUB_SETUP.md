# GitHub 연동 설정 가이드

## 1. GitHub 저장소 생성

1. GitHub 웹사이트(https://github.com)에 로그인
2. "New repository" 버튼 클릭
3. 저장소 설정:
   - Repository name: `sop-report-automation`
   - Description: `S&OP 보고서 자동화 시스템`
   - Visibility: Private (권장)
   - Initialize with README: ❌ (이미 로컬에 파일이 있음)
   - Add .gitignore: ❌ (이미 생성됨)
   - Choose a license: MIT License (선택사항)

## 2. 로컬 저장소와 GitHub 연결

GitHub에서 저장소를 생성한 후, 다음 명령어를 실행하세요:

```bash
# GitHub 저장소 URL을 원격 저장소로 추가
git remote add origin https://github.com/[YOUR_USERNAME]/sop-report-automation.git

# 기본 브랜치를 main으로 설정
git branch -M main

# 로컬 변경사항을 GitHub에 푸시
git push -u origin main

# develop 브랜치도 푸시
git push -u origin develop
```

## 3. 브랜치 전략

### 브랜치 구조
- `main`: 프로덕션 준비 코드 (안정적인 버전)
- `develop`: 개발 통합 브랜치 (기능 개발 완료 후 머지)
- `feature/*`: 개별 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

### 작업 흐름
1. `develop` 브랜치에서 `feature/기능명` 브랜치 생성
2. 기능 개발 완료 후 `develop`에 Pull Request 생성
3. `develop`에서 충분한 테스트 후 `main`에 Pull Request 생성
4. `main` 브랜치에 태그를 생성하여 버전 관리

## 4. 권장 설정

### GitHub 저장소 설정
- Branch protection rules 설정 (main 브랜치 보호)
- Required status checks 활성화
- Require pull request reviews 활성화

### Git 설정
```bash
# 전역 Git 설정 (한 번만 실행)
git config --global user.name "Your Name"
git config --global user.email "your.email@amorepacific.com"

# 자동 줄바꿈 설정 (Windows)
git config --global core.autocrlf true
```

## 5. 다음 단계

1. GitHub 저장소 생성 및 연결 완료
2. 팀원들과 협업을 위한 권한 설정
3. CI/CD 파이프라인 설정 (선택사항)
4. 이슈 템플릿 및 PR 템플릿 설정

## 6. 유용한 Git 명령어

```bash
# 현재 상태 확인
git status

# 변경사항 스테이징
git add .

# 커밋 생성
git commit -m "커밋 메시지"

# 원격 저장소에 푸시
git push origin [브랜치명]

# 원격 저장소에서 풀
git pull origin [브랜치명]

# 브랜치 생성 및 전환
git checkout -b feature/새기능

# 브랜치 목록 확인
git branch -a

# 원격 저장소 확인
git remote -v
```
