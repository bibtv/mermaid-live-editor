<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import { authUser } from '$lib/stores/auth';

  let email = $state('');
  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  async function handleLogin(e: Event) {
    e.preventDefault();
    error = '';
    loading = true;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Login failed';
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
      <h1 class="text-3xl font-bold text-indigo-600">Welcome Back</h1>
      <p class="mt-2 text-gray-600">Sign in to your account</p>
    </div>

    <form onsubmit={handleLogin} class="space-y-6">
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

      <Button type="submit" class="w-full" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>

    <p class="text-center text-sm text-gray-600">
      Don't have an account? <a href="/register" class="text-indigo-600 hover:underline">Sign up</a>
    </p>
  </div>
</div>
