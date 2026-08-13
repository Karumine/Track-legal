import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'เลือก...',
  id,
  placement = 'auto',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  const toggleDropdown = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const modal = dropdownRef.current.closest('.modal-content');
      let shouldOpenUp = placement === 'up';

      if (placement === 'auto') {
        if (modal) {
          const modalRect = modal.getBoundingClientRect();
          const spaceBelowInModal = modalRect.bottom - rect.bottom;
          shouldOpenUp = spaceBelowInModal < 180 || (window.innerHeight - rect.bottom) < 220;
        } else {
          shouldOpenUp = (window.innerHeight - rect.bottom) < 220;
        }
      }
      setOpenUpward(shouldOpenUp);
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
  };

  return (
    <div
      className={`custom-select-container ${isOpen ? 'open' : ''} ${openUpward ? 'drop-up' : ''} ${className}`}
      ref={dropdownRef}
      id={id}
    >
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="custom-select-value">
          {selectedOption?.icon && (
            <span className="custom-select-icon">{selectedOption.icon}</span>
          )}
          <span className="custom-select-label">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <i className={`fa-solid fa-chevron-down custom-select-arrow ${isOpen ? 'rotate' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="custom-select-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className={`custom-select-option ${isSelected ? 'selected' : ''} ${opt.className || ''}`}
                onClick={() => handleSelect(opt.value)}
                role="option"
                aria-selected={isSelected}
              >
                <div className="option-content">
                  {opt.icon && <span className="option-icon">{opt.icon}</span>}
                  <span className="option-label">{opt.label}</span>
                </div>
                {isSelected && (
                  <span className="option-check">
                    <i className="fa-solid fa-check"></i>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
