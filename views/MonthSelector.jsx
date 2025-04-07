import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function MonthSelector({ selectedMonth, onSelectMonth }) {
    const [months, setMonths] = useState([]);
    const scrollRef = useRef(null);

    const isSameMonth = (date1, date2) =>
        date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();

    const generateMonths = (centerDate) => {
        const generated = Array.from({ length: 6 }, (_, i) => {
            const date = new Date(centerDate);
            date.setMonth(centerDate.getMonth() - 2 + i);
            return {
                label: `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
                date,
            };
        });
        setMonths(generated);

        // Centrar el scroll en el mes actual
        setTimeout(() => {
            scrollRef.current?.scrollTo({ x: 140, animated: true });
        }, 50);
    };

    useEffect(() => {
        generateMonths(selectedMonth || new Date());
    }, [selectedMonth]);

    return (
        <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.monthTabs}>
            {months.map((month, index) => (
                <TouchableOpacity key={index} onPress={() => onSelectMonth(new Date(month.date))}>
                    <Text style={[styles.monthItem, isSameMonth(selectedMonth, month.date) && styles.activeMonth]}>
                        {month.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    monthTabs: { flexDirection: 'row', marginBottom: 20 },
    monthItem: { marginHorizontal: 16, fontSize: 16, color: '#666' },
    activeMonth: { color: '#41416e', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#00C897' },
});
