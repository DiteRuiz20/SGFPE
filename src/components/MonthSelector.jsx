import React, { useState, useEffect, useMemo } from 'react';

const isSameMonth = (date1, date2) => {
    if (!(date1 instanceof Date) || !(date2 instanceof Date)) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const MonthSelector = ({ selectedMonth, onMonthSelect, dateWindow, setDateWindow }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const currentDate = new Date();
    const LIMIT_YEARS = 2;

    const minDate = new Date(currentDate.getFullYear() - LIMIT_YEARS, 0, 1);
    const maxDate = new Date(currentDate.getFullYear() + LIMIT_YEARS, 11, 1);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const months = useMemo(() => {
        const centerDate = new Date(dateWindow.center);
        const start = new Date(centerDate.getFullYear(), centerDate.getMonth() - dateWindow.offset, 1);
        const end = new Date(centerDate.getFullYear(), centerDate.getMonth() + dateWindow.offset, 1);
        const result = [];

        for (let i = 0; ; i++) {
            const current = new Date(start.getFullYear(), start.getMonth() + i, 1);
            if (current > end) break;
            if (current >= minDate && current <= maxDate) {
                result.push({
                    date: current,
                    label: `${capitalize(current.toLocaleString('es-MX', { month: 'long' }))} ${current.getFullYear()}`
                });
            }
        }

        return result;
    }, [dateWindow, minDate, maxDate]);

    const handleSelect = (monthObj) => {
        if (!monthObj) return;
        onMonthSelect(monthObj);

        const index = months.findIndex(m => isSameMonth(m.date, monthObj.date));
        const isAtStart = index === 0;
        const isAtEnd = index === months.length - 1;

        if (isAtStart || isAtEnd) {
            const newCenter = monthObj.date;
            setDateWindow(prev => ({ ...prev, center: newCenter }));

        }
    };

    const handleDirectSelect = (year, month) => {
        const newDate = new Date(year, month, 1);
        if (newDate >= minDate && newDate <= maxDate) {
            onMonthSelect({
                date: newDate,
                label: `${capitalize(newDate.toLocaleString('es-MX', { month: 'long' }))} ${newDate.getFullYear()}`
            });
            setDateWindow(prev => ({ ...prev, center: newDate }));
        }
    };

    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: capitalize(new Date(0, i).toLocaleString('es-MX', { month: 'long' }))
    }));

    const yearOptions = Array.from(
        { length: maxDate.getFullYear() - minDate.getFullYear() + 1 },
        (_, i) => minDate.getFullYear() + i
    );

    const selectedIndex = months.findIndex(m => isSameMonth(m.date, selectedMonth));
    const validIndex = selectedIndex !== -1 ? selectedIndex : 0;

    return (
        <>
            {isMobile ? (
                <div className='col-12' style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '10px',
                }}>
                    <select
                        value={selectedMonth?.getMonth?.() ?? 0}
                        onChange={(e) => handleDirectSelect(selectedMonth.getFullYear(), parseInt(e.target.value))}
                        className="input"
                        aria-label="Seleccionar mes"
                    >
                        {monthOptions.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
    
                    <select
                        value={selectedMonth?.getFullYear?.() ?? currentDate.getFullYear()}
                        onChange={(e) => handleDirectSelect(parseInt(e.target.value), selectedMonth.getMonth())}
                        className="input"
                        aria-label="Seleccionar año"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className='row'>
                    <div className='col-9' style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '30px',
                        marginBottom: '10px',
                        flexWrap: 'wrap',
                    }}>
                        {months.map((monthObj, index) => (
                            <span
                                key={`${monthObj.date.getMonth()}-${monthObj.date.getFullYear()}-${index}`}
                                onClick={() => handleSelect(monthObj)}
                                style={{
                                    cursor: 'pointer',
                                    color: isSameMonth(monthObj.date, selectedMonth) ? '#000' : '#B0B0B0',
                                    borderBottom: isSameMonth(monthObj.date, selectedMonth) ? '2px solid #4AD8C2' : 'none',
                                    padding: '5px',
                                }}
                            >
                                {monthObj.label}
                            </span>
                        ))}
                    </div>

                    <div className='col-3' style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '10px',
                    }}>
                        <select
                            value={selectedMonth?.getMonth?.() ?? 0}
                            onChange={(e) => handleDirectSelect(selectedMonth.getFullYear(), parseInt(e.target.value))}
                            className="input"
                            aria-label="Seleccionar mes"
                        >
                            {monthOptions.map((m) => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>

                        <select
                            value={selectedMonth?.getFullYear?.() ?? currentDate.getFullYear()}
                            onChange={(e) => handleDirectSelect(parseInt(e.target.value), selectedMonth.getMonth())}
                            className="input"
                            aria-label="Seleccionar año"
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </>
    );
};

export default MonthSelector;
