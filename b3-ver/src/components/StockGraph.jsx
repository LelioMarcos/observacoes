import { LineChart } from "@mantine/charts";
import '@mantine/charts/styles.css';

function StockGraph({stock, limSup, limInf}) {
    const data = [
        {
          date: 'Mar 22',
          Apples: 2890,
        },
        {
          date: 'Mar 23',
          Apples: 2756,
        },
        {
          date: 'Mar 24',
          Apples: 3322,
        },
        {
          date: 'Mar 25',
          Apples: 3470,
        },
        {
          date: 'Mar 26',
          Apples: 3129,
        },
      ];
    return (
        <LineChart
            h={200}
            data={data}
            dataKey="date"
            referenceLines={
                [
                    { y: limSup, color: 'red', label: 'Limite venda', strokeDasharray: '5 5'},
                    { y: limInf, color: 'red', label: 'Limite compra', strokeDasharray: '5 5' },
                ]
            }
            series={[
                { name: 'Apples', color: 'indigo.6'},
            ]}
            curveType="linear"
            withTooltip={false}
            withDots={false}
        />
    );
}

export default StockGraph;