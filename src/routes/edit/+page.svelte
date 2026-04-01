<script lang="ts">
  import type { PageData } from './$types';
  import Actions from '$/components/Actions.svelte';
  import Card from '$/components/Card/Card.svelte';
  import DiagramDocButton from '$/components/DiagramDocumentationButton.svelte';
  import Editor from '$/components/Editor.svelte';
  import History from '$/components/History/History.svelte';
  import McWrapper from '$/components/McWrapper.svelte';
  import MermaidChartIcon from '$/components/MermaidChartIcon.svelte';
  import EditorChooserModal from '$/components/migration/EditorChooserModal.svelte';
  import Navbar from '$/components/Navbar.svelte';
  import PanZoomToolbar from '$/components/PanZoomToolbar.svelte';
  import Preset from '$/components/Preset.svelte';
  import Share from '$/components/Share.svelte';
  import SyncRoughToolbar from '$/components/SyncRoughToolbar.svelte';
  import { Button } from '$/components/ui/button';
  import * as Resizable from '$/components/ui/resizable';
  import { Switch } from '$/components/ui/switch';
  import { Toggle } from '$/components/ui/toggle';
  import VersionSecurityToolbar from '$/components/VersionSecurityToolbar.svelte';
  import View from '$/components/View.svelte';
  import type { EditorMode, Tab } from '$/types';
  import { shouldShowEditorChooser } from '$/util/migration/domainMigration';
  import { PanZoomState } from '$/util/panZoom';
  import { stateStore, updateCodeStore, urlsStore } from '$/util/state';
  import { logEvent, logMermaidChartClick } from '$/util/stats';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';
  import { authUser, fetchUser } from '$lib/stores/auth';
  import { debounce } from 'lodash-es';
  import CodeIcon from '~icons/custom/code';
  import HistoryIcon from '~icons/material-symbols/history';
  import GearIcon from '~icons/material-symbols/settings-outline-rounded';

  let { data }: { data: PageData } = $props();

  const panZoomState = new PanZoomState();

  const tabSelectHandler = (tab: Tab) => {
    const editorMode: EditorMode = tab.id === 'code' ? 'code' : 'config';
    updateCodeStore({ editorMode });
  };

  const editorTabs: Tab[] = [
    {
      icon: CodeIcon,
      id: 'code',
      title: 'Code'
    },
    {
      icon: GearIcon,
      id: 'config',
      title: 'Config'
    }
  ];

  let width = $state(0);
  let isMobile = $derived(width < 640);
  let isViewMode = $state(true);
  let showEditorChooser = $state(false);
  let saveStatus = $state<'saved' | 'saving' | 'unsaved' | null>(null);
  let diagramId = $state<number | null>(data.diagram?.id ?? null);

  async function saveDiagram() {
    if (!diagramId || !$authUser) return;

    const state = $stateStore;
    saveStatus = 'saving';
    try {
      await fetch(`/api/diagrams/${diagramId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.diagram?.title ?? 'Untitled',
          content: state.code
        })
      });
      saveStatus = 'saved';
    } catch (err) {
      console.error('Failed to save:', err);
      saveStatus = 'unsaved';
    }
  }

  const debouncedSave = debounce(saveDiagram, 2000);

  $effect(() => {
    if (data.diagram?.content) {
      updateCodeStore({ code: data.diagram.content });
    }
  });

  onMount(async () => {
    showEditorChooser = shouldShowEditorChooser();
    await initHandler();
    await fetchUser();
    window.addEventListener('appinstalled', () => {
      logEvent('pwaInstalled', { isMobile });
    });
  });

  $effect(() => {
    const code = $stateStore.code;
    if (diagramId && data.diagram?.content && code !== data.diagram.content) {
      saveStatus = 'unsaved';
      debouncedSave();
    }
  });

  let isHistoryOpen = $state(false);

  let editorPane: Resizable.Pane | undefined;
  $effect(() => {
    if (isMobile) {
      editorPane?.resize(50);
    }
  });
</script>

<div class="flex h-full flex-col overflow-hidden">
  {#snippet mobileToggle()}
    <div class="flex items-center gap-2">
      Edit <Switch
        id="editorMode"
        class="data-[state=checked]:bg-accent"
        bind:checked={isViewMode}
        onclick={() => {
          logEvent('mobileViewToggle');
        }} /> View
    </div>
  {/snippet}

  <Navbar mobileToggle={isMobile ? mobileToggle : undefined}>
    {#if diagramId}
      <span class="mr-2 text-xs text-gray-500">
        {#if saveStatus === 'saving'}
          Saving...
        {:else if saveStatus === 'saved'}
          Saved
        {:else if saveStatus === 'unsaved'}
          Unsaved changes
        {/if}
      </span>
    {/if}
    <Toggle bind:pressed={isHistoryOpen} size="sm">
      <HistoryIcon />
    </Toggle>
    <Share />
    {#if $authUser && diagramId}
      <Button variant="accent" size="sm" onclick={saveDiagram}>Save</Button>
    {:else if $authUser}
      <Button variant="accent" size="sm" href="/diagrams">My Diagrams</Button>
    {/if}
    <McWrapper>
      <Button
        variant="accent"
        size="sm"
        href={$urlsStore.mermaidChart({ medium: 'save_diagram' }).save}
        target="_blank"
        onclick={() => logMermaidChartClick('saveDiagram')}>
        <MermaidChartIcon />
        Save diagram
      </Button>
    </McWrapper>
  </Navbar>

  <div class="flex flex-1 flex-col overflow-hidden" bind:clientWidth={width}>
    <div
      class={[
        'size-full',
        isMobile && ['w-[200%] duration-300', isViewMode && '-translate-x-1/2']
      ]}>
      <Resizable.PaneGroup
        direction="horizontal"
        autoSaveId="liveEditor"
        class="gap-4 p-2 pt-0 sm:gap-0 sm:p-6 sm:pt-0">
        <Resizable.Pane bind:this={editorPane} defaultSize={30} minSize={15}>
          <div class="flex h-full flex-col gap-4 sm:gap-6">
            <Card
              onselect={tabSelectHandler}
              isOpen
              tabs={editorTabs}
              activeTabID={$stateStore.editorMode}
              isClosable={false}>
              {#snippet actions()}
                <DiagramDocButton />
              {/snippet}
              <Editor {isMobile} />
            </Card>

            <div class="group flex flex-wrap justify-between gap-4 sm:gap-6">
              <Preset />
              <Actions />
            </div>
          </div>
        </Resizable.Pane>
        <Resizable.Handle class="mr-1 hidden opacity-0 sm:block" />
        <Resizable.Pane minSize={15} class="relative flex h-full flex-1 flex-col overflow-hidden">
          <View {panZoomState} shouldShowGrid={$stateStore.grid} />
          <div class="absolute top-0 right-0"><PanZoomToolbar {panZoomState} /></div>
          <div class="absolute right-0 bottom-0"><VersionSecurityToolbar /></div>
          <div class="absolute bottom-0 left-0 sm:left-5"><SyncRoughToolbar /></div>
        </Resizable.Pane>
        {#if isHistoryOpen}
          <Resizable.Handle class="ml-1 hidden opacity-0 sm:block" />
          <Resizable.Pane minSize={15} defaultSize={30} class="hidden h-full grow flex-col sm:flex">
            <History />
          </Resizable.Pane>
        {/if}
      </Resizable.PaneGroup>
    </div>
  </div>
</div>

<EditorChooserModal bind:open={showEditorChooser} />
