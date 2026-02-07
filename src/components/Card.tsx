import { View, StyleSheet, ViewStyle, ViewProps } from "react-native";
import { useThemeColors, spacing, borderRadius, shadows } from "@/constants/theme";

interface CardProps extends ViewProps {
  variant?: "flat" | "elevated";
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export function Card({
  children,
  variant = "elevated",
  padding = "md",
  style,
  ...props
}: CardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.card,
          borderColor: colors.separator,
          padding: spacing[padding],
        },
        variant === "elevated" && shadows.md,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
