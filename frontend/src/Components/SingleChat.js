import React from 'react'
import { useEffect, useState } from "react";
import { ChatState } from '../Context/ChatProvider';
import { FormControl, IconButton, Input, Spinner, useToast, Flex, InputRightAddon, InputGroup, useColorModeValue } from "@chakra-ui/react";
import { Box, Text } from '@chakra-ui/layout';
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../config/ChatLogic";
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import axios from 'axios';
import "./styles.css";
import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
// for socket.io
var socket, selectedChatCompare;
const ENDPOINT = "http://localhost:5000";


const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const placeholderColor = useColorModeValue('gray.500', 'gray.300');
    const inputBackground = useColorModeValue('#E0E0E0', 'gray.600');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [istyping, setIsTyping] = useState(false);
    const toast = useToast();
    const { selectedChat, setSelectedChat, user, notification, setNotification } = ChatState();



    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));

        // eslint-disable-next-line
    }, []);

    const fetchMessages = async () => {
        if (!selectedChat) return;
        const config = {
            headers: {
                Authorization: `Bearer ${user.token}`
            },
        };
        try {

            setLoading(true);


            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );
            console.log(messages);
            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);

        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Messages",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    const sendMessage = async (e) => {
        const config = {
            headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`
            },
        };
        if (e.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );


                socket.emit("new message", data, (response) => {
                    if (response.error) {
                        console.error("Error sending message:", response.error);
                        // Handle the error in the UI
                    } else {
                        console.log("Message sent successfully", response);
                        // Additional actions upon successful sending
                    }
                });

                setMessages([...messages, data]);
            } catch (error) {
                toast({
                    title: "Error Occured!",
                    description: "Failed to send the Message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom",
                });
            }

        }
    }


    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;

    }, [selectedChat]);

    useEffect(() => {
        socket.on("message recieved", (newMessageRecieved) => {

            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 1000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    }

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };


    return (
        <>
            {selectedChat ? (
                <>
                    <Flex
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Work sans"
                        d="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            d={{ base: "flex", md: "none", p: "0px" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />
                        {!selectedChat.isGroupChat ? (
                            <>
                                {getSender(user, selectedChat.users)}
                                <ProfileModal
                                    user={getSenderFull(user, selectedChat.users)}
                                />
                            </>
                        ) : (
                            <>
                                <p d={{ base: "flex", md: "none", p: "0px" }}>{selectedChat.chatName.toUpperCase()}</p>
                                <UpdateGroupChatModal

                                    fetchAgain={fetchAgain}
                                    setFetchAgain={setFetchAgain}
                                    fetchMessages={fetchMessages}
                                />
                            </>
                        )}
                    </Flex>
                    <Flex
                        d="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        // alignItems="center"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="91%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (
                            <Box display="flex" alignItems="center" justifyContent="center" height="500">
                                <Spinner
                                    p={10}
                                    size="xl"
                                    w={20}
                                    h={20}

                                />
                            </Box>
                        ) : (
                            <div className="messages">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <FormControl
                            onKeyDown={sendMessage}
                            id="first-name"
                            isRequired
                            mt={3}
                            onSubmit={sendMessage}
                            alignContent="bottom"

                        >
                            {istyping ? (
                                <div>
                                    <Lottie
                                        options={defaultOptions}
                                        height={50}
                                        width={70}
                                        style={{ marginBottom: 15, marginLeft: 0 }}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                            <InputGroup>
                                <Input errorBorderColor='crimsona'
                                    variant="filled"
                                    bg={inputBackground} // Background color
                                    placeholder="Enter a message..."
                                    value={newMessage}
                                    onChange={typingHandler}
                                    color='grey.100' // Text color
                                    _placeholder={{ color: placeholderColor }}
                                    _hover={{ bg: 'blue.50' }}// Placeholder text color

                                />

                            </InputGroup>
                        </FormControl>
                    </Flex>
                </>
            ) : (
                <Box d="flex" alignItems="center" justifyContent="center" h="50vh" width="50vw">
                    <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                        Click on a user to start chatting
                    </Text>
                </Box>
            )}
        </>
    );

}

export default SingleChat
