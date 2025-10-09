import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { UserAuth } from '@/types/nutrition';
import { useStorage } from '@/providers/storage';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const { getItem, setItem } = useStorage();
  const [userAuth, setUserAuthState] = useState<UserAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserAuth = useCallback(async () => {
    try {
      console.log('بدء تحميل بيانات المستخدم...');
      const stored = await getItem('userAuth');
      if (stored && stored.trim()) {
        const auth = JSON.parse(stored) as UserAuth;
        if (auth && typeof auth === 'object' && auth.isLoggedIn) {
          console.log('تم تحميل بيانات المستخدم:', auth);
          setUserAuthState(auth);
        }
      } else {
        console.log('لا توجد بيانات مستخدم محفوظة');
      }
    } catch (error) {
      console.error('Error loading user auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getItem]);

  useEffect(() => {
    loadUserAuth();
  }, [loadUserAuth]);

  const login = useCallback(async (name: string, email: string, phoneNumber: string) => {
    try {
      const auth: UserAuth = {
        name,
        email,
        phoneNumber,
        isLoggedIn: true
      };
      await setItem('userAuth', JSON.stringify(auth));
      setUserAuthState(auth);
      console.log('تم تسجيل الدخول بنجاح:', auth);
    } catch (error) {
      console.error('Error saving user auth:', error);
      throw error;
    }
  }, [setItem]);

  const logout = useCallback(async () => {
    try {
      await setItem('userAuth', JSON.stringify({ isLoggedIn: false }));
      setUserAuthState(null);
      console.log('تم تسجيل الخروج');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, [setItem]);

  return useMemo(() => ({
    userAuth,
    isLoading,
    isLoggedIn: userAuth?.isLoggedIn || false,
    login,
    logout,
    loadUserAuth
  }), [userAuth, isLoading, login, logout, loadUserAuth]);
});
