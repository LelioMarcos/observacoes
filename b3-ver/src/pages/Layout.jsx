import {Box, Flex} from "@mantine/core";
import {Outlet} from "react-router-dom";
import Header from "../components/Header.jsx";

/**
 * The Layout serves as the overall layout structure for the application.
 * It includes banner, header and footer structure and navigation across different pages.
 * 
 * @returns {JSX.Element} The Layout itself.
 */
function Layout() {
    return (
        <Flex h="100vh" direction="column" justify='flex-start'>
            <Header/>

            <Box p='md' style={{flex:1}}>
                <Outlet/>
            </Box>
        </Flex>
    );
}

export default Layout