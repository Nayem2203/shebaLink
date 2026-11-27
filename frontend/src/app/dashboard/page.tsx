'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SharedLayout } from '@/components/layout/SharedLayout';
import { LoadingState } from '@/components/ui';
import { getDashboardPathForRole, useRole } from '@/context/RoleContext';

export default function DashboardIndexPage() {
  const { currentRole } = useRole();
  const router = useRouter();

  useEffect(() => {
    router.replace(getDashboardPathForRole(currentRole));
  }, [currentRole, router]);

  return (
    <SharedLayout>
      <div className="mx-auto max-w-4xl px-4 py-16">
        <LoadingState message="Opening active demo dashboard" />
      </div>
    </SharedLayout>
  );
}
