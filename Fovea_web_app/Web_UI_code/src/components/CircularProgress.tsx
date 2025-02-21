import { FC } from 'react';

type CircularProgressProps = {
  percentage: number;
};

const CircularProgress: FC<CircularProgressProps> = (props) => {
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset =
    circumference - (props.percentage / 100) * circumference;

  return (
    <svg
      height={radius * 2 + strokeWidth * 2}
      width={radius * 2 + strokeWidth * 2}
      viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${
        radius * 2 + strokeWidth * 2
      }`}
    >
      <circle
        stroke='transparent'
        fill='transparent'
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
      />
      <circle
        stroke='white'
        fill='transparent'
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        transform={`rotate(-90 ${radius + strokeWidth} ${
          radius + strokeWidth
        })`}
      />
      <text
        x='50%'
        y='50%'
        textAnchor='middle'
        stroke='white'
        strokeWidth='2px'
        dy='.3em'
      >
        {props.percentage}%
      </text>
    </svg>
  );
};

export default CircularProgress;
