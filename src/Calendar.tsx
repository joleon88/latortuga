import React, { useState, type JSX } from "react";
import "./Calendar.css";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

export interface CalendarProps {
  occupiedDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({ occupiedDates = [] }) => {
  const today = new Date();
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());

  const startOfMonth = new Date(displayYear, displayMonth, 1);
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstWeekday = startOfMonth.getDay();

  const cells: JSX.Element[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push(<div key={`e${i}`} className="cell empty" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(displayYear, displayMonth, d);
    const occupied = occupiedDates.some(
      (od) => od.toDateString() === dt.toDateString(),
    );
    cells.push(
      <div key={d} className={`cell${occupied ? " occupied" : ""}`}>
        {d}
      </div>,
    );
  }

  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const monthName = new Date(displayYear, displayMonth).toLocaleString(
    "default",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="calendar-container bg-white text-gray-800">
      <div className="month-header-nav">
        <button
          onClick={handlePrevMonth}
          className="nav-button"
          aria-label="Mes anterior"
        >
          <IconChevronLeft size={18} />
        </button>
        <div className="month-header text-indigo-600">{monthName}</div>
        <button
          onClick={handleNextMonth}
          className="nav-button"
          aria-label="Próximo mes"
        >
          <IconChevronRight size={18} />
        </button>
      </div>
      <div className="weekdays">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((w) => (
          <div key={w} className="weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="days-grid">{cells}</div>
    </div>
  );
};

export default Calendar;
