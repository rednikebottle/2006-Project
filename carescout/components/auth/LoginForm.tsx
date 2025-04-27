'use client'
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loginWithBackend, registerWithBackend, signInWithCustomToken, storeToken } from "@/lib/auth/authService";
import { auth } from "@/config/firebase-client";

type LoginFormProps = {
  /**
   * Set initialTab to "signup" to have the Sign Up tab active by default.
   * Otherwise, defaults to "login".
   */
  initialTab?: "login" | "signup";
};

export function LoginForm({ initialTab = "login" }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(initialTab === "signup");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  // Password validation
  const validatePassword = (pass: string) => {
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[@$!%*?&]/.test(pass);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  // LOGIN FLOW
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }

      // 1. Ask the backend for a custom token
      const customToken = await loginWithBackend(email, password);

      // 2. Sign in to Firebase with that custom token -> get final ID token
      const idToken = await signInWithCustomToken(customToken);

      // 3. Store the ID token
      storeToken(idToken);

      // 4. Wait for auth state to be ready
      await auth.authStateReady();

      // Reset attempts on successful login
      setRemainingAttempts(3);

      // 5. Navigate to home page
      router.replace("/dashboard");
    } catch (err: any) {
      if (err.code === 'account-locked') {
        const unlockTime = new Date(err.lockedUntil).toLocaleTimeString();
        setError(`Account locked. Try again after ${unlockTime} or reset your password.`);
      } else if (err.code === 'invalid-credentials') {
        setRemainingAttempts(err.remainingAttempts);
        setError(`Incorrect email or password. ${err.remainingAttempts} attempts remaining.`);
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // SIGN-UP FLOW
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password || !name || !phone) {
        throw new Error("Please fill in all fields");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (!validatePassword(password)) {
        throw new Error(
          "Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters."
        );
      }

      console.log("Starting registration process...");
      
      // 1. Register user with your backend, returns a custom token
      const customToken = await registerWithBackend(email, password, name, phone);
      console.log("Registration successful, got custom token");

      // 2. Sign in with the custom token to get the user object
      const idToken = await signInWithCustomToken(customToken);
      storeToken(idToken);

      // 3. Navigate to dashboard
      router.replace("/dashboard");
      
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4">
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
          {error}
        </div>
      )}
      
      <Card className="w-[480px] shadow-xl">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="mx-auto w-32 h-32 relative mb-2">
            <Image
              src="/images/CARE_SCOUT_LOGO.png"
              alt="Carescout Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardDescription className="text-xl font-medium">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue={isSignUp ? "signup" : "login"} onValueChange={(value) => setIsSignUp(value === "signup")}>
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="login" className="text-base font-medium py-1">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-base font-medium py-1">Sign Up</TabsTrigger>
          </TabsList>
          
          {/* LOGIN TAB */}
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label className="text-base font-medium" htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-10 text-base"
                  />
                </div>
                
                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium" htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-10 text-base pr-10"
                      autoComplete="new-password"
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>

              {remainingAttempts < 3 && (
                <div className="px-6 mb-3 text-sm text-yellow-600">
                  Warning: {remainingAttempts} login attempts remaining before account lockout.
                </div>
              )}
              
              <CardFooter className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          {/* SIGNUP TAB */}
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label className="text-base font-medium" htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 text-base"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="text-base font-medium" htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 text-base"
                  />
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label className="text-base font-medium" htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+65 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={loading}
                    className="h-11 text-base"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <Label className="text-base font-medium" htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 text-base pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <Label className="text-base font-medium" htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-11 text-base pr-10"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-11 text-lg font-medium"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
