'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function toStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

function formatDisplay(start: string, end: string) {
  if (!start) return '';
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

interface Props {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  className?: string;
}

export function DateRangePicker({ startDate, endDate, onChange, className }: Props) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [hovered, setHovered] = useState('');
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSelectingEnd(false);
        setHovered('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleDayClick(dateStr: string) {
    if (!selectingEnd || !startDate) {
      onChange(dateStr, '');
      setSelectingEnd(true);
    } else if (dateStr < startDate) {
      onChange(dateStr, '');
      setSelectingEnd(true);
    } else if (dateStr === startDate) {
      setSelectingEnd(false);
      setOpen(false);
    } else {
      onChange(startDate, dateStr);
      setSelectingEnd(false);
      setOpen(false);
      setHovered('');
    }
  }

  // For hover-range preview while selecting end
  const previewEnd = selectingEnd && hovered ? hovered : endDate;
  const rangeStart = startDate && previewEnd && startDate <= previewEnd ? startDate : previewEnd;
  const rangeEnd   = startDate && previewEnd && startDate <= previewEnd ? previewEnd : startDate;

  function cellState(dateStr: string) {
    const isStart = dateStr === startDate;
    const isEnd   = endDate && dateStr === endDate;
    const inRange = rangeStart && rangeEnd && dateStr > rangeStart && dateStr < rangeEnd;
    return { isStart, isEnd, inRange };
  }

  // Build grid: leading nulls + day strings
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (string | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toStr(viewYear, viewMonth, d));

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); if (!open) setSelectingEnd(!!startDate); }}
        className="w-full flex items-center gap-2 px-4 py-3 border rounded-lg text-left focus:ring-2 focus:ring-[#42a746] focus:border-transparent hover:border-gray-400 transition-colors bg-white"
      >
        <Calendar size={15} className="text-gray-400 shrink-0" />
        <span className={`text-sm flex-1 ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
          {startDate ? formatDisplay(startDate, endDate) : 'Select date…'}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 rounded hover:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
            </button>
            <span className="text-sm font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((dateStr, i) => {
              if (!dateStr) return <div key={i} />;
              const { isStart, isEnd, inRange } = cellState(dateStr);
              const day = parseInt(dateStr.split('-')[2]);
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleDayClick(dateStr)}
                  onMouseEnter={() => selectingEnd && startDate && setHovered(dateStr)}
                  onMouseLeave={() => setHovered('')}
                  className={[
                    'text-xs py-1.5 text-center transition-colors relative',
                    isStart || isEnd
                      ? 'bg-[#42a746] text-white rounded-full font-semibold'
                      : inRange
                        ? 'bg-[#e6f4e7] text-gray-900'
                        : 'hover:bg-gray-100 rounded-full text-gray-700',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {selectingEnd && startDate && (
            <p className="text-xs text-gray-400 text-center mt-3">Click a second date to set a range</p>
          )}

          {startDate && (
            <button
              type="button"
              onClick={() => { onChange('', ''); setSelectingEnd(false); setHovered(''); }}
              className="mt-2 w-full text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
