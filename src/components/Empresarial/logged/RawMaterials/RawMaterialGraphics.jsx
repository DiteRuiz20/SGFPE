import React, { useState, useEffect } from 'react';
import { getMaterialUsagesByUserId } from '../../../../services/MaterialUsageService';
import { getOrdersByUserId } from '../../../../services/Order';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function RawMaterialsGraphics() {
    const [materialUsages, setMaterialUsages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });

    const navigate = useNavigate();

    const isSameMonth = (date1, date2) => {
        return (
            new Date(date1).getFullYear() === new Date(date2).getFullYear() &&
            new Date(date1).getMonth() === new Date(date2).getMonth()
        );
    };

    const generatePDF = async () => {
        const input = document.getElementById('chart-container');
        if (!input) {
            console.error("No se encontró el contenedor del gráfico.");
            return;
        }
    
        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(18);
            pdf.text('Reporte de Ganancias vs Gastos', 20, 20);
            
            pdf.addImage(imgData, 'PNG', 20, 40, 160, 100);
            
            pdf.setFontSize(12);
            pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 150);
            
            pdf.save('reporte.pdf');
        } catch (error) {
            console.error('Error al generar el PDF:', error);
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
      }
    };

    return (
      <div>
        <div className="row justify-content-center">
          <TopNavBar/>

          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
            dateWindow={dateWindow}
            setDateWindow={setDateWindow}
          />
          
          <Divider style={styles.divider} />
        </div>
      
        <div className='row mt-3 d-flex justify-content-center align-items-center' id="chart-container">
          <p style={styles.title}>GANANCIAS NETAS VS GASTOS</p>
          {chartData.values.length > 0 ? (
            <PieChart width={400} height={400}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx={'50%'}
                cy={'50%'}
                innerRadius={80}
                outerRadius={120}
                label>
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
            ) : (
              <p style={{ textAlign: "center", fontSize: "16px", color: "gray" }}>
              No hay información disponible.</p>
            )}
        </div>

        <div className='d-flex justify-content-end align-items-center mt-5 mx-5'>
          <button className='primary_button' onClick={generatePDF}>GENERAR REPORTE</button>
        </div>
      </div>
    );
}
