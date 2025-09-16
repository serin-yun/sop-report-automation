import * as XLSX from 'xlsx';
import { ScheduleReport } from './report-generator';

// Excel 파일 다운로드 함수
export function downloadExcelReport(report: ScheduleReport, filename?: string): void {
  const workbook = createExcelWorkbook(report);
  const defaultFilename = `${report.header.title.replace(/\s+/g, '_')}.xlsx`;
  
  // Excel 파일을 Blob으로 변환
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  
  // 다운로드 링크 생성
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  
  // 다운로드 실행
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 메모리 정리
  URL.revokeObjectURL(url);
}

// Excel 워크북 생성
export function createExcelWorkbook(report: ScheduleReport): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // 메인 스케줄 시트 생성
  const scheduleSheet = createScheduleSheet(report);
  XLSX.utils.book_append_sheet(workbook, scheduleSheet, '신제품 개발 컷오프 스케쥴');
  
  // 요약 정보 시트 생성
  const summarySheet = createSummarySheet(report);
  XLSX.utils.book_append_sheet(workbook, summarySheet, '요약 정보');
  
  return workbook;
}

// 스케줄 시트 생성
function createScheduleSheet(report: ScheduleReport): XLSX.WorkSheet {
  const data: any[][] = [];
  
  // 제목 행
  data.push([report.header.title]);
  data.push([]);
  
  // 기본 정보 행
  data.push(['제품명', report.header.title.split(' ')[3] || '']);
  data.push(['제품 유형', report.header.productType]);
  data.push(['납품처', report.header.deliveryChannel]);
  data.push(['목표 런칭일', formatDate(report.header.targetLaunchDate)]);
  data.push(['총 소요 기간', `${report.header.totalWeeks}주`]);
  data.push([]);
  
  // 헤더 행
  const headerRow = ['구분', 'Task', '계획일', ...report.timeline.map(t => t.label)];
  data.push(headerRow);
  
  // 데이터 행
  report.tasks.forEach(task => {
    const row = [
      task.category,
      task.task,
      formatDate(task.plannedDate),
      ...generateTimelineCells(task, report.timeline)
    ];
    data.push(row);
  });
  
  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 열 너비 설정
  const colWidths = [
    { wch: 10 }, // 구분
    { wch: 20 }, // Task
    { wch: 12 }, // 계획일
    ...report.timeline.map(() => ({ wch: 8 })) // 타임라인 열들
  ];
  worksheet['!cols'] = colWidths;
  
  // 셀 스타일 적용
  applyCellStyles(worksheet, data.length, headerRow.length);
  
  return worksheet;
}

// 요약 정보 시트 생성
function createSummarySheet(report: ScheduleReport): XLSX.WorkSheet {
  const data: any[][] = [];
  
  // 제목
  data.push(['신제품 출시 상정 가이드 - 요약 정보']);
  data.push([]);
  
  // 기본 정보
  data.push(['기본 정보']);
  data.push(['제품명', report.header.title.split(' ')[3] || '']);
  data.push(['제품 유형', report.header.productType]);
  data.push(['납품처', report.header.deliveryChannel]);
  data.push(['목표 런칭일', formatDate(report.header.targetLaunchDate)]);
  data.push(['총 소요 기간', `${report.header.totalWeeks}주`]);
  data.push([]);
  
  // 스케줄 정보
  data.push(['스케줄 정보']);
  data.push(['생산회의 상정일', formatDate(report.schedule.productionMeeting)]);
  data.push(['실제 런칭일', formatDate(report.schedule.targetLaunchDate)]);
  data.push([]);
  
  // 작업 단계별 일정
  data.push(['작업 단계별 일정']);
  report.tasks.forEach(task => {
    data.push([
      task.category,
      task.task,
      formatDate(task.plannedDate),
      `${task.duration}주`,
      task.note
    ]);
  });
  data.push([]);
  
  // 휴일 정보
  data.push(['휴일 정보']);
  const holidays = report.timeline.filter(t => t.isHoliday);
  holidays.forEach(holiday => {
    data.push([
      holiday.label,
      formatDate(holiday.date),
      holiday.holidayName || '휴일'
    ]);
  });
  
  // 워크시트 생성
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 열 너비 설정
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 12 },
    { wch: 8 },
    { wch: 20 }
  ];
  
  return worksheet;
}

// 타임라인 셀 생성
function generateTimelineCells(task: any, timeline: any[]): string[] {
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

// 워킹데이 기준으로 앞으로 날짜 계산 (간단 버전)
function calculateWorkingDateForward(startDate: Date, weeks: number): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + (weeks * 7));
  return result;
}

// 날짜 포맷팅
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 셀 스타일 적용
function applyCellStyles(worksheet: XLSX.WorkSheet, rowCount: number, colCount: number): void {
  // 제목 행 스타일
  if (worksheet['A1']) {
    worksheet['A1'].s = {
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' }
    };
  }
  
  // 헤더 행 스타일
  const headerRow = 9; // 헤더 행 번호 (0-based)
  for (let col = 0; col < colCount; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'E6F3FF' } },
        alignment: { horizontal: 'center' }
      };
    }
  }
  
  // 휴일 셀 스타일
  for (let row = headerRow + 1; row < rowCount; row++) {
    for (let col = 3; col < colCount; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (worksheet[cellRef] && worksheet[cellRef].v && worksheet[cellRef].v.includes('휴일')) {
        worksheet[cellRef].s = {
          fill: { fgColor: { rgb: 'FFE6E6' } },
          font: { color: { rgb: 'FF0000' } }
        };
      }
    }
  }
}

// Excel 파일을 Base64로 변환 (서버 전송용)
export function excelToBase64(report: ScheduleReport): string {
  const workbook = createExcelWorkbook(report);
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
  return wbout;
}

// Base64를 Excel 파일로 변환
export function base64ToExcel(base64: string): XLSX.WorkBook {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return XLSX.read(bytes, { type: 'array' });
}
