import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export const PROVIDER_DEFAULT = 'default';

type MapViewProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  region?: unknown;
};

export function MapView({ style }: MapViewProps) {
  return <View style={[styles.placeholder, style]} />;
}

export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#EDEDED',
  },
});
