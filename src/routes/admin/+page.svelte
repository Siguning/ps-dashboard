<script lang="ts">
    import { Button } from '$lib/components/ui/button/index.js';
    import { Input } from '$lib/components/ui/input/index.js';
    import * as Card from '$lib/components/ui/card/index.js';
    import { Label } from '$lib/components/ui/label/index.js';
    import { Textarea } from '$lib/components/ui/textarea/index.js';
    import { Plus, Trash2, ArrowUp, ArrowDown, Edit, Save, ArrowLeft, Loader2 } from '@lucide/svelte';
    import {type SvelteComponent, tick} from 'svelte';

    interface Problem {
        number: string;
        title: string;
        description: string | null;
        url: string;
    }

    interface ProblemSet {
        id: string;
        title: string;
        description: string;
        problems: Problem[];
    }


    let { data } = $props()
    let local_state: string = $state(data.isAuthenticated ? 'list' : 'password'); // 'password', 'list', 'edit'
    let password = $state('');
    let authError = $state('');

    let problemsets: ProblemSet[] = $state([]);
    let editingProblemset: ProblemSet | null = $state(null);
    let editingProblemsetIndex: number = $state(-1);

    let newProblemNumber = $state('');
    let newProblemInput: SvelteComponent | null = $state(null);
    let isFetchingProblem = $state(false);
    let fetchError = $state('');

    let isSaving = $state(false);

    $effect(() => {
        if (data.isAuthenticated) {
            local_state = 'list';
            loadData();
        } else {
            local_state = 'password';
        }
    });

    async function loadData() {
        try {
            const response = await fetch('/problemsets.json');
            const data = await response.json();
            // Create a deep copy for editing to avoid mutating original data accidentally
            problemsets = JSON.parse(JSON.stringify(data.problemsets));
        } catch(e) {
            console.error("Failed to load problemsets.json", e);
            alert("Could not load problemsets.json. Make sure the file exists in the 'static' directory.");
        }
    }

    // --- Problemset Management ---
    function addProblemset() {
        const newProblemset = {
            id: `ps-${Date.now()}`,
            title: 'New Problemset',
            description: 'A new collection of problems.',
            problems: []
        };
        problemsets = [...problemsets, newProblemset];
    }

    function removeProblemset(index: number) {
        if (confirm('Are you sure you want to delete this entire problemset?')) {
            problemsets.splice(index, 1);
            problemsets = problemsets;
        }
    }

    function moveProblemset(index: number, direction: string) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= problemsets.length) return;
        const temp = problemsets[index];
        problemsets[index] = problemsets[newIndex];
        problemsets[newIndex] = temp;
        problemsets = problemsets;
    }

    function startEditing(pSet: ProblemSet, index: number) {
        editingProblemsetIndex = index;
        editingProblemset = JSON.parse(JSON.stringify(pSet));
        local_state = 'edit';
    }

    function saveProblemsetChanges() {
        if (editingProblemset) {
            problemsets[editingProblemsetIndex] = editingProblemset;
        }
        problemsets = problemsets;
        backToList();
    }

    function backToList() {
        editingProblemset = null;
        editingProblemsetIndex = -1;
        local_state = 'list';
    }

    // --- Problem Management ---
    async function addProblem(event: Event) {
        event.preventDefault();
        if (!newProblemNumber) return;
        isFetchingProblem = true;
        fetchError = '';
        try {
            if (isNaN(parseInt(newProblemNumber))) {
                throw new Error("Invalid problem number.");
            }
            const response = await fetch(`/api/boj/${newProblemNumber}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            const data = await response.json();
            const firstSpaceIndex = data.title.indexOf(' ');
            const problemTitle = data.title.substring(firstSpaceIndex + 1);

            if (editingProblemset) {
                editingProblemset.problems.push({
                    number: newProblemNumber,
                    title: problemTitle,
                    description: '',
                    url: `https://www.acmicpc.net/problem/${newProblemNumber}`
                });
                editingProblemset.problems = editingProblemset.problems;
            }
            newProblemNumber = '';
        } catch (err) {
            console.error("Failed to fetch problem:", err);
            fetchError = `Failed to fetch problem. ${err instanceof Error ? err.message : 'Unknown error'}.`;
        } finally {
            isFetchingProblem = false;
            await tick();
            newProblemInput?.focus();
        }
    }

    function removeProblem(index: number) {
        if (!editingProblemset)
            return;
        editingProblemset.problems.splice(index, 1);
        editingProblemset.problems = editingProblemset.problems;
    }

    function moveProblem(index: number, direction: string) {
        if (!editingProblemset)
            return;
        const problems = editingProblemset.problems;
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= problems.length) return;
        [problems[index], problems[newIndex]] = [problems[newIndex], problems[index]];
        editingProblemset.problems = problems;
    }

    // 기존 downloadJson() 함수를 아래 함수로 대체하거나 수정합니다.
    async function saveAndUploadJson() {
        isSaving = true;

        try {
            const response = await fetch('/api/save-problemsets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // `problemsets` 상태를 JSON 본문에 담아 전송
                body: JSON.stringify({ problemsets: problemsets }),
            });

            if (!response.ok) {
                const errorResult = await response.json();
                throw new Error(errorResult.message || 'Server error');
            }

            const result = await response.json();
            if (result.success) {
                alert('변경 사항이 서버에 성공적으로 저장되었습니다.\n\n(참고: 변경사항이 사이트에 반영되려면 재배포가 필요할 수 있습니다.)');
            } else {
                throw new Error(result.message);
            }

        } catch (error) {
            console.error("Failed to save problemsets to server:", error);
            alert(`저장에 실패했습니다: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            isSaving = false;
        }
    }
</script>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">Admin Panel</h1>

    {#if local_state === 'password'}
        <Card.Root class="max-w-md mx-auto">
            <form method="POST">
                <Card.Header>
                    <Card.Title>Authentication Required</Card.Title>
                    <Card.Description>Please enter the password to manage content.</Card.Description>
                </Card.Header>
                <Card.Content class="space-y-4">
                    <div class="space-y-2">
                        <Label for="password">Password</Label>
                        <Input id="password" type="password" name="password" placeholder="••••••••" bind:value={password} />
                    </div>
                    {#if authError}
                        <p class="text-sm text-destructive">{authError}</p>
                    {/if}
                </Card.Content>
                <Card.Footer>
                    <Button type="submit" class="w-full">Enter</Button>
                </Card.Footer>
            </form>
        </Card.Root>
    {/if}

    {#if local_state === 'list'}
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold">Manage Problemsets</h2>
            <div>
                <Button onclick={addProblemset} class="mr-2"><Plus class="mr-2 h-4 w-4" /> Add Problemset</Button>
                <Button onclick={saveAndUploadJson} variant="secondary" disabled={isSaving}>
                {#if isSaving}
                    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                {:else}
                    <Save class="mr-2 h-4 w-4" /> Save to Server
                {/if}
            </Button>
            </div>
        </div>
        <Card.Root>
            <Card.Content class="pt-6 space-y-2">
                {#each problemsets as problemset, i (problemset.id)}
                    <div class="flex items-center gap-4 p-3 border rounded-lg">
                        <div class="flex-grow">
                            <p class="text-lg font-semibold">{problemset.title}</p>
                            <p class="text-sm text-muted-foreground">{problemset.description}</p>
                        </div>
                        <div class="flex gap-1">
                            <Button onclick={() => moveProblemset(i, 'up')} variant="ghost" size="icon" disabled={i === 0} title="Move up"><ArrowUp class="h-4 w-4" /></Button>
                            <Button onclick={() => moveProblemset(i, 'down')} variant="ghost" size="icon" disabled={i === problemsets.length - 1} title="Move down"><ArrowDown class="h-4 w-4" /></Button>
                            <Button onclick={() => startEditing(problemset, i)} variant="outline" size="sm"><Edit class="mr-2 h-4 w-4" /> Manage</Button>
                            <Button onclick={() => removeProblemset(i)} variant="destructive" size="icon" title="Delete problemset"><Trash2 class="h-4 w-4" /></Button>
                        </div>
                    </div>
                {:else}
                    <p class="text-center text-muted-foreground py-8">No problemsets found. Click 'Add Problemset' to begin.</p>
                {/each}
            </Card.Content>
        </Card.Root>
    {/if}

    {#if local_state === 'edit' && editingProblemset}
        <div>
            <div class="flex justify-between items-center mb-4">
                <Button onclick={backToList} variant="ghost"><ArrowLeft class="mr-2 h-4 w-4"/> Back to List</Button>
                <Button onclick={saveProblemsetChanges}><Save class="mr-2 h-4 w-4" /> Save Changes & Return</Button>
            </div>

            <div class="grid gap-8 lg:grid-cols-2">
                <Card.Root>
                    <Card.Header><Card.Title>Edit Problemset Details</Card.Title></Card.Header>
                    <Card.Content class="space-y-4">
                        <div class="space-y-2">
                            <Label for="edit-title">Title</Label>
                            <Input id="edit-title" bind:value={editingProblemset.title} />
                        </div>
                        <div class="space-y-2">
                            <Label for="edit-desc">Description</Label>
                            <Textarea id="edit-desc" bind:value={editingProblemset.description} />
                        </div>
                    </Card.Content>
                </Card.Root>
                <Card.Root>
                    <Card.Header>
                        <Card.Title>Add New Problem</Card.Title>
                        <Card.Description>Enter a problem number from Baekjoon to fetch its title.</Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <form onsubmit={addProblem}>
                            <div class="flex gap-2">
                                <Input placeholder="e.g., 1000" bind:this={newProblemInput} bind:value={newProblemNumber} disabled={isFetchingProblem} />
                                <Button type="submit" disabled={isFetchingProblem || !newProblemNumber} class="w-32">
                                    {#if isFetchingProblem}
                                        <Loader2 class="mr-2 h-4 w-4 animate-spin" /> Fetching...
                                    {:else}
                                        <Plus class="mr-2 h-4 w-4" /> Add
                                    {/if}
                                </Button>
                            </div>
                        </form>
                        {#if fetchError}
                            <p class="text-xs text-destructive mt-2">{fetchError}</p>
                        {/if}
                    </Card.Content>
                </Card.Root>
            </div>

            <Card.Root class="mt-8">
                <Card.Header><Card.Title>Manage Problems in "{editingProblemset.title}"</Card.Title></Card.Header>
                <Card.Content class="pt-2">
                    {#each editingProblemset.problems as problem, i (problem.number)}
                        <div class="flex items-start gap-4 p-3 border-b last:border-b-0">
                            <div class="font-mono text-muted-foreground pt-2">#{problem.number}</div>
                            <div class="flex-grow space-y-2">
                                <Input placeholder="Problem Title" bind:value={problem.title} />
                                <Textarea placeholder="Optional description" bind:value={problem.description} rows={1} class="text-sm" />
                            </div>
                            <div class="flex flex-col gap-1 pt-1">
                                <Button onclick={() => moveProblem(i, 'up')} variant="ghost" size="icon" disabled={i === 0} title="Move up"><ArrowUp class="h-4 w-4" /></Button>
                                <Button onclick={() => moveProblem(i, 'down')} variant="ghost" size="icon" disabled={i === editingProblemset.problems.length - 1} title="Move down"><ArrowDown class="h-4 w-4" /></Button>
                                <Button onclick={() => removeProblem(i)} variant="destructive" size="icon" title="Delete problem"><Trash2 class="h-4 w-4" /></Button>
                            </div>
                        </div>
                    {:else}
                        <p class="text-center text-muted-foreground py-8">No problems in this set yet. Add one above.</p>
                    {/each}
                </Card.Content>
            </Card.Root>
        </div>
    {/if}
</div>
