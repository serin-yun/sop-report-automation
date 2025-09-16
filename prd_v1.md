# S&OP 자동화 v1 — **신제품 개발 일정표 / Fade-out 단종 관리 / 신제품 리뷰**
**PRD (Product Requirements Document) — v0.2**  
도메인: Amorepacific SCP | 시스템: o9(APlan), SAP(SD/MM/PP), APO, BW  
작성일: 2025-09-16

---

## 1) 배경/목표
- S&OP 초기 단계에서 **3개 산출물(NPD 일정표, Fade-out 단종 관리, NPD 리뷰)**을 자동 생성
- 입력은 SAP/BW/APO/o9의 **RAW 파일 업로드**로 시작, 향후 **시스템 연동(ODP/Export)**로 확장
- 출력은 **샘플 결과물 Excel 템플릿**(권위, Source of Truth)을 **엄격 준수(strict)**

### 성공 지표(예시)
- 생성 시간: 10만 행 기준 파싱+계산 60초 내, Excel 작성 10초 내
- 정확도: KPI(DOS, 목표달성률, 소진율 등) 계산 일치 100%
- 사용자 만족: UAT 1회 내 승인

---

## 2) 범위(우선 적용)
1. **신제품 개발 일정표(NPD_Schedule)**: 계획/실제, 지연일수, 진도율, 이슈/심각도
2. **Fade-out 단종 관리(Fadeout)**: 재고/월평균판매/DOS, 소진예상, 위험도·Action Plan
3. **신제품 리뷰(NPD_Review)**: 출시→초도/입고/판매/재고, 소진율, 목표달성률, 상태 분류

> 보고서의 **최종 시트 구조/헤더/서식**은 제공되는 템플릿 파일에 의해 결정됨.

### 제외
- 원천계 실시간 조회/최적화 엔진(후속 단계), 고급 재고 최적화

---

## 3) 가정/정의(전역)
- 회계월(Fiscal YM): `YYYYMM` (일반 달) ※ 4-4-5 사용 시 MDC 파라미터로 전환
- 실적 기준: **Sell-in(청구 기준)** (PoC 단계 가정; 출고로 전환 가능)
- UoM 기본: EA (MARM 기반 환산)
- 환율 기준통화: KRW (월말 환율 적용), 필요 시 월평균/거래일로 변경 가능
- 월평균판매 윈도우: 최근 3개월 (`avg_months=3`)
- DOS(일): `재고수량 / (월평균판매/30)` (월평균판매=0 → `INF`)
- 부진 기준: 국내 2%, 해외 3%(재고금액 비중) + 보조 임계치 `DOS ≥ 180일`
- 신제품 정의: 출시 N개월(6) 이내 또는 마스터 life='NPD'
- 단종 정의: `discontinue_flag=1` 또는 단종 공지/코드

> 위 파라미터는 모두 **MDC(mdc.yaml)**에서 변경 가능.

---

## 4) 입력 데이터(업로드 규격)
CSV/Excel(UTF-8), 헤더 필수. 컬럼 불일치 시 **매핑 UI**로 보정.

- `MASTER_SKU.csv` : material, material_name, brand, life, launch_date, discontinue_flag, internal_cost, uom_base
- `SLS_ACTUAL.csv` : fiscal_ym, country, sales_org, material, qty, amount, uom, currency
- `INVENTORY_SNAP.csv` : snapshot_date, fiscal_ym, plant, sloc, country, material, qty, value, uom, currency
- `FORECAST_PLAN.csv` (선택) : version(Target/Plan), fiscal_ym, country, material, qty, uom, source
- `NPD_TASKS.xlsx` / `Tasks` : task, plan_date, actual_date, material?, issue?, owner?

검증·타입·필수 키는 **MDC.schemas/checks**에 명시.

---

## 5) 출력(템플릿 기반)
- 템플릿 경로 예: `templates/SOP_Report_template.xlsx`
- **시트명/컬럼 헤더/순서/서식**: 템플릿과 **완전 일치(strict)**
- 병합셀/조건부서식/정렬: 템플릿 설정 **상속**
- 추가 시트 생성 금지. 변경 필요 시 **템플릿 버전 교체**로 반영
- 최소 요구 시트(예): `NPD_Schedule`, `Fadeout`, `NPD_Review` (실제는 템플릿 기준)

---

## 6) 핵심 계산/룰
- `avg_sales_m = mean(SLS_ACTUAL.qty for last avg_months months)`
- `dos_days = inv_qty / (avg_sales_m/30)`  (avg_sales_m=0 → `INF`)
- `depletion_eta = month_end(snapshot_date) + ceil(dos_days)`
- `depletion_rate_pct = sales_qty / (sales_qty + inv_qty) * 100`
- `target_achv_pct = Actual(Target 기간)/Target * 100` (FORECAST 존재 시)
- `slow_moving_flag = (inv_value_share ≥ 지역별 임계) OR (dos_days ≥ threshold_slow_dos)`
- `risk_level`: High/Med/Low (DOS·재고금액 비중 구간표로 분류)

---

## 7) 프로세스/흐름
1) 업로드 → **스키마 검증/정규화** → 품질 리포트  
2) KPI/DOS/ETA 계산 → 부진/위험도 판정 → NPD 일정 지연/진도율 산정  
3) **템플릿 파싱**(시트/헤더/서식) → 템플릿과 **동일 구조/서식**으로 출력 작성  
4) 결과물 저장: `output/SOP_Report_[YYYYMM].xlsx` (+ 선택 PDF 2p 요약)

---

## 8) UI/UX 요구
- 업로드(Drag&Drop) → 검증 리포트(결측/음수/UoM/FX) → 옵션(기간/국가/임계치) → 미리보기 → 다운로드
- 오류 셀 하이라이트·자동 수정 제안, 파라미터 바(현재 산식/임계치 표시)

---

## 9) 비기능 요구(NFR)
- 성능: 10만 행 기준 파싱·계산 60초 내, Excel 작성 10초 내
- 보안: 내부 SSO(Keycloak), RBAC(Planner/Viewer/Admin), 저장/전송 암호화
- 감사: run_id, source_id, file_hash, template_version, parameters 스냅샷 로깅
- 가용성: PoC 99.5%

---

## 10) 테스트/수용 기준
- 스키마 오류/키 무결성/음수/UoM/FX 검증 **리포트 제공**
- 템플릿 시트/헤더 **완전 일치** (불일치 시 실패)
- KPI 수식 단위 테스트 통과(예: DOS, depletion_rate_pct, risk_level)
- 샘플 RAW(각 100~1,000행) 기준 AT 통과

---

## 11) 리스크/의존성
- 원천 데이터 품질, KPI 정의 변경(비교 불가), FORECAST 미제공 시 일부 KPI null

---

## 12) 운영/버전
- `mdc.yaml` 파라미터로 산식·임계치 운영 반영(코드 무변경)
- 템플릿 버전 관리: `templates/V2025.09/...` (파이프라인 인자 `--template-path`)

---

## [부록] Cursor 가이드(요약)
- system.prompt: 템플릿 파싱 → MDC 준수 → 템플릿 구조·서식 strict 출력 → 불일치 시 fail & `_validation.json`
- 코드 산출물: `processor.py, validators.py, metrics.py, export.py` + 테스트
