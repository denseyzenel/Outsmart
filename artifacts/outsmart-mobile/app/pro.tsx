import React from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Crown, Sparkles, Target, Zap, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { useSubscription } from '@/lib/revenuecat';
import { useGame } from '@/lib/game-context';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors } from '@/constants/colors';

export default function ProScreen() {
  const { offerings, purchase, restore, isPurchasing, isRestoring, isSubscribed, isLoading } = useSubscription();
  const { billing } = useGame();
  const insets = useSafeAreaInsets();

  const currentOffering = offerings?.current;
  const packages = currentOffering?.availablePackages || [];

  const handlePurchase = async (pkg: any) => {
    try {
      await purchase(pkg);
      Alert.alert("Success", "Welcome to PRO.");
      router.back();
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Failed", e.message);
      }
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert("Success", "Purchases restored.");
      if (isSubscribed) router.back();
    } catch (e: any) {
      Alert.alert("Restore Failed", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 0) + 16 }]}>
        <Button variant="ghost" onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.foreground} />
        </Button>
      </View>
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <Crown size={32} color={colors.primary} style={{ marginBottom: 16 }} />
        <Typography variant="display" style={{ fontSize: 48, lineHeight: 52 }}>
          Unrestricted{'\n'}Access.
        </Typography>
        <Typography style={{ marginTop: 16, fontSize: 16 }}>
          Ten category worlds. Unlimited daily plays. Advanced predictive modeling.
        </Typography>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Sparkles size={20} color={colors.primary} />
            <Typography style={styles.featureText}>Play beyond the daily limit of 3 games.</Typography>
          </View>
          <View style={styles.featureItem}>
            <Target size={20} color={colors.primary} />
            <Typography style={styles.featureText}>Unlock all 10 premium category worlds.</Typography>
          </View>
          <View style={styles.featureItem}>
            <Zap size={20} color={colors.primary} />
            <Typography style={styles.featureText}>Enable the advanced second-order prediction model.</Typography>
          </View>
          <View style={styles.featureItem}>
            <ShieldCheck size={20} color={colors.primary} />
            <Typography style={styles.featureText}>Local persistence remains. No cloud tracking.</Typography>
          </View>
        </View>

        {isSubscribed ? (
          <Card style={styles.subscribedCard}>
            <Typography variant="kicker">STATUS</Typography>
            <Typography variant="h2" style={{ marginTop: 8, color: colors.primary }}>PRO ACTIVE</Typography>
            <Typography style={{ marginTop: 8 }}>You have full access to all features.</Typography>
          </Card>
        ) : (
          <View style={styles.packagesWrap}>
            {isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
            ) : packages.length > 0 ? (
              packages.map((pkg) => (
                <Card 
                  key={pkg.identifier} 
                  interactive 
                  onPress={() => handlePurchase(pkg)}
                  style={styles.packageCard}
                >
                  <View>
                    <Typography variant="h2">{pkg.product.title}</Typography>
                    <Typography style={{ marginTop: 4 }}>{pkg.product.description}</Typography>
                  </View>
                  <Typography variant="display" style={{ fontSize: 32, marginTop: 16 }}>
                    {pkg.product.priceString}
                  </Typography>
                  <Typography variant="kicker" style={{ marginTop: 16 }}>
                    {isPurchasing ? "PROCESSING..." : "TAP TO UPGRADE"}
                  </Typography>
                </Card>
              ))
            ) : (
              <Card style={{ alignItems: 'center', padding: 32 }}>
                <Typography>Store unavailable.</Typography>
              </Card>
            )}
          </View>
        )}

        {!isSubscribed && (
          <Button variant="ghost" onPress={handleRestore} disabled={isRestoring} style={{ marginTop: 24 }}>
            {isRestoring ? "RESTORING..." : "RESTORE PURCHASES"}
          </Button>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    padding: 24,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  features: {
    marginTop: 40,
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
  },
  subscribedCard: {
    marginTop: 48,
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 255, 170, 0.05)',
  },
  packagesWrap: {
    marginTop: 48,
    gap: 16,
  },
  packageCard: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 255, 170, 0.05)',
  }
});
