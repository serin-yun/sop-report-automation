'use client';

import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import { generateNewProductReport, ProductInfo } from '@/lib/excel/report-generator';
import { downloadExcelReport } from '@/lib/excel/excel-utils';

interface ExcelExportButtonProps {
  productInfo: ProductInfo;
  disabled?: boolean;
  className?: string;
}

export default function ExcelExportButton({ 
  productInfo, 
  disabled = false, 
  className = '' 
}: ExcelExportButtonProps) {
  const handleExport = () => {
    try {
      // 보고서 생성
      const report = generateNewProductReport(productInfo);
      
      // Excel 파일 다운로드
      downloadExcelReport(report);
      
      // 성공 메시지 (선택사항)
      console.log('Excel 파일이 다운로드되었습니다.');
    } catch (error) {
      console.error('Excel 파일 생성 중 오류가 발생했습니다:', error);
      alert('Excel 파일 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-green-600 hover:bg-green-700 
        text-white font-medium rounded-lg
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <FileSpreadsheet className="w-4 h-4" />
      <Download className="w-4 h-4" />
      Excel 다운로드
    </button>
  );
}
