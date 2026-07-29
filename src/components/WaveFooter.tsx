import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function WaveFooter() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={160}
        viewBox={`0 0 ${SCREEN_WIDTH} 160`}
        preserveAspectRatio="none"
      >
        <Path
          d={`M0 90 Q ${SCREEN_WIDTH * 0.25} 40 ${SCREEN_WIDTH * 0.5} 70 T ${SCREEN_WIDTH} 55 L ${SCREEN_WIDTH} 160 L 0 160 Z`}
          fill={colors.waveLight}
        />
        <Path
          d={`M0 110 Q ${SCREEN_WIDTH * 0.35} 65 ${SCREEN_WIDTH * 0.65} 95 T ${SCREEN_WIDTH} 75 L ${SCREEN_WIDTH} 160 L 0 160 Z`}
          fill={colors.waveMid}
          opacity={0.7}
        />
        <Path
          d={`M0 130 Q ${SCREEN_WIDTH * 0.4} 95 ${SCREEN_WIDTH * 0.7} 115 T ${SCREEN_WIDTH} 100 L ${SCREEN_WIDTH} 160 L 0 160 Z`}
          fill={colors.waveDark}
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
});
