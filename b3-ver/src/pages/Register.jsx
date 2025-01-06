import { TextInput, Title, Button, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import axios from "axios";

function Register() {
    const {token} = useAuth();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: '',
            password: '',
            confirmPassword: ''
        },

        validate: {
            confirmPassword: (value, values) => (value !== values.password ? 'As senhas não são iguais' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'), 
        }               
    });

    const navigate = useNavigate();

    if (token) {
        return <Navigate to='/' replace />
    }

    function onSubmit(values) {
        values = {
            email: values.email.trim(),
            password: values.password,
            confirmPassword: values.confirmPassword
        }

        axios.post("/stock/register/", values)
            .then((response) => {
                navigate('/login');
            });
    }

    return (
        <>
        <Title align="center">Register</Title>
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
            <PasswordInput
                label="Confirme a senha"
                w="25%"
                placeholder="Digite sua senha"
                required
                key={form.values.confirmPassword}
                {...form.getInputProps('confirmPassword')}
            />
            <Button type="submit">Entrar</Button>
        </Stack>
        </>
    )
}

export default Register;