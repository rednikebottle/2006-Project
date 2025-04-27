"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getToken } from '@/lib/auth/authService';
import { format } from 'date-fns';

interface Activity {
  name: string;
  completed: boolean;
  notes: string;
}

interface Meal {
  name: string;
  completed: boolean;
  notes: string;
}

interface NapTime {
  start: string;
  end: string;
  duration: string;
}

interface Report {
  id: string;
  childId: string;
  childName: string;
  centerName: string;
  date: string;
  activities: Activity[];
  meals: Meal[];
  napTimes: NapTime[];
  teacherNotes: string;
  mood: string;
  createdAt: string;
}

interface ChildReport {
  childId: string;
  childName: string;
  latestReport: Report;
}

export default function ReportsPage() {
  const [childReports, setChildReports] = useState<ChildReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');

        // Example data for Emma
        const exampleReport: ChildReport = {
          childId: 'child-example',
          childName: 'Dhruv',
          latestReport: {
            id: 'report-1',
            childId: 'child-example',
            childName: 'Dhruv',
            centerName: 'MONTESSORI @ GRACELAND PTE LTD',
            date: new Date().toISOString(),
            activities: [
              {
                name: 'Morning Circle Time',
                completed: true,
                notes: 'Participated enthusiastically in group discussions'
              },
              {
                name: 'Arts and Crafts',
                completed: true,
                notes: 'Created a beautiful finger painting'
              },
              {
                name: 'Outdoor Play',
                completed: true,
                notes: 'Enjoyed playing in the sandbox and on the swings'
              },
              {
                name: 'Story Time',
                completed: true,
                notes: 'Showed great interest in the story and asked questions'
              },
              {
                name: 'Music and Movement',
                completed: true,
                notes: 'Participated in singing and dancing activities'
              }
            ],
            meals: [
              {
                name: 'Breakfast',
                completed: true,
                notes: 'Ate all of their oatmeal with fruits'
              },
              {
                name: 'Morning Snack',
                completed: true,
                notes: 'Had apple slices and water'
              },
              {
                name: 'Lunch',
                completed: true,
                notes: 'Enjoyed chicken with vegetables'
              },
              {
                name: 'Afternoon Snack',
                completed: true,
                notes: 'Had yogurt with granola'
              }
            ],
            napTimes: [
              {
                start: '13:00',
                end: '14:30',
                duration: '1.5 hours'
              }
            ],
            teacherNotes: 'Your child had a wonderful day! They were very engaged in all activities and played well with their friends. Their social skills continue to improve, and they\'re showing great progress in their communication.',
            mood: 'Happy and energetic throughout the day',
            createdAt: new Date().toISOString()
          }
        };

        // Fetch real reports from the API
        const response = await fetch('/api/reports/children', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.warn('Failed to fetch real reports:', await response.text());
          // If API call fails, still show Emma's example data
          setChildReports([exampleReport]);
          return;
        }

        const realReports = await response.json() as { [childId: string]: Report[] };
        
        // Convert the reports object into our ChildReport format
        const formattedReports: ChildReport[] = Object.entries(realReports).map(([childId, reports]) => ({
          childId,
          childName: reports[0].childName,
          latestReport: reports[0] // reports are already sorted by date in backend
        }));

        // Combine real reports with Emma's example
        setChildReports([...formattedReports, exampleReport]);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (childReports.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p>No reports available. Reports will be available after completed bookings.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Daily Reports</h1>
      </div>
      <div className="container mx-auto p-6 h-[calc(100vh-4rem-4rem)]">
        <Tabs defaultValue={childReports[0].childId}>
          <TabsList className="mb-4">
            {childReports.map(child => (
              <TabsTrigger key={child.childId} value={child.childId}>
                {child.childName}
              </TabsTrigger>
            ))}
          </TabsList>

          {childReports.map(child => (
            <TabsContent key={child.childId} value={child.childId}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl">{child.childName}'s Daily Report</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(child.latestReport.date), 'PPP')}
                      </p>
                    </div>
                    <Badge variant="outline">{child.latestReport.centerName}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Activities */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Activities</h3>
                      <div className="grid gap-3">
                        {child.latestReport.activities.map((activity, index) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{activity.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{activity.notes}</p>
                              </div>
                              <Badge variant={activity.completed ? "default" : "secondary"}>
                                {activity.completed ? "Completed" : "Not Completed"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Meals */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Meals</h3>
                      <div className="grid gap-3">
                        {child.latestReport.meals.map((meal, index) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{meal.notes}</p>
                              </div>
                              <Badge variant={meal.completed ? "default" : "secondary"}>
                                {meal.completed ? "Eaten" : "Not Eaten"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Nap Times */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Nap Times</h3>
                      <div className="grid gap-3">
                        {child.latestReport.napTimes.map((nap, index) => (
                          <div key={index} className="bg-muted p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">Duration: {nap.duration}</p>
                                <p className="text-sm text-muted-foreground">
                                  {nap.start} - {nap.end}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Teacher Notes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Teacher Notes</h3>
                      <div className="bg-muted p-3 rounded-lg">
                        <p>{child.latestReport.teacherNotes}</p>
                      </div>
                    </div>

                    {/* Mood */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Overall Mood</h3>
                      <div className="bg-muted p-3 rounded-lg">
                        <p>{child.latestReport.mood}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
} 