import * as XLSX from 'xlsx';

// 한국 공휴일 데이터 (2025년 기준)
const KOREAN_HOLIDAYS_2025 = [
  '2025-01-01', // 신정
  '2025-01-28', '2025-01-29', '2025-01-30', // 설날 연휴
  '2025-03-01', // 삼일절
  '2025-05-05', // 어린이날
  '2025-05-12', // 부처님오신날
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-06', '2025-10-07', '2025-10-08', // 추석 연휴
  '2025-10-03', // 개천절
  '2025-10-09', // 한글날
  '2025-12-25'  // 성탄절
];

// 제품 유형별 기본 소요 기간 (newprod.md 기준)
const PRODUCT_SCHEDULES = {
  'SC단품': { baseWeeks: 7, phases: ['포장재준비', '생산', '성적서물류', '품질검사'] },
  'SC세트': { baseWeeks: 8, phases: ['포장재준비', '생산', '포장', '성적서물류', '품질검사'] },
  'MU단품': { baseWeeks: 8, phases: ['포장재준비', '생산', '성적서물류', '품질검사'] },
  'MU세트': { baseWeeks: 9, phases: ['포장재준비', '생산', '포장', '성적서물류', '품질검사'] }
};

// 납품처별 추가 소요 기간
const DELIVERY_WEEKS = {
  '올리브영': 2,
  '네이버': 1,
  'AP몰': 1
};

export interface ProductInfo {
  productName: string;
  productType: 'SC단품' | 'SC세트' | 'MU단품' | 'MU세트';
  deliveryChannel: '올리브영' | '네이버' | 'AP몰';
  targetLaunchDate: Date;
  year: number;
}

export interface Task {
  category: string;
  task: string;
  plannedDate: Date;
  duration: number;
  note: string;
}

export interface TimelineItem {
  label: string;
  date: Date;
  isHoliday: boolean;
  holidayName?: string;
}

export interface ScheduleReport {
  header: {
    title: string;
    productType: string;
    deliveryChannel: string;
    targetLaunchDate: Date;
    totalWeeks: number;
  };
  timeline: TimelineItem[];
  tasks: Task[];
  schedule: {
    productionMeeting: Date;
    totalWeeks: number;
    phases: string[];
    deliveryChannel: string;
    targetLaunchDate: Date;
  };
}

// 워킹데이 판단 함수
export function isWorkingDay(date: Date, holidays: string[] = KOREAN_HOLIDAYS_2025): boolean {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  
  // 주말 체크 (토요일=6, 일요일=0)
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  // 공휴일 체크
  if (holidays.includes(dateStr)) return false;
  
  return true;
}

// 워킹데이 기준으로 앞으로 날짜 계산
export function calculateWorkingDateForward(startDate: Date, weeks: number, holidays: string[] = KOREAN_HOLIDAYS_2025): Date {
  let currentDate = new Date(startDate);
  let workingWeeks = 0;
  
  while (workingWeeks < weeks) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (isWorkingDay(currentDate, holidays)) {
      workingWeeks++;
    }
  }
  
  return currentDate;
}

// 워킹데이 기준으로 뒤로 날짜 계산
export function calculateWorkingDateBackward(endDate: Date, weeks: number, holidays: string[] = KOREAN_HOLIDAYS_2025): Date {
  let currentDate = new Date(endDate);
  let workingWeeks = 0;
  
  while (workingWeeks < weeks) {
    currentDate.setDate(currentDate.getDate() - 1);
    if (isWorkingDay(currentDate, holidays)) {
      workingWeeks++;
    }
  }
  
  return currentDate;
}

// 스케줄 계산
export function calculateSchedule(productType: string, deliveryChannel: string, targetLaunchDate: Date, holidays: string[] = KOREAN_HOLIDAYS_2025) {
  const product = PRODUCT_SCHEDULES[productType as keyof typeof PRODUCT_SCHEDULES];
  const additionalWeeks = DELIVERY_WEEKS[deliveryChannel as keyof typeof DELIVERY_WEEKS];
  const totalWeeks = product.baseWeeks + additionalWeeks;
  
  // 생산회의 상정일 계산 (워킹데이 기준)
  const productionMeetingDate = calculateWorkingDateBackward(targetLaunchDate, totalWeeks, holidays);
  
  return {
    productionMeeting: productionMeetingDate,
    totalWeeks: totalWeeks,
    phases: product.phases,
    deliveryChannel: deliveryChannel,
    targetLaunchDate: targetLaunchDate
  };
}

// 타임라인 생성
export function generateTimeline(year: number, schedule: any, holidays: string[] = KOREAN_HOLIDAYS_2025): TimelineItem[] {
  const timeline: TimelineItem[] = [];
  const startDate = new Date(year, 6, 1); // 7월 1일
  const endDate = new Date(year, 9, 31); // 10월 31일
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const month = currentDate.getMonth() + 1;
    const week = Math.ceil(currentDate.getDate() / 7);
    const weekLabel = `${month}월${week}주`;
    
    // 휴일 체크
    const isHoliday = holidays.includes(currentDate.toISOString().split('T')[0]);
    
    timeline.push({
      label: weekLabel,
      date: new Date(currentDate),
      isHoliday: isHoliday,
      holidayName: isHoliday ? getHolidayName(currentDate, holidays) : undefined
    });
    
    // 다음 주로 이동
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return timeline;
}

// 휴일명 반환
function getHolidayName(date: Date, holidays: string[]): string {
  const dateStr = date.toISOString().split('T')[0];
  const holidayNames: { [key: string]: string } = {
    '2025-01-01': '신정',
    '2025-01-28': '설날',
    '2025-01-29': '설날',
    '2025-01-30': '설날',
    '2025-03-01': '삼일절',
    '2025-05-05': '어린이날',
    '2025-05-12': '부처님오신날',
    '2025-06-06': '현충일',
    '2025-08-15': '광복절',
    '2025-10-03': '개천절',
    '2025-10-06': '추석',
    '2025-10-07': '추석',
    '2025-10-08': '추석',
    '2025-10-09': '한글날',
    '2025-12-25': '성탄절'
  };
  
  return holidayNames[dateStr] || '휴일';
}

// 작업 항목 생성
export function generateTasks(productType: string, schedule: any, holidays: string[] = KOREAN_HOLIDAYS_2025): Task[] {
  const tasks: Task[] = [];
  
  // 내용물 관련 작업
  tasks.push({
    category: '내용물',
    task: '처방확정',
    plannedDate: calculateWorkingDateBackward(schedule.productionMeeting, 2, holidays),
    duration: 2,
    note: '(자사: 파일럿, 충터)'
  });
  
  tasks.push({
    category: '내용물',
    task: 'CT',
    plannedDate: calculateWorkingDateBackward(schedule.productionMeeting, 1, holidays),
    duration: 2,
    note: 'TF CT필요시'
  });
  
  // 포장재 관련 작업
  tasks.push({
    category: '포장재',
    task: '금형완료(TF)',
    plannedDate: schedule.productionMeeting,
    duration: 2,
    note: '(신금형)'
  });
  
  tasks.push({
    category: '포장재',
    task: '용기컬러확정',
    plannedDate: calculateWorkingDateForward(schedule.productionMeeting, 1, holidays),
    duration: 1,
    note: '(화)'
  });
  
  tasks.push({
    category: '포장재',
    task: '원화확정',
    plannedDate: calculateWorkingDateForward(schedule.productionMeeting, 1, holidays),
    duration: 1,
    note: '(자사:포장재T)'
  });
  
  // 생산회의
  tasks.push({
    category: '생산회의',
    task: '생산회의',
    plannedDate: schedule.productionMeeting,
    duration: 1,
    note: ''
  });
  
  // 생산 관련 작업
  const productionTasks = generateProductionTasks(productType, schedule, holidays);
  tasks.push(...productionTasks);
  
  // 주문목표 및 런칭
  tasks.push({
    category: '주문목표',
    task: '주문목표',
    plannedDate: calculateWorkingDateBackward(schedule.targetLaunchDate, 2, holidays),
    duration: 1,
    note: '주문(화)'
  });
  
  tasks.push({
    category: '런칭',
    task: '런칭',
    plannedDate: schedule.targetLaunchDate,
    duration: 1,
    note: ''
  });
  
  return tasks;
}

// 생산 작업 생성
function generateProductionTasks(productType: string, schedule: any, holidays: string[]): Task[] {
  const tasks: Task[] = [];
  let currentDate = calculateWorkingDateForward(schedule.productionMeeting, 4, holidays);
  
  // 포장재양산
  tasks.push({
    category: '생산',
    task: '포장재양산',
    plannedDate: currentDate,
    duration: 3,
    note: ''
  });
  
  currentDate = calculateWorkingDateForward(currentDate, 3, holidays);
  
  // 충진
  tasks.push({
    category: '생산',
    task: '충진',
    plannedDate: currentDate,
    duration: 2,
    note: ''
  });
  
  currentDate = calculateWorkingDateForward(currentDate, 2, holidays);
  
  // 포장 (세트인 경우만)
  if (productType.includes('세트')) {
    tasks.push({
      category: '생산',
      task: '포장',
      plannedDate: currentDate,
      duration: 2,
      note: ''
    });
    currentDate = calculateWorkingDateForward(currentDate, 2, holidays);
  }
  
  // 성적서/입고
  tasks.push({
    category: '생산',
    task: '성적서/입고',
    plannedDate: currentDate,
    duration: 1,
    note: ''
  });
  
  return tasks;
}

// 메인 보고서 생성 함수
export function generateNewProductReport(productInfo: ProductInfo): ScheduleReport {
  const {
    productName,
    productType,
    deliveryChannel,
    targetLaunchDate,
    year
  } = productInfo;
  
  // 기본 정보 생성
  const basicInfo = {
    title: `${year}년 ${getMonthWeek(targetLaunchDate)} ${deliveryChannel} 런칭 신제품 ${productName} 컷오프 스케쥴`,
    productType: productType,
    deliveryChannel: deliveryChannel,
    targetLaunchDate: targetLaunchDate,
    totalWeeks: getTotalWeeks(productType, deliveryChannel)
  };
  
  // 스케줄 계산
  const schedule = calculateSchedule(productType, deliveryChannel, targetLaunchDate);
  
  // 작업 항목 생성
  const tasks = generateTasks(productType, schedule);
  
  // 타임라인 생성
  const timeline = generateTimeline(year, schedule);
  
  return {
    header: basicInfo,
    timeline: timeline,
    tasks: tasks,
    schedule: schedule
  };
}

// 월주차 계산
function getMonthWeek(date: Date): string {
  const month = date.getMonth() + 1;
  const week = Math.ceil(date.getDate() / 7);
  return `${month}월${week}주`;
}

// 총 소요 기간 계산
function getTotalWeeks(productType: string, deliveryChannel: string): number {
  const product = PRODUCT_SCHEDULES[productType as keyof typeof PRODUCT_SCHEDULES];
  const additionalWeeks = DELIVERY_WEEKS[deliveryChannel as keyof typeof DELIVERY_WEEKS];
  return product.baseWeeks + additionalWeeks;
}

// Excel 파일 생성
export function createExcelReport(report: ScheduleReport): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // 헤더 생성
  const header = [
    ['구분', 'Task', '계획일', ...report.timeline.map(t => t.label)]
  ];
  
  // 데이터 행 생성
  const dataRows = report.tasks.map(task => {
    const row = [
      task.category,
      task.task,
      formatDate(task.plannedDate),
      ...generateTimelineCells(task, report.timeline)
    ];
    return row;
  });
  
  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet([...header, ...dataRows]);
  
  // 워크시트에 추가
  XLSX.utils.book_append_sheet(workbook, worksheet, '신제품 개발 컷오프 스케쥴');
  
  return workbook;
}

// 날짜 포맷팅
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 타임라인 셀 생성
function generateTimelineCells(task: Task, timeline: TimelineItem[]): string[] {
  return timeline.map(timelineItem => {
    const taskStart = new Date(task.plannedDate);
    const taskEnd = calculateWorkingDateForward(taskStart, task.duration);
    
    if (timelineItem.date >= taskStart && timelineItem.date <= taskEnd) {
      return '■';
    }
    
    if (timelineItem.isHoliday) {
      return timelineItem.holidayName || '휴일';
    }
    
    return '';
  });
}

