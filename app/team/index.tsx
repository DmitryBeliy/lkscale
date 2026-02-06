import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button } from '@/components/ui';
import { useLocalization } from '@/localization';
import { getAuthState } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { TeamMember, TeamRole } from '@/types';
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

interface TeamMemberCardProps {
  member: TeamMember;
  onPress: () => void;
  t: any;
  index: number;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onPress, t, index }) => {
  const roleColors = ROLE_COLORS[member.role];
  const roleIcon = ROLE_ICONS[member.role];
  const isPending = member.status === 'pending';

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.memberCard, pressed && styles.cardPressed]}>
        <View style={styles.memberHeader}>
          <View style={styles.avatarContainer}>
            {member.avatarUrl ? (
              <Animated.Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient colors={roleColors.gradient} style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(member.name || member.email).charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={[styles.statusDot, { backgroundColor: isPending ? colors.warning : colors.success }]} />
          </View>

          <View style={styles.memberInfo}>
            <Text style={styles.memberName} numberOfLines={1}>
              {member.name || member.email.split('@')[0]}
            </Text>
            <Text style={styles.memberEmail} numberOfLines={1}>
              {member.email}
            </Text>
          </View>

          <View style={[styles.roleBadge, { backgroundColor: roleColors.bg }]}>
            <Ionicons name={roleIcon} size={14} color={roleColors.text} />
            <Text style={[styles.roleText, { color: roleColors.text }]}>
              {t.team.roles[member.role === 'stock_manager' ? 'stockManager' : member.role]}
            </Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={14} color={colors.warning} />
            <Text style={styles.pendingText}>{t.team.status.pending}</Text>
          </View>
        )}

        <View style={styles.memberFooter}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>
              {new Date(member.invitedAt).toLocaleDateString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function TeamScreen() {
  const insets = useSafeAreaInsets();
  const { t, formatDate } = useLocalization();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = getAuthState().user;

  const loadTeamMembers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('team_members')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedMembers: TeamMember[] = (data || []).map((m: any) => ({
        id: m.id,
        userId: m.user_id || undefined,
        ownerId: m.owner_id,
        email: m.email,
        name: m.name || undefined,
        phone: m.phone || undefined,
        avatarUrl: m.avatar_url || undefined,
        role: m.role as TeamRole,
        status: m.status as TeamMember['status'],
        permissions: m.permissions as TeamMember['permissions'] || {},
        invitedAt: m.invited_at,
        joinedAt: m.joined_at || undefined,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));

      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      Alert.alert(t.common.error, 'Failed to load team members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTeamMembers();
  }, [loadTeamMembers]);

  const handleInvite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/team/invite');
  };

  const handleMemberPress = (member: TeamMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/team/${member.id}`);
  };

  const pendingMembers = members.filter((m) => m.status === 'pending');
  const activeMembers = members.filter((m) => m.status === 'active');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{t.team.title}</Text>
          <Text style={styles.subtitle}>{members.length} {t.team.members.toLowerCase()}</Text>
        </View>
        <Pressable onPress={() => router.push('/team/activity')} style={styles.activityButton}>
          <Ionicons name="time-outline" size={24} color={colors.primary} />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => router.push('/team/shifts')}>
            <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.statIcon}>
              <Ionicons name="people" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.statValue}>{activeMembers.length}</Text>
            <Text style={styles.statLabel}>{t.team.activeMembers}</Text>
          </Pressable>

          <Pressable style={styles.statCard} onPress={handleInvite}>
            <LinearGradient colors={[colors.warning, '#E5A000']} style={styles.statIcon}>
              <Ionicons name="mail" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.statValue}>{pendingMembers.length}</Text>
            <Text style={styles.statLabel}>{t.team.pendingInvites}</Text>
          </Pressable>

          <Pressable style={styles.statCard} onPress={() => router.push('/team/activity')}>
            <LinearGradient colors={[colors.success, '#00B86B']} style={styles.statIcon}>
              <Ionicons name="pulse" size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.statValue}>{t.activityLog.title.split(' ')[0]}</Text>
            <Text style={styles.statLabel}>{t.activityLog.title.split(' ')[1] || ''}</Text>
          </Pressable>
        </Animated.View>

        {/* Invite Button */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <Button
            title={t.team.inviteMember}
            onPress={handleInvite}
            icon={<Ionicons name="person-add" size={20} color="#fff" />}
            style={styles.inviteButton}
          />
        </Animated.View>

        {/* Team Members List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t.common.loading}</Text>
          </View>
        ) : members.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="people-outline" size={48} color={colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>{t.team.noMembers}</Text>
            <Text style={styles.emptySubtitle}>{t.team.noMembersDesc}</Text>
          </Animated.View>
        ) : (
          <>
            {pendingMembers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.team.pendingInvites}</Text>
                {pendingMembers.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onPress={() => handleMemberPress(member)}
                    t={t}
                    index={index}
                  />
                ))}
              </View>
            )}

            {activeMembers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.team.activeMembers}</Text>
                {activeMembers.map((member, index) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onPress={() => handleMemberPress(member)}
                    t={t}
                    index={index}
                  />
                ))}
              </View>
            )}
          </>
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
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  activityButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inviteButton: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  memberCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  memberInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  memberName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  memberEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  roleText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.warning}15`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  pendingText: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
    fontWeight: '500',
  },
  memberFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
