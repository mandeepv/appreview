import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

interface ProfileItemProps {
  label: string;
  value: string;
}

function ProfileItem({ label, value }: ProfileItemProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  // Dummy data based on onboarding flow
  const profileData = {
    userType: 'Mother',
    name: 'Sarah Johnson',
    age: 32,
    childrenCount: 2,
    children: [
      { gender: 'Boy', ageRange: '2-4 years' },
      { gender: 'Girl', ageRange: '0-1 years' },
    ],
    improvementGoals: [
      'Build closer relationship',
      'Reduce fighting',
      'Improve parenting skills',
    ],
    notificationsEnabled: true,
    partnerInvolvement: 'Involved sometimes',
    partnerInvited: false,
    learningGoal: 'Regular learner',
    experienceLevel: 'Know a lot about parenting science',
    familiarParentingStyles: [
      'Gentle parenting',
      'Positive parenting',
    ],
    emotionalChallenges: [
      'Feeling overwhelmed',
      'Burned out',
    ],
    authMethod: 'Google',
    selectedPlan: 'Free Trial (7 days)',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {profileData.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <Text style={styles.headerName}>{profileData.name}</Text>
        <Text style={styles.headerSubtext}>{profileData.userType}</Text>
      </View>

      <ProfileSection title="Personal Information">
        <ProfileItem label="Name" value={profileData.name} />
        <ProfileItem label="Age" value={`${profileData.age} years old`} />
        <ProfileItem label="User Type" value={profileData.userType} />
      </ProfileSection>

      <ProfileSection title="Family Information">
        <ProfileItem label="Number of Children" value={`${profileData.childrenCount}`} />
        {profileData.children.map((child, index) => (
          <View key={index} style={styles.childInfo}>
            <Text style={styles.childLabel}>Child {index + 1}</Text>
            <ProfileItem label="Gender" value={child.gender} />
            <ProfileItem label="Age Range" value={child.ageRange} />
          </View>
        ))}
        <ProfileItem label="Partner Involvement" value={profileData.partnerInvolvement} />
        <ProfileItem
          label="Partner Invited"
          value={profileData.partnerInvited ? 'Yes' : 'No'}
        />
      </ProfileSection>

      <ProfileSection title="Parenting Goals">
        <View style={styles.listContainer}>
          <Text style={styles.itemLabel}>Improvement Goals</Text>
          {profileData.improvementGoals.map((goal, index) => (
            <Text key={index} style={styles.listItem}>• {goal}</Text>
          ))}
        </View>
        <ProfileItem label="Learning Commitment" value={profileData.learningGoal} />
      </ProfileSection>

      <ProfileSection title="Parenting Experience">
        <ProfileItem label="Experience Level" value={profileData.experienceLevel} />
        <View style={styles.listContainer}>
          <Text style={styles.itemLabel}>Familiar Parenting Styles</Text>
          {profileData.familiarParentingStyles.map((style, index) => (
            <Text key={index} style={styles.listItem}>• {style}</Text>
          ))}
        </View>
      </ProfileSection>

      <ProfileSection title="Emotional Well-being">
        <View style={styles.listContainer}>
          <Text style={styles.itemLabel}>Current Challenges</Text>
          {profileData.emotionalChallenges.map((challenge, index) => (
            <Text key={index} style={styles.listItem}>• {challenge}</Text>
          ))}
        </View>
      </ProfileSection>

      <ProfileSection title="Account Settings">
        <ProfileItem
          label="Notifications"
          value={profileData.notificationsEnabled ? 'Enabled' : 'Disabled'}
        />
        <ProfileItem label="Authentication Method" value={profileData.authMethod} />
        <ProfileItem label="Subscription Plan" value={profileData.selectedPlan} />
      </ProfileSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E94B8F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionContent: {
    gap: 12,
  },
  item: {
    paddingHorizontal: 24,
  },
  itemLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  childInfo: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    marginHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  childLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E94B8F',
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 24,
  },
  listItem: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 6,
    paddingLeft: 8,
  },
});
