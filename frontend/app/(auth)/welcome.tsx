import { StyleSheet, Text } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";

const Welcome = () => {
  return (
    <ScreenWrapper showPattern={true}>
      <Text>Welcome</Text>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({});
