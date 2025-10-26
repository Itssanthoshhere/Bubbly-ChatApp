import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Avatar from "@/components/Avatar";
import * as ImagePicker from "expo-image-picker";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/contexts/authContext";
import Button from "@/components/Button";
import { verticalScale } from "@/utils/styling";
import { getContacts, newConversation } from "@/socket/socketEvents";
import { uploadFileToCloudinary } from "@/services/imageService";

const NewConversationModal = () => {
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup == "1";
  const router = useRouter();
  const [contacts, setContacts] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // NOTE: Getting the current user
  const { user: currentUser } = useAuth();

  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);
    getContacts(null);

    return () => {
      getContacts(processGetContacts, true);
      newConversation(processNewConversation, true);
    };
  }, []);

  const processGetContacts = (res: any) => {
    // console.log("Got Contacts: ", res);

    if (res.success) {
      setContacts(res.data);
    }
  };

  const processNewConversation = (res: any) => {
    // console.log("New Conversation result: ", res.data.participants);

    setIsLoading(false);

    if (res.success) {
      router.back();
      router.push({
        pathname: "/(main)/conversation",
        params: {
          id: res.data._id,
          name: res.data.name,
          avatar: res.data.avatar,
          type: res.data.type,
          participants: JSON.stringify(res.data.participants),
        },
      });
    } else {
      console.log("Error fetching/creating conversation: ", res.msg);
      Alert.alert("Error", res.msg);
    }
  };

  // NOTE: Image picker
  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      //   allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setGroupAvatar(result.assets[0]);
    }
  };

  // NOTE: These will filter out the selected users
  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id != user.id);
      }

      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert("Authentication", "Please login to start a conversation");
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      // TODO: Start new conversation
      newConversation({
        type: "direct",
        participants: [currentUser.id, user.id],
      });
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || !currentUser || selectedParticipants.length < 2) {
      return;
    }

    // TODO: Create group
    setIsLoading(true);

    try {
      let avatar = null;
      if (groupAvatar) {
        const uploadResult = await uploadFileToCloudinary(
          groupAvatar,
          "group-avatars"
        );

        if (uploadResult.success) {
          avatar = uploadResult.data;
        }
      }

      newConversation({
        type: "group",
        participants: [currentUser.id, ...selectedParticipants],
        name: groupName,
        avatar,
      });
    } catch (error: any) {
      console.log("Error creating group: ", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // NOTE: Dummy contacts unitl we fetch api
  // const contacts = [
  //   {
  //     id: "1",
  //     name: "Joe",
  //     avatar: "https://i.pravatar.cc/150?img=11",
  //   },

  //   {
  //     id: "2",
  //     name: "Vasan",
  //     avatar: "https://i.pravatar.cc/150?img=12",
  //   },

  //   {
  //     id: "3",
  //     name: "Ram",
  //     avatar: "https://i.pravatar.cc/150?img=13",
  //   },

  //   {
  //     id: "4",
  //     name: "Sai",
  //     avatar: "https://i.pravatar.cc/150?img=14",
  //   },

  //   {
  //     id: "5",
  //     name: "Loe Das",
  //     avatar: "https://i.pravatar.cc/150?img=15",
  //   },

  //   {
  //     id: "6",
  //     name: "Ramesh",
  //     avatar: "https://i.pravatar.cc/150?img=16",
  //   },

  //   {
  //     id: "7",
  //     name: "Kumar",
  //     avatar: "https://i.pravatar.cc/150?img=17",
  //   },

  //   {
  //     id: "8",
  //     name: "Kishore",
  //     avatar: "https://i.pravatar.cc/150?img=18",
  //   },

  //   {
  //     id: "9",
  //     name: "Raghul",
  //     avatar: "https://i.pravatar.cc/150?img=19",
  //   },

  //   {
  //     id: "10",
  //     name: "Mike",
  //     avatar: "https://i.pravatar.cc/150?img=20",
  //   },
  // ];

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMode ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={onPickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.groupNameContainer}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactList}
        >
          {contacts.map((user: any, index) => {
            const isSelected = selectedParticipants.includes(user.id);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactRow,
                  isSelected && styles.selectedContact,
                ]}
                onPress={() => onSelectUser(user)}
              >
                <Avatar size={45} uri={user.avatar} />
                <Typo fontWeight={"500"}>{user.name}</Typo>

                {isGroupMode && (
                  <View style={styles.selectionIndicator}>
                    <View
                      style={[styles.checkbox, isSelected && styles.checked]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isGroupMode && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button
              onPress={createGroup}
              disabled={!groupName.trim()}
              loading={isLoading}
            >
              <Typo fontWeight={"bold"} size={17}>
                Create Group
              </Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacingX._15,
    flex: 1,
  },

  groupInfoContainer: {
    alignItems: "center",
    marginTop: spacingY._10,
  },

  avatarContainer: {
    marginBottom: spacingY._10,
  },

  groupNameContainer: {
    width: "100%",
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },

  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },

  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._10,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },

  selectionIndicator: {
    marginLeft: "auto",
    marginRight: spacingX._10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  checked: {
    backgroundColor: colors.primary,
  },

  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
