<script lang="ts">
  import { updateCode } from '$/util/state';
  import { Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import SparkIcon from '~icons/material-symbols/autofps-select-rounded';

  let prompt = $state('');
  let loading = $state(false);
  let error = $state('');

  async function generateDiagram() {
    if (!prompt.trim()) return;

    loading = true;
    error = '';

    try {
      const res = await fetch('/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error || 'Failed to generate diagram';
        return;
      }

      updateCode(data.code, { updateDiagram: true });
      prompt = '';
    } catch {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateDiagram();
    }
  }
</script>

<Dialog.Root>
  <Dialog.Trigger class="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
    <SparkIcon class="size-4" />
    <span>AI Playground</span>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        <SparkIcon class="size-5 text-indigo-600" />
        AI Playground
      </Dialog.Title>
      <Dialog.Description>
        Describe what you want to create and AI will generate the Mermaid diagram code.
      </Dialog.Description>
    </Dialog.Header>

    <div class="flex flex-col gap-4 py-4">
      <div class="flex flex-col gap-2">
        <label for="prompt" class="text-sm font-medium">Describe your diagram</label>
        <textarea
          id="prompt"
          bind:value={prompt}
          onkeydown={handleKeydown}
          placeholder="e.g., A flowchart showing user registration process with validation"
          class="min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        ></textarea>
      </div>

      {#if error}
        <div class="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
      {/if}

      <Button onclick={generateDiagram} disabled={loading || !prompt.trim()}>
        {#if loading}
          Generating...
        {:else}
          Generate Diagram
        {/if}
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
