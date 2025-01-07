import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, NumberInput, Title, SimpleGrid, Card, Text, Divider, ActionIcon, Group, Stack, Center} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import StockGraph from '../components/StockGraph';
import EditableNumberInput from '../components/EditableNumberInput';
import axios from 'axios';
import { useAuth } from '../providers/AuthProvider';

function Home() {
    const [stocks, setStock] = useState([]); 
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [loadingRemove, setLoadingRemove] = useState(false);
    
    const fetchStocks = () => {
      axios.get("/stock/get").then((res) => {
        setStock(res.data.result.reverse());
      })
    }
    
    const addStock = (symbol) => {
      axios.get(`/stock/get/${symbol}`).then((response) => {
        setStock([response.data.result, ...stocks]);
      });
    }

    useEffect(() => {
      fetchStocks();
      setInterval(() => {
        fetchStocks();
      }, 60000);
    }, []);

    const form = useForm({
      mode: 'uncontrolled',
    })

    const handleSubmit = (values) => {
      setLoadingAdd(true);
      axios.post("/stock/add/", {
        symbol: values.symbol.toUpperCase(),
        upper_limit: values.upper,
        lower_limit: values.lower,
        period: values.period,
      }, {

      }).then(() => {
        addStock(values.symbol);
        setLoadingAdd(false);
      }).catch((error) => {
        console.log(error)
      });
    };

    const updateStock = (new_stock, index) => {
      axios.put(`/stock/update/${new_stock[index].symbol}`, {
        symbol: new_stock[index].symbol.toUpperCase(),
        upper_limit: new_stock[index].upper_limit,
        lower_limit: new_stock[index].lower_limit,
        period: new_stock[index].period
      }).then((response) => {
        const newStocks = [...stocks];
        newStocks[index].upper_limit = new_stock[index].upper_limit;
        newStocks[index].lower_limit = new_stock[index].lower_limit;
        newStocks[index].period = new_stock[index].period;
        setStock(newStocks);
      });
    }

    const handleChangeLimit = (new_value, limit, index) => {
      const newStocks = [...stocks];
      newStocks[0][limit] = new_value;
      console.log(newStocks);
      updateStock(newStocks, index);
    }

    const handleRemove = (index) => {
      axios.delete(`/stock/delete/${stocks[index].symbol}`).then(() => {
        fetchStocks();
      });
    }
    return (
      <>
        <Title align="center">ObservAções</Title>
        <Center>
        <form style={{width: { xs: '50%', sm: "25%" }}} onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Autocomplete
            data={[]}
            label="Ação"
            placeholder="Selecione uma ação"
            required
            withAsterisk={false}
            key={form.values.symbol}
            {...form.getInputProps('symbol')}
          />
          <SimpleGrid cols={{base: 1, sm: 3}} spacing={{base: 'xs', sm: 'lg'}} mt="md">
            <NumberInput
              label="Valor para venda"
              placeholder="Valor para venda"
              required
              withAsterisk={false}
              min={0}
              prefix="R$"
              decimalScale={2}
              fixedDecimalScale
              decimalSeparator=","
              step={0.01}
              key={form.values.upper}
              {...form.getInputProps('upper')}
            />
            <NumberInput
              label="Valor para compra"
              placeholder="Valor para compra"
              required
              min={0}
              withAsterisk={false}
              prefix="R$"
              decimalScale={2}
              fixedDecimalScale
              decimalSeparator=","
              step={0.01}
              key={form.values.lower}
              {...form.getInputProps('lower')}
            />
            <NumberInput
              label="Período de verificação em minutos"
              placeholder="Período em minutos"
              required
              min={1}
              withAsterisk={false}
              fixedDecimalScale
              key={form.values.period}
              {...form.getInputProps('period')}
            />
          </SimpleGrid>
          <Group justify="flex-end" mt="md">
            <Button type="submit" loading={loadingAdd}>Adicionar</Button>
          </Group>
        </form>
        </Center>
        <Center>
        {stocks.length !== 0 ? 
        <SimpleGrid w="75%" cols={{base: 1, sm: 2}} spacing={{base: 'xs', sm: 'lg'}} mt="md" mb="xl">
            {stocks.map((stock, index) => (
            <Card href={`/symbol/${stock.symbol}`} key={stock.symbol} shadow="xs" padding="md"> 
                <Text size="xl" weight={700}>{stock.symbol}</Text>
                <Text size="sm" c="gray" mt="xs">{stock.name}</Text>
                <Text size="lg" weight={700} mt="xs">R${stock.price.toFixed(2).toString().replace('.', ',')}</Text>
                <StockGraph symbol={stock.symbol} data={stock.history} stock={stock.symbol} limSup={stock.upper_limit} limInf={stock.lower_limit}/>
                <Divider orientation="horizontal" margins="md" />
                <Stack>
                  <EditableNumberInput text="Valor para venda: " prefix="R$" step={0.01} decimalScale={2} valueOri={stock.upper_limit} onChangeHandler={(new_val) => handleChangeLimit(new_val, 'upper_limit', index)}/>
                  <EditableNumberInput text="Valor para compra: " prefix="R$" step={0.01} decimalScale={2} valueOri={stock.lower_limit} onChangeHandler={(new_val) => handleChangeLimit(new_val, 'lower_limit', index)}/>
                  <EditableNumberInput text="Periodo em minutos de aviso: " step={0.01} valueOri={stock.period} onChangeHandler={(new_val) => handleChangeLimit(new_val, 'period', index)}/>
                </Stack>
                <Button mt="sm" onClick={() => handleRemove(index)} loading={loadingRemove} variant="light" color="red">Remover</Button>
            </Card>
          ))}
        </SimpleGrid> :
        <Title align="center" order={2} mt="xl" c="gray">Adicione uma ação para observar</Title>
        }
        </Center>
      </>
    );
} 

export default Home;