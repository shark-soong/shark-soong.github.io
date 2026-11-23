---
title: MCU 위 MNIST 추론 최적화 (TVM · TFLM · CMSIS-NN)
summary: Arduino Nano 33 BLE(Cortex-M4)에서 같은 MNIST 모델의 추론시간을 909.5 ms(TVM plain C)에서 100.3 ms(TFLM 최종)로 약 9.1배 줄인 임베디드시스템설계 과제·프로젝트.
date: 2026-06-18
period: "2026.03 – 06.18 (4-1학기) · 프로젝트 05.28 – 06.18"
role: 개인 · 임베디드시스템설계 (4-1학기)
tags: [C, C++, Arduino, TensorFlow Lite Micro, CMSIS-NN, Apache TVM, 양자화]
featured: true
---

## 한눈에 보기

- **무엇:** 임베디드시스템설계 과제 3개 + 프로젝트. MNIST CNN을 MCU(Arduino Nano 33 BLE)에 올리고, 추론시간을 단계별로 줄임
- **기간:** 2026년 1학기 (과제 1 04/02, 과제 2 04/30, 과제 3 05/26 마감 · 프로젝트 05/28 – 06/18)
- **형태:** 개인
- **보드:** Nano 33 BLE (nRF52840, Cortex-M4F 64 MHz, Flash 1 MB, SRAM 256 KB, FPU·DSP(SIMD) 확장)
- **도구:** Python, TensorFlow/Keras, TFLite, Apache TVM, Arduino(mbed_nano), TFLM, CMSIS-NN, C/C++, Colab, Netron
- **한 줄 성과:** 같은 MNIST 모델의 보드 추론시간 909.5 ms → 100.3 ms (약 9.1배)
- **핵심 숫자**
  - 과제 2: 직접 설계한 CNN을 INT8 양자화 → 정확도 0.9921 → 0.9924 유지, 추론 약 600 ms → 약 190 ms (약 3.2배), 모델 172,724 B → 49,480 B
  - 과제 3: TVM으로 만든 C 코드를 손으로 최적화 → 909,532 µs → 526,122 µs (1.73배, −42.2%)
  - 프로젝트: TFLM + CMSIS-NN 라이브러리를 직접 수정 → 238,811 µs → 약 100,300 µs (2.38배, −58%), 테스트 30장 30/30 정답
  - 같은 모델 파일 기준 비교: CMSIS-NN(SIMD)만 써도 TVM plain C 수동 최적화 최고치보다 3.8배 빠름 (238.8 ms vs 526 ms)
- **자소서 키워드:** 프로파일링 기반 병목 분석, 라이브러리 내부 콜 패스 분석, SIMD(SMLAD), loop unrolling, 메모리 배치(Flash → SRAM), 양자화, 잘못된 결과를 스스로 찾아 정정

## 자소서·면접용 요약 (STAR)

- **S:** 임베디드시스템설계 프로젝트로, MCU에서 MNIST 모델 추론시간을 줄이는 과제 (필수: loop unrolling + SIMD 적용, 정확도 0.98 이상 유지, 3차에 걸친 발표·평가)
- **T:** TFLM 수행 엔진과 CMSIS-NN 라이브러리를 분석해 병목을 찾고, 라이브러리 코드를 직접 고쳐 추론시간 단축
- **A**
  - MicroProfiler로 레이어별 시간 측정 → CONV 5개가 95.5%, 뒤쪽 CONV4·5가 73.6%임을 확인
  - Invoke 콜 패스를 따라가 병목 함수(arm_convolve_s8, arm_nn_mat_mult_kernel_s8_s16) 특정
  - 1차: im2col 3×3 완전 전개, GEMM 누산 4 → 8개 전개, 고정 상수 특수화 (−35%)
  - 2차: 컴파일 옵션 -Os → -O2/-O3 + -funroll-loops (−17%), 논문의 D2I 방식 시도 후 기각
  - 3차: 모델을 Flash → SRAM으로 옮기고 arena 축소 (−16%), MEAN 레이어를 정수 전용 경로로 재작성 (약 8 ms → 0.3 ms)
  - 2차 발표 결과가 틀렸음(정확도 30장 중 2장)을 3차에서 스스로 발견하고 정정
- **R:** 238.8 ms → 100.3 ms (2.38배, −58%), 30/30 정답. 과제 전체로는 909.5 ms → 100.3 ms
- **30초 버전:** "MCU에서 손글씨 인식 모델의 추론 속도를 높이는 프로젝트였습니다. 프로파일러로 합성곱 레이어가 시간의 95%를 쓴다는 걸 확인하고, 라이브러리 내부 함수까지 따라가 SIMD 누산 루프를 펼치고 모델을 SRAM으로 옮기는 등 단계적으로 최적화해 추론시간을 239 ms에서 100 ms로 줄였습니다. 중간에 빠르지만 틀린 결과를 발표한 적이 있었는데, 다음 단계에서 정확도를 다시 재서 직접 찾아내고 바로잡았습니다."

## 전체 흐름

| 단계 | 주제 | 핵심 결과 |
|---|---|---|
| 과제 1 | Python CLI 도서대출관리 (NumPy·클래스·모듈화) | 요구 기능 전부 + 회원가입·JSON 저장 추가 |
| 과제 2 | 직접 설계한 MNIST CNN → Nano 33 BLE 포팅 → INT8 양자화 | 정확도 0.9924 유지, 약 600 → 190 ms |
| 과제 3 | Apache TVM으로 TFLite → C 변환 후 수동 최적화 | 909,532 → 526,122 µs (1.73배) |
| 프로젝트 | TFLM + CMSIS-NN 수행 엔진 프로파일링·최적화 | 238,811 → 약 100,300 µs (2.38배) |

- 과제 3과 프로젝트는 바이트 단위로 같은 모델 파일(106,040 B)을 사용 → 결과를 직접 비교 가능
- 수치는 보고서 본문보다 시리얼 모니터 실측 스크린샷을 우선

## 과제 1 — 도서대출관리 프로그램 (Python, 04/02 마감)

- **요구사항**
  - ID/PW 로그인으로 관리자·사용자 구분
  - 관리자: 도서 추가·삭제·수정·조회, 소장 위치는 같은 층 안에서만 이동 (4F-1 → 4F-2)
  - 사용자: 조회·대출·반납·대출현황, 최대 3권·7일, 소장 1권 이상일 때만 대출
  - ndarray 사용, 2개 이상 파일 구성 필수
- **구현 구조**
  - function.py(395줄: 클래스·함수) + main.py(130줄: 메뉴 루프)
  - 클래스: Book(borrow, return_book, get_info), Account → Admin·User 상속
  - 도서는 `np.array(dtype=object)`에 Book 객체, np.append·np.delete로 추가·삭제
  - 영속화: 도서는 books.txt, 계정은 accounts.json
  - 제목에 공백이 있어 `parts[1:-2]`를 제목으로 파싱
  - 반납일: `datetime.now() + timedelta(days=7)`
- **추가 구현·예외처리:** 회원가입(관리자는 관리자 번호 필요), 중복 대출 방지, 대출 중인 책 삭제 불가, 다른 층 이동 불가, 음수·비정수 수량 거부, 파일 없음·공백 입력 처리
- **고찰:** ndarray는 이후 대규모 행렬 연산 대비, 클래스·모듈화는 TF·PyTorch 같은 라이브러리 구조 연습으로 해석. AI를 쓴 부분은 주석과 보고서에 명시

## 과제 2 — MNIST CNN 설계·포팅·양자화 (04/30 마감)

- **목표:** 정확도 0.99 이상을 지키며 "정확도 ÷ 추론시간" 최대화
- **모델 탐색**

| 단계 | 구성 | 결과·판단 |
|---|---|---|
| 수업 모델 | 실습 모델 그대로, 약 100 epoch | train 1.0 / val 0.98, val loss 0.17 → 과적합 |
| 1차 수정 | BN + Dropout + Conv 추가, 10 epoch | 0.99 이상이지만 epoch당 시간 약 10배, tflite 797,004 B로 너무 큼 |
| 최소 모델 | Dense 16 | 20 epoch에야 0.99 → 양자화 손실 우려로 기각 |
| 최종 | 아래 구조, 10 epoch | test acc 0.9921, loss 0.0226 |

- **최종 구조:** Conv(12) → Conv(12) → MaxPool → Dropout 0.2 → Conv(24) → MaxPool → Dropout 0.2 → Flatten → Dense 32 → Dropout 0.2 → Dense 10 (Conv 모두 3×3·same·ReLU, Adam, sparse categorical crossentropy)
- **결과**

| 항목 | Float | INT8 양자화 |
|---|---|---|
| 테스트 정확도 | 0.9921 | 0.9924 |
| tflite 크기 | 172,724 B | 49,480 B (약 1/3.5) |
| Nano 추론시간 | 약 600 ms | 약 190 ms (약 3.2배) |
| 정확도/시간 | 약 0.00165 /ms | 약 0.00522 /ms |

- **양자화:** Full-integer PTQ, representative dataset 학습 데이터 100장, 입출력 int8
- **Arduino:** AllOpsResolver, tensor arena 100 KB, 0.5 더미 입력, 같은 .ino에 model.cpp만 교체. 정확도는 Colab, 시간은 보드에서 측정
- **고찰**
  - BN이 있는 모델을 양자화하면 정확도가 0.99 → 0.1로 붕괴 → BN 제거로 해결 (BN scale 범위·folding 영향으로 추정)
  - 모델 크기는 Conv 채널 수·Dense 뉴런 수가 좌우, 두 번째 Conv 24채널은 MaxPool 정보 손실 보상
  - 프루닝은 연산이 남아 속도 이득이 없다고 보고 미사용
- **직접 계산한 보조 분석**
  - 파라미터 42,038개(float 약 168 KB ≈ tflite 크기), Flatten → Dense 32가 37,664개(약 90%)
  - 연산량 약 1.65M MAC, 28×28에서 도는 두 번째 Conv가 약 1.02M(약 62%)
  - → 크기는 Dense가, 시간은 Conv2가 지배. GAP나 stride로 둘 다 더 줄일 여지

## 과제 3 — Apache TVM Native C 변환·최적화 (05/26 마감)

- **변환 과정**
  - 환경: Colab, Python 3.11, apache-tvm 0.14.dev, tflite 2.18
  - tflite 로드 → `relay.frontend.from_tflite`(입력 uint8 1×28×28×1)로 Relay IR
  - `relay.build`: target c -mcpu=cortex-m4, runtime CRT, executor AOT, opt_level=1, 벡터화 끔
  - 산출물: lib0.c(workspace 21,072 B), lib1.c(1,091줄, 레이어 연산), devc.c
  - 런타임 헤더 4개 복사, `tvmgen_default.h`는 정규식으로 입출력 이름을 뽑아 직접 작성, include 경로 수정
  - 측정: 입력 0, `tvmgen_default_run()` 10회 평균
  - opt_level=1은 수동 최적화를 위해 선택 (0은 코드 생성 실패)
- **대상 선정:** lib1.c 1–483줄은 Dense용 gemm 2개 외엔 호출되지 않는 dead code → 반복이 가장 많은 conv2d `…_fixed_point_multiply_add_clip` 레이어 집중
- **적용 기법**
  - ① Loop unrolling: 복사 루프, 초기화, oci(8) 누산, i3_inner(8) 양자화를 전개 (약 356줄)
  - ② Local variable caching: 루프 불변 포인터·오프셋을 루프 밖 const 지역변수로
  - ③ Strength reduction: (루프 변수 × 상수)를 덧셈 유도변수로
- **결과:** 단독 적용 ① −41.9%, ② −25.6%, ③ −4.8%. ①이 들어간 조합은 대부분 약 527 ms로 수렴 → 최고 909,532 → 526,122 µs (1.73배)
  - fused_cast_sum_2 전개: 효과 없음 / conv1(200줄) 추가 전개: 5 ms만 감소
  - TVM opt_level=3 재빌드: 약 781 ms (1.16배) → 수동 unrolling에 못 미침
- **고찰**
  - 같은 수백 줄을 펼쳐도 conv1(약 14,000회 반복)은 5 ms, clip 레이어(수십만~백만 회)는 381 ms 감소 → 반복이 큰 레이어에서만 효과
  - Algorithm·Language·Compiler·ISA·μArch·Semiconductor 6개 관점으로 분석, 컴파일러는 aliasing 때문에 보수적이라 사람이 직접 펼치는 편이 유리
  - Netron 구조도와 C 코드 레이어 구성(Conv 5 + Mean + FC) 일치로 변환 정상 확인

## 프로젝트 — TFLM 수행 엔진 프로파일링·최적화 (05/28 – 06/18)

### 조건과 일정

- 프레임워크 tflite-micro-Arduino-examples(TFLM), 라이브러리 CMSIS-NN
- 모델: 과제 3과 같은 파일(106,040 B, 입력 uint8 1×28×28×1)
- 필수: loop unrolling과 SIMD 적용, 정확도 0.98 이상 유지
- 최종 점수 = 1–3차 평균

| 차수 | 날짜 | 내용 | 평가 |
|---|---|---|---|
| 0차 | 05/28 | 프로젝트 설명 | — |
| 1차 | 06/04 | 엔진·라이브러리 분석, 프로파일링, 1차 최적화 발표 | 분석·발표 70, 절감 30 |
| 2차 | 06/11 | 최적화 심화 발표 | 심화·발표 40, 절감 60 |
| 3차 | 06/18 | 최종 PPT + 소스 제출 | 전체 절감·기법 80, PPT·코드 20 |

### 실행 환경

- 과제 2 스케치를 기준으로 사용, Colab에서 `xxd -i`로 tflite → model.cc
- 기준 설정: AllOpsResolver, arena 100 KB, 더미 입력 0.5, 모델은 Flash
- 프로파일링: MicroInterpreter 생성자 6번째 인자로 `tflite::MicroProfiler`, Invoke 뒤 `profiler.Log()`

### 수행 엔진 분석 — Setup

- TFLM 구성: 모델(C 배열), Op Resolver(연산자 등록 테이블), Tensor Arena, MicroInterpreter
- GetModel: g_model 주소를 Model 구조체 포인터로 캐스팅, 복사 없음
- AllOpsResolver: 모든 연산자의 init·prepare·eval 함수 포인터를 SRAM 배열에 등록 (실제 사용은 QUANTIZE·CONV_2D·MEAN·FULLY_CONNECTED 4개뿐)
- MicroInterpreter 생성: arena head·tail 설정, MicroPlanner가 텐서 메모리 재사용 배치
- AllocateTensors: Persistent·Scratch·NonPersistent 영역 생성, 각 노드 Init·Prepare 호출 (CMSIS-NN 사용 여부·양자화 파라미터 결정)

### 수행 엔진 분석 — Invoke 콜 패스

| 함수 | 하는 일 |
|---|---|
| MicroGraph::InvokeSubgraph | 레이어 수만큼 invoke 호출, 끝나면 임시 메모리를 포인터 초기화로 해제 |
| Eval (CONV_2D) | 입력·필터·bias·출력 텐서와 Prepare 파라미터 읽기 |
| EvalQuantizedPerChannel | 채널별 양자화 파라미터, im2col scratch 버퍼 준비 |
| arm_convolve_wrapper_s8 | 필터·패딩 조건으로 커널 선택 → 이 모델은 arm_convolve_s8 |
| arm_convolve_s8 | 출력 픽셀마다 3×3 패치를 q15 버퍼로 펼침(im2col), 픽셀 2개가 모이면 GEMM 호출 |
| arm_nn_mat_mult_kernel_s8_s16 | 출력 채널 2 × 픽셀 2를 누산기 4개로 동시 계산, col 4개당 SMLAD 8번, 끝에 int32 → int8 재양자화 |

- 핵심 SIMD 명령: SMLAD(16비트 곱 2개 동시 누산), SXTB16(int8 2개 → int16 2개), PKHBT(레지스터 패킹)
- 발견: `kernels/cmsis_nn` 쪽 arm_convolve_wrapper_s8은 선언만 있고 실제 정의는 `third_party/cmsis_nn`

### 레이어별 프로파일

- 기준 상태에서 CONV 5개가 전체의 95.5%, 그중 CONV4·5가 73.6%
- 이유: 깊어질수록 입력 채널 1 → 8 → 16 → 32 → 64로 늘어 GEMM col 반복(입력 채널 × 9)과 SMLAD 횟수 증가

### 1차 최적화 (06/04): 238,811 → 154,589 µs (−35%)

| 기법 | 대상 | 변경 |
|---|---|---|
| Dead code 제거 | conv·mat_mult | MVEI(Helium) 미지원 → DSP 경로만 남김 |
| Strength reduction | arm_convolve_s8 | 상수 곱 인덱스 계산을 덧셈으로 |
| 특수화 | arm_convolve_s8 | 커널 3×3 고정 → kernel_x·y = 3, batch 1 → i_batch 루프 제거 |
| Loop unrolling (3×3) | arm_convolve_s8 | im2col 이중 루프(9회)를 9개 블록으로 완전 전개 |
| Loop unrolling (4 → 8) | mat_mult 커널 | col을 8개씩 처리 → 반복당 SMLAD 16번, 나머지는 스칼라 |

- CONV4 77,960 → 48,591 µs (−38%), CONV5 97,789 → 58,750 µs (−40%) → 반복 많은 뒷단에서 효과 큼
- MEAN(약 10 ms) 비중이 커져 다음 대상으로

### 2차 최적화 (06/11): 154,589 → 129,000 µs (−17%)

- **컴파일 옵션:** mbed_nano 4.5.0 platform.txt에 `-O2 -funroll-loops`, 병목 파일 2개에 `#pragma GCC optimize("O3")`·`("unroll-loops")` → 155,000 → 129,000 µs
- **D2I 시도 (기각):** 아주대 석사논문(2024) 「ARM 기반 마이크로콘트롤러를 위한 TensorFlow Lite 수행 엔진 최적화」의 D2I 방식 적용
  - im2col은 입력을 버퍼에 복사, D2I는 주소 테이블만 만듦 (준비 비용↓, 연산 비용↑)
  - 채널이 적은 CONV1·2에만 D2I를 쓰는 분기를 넣었으나 더 느려짐 → 제외 (1×1 필터가 아니면 이점 적다고 판단)
- **read_and_pad 대체 (오류):** arena·입력 텐서가 16바이트 정렬임을 확인하고 memcpy 방어 코드를 뺀 pack 함수 작성 → 74,000 µs로 발표했으나 3차에서 오류로 판명

### 3차 최적화 (06/18): 129,000 → 100,300 µs

- **2차 오류 정정:** 정확도를 재보니 30장 중 2장만 정답 → 대체 함수 때문에 SMLAD 횟수가 절반으로 줄어 있었음, read_and_pad는 이미 force-inline이라 오버헤드도 없었음 → 2차 실제 성과를 129,000 µs로 정정
- **모델 SRAM 적재 (−16%):** Flash는 캐시 미스 시 약 4사이클 추가
  - arena 실사용량 확인 → 100 KB → 20 KB
  - resolver를 `MicroMutableOpResolver<4>`(Quantize·Conv2D·Mean·FullyConnected)로 교체
  - 확보한 SRAM에 `alignas(16) g_model_ram[106040]`, setup에서 memcpy 후 GetModel → 129,000 → 108,000 µs
- **MEAN 레이어 정수화:** 기존은 float 합산 → H×W로 나눔 → 재양자화
  - reduce.cpp EvalMean에 int8 전용 경로: 채널별 int32 합 → (합 − HW × zero point) × 정수 배율(QuantizeMultiplier, MultiplyByQuantizedMultiplier) → [−128, 127] clip
  - MEAN 약 8,000 → 약 300 µs, 전체 108,000 → 100,900 µs
- **변수·분기 제거:** 모든 CONV dilation 1 → 상수화, 모든 레이어에 bias 있음 → 분기 제거·누산기를 bias로 초기화 → 100,300 µs
- **SIMD 구조 변경 시도 (미적용):** 픽셀 4개 묶음으로 GEMM 호출 절반 → 레지스터 약 14개 필요(가용 약 13개) → 127,000 µs로 느려져 되돌림. CMSIS-NN SIMD 경로는 이미 충분히 최적화돼 있다고 결론

### 최종 결과와 검증

- MNIST 테스트셋 앞 30장을 입력 scale·zero point로 양자화해 넣고 argmax를 라벨과 비교 → **30/30 정답**
- 샘플별 추론시간 100,255 – 100,312 µs로 거의 일정
- 전체 절감: 프로파일 실측 238,811 → 100,300 µs (−58%, 2.38배)
- 가장 크게 줄인 것: loop unrolling(1차, −84 ms), 컴파일 옵션(−26 ms), SRAM 적재(−21 ms)
- 제출물: 아두이노 프로젝트, 변환 노트북, 수정한 tflite-micro 라이브러리, mbed_nano 코어, platform.txt

## 부족한 점 (스스로 점검)

- **정확성 검증이 없거나 늦었음 (가장 큰 약점)**
  - 과제 3: 수백 줄 전개 코드를 넣고 원본과 출력 비교 안 함 (입력이 전부 0이라 틀려도 안 드러남)
  - 프로젝트 2차: 정확도 약 7%인 결과를 발표, 3차에서야 발견
  - → 변경마다 원본 int8 출력과 바이트 단위로 비교하는 골든 테스트가 필요했음
  - 최종 검증 30장뿐: 30/30이어도 95% 신뢰구간 하한 약 88%, 앞 30장은 쉬운 샘플
- **보고서 수치 오류**
  - CONV5 SMLAD를 294,912회(비중 약 10%)로 계산 → 실제 약 118만 회 ≈ 18 ms(약 31%), 4배 과소추정 → 2차 방향 근거가 약해짐
  - 2차 감소율 "약 27%" → 실제 약 16.8% / 과제 3 caching "약 0.33초" → 실제 0.233초 / clip 루프 "약 350만" → 실제 약 118만
- **하드웨어·툴체인 사실 오류**
  - "Cortex-M4엔 SIMD가 없다"(과제 3) → DSP 확장에 SMLAD 등 SIMD 있음, 프로젝트에서 바로 그걸 씀
  - "아두이노 기본 O0"(2차) → 실제 기본값 -Os, 2차 개선은 크기 → 속도 최적화 전환 효과
  - 곱셈 사이클 "약 3사이클/1사이클" 혼재 → M4 MUL·MLA는 1사이클, GCC가 이미 strength reduction → ③ 효과가 작았던 진짜 이유
  - TVM opt_level과 GCC -O 미구분, "GC 여유 공간"(베어메탈엔 GC 없음, 실제 제약은 Flash·SRAM)
  - "MVEI dead code 제거"는 #if 분기라 원래 컴파일에서 빠짐 → 런타임 효과 0인데 기법으로 집계
- **원인 분석이 추정에 머묾:** BN 양자화 붕괴, 양자화 후 +0.03%p(1만 장 중 3장 = 오차 범위), ①+② 역효과(①+②+③은 가장 빨라 레지스터 가설과 모순 → 빌드 실수부터 의심했어야), 4픽셀 묶음 역효과 → objdump로 spill 확인, DWT CYCCNT로 사이클 측정했다면 검증 가능
- **측정 방법:** 더미 입력, 과제 2는 ms 정수 절삭·단발 측정, 과제 3은 10회 평균만(분산 없음), 과제 2는 test set으로 모델 선택(0.9921은 약간 낙관적), 2차 이후 레이어별 프로파일 미제시
- **최적화 범위·일반성:** 과제 3은 사실상 1개 레이어만 최적화(누산 배열을 레지스터로 옮기는 큰 개선이 남음). 프로젝트는 3×3·dilation 1·bias·batch 1을 하드코딩 → 다른 모델에서 오동작, 조건 검사 + fallback 필요
- **남은 개선 여지:** 가중치를 Prepare에서 미리 q15로 펼치기, 패딩 경계 검사를 내부·가장자리 경로로 분리, MEAN의 QuantizeMultiplier를 Prepare로 이동, 과제 2에서 op resolver 축소·GAP·stride 미시도
- **과제 1 코드 결함:** 도서는 종료 때만 저장해 계정과 어긋남, 관리자 번호 비숫자 입력 시 종료, 위치 형식 미검사, 파일 내 도서번호 중복 미검사, 비밀번호 평문, object ndarray에 np.append(매번 전체 복사)
- **AI 활용:** 사용 사실은 성실히 밝혔지만 결과 검증 단계가 약했음 → "원본과 출력 비교" 한 단계만 있었어도 2차 오류는 막을 수 있었음

## 배운 점

- 최적화는 **측정 → 병목 특정 → 수정 → 다시 측정** 순서. 프로파일러 없이 감으로 고르면 효과 없는 곳(conv1, fused_cast_sum)을 고치게 됨
- 효과는 반복 횟수에 비례: 같은 전개도 반복이 많은 레이어에서만 크게 줄어듦
- 라이브러리 수준 SIMD(CMSIS-NN)가 손으로 짠 plain C 최적화보다 훨씬 강함 → 하드웨어 기능을 쓰는 코드 경로를 먼저 확인
- 메모리 위치(Flash vs SRAM)와 컴파일 옵션 같은 "코드 밖" 요소도 큰 차이를 만듦
- **빠른 것보다 맞는 것이 먼저:** 최적화마다 원본과 출력이 같은지(bit-exact) 검증하는 테스트를 먼저 만들어야 함
- 발표 전에 숫자를 다시 계산하고, 추정은 도구(objdump, 사이클 카운터)로 검증해야 함
- 틀린 결과를 스스로 찾아 공개적으로 정정한 경험

## 느낀점

- (직접 작성)

## 참고

- tflite-micro-Arduino-examples (TFLM), ARM CMSIS-NN
- 아주대 석사논문 (2024) 「ARM 기반 마이크로콘트롤러를 위한 TensorFlow Lite 수행 엔진 최적화」 (D2I 방식)
- 내 자료: Claude 문서 「임베디드시스템설계 과제·프로젝트 정리」
