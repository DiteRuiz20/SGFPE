import React, { useState, useEffect } from 'react';
import { getNewProductOrdersByUser } from '../../../../services/NewProductOrder';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import TopNavBar from './TopNavBar';

export default function NewProductOrdersGraphics() {
    const [orders, setOrders] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), range: 3 });
    const navigate = useNavigate();

    const isSameMonth = (date1, date2) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
    };

    const generateMonths = () => {
        const { center, range } = dateWindow;
        const months = [];
        for (let i = -range; i <= range; i++) {
            const date = new Date(center);
            date.setMonth(center.getMonth() + i);
            months.push({
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date,
                isStart: i === -range,
                isEnd: i === range,
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
            setDateWindow({ ...dateWindow, center: newCenter });
        } else if (monthObj.isEnd) {
            const newCenter = new Date(dateWindow.center);
            newCenter.setMonth(newCenter.getMonth() + 3);
            setDateWindow({ ...dateWindow, center: newCenter });
        }
    };

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return navigate('/login-personal');

        getNewProductOrdersByUser(userId)
            .then(res => setOrders(res.data || []))
            .catch(err => console.error('Error al obtener órdenes:', err));
    }, [navigate]);

    const totalOrderCost = orders
        .filter(order => isSameMonth(order.orderDate, selectedMonth))
        .reduce((sum, order) => sum + parseFloat(order.totalOrderCost || 0), 0);

    const totalNetProfit = orders
        .filter(order => isSameMonth(order.orderDate, selectedMonth))
        .reduce((sum, order) => sum + parseFloat(order.netProfit || 0), 0);

    const chartData = [
        { name: 'Costo total de órdenes', value: totalOrderCost, color: '#4AD8C2' },
        { name: 'Ganancia neta', value: totalNetProfit, color: '#FF8C69' },
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
            <TopNavBar />
            <p style={styles.title}>GANANCIAS VS COSTO DE NUEVA MERCANCÍA</p>

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
                        cx="50%"
                        cy="50%"
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
