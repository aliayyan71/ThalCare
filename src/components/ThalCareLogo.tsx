import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../constants/theme';

type ThalCareLogoProps = {
  size?: number;
};

export function ThalCareLogo({ size = 120 }: ThalCareLogoProps) {
  const height = size * 1.15;

  return (
    <Svg width={size} height={height} viewBox="0 0 120 138" fill="none">
      <Path
        d="M60 8C60 8 12 72 12 98C12 118 32 132 60 132C88 132 108 118 108 98C108 72 60 8 60 8Z"
        fill={colors.brandRed}
      />
      <Path
        d="M60 52C54 46 44 48 42 56C40 64 46 72 60 82C74 72 80 64 78 56C76 48 66 46 60 52Z"
        fill={colors.white}
      />
      <Circle cx="50" cy="58" r="3.5" fill={colors.brandRed} />
      <Circle cx="70" cy="58" r="3.5" fill={colors.brandRed} />
      <Path
        d="M52 64C56 68 64 68 68 64"
        stroke={colors.brandRed}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
