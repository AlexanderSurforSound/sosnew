import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-xs' },
  sm: { container: 'h-8 w-8', text: 'text-sm' },
  md: { container: 'h-10 w-10', text: 'text-base' },
  lg: { container: 'h-12 w-12', text: 'text-lg' },
  xl: { container: 'h-16 w-16', text: 'text-xl' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getBackgroundColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}: AvatarProps) {
  const styles = sizeStyles[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        className={`${styles.container} rounded-full object-cover ${className}`}
      />
    );
  }

  if (name) {
    return (
      <div
        className={`
          ${styles.container}
          ${getBackgroundColor(name)}
          rounded-full flex items-center justify-center text-white font-medium
          ${styles.text}
          ${className}
        `}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <div
      className={`
        ${styles.container}
        bg-gray-200 rounded-full flex items-center justify-center
        ${className}
      `}
    >
      <svg
        className={`${styles.text} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
}: {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
}) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          {...avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={`
            ${sizeStyles[size].container}
            bg-gray-100 rounded-full flex items-center justify-center
            ring-2 ring-white ${sizeStyles[size].text} text-gray-600 font-medium
          `}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
