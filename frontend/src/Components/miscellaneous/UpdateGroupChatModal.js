import { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box,
    IconButton,
    Spinner,
} from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const toast = useToast();
    const { selectedChat, setSelectedChat, user } = ChatState();

    const apiConfig = {
        headers: { Authorization: `Bearer ${user.token}` }
    };

    const handleError = (error, message) => {
        console.error(error);
        let errorMessage = message; // Default to the provided message
        if (error && error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }
        toast({
            title: "Error Occurred!",
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
        });
    };

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) return;
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/user?search=${query}`, apiConfig);
            setSearchResult(data);
        } catch (error) {
            handleError(error, "Failed to load the search results.");
        } finally {
            setLoading(false);
        }
    };

    const handleRename = async () => {
        if (!groupChatName) return;
        try {
            setRenameLoading(true);
            const { data } = await axios.put(`/api/chat/rename`, { chatId: selectedChat._id, chatName: groupChatName }, apiConfig);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);

        } catch (error) {
            console.error(error);

            handleError(error, "Failed to rename the chat.");
        } finally {
            setRenameLoading(false);
            setGroupChatName("");
        }
    };

    const handleAddUser = async (userToAdd) => {
        if (selectedChat.users.some(u => u._id === userToAdd._id)) {
            return handleError(null, "User already in group!");
        }
        if (selectedChat.groupAdmin._id !== user._id) {
            return handleError(null, "Only admins can add someone!");
        }
        try {
            setLoading(true);
            const { data } = await axios.put(`/api/chat/groupadd`, { chatId: selectedChat._id, userId: userToAdd._id }, apiConfig);
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            console.error(error);

            handleError(error, "Failed to add user to group.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userToRemove) => {
        if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
            return handleError(null, "Only admins can remove someone!");
        }
        try {
            setLoading(true);
            const { data } = await axios.put(`/api/chat/groupremove`, { chatId: selectedChat._id, userId: userToRemove._id }, apiConfig);
            if (userToRemove._id === user._id) {
                setSelectedChat(null); // Clear chat if self removed
            } else {
                setSelectedChat(data);
            }
            setFetchAgain(!fetchAgain);
            fetchMessages();
        } catch (error) {
            handleError(error, "Failed to remove user from group.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} display={{ base: "flex" }} />
            <Modal onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" fontFamily="Work sans" display="flex" justifyContent="center">
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody display="flex" flexDirection="column" alignItems="center">
                        <Box width="100%" display="flex" flexWrap="wrap" pb={3}>
                            {selectedChat.users.map(u => (
                                <UserBadgeItem key={u._id} user={u} admin={selectedChat.groupAdmin} handleFunction={() => handleRemove(u)} />
                            ))}
                        </Box>
                        <FormControl display="flex">
                            <Input placeholder="Chat Name" mb={3} value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
                            <Button variant="solid" colorScheme="teal" ml={1} isLoading={renameLoading} onClick={handleRename}>
                                Chat Rename
                            </Button>
                        </FormControl>
                        <FormControl>
                            <Input placeholder="Add User to group" mb={1} onChange={(e) => handleSearch(e.target.value)} />
                        </FormControl>
                        {loading ? <Spinner size="lg" /> : searchResult.map(user => (
                            <UserListItem key={user._id} user={user} handleFunction={() => handleAddUser(user)} />
                        ))}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default UpdateGroupChatModal;
