'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Child, getChild, updateChild } from '@/lib/services/childrenService';
import { toast } from '@/components/ui/use-toast';

function EditChildForm() {
  const router = useRouter();
  const params = useParams();
  const childId = params?.id as string;
  const [child, setChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChild();
    }
  }, [childId]);

  const loadChild = async () => {
    if (!childId) return;
    
    try {
      const data = await getChild(childId);
      setChild(data);
    } catch (error) {
      console.error('Failed to load child:', error);
      toast({
        title: "Error",
        description: "Failed to load child",
        variant: "destructive",
      });
      router.push('/children');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!child || !childId) return;

    try {
      await updateChild(childId, child);
      toast({
        title: "Success",
        description: "Child updated successfully",
      });
      router.push('/children');
    } catch (error) {
      console.error('Failed to update child:', error);
      toast({
        title: "Error",
        description: "Failed to update child",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!child) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Edit Child</h1>
      
      <form onSubmit={handleUpdate} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={child.name}
            onChange={(e) => setChild({ ...child, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={child.age}
            onChange={(e) => setChild({ ...child, age: parseInt(e.target.value) })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            value={child.gender}
            onChange={(e) => setChild({ ...child, gender: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies (comma-separated)</Label>
          <Input
            id="allergies"
            value={child.allergies?.join(', ') || ''}
            onChange={(e) => setChild({ 
              ...child, 
              allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions (comma-separated)</Label>
          <Input
            id="medicalConditions"
            value={child.medicalConditions?.join(', ') || ''}
            onChange={(e) => setChild({ 
              ...child, 
              medicalConditions: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
            })}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Emergency Contact</h3>
          
          <div className="space-y-2">
            <Label htmlFor="ecName">Name</Label>
            <Input
              id="ecName"
              value={child.emergencyContact?.name || ''}
              onChange={(e) => setChild({ 
                ...child, 
                emergencyContact: {
                  name: e.target.value,
                  phone: child.emergencyContact?.phone || '',
                  relationship: child.emergencyContact?.relationship || ''
                }
              })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecPhone">Phone</Label>
            <Input
              id="ecPhone"
              value={child.emergencyContact?.phone || ''}
              onChange={(e) => setChild({ 
                ...child, 
                emergencyContact: {
                  name: child.emergencyContact?.name || '',
                  phone: e.target.value,
                  relationship: child.emergencyContact?.relationship || ''
                }
              })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecRelationship">Relationship</Label>
            <Input
              id="ecRelationship"
              value={child.emergencyContact?.relationship || ''}
              onChange={(e) => setChild({ 
                ...child, 
                emergencyContact: {
                  name: child.emergencyContact?.name || '',
                  phone: child.emergencyContact?.phone || '',
                  relationship: e.target.value
                }
              })}
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.push('/children')}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

export default function EditChildPage() {
  return (
    <div className="p-6">
      <EditChildForm />
    </div>
  );
} 