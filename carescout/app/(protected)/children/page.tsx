"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Child, getChildren, deleteChild, createChild } from '@/lib/services/childrenService';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

export default function ChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingChild, setIsAddingChild] = useState(false);

  const [newChild, setNewChild] = useState({
    name: "",
    age: "",
    gender: "",
    allergies: "",
    medicalConditions: ""
  });

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const data = await getChildren();
      setChildren(data || []);
    } catch (error) {
      console.error('Failed to load children:', error);
      toast({
        title: "Error",
        description: "Failed to load children",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      toast({
        title: "Error",
        description: "Invalid child ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteChild(id);
      setChildren(children.filter(child => child.id !== id));
      toast({
        title: "Success",
        description: "Child deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete child:', error);
      toast({
        title: "Error",
        description: "Failed to delete child",
        variant: "destructive",
      });
    }
  };

  const handleCreateChild = async () => {
    try {
      const childData = {
        name: newChild.name,
        age: parseInt(newChild.age),
        gender: newChild.gender,
        allergies: newChild.allergies ? newChild.allergies.split(',').map(a => a.trim()) : [],
        medicalConditions: newChild.medicalConditions ? newChild.medicalConditions.split(',').map(m => m.trim()) : []
      };

      const createdChild = await createChild(childData);
      setChildren([...children, createdChild]);
      setIsAddingChild(false);
      setNewChild({
        name: "",
        age: "",
        gender: "",
        allergies: "",
        medicalConditions: ""
      });

      toast({
        title: "Success",
        description: "Child added successfully",
      });
    } catch (error) {
      console.error("Error creating child:", error);
      toast({
        title: "Error",
        description: "Failed to create child. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Children</h1>
      </div>
      <div className="container mx-auto p-6 h-[calc(100vh-4rem-4rem)]">
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
            <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Child</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newChild.name}
                      onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                      placeholder="Enter child's name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="0"
                      max="18"
                      value={newChild.age}
                      onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                      placeholder="Enter child's age"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={newChild.gender}
                      onValueChange={(value) => setNewChild({ ...newChild, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="allergies">Allergies (Optional)</Label>
                    <Input
                      id="allergies"
                      value={newChild.allergies}
                      onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
                      placeholder="List any allergies"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
                    <Input
                      id="medicalConditions"
                      value={newChild.medicalConditions}
                      onChange={(e) => setNewChild({ ...newChild, medicalConditions: e.target.value })}
                      placeholder="List any medical conditions"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsAddingChild(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateChild}>Add Child</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No children added yet</p>
              <Dialog open={isAddingChild} onOpenChange={setIsAddingChild}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Child
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Child</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newChild.name}
                        onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                        placeholder="Enter child's name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        min="0"
                        max="18"
                        value={newChild.age}
                        onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                        placeholder="Enter child's age"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={newChild.gender}
                        onValueChange={(value) => setNewChild({ ...newChild, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="allergies">Allergies (Optional)</Label>
                      <Input
                        id="allergies"
                        value={newChild.allergies}
                        onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
                        placeholder="List any allergies"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="medicalConditions">Medical Conditions (Optional)</Label>
                      <Input
                        id="medicalConditions"
                        value={newChild.medicalConditions}
                        onChange={(e) => setNewChild({ ...newChild, medicalConditions: e.target.value })}
                        placeholder="List any medical conditions"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddingChild(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateChild}>Add Child</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{child.name}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => child.id && router.push(`/children/${child.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => child.id && handleDelete(child.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Age:</strong> {child.age}</p>
                      <p><strong>Gender:</strong> {child.gender}</p>
                      {child.allergies && child.allergies.length > 0 && (
                        <p><strong>Allergies:</strong> {child.allergies.join(', ')}</p>
                      )}
                      {child.medicalConditions && child.medicalConditions.length > 0 && (
                        <p><strong>Medical Conditions:</strong> {child.medicalConditions.join(', ')}</p>
                      )}
                      {child.emergencyContact && (
                        <div className="mt-4">
                          <p className="font-medium mb-1">Emergency Contact:</p>
                          <p>{child.emergencyContact.name}</p>
                          <p>{child.emergencyContact.phone}</p>
                          <p>{child.emergencyContact.relationship}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 