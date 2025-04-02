import React, { useState, useEffect } from 'react';
import { getMaterialUsagesByUserId } from '../../../../services/MaterialUsageService';
import { getOrdersByUserId } from '../../../../services/Order';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';

export default function RawMaterialsGraphics() {
    const [materialUsages, setMaterialUsages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), range: 3 });

    const navigate = useNavigate();

    const isSameMonth = (date1, date2) => {
        return (
            new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
            new Date(date1).getMonth() === new Date(date2).getMonth()
        );
    };

    const generateMonths = () => {
        const { center, range } = dateWindow;
        const centerDate = new Date(center);
        const months = [];
        for (let i = -range; i <= range; i++) {
            const date = new Date(centerDate);
            date.setMonth(centerDate.getMonth() + i);
            months.push({
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date,
                isStart: i === -range,
                isEnd: i === range
            });
        }
        return months;
    };

    const months = generateMonths();

    const handleMonthSelect = (monthObj) => {
        setSelectedMonth(monthObj.date);
        if (monthObj.isStart) {
            const newCenter = new Date(dateWindow.center);
            newCenter.setMonth(newCenter.getMonth() - 3);
            setDateWindow((prev) => ({ ...prev, center: newCenter }));
        } else if (monthObj.isEnd) {
            const newCenter = new Date(dateWindow.center);
            newCenter.setMonth(newCenter.getMonth() + 3);
            setDateWindow((prev) => ({ ...prev, center: newCenter }));
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return navigate('/login-personal');

        const fetchData = async () => {
            try {
                const [usagesRes, ordersRes] = await Promise.all([
                    getMaterialUsagesByUserId(userId),
                    getOrdersByUserId(userId)
                ]);
                setMaterialUsages(usagesRes.data || []);
                setOrders(ordersRes.data || []);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
            }
        };

        fetchData();
    }, [navigate]);

    const totalMaterialCost = materialUsages
        .filter(u => isSameMonth(u.createdAt, selectedMonth))
        .reduce((sum, u) => sum + (u.totalCost || 0), 0);

    const totalNetProfit = orders
        .filter(o => isSameMonth(o.createdAt, selectedMonth))
        .reduce((sum, o) => sum + (o.netProfit || 0), 0);

    const chartData = [
        { name: 'Ganancia neta', value: totalNetProfit, color: '#4AD8C2' },
        { name: 'Gasto en materiales', value: totalMaterialCost, color: '#FF8C69' },
    ];

    const styles = {
        divider: {
            width: '100%',
            height: '2px',
            backgroundColor: '#999',
            marginTop: 20,
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: '#30437A',
            textAlign: 'center',
            marginTop: '100px'
        },
        monthSelector: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
        },
        monthItem: (selected) => ({
            margin: '0 15px',
            cursor: 'pointer',
            color: selected ? '#000' : '#B0B0B0',
            borderBottom: selected ? '2px solid #4AD8C2' : 'none',
            fontWeight: selected ? 'bold' : 'normal'
        })
    };

    return (
        <div>
            <p style={styles.title}>GANANCIAS VS GASTOS EN MATERIA PRIMA</p>

            <div style={styles.monthSelector}>
                {months.map((monthObj, index) => (
                    <span
                        key={index}
                        onClick={() => handleMonthSelect(monthObj)}
                        style={styles.monthItem(isSameMonth(monthObj.date, selectedMonth))}
                    >
                        {monthObj.label}
                    </span>
                ))}
            </div>

            <Divider style={styles.divider} />

            <div className='d-flex justify-content-center align-items-center mt-5'>
                <PieChart width={400} height={400}>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx={'50%'}
                        cy={'50%'}
                        innerRadius={80}
                        outerRadius={120}
                        label
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend
                        align="center"
                        verticalAlign="bottom"
                        layout="vertical"
                        iconType="plainline"
                        iconSize={15}
                    />
                </PieChart>
            </div>
        </div>
    );
}
