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
import autoTable from 'jspdf-autotable';

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

  const totalMaterialCost = materialUsages
    .filter(u => isSameMonth(u.createdAt, selectedMonth))
    .reduce((sum, u) => sum + (u.totalCost || 0), 0);

  const totalNetProfit = orders
    .filter(o => isSameMonth(o.createdAt, selectedMonth))
    .reduce((sum, o) => sum + (o.netProfit || 0), 0);

  const balance = totalNetProfit - totalMaterialCost;

  const chartData = () => {
    if (totalMaterialCost === 0 && totalNetProfit === 0) return [];
    return [
      { name: 'Ganancia neta', value: totalNetProfit, color: '#4AD8C2' },
      { name: 'Gasto en materiales', value: totalMaterialCost, color: '#FF8C69' },
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

      // TÍTULO PRINCIPAL
      const title = 'Reporte de Ganancias vs Gastos';
      pdf.setFontSize(18);
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, 20);

      // GRÁFICO DE PASTEL
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 160;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const x = (pageWidth - pdfWidth) / 2;
      pdf.addImage(imgData, 'PNG', x, 30, pdfWidth, pdfHeight);

      let currentY = 40 + pdfHeight + 10;

      // RESUMEN GENERAL
      const resumenTable = [
        ["Ganancia neta", `$${totalNetProfit.toFixed(2)}`],
        ["Gasto en materiales", `$${totalMaterialCost.toFixed(2)}`],
        ["Balance final", `$${(totalNetProfit - totalMaterialCost).toFixed(2)}`],
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

      // TABLA DETALLADA DE PEDIDOS (Ganancia Neta)
      const filteredOrders = orders.filter(o => isSameMonth(o.createdAt, selectedMonth));
      const ordersTable = filteredOrders.map(o => [
        new Date(o.createdAt).toLocaleDateString(),
        o.orderDescription || 'Sin descripción',
        `$${(o.netProfit || 0).toFixed(2)}`
      ]);

      if (ordersTable.length > 0) {
        autoTable(pdf, {
          startY: currentY,
          head: [["Fecha", "Producto", "Ganancia"]],
          body: ordersTable,
          theme: 'grid',
          styles: { fontSize: 11 },
          headStyles: { fillColor: [23, 162, 184], textColor: 255 }
        });
        currentY = pdf.lastAutoTable.finalY + 10;
      }

      // TABLA DETALLADA DE INSUMOS (Gasto en materiales)
      const filteredUsages = materialUsages.filter(u => isSameMonth(u.createdAt, selectedMonth));
      const usagesTable = filteredUsages.map(u => [
        new Date(u.createdAt).toLocaleDateString(),
        u.usageDescription || 'Material',
        u.quantityUsed || 0,
        `$${(u.totalCost || 0).toFixed(2)}`
      ]);

      if (usagesTable.length > 0) {
        autoTable(pdf, {
          startY: currentY,
          head: [["Fecha", "Material", "Cantidad", "Costo"]],
          body: usagesTable,
          theme: 'grid',
          styles: { fontSize: 11 },
          headStyles: { fillColor: [255, 140, 105], textColor: 255 }
        });
      }

      // FECHA DEL REPORTE
      pdf.setFontSize(10);
      pdf.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, pdf.internal.pageSize.getHeight() - 10);

      pdf.save('reporte_ganancias_gastos.pdf');
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
        <p style={styles.title}>GANANCIAS NETAS VS GASTOS</p>
        {chartData().length > 0 ? (
          <PieChart width={400} height={400}>
            <Pie
              data={chartData()}
              dataKey="value"
              nameKey="name"
              cx={'50%'}
              cy={'50%'}
              innerRadius={80}
              outerRadius={120}
              label>
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
            No hay información disponible.</p>
        )}
      </div>

      <div className='d-flex justify-content-end align-items-center mt-5 mx-5'>
        <button className='primary_button' onClick={generatePDF}>GENERAR REPORTE</button>
      </div>
    </div>
  );
}
