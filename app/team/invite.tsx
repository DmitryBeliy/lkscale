import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Input } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { TeamRole, DEFAULT_PERMISSIONS, TeamPermissions } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const ROLES: { value: TeamRole; icon: keyof typeof Ionicons.glyphMap; color: string; gradient: [string, string] }[] = [
  { value: 'admin', icon: 'shield-checkmark', color: '#FF6B6B', gradient: ['#FF6B6B', '#EE5A5A'] },
  { value: 'cashier', icon: 'cash', color: '#4ECDC4', gradient: ['#4ECDC4', '#45B7AF'] },
  { value: 'stock_manager', icon: 'cube', color: '#9B59B6', gradient: ['#9B59B6', '#8E44AD'] },
];

export default function InviteTeamMemberScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<TeamRole>('cashier');
  const [customPermissions, setCustomPermissions] = useState<TeamPermissions>(DEFAULT_PERMISSIONS.cashier);
  const [showPermissions, setShowPermissions] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = getAuthState().user;

  const handleRoleSelect = (role: TeamRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(role);
    setCustomPermissions(DEFAULT_PERMISSIONS[role]);
  };

  const togglePermission = (key: keyof TeamPermissions) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert(t.common.error, 'Please enter email address');
      return;
    }

    if (!user) {
      Alert.alert(t.common.error, 'Not authenticated');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Check if member already exists
      const { data: existing } = await (supabase as any)
        .from('team_members')
        .select('id')
        .eq('owner_id', user.id)
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existing) {
        Alert.alert(t.common.error, 'This email is already in your team');
        setLoading(false);
        return;
      }

      // Create team member
      const { error } = await (supabase as any).from('team_members').insert({
        owner_id: user.id,
        email: email.toLowerCase().trim(),
        name: name.trim() || null,
        role: selectedRole,
        status: 'pending',
        permissions: customPermissions,
        invited_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Log activity
      await (supabase as any).from('activity_logs').insert({
        owner_id: user.id,
        actor_name: user.name || user.email,
        action_type: 'team_member_invited',
        description: `Invited ${email} as ${selectedRole}`,
        entity_type: 'team_member',
        entity_name: email,
      });

      Alert.alert(t.common.success, t.team.inviteSent, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error inviting team member:', error);
      Alert.alert(t.common.error, 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case 'admin': return t.team.roles.admin;
      case 'cashier': return t.team.roles.cashier;
      case 'stock_manager': return t.team.roles.stockManager;
    }
  };

  const PERMISSION_LABELS: Record<keyof TeamPermissions, string> = {
    canCreateOrders: 'Create Orders',
    canEditOrders: 'Edit Orders',
    canDeleteOrders: 'Delete Orders',
    canViewAllOrders: 'View All Orders',
    canManageProducts: 'Manage Products',
    canEditPrices: 'Edit Prices',
    canAdjustStock: 'Adjust Stock',
    canViewCustomers: 'View Customers',
    canEditCustomers: 'Edit Customers',
    canViewReports: 'View Reports',
    canManageCoupons: 'Manage Coupons',
    canViewActivityLog: 'View Activity Log',
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{t.team.inviteMember}</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Email Input */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.inputLabel}>Email *</Text>
          <Input
            placeholder={t.team.inviteByEmail}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </Animated.View>

        {/* Name Input */}
        <Animated.View entering={FadeInDown.delay(250).duration(500)}>
          <Text style={styles.inputLabel}>Name (optional)</Text>
          <Input
            placeholder="Enter name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </Animated.View>

        {/* Role Selection */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Select Role</Text>
          <View style={styles.rolesGrid}>
            {ROLES.map((role) => (
              <Pressable
                key={role.value}
                style={[
                  styles.roleCard,
                  selectedRole === role.value && styles.roleCardSelected,
                  selectedRole === role.value && { borderColor: role.color },
                ]}
                onPress={() => handleRoleSelect(role.value)}
              >
                <LinearGradient
                  colors={selectedRole === role.value ? role.gradient : [colors.borderLight, colors.borderLight]}
                  style={styles.roleIcon}
                >
                  <Ionicons
                    name={role.icon}
                    size={24}
                    color={selectedRole === role.value ? '#fff' : colors.textSecondary}
                  />
                </LinearGradient>
                <Text
                  style={[
                    styles.roleLabel,
                    selectedRole === role.value && { color: role.color, fontWeight: '700' },
                  ]}
                >
                  {getRoleLabel(role.value)}
                </Text>
                {selectedRole === role.value && (
                  <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Role Description */}
        <Animated.View entering={FadeInDown.delay(350).duration(500)}>
          <Card style={styles.roleDescCard}>
            <View style={styles.roleDescHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={styles.roleDescTitle}>Role Permissions</Text>
            </View>
            <Text style={styles.roleDescText}>
              {selectedRole === 'admin' && 'Full access to all features including team management, reports, and settings.'}
              {selectedRole === 'cashier' && 'Can create and manage orders, view customers. Cannot change prices or manage inventory.'}
              {selectedRole === 'stock_manager' && 'Can manage products and inventory. Cannot process orders or view financial reports.'}
            </Text>
          </Card>
        </Animated.View>

        {/* Custom Permissions Toggle */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Pressable
            style={styles.permissionsToggle}
            onPress={() => setShowPermissions(!showPermissions)}
          >
            <View style={styles.permissionsToggleLeft}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
              <Text style={styles.permissionsToggleText}>{t.team.editPermissions}</Text>
            </View>
            <Ionicons
              name={showPermissions ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        </Animated.View>

        {/* Custom Permissions */}
        {showPermissions && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <Card style={styles.permissionsCard}>
              {(Object.keys(PERMISSION_LABELS) as (keyof TeamPermissions)[]).map((key) => (
                <Pressable
                  key={key}
                  style={styles.permissionItem}
                  onPress={() => togglePermission(key)}
                >
                  <Text style={styles.permissionLabel}>{PERMISSION_LABELS[key]}</Text>
                  <View
                    style={[
                      styles.permissionSwitch,
                      customPermissions[key] && styles.permissionSwitchActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.permissionKnob,
                        customPermissions[key] && styles.permissionKnobActive,
                      ]}
                    />
                  </View>
                </Pressable>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Invite Button */}
        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <Button
            title={t.team.inviteMember}
            onPress={handleInvite}
            loading={loading}
            icon={<Ionicons name="send" size={20} color="#fff" />}
            style={styles.inviteButton}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  rolesGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  roleCardSelected: {
    backgroundColor: colors.surface,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  roleLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleDescCard: {
    marginTop: spacing.md,
    backgroundColor: `${colors.primary}10`,
  },
  roleDescHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  roleDescTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  roleDescText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  permissionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: spacing.lg,
  },
  permissionsToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  permissionsToggleText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    color: colors.text,
  },
  permissionsCard: {
    marginTop: spacing.sm,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  permissionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  permissionSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  permissionSwitchActive: {
    backgroundColor: colors.primary,
  },
  permissionKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  permissionKnobActive: {
    alignSelf: 'flex-end',
  },
  inviteButton: {
    marginTop: spacing.xl,
  },
});
