import { TextInput,Text , Title, Button, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { useState } from "react";

function Login() {
    const {token, tryLogin} = useAuth();
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            password: ''
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'), 
        }
    });

    const navigate = useNavigate();

    if (token) {
        return <Navigate to='/' replace />
    }

    function onSubmit(values) {
        setLoading(true);
        setLoginError('');
        values ={
            email: values.email.trim(),
            password: values.password
        }

        tryLogin(values)
            .then(_ => {
                navigate('/')
            })
            .catch(err => {
                setLoginError(err.response.data.message);
            }).finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
        <Title align="center">Login</Title>
        <Stack align='center' justify='center' gap={'xs'} component={'form'} onSubmit={form.onSubmit(onSubmit)}>
            <Text align='center' c='red' fw={700}>{loginError}</Text>
            <TextInput
                label="Email"
                placeholder="Digite seu email"

                w="25%"
                required
                key={form.values.email}
                {...form.getInputProps('email')}
            />
            <PasswordInput
                label="Senha"
                w="25%"
                placeholder="Digite sua senha"
                required
                key={form.values.password}
                {...form.getInputProps('password')}
            />
            <Button loading={loading} type="submit">Entrar</Button>
        </Stack>
        </>
    )
}

export default Login;