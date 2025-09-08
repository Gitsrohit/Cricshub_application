import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

export default function AnimatedSplash({ onFinish }) {
  // Animation values for Native Driver
  const iconScaleAnim = useRef(new Animated.Value(0)).current; 
  const iconOpacityAnim = useRef(new Animated.Value(0)).current;
  const textLogoTranslateY = useRef(new Animated.Value(50)).current;
  const textLogoOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(50)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  // Animation values for JS Driver
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const progressBarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Splash screen entrance animations (all sequential)
    const entranceSequence = Animated.sequence([
      // Animate background color change (JS driver)
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      Animated.delay(200),
      // Icon logo entrance (Native driver)
      Animated.parallel([
        Animated.timing(iconScaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.elastic(1.5),
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacityAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      // Text logo entrance (Native driver)
      Animated.parallel([
        Animated.timing(textLogoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(textLogoTranslateY, {
          toValue: 0,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      // Tagline entrance (Native driver)
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(taglineTranslateY, {
          toValue: 0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(500),
      // Progress bar container fade-in (JS driver)
      Animated.timing(progressBarOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]);

    // 2. Progress bar fill animation (after entrance sequence)
    const progressBarFill = Animated.timing(progressBarWidth, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    
    // 3. Final screen fade-out animation
    const screenExit = Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });

    // Orchestrate the final sequence
    Animated.sequence([
      entranceSequence, // All elements appear in sequence
      progressBarFill,  // Progress bar fills up
      Animated.delay(500), // Short pause
      screenExit        // Entire screen fades out
    ]).start(() => {
      onFinish();
    });
  }, []);

  const finalProgressBarWidth = progressBarWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });
  
  const backgroundColor = backgroundAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#f0f0f0", "#ffffff"],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity: screenOpacity }]}>
      <Animated.Image
        source={require("../images/iconLogo.png")}
        style={[
          styles.logo,
          {
            opacity: iconOpacityAnim,
            transform: [{ scale: iconScaleAnim }],
          },
        ]}
      />
      <Animated.Image
        source={require("../images/textLogo.png")}
        style={[
          styles.logo,
          {
            width: 200,
            height: 80,
            resizeMode: "contain",
            opacity: textLogoOpacity,
            transform: [{ translateY: textLogoTranslateY }],
            marginTop: -20,
          },
        ]}
      />
      
      <Animated.View
        style={[
          styles.progressBarContainer,
          { opacity: progressBarOpacity },
        ]}
      >
        <Animated.View style={[styles.progressBar, { width: finalProgressBarWidth }]} />
      </Animated.View>

      <Animated.Text
        style={[
          styles.text,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          },
        ]}
      >
        All in one powerful app.
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  progressBarContainer: {
    width: 200,
    height: 6,
    backgroundColor: "#eee",
    borderRadius: 3,
    marginTop: 25,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#87CEEB",
    borderRadius: 3,
  },
  text: {
    fontSize: 22,
    marginTop: 20,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});