import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Gauge, Crosshair, Database } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Typography } from '@/components/ui/Typography';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 0) + 16 }]}>
      <BlurView intensity={20} tint="dark" style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          if (route.name === 'index' || options.href === null) return null;
          const isFocused = state.index === index;
          
          let Icon = Gauge;
          if (route.name === 'play') Icon = Crosshair;
          if (route.name === 'data') Icon = Database;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            >
              <Icon size={16} color={isFocused ? colors.primary : colors.mutedForeground} />
              <Typography style={[styles.tabText, isFocused && styles.tabTextFocused]}>
                {options.title || route.name.toUpperCase()}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background }
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" options={{ title: 'HOME' }} />
      <Tabs.Screen name="play" options={{ title: 'PLAY' }} />
      <Tabs.Screen name="data" options={{ title: 'DATA' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,16,24,0.88)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 6,
    overflow: 'hidden',
    maxWidth: 400,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 18,
  },
  tabItemFocused: {
    backgroundColor: 'rgba(0,255,170,0.1)',
  },
  tabText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.mutedForeground,
  },
  tabTextFocused: {
    color: colors.primary,
  }
});
