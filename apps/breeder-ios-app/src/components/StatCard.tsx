import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { theme } from '../utils/theme';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  style?: ViewStyle;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = theme.colors.primary,
  trend,
  style,
}) => {
  return (
    <Card style={style} variant="elevated">
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.title}>{title}</Text>
          
          {trend && (
            <View style={styles.trendContainer}>
              <Text
                style={[
                  styles.trendIcon,
                  {
                    color: trend.isPositive ? theme.colors.success : theme.colors.error,
                  },
                ]}
              >
                {trend.isPositive ? '↗' : '↘'}
              </Text>
              <Text
                style={[
                  styles.trendText,
                  {
                    color: trend.isPositive ? theme.colors.success : theme.colors.error,
                  },
                ]}
              >
                {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  value: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: '600',
  },
  trendText: {
    ...theme.typography.caption,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
});

export default StatCard;
