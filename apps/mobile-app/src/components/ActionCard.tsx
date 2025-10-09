import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../utils/theme';
import Card from './Card';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  color = theme.colors.primary,
  style,
}) => {
  return (
    <Card
      style={style}
      onPress={onPress}
      variant="elevated"
      padding="large"
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        
        <Text style={styles.chevron}>›</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  chevron: {
    fontSize: 32,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
});

export default ActionCard;
