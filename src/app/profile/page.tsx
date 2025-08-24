
'use client';

import { useState, FormEvent, useContext } from 'react';
import { updatePassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/page-header';
import { AppContext } from '@/contexts/app-provider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useContext(AppContext);

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!user) {
        setError('You must be logged in to change your password.');
        return;
    }

    setLoading(true);
    try {
      await updatePassword(user, newPassword);
      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      setError(error.message || 'Failed to update password. You may need to log in again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
        <PageHeader title="User Profile" />
        <Card className="max-w-2xl">
            <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
                Enter a new password below to update your credentials.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                    id="new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                </div>
                 <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                </div>
                 {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
                </Button>
            </form>
            </CardContent>
        </Card>
    </div>
  );
}
