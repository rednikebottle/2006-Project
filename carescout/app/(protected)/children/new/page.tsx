'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createChild } from '@/lib/services/childrenService';
import { toast } from 'sonner';

interface NewChild {
  name: string;
  age: number;
  gender: string;
  allergies?: string[];
  medicalConditions?: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function NewChildPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [child, setChild] = useState<NewChild>({
    name: '',
    age: 0,
    gender: '',
    allergies: [],
    medicalConditions: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const validateForm = () => {
    if (!child.name.trim()) {
      toast.error('Please enter the child\'s name');
      return false;
    }
    if (child.age < 0 || child.age > 18) {
      toast.error('Age must be between 0 and 18');
      return false;
    }
    if (!child.gender.trim()) {
      toast.error('Please enter the child\'s gender');
      return false;
    }
    if (!child.emergencyContact.name.trim()) {
      toast.error('Please enter emergency contact name');
      return false;
    }
    if (!child.emergencyContact.phone.trim()) {
      toast.error('Please enter emergency contact phone');
      return false;
    }
    if (!child.emergencyContact.relationship.trim()) {
      toast.error('Please enter emergency contact relationship');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const trimmedChild = {
        ...child,
        name: child.name.trim(),
        gender: child.gender.trim(),
        emergencyContact: {
          name: child.emergencyContact.name.trim(),
          phone: child.emergencyContact.phone.trim(),
          relationship: child.emergencyContact.relationship.trim()
        }
      };
      
      await createChild(trimmedChild);
      toast.success('Child created successfully');
      router.push('/children');
    } catch (error: any) {
      console.error('Failed to create child:', error);
      toast.error(error.message || 'Failed to create child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Add New Child</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={child.name}
            onChange={(e) => setChild({ ...child, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="18"
            value={child.age || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? 0 : Math.min(Math.max(parseInt(e.target.value), 0), 18);
              setChild({ ...child, age: value });
            }}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            value={child.gender}
            onChange={(e) => setChild({ ...child, gender: e.target.value })}
            required
            disabled={loading}
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
            disabled={loading}
            placeholder="e.g. Peanuts, Milk, Eggs"
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
            disabled={loading}
            placeholder="e.g. Asthma, Diabetes"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Emergency Contact</h3>
          
          <div className="space-y-2">
            <Label htmlFor="ecName">Name</Label>
            <Input
              id="ecName"
              value={child.emergencyContact.name}
              onChange={(e) => setChild({ 
                ...child, 
                emergencyContact: {
                  ...child.emergencyContact,
                  name: e.target.value
                }
              })}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecPhone">Phone</Label>
            <Input
              id="ecPhone"
              value={child.emergencyContact.phone}
              onChange={(e) => setChild({ 
                ...child, 
                emergencyContact: {
                  ...child.emergencyContact,
                  phone: e.target.value
                }
              })}
              required
              disabled={loading}
              type="tel"
              placeholder="e.g. +1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecRelationship">Relationship</Label>
            <Input
              id="ecRelationship"
              value={child.emergencyContact.relationship}
              onChange={(e) => setChild({ 
                ...child, 
                emergencyContact: {
                  ...child.emergencyContact,
                  relationship: e.target.value
                }
              })}
              required
              disabled={loading}
              placeholder="e.g. Parent, Guardian, Relative"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/children')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Child'}
          </Button>
        </div>
      </form>
    </div>
  );
} 