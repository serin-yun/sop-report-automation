// 신제품 개발 컷오프 스케줄 관련 타입 정의

export type ProductCategory = 'skincare' | 'makeup';
export type ProductType = 'single' | 'set';
export type DeliveryChannel = 'oliveyoung' | 'naver' | 'apmall';
export type PackagingCompany = string;
export type Specification = string;
export type ODMCompany = string;

export interface ProductFactors {
  category: ProductCategory;
  type: ProductType;
  deliveryChannel: DeliveryChannel;
  packagingCompany: PackagingCompany;
  specification: Specification;
  odmCompany: ODMCompany;
}

export interface LeadTimeConfig {
  packaging: number; // 포장재 소요 주수
  production: number; // 생산 소요 주수
  certificate: number; // 성적서&물류 입고 소요 주수
  qualityCheck: number; // 신제품 품질 검사 소요 주수
  channelAdjustment: Record<DeliveryChannel, number>; // 채널별 추가 소요 주수
}

export interface WorkingDayConfig {
  holidays: string[]; // 휴일 목록 (YYYY-MM-DD 형식)
  workingDaysPerWeek: number; // 주당 근무일 수
}

export interface CutoffScheduleInput {
  generalLaunchDate: string; // 일반 런칭일 (YYYY-MM-DD)
  productFactors: ProductFactors;
  leadTimeConfig: LeadTimeConfig;
  workingDayConfig: WorkingDayConfig;
}

export interface CutoffScheduleResult {
  generalLaunchDate: string;
  channelLaunchDates: Record<DeliveryChannel, string>;
  productionMeetingDate: string;
  packagingStartDate: string;
  productionStartDate: string;
  certificateDate: string;
  qualityCheckDate: string;
  totalLeadTime: number; // 총 소요 주수
  workingDays: number; // 총 근무일 수
}

export interface ScheduleMilestone {
  name: string;
  date: string;
  description: string;
  isWorkingDay: boolean;
  adjustedDate?: string; // 휴일 조정된 날짜
}

export interface DetailedSchedule {
  milestones: ScheduleMilestone[];
  summary: CutoffScheduleResult;
  warnings: string[];
}
