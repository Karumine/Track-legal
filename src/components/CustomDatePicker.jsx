import React, { useState, useRef, useEffect } from 'react';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAYS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'เลือกกำหนดส่ง...',
  id,
  placement = 'auto',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef(null);

  // Parse initial year/month from value or today
  const getInitialYearMonth = () => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        return { year: parts[0], month: parts[1] - 1 };
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  };

  const [viewDate, setViewDate] = useState(getInitialYearMonth());

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        setViewDate({ year: parts[0], month: parts[1] - 1 });
      }
    }
  }, [value]);

  const toggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (placement === 'up' || (placement === 'auto' && spaceBelow < 320)) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
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

  // Navigate months
  const prevMonth = (e) => {
    e.stopPropagation();
    e.currentTarget.blur();
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 };
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    e.currentTarget.blur();
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 };
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Format date to YYYY-MM-DD
  const formatYMD = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Select day
  const handleSelectDay = (year, month, day) => {
    const ymd = formatYMD(year, month, day);
    onChange(ymd);
    setIsOpen(false);
  };

  // Select Today
  const handleToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const ymd = formatYMD(now.getFullYear(), now.getMonth(), now.getDate());
    onChange(ymd);
    setViewDate({ year: now.getFullYear(), month: now.getMonth() });
    setIsOpen(false);
  };

  // Clear Date
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Format display text in Thai
  const formatDisplay = (val) => {
    if (!val) return '';
    const parts = val.split('-').map(Number);
    if (parts.length !== 3) return val;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  // Generate calendar days
  const year = viewDate.year;
  const month = viewDate.month;
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayYMD = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());

  const days = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = month === 0 ? 11 : month - 1;
    const prevY = month === 0 ? year - 1 : year;
    const ymd = formatYMD(prevY, prevM, d);
    days.push({
      day: d,
      month: prevM,
      year: prevY,
      ymd,
      isOtherMonth: true,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = formatYMD(year, month, d);
    days.push({
      day: d,
      month,
      year,
      ymd,
      isOtherMonth: false,
    });
  }

  // Next month padding (always fill exactly 42 slots = 6 rows of 7 days)
  const TOTAL_SLOTS = 42;
  const remaining = TOTAL_SLOTS - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = month === 11 ? 0 : month + 1;
    const nextY = month === 11 ? year + 1 : year;
    const ymd = formatYMD(nextY, nextM, d);
    days.push({
      day: d,
      month: nextM,
      year: nextY,
      ymd,
      isOtherMonth: true,
    });
  }

  const thaiYear = year + 543;

  return (
    <div
      className={`custom-datepicker-container ${isOpen ? 'open' : ''} ${openUpward ? 'drop-up' : ''} ${className}`}
      ref={containerRef}
      id={id}
    >
      <button
        type="button"
        className={`custom-datepicker-trigger ${isOpen ? 'active' : ''} ${value ? 'has-value' : ''}`}
        onClick={toggleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="custom-datepicker-value">
          <i className="fa-regular fa-calendar custom-datepicker-cal-icon"></i>
          <span>{value ? formatDisplay(value) : placeholder}</span>
        </div>
        {value ? (
          <span
            className="custom-datepicker-clear-btn"
            onClick={handleClear}
            title="ล้างวันที่"
          >
            <i className="fa-solid fa-xmark"></i>
          </span>
        ) : (
          <i className={`fa-solid fa-chevron-down custom-datepicker-arrow ${isOpen ? 'rotate' : ''}`}></i>
        )}
      </button>

      {isOpen && (
        <div className="custom-datepicker-dropdown" role="dialog">
          {/* Header with Navigation */}
          <div className="datepicker-header">
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={prevMonth}
              title="เดือนก่อนหน้า"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="datepicker-title">
              <span className="datepicker-month">{THAI_MONTHS[month]}</span>
              <span className="datepicker-year">{thaiYear}</span>
            </div>

            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={nextMonth}
              title="เดือนถัดไป"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="datepicker-weekdays">
            {WEEKDAYS.map((w, idx) => (
              <span
                key={w}
                className={`datepicker-weekday ${idx === 0 || idx === 6 ? 'weekend' : ''}`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="datepicker-grid">
            {days.map((item, idx) => {
              const isSelected = item.ymd === value;
              const isToday = item.ymd === todayYMD;
              return (
                <button
                  type="button"
                  key={idx}
                  className={`datepicker-day ${item.isOtherMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleSelectDay(item.year, item.month, item.day)}
                >
                  <span>{item.day}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="datepicker-footer">
            {value ? (
              <button
                type="button"
                className="datepicker-action-btn clear"
                onClick={handleClear}
              >
                <i className="fa-regular fa-trash-can"></i>
                ล้าง
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="datepicker-action-btn today"
              onClick={handleToday}
            >
              <i className="fa-solid fa-calendar-day"></i>
              วันนี้
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
