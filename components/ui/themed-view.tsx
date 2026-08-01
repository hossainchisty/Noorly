import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

type Props = ViewProps & {
  useBackground?: boolean;
};

export function ThemedView({ useBackground = false, style, ...rest }: Props) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[{ backgroundColor: useBackground ? colors.background : 'transparent' }, style]}
      {...rest}
    />
  );
}
