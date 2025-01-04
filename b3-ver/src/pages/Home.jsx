import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, NumberInput, Title, SimpleGrid, Card, Text, Divider, ActionIcon, Group, Stack, Center} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';
import StockGraph from '../components/StockGraph';
import EditableNumberInput from '../components/EditableNumberInput';
import axios from 'axios';


function Home() {
    const [stocks, setStock] = useState([]); 
    const [loadingAdd, setLoadingAdd] = useState(false);

    const fetchStocks = () => {
      axios.get("http://127.0.0.1:8000/stock/get").then((response) => {
        setStock(response.data.result.reverse());
      });
    }
    
    useEffect(() => {
      fetchStocks()
    }, []);

    const form = useForm({
      mode: 'uncontrolled',
    })

    const handleSubmit = (values) => {
      setLoadingAdd(true);
      axios.post("http://127.0.0.1:8000/stock/add/", {
        symbol: values.symbol,
        upper_limit: values.upper,
        lower_limit: values.lower
      }, {

      }).then(() => {
        axios.get(`http://127.0.0.1:8000/stock/get/${values.symbol}`).then((response) => {
          setStock([response.data.result, ...stocks]);
        });
        setLoadingAdd(false);
      }).catch((error) => {
        console.log(error)
      });

    };

    const handleChangeLimits = (value, index) => {
      const newStocks = [...stocks];
      newStocks[index].upper = value;
      setStock(newStocks);
    }

    const handleRemove = (index) => {
      axios.delete(`http://127.0.0.1:8000/stock/delete/${stocks[index].symbol}`).then(() => {
        fetchStocks();
      });
    }
    return (
      <>
        <Title align="center">ObservAções</Title>
        <Center>
        <form style={{width: { xs: '50%', sm: "25%" }}} onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Autocomplete
            data={['AAPL', 'GOOGL', 'AMZN', 'TSLA']}
            label="Ação"
            placeholder="Selecione uma ação"
            required
            withAsterisk={false}
            key={form.values.symbol}
            {...form.getInputProps('symbol')}
          />
          <SimpleGrid cols={{base: 1, sm: 2}} spacing={{base: 'xs', sm: 'lg'}} mt="md">
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
                <Text size="lg" weight={700} mt="xs">R${stock.price.toFixed(2)}</Text>
                <StockGraph stock={stock.symbol} limSup={stock.upper_limit} limInf={stock.lower_limit}/>
                <Divider orientation="horizontal" margins="md" />
                <Stack>
                  <EditableNumberInput text="Valor para venda: " valueOri={stock.upper_limit} onChangeHandler={(new_val) => handleChangeLimits(new_val, index)}/>
                  <EditableNumberInput text="Valor para compra: " valueOri={stock.lower_limit} onChangeHandler={(new_val) => handleChangeLimits(new_val, index)}/>
                </Stack>
                <Button mt="sm" onClick={() => handleRemove(index)} variant="light" color="red">Remover</Button>
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