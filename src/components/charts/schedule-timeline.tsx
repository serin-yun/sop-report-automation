'use client';

import React from 'react';
import { DetailedSchedule, ScheduleMilestone } from '@/types/newprod';

interface ScheduleTimelineProps {
  schedule: DetailedSchedule;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ schedule }) => {
  const { milestones, summary, warnings } = schedule;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const getMilestoneIcon = (milestone: ScheduleMilestone) => {
    if (milestone.name.includes('런칭')) {
      return '🚀';
    } else if (milestone.name.includes('생산')) {
      return '🏭';
    } else if (milestone.name.includes('포장')) {
      return '📦';
    } else if (milestone.name.includes('품질')) {
      return '🔍';
    } else if (milestone.name.includes('성적서')) {
      return '📋';
    }
    return '📅';
  };

  const getMilestoneColor = (milestone: ScheduleMilestone) => {
    if (milestone.name.includes('런칭')) {
      return 'bg-green-100 border-green-500 text-green-800';
    } else if (milestone.name.includes('생산회의')) {
      return 'bg-blue-100 border-blue-500 text-blue-800';
    } else if (milestone.name.includes('생산')) {
      return 'bg-purple-100 border-purple-500 text-purple-800';
    } else if (milestone.name.includes('포장')) {
      return 'bg-orange-100 border-orange-500 text-orange-800';
    } else if (milestone.name.includes('품질')) {
      return 'bg-red-100 border-red-500 text-red-800';
    } else if (milestone.name.includes('성적서')) {
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    }
    return 'bg-gray-100 border-gray-500 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">스케줄 요약</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-blue-600">일반 런칭일</div>
            <div className="text-lg font-semibold text-blue-900">
              {formatDate(summary.generalLaunchDate)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-green-600">생산회의일</div>
            <div className="text-lg font-semibold text-green-900">
              {formatDate(summary.productionMeetingDate)}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-purple-600">총 리드타임</div>
            <div className="text-lg font-semibold text-purple-900">
              {summary.totalLeadTime}주 ({summary.workingDays}일)
            </div>
          </div>
        </div>
      </div>

      {/* 경고사항 */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ 주의사항</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 타임라인 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">개발 스케줄 타임라인</h3>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${getMilestoneColor(milestone)}`}>
                  {getMilestoneIcon(milestone)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    {milestone.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(milestone.date)}
                    </span>
                    {!milestone.isWorkingDay && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        휴일
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {milestone.description}
                </p>
                {milestone.adjustedDate && (
                  <p className="text-xs text-orange-600 mt-1">
                    휴일 조정: {formatDate(milestone.adjustedDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 채널별 런칭일 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">채널별 런칭일</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(summary.channelLaunchDates).map(([channel, date]) => (
            <div key={channel} className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-600 capitalize">
                {channel === 'oliveyoung' ? '올리브영' : 
                 channel === 'naver' ? '네이버' : 'AP몰'}
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {formatDate(date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
