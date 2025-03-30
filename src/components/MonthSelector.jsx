import React from 'react';

const isSameMonth = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth()
    );
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const MonthSelector = ({ selectedMonth, onMonthSelect, dateWindow, setDateWindow }) => {
    const generateMonths = () => {
        const centerDate = new Date(dateWindow.center);
        const start = new Date(centerDate.getFullYear(), centerDate.getMonth() - dateWindow.offset, 1);
        const end = new Date(centerDate.getFullYear(), centerDate.getMonth() + dateWindow.offset, 1);
        const months = [];

        for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
            months.push({
                date: new Date(d),
                label: `${capitalize(d.toLocaleString('es-MX', { month: 'long' }))} ${d.getFullYear()}`
            });
        }

        return months;
    };

    const months = generateMonths();

    const handleSelect = (monthObj) => {
        onMonthSelect(monthObj);

        const index = months.findIndex(m => isSameMonth(m.date, monthObj.date));

        if (index === 0 || index === months.length - 1) {
            setDateWindow(prev => ({
                ...prev,
                center: monthObj.date
            }));
        }
    };

    return (
        <div style={{
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
                        fontWeight: isSameMonth(monthObj.date, selectedMonth)
                    }}
                >
                    {monthObj.label}
                </span>
            ))}
        </div>
    );
};

export default MonthSelector;