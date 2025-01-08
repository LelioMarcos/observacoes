import { useEffect, useState } from 'react';
import { Button, NumberInput, Title, SimpleGrid, Text, Group, Center, TextInput} from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import StockCard from '../components/StockCard';

function Home() {
    const [stocks, setStock] = useState([]); 
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [addError, setAddError] = useState('');

    const fetchStocks = () => {
      axios.get("/stock/get").then((res) => {
        setStock(res.data.result.reverse());
      });
    }
    
    useEffect(() => {
      fetchStocks();
      const timer = setInterval(() => {
        fetchStocks();
      }, 60000);

      return () => {
        clearInterval(timer);
      }
    }, []);

    const addStock = (symbol) => {
      axios.get(`/stock/get/${symbol}`).then((response) => {
        setStock([response.data.result, ...stocks]);
      })
    }
    const form = useForm({
      mode: 'uncontrolled',
    });

    const handleSubmit = (values) => {
      setAddError('');
      setLoadingAdd(true);

      axios.post("/stock/add/", {
        symbol: values.symbol.toUpperCase(),
        upper_limit: values.upper,
        lower_limit: values.lower,
        period: values.period,
      }, {

      }).then(() => {
        addStock(values.symbol);
      }).catch((error) => {
        setAddError(error.response.data.message);
      }).finally(() => {
        setLoadingAdd(false);
      });
    };

    return (
      <>
        <Title align="center">ObservAções</Title>
        <Center>
        <form style={{width: { xs: '50%', sm: "25%" }}} onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Text align='center' c='red' fw={700}>{addError}</Text>
          <TextInput
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
              <StockCard stocks={stocks} stock={stock} index={index} setStock={setStock} fetchStocks={fetchStocks}/>
          ))}
        </SimpleGrid> :
        <Title align="center" order={2} mt="xl" c="gray">Adicione uma ação para observar</Title>
        }
        </Center>
      </>
    );
} 

export default Home;