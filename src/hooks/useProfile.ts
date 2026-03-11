import { useState, useEffect, useMemo } from 'react';
import { useSyllabusStore } from '../store';
import { useHaptics } from './useHaptics';

export interface ProfileData {
  name: string;
  birthday: string;
  birthTime: string;
  timezone: string;
  location: {
    name: string;
    lat: number;
    lng: number;
  };
  isMe: boolean;
}

export const useProfile = (initialIsMe: boolean = true) => {
  const { userIdentity, userBirthday, userLocation } = useSyllabusStore();
  const { triggerClick } = useHaptics();

  const [profile, setProfile] = useState<ProfileData>({
    name: initialIsMe ? (userIdentity || '') : '',
    birthday: initialIsMe ? (userBirthday || '') : '',
    birthTime: initialIsMe ? '12:00' : '12:00',
    timezone: initialIsMe ? (Intl.DateTimeFormat().resolvedOptions().timeZone) : 'UTC',
    location: initialIsMe ? {
      name: userLocation?.name || '',
      lat: userLocation?.lat || 0,
      lng: userLocation?.lng || 0
    } : {
      name: '',
      lat: 0,
      lng: 0
    },
    isMe: initialIsMe
  });

  // Sync with store if it's "Me"
  useEffect(() => {
    if (profile.isMe) {
      setProfile({
        name: userIdentity || '',
        birthday: userBirthday || '',
        birthTime: '12:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: {
          name: userLocation?.name || '',
          lat: userLocation?.lat || 0,
          lng: userLocation?.lng || 0
        },
        isMe: true
      });
    }
  }, [userIdentity, userBirthday, userLocation, profile.isMe]);

  const setMe = () => {
    triggerClick();
    setProfile({
      name: userIdentity || '',
      birthday: userBirthday || '',
      birthTime: '12:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      location: {
        name: userLocation?.name || '',
        lat: userLocation?.lat || 0,
        lng: userLocation?.lng || 0
      },
      isMe: true
    });
  };

  const setSomeoneElse = () => {
    triggerClick();
    setProfile(prev => ({ ...prev, isMe: false }));
  };

  const updateProfile = (updates: Partial<Omit<ProfileData, 'isMe'>>) => {
    setProfile(prev => ({ ...prev, ...updates, isMe: false }));
  };

  const initials = useMemo(() => {
    if (!profile.name) return '??';
    return profile.name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }, [profile.name]);

  const isValid = useMemo(() => {
    return profile.name.trim().length > 0 && profile.birthday !== '';
  }, [profile.name, profile.birthday]);

  return {
    profile,
    setMe,
    setSomeoneElse,
    updateProfile,
    initials,
    isValid
  };
};
