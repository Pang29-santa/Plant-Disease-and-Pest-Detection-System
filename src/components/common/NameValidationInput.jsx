/**
 * NameValidationInput Component
 * =============================
 * Input field พร้อมตรวจสอบชื่อซ้ำแบบ real-time
 * 
 * Usage:
 * <NameValidationInput 
 *   type="vegetable"
 *   value={name}
 *   onChange={setName}
 *   placeholder="ชื่อผัก"
 * />
 */

import React, { useState, useEffect } from 'react';
import { useValidation } from '../../hooks';

const NameValidationInput = ({
  type = 'vegetable', // 'vegetable' | 'disease' | 'pest'
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  required = false,
}) => {
  const { checkVegetable, checkDiseasePest, isChecking } = useValidation();
  const [validation, setValidation] = useState({ exists: false, message: '' });
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Check validation when debounced value changes
  useEffect(() => {
    const checkName = async () => {
      if (!debouncedValue || debouncedValue.trim() === '') {
        setValidation({ exists: false, message: '' });
        return;
      }

      let result;
      if (type === 'vegetable') {
        result = await checkVegetable(debouncedValue);
      } else {
        const typeCode = type === 'disease' ? '1' : '2';
        result = await checkDiseasePest(debouncedValue, typeCode);
      }

      setValidation(result);
    };

    checkName();
  }, [debouncedValue, type, checkVegetable, checkDiseasePest]);

  const getTypeLabel = () => {
    switch (type) {
      case 'vegetable':
        return 'ผัก';
      case 'disease':
        return 'โรค';
      case 'pest':
        return 'ศัตรูพืช';
      default:
        return '';
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2 border rounded-lg
            focus:outline-none focus:ring-2 transition-all
            ${validation.exists 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
            }
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${className}
          `}
        />
        
        {/* Loading indicator */}
        {isChecking && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
          </div>
        )}
        
        {/* Validation status icon */}
        {!isChecking && value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.exists ? (
              <span className="text-red-500 text-xl">✗</span>
            ) : (
              <span className="text-green-500 text-xl">✓</span>
            )}
          </div>
        )}
      </div>

      {/* Validation message */}
      {validation.message && (
        <p className={`mt-1 text-sm ${validation.exists ? 'text-red-600' : 'text-green-600'}`}>
          {validation.message}
        </p>
      )}

      {/* Hint text */}
      <p className="mt-1 text-xs text-gray-500">
        กรอกชื่อ{getTypeLabel()}ภาษาไทย (ระบบจะตรวจสอบอัตโนมัติ)
      </p>
    </div>
  );
};

export default NameValidationInput;
