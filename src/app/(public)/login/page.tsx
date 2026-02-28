'use client';

import React from 'react';
import LoginForm from '@/components/Auth/LoginForm';

const LoginPage = () => {
  return (
    <main className="flex justify-center items-start min-h-screen bg-[#0F172A] px-4 pt-28 pb-12">
      <LoginForm />
    </main>
  );
};

export default LoginPage;