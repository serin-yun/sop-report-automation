import { 
  CutoffScheduleInput, 
  CutoffScheduleResult, 
  DetailedSchedule, 
  ScheduleMilestone,
  DeliveryChannel,
  LeadTimeConfig,
  WorkingDayConfig
} from '@/types/newprod';

/**
 * 워킹데이 기준으로 날짜를 계산하는 유틸리티 함수
 */
export class WorkingDayCalculator {
  private holidays: Set<string>;
  private workingDaysPerWeek: number;

  constructor(workingDayConfig: WorkingDayConfig) {
    this.holidays = new Set(workingDayConfig.holidays);
    this.workingDaysPerWeek = workingDayConfig.workingDaysPerWeek;
  }

  /**
   * 주어진 날짜가 휴일인지 확인
   */
  private isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0];
    return this.holidays.has(dateStr);
  }

  /**
   * 주어진 날짜가 주말인지 확인 (토요일, 일요일)
   */
  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
  }

  /**
   * 주어진 날짜가 근무일인지 확인
   */
  public isWorkingDay(date: Date): boolean {
    return !this.isHoliday(date) && !this.isWeekend(date);
  }

  /**
   * 주어진 날짜에서 지정된 주수만큼 워킹데이 기준으로 더한 날짜를 반환
   */
  addWorkingWeeks(startDate: Date, weeks: number): Date {
    let currentDate = new Date(startDate);
    let workingDaysAdded = 0;
    const targetWorkingDays = weeks * this.workingDaysPerWeek;

    while (workingDaysAdded < targetWorkingDays) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (this.isWorkingDay(currentDate)) {
        workingDaysAdded++;
      }
    }

    return currentDate;
  }

  /**
   * 주어진 날짜에서 가장 가까운 근무일을 찾아 반환
   */
  findNextWorkingDay(date: Date): Date {
    let currentDate = new Date(date);
    
    while (!this.isWorkingDay(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return currentDate;
  }

  /**
   * 두 날짜 사이의 근무일 수를 계산
   */
  getWorkingDaysBetween(startDate: Date, endDate: Date): number {
    let count = 0;
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (this.isWorkingDay(currentDate)) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return count;
  }
}

/**
 * 기본 리드타임 설정을 반환
 */
export function getDefaultLeadTimeConfig(): LeadTimeConfig {
  return {
    packaging: 3, // 포장재 3주
    production: 2, // 생산 2주
    certificate: 1, // 성적서&물류 입고 1주
    qualityCheck: 1, // 신제품 품질 검사 1주
    channelAdjustment: {
      oliveyoung: 2, // 올리브영 +2주
      naver: 1, // 네이버 +1주
      apmall: 1, // AP몰 +1주
    }
  };
}

/**
 * 기본 휴일 설정을 반환 (2024년 기준)
 */
export function getDefaultWorkingDayConfig(): WorkingDayConfig {
  return {
    holidays: [
      '2024-01-01', // 신정
      '2024-02-09', '2024-02-10', '2024-02-11', '2024-02-12', // 설날 연휴
      '2024-03-01', // 삼일절
      '2024-04-10', // 국회의원선거일
      '2024-05-06', // 어린이날 대체휴일
      '2024-05-15', // 부처님오신날
      '2024-06-06', // 현충일
      '2024-08-15', // 광복절
      '2024-09-16', '2024-09-17', '2024-09-18', // 추석 연휴
      '2024-10-03', // 개천절
      '2024-10-09', // 한글날
      '2024-12-25', // 성탄절
    ],
    workingDaysPerWeek: 5, // 주 5일 근무
  };
}

/**
 * 신제품 개발 컷오프 스케줄을 계산
 */
export function calculateCutoffSchedule(input: CutoffScheduleInput): DetailedSchedule {
  const calculator = new WorkingDayCalculator(input.workingDayConfig);
  const generalLaunchDate = new Date(input.generalLaunchDate);
  
  // 기본 리드타임 계산 (포장재 + 생산 + 성적서&물류 + 품질검사)
  const baseLeadTime = input.leadTimeConfig.packaging + 
                      input.leadTimeConfig.production + 
                      input.leadTimeConfig.certificate + 
                      input.leadTimeConfig.qualityCheck;

  // 생산회의일 계산 (일반 런칭일에서 기본 리드타임만큼 역산)
  const productionMeetingDate = calculator.addWorkingWeeks(
    generalLaunchDate, 
    -baseLeadTime
  );

  // 포장재 시작일
  const packagingStartDate = calculator.addWorkingWeeks(
    productionMeetingDate, 
    input.leadTimeConfig.packaging
  );

  // 생산 시작일
  const productionStartDate = calculator.addWorkingWeeks(
    packagingStartDate, 
    input.leadTimeConfig.production
  );

  // 성적서&물류 입고일
  const certificateDate = calculator.addWorkingWeeks(
    productionStartDate, 
    input.leadTimeConfig.certificate
  );

  // 품질검사일
  const qualityCheckDate = calculator.addWorkingWeeks(
    certificateDate, 
    input.leadTimeConfig.qualityCheck
  );

  // 채널별 런칭일 계산
  const channelLaunchDates: Record<DeliveryChannel, string> = {
    oliveyoung: '',
    naver: '',
    apmall: '',
  };

  const warnings: string[] = [];

  // 각 채널별 런칭일 계산
  Object.entries(input.leadTimeConfig.channelAdjustment).forEach(([channel, additionalWeeks]) => {
    const channelLaunchDate = calculator.addWorkingWeeks(
      generalLaunchDate, 
      additionalWeeks
    );

    // 휴일 조정
    const adjustedLaunchDate = calculator.findNextWorkingDay(channelLaunchDate);
    
    channelLaunchDates[channel as DeliveryChannel] = adjustedLaunchDate.toISOString().split('T')[0];

    // 휴일로 인한 지연 경고
    if (adjustedLaunchDate.getTime() !== channelLaunchDate.getTime()) {
      warnings.push(`${channel} 런칭일이 휴일로 인해 ${adjustedLaunchDate.toISOString().split('T')[0]}로 조정되었습니다.`);
    }
  });

  // 마일스톤 생성
  const milestones: ScheduleMilestone[] = [
    {
      name: '생산회의',
      date: productionMeetingDate.toISOString().split('T')[0],
      description: '신제품 생산 계획 수립 및 승인',
      isWorkingDay: calculator.isWorkingDay(productionMeetingDate),
    },
    {
      name: '포장재 준비 시작',
      date: packagingStartDate.toISOString().split('T')[0],
      description: '포장재 주문 및 입고 시작',
      isWorkingDay: calculator.isWorkingDay(packagingStartDate),
    },
    {
      name: '생산 시작',
      date: productionStartDate.toISOString().split('T')[0],
      description: '제품 생산 시작',
      isWorkingDay: calculator.isWorkingDay(productionStartDate),
    },
    {
      name: '성적서&물류 입고',
      date: certificateDate.toISOString().split('T')[0],
      description: '성적서 발급 및 물류 입고',
      isWorkingDay: calculator.isWorkingDay(certificateDate),
    },
    {
      name: '품질검사',
      date: qualityCheckDate.toISOString().split('T')[0],
      description: '신제품 품질 검사 완료',
      isWorkingDay: calculator.isWorkingDay(qualityCheckDate),
    },
  ];

  // 채널별 런칭일 마일스톤 추가
  Object.entries(channelLaunchDates).forEach(([channel, date]) => {
    const launchDate = new Date(date);
    milestones.push({
      name: `${channel} 런칭`,
      date: date,
      description: `${channel} 채널 런칭`,
      isWorkingDay: calculator.isWorkingDay(launchDate),
    });
  });

  // 총 근무일 수 계산
  const totalWorkingDays = calculator.getWorkingDaysBetween(
    productionMeetingDate, 
    generalLaunchDate
  );

  const result: CutoffScheduleResult = {
    generalLaunchDate: input.generalLaunchDate,
    channelLaunchDates,
    productionMeetingDate: productionMeetingDate.toISOString().split('T')[0],
    packagingStartDate: packagingStartDate.toISOString().split('T')[0],
    productionStartDate: productionStartDate.toISOString().split('T')[0],
    certificateDate: certificateDate.toISOString().split('T')[0],
    qualityCheckDate: qualityCheckDate.toISOString().split('T')[0],
    totalLeadTime: baseLeadTime,
    workingDays: totalWorkingDays,
  };

  return {
    milestones: milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    summary: result,
    warnings,
  };
}

/**
 * 예시: 스킨케어 단품의 경우 계산
 */
export function calculateSkincareSingleExample(): DetailedSchedule {
  const input: CutoffScheduleInput = {
    generalLaunchDate: '2024-10-07', // 10월 1주 (월요일)
    productFactors: {
      category: 'skincare',
      type: 'single',
      deliveryChannel: 'oliveyoung',
      packagingCompany: 'A포장업체',
      specification: '50ml',
      odmCompany: 'B제조사',
    },
    leadTimeConfig: getDefaultLeadTimeConfig(),
    workingDayConfig: getDefaultWorkingDayConfig(),
  };

  return calculateCutoffSchedule(input);
}
