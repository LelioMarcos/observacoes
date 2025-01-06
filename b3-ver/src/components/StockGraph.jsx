import { LineChart } from "@mantine/charts";
import '@mantine/charts/styles.css';
import { useState, useEffect } from "react";

function StockGraph({data, limSup, limInf}) {  
    const [yAxisLimitLower, setYAxisLimitLower] = useState(0);  
    const [yAxisLimitUpper, setYAxisLimitUpper] = useState(0);  
    
    useEffect(() => {
        const maxPrice = Math.max(...data.map((item) => item.price));
        const minPrice = Math.min(...data.map((item) => item.price));
        
        if (maxPrice > limSup) setYAxisLimitUpper(maxPrice + (maxPrice - minPrice) * 0.1);
        else setYAxisLimitUpper(limSup + (limSup - limInf) * 0.1);

        if (minPrice < limInf) setYAxisLimitLower(minPrice - (maxPrice - minPrice) * 0.1);
        else setYAxisLimitLower(limInf - (limSup - limInf) * 0.1);
    }, [data, limSup, limInf]);

    return (
        <LineChart
            h={200}
            data={data}
            dataKey="created_at"
            withPointLabels
            valueFormatter={(value) => `R$${value.toFixed(2)}`}
            yAxisProps={{ domain: [yAxisLimitLower, yAxisLimitUpper] }}
            referenceLines={
                [
                    { y: limSup, color: 'red', label: 'Limite venda', strokeDasharray: '5 5'},
                    { y: limInf, color: 'red', label: 'Limite compra', strokeDasharray: '5 5' },
                ]
            }
            series={[
                { name: 'price', color: 'indigo.6'},
            ]}
            curveType="linear"
            withTooltip={false}
            withDots={false}
        />
    );
}

export default StockGraph;