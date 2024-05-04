import React, { useEffect } from 'react';
import { Container, Box, Text, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import Login from "../Components/Authentication/Login";
import Signup from "../Components/Authentication/Signup";
import { useNavigate } from 'react-router-dom';
const Homepage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));


        if (userInfo) navigate("/chats");
        // This dependency array ensures the effect runs only when the `navigate` function changes,
        // which should only happen when the component mounts, thus it behaves like `componentDidMount`.
    }, [navigate]);
    return (
        <Container maxW='xl' centerContent>
            <Box d='flex' justifyContent='center' p={3} bg='white' w='100%' borderRadius='lg' borderWidth='1px' m="40px 0 15px 0">
                <Text fontSize="4xl" fontFamily="Work sans" color="black" textAlign="center">Chatify</Text>
            </Box>
            <Box bg='white' p={4} borderRadius='lg' borderWidth='1px' w='100%'>
                <Tabs variant='soft-rounded' colorScheme='blue'>
                    <TabList mb='1em'>
                        <Tab width='50%'>Login </Tab>
                        <Tab width='50%'>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
            <footer className="footer">
                <p>©Abhibhi</p>
            </footer>
        </Container >
    );
};

export default Homepage;

