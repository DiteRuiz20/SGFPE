import React, { useState, useEffect } from 'react';
import { getNewProductOrdersByUser } from '../../../../services/NewProductOrder';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Divider } from '@mui/material';
import TopNavBar from './TopNavBar';
import MonthSelector from '../../../MonthSelector';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

export default function NewProductOrdersGraphics() {
  const [orders, setOrders] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateWindow, setDateWindow] = useState({ center: new Date(), offset: 3 });
  const navigate = useNavigate();

  const isSameMonth = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return navigate('/login-personal');

    getNewProductOrdersByUser(userId)
      .then(res => setOrders(res.data || []))
      .catch(err => console.error('Error al obtener órdenes:', err));
  }, [navigate]);

  const filteredOrders = orders.filter(order => isSameMonth(order.orderDate, selectedMonth));
  const totalOrderCost = filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalOrderCost || 0), 0);
  const totalNetProfit = filteredOrders.reduce((sum, order) => sum + parseFloat(order.netProfit || 0), 0);
  const balance = totalNetProfit - totalOrderCost;

  const chartData = () => {
    if (totalOrderCost === 0 && totalNetProfit === 0) return [];
    return [
      { name: 'Costo total de órdenes', value: totalOrderCost, color: '#4AD8C2' },
      { name: 'Ganancia neta', value: totalNetProfit, color: '#FF8C69' },
    ];
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
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Título
      const title = 'Reporte de Ganancias vs Gastos (Mercancía)';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, 20);

      // Gráfico
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 160;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const x = (pageWidth - pdfWidth) / 2;
      pdf.addImage(imgData, 'PNG', x, 30, pdfWidth, pdfHeight);

      let currentY = 40 + pdfHeight + 10;

      // Resumen
      const resumenTable = [
        ["Costo total", `$${totalOrderCost.toFixed(2)}`],
        ["Ganancia neta", `$${totalNetProfit.toFixed(2)}`],
        ["Balance final", `$${balance.toFixed(2)}`],
      ];

      autoTable(pdf, {
        head: [["Concepto", "Monto"]],
        body: resumenTable,
        startY: currentY,
        theme: 'grid',
        styles: { halign: 'center', fontSize: 12 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
      });

      currentY = pdf.lastAutoTable.finalY + 10;

      // Detalle de pedidos
      const orderDetailsTable = filteredOrders.map(order => [
        new Date(order.orderDate).toLocaleDateString(),
        order.orderDescription || "Sin descripción",
        `$${parseFloat(order.totalOrderCost || 0).toFixed(2)}`,
        `$${parseFloat(order.netProfit || 0).toFixed(2)}`
      ]);

      if (orderDetailsTable.length > 0) {
        autoTable(pdf, {
          startY: currentY,
          head: [["Fecha", "Descripción", "Costo", "Ganancia"]],
          body: orderDetailsTable,
          theme: 'grid',
          styles: { fontSize: 11 },
          headStyles: { fillColor: [255, 140, 105], textColor: 255 }
        });
        currentY = pdf.lastAutoTable.finalY + 10;
      }

      // Fecha de generación
      pdf.setFontSize(10);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, pdf.internal.pageSize.getHeight() - 10);

      pdf.save('reporte_mercancia.pdf');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

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
        <TopNavBar />
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthSelect={(monthObj) => setSelectedMonth(monthObj.date)}
          dateWindow={dateWindow}
          setDateWindow={setDateWindow}
        />
        <Divider style={styles.divider} />
      </div>

      <div className='row mt-3 d-flex justify-content-center align-items-center' id="chart-container">
        <p style={styles.title}>GANANCIAS VS GASTOS DE MERCANCÍA</p>
        {chartData().length > 0 ? (
          <PieChart width={400} height={450}>
            <Pie
              data={chartData()}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              label
            >
              {chartData().map((entry, index) => (
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
            No hay información disponible.
          </p>
        )}
      </div>

      <div className='d-flex justify-content-end align-items-center mt-5 mx-5'>
        <button className='primary_button' onClick={generatePDF}>GENERAR REPORTE</button>
      </div>
    </div>
  );
}
