
'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface AddUserDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUserAdded: (user: any) => void;
}

export function AddUserDialog({ isOpen, setIsOpen, onUserAdded }: AddUserDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!name || !email || !password) {
        toast({
            title: 'Error',
            description: 'Please fill all fields.',
            variant: 'destructive',
        });
        setLoading(false);
        return;
    }
    
    // In a real app, you'd want more robust password validation.
    // Also, you'd need to handle role assignment via custom claims on a backend.
    // For this prototype, we'll just check if the email implies an admin role.
    const assignedRole = email.startsWith('admin') ? 'admin' : 'user';

    if (role === 'admin' && !email.startsWith('admin')) {
       toast({
            title: 'Info',
            description: 'To create an admin, the email must start with "admin". The role has been set to "user".',
        });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = {
        uid: userCredential.user.uid,
        name,
        email,
        role: assignedRole,
      };
      
      onUserAdded(newUser);

      toast({
        title: 'User Created',
        description: `User ${name} has been successfully created.`,
      });
      setIsOpen(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (error: any) {
      let errorMessage = 'Failed to create user.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use by another account.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. It should be at least 6 characters.';
      }
       console.error('Error creating user:', error);
       toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. The role will be automatically assigned based on email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="col-span-3"
                placeholder="Full Name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="user@example.com"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="6+ characters"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
               <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
