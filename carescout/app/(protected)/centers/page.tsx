'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCenters } from '@/lib/services/centersService';
import Link from 'next/link';
import { toast } from 'sonner';

interface Center {
  id: string;
  name: string;
  address: string;
  rating?: number;
  openingHours?: string;
  description?: string;
  fees?: {
    hourly?: number;
    daily?: number;
    monthly?: number;
  };
  level?: string;
}

interface SearchFilters {
  location: string;
  maxFee: string;
  level: string;
}

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    maxFee: '',
    level: 'all'
  });

  useEffect(() => {
    loadCenters();
  }, []);

  useEffect(() => {
    filterCenters();
  }, [centers, filters]);

  const loadCenters = async () => {
    try {
      const data = await getCenters();
      setCenters(data);
      setFilteredCenters(data);
    } catch (error) {
      console.error('Failed to load centers:', error);
      toast.error('Failed to load care centers');
    } finally {
      setLoading(false);
    }
  };

  const filterCenters = () => {
    let filtered = [...centers];

    if (filters.location) {
      filtered = filtered.filter(center => 
        center.address.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.maxFee) {
      const maxFee = parseFloat(filters.maxFee);
      filtered = filtered.filter(center => 
        center.fees?.monthly && center.fees.monthly <= maxFee
      );
    }

    if (filters.level && filters.level !== 'all') {
      filtered = filtered.filter(center => 
        center.level === filters.level
      );
    }

    setFilteredCenters(filtered);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      maxFee: '',
      level: 'all'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading centers...</div>
      </div>
    );
  }

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Childcare Centers</h1>
      </div>
      <div className="container mx-auto p-6 h-[calc(100vh-4rem-4rem)]">
        {/* Search Filters */}
        <Card className="shadow-sm mb-6">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter location..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFee">Maximum Monthly Fee</Label>
                <Input
                  id="maxFee"
                  type="number"
                  placeholder="Enter max fee..."
                  value={filters.maxFee}
                  onChange={(e) => handleFilterChange('maxFee', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={filters.level}
                  onValueChange={(value) => handleFilterChange('level', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="infant">Infant Care</SelectItem>
                    <SelectItem value="toddler">Toddler Care</SelectItem>
                    <SelectItem value="preschool">Preschool</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredCenters.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No care centers found matching your criteria.</p>
            <Button onClick={resetFilters} variant="outline" className="mt-4">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCenters.map((center) => (
              <Card key={center.id} className="hover:shadow-sm transition-shadow duration-200">
                <CardHeader className="pb-2">
                  <CardTitle>{center.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{center.address}</p>
                  {center.rating && (
                    <p className="text-sm mb-2">Rating: {center.rating}/5</p>
                  )}
                  {center.openingHours && (
                    <p className="text-sm mb-2">Hours: {center.openingHours}</p>
                  )}
                  {center.fees?.monthly && (
                    <p className="text-sm mb-4">Monthly Fee: ${center.fees.monthly}</p>
                  )}
                  <Button asChild className="w-full">
                    <Link href={`/centers/${center.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 