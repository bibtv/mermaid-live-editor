<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import { authUser, fetchUser } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  interface Diagram {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
  }

  let diagrams = $state<Diagram[]>([]);
  let loading = $state(true);
  let newTitle = $state('');
  let creating = $state(false);

  onMount(async () => {
    await fetchUser();
    if (!$authUser) {
      goto('/login');
      return;
    }
    await loadDiagrams();
  });

  async function loadDiagrams() {
    loading = true;
    try {
      const res = await fetch('/api/diagrams');
      if (res.ok) {
        diagrams = await res.json();
      }
    } catch (err) {
      console.error('Failed to load diagrams:', err);
    } finally {
      loading = false;
    }
  }

  async function createDiagram(e: Event) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    creating = true;
    try {
      const res = await fetch('/api/diagrams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: 'graph TD\n    A[Start] --> B[End]'
        })
      });

      if (res.ok) {
        const diagram = await res.json();
        goto(`/edit?id=${diagram.id}`);
      }
    } catch (err) {
      console.error('Failed to create diagram:', err);
    } finally {
      creating = false;
    }
  }

  async function deleteDiagram(id: number, e: Event) {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this diagram?')) return;

    try {
      await fetch(`/api/diagrams/${id}`, { method: 'DELETE' });
      diagrams = diagrams.filter((d) => d.id !== id);
    } catch (err) {
      console.error('Failed to delete diagram:', err);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
</script>

<div class="container mx-auto max-w-4xl p-8">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-bold text-indigo-600">My Diagrams</h1>
    <form onsubmit={createDiagram} class="flex gap-2">
      <Input bind:value={newTitle} placeholder="New diagram title..." class="w-64" />
      <Button type="submit" disabled={creating || !newTitle.trim()}>
        {creating ? 'Creating...' : 'New Diagram'}
      </Button>
    </form>
  </div>

  {#if loading}
    <div class="text-center text-gray-500">Loading diagrams...</div>
  {:else if diagrams.length === 0}
    <div class="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
      <p class="text-lg text-gray-600">No diagrams yet</p>
      <p class="mt-2 text-sm text-gray-500">Create your first diagram to get started</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each diagrams as diagram (diagram.id)}
        <div
          class="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
          <div class="flex-1">
            <a
              href="/edit?id={diagram.id}"
              class="text-lg font-medium text-indigo-600 hover:underline">
              {diagram.title}
            </a>
            <p class="mt-1 text-sm text-gray-500">
              Updated {formatDate(diagram.updatedAt)}
            </p>
          </div>
          <div class="flex gap-2">
            <Button variant="ghost" size="sm" onclick={() => goto(`/edit?id=${diagram.id}`)}>
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              class="text-red-600 hover:text-red-700"
              onclick={(e) => deleteDiagram(diagram.id, e)}>
              Delete
            </Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
