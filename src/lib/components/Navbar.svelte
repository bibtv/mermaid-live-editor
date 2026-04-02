<script lang="ts" module>
  import { logEvent, logMermaidChartClick } from '$lib/util/stats';
  import { version } from 'mermaid/package.json';

  void logEvent('version', {
    mermaidVersion: version
  });
</script>

<script lang="ts">
  import MainMenu from '$/components/MainMenu.svelte';
  import { Button } from '$/components/ui/button';
  import { Separator } from '$/components/ui/separator';
  import { dismissPromotion, getActivePromotion } from '$lib/util/promos/promo';
  import { authUser, logout, fetchUser } from '$lib/stores/auth';
  import Playground from '$/components/Playground.svelte';
  import type { ComponentProps, Snippet } from 'svelte';
  import MermaidIcon from '~icons/custom/mermaid';
  import CloseIcon from '~icons/material-symbols/close-rounded';
  import GithubIcon from '~icons/mdi/github';
  import DropdownNavMenu from './DropdownNavMenu.svelte';
  import { onMount } from 'svelte';

  interface Props {
    mobileToggle?: Snippet;
    children: Snippet;
    hidePromotion?: boolean;
  }

  let { children, mobileToggle, hidePromotion = false }: Props = $props();

  type Links = ComponentProps<typeof DropdownNavMenu>['links'];

  const githubLinks: Links = [
    { title: 'Mermaid JS', href: 'https://github.com/mermaid-js/mermaid' },
    {
      title: 'Mermaid Live Editor',
      href: 'https://github.com/mermaid-js/mermaid-live-editor'
    },
    {
      title: 'Mermaid CLI',
      href: 'https://github.com/mermaid-js/mermaid-cli'
    }
  ];

  let activePromotion = $state(hidePromotion ? undefined : getActivePromotion());

  onMount(() => {
    fetchUser();
  });

  const trackBannerClick = () => {
    if (!activePromotion) {
      return;
    }
    logEvent('bannerClick', {
      promotion: activePromotion.id
    });
    logMermaidChartClick('banner');
  };

  async function handleLogout() {
    await logout();
    window.location.href = '/';
  }
</script>

{#if activePromotion}
  <div class="top-bar z-10 flex h-fit w-full bg-primary">
    <div
      class="flex grow"
      role="button"
      tabindex="0"
      onclick={trackBannerClick}
      onkeypress={trackBannerClick}>
      <activePromotion.component {closeBanner} />
    </div>
    {#snippet closeBanner()}
      <Button
        title="Dismiss banner"
        variant="ghost"
        class="hover:bg-transparent hover:text-[#261A56]"
        size="sm"
        onclick={() => {
          dismissPromotion(activePromotion?.id);
          activePromotion = undefined;
        }}>
        <CloseIcon />
      </Button>
    {/snippet}
  </div>
{/if}

<nav class="z-50 flex p-4 sm:p-6">
  <div class="flex flex-1 items-center gap-2">
    <MainMenu />
    <MermaidIcon class="size-6" />
    <a href="/" class="whitespace-nowrap text-accent">
      {#if !mobileToggle}
        Diagram
      {/if}
      Tool
    </a>
  </div>
  <div
    id="menu"
    class="hidden flex-nowrap items-center justify-between gap-3 overflow-hidden md:flex">
    <Playground />
    <Separator orientation="vertical" />
    {#if $authUser}
      <a href="/diagrams" class="text-sm text-gray-600 hover:text-indigo-600">My Diagrams</a>
      <span class="text-sm text-gray-500">{$authUser.email}</span>
      <Button variant="ghost" size="sm" onclick={handleLogout}>Logout</Button>
    {:else}
      <a href="/login" class="text-sm text-gray-600 hover:text-indigo-600">Login</a>
      <a href="/register" class="text-sm text-gray-600 hover:text-indigo-600">Register</a>
    {/if}
    <Separator orientation="vertical" />
    <DropdownNavMenu icon={GithubIcon} links={githubLinks} />
    <Separator orientation="vertical" />
    {@render children()}
  </div>
  {@render mobileToggle?.()}
</nav>
