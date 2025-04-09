'use client';

import React, { ChangeEvent } from 'react';

interface AccountCreationProps {
  createAccountChecked: boolean;
  passwordValue: string;
  onCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const AccountCreation: React.FC<AccountCreationProps> = ({
  createAccountChecked,
  passwordValue,
  onCheckboxChange,
  onPasswordChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          id="create_account" // Add id for label association
          name="create_account"
          checked={createAccountChecked}
          onChange={onCheckboxChange}
          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        {/* Use label element for better accessibility */}
        <label htmlFor="create_account" className="text-sm font-medium text-gray-700">
          Vytvoriť účet? (Rýchlejšie budúce nákupy)
        </label>
      </label>
      {createAccountChecked && (
        <div className="mt-4">
          {/* Using FormField might be overkill if validation styles are not needed directly here,
             but keeps consistency. Or use raw label/input. Using raw for simplicity now. */}
          <label htmlFor="account_password" className="block text-sm font-medium text-gray-700 mb-1">
            Zadajte heslo <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="account_password"
            name="account_password"
            required={createAccountChecked} // Required only if checkbox is checked
            value={passwordValue}
            onChange={onPasswordChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            autoComplete="new-password"
          />
          <p className="mt-1 text-xs text-gray-500">
            Min. 8 znakov, aspoň 1 veľké písmeno, 1 číslo a 1 špeciálny znak (!@#$%^&*)
          </p>
           {/* Note: Password validation logic (min length, complexity) should ideally happen
               in the parent component (CheckoutClient) during submission, not visually here.
               The FormField component also doesn't currently handle password validation display. */}
        </div>
      )}
    </div>
  );
};

export default AccountCreation;
