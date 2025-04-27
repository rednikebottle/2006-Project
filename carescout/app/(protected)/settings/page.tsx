"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserSettings, getSettings, updateProfile, updateNotifications, updatePassword, updatePreferences } from "@/lib/services/settingsService"
import { auth } from '@/lib/firebase-config'
import { useToast } from '@/components/ui/use-toast'

interface Settings {
  name: string
  email: string
  phone: string
  notifications: {
    enabled: boolean
    email: boolean
    sms: boolean
    bookingReminders: boolean
    newSlots: boolean
    pickupTimes: boolean
    emergencyClosures: boolean
    dailyReports: boolean
    promotions: boolean
    reviewReminders: boolean
    marketingEmails: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: 'en' | 'es' | 'fr'
  }
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Settings>({
    name: '',
    email: '',
    phone: '',
    notifications: {
      enabled: true,
      email: true,
      sms: false,
      bookingReminders: true,
      newSlots: false,
      pickupTimes: true,
      emergencyClosures: true,
      dailyReports: false,
      promotions: false,
      reviewReminders: true,
      marketingEmails: false
    },
    preferences: {
      theme: 'system',
      language: 'en'
    }
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      const response = await fetch('http://localhost:3001/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to load settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone
        })
      })
      if (!response.ok) throw new Error('Failed to update profile')
      toast({
        title: 'Success',
        description: 'Profile updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationChange = async (key: keyof Settings['notifications']) => {
    try {
      setLoading(true)
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      const newSettings = {
        ...settings,
        notifications: {
          ...settings.notifications,
          [key]: !settings.notifications[key]
        }
      }
      
      // If master switch is turned off, disable all notifications
      if (key === 'enabled' && !newSettings.notifications.enabled) {
        Object.keys(newSettings.notifications).forEach(k => {
          if (k !== 'enabled') {
            newSettings.notifications[k as keyof Settings['notifications']] = false
          }
        })
      }

      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      })
      if (!response.ok) throw new Error('Failed to update settings')
      setSettings(newSettings)
      toast({
        title: 'Success',
        description: 'Settings updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'New passwords do not match.',
          variant: 'destructive'
        })
        return
      }

      setLoading(true)
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      const response = await fetch('http://localhost:3001/api/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update password')
      }

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      toast({
        title: 'Success',
        description: 'Password updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update password. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesChange = async (key: keyof Settings['preferences'], value: string) => {
    try {
      setLoading(true)
      const token = await auth.currentUser?.getIdToken()
      if (!token) {
        throw new Error('Not authenticated')
      }
      const newSettings = {
        ...settings,
        preferences: {
          ...settings.preferences,
          [key]: value
        }
      }

      const response = await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSettings)
      })
      if (!response.ok) throw new Error('Failed to update settings')
      setSettings(newSettings)
      toast({
        title: 'Success',
        description: 'Settings updated successfully.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Settings</h1>
      </div>
      <div className="container mx-auto p-6 h-[calc(100vh-4rem-4rem)]">
        <div className="space-y-6">
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input 
                          id="name" 
                          value={settings.name}
                          onChange={(e) => setSettings({...settings, name: e.target.value})}
                          placeholder="Your name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={settings.email}
                          disabled
                          placeholder="Your email" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={settings.phone}
                          onChange={(e) => setSettings({...settings, phone: e.target.value})}
                          placeholder="Your phone number" 
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="mt-4"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Methods</CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable All Notifications</Label>
                        <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.enabled}
                        onCheckedChange={() => handleNotificationChange('enabled')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.email}
                        onCheckedChange={() => handleNotificationChange('email')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.sms}
                        onCheckedChange={() => handleNotificationChange('sms')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Notifications</CardTitle>
                  <CardDescription>Manage notifications for bookings and schedules</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Booking Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded about upcoming bookings</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.bookingReminders}
                        onCheckedChange={() => handleNotificationChange('bookingReminders')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New Slot Notifications</Label>
                        <p className="text-sm text-muted-foreground">Be notified when new slots become available</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.newSlots}
                        onCheckedChange={() => handleNotificationChange('newSlots')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Pickup Time Updates</Label>
                        <p className="text-sm text-muted-foreground">Get notified about pickup time changes</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.pickupTimes}
                        onCheckedChange={() => handleNotificationChange('pickupTimes')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Updates and Reports</CardTitle>
                  <CardDescription>Manage notifications for center updates and reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Emergency Closures</Label>
                        <p className="text-sm text-muted-foreground">Get notified about emergency center closures</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.emergencyClosures}
                        onCheckedChange={() => handleNotificationChange('emergencyClosures')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Daily Reports</Label>
                        <p className="text-sm text-muted-foreground">Receive daily activity reports</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.dailyReports}
                        onCheckedChange={() => handleNotificationChange('dailyReports')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Promotions and Updates</Label>
                        <p className="text-sm text-muted-foreground">Get notified about center promotions and updates</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.promotions}
                        onCheckedChange={() => handleNotificationChange('promotions')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reviews and Marketing</CardTitle>
                  <CardDescription>Manage review reminders and marketing communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Review Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get reminded to leave reviews after visits</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.reviewReminders}
                        onCheckedChange={() => handleNotificationChange('reviewReminders')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive marketing communications</p>
                      </div>
                      <Switch 
                        checked={settings.notifications.marketingEmails}
                        onCheckedChange={() => handleNotificationChange('marketingEmails')}
                        disabled={!settings.notifications.enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        placeholder="Enter your current password" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        placeholder="Enter your new password" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        placeholder="Confirm your new password" 
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handlePasswordChange}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Application Preferences</CardTitle>
                  <CardDescription>Customize your application experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <select
                        id="theme"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.preferences.theme}
                        onChange={(e) => handlePreferencesChange('theme', e.target.value)}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <select
                        id="language"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={settings.preferences.language}
                        onChange={(e) => handlePreferencesChange('language', e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
} 