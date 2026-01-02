"use client";
import Image from "next/image";
import Dashboard from "./Dashboard/page";
import LandingPage from "./Landing/page";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Show loading spinner while auth state is resolving
  if (isLoggedIn === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  return isLoggedIn ? <Dashboard /> : <LandingPage />;
}
