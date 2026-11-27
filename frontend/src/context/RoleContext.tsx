'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User, UserRole } from '@/types';
import { storageEventBus } from '@/lib/patterns/ObserverPattern';

export const DEMO_ROLE_STORAGE_KEY = 'shebalink_demo_role';

export const DEMO_USERS: Record<UserRole, User> = {
  customer: {
    id: 'cust-001',
    name: 'Tariqul Islam',
    fullName: 'Tariqul Islam',
    email: 'tariqul.islam@shebalink.demo',
    phone: '+8801711223344',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    city: 'Rajshahi',
    address: 'House 14, Road 3, Padma Residential Area, Boalia, Rajshahi',
    accountStatus: 'active',
    createdAt: '2025-01-10T09:00:00.000Z',
    updatedAt: '2025-02-01T12:00:00.000Z',
  },
  provider: {
    id: 'prov-001',
    name: 'Rahim Uddin',
    fullName: 'Rahim Uddin',
    email: 'rahim.electrician@shebalink.demo',
    phone: '+8801712345678',
    role: 'provider',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    city: 'Rajshahi',
    address: 'Shaheb Bazar Zero Point, Boalia, Rajshahi',
    accountStatus: 'active',
    createdAt: '2025-01-05T08:30:00.000Z',
    updatedAt: '2025-02-10T10:15:00.000Z',
  },
  admin: {
    id: 'admin-001',
    name: 'Nusrat Jahan',
    fullName: 'Nusrat Jahan',
    email: 'nusrat.admin@shebalink.demo',
    phone: '+8801700000001',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
    city: 'Rajshahi',
    address: 'ShebaLink Operations Hub, Kazla, Motihar, Rajshahi',
    accountStatus: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-02-15T09:00:00.000Z',
  },
};

export interface RoleContextValue {
  currentRole: UserRole;
  currentUser: User;
  setRole: (role: UserRole) => void;
  getDashboardPath: (role?: UserRole) => string;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function isValidRole(value: unknown): value is UserRole {
  return value === 'customer' || value === 'provider' || value === 'admin';
}

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case 'customer':
      return '/dashboard/customer';
    case 'provider':
      return '/dashboard/provider';
    case 'admin':
      return '/dashboard/admin';
  }
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRoleState] = useState<UserRole>('customer');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);
      if (isValidRole(saved)) {
        setCurrentRoleState(saved);
      }
    } catch {
      // Ignore storage access errors in restricted contexts
    }
  }, []);

  useEffect(() => {
    const unsubscribe = storageEventBus.subscribe((event) => {
      if ((event.entity === 'role' || event.entity === 'all') && typeof window !== 'undefined') {
        try {
          const saved = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);
          if (isValidRole(saved)) {
            setCurrentRoleState(saved);
          }
        } catch {
          // Ignore
        }
      }
    });
    return unsubscribe;
  }, []);

  const setRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
        storageEventBus.emitChange('role', 'update', role);
      } catch {
        // Ignore storage write error
      }
    }
  }, []);

  const currentUser = useMemo(() => DEMO_USERS[currentRole], [currentRole]);

  const getDashboardPath = useCallback(
    (role?: UserRole) => getDashboardPathForRole(role ?? currentRole),
    [currentRole]
  );

  const value = useMemo<RoleContextValue>(
    () => ({
      currentRole,
      currentUser,
      setRole,
      getDashboardPath,
    }),
    [currentRole, currentUser, setRole, getDashboardPath]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
