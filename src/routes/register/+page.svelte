<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import { authUser } from '$lib/stores/auth';

  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleRegister(e: Event) {
    e.preventDefault();
    error = '';

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters';
      return;
    }

    loading = true;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Registration failed';
        return;
      }

      authUser.set(data.user);
      await goto('/');
    } catch {
      error = 'An error occurred. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-indigo-600">Create Account</h1>
      <p class="mt-2 text-gray-600">Sign up to start creating diagrams</p>
    </div>

    <form onsubmit={handleRegister} class="space-y-6">
      {#if error}
        <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      {/if}

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <Input
          id="email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          required
          class="mt-1" />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <Input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          class="mt-1" />
      </div>

      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700"
          >Confirm Password</label>
        <Input
          id="confirmPassword"
          type="password"
          bind:value={confirmPassword}
          placeholder="••••••••"
          required
          class="mt-1" />
      </div>

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>

    <p class="text-center text-sm text-gray-600">
      Already have an account? <a href="/login" class="text-indigo-600 hover:underline">Sign in</a>
    </p>
  </div>
</div>
