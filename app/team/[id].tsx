import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { TeamMember, TeamRole, Shift, DEFAULT_PERMISSIONS, TeamPermissions } from '@/types';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';

const ROLE_COLORS: Record<TeamRole, { bg: string; text: string; gradient: [string, string] }> = {
  admin: { bg: '#FF6B6B15', text: '#FF6B6B', gradient: ['#FF6B6B', '#EE5A5A'] },
  cashier: { bg: '#4ECDC415', text: '#4ECDC4', gradient: ['#4ECDC4', '#45B7AF'] },
  stock_manager: { bg: '#9B59B615', text: '#9B59B6', gradient: ['#9B59B6', '#8E44AD'] },
};

const ROLE_ICONS: Record<TeamRole, keyof typeof Ionicons.glyphMap> = {
  admin: 'shield-checkmark',
  cashier: 'cash',
  stock_manager: 'cube',
};

export default function TeamMemberProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { t, formatCurrency, formatDate } = useLocalization();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<TeamRole>('cashier');

  const user = getAuthState().user;

  const loadMemberData = useCallback(async () => {
    if (!user || !id) return;

    try {
      // Load team member
      const { data: memberData, error: memberError } = await (supabase as any)
        .from('team_members')
        .select('*')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single();

      if (memberError) throw memberError;

      const transformedMember: TeamMember = {
        id: memberData.id,
        userId: memberData.user_id || undefined,
        ownerId: memberData.owner_id,
        email: memberData.email,
        name: memberData.name || undefined,
        phone: memberData.phone || undefined,
        avatarUrl: memberData.avatar_url || undefined,
        role: memberData.role as TeamRole,
        status: memberData.status as TeamMember['status'],
        permissions: memberData.permissions as TeamMember['permissions'] || {},
        invitedAt: memberData.invited_at,
        joinedAt: memberData.joined_at || undefined,
        createdAt: memberData.created_at || new Date().toISOString(),
        updatedAt: memberData.updated_at,
      };

      setMember(transformedMember);
      setSelectedRole(transformedMember.role);

      // Load recent shifts
      const { data: shiftsData } = await (supabase as any)
        .from('shifts')
        .select('*')
        .eq('team_member_id', id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (shiftsData) {
        const transformedShifts: Shift[] = shiftsData.map((s: any) => ({
          id: s.id,
          ownerId: s.owner_id,
          teamMemberId: s.team_member_id,
          startedAt: s.started_at,
          endedAt: s.ended_at || undefined,
          durationMinutes: s.duration_minutes || undefined,
          breakMinutes: s.break_minutes || 0,
          notes: s.notes || undefined,
          salesCount: s.sales_count || 0,
          salesAmount: s.sales_amount || 0,
          createdAt: s.created_at || new Date().toISOString(),
          updatedAt: s.updated_at,
        }));
        setShifts(transformedShifts);
      }
    } catch (error) {
      console.error('Error loading team member:', error);
      Alert.alert(t.common.error, 'Failed to load team member');
    } finally {
      setLoading(false);
    }
  }, [user, id, t]);

  useEffect(() => {
    loadMemberData();
  }, [loadMemberData]);

  const handleRoleChange = async () => {
    if (!user || !member) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await (supabase as any)
        .from('team_members')
        .update({
          role: selectedRole,
          permissions: DEFAULT_PERMISSIONS[selectedRole],
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);

      if (error) throw error;

      // Log activity
      await (supabase as any).from('activity_logs').insert({
        owner_id: user.id,
        team_member_id: member.id,
        actor_name: user.name || user.email,
        action_type: 'team_member_updated',
        description: `Changed role from ${member.role} to ${selectedRole}`,
        entity_type: 'team_member',
        entity_id: member.id,
        entity_name: member.name || member.email,
        old_value: { role: member.role },
        new_value: { role: selectedRole },
      });

      setMember({ ...member, role: selectedRole, permissions: DEFAULT_PERMISSIONS[selectedRole] });
      setShowRoleModal(false);
      Alert.alert(t.common.success, 'Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      Alert.alert(t.common.error, 'Failed to update role');
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!user || !member) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await (supabase as any)
        .from('team_members')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', member.id);

      if (error) throw error;

      // Log activity
      await (supabase as any).from('activity_logs').insert({
        owner_id: user.id,
        team_member_id: member.id,
        actor_name: user.name || user.email,
        action_type: 'team_member_updated',
        description: `Changed status to ${newStatus}`,
        entity_type: 'team_member',
        entity_id: member.id,
        entity_name: member.name || member.email,
      });

      setMember({ ...member, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(t.common.error, 'Failed to update status');
    }
  };

  const handleRemoveMember = () => {
    Alert.alert(
      t.team.removeFromTeam,
      t.team.removeConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            if (!user || !member) return;

            try {
              const { error } = await (supabase as any)
                .from('team_members')
                .delete()
                .eq('id', member.id);

              if (error) throw error;

              // Log activity
              await (supabase as any).from('activity_logs').insert({
                owner_id: user.id,
                actor_name: user.name || user.email,
                action_type: 'team_member_removed',
                description: `Removed ${member.name || member.email} from team`,
                entity_type: 'team_member',
                entity_name: member.name || member.email,
              });

              router.back();
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert(t.common.error, 'Failed to remove team member');
            }
          },
        },
      ]
    );
  };

  const getRoleLabel = (role: TeamRole) => {
    switch (role) {
      case 'admin': return t.team.roles.admin;
      case 'cashier': return t.team.roles.cashier;
      case 'stock_manager': return t.team.roles.stockManager;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const totalHours = shifts.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;
  const totalSales = shifts.reduce((sum, s) => sum + s.salesAmount, 0);

  if (loading || !member) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </View>
      </View>
    );
  }

  const roleColors = ROLE_COLORS[member.role];
  const isPending = member.status === 'pending';
  const isSuspended = member.status === 'suspended';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{t.team.memberProfile}</Text>
        <Pressable onPress={handleRemoveMember} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </Pressable>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              {member.avatarUrl ? (
                <Animated.Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient colors={roleColors.gradient} style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {(member.name || member.email).charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              )}

              <View style={styles.profileInfo}>
                <Text style={styles.memberName}>{member.name || member.email.split('@')[0]}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
                {member.phone && (
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.memberPhone}>{member.phone}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Status Badge */}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isPending
                      ? `${colors.warning}15`
                      : isSuspended
                      ? `${colors.error}15`
                      : `${colors.success}15`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isPending
                        ? colors.warning
                        : isSuspended
                        ? colors.error
                        : colors.success,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: isPending
                        ? colors.warning
                        : isSuspended
                        ? colors.error
                        : colors.success,
                    },
                  ]}
                >
                  {t.team.status[member.status]}
                </Text>
              </View>

              {member.status === 'active' && (
                <Pressable
                  style={styles.suspendButton}
                  onPress={() => handleStatusChange('suspended')}
                >
                  <Text style={styles.suspendButtonText}>Suspend</Text>
                </Pressable>
              )}
              {member.status === 'suspended' && (
                <Pressable
                  style={[styles.suspendButton, { backgroundColor: `${colors.success}15` }]}
                  onPress={() => handleStatusChange('active')}
                >
                  <Text style={[styles.suspendButtonText, { color: colors.success }]}>Activate</Text>
                </Pressable>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Role Section */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Text style={styles.sectionTitle}>Role & Permissions</Text>
          <Pressable onPress={() => setShowRoleModal(true)}>
            <Card style={styles.roleCard}>
              <View style={styles.roleCardContent}>
                <LinearGradient colors={roleColors.gradient} style={styles.roleIconLarge}>
                  <Ionicons name={ROLE_ICONS[member.role]} size={28} color="#fff" />
                </LinearGradient>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleTitle}>{getRoleLabel(member.role)}</Text>
                  <Text style={styles.roleDescription}>
                    Tap to change role and permissions
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
              </View>
            </Card>
          </Pressable>
        </Animated.View>

        {/* Stats Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{totalHours.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{t.team.totalHours}</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color={colors.success} />
              <Text style={styles.statValue}>{formatCurrency(totalSales)}</Text>
              <Text style={styles.statLabel}>{t.staffPerformance.totalSales}</Text>
            </Card>
          </View>
        </Animated.View>

        {/* Recent Shifts */}
        <Animated.View entering={FadeInDown.delay(500).duration(500)}>
          <Text style={styles.sectionTitle}>{t.team.shiftsHistory}</Text>
          {shifts.length === 0 ? (
            <Card style={styles.emptyShifts}>
              <Ionicons name="calendar-outline" size={32} color={colors.textLight} />
              <Text style={styles.emptyShiftsText}>No shifts recorded yet</Text>
            </Card>
          ) : (
            shifts.slice(0, 5).map((shift, index) => (
              <Animated.View key={shift.id} entering={FadeInRight.delay(index * 100).duration(400)}>
                <Card style={styles.shiftCard}>
                  <View style={styles.shiftHeader}>
                    <View style={styles.shiftDate}>
                      <Ionicons name="calendar" size={16} color={colors.primary} />
                      <Text style={styles.shiftDateText}>
                        {formatDate(shift.startedAt, 'short')}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.shiftStatus,
                        { backgroundColor: shift.endedAt ? `${colors.success}15` : `${colors.warning}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.shiftStatusText,
                          { color: shift.endedAt ? colors.success : colors.warning },
                        ]}
                      >
                        {shift.endedAt ? 'Completed' : 'In Progress'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.shiftStats}>
                    <View style={styles.shiftStat}>
                      <Text style={styles.shiftStatLabel}>Duration</Text>
                      <Text style={styles.shiftStatValue}>
                        {shift.durationMinutes ? formatDuration(shift.durationMinutes) : '--'}
                      </Text>
                    </View>
                    <View style={styles.shiftStat}>
                      <Text style={styles.shiftStatLabel}>Sales</Text>
                      <Text style={styles.shiftStatValue}>{formatCurrency(shift.salesAmount)}</Text>
                    </View>
                    <View style={styles.shiftStat}>
                      <Text style={styles.shiftStatLabel}>Orders</Text>
                      <Text style={styles.shiftStatValue}>{shift.salesCount}</Text>
                    </View>
                  </View>
                </Card>
              </Animated.View>
            ))
          )}
        </Animated.View>

        {/* Member Info */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Card style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Invited</Text>
              <Text style={styles.detailValue}>{formatDate(member.invitedAt, 'long')}</Text>
            </View>
            {member.joinedAt && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Joined</Text>
                <Text style={styles.detailValue}>{formatDate(member.joinedAt, 'long')}</Text>
              </View>
            )}
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Role Selection Modal */}
      <Modal visible={showRoleModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowRoleModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Change Role</Text>

            {(['admin', 'cashier', 'stock_manager'] as TeamRole[]).map((role) => (
              <Pressable
                key={role}
                style={[
                  styles.roleOption,
                  selectedRole === role && styles.roleOptionSelected,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedRole(role);
                }}
              >
                <LinearGradient
                  colors={selectedRole === role ? ROLE_COLORS[role].gradient : [colors.borderLight, colors.borderLight]}
                  style={styles.roleOptionIcon}
                >
                  <Ionicons
                    name={ROLE_ICONS[role]}
                    size={20}
                    color={selectedRole === role ? '#fff' : colors.textSecondary}
                  />
                </LinearGradient>
                <Text
                  style={[
                    styles.roleOptionText,
                    selectedRole === role && { color: ROLE_COLORS[role].text, fontWeight: '600' },
                  ]}
                >
                  {getRoleLabel(role)}
                </Text>
                {selectedRole === role && (
                  <Ionicons name="checkmark-circle" size={24} color={ROLE_COLORS[role].text} />
                )}
              </Pressable>
            ))}

            <View style={styles.modalActions}>
              <Button
                title={t.common.cancel}
                variant="outline"
                onPress={() => setShowRoleModal(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={t.common.save}
                onPress={handleRoleChange}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  memberEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  memberPhone: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  suspendButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: `${colors.error}15`,
  },
  suspendButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.error,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  roleCard: {
    marginBottom: spacing.md,
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconLarge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  roleTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  roleDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  emptyShifts: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyShiftsText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  shiftCard: {
    marginBottom: spacing.sm,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  shiftDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  shiftDateText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
  },
  shiftStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  shiftStatusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  shiftStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  shiftStat: {
    alignItems: 'center',
  },
  shiftStatLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  shiftStatValue: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  detailsCard: {},
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  roleOptionSelected: {
    backgroundColor: `${colors.primary}10`,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  roleOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginLeft: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
