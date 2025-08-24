
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddUserDialog } from '@/components/user/add-user-dialog';

// Mock data for users
const users = [
  {
    id: 'usr-001',
    name: 'Administrator',
    email: 'admin@gudang.com',
    role: 'admin',
    status: 'Active',
    lastLogin: '2023-10-27T10:00:00Z',
  },
  {
    id: 'usr-002',
    name: 'Warehouse Staff',
    email: 'user@gudang.com',
    role: 'user',
    status: 'Active',
    lastLogin: '2023-10-27T11:30:00Z',
  },
  {
    id: 'usr-003',
    name: 'Jane Doe',
    email: 'jane.d@gudang.com',
    role: 'user',
    status: 'Inactive',
    lastLogin: '2023-09-15T08:00:00Z',
  },
];

export default function UserManagementPage() {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  // In a real app, you would fetch and update users.
  // For now, we just log the new user.
  const handleUserAdded = (newUser: any) => {
    console.log('New user would be added:', newUser);
    // Here you would typically refresh the user list from your backend.
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="User Management">
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </PageHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'secondary' : 'outline'}
                     className={user.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Deactivate User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddUserDialog 
        isOpen={isAddUserDialogOpen}
        setIsOpen={setIsAddUserDialogOpen}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
