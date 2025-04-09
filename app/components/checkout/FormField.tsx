'use client';

import React, { ChangeEvent } from 'react';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type: React.HTMLInputTypeAttribute; // Use standard HTML input types
  value: string | number; // Allow number for potential future use
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  pattern?: string;
  maxLength?: number;
  title?: string;
  errors?: string[]; // Pass specific errors for this field
  isBusinessField?: boolean; // Flag for fields specific to business section
  as?: 'input' | 'textarea'; // Allow rendering as textarea
  rows?: number; // For textarea
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type,
  value,
  onChange,
  required = false,
  placeholder,
  autoComplete,
  pattern,
  maxLength,
  title,
  errors,
  isBusinessField = false, // Default to false
  as = 'input',
  rows,
}) => {
  const hasError = errors && errors.length > 0;
  const errorId = `${id}-error`;

  const commonInputProps = {
    id,
    name,
    value,
    onChange,
    required,
    placeholder,
    autoComplete,
    pattern,
    maxLength,
    title,
    className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-3 py-2 text-sm ${
      hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
    }`,
    'aria-describedby': hasError ? errorId : undefined,
    'aria-invalid': hasError ? true : undefined,
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}{' '}
        {required && !isBusinessField && <span className="text-red-500">*</span>}
        {required && isBusinessField && <span className="text-red-500">*</span>}{' '}
        {/* Ensure required asterisk shows for business fields too */}
      </label>
      {as === 'input' ? (
        <input type={type} {...commonInputProps} />
      ) : (
        <textarea rows={rows} {...commonInputProps} />
      )}
      {hasError && (
        <div id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {errors.join(', ')}
        </div>
      )}
    </div>
  );
};

export default FormField;
