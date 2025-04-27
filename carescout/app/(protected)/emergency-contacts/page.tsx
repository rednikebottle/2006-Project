"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from '@/lib/auth/authService';
import { toast } from "@/components/ui/use-toast";

interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState<string | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "",
    phoneNumber: ""
  });

  // Fetch contacts on component mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view emergency contacts.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('http://localhost:3001/api/emergency-contacts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load emergency contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    try {
      const token = await getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to add contacts.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('http://localhost:3001/api/emergency-contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add contact');
      }

      const addedContact = await response.json();
      setContacts(prev => [addedContact, ...prev]);
    setIsAddingContact(false);
      setNewContact({ name: "", relationship: "", phoneNumber: "" });
      
      toast({
        title: "Success",
        description: "Emergency contact added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateContact = async (contactId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to update contacts.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:3001/api/emergency-contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update contact');
      }

      const updatedContact = await response.json();
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, ...updatedContact } : contact
      ));
      setIsEditingContact(null);
      setNewContact({ name: "", relationship: "", phoneNumber: "" });
      
      toast({
        title: "Success",
        description: "Emergency contact updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to delete contacts.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`http://localhost:3001/api/emergency-contacts/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete contact');
      }

      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      toast({
        title: "Success",
        description: "Emergency contact deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  };

  const startEdit = (contact: EmergencyContact) => {
    setNewContact({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber
    });
    setIsEditingContact(contact.id);
  };

  return (
    <>
      <div className="h-16 bg-primary flex items-center px-6">
        <h1 className="text-2xl font-bold text-primary-foreground">Emergency Contacts</h1>
      </div>
      <div className="container mx-auto p-6 h-[calc(100vh-4rem-4rem)]">
        <div className="space-y-6 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">My Emergency Contacts</h1>
            <Button onClick={() => {
              setNewContact({ name: "", relationship: "", phoneNumber: "" });
              setIsAddingContact(true);
            }}>Add Contact</Button>
            <Dialog open={isAddingContact} onOpenChange={(open) => {
              if (!open) {
                setNewContact({ name: "", relationship: "", phoneNumber: "" });
              }
              setIsAddingContact(open);
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Contact name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Parent, Sibling, Friend"
                      value={newContact.relationship}
                      onChange={(e) =>
                        setNewContact({ ...newContact, relationship: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+65 XXXX XXXX"
                      value={newContact.phoneNumber}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phoneNumber: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => {
                    setIsAddingContact(false);
                    setNewContact({ name: "", relationship: "", phoneNumber: "" });
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddContact}>Add Contact</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading emergency contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No emergency contacts added yet. Add your first contact using the button above.
            </div>
          ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-1">
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                      <p className="text-sm">{contact.phoneNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Added on {new Date(contact.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                  </div>
                  <div className="flex gap-2">
                      <Dialog open={isEditingContact === contact.id} onOpenChange={(open) => {
                        if (!open) {
                          setNewContact({ name: "", relationship: "", phoneNumber: "" });
                          setIsEditingContact(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" onClick={() => startEdit(contact)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Emergency Contact</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Name</Label>
                              <Input
                                id="edit-name"
                                value={newContact.name}
                                onChange={(e) =>
                                  setNewContact({ ...newContact, name: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-relationship">Relationship</Label>
                              <Input
                                id="edit-relationship"
                                value={newContact.relationship}
                                onChange={(e) =>
                                  setNewContact({ ...newContact, relationship: e.target.value })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-phone">Phone Number</Label>
                              <Input
                                id="edit-phone"
                                value={newContact.phoneNumber}
                                onChange={(e) =>
                                  setNewContact({ ...newContact, phoneNumber: e.target.value })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => {
                              setIsEditingContact(null);
                              setNewContact({ name: "", relationship: "", phoneNumber: "" });
                            }}>
                              Cancel
                            </Button>
                            <Button onClick={() => handleUpdateContact(contact.id)}>
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        Remove
                      </Button>
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