"use client"

import { useState } from "react"
import {
  Bell,
  Calendar,
  Home,
  MessageSquare,
  Settings,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Carescout Admin</h1>
          <Badge>Center Manager</Badge>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
            <AvatarFallback>A</AvatarFallback>
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
              variant={activeTab === "bookings" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("bookings")}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Booking Requests
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
              variant={activeTab === "children" ? "default" : "ghost"}
              className="justify-start"
              onClick={() => setActiveTab("children")}
            >
              <Users className="mr-2 h-4 w-4" />
              Children
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
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Children</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">42</div>
                    <p className="text-xs text-muted-foreground">5 new enrollments this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-500">2 urgent</span> (less than 24h)
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Across all age groups</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">9</div>
                    <p className="text-xs text-muted-foreground">From 5 different parents</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Overview of recent center activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {adminActivities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 rounded-lg border p-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activity.iconBg}`}>
                            {activity.icon}
                          </div>
                          <div className="grid gap-1">
                            <p className="font-medium">{activity.title}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Pending Tasks</CardTitle>
                    <CardDescription>Tasks requiring your attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingTasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 rounded-lg border p-3">
                          <div className="grid gap-1">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                          </div>
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Booking Requests</CardTitle>
                      <CardDescription>Manage incoming booking requests from parents</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                        <option value="all">All Requests</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookingRequests.map((request, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.parentAvatar} alt={request.parentName} />
                              <AvatarFallback>{request.parentName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{request.parentName}</p>
                              <p className="text-sm text-muted-foreground">{request.email}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              request.status === "Pending"
                                ? "outline"
                                : request.status === "Approved"
                                  ? "success"
                                  : "destructive"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div>
                            <p className="text-sm font-medium">Child</p>
                            <p className="text-sm">{request.childName}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Age Group</p>
                            <p className="text-sm">{request.ageGroup}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Requested Date</p>
                            <p className="text-sm">{request.date}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            Requested on {request.requestDate}
                            {request.status === "Pending" && (
                              <span className="ml-2 text-amber-500">{request.timeRemaining} remaining to respond</span>
                            )}
                          </p>
                          {request.status === "Pending" && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button variant="destructive" size="sm">
                                Reject
                              </Button>
                              <Button size="sm">Approve</Button>
                            </div>
                          )}
                          {request.status !== "Pending" && (
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Daily Reports</CardTitle>
                      <CardDescription>Create and manage daily reports for children</CardDescription>
                    </div>
                    <Button>Create New Report</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pending">
                    <TabsList className="mb-4">
                      <TabsTrigger value="pending">Pending Reports</TabsTrigger>
                      <TabsTrigger value="completed">Completed Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="space-y-4">
                      {pendingReports.map((report, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={report.childAvatar} alt={report.childName} />
                                <AvatarFallback>{report.childName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{report.childName}</p>
                                <p className="text-sm text-muted-foreground">{report.ageGroup}</p>
                              </div>
                            </div>
                            <Badge variant="outline">Due Today</Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-3">
                            <div>
                              <p className="text-sm font-medium">Parent</p>
                              <p className="text-sm">{report.parentName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Date</p>
                              <p className="text-sm">{report.date}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Assigned Teacher</p>
                              <p className="text-sm">{report.teacher}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <Button variant="outline">Fill Report Template</Button>
                            <Button>Create Report</Button>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="completed" className="space-y-4">
                      {completedReports.map((report, index) => (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={report.childAvatar} alt={report.childName} />
                                <AvatarFallback>{report.childName[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{report.childName}</p>
                                <p className="text-sm text-muted-foreground">{report.ageGroup}</p>
                              </div>
                            </div>
                            <Badge variant="success">Completed</Badge>
                          </div>
                          <div className="grid gap-2 md:grid-cols-3">
                            <div>
                              <p className="text-sm font-medium">Parent</p>
                              <p className="text-sm">{report.parentName}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Date</p>
                              <p className="text-sm">{report.date}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Completed By</p>
                              <p className="text-sm">{report.teacher}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-end gap-2">
                            <Button variant="outline">View Report</Button>
                            <Button variant="outline">Edit Report</Button>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Sample data
const adminActivities = [
  {
    icon: <CheckCircle className="h-5 w-5 text-white" />,
    iconBg: "bg-green-500",
    title: "Booking Request Approved",
    description: "You approved Emma Johnson's booking request for April 5",
    time: "10 minutes ago",
  },
  {
    icon: <XCircle className="h-5 w-5 text-white" />,
    iconBg: "bg-red-500",
    title: "Booking Request Rejected",
    description: "You rejected a booking due to no available slots",
    time: "1 hour ago",
  },
  {
    icon: <FileText className="h-5 w-5 text-white" />,
    iconBg: "bg-blue-500",
    title: "Daily Report Submitted",
    description: "Ms. Johnson submitted a daily report for Noah Williams",
    time: "2 hours ago",
  },
  {
    icon: <MessageSquare className="h-5 w-5 text-white" />,
    iconBg: "bg-purple-500",
    title: "New Message",
    description: "Sarah Johnson sent a message about Emma's allergies",
    time: "3 hours ago",
  },
]

const pendingTasks = [
  {
    title: "Approve/Reject 7 booking requests",
    dueDate: "Due in 24 hours",
    priority: "High",
  },
  {
    title: "Complete 5 daily reports",
    dueDate: "Due today by 5:00 PM",
    priority: "High",
  },
  {
    title: "Respond to 9 parent messages",
    dueDate: "Due in 48 hours",
    priority: "Medium",
  },
  {
    title: "Update available slots for next month",
    dueDate: "Due in 3 days",
    priority: "Low",
  },
]

const bookingRequests = [
  {
    parentName: "Sarah Johnson",
    parentAvatar: "/placeholder.svg?height=40&width=40",
    email: "sarah.johnson@example.com",
    childName: "Emma Johnson",
    ageGroup: "Toddler (2-3 years)",
    date: "April 5, 2025 - Full day",
    requestDate: "March 25, 2025",
    timeRemaining: "2 days",
    status: "Pending",
  },
  {
    parentName: "Michael Williams",
    parentAvatar: "/placeholder.svg?height=40&width=40",
    email: "michael.williams@example.com",
    childName: "Noah Williams",
    ageGroup: "Preschool (3-4 years)",
    date: "April 3, 2025 - Morning",
    requestDate: "March 24, 2025",
    timeRemaining: "1 day",
    status: "Pending",
  },
  {
    parentName: "Jennifer Thomas",
    parentAvatar: "/placeholder.svg?height=40&width=40",
    email: "jennifer.thomas@example.com",
    childName: "Ethan Thomas",
    ageGroup: "Infant (6-18 months)",
    date: "April 10, 2025 - Full day",
    requestDate: "March 26, 2025",
    timeRemaining: "3 days",
    status: "Pending",
  },
  {
    parentName: "David Anderson",
    parentAvatar: "/placeholder.svg?height=40&width=40",
    email: "david.anderson@example.com",
    childName: "Isabella Anderson",
    ageGroup: "Preschool (3-4 years)",
    date: "April 2, 2025 - Afternoon",
    requestDate: "March 23, 2025",
    status: "Approved",
  },
  {
    parentName: "Jessica Brown",
    parentAvatar: "/placeholder.svg?height=40&width=40",
    email: "jessica.brown@example.com",
    childName: "Olivia Brown",
    ageGroup: "Toddler (2-3 years)",
    date: "April 1, 2025 - Full day",
    requestDate: "March 22, 2025",
    status: "Rejected",
  },
]

const pendingReports = [
  {
    childName: "Emma Johnson",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "Sarah Johnson",
    ageGroup: "Toddler (2-3 years)",
    date: "March 26, 2025",
    teacher: "Ms. Garcia",
  },
  {
    childName: "Noah Williams",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "Michael Williams",
    ageGroup: "Preschool (3-4 years)",
    date: "March 26, 2025",
    teacher: "Mr. Davis",
  },
  {
    childName: "Olivia Brown",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "Jessica Brown",
    ageGroup: "Toddler (2-3 years)",
    date: "March 26, 2025",
    teacher: "Ms. Johnson",
  },
  {
    childName: "Ethan Thomas",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "Jennifer Thomas",
    ageGroup: "Infant (6-18 months)",
    date: "March 26, 2025",
    teacher: "Ms. Wilson",
  },
]

const completedReports = [
  {
    childName: "Isabella Anderson",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "David Anderson",
    ageGroup: "Preschool (3-4 years)",
    date: "March 25, 2025",
    teacher: "Ms. Garcia",
  },
  {
    childName: "Alexander Robinson",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "Robert Robinson",
    ageGroup: "Preschool (4-5 years)",
    date: "March 25, 2025",
    teacher: "Mr. Davis",
  },
  {
    childName: "Abigail Clark",
    childAvatar: "/placeholder.svg?height=40&width=40",
    parentName: "Elizabeth Clark",
    ageGroup: "Preschool (4-5 years)",
    date: "March 25, 2025",
    teacher: "Ms. Johnson",
  },
]

