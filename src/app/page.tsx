'use client';

import React, { useState } from 'react';
import { CutoffScheduleForm } from '@/components/forms/cutoff-schedule-form';
import { ScheduleTimeline } from '@/components/charts/schedule-timeline';
import { DetailedSchedule } from '@/types/newprod';

export default function Home() {
  const [scheduleResult, setScheduleResult] = useState<DetailedSchedule | null>(null);

  const handleScheduleResult = (result: DetailedSchedule) => {
    setScheduleResult(result);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          S&OP 보고서 자동화
        </h1>
        <p className="text-gray-600 mb-8">
          신제품 개발 일정표, Fade-out 단종 관리, 신제품 리뷰를 자동 생성합니다.
        </p>
        
        <div className="space-y-8">
          {/* 신제품 개발 컷오프 스케줄 폼 */}
          <CutoffScheduleForm onResult={handleScheduleResult} />
          
          {/* 스케줄 결과 */}
          {scheduleResult && (
            <ScheduleTimeline schedule={scheduleResult} />
          )}
        </div>
      </div>
    </main>
  )
}
