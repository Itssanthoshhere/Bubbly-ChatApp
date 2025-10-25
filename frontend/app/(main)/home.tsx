import { StyleSheet } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import Button from "@/components/Button";
import { testSocket } from "@/socket/socketEvents";

const Home = () => {
  const { user, signOut } = useAuth();
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

  return (
    <ScreenWrapper>
      <Typo color={colors.white}>Home</Typo>

      <Button onPress={handleLogout}>
        <Typo>Logout</Typo>
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({});
