import { TextInput, Title, Button, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Navigate, useNavigate } from "react-router-dom";

function Login() {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            password: ''
        },

        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
        },
    });

    const navigate = useNavigate();

    function onSubmit(values) {
        navigate('/');
    }

    return (
        <>
        <Title align="center">Login</Title>
        <Stack align='center' justify='center' gap={'xs'} component={'form'} onSubmit={form.onSubmit(onSubmit)}>
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
            <Button type="submit">Entrar</Button>
        </Stack>
        </>
    )
}

export default Login;