import { TextInput, Title, Button, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

function Register() {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            email: '',
            password: ''
        },
    });

    const navigate = useNavigate();

    function onSubmit(values) {
        values ={
            username: values.username.trim(),
            password: values.password
        }

        tryLogin(values)
            .then(_ => {
                navigate('/')
            })
            .catch(err => {
                setLoading(false);
                if (err.response?.status !== 401){
                    console.error("Login error:", err.response.data.message);
                }
                setError(err.response.data.message);
            });
    }

    return (
        <>
        <Title align="center">Login</Title>
        <Stack align='center' justify='center' gap={'xs'} component={'form'} onSubmit={form.onSubmit(onSubmit)}>
            <TextInput
                label="username"
                placeholder="Digite seu email"

                w="25%"
                required
                key={form.values.username}
                {...form.getInputProps('username')}
            />
            <PasswordInput
                label="Senha"
                w="25%"
                placeholder="Digite sua senha"
                required
                key={form.values.password}
                {...form.getInputProps('password')}
            />
            <Button type="submit">Entrar</Button>
        </Stack>
        </>
    )
}

export default Login;