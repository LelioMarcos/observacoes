import { useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

function Header() {
    const { email, clearAuth } = useAuth(); 

    const logOut = () => {
        clearAuth();
    }

    return (
        <>
            <Group justify="flex-end" m={{ xs: 'lg', sm: "md" }} p="10px">
                {email ? 
                    <>
                    <Text>{email}</Text>
                    <Link onClick={logOut}>
                        <Button>Logout</Button>
                    </Link>
                    </>
                    :
                    <>
                    <Link to="/register">
                        <Button>Register</Button>
                    </Link>
                    <Link to="/login">
                        <Button>Login</Button>
                    </Link>
                    </>
                }
            </Group>
        </>
    )
}

export default Header;