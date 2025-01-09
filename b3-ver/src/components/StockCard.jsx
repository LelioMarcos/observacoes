import { Card, Text, Divider, Stack, Button } from '@mantine/core';
import StockGraph from './StockGraph';
import EditableNumberInput from './EditableNumberInput';
import { useState } from 'react';
import axios from 'axios';

function StockCard({stocks, stock, index, setStock, fetchStocks}) {
    const [loading, setLoading] = useState(false);

    const updateStock = (new_stock, index) => {
        axios.put(`/stock/update/${new_stock[index].symbol}`, {
            symbol: new_stock[index].symbol.toUpperCase(),
            upper_limit: new_stock[index].upper_limit,
            lower_limit: new_stock[index].lower_limit,
            period: new_stock[index].period
        }).then(() => {
            const newStocks = [...stocks];
            newStocks[index].upper_limit = new_stock[index].upper_limit;
            newStocks[index].lower_limit = new_stock[index].lower_limit;
            newStocks[index].period = new_stock[index].period;
            setStock(newStocks);
        });
    }

    const handleUpdateStockButton = (new_value, limit, index) => {
        const newStocks = [...stocks];
        newStocks[index][limit] = new_value;
        console.log(newStocks);
        updateStock(newStocks, index);
    }

    const handleRemove = (index) => {
        setLoading(true);
        axios.delete(`/stock/delete/${stocks[index].symbol}`).then(() => {
            setLoading(false);
            fetchStocks();
        });
    }

    return (
        <Card href={`/symbol/${stock.symbol}`} key={stock.symbol} shadow="xs" padding="md"> 
            <Text size="xl" weight={700}>{stock.symbol}</Text>
            <Text size="sm" c="gray" mt="xs">{stock.name}</Text>
            <Text size="lg" weight={700} mt="xs">R${stock.price.toFixed(2).toString().replace('.', ',')}</Text>
            <StockGraph symbol={stock.symbol} data={stock.history} stock={stock.symbol} limSup={stock.upper_limit} limInf={stock.lower_limit}/>
            <Divider orientation="horizontal" margins="md" />
            <Stack>
                <EditableNumberInput text="Valor para venda: " prefix="R$" step={0.01} decimalScale={2} valueOri={stock.upper_limit} onChangeHandler={(new_val) => handleUpdateStockButton(new_val, 'upper_limit', index)}/>
                <EditableNumberInput text="Valor para compra: " prefix="R$" step={0.01} decimalScale={2} valueOri={stock.lower_limit} onChangeHandler={(new_val) => handleUpdateStockButton(new_val, 'lower_limit', index)}/>
                <EditableNumberInput text="Periodo em minutos de aviso: " step={0.01} valueOri={stock.period} onChangeHandler={(new_val) => handleUpdateStockButton(new_val, 'period', index)}/>
            </Stack>
            <Button mt="sm" onClick={() => handleRemove(index)} loading={loading} variant="light" color="red">Remover</Button>
        </Card>
    )
}

export default StockCard;