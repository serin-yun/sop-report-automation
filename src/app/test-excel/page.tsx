'use client';

import React, { useState } from 'react';
import { CutoffScheduleForm } from '@/components/forms/cutoff-schedule-form';
import { generateNewProductReport, ProductInfo } from '@/lib/excel/report-generator';
import { downloadExcelReport } from '@/lib/excel/excel-utils';

export default function TestExcelPage() {
  const [result, setResult] = useState<any>(null);

  const handleTestExcel = () => {
    // 테스트용 ProductInfo 생성
    const testProductInfo: ProductInfo = {
      productName: '진저슈가 립세럼',
      productType: 'SC단품',
      deliveryChannel: '올리브영',
      targetLaunchDate: new Date('2025-10-31'),
      year: 2025
    };

    try {
      // 보고서 생성
      const report = generateNewProductReport(testProductInfo);
      
      // Excel 파일 다운로드
      downloadExcelReport(report);
      
      console.log('테스트 Excel 파일이 생성되었습니다:', report);
    } catch (error) {
      console.error('Excel 파일 생성 중 오류:', error);
      alert('Excel 파일 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          신제품 출시 상정 보고서 테스트
        </h1>
        
        {/* 테스트 버튼 */}
        <div className="mb-8">
          <button
            onClick={handleTestExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            테스트 Excel 파일 다운로드
          </button>
        </div>

        {/* 폼 컴포넌트 */}
        <CutoffScheduleForm onResult={setResult} />

        {/* 결과 표시 */}
        {result && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">계산 결과</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
