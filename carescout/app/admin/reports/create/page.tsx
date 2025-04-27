"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CreateReportPage() {
  const [selectedChild, setSelectedChild] = useState("")
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0])
  const [activities, setActivities] = useState("")
  const [meals, setMeals] = useState("")
  const [naps, setNaps] = useState("")
  const [notes, setNotes] = useState("")
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Report submitted:", { selectedChild, reportDate, activities, meals, naps, notes })
    setReportSubmitted(true)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/dashboard" className="inline-flex items-center text-primary hover:underline">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Daily Report</CardTitle>
          <CardDescription>Fill out the daily report for a child in your care</CardDescription>
        </CardHeader>
        <CardContent>
          {!reportSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="child">Select Child</Label>
                  <select
                    id="child"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    required
                  >
                    <option value="">Select a child</option>
                    <option value="emma">Emma Johnson</option>
                    <option value="noah">Noah Williams</option>
                    <option value="olivia">Olivia Brown</option>
                    <option value="ethan">Ethan Thomas</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Report Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="meals">Meals</TabsTrigger>
                  <TabsTrigger value="naps">Naps</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="activities" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="activities">Activities</Label>
                    <Textarea
                      id="activities"
                      placeholder="List the activities the child participated in today. Include duration and level of engagement."
                      className="min-h-[200px]"
                      value={activities}
                      onChange={(e) => setActivities(e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Activity Examples:</p>
                    <ul className="ml-5 mt-2 list-disc space-y-1 text-muted-foreground">
                      <li>Morning circle time (15 minutes)</li>
                      <li>Art class - Painting with watercolors (30 minutes)</li>
                      <li>Outdoor play - Playground activities (45 minutes)</li>
                      <li>Story time - Read "The Very Hungry Caterpillar" (20 minutes)</li>
                      <li>Free play with blocks and puzzles (40 minutes)</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="meals" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="meals">Meals & Snacks</Label>
                    <Textarea
                      id="meals"
                      placeholder="Describe what the child ate today and how much they consumed."
                      className="min-h-[200px]"
                      value={meals}
                      onChange={(e) => setMeals(e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Meal Examples:</p>
                    <ul className="ml-5 mt-2 list-disc space-y-1 text-muted-foreground">
                      <li>Morning snack: Apple slices and crackers (Ate most)</li>
                      <li>Lunch: Pasta with vegetables and chicken (Ate half)</li>
                      <li>Afternoon snack: Yogurt with berries (Ate all)</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="naps" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="naps">Nap Times</Label>
                    <Textarea
                      id="naps"
                      placeholder="Record when the child napped and for how long."
                      className="min-h-[200px]"
                      value={naps}
                      onChange={(e) => setNaps(e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Nap Examples:</p>
                    <ul className="ml-5 mt-2 list-disc space-y-1 text-muted-foreground">
                      <li>12:30 PM - 2:15 PM (1 hour 45 minutes)</li>
                      <li>Fell asleep quickly and woke up refreshed</li>
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="notes" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Teacher's Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional observations, achievements, or concerns about the child's day."
                      className="min-h-[200px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      required
                    />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Note Examples:</p>
                    <ul className="ml-5 mt-2 list-disc space-y-1 text-muted-foreground">
                      <li>
                        Emma had a great day today! She was very engaged during art class and created a beautiful
                        painting.
                      </li>
                      <li>
                        She played well with her friends during free play and helped clean up without being prompted.
                      </li>
                      <li>She's showing improvement in her fine motor skills when using scissors.</li>
                      <li>
                        Please note that Emma mentioned having a slight headache after lunch, but it seemed to resolve
                        after her nap.
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  <p>This report will be sent to the child's parents once submitted.</p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Submit Report
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-medium">Report Successfully Submitted!</h3>
              <p className="mx-auto max-w-md text-muted-foreground">
                The daily report has been submitted and will be available for the parent to view. They will receive a
                notification about the new report.
              </p>
              <div className="mx-auto mt-6 max-w-md rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Child" />
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedChild === "emma"
                        ? "Emma Johnson"
                        : selectedChild === "noah"
                          ? "Noah Williams"
                          : selectedChild === "olivia"
                            ? "Olivia Brown"
                            : "Ethan Thomas"}
                    </p>
                    <p className="text-sm text-muted-foreground">Report Date: {reportDate}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link href="/admin/dashboard">Return to Dashboard</Link>
                </Button>
                <Button onClick={() => setReportSubmitted(false)}>Create Another Report</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

