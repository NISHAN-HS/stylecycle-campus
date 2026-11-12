import React from 'react';

// Curated playful emoji avatars with pleasant pastel background tones
const EMOJI_PALETTE = [
  { emoji: '🦊', bg: 'bg-amber-100 text-amber-800' },
  { emoji: '🐼', bg: 'bg-slate-100 text-slate-800' },
  { emoji: '🦁', bg: 'bg-orange-100 text-orange-800' },
  { emoji: '🐨', bg: 'bg-teal-100 text-teal-800' },
  { emoji: '🦉', bg: 'bg-emerald-100 text-emerald-800' },
  { emoji: '🐯', bg: 'bg-yellow-100 text-yellow-800' },
  { emoji: '🚀', bg: 'bg-blue-100 text-blue-800' },
  { emoji: '⚡', bg: 'bg-purple-100 text-purple-800' },
  { emoji: '✨', bg: 'bg-rose-100 text-rose-800' },
  { emoji: '🌿', bg: 'bg-forest-100 text-forest-800' },
];

export const getDeterministicEmoji = (name = 'Student') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % EMOJI_PALETTE.length;
  return EMOJI_PALETTE[index];
};

const UserAvatar = ({ name = 'Student', avatar, size = 'md', className = '' }) => {
  // If avatar is explicitly an emoji string (1 or 2 chars)
  const isEmojiStr = avatar && typeof avatar === 'string' && avatar.length <= 4 && !avatar.startsWith('http');
  const palette = getDeterministicEmoji(name);
  const displayEmoji = isEmojiStr ? avatar : palette.emoji;

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-4xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`${selectedSize} rounded-full ${palette.bg} flex items-center justify-center font-bold select-none border border-black/5 shadow-subtle shrink-0 ${className}`}
      title={name}
    >
      <span role="img" aria-label={name}>
        {displayEmoji}
      </span>
    </div>
  );
};

export default UserAvatar;

