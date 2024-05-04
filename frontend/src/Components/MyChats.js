import React, { useState, useEffect } from "react";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import ChatLoading from "./ChatLoading";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogic";
import GroupChatModal from "./miscellaneous/GroupChatModal";


const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState(null);
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    if (!user) return;

    const fetchChats = async () => {
      try {
        const { data } = await axios.get("/api/chat", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setChats(data);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to load the chats",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    };

    fetchChats();
  }, [fetchAgain, user, setChats, toast]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      padding={3}
      backgroundColor="white"
      width={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        paddingBottom={3}
        paddingX={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Work sans"
        display="flex"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            onClick={() => {/* Implement group chat creation logic */ }}
          >
            New Group Chat
          </Button></GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        padding={3}
        backgroundColor="#F8F8F8"
        width="100%"
        height="100%"
        borderRadius="lg"
        overflowY="scroll"
      >
        {chats ? (
          <Stack overflowY="auto">
            {chats.map(chat => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                backgroundColor={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                color={selectedChat === chat ? "white" : "black"}
                paddingX={3}
                paddingY={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
