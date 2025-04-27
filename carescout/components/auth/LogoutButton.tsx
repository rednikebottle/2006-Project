'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth/authService";

export function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  return <Button variant="outline" onClick={handleLogout}>Logout</Button>;
}