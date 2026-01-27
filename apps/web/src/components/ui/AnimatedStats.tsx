'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

export function StatCard({
  value,
  label,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  trend,
  trendLabel,
}: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="w-12 h-12 bg-ocean-100 rounded-xl flex items-center justify-center text-ocean-600">
            {icon}
          </div>
        )}
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <svg
              className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </div>
        <p className="text-gray-500">{label}</p>
        {trendLabel && <p className="text-xs text-gray-400">{trendLabel}</p>}
      </div>
    </motion.div>
  );
}

interface StatsGridProps {
  stats: Array<{
    value: number;
    label: string;
    prefix?: string;
    suffix?: string;
    icon?: React.ReactNode;
    trend?: number;
  }>;
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}

// Circular progress stat
export function CircularStat({
  value,
  max = 100,
  label,
  size = 120,
  strokeWidth = 8,
  color = 'ocean',
}: {
  value: number;
  max?: number;
  label: string;
  size?: number;
  strokeWidth?: number;
  color?: 'ocean' | 'green' | 'amber' | 'red';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentage = (value / max) * 100;
  const circumference = (size - strokeWidth) * Math.PI;

  const colorClasses = {
    ocean: 'text-ocean-500',
    green: 'text-green-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
  };

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={colorClasses[color]}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: circumference * (1 - percentage / 100) } : {}}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeDasharray={circumference}
          />
        </svg>
        {/* Value in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            <AnimatedCounter value={value} />
          </span>
        </div>
      </div>
      <span className="mt-2 text-sm text-gray-600">{label}</span>
    </div>
  );
}

// Horizontal progress bar stat
export function ProgressStat({
  value,
  max = 100,
  label,
  showValue = true,
  color = 'ocean',
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  color?: 'ocean' | 'green' | 'amber' | 'red';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const percentage = (value / max) * 100;

  const colorClasses = {
    ocean: 'bg-ocean-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {showValue && (
          <span className="text-sm font-semibold text-gray-900">
            <AnimatedCounter value={value} /> / {max}
          </span>
        )}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Big number display
export function BigNumber({
  value,
  label,
  prefix = '',
  suffix = '',
  sublabel,
}: {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  sublabel?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="text-lg font-medium text-gray-600">{label}</p>
      {sublabel && <p className="text-sm text-gray-400 mt-1">{sublabel}</p>}
    </div>
  );
}

// Stats marquee for continuous scrolling stats
export function StatsMarquee({
  stats,
  speed = 30,
}: {
  stats: Array<{ value: number; label: string; prefix?: string; suffix?: string }>;
  speed?: number;
}) {
  return (
    <div className="overflow-hidden bg-gray-900 py-4">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[...stats, ...stats].map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              {stat.prefix}
              {stat.value.toLocaleString()}
              {stat.suffix}
            </span>
            <span className="text-gray-400">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
