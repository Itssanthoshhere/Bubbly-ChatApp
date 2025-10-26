import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
// import { testSocket } from "@/socket/socketEvents";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";
import Button from "@/components/Button";

const Home = () => {
  const { user: currentUser, signOut } = useAuth();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);

  //   console.log("Logged in user:", user);

  // For testing for socket connection and event handlers from the backend
  // useEffect(() => {
  //   testSocket(testSocketCallbackHandler);
  //   testSocket(null);

  //   return () => {
  //     testSocket(testSocketCallbackHandler, true);
  //   };
  // }, []);

  // const testSocketCallbackHandler = (data: any) => {
  //   console.log("Got response from testSocket event: ", data);
  // };

  const handleLogout = async () => {
    await signOut();
  };

  // Dummy data until the api
  const conversations = [
    {
      name: "Alice",
      type: "direct",
      lastMessage: {
        senderName: "Alice",
        // attachment: {image: 'url'},
        content: "Hey! Are we still on for tonight?",
        createdAt: "2025-10-21T1:45:00Z",
      },
    },

    {
      name: "Project Team",
      type: "group",
      lastMessage: {
        senderName: "Sarah",
        content: "Meeting rescheduled to 3pm tomorrow",
        createdAt: "2025-10-21T14:10:00Z",
      },
    },

    {
      name: "Bob",
      type: "direct",
      lastMessage: {
        senderName: "Bob",
        content: "Can you send the files?",
        createdAt: "2025-10-23T09:30:00Z",
      },
    },

    {
      name: "Family Group",
      type: "group",
      lastMessage: {
        senderName: "Maa",
        content: "Happy Birthday!",
        createdAt: "2025-10-20T07:50:00Z",
      },
    },

    {
      name: "Charlie",
      type: "direct",
      lastMessage: {
        senderName: "Charlie",
        content: "Thanks!",
        createdAt: "2025-10-23T11:15:00Z",
      },
    },
  ];

  let directConversions = conversations
    .filter((item: any) => item.type == "direct")
    .sort((a: any, b: any) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupConversions = conversations
    .filter((item: any) => item.type == "group")
    .sort((a: any, b: any) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome back,{" "}
              <Typo size={20} color={colors.white} fontWeight={"800"}>
                {currentUser?.name}
              </Typo>{" "}
              🤙
            </Typo>
          </View>

          <TouchableOpacity
            style={styles.settingIcon}
            onPress={() => router.push("/(main)/profileModal")}
          >
            <Icons.GearSix
              color={colors.white}
              weight="fill"
              size={verticalScale(22)}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._20 }}
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 0 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  style={[
                    styles.tabStyle,
                    selectedTab == 1 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Group</Typo>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.conversationList}>
              {selectedTab == 0 &&
                directConversions.map((item: any, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversions.length != index + 1}
                    />
                  );
                })}

              {selectedTab == 1 &&
                groupConversions.map((item: any, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={groupConversions.length != index + 1}
                    />
                  );
                })}
            </View>

            {!loading && selectedTab == 0 && directConversions.length == 0 && (
              <Typo style={{ textAlign: "center" }}>
                You don't have any messages
              </Typo>
            )}

            {!loading && selectedTab == 1 && groupConversions.length == 0 && (
              <Typo style={{ textAlign: "center" }}>
                You don't have joined any groups yet
              </Typo>
            )}

            {loading && <Loading />}
          </ScrollView>
        </View>
      </View>

      <Button
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/(main)/newConversationModal",
            params: { isGroup: selectedTab },
          })
        }
      >
        <Icons.Plus
          color={colors.black}
          weight="bold"
          size={verticalScale(24)}
        />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingY._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._20,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },

  navBar: {
    flexDirection: "row",
    gap: spacingX._15,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },

  tabs: {
    flexDirection: "row",
    gap: spacingX._10,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },

  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },

  conversationList: {
    paddingVertical: spacingY._20,
  },

  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },

  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
