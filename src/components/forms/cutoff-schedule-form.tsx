'use client';

import React, { useState } from 'react';
import { ProductFactors, CutoffScheduleInput, DeliveryChannel } from '@/types/newprod';
import { calculateCutoffSchedule, getDefaultLeadTimeConfig, getDefaultWorkingDayConfig } from '@/lib/calculations/cutoff-schedule';
import ExcelExportButton from '@/components/NewProductSchedule/ExcelExportButton';

interface CutoffScheduleFormProps {
  onResult: (result: any) => void;
}

interface ProductInfo {
  productName: string;
  productType: 'SC단품' | 'SC세트' | 'MU단품' | 'MU세트';
  deliveryChannel: '올리브영' | '네이버' | 'AP몰';
  targetLaunchDate: Date;
  year: number;
}

export const CutoffScheduleForm: React.FC<CutoffScheduleFormProps> = ({ onResult }) => {
  const [formData, setFormData] = useState<CutoffScheduleInput>({
    generalLaunchDate: '',
    productFactors: {
      category: 'skincare',
      type: 'single',
      deliveryChannel: 'oliveyoung',
      packagingCompany: '',
      specification: '',
      odmCompany: '',
    },
    leadTimeConfig: getDefaultLeadTimeConfig(),
    workingDayConfig: getDefaultWorkingDayConfig(),
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductFactorChange = (field: keyof ProductFactors, value: any) => {
    setFormData(prev => ({
      ...prev,
      productFactors: {
        ...prev.productFactors,
        [field]: value,
      },
    }));
  };

  const handleCalculate = async () => {
    if (!formData.generalLaunchDate) {
      alert('일반 런칭일을 입력해주세요.');
      return;
    }

    setIsCalculating(true);
    try {
      const result = calculateCutoffSchedule(formData);
      onResult(result);
      
      // Excel 다운로드를 위한 ProductInfo 생성
      const productTypeMap = {
        'skincare': formData.productFactors.type === 'single' ? 'SC단품' : 'SC세트',
        'makeup': formData.productFactors.type === 'single' ? 'MU단품' : 'MU세트'
      };
      
      const deliveryChannelMap = {
        'oliveyoung': '올리브영',
        'naver': '네이버',
        'apmall': 'AP몰'
      };
      
      const newProductInfo: ProductInfo = {
        productName: '신제품', // 기본값, 실제로는 입력받을 수 있음
        productType: productTypeMap[formData.productFactors.category] as any,
        deliveryChannel: deliveryChannelMap[formData.productFactors.deliveryChannel] as any,
        targetLaunchDate: new Date(formData.generalLaunchDate),
        year: new Date(formData.generalLaunchDate).getFullYear()
      };
      
      setProductInfo(newProductInfo);
    } catch (error) {
      console.error('계산 중 오류가 발생했습니다:', error);
      alert('계산 중 오류가 발생했습니다.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">신제품 개발 컷오프 스케줄 계산</h2>
      
      {/* 일반 런칭일 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          일반 런칭일 *
        </label>
        <input
          type="date"
          value={formData.generalLaunchDate}
          onChange={(e) => handleInputChange('generalLaunchDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* 제품 팩터 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 제품 카테고리 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제품 카테고리
          </label>
          <select
            value={formData.productFactors.category}
            onChange={(e) => handleProductFactorChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="skincare">스킨케어</option>
            <option value="makeup">메이크업</option>
          </select>
        </div>

        {/* 제품 타입 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제품 타입
          </label>
          <select
            value={formData.productFactors.type}
            onChange={(e) => handleProductFactorChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">단품</option>
            <option value="set">세트</option>
          </select>
        </div>

        {/* 납품처 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            납품처
          </label>
          <select
            value={formData.productFactors.deliveryChannel}
            onChange={(e) => handleProductFactorChange('deliveryChannel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="oliveyoung">올리브영</option>
            <option value="naver">네이버</option>
            <option value="apmall">AP몰</option>
          </select>
        </div>

        {/* 포장업체 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            포장업체
          </label>
          <input
            type="text"
            value={formData.productFactors.packagingCompany}
            onChange={(e) => handleProductFactorChange('packagingCompany', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="포장업체명을 입력하세요"
          />
        </div>

        {/* 사양 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            사양
          </label>
          <input
            type="text"
            value={formData.productFactors.specification}
            onChange={(e) => handleProductFactorChange('specification', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제품 사양을 입력하세요"
          />
        </div>

        {/* ODM사 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ODM사
          </label>
          <input
            type="text"
            value={formData.productFactors.odmCompany}
            onChange={(e) => handleProductFactorChange('odmCompany', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ODM사명을 입력하세요"
          />
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {productInfo && (
            <span>Excel 다운로드 가능</span>
          )}
        </div>
        <div className="flex gap-3">
          {productInfo && (
            <ExcelExportButton 
              productInfo={productInfo}
              className="px-4 py-2"
            />
          )}
          <button
            onClick={handleCalculate}
            disabled={isCalculating || !formData.generalLaunchDate}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCalculating ? '계산 중...' : '스케줄 계산'}
          </button>
        </div>
      </div>
    </div>
  );
};
