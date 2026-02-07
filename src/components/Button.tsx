import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  useThemeColors,
  spacing,
  borderRadius,
  ColorTokens,
} from "@/constants/theme";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const getVariantStyles = (
  colors: ColorTokens
): Record<ButtonVariant, ViewStyle> => ({
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
});

const getVariantTextStyles = (
  colors: ColorTokens
): Record<ButtonVariant, TextStyle> => ({
  primary: { color: colors.textInverted },
  secondary: { color: colors.text },
  ghost: { color: colors.primary },
});

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  haptic = true,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useThemeColors();
  const variantStyles = getVariantStyles(colors);
  const variantTextStyles = getVariantTextStyles(colors);

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.textInverted : colors.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            sizeTextStyles[size],
            variantTextStyles[variant],
            (disabled || loading) && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.7,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 },
  md: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, minHeight: 44 },
  lg: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, minHeight: 52 },
};

const sizeTextStyles: Record<ButtonSize, TextStyle> = {
  sm: { fontSize: 14 },
  md: { fontSize: 16 },
  lg: { fontSize: 18 },
};
