import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Check, Search } from 'lucide-react';

const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  disabled = false,
  displayValue // Function to get the display string from an option object
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Initialize filtered options
    setFilteredOptions(options);
  }, [options]);

  useEffect(() => {
    // Filter options when search term changes
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = options.filter(option => 
      displayValue(option).toLowerCase().includes(lowerSearch)
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options, displayValue]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedOption = options.find(opt => opt.id === parseInt(value));

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex items-center justify-between cursor-pointer transition-all duration-200 ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-primary-400 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`block truncate text-sm ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
          {selectedOption ? displayValue(selectedOption) : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col animate-fade-in-up">
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder={t('common.searchDots')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-primary-50 transition-colors ${
                    value === option.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                >
                  <span>{displayValue(option)}</span>
                  {value === option.id && <Check className="w-4 h-4 text-primary-600" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {t('common.noResults')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
