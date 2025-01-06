import { LineChart } from "@mantine/charts";
import '@mantine/charts/styles.css';

function StockGraph({data, stock, limSup, limInf}) {  
  return (
        <LineChart
            h={200}
            data={data}
            dataKey="created_at"
            yAxisProps={{ domain: [0, limSup] }}
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