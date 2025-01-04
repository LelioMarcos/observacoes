import { useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <>
            <Group justify="flex-end" m={{ xs: 'lg', sm: "md" }} p="10px">
                <Text>Lelio</Text>
                <Link to="/login">
                    <Button>Login</Button>
                </Link>
            </Group>
        </>
    )
}

export default Header;