import { redirect } from 'next/navigation';

export default function Root() {
  // Redirect to dashboard (will check auth and redirect to login if needed)
  redirect('/dashboard');
}
