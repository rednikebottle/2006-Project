'use client'

import { useState } from "react"
import { Bell, Calendar, Home, MessageSquare, Settings, Search, FileText, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Carescout</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-[200px] flex-col border-r bg-muted/40 md:flex">
          <nav className="grid gap-2 p-4 text-sm font-medium">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("dashboard")}
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={activeTab === "search" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("search")}
            >
              <Search className="mr-2 h-4 w-4" />
              Find Centers
            </Button>
            <Button
              variant={activeTab === "bookings" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("bookings")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Button>
            <Button
              variant={activeTab === "reports" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("reports")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Daily Reports
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("messages")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button
              variant={activeTab === "emergency" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("emergency")}
            >
              <Phone className="mr-2 h-4 w-4" />
              Emergency Contacts
            </Button>
            <Button
              variant={activeTab === "settings" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {activeTab === "dashboard" && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground">For Emma and Noah</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground">From 2 different centers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">New Daily Reports</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2</div>
                      <p className="text-xs text-muted-foreground">Updated today at 4:30 PM</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Recent Activities</CardTitle>
                      <CardDescription>Latest activities for your children</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity, index) => (
                          <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                            <Avatar>
                              <AvatarImage src={activity.avatar} alt={activity.teacher} />
                              <AvatarFallback>{activity.teacher[0]}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-1">
                              <p className="text-sm font-medium leading-none">{activity.title}</p>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Important updates from your centers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {notifications.map((notification, index) => (
                          <div key={index} className="grid gap-1">
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-muted-foreground">{notification.content}</p>
                            <p className="text-xs text-muted-foreground">{notification.date}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>All Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {allNotifications.map((notification, index) => (
                        <div key={index} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                          <div className="grid gap-1">
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.content}</p>
                            <p className="text-xs text-muted-foreground">{notification.date}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Mark as read
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link href="/settings/notifications" className="text-sm text-primary hover:underline">
                        Manage notification settings
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upcoming" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Bookings</CardTitle>
                    <CardDescription>Your scheduled childcare center visits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingBookings.map((booking, index) => (
                        <div key={index} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                          <div className="grid gap-1">
                            <p className="font-medium">{booking.centerName}</p>
                            <p className="text-sm">Child: {booking.childName}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.date}, {booking.time}
                            </p>
                            <p className="text-xs text-muted-foreground">Status: {booking.status}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button variant="destructive" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {activeTab === "search" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Find Childcare Centers</CardTitle>
                  <CardDescription>Search for centers based on your preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        Location
                      </label>
                      <input
                        id="location"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Enter postal code or area"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="fees" className="text-sm font-medium">
                        Max Monthly Fee
                      </label>
                      <select
                        id="fees"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Any price</option>
                        <option value="500">Up to $500</option>
                        <option value="1000">Up to $1,000</option>
                        <option value="1500">Up to $1,500</option>
                        <option value="2000">Up to $2,000</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="level" className="text-sm font-medium">
                        Age Group
                      </label>
                      <select
                        id="level"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">All ages</option>
                        <option value="infant">Infant (0-18 months)</option>
                        <option value="toddler">Toddler (18-36 months)</option>
                        <option value="preschool">Preschool (3-5 years)</option>
                        <option value="kindergarten">Kindergarten (5-6 years)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full">Search</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {childcareCenters.map((center, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-video w-full bg-muted">
                      <img
                        src={center.image || "/placeholder.svg"}
                        alt={center.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="line-clamp-1 text-lg">{center.name}</CardTitle>
                      <CardDescription>{center.location}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Monthly Fee:</span>
                          <span className="font-medium">${center.monthlyFee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Age Groups:</span>
                          <span className="text-sm">{center.ageGroups.join(", ")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Rating:</span>
                          <div className="flex items-center">
                            <span className="mr-1 font-medium">{center.rating}</span>
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-xs text-muted-foreground">({center.reviewCount})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Available Slots:</span>
                          <span
                            className={
                              center.availableSlots > 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"
                            }
                          >
                            {center.availableSlots > 0 ? `${center.availableSlots} slots` : "Full"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/centers/${center.id}`}>View Details</Link>
                        </Button>
                        <Button className="w-full" disabled={center.availableSlots === 0}>
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Chat with teachers and center staff</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid h-[600px] grid-cols-3 gap-4">
                  <div className="col-span-1 border-r pr-4">
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      {chatContacts.map((contact, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-3 rounded-lg p-2 ${
                            index === 0 ? "bg-muted" : "hover:bg-muted/50"
                          } cursor-pointer`}
                        >
                          <Avatar>
                            <AvatarImage src={contact.avatar} alt={contact.name} />
                            <AvatarFallback>{contact.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.lastMessageTime}</p>
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{contact.lastMessage}</p>
                          </div>
                          {contact.unread > 0 && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                              {contact.unread}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-col">
                    <div className="mb-4 flex items-center gap-3 border-b pb-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Ms. Johnson" />
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Ms. Johnson</p>
                        <p className="text-xs text-muted-foreground">Sunshine Room Teacher • Online</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4 overflow-y-auto px-2">
                      {chatMessages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                              message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {message.content}
                            <div
                              className={`mt-1 text-right text-xs ${
                                message.sender === "user" ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}
                            >
                              {message.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <Button>Send</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "reports" && (
            <Card>
              <CardHeader>
                <CardTitle>Daily Reports</CardTitle>
                <CardDescription>View your children's daily activities and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="emma">
                  <TabsList className="mb-4">
                    <TabsTrigger value="emma">Emma</TabsTrigger>
                    <TabsTrigger value="noah">Noah</TabsTrigger>
                  </TabsList>
                  <TabsContent value="emma" className="space-y-4">
                    {dailyReports.emma.map((report, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">{report.date}</h3>
                          <Button variant="outline" size="sm">
                            Download PDF
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 font-medium">Activities</h4>
                            <ul className="space-y-1 text-sm">
                              {report.activities.map((activity, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="mb-2 font-medium">Meals</h4>
                            <ul className="space-y-1 text-sm">
                              {report.meals.map((meal, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{meal}</span>
                                </li>
                              ))}
                            </ul>
                            <h4 className="mb-2 mt-4 font-medium">Nap Times</h4>
                            <ul className="space-y-1 text-sm">
                              {report.naps.map((nap, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{nap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="mb-2 font-medium">Teacher's Notes</h4>
                          <p className="text-sm">{report.notes}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="noah" className="space-y-4">
                    {dailyReports.noah.map((report, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium">{report.date}</h3>
                          <Button variant="outline" size="sm">
                            Download PDF
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="mb-2 font-medium">Activities</h4>
                            <ul className="space-y-1 text-sm">
                              {report.activities.map((activity, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="mb-2 font-medium">Meals</h4>
                            <ul className="space-y-1 text-sm">
                              {report.meals.map((meal, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{meal}</span>
                                </li>
                              ))}
                            </ul>
                            <h4 className="mb-2 mt-4 font-medium">Nap Times</h4>
                            <ul className="space-y-1 text-sm">
                              {report.naps.map((nap, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{nap}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="mb-2 font-medium">Teacher's Notes</h4>
                          <p className="text-sm">{report.notes}</p>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    You are currently subscribed to daily reports for Emma and Noah
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline">Manage Subscriptions</Button>
                    <div className="relative">
                      <Button variant="outline" className="group">
                        <span>Report Status</span>
                      </Button>
                      <div className="absolute right-0 top-full z-10 mt-2 hidden w-72 rounded-md border bg-background p-4 shadow-md group-hover:block">
                        <h4 className="mb-2 font-medium">Daily Report Process:</h4>
                        <ol className="ml-4 list-decimal text-sm text-muted-foreground">
                          <li>Teachers upload reports by 5:00 PM each day</li>
                          <li>System sends notification when reports are available</li>
                          <li>You can view and download reports anytime</li>
                          <li>If reports are delayed, you'll receive a notification</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "emergency" && (
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contacts</CardTitle>
                <CardDescription>Manage emergency contacts for your children</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="grid gap-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm">{contact.relationship}</p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                        <p className="text-xs text-muted-foreground">Added on {contact.addedOn}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full">Add New Emergency Contact</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

// Sample data
const recentActivities = [
  {
    title: "Art Class",
    description: "Emma created spring-themed paintings",
    teacher: "Ms. Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    time: "2 hours ago",
  },
  {
    title: "Outdoor Play",
    description: "Noah participated in group activities in the playground",
    teacher: "Mr. Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    time: "3 hours ago",
  },
  {
    title: "Storytime",
    description: "Emma enjoyed an interactive storytelling session",
    teacher: "Ms. Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    time: "5 hours ago",
  },
]

const notifications = [
  {
    title: "Booking Confirmed",
    content: "Your booking for Noah at Bright Stars Center has been confirmed for next Monday.",
    date: "Today, 2:30 PM",
  },
  {
    title: "New Daily Report",
    content: "Emma's daily report for today is now available. Check it out!",
    date: "Today, 4:15 PM",
  },
  {
    title: "Message from Teacher",
    content: "Ms. Johnson sent you a message regarding Emma's progress.",
    date: "Yesterday, 5:45 PM",
  },
]

const allNotifications = [
  {
    title: "Booking Confirmed",
    content: "Your booking for Noah at Bright Stars Center has been confirmed for next Monday.",
    date: "Today, 2:30 PM",
  },
  {
    title: "New Daily Report",
    content: "Emma's daily report for today is now available. Check it out!",
    date: "Today, 4:15 PM",
  },
  {
    title: "Message from Teacher",
    content: "Ms. Johnson sent you a message regarding Emma's progress.",
    date: "Yesterday, 5:45 PM",
  },
  {
    title: "Promotion Available",
    content: "Sunshine Daycare is offering 10% off for siblings enrollment this month!",
    date: "Mar 24, 2025",
  },
  {
    title: "New Center Added",
    content: "Little Explorers Childcare Center is now available for bookings in your area.",
    date: "Mar 22, 2025",
  },
  {
    title: "Booking Request Pending",
    content: "Your booking request for Emma at Sunshine Daycare is awaiting approval.",
    date: "Mar 20, 2025",
  },
]

const upcomingBookings = [
  {
    centerName: "Sunshine Daycare",
    childName: "Emma Johnson",
    date: "March 28, 2025",
    time: "8:00 AM - 5:00 PM",
    status: "Confirmed",
  },
  {
    centerName: "Bright Stars Center",
    childName: "Noah Johnson",
    date: "April 1, 2025",
    time: "9:00 AM - 4:00 PM",
    status: "Pending Approval",
  },
]

const childcareCenters = [
  {
    id: 1,
    name: "Sunshine Daycare",
    location: "123 Main St, Singapore 123456",
    monthlyFee: 1200,
    ageGroups: ["Infant", "Toddler", "Preschool"],
    rating: 4.8,
    reviewCount: 124,
    availableSlots: 3,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 2,
    name: "Bright Stars Center",
    location: "456 Park Ave, Singapore 234567",
    monthlyFee: 1500,
    ageGroups: ["Toddler", "Preschool", "Kindergarten"],
    rating: 4.6,
    reviewCount: 98,
    availableSlots: 2,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 3,
    name: "Little Explorers",
    location: "789 River Rd, Singapore 345678",
    monthlyFee: 1350,
    ageGroups: ["Infant", "Toddler", "Preschool"],
    rating: 4.7,
    reviewCount: 87,
    availableSlots: 0,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 4,
    name: "Happy Kids Academy",
    location: "321 Forest Lane, Singapore 456789",
    monthlyFee: 1100,
    ageGroups: ["Toddler", "Preschool"],
    rating: 4.5,
    reviewCount: 76,
    availableSlots: 5,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 5,
    name: "Growing Minds Childcare",
    location: "654 Ocean View, Singapore 567890",
    monthlyFee: 1600,
    ageGroups: ["Infant", "Toddler", "Preschool", "Kindergarten"],
    rating: 4.9,
    reviewCount: 145,
    availableSlots: 1,
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: 6,
    name: "Tiny Tots Daycare",
    location: "987 Mountain Ave, Singapore 678901",
    monthlyFee: 1250,
    ageGroups: ["Infant", "Toddler"],
    rating: 4.4,
    reviewCount: 62,
    availableSlots: 4,
    image: "/placeholder.svg?height=200&width=400",
  },
]

const chatContacts = [
  {
    name: "Ms. Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Emma had a great day today! She participated...",
    lastMessageTime: "2:45 PM",
    unread: 2,
  },
  {
    name: "Mr. Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Noah is making good progress with his...",
    lastMessageTime: "Yesterday",
    unread: 1,
  },
  {
    name: "Sunshine Daycare Admin",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Thank you for your payment. The receipt has...",
    lastMessageTime: "Mar 24",
    unread: 0,
  },
  {
    name: "Ms. Garcia",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "We're planning a field trip next month...",
    lastMessageTime: "Mar 22",
    unread: 0,
  },
  {
    name: "Bright Stars Center Admin",
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "Your booking request has been received...",
    lastMessageTime: "Mar 20",
    unread: 0,
  },
]

const chatMessages = [
  {
    sender: "other",
    content:
      "Good afternoon! I wanted to let you know that Emma had a wonderful day today. She participated enthusiastically in our art project and made some beautiful paintings.",
    time: "2:30 PM",
  },
  {
    sender: "user",
    content: "That's great to hear! She's been talking about the art class all week. Did she eat her lunch today?",
    time: "2:35 PM",
  },
  {
    sender: "other",
    content:
      "Yes, she ate most of her lunch today. She particularly enjoyed the fruit and yogurt. She's been making good progress with using her spoon properly.",
    time: "2:38 PM",
  },
  {
    sender: "other",
    content:
      "Also, we're planning a small celebration for spring next week. We'll be sending out details soon, but wanted to give you a heads up!",
    time: "2:39 PM",
  },
  {
    sender: "user",
    content: "That sounds wonderful! Emma will be excited about that. Is there anything we need to prepare or bring?",
    time: "2:42 PM",
  },
  {
    sender: "other",
    content:
      "Nothing specific at this time. We'll provide all the materials needed. If anything changes, I'll let you know right away.",
    time: "2:45 PM",
  },
]

const dailyReports = {
  emma: [
    {
      date: "March 26, 2025",
      activities: [
        "Morning circle time (15 minutes)",
        "Art class - Spring-themed painting (45 minutes)",
        "Outdoor play (30 minutes)",
        "Story time (20 minutes)",
        "Free play with blocks and puzzles (40 minutes)",
      ],
      meals: [
        "Morning snack: Apple slices and crackers (Ate most)",
        "Lunch: Pasta with vegetables and chicken (Ate half)",
        "Afternoon snack: Yogurt with berries (Ate all)",
      ],
      naps: ["12:30 PM - 2:15 PM (1 hour 45 minutes)"],
      notes:
        "Emma had a great day today! She was very engaged during art class and created a beautiful painting of flowers. She played well with her friends during free play and helped clean up without being prompted. She's showing improvement in her fine motor skills when using scissors.",
    },
    {
      date: "March 25, 2025",
      activities: [
        "Morning circle time (15 minutes)",
        "Music and movement (30 minutes)",
        "Outdoor play (45 minutes)",
        "Math activity - counting and sorting (25 minutes)",
        "Free play with dramatic play area (40 minutes)",
      ],
      meals: [
        "Morning snack: Banana and graham crackers (Ate all)",
        "Lunch: Sandwich with fruit and vegetables (Ate most)",
        "Afternoon snack: Cheese and crackers (Ate half)",
      ],
      naps: ["12:45 PM - 2:30 PM (1 hour 45 minutes)"],
      notes:
        "Emma enjoyed music and movement today, especially the dancing activities. She's becoming more confident in counting up to 10 and can now sort objects by color consistently. She played cooperatively with her friends in the dramatic play area, taking turns and sharing toys.",
    },
  ],
  noah: [
    {
      date: "March 26, 2025",
      activities: [
        "Morning circle time (15 minutes)",
        "Science exploration - water play (40 minutes)",
        "Outdoor play (45 minutes)",
        "Language activity - letter recognition (25 minutes)",
        "Building with blocks (35 minutes)",
      ],
      meals: [
        "Morning snack: Orange slices and cereal (Ate all)",
        "Lunch: Rice with vegetables and fish (Ate most)",
        "Afternoon snack: Fruit smoothie (Ate all)",
      ],
      naps: ["12:30 PM - 2:00 PM (1 hour 30 minutes)"],
      notes:
        "Noah was very interested in our science exploration today! He asked many questions during water play and made observations about which objects float or sink. He's showing progress in recognizing letters, especially those in his name. He built an impressive tower with blocks and was proud to show it to everyone.",
    },
    {
      date: "March 25, 2025",
      activities: [
        "Morning circle time (15 minutes)",
        "Art class - Collage making (35 minutes)",
        "Outdoor play (40 minutes)",
        "Story time (25 minutes)",
        "Sensory play with playdough (30 minutes)",
      ],
      meals: [
        "Morning snack: Apple sauce and graham crackers (Ate most)",
        "Lunch: Pasta with tomato sauce and cheese (Ate half)",
        "Afternoon snack: Veggie sticks with hummus (Ate little)",
      ],
      naps: ["12:40 PM - 2:15 PM (1 hour 35 minutes)"],
      notes:
        "Noah created a colorful collage today using various materials. He listened attentively during story time and answered questions about the story. He's developing his fine motor skills through playdough activities, making shapes and letters. He was a bit tired in the afternoon but participated in all activities.",
    },
  ],
}

const emergencyContacts = [
  {
    name: "John Johnson",
    relationship: "Father",
    phone: "+65 9123 4567",
    addedOn: "Jan 15, 2025",
  },
  {
    name: "Sarah Johnson",
    relationship: "Mother",
    phone: "+65 9765 4321",
    addedOn: "Jan 15, 2025",
  },
  {
    name: "Michael Williams",
    relationship: "Uncle",
    phone: "+65 8123 4567",
    addedOn: "Feb 10, 2025",
  },
  {
    name: "Jennifer Smith",
    relationship: "Family Friend",
    phone: "+65 9876 5432",
    addedOn: "Mar 5, 2025",
  },
]

