<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import * as Tabs from '$lib/components/ui/tabs';
	import type {
		DelaySeverity,
		MilestoneStatus,
		Project,
		ProjectStatus,
		RecoveryActionStatus
	} from '$lib/types';
	import {
		Building2,
		Calendar,
		CircleAlert,
		CircleCheck,
		Clock,
		DollarSign,
		Eye,
		FileText,
		Hammer,
		MapPin,
		SquarePen,
		Tag,
		Target,
		TrendingUp,
		TriangleAlert,
		Users
	} from '@lucide/svelte';

	// Props
	interface Props {
		project: Project;
		isAdminView?: boolean;
	}

	const { project, isAdminView = false }: Props = $props();

	// Derived data
	const monitoring = $derived(project.monitoring);
	const allotment = $derived(monitoring?.allotment);
	const expenditure = $derived(monitoring?.expenditure);
	const physical = $derived(monitoring?.physical);
	const employment = $derived(monitoring?.employment);
	const contractInfo = $derived(monitoring?.contract);
	const statusSummary = $derived(monitoring?.statusSummary);
	const accountability = $derived(project.accountability);

	// Helper functions
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatNumber(num: number): string {
		return new Intl.NumberFormat('en-US').format(num);
	}

	function getStatusBadgeVariant(status: ProjectStatus) {
		switch (status) {
			case 'planning':
				return 'secondary' as const;
			case 'in-progress':
				return 'outline' as const;
			case 'completed':
				return 'default' as const;
			case 'suspended':
				return 'destructive' as const;
			default:
				return 'default' as const;
		}
	}

	function getStatusLabel(status: ProjectStatus): string {
		switch (status) {
			case 'planning':
				return 'Planning';
			case 'in-progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'suspended':
				return 'Suspended';
			default:
				return status;
		}
	}

	function getMilestoneStatusBadgeVariant(status: MilestoneStatus) {
		switch (status) {
			case 'not_started':
				return 'secondary' as const;
			case 'in_progress':
				return 'outline' as const;
			case 'completed':
				return 'default' as const;
			case 'delayed':
				return 'destructive' as const;
			default:
				return 'default' as const;
		}
	}

	function getMilestoneStatusLabel(status: MilestoneStatus): string {
		switch (status) {
			case 'not_started':
				return 'Not Started';
			case 'in_progress':
				return 'In Progress';
			case 'completed':
				return 'Completed';
			case 'delayed':
				return 'Delayed';
			default:
				return status;
		}
	}

	function getMilestoneStatusIcon(status: MilestoneStatus) {
		switch (status) {
			case 'not_started':
				return Clock;
			case 'in_progress':
				return TrendingUp;
			case 'completed':
				return CircleCheck;
			case 'delayed':
				return TriangleAlert;
			default:
				return Clock;
		}
	}

	function getDelaySeverityBadgeVariant(severity: DelaySeverity) {
		switch (severity) {
			case 'low':
				return 'secondary' as const;
			case 'medium':
				return 'outline' as const;
			case 'high':
				return 'destructive' as const;
			case 'critical':
				return 'destructive' as const;
			default:
				return 'default' as const;
		}
	}

	function getRecoveryActionStatusBadgeVariant(status: RecoveryActionStatus) {
		switch (status) {
			case 'planned':
				return 'secondary' as const;
			case 'in_progress':
				return 'outline' as const;
			case 'completed':
				return 'default' as const;
			case 'cancelled':
				return 'destructive' as const;
			default:
				return 'default' as const;
		}
	}

	function getRecoveryActionStatusLabel(status: RecoveryActionStatus): string {
		return status
			.split('_')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
</script>

<div class="flex min-h-screen flex-col">
	<!-- Header -->
	<header class="border-b bg-linear-to-r from-primary to-primary/80 text-primary-foreground">
		<div class="p-6">
			<!-- Breadcrumb -->
			<div class="mb-4 flex items-center gap-2 text-sm opacity-90">
				<a href={isAdminView ? '/admin/projects' : '/projects'} class="hover:underline">Projects</a>
				<span>/</span>
				<span>Details</span>
			</div>

			<!-- Title and Meta -->
			<div class="flex items-start justify-between">
				<div class="flex-1">
					<h1 class="mb-3 text-3xl font-bold">{project.title}</h1>
					<div class="flex flex-wrap items-center gap-4 text-sm">
						<div class="flex items-center gap-1.5">
							<Tag class="size-4" />
							<span>{project.category}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<MapPin class="size-4" />
							<span>{project.sitio_name}, {project.municipality}</span>
						</div>
						<div class="flex items-center gap-1.5">
							<Calendar class="size-4" />
							<span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
						</div>
						<Badge variant={getStatusBadgeVariant(project.status)} class="bg-white/20 text-white">
							{getStatusLabel(project.status)}
						</Badge>
					</div>
				</div>
				<div class="flex gap-2 {!isAdminView ? 'hidden' : ''}">
					<Button variant="secondary" size="sm" href="/projects/{project.id}">
						<Eye class="mr-2 size-4" />
						Public View
					</Button>
					<Button variant="secondary" size="sm" href="/admin/projects/{project.id}/edit">
						<SquarePen class="mr-2 size-4" />
						Edit
					</Button>
				</div>
			</div>
		</div>
	</header>

	<!-- Content -->
	<div class="flex-1 space-y-6 bg-muted/30 p-6">
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Description -->
				<Card.Card>
					<Card.CardHeader>
						<Card.CardTitle class="flex items-center gap-2">
							<FileText class="size-5" />
							Project Description
						</Card.CardTitle>
					</Card.CardHeader>
					<Card.CardContent>
						<p class="leading-relaxed text-muted-foreground">{project.description}</p>
					</Card.CardContent>
				</Card.Card>

				<!-- Tabs for detailed information -->
				<Card.Card>
					<Tabs.Root value="monitoring" class="w-full">
						<Card.CardHeader class="pb-3">
							<Tabs.List class="grid w-full grid-cols-4">
								<Tabs.Trigger value="monitoring">Monitoring</Tabs.Trigger>
								<Tabs.Trigger value="timeline">Timeline</Tabs.Trigger>
								<Tabs.Trigger value="milestones">Milestones</Tabs.Trigger>
								<Tabs.Trigger value="delays">Delays</Tabs.Trigger>
							</Tabs.List>
						</Card.CardHeader>

						<!-- Monitoring Tab -->
						<Tabs.Content value="monitoring">
							<Card.CardContent class="space-y-6">
								<!-- Financial Details -->
								<div>
									<h4 class="mb-4 flex items-center gap-2 font-semibold">
										<DollarSign class="size-4" />
										Financial Performance
									</h4>
									<div class="grid grid-cols-2 gap-4">
										<div class="rounded-lg border bg-card p-4">
											<div class="text-xs text-muted-foreground">Allocated</div>
											<div class="mt-1 text-xl font-semibold">
												{formatCurrency(allotment?.allocated ?? project.budget)}
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4">
											<div class="text-xs text-muted-foreground">Supplemental</div>
											<div class="mt-1 text-xl font-semibold">
												{formatCurrency(allotment?.supplemental ?? 0)}
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4">
											<div class="text-xs text-muted-foreground">Total Budget</div>
											<div class="mt-1 text-xl font-semibold">
												{formatCurrency(allotment?.total ?? project.budget)}
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4">
											<div class="text-xs text-muted-foreground">Released</div>
											<div class="mt-1 text-xl font-semibold">
												{formatCurrency(allotment?.released ?? 0)}
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4">
											<div class="text-xs text-muted-foreground">Obligations</div>
											<div class="mt-1 text-xl font-semibold">
												{formatCurrency(expenditure?.obligations ?? 0)}
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4">
											<div class="text-xs text-muted-foreground">Contract Cost</div>
											<div class="mt-1 text-xl font-semibold">
												{formatCurrency(expenditure?.contractCost ?? 0)}
											</div>
										</div>
									</div>

									{#if allotment?.total}
										{@const utilization = ((expenditure?.obligations ?? 0) / allotment.total) * 100}
										<div class="mt-4">
											<div class="mb-2 flex items-center justify-between text-sm">
												<span class="text-muted-foreground">Financial Utilization</span>
												<span class="font-medium">{utilization.toFixed(1)}%</span>
											</div>
											<Progress value={utilization} class="h-2" />
										</div>
									{/if}
								</div>

								<Separator />

								<!-- Physical Progress -->
								<div>
									<h4 class="mb-4 flex items-center gap-2 font-semibold">
										<Target class="size-4" />
										Physical Progress
									</h4>
									<div class="grid grid-cols-3 gap-4">
										<div class="rounded-lg border bg-card p-4 text-center">
											<div class="text-xs text-muted-foreground">Planned</div>
											<div class="mt-1 text-2xl font-semibold">
												{(physical?.plan ?? project.completion_percentage).toFixed(1)}%
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4 text-center">
											<div class="text-xs text-muted-foreground">Actual</div>
											<div class="mt-1 text-2xl font-semibold">
												{(physical?.actual ?? project.completion_percentage).toFixed(1)}%
											</div>
										</div>
										<div class="rounded-lg border bg-card p-4 text-center">
											<div class="text-xs text-muted-foreground">Slippage</div>
											<div
												class="mt-1 text-2xl font-semibold {(physical?.slippage ?? 0) < 0
													? 'text-destructive'
													: 'text-green-600'}"
											>
												{(physical?.slippage ?? 0) > 0 ? '+' : ''}{(
													physical?.slippage ?? 0
												).toFixed(1)}%
											</div>
										</div>
									</div>
								</div>

								<Separator />

								<!-- Employment & Contract -->
								<div class="grid gap-6 md:grid-cols-2">
									<div>
										<h4 class="mb-4 flex items-center gap-2 font-semibold">
											<Users class="size-4" />
											Employment
										</h4>
										<div class="space-y-2">
											<div class="flex justify-between">
												<span class="text-sm text-muted-foreground">Male</span>
												<span class="font-medium">{employment?.male ?? 0}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-muted-foreground">Female</span>
												<span class="font-medium">{employment?.female ?? 0}</span>
											</div>
											<div class="flex justify-between border-t pt-2">
												<span class="text-sm font-medium">Total</span>
												<span class="font-semibold"
													>{(employment?.male ?? 0) + (employment?.female ?? 0)}</span
												>
											</div>
										</div>
									</div>
									<div>
										<h4 class="mb-4 flex items-center gap-2 font-semibold">
											<Hammer class="size-4" />
											Contract Info
										</h4>
										<div class="space-y-2">
											<div class="flex justify-between">
												<span class="text-sm text-muted-foreground">Duration</span>
												<span class="font-medium">{contractInfo?.duration ?? 'N/A'}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-muted-foreground">Delivery</span>
												<span class="font-medium">{contractInfo?.delivery ?? 'N/A'}</span>
											</div>
											<div class="flex justify-between">
												<span class="text-sm text-muted-foreground">Extension</span>
												<span class="font-medium">{contractInfo?.extension ?? 'None'}</span>
											</div>
										</div>
									</div>
								</div>

								<!-- Status Summary -->
								{#if statusSummary}
									<Separator />
									<div class="rounded-lg bg-muted/50 p-4">
										<h4 class="mb-3 flex items-center gap-2 font-semibold">
											<CircleAlert class="size-4" />
											Status Summary
										</h4>
										<div class="space-y-3 text-sm">
											<div>
												<div class="font-medium">Current Stage:</div>
												<div class="text-muted-foreground">{statusSummary.stage}</div>
											</div>
											<div>
												<div class="font-medium">Issues:</div>
												<div class="text-muted-foreground">{statusSummary.issues}</div>
											</div>
											<div>
												<div class="font-medium">Recommendations:</div>
												<div class="text-muted-foreground">{statusSummary.recommendations}</div>
											</div>
											{#if monitoring?.catchUpPlan && monitoring.catchUpPlan !== 'N/A'}
												<div>
													<div class="font-medium">Catch-Up Plan:</div>
													<div class="text-muted-foreground">{monitoring.catchUpPlan}</div>
												</div>
											{/if}
										</div>
									</div>
								{/if}
							</Card.CardContent>
						</Tabs.Content>

						<!-- Timeline Tab -->
						<Tabs.Content value="timeline">
							<Card.CardContent>
								{#if project.timeline && project.timeline.length > 0}
									<div class="relative space-y-6 border-l-2 border-muted pl-6">
										{#each project.timeline as event, index (index)}
											<div class="relative">
												<div
													class="absolute top-1 -left-[1.813rem] size-4 rounded-full border-2 border-background {event.status ===
													'completed'
														? 'bg-primary'
														: event.status === 'in_progress'
															? 'bg-blue-500'
															: 'bg-muted-foreground'}"
												></div>
												<div class="mb-1 text-sm font-medium text-muted-foreground">
													{formatDate(event.date)}
												</div>
												<div class="mb-1 font-semibold">{event.title}</div>
												<div class="text-sm text-muted-foreground">{event.description}</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="py-8 text-center text-muted-foreground">
										No timeline events recorded
									</div>
								{/if}
							</Card.CardContent>
						</Tabs.Content>

						<!-- Milestones Tab -->
						<Tabs.Content value="milestones">
							<Card.CardContent>
								{#if project.milestones && project.milestones.length > 0}
									<div class="space-y-4">
										{#each project.milestones as milestone (milestone.id)}
											<div class="rounded-lg border bg-card p-4">
												<div class="mb-3 flex items-start justify-between">
													<div class="flex-1">
														<div class="mb-1 flex items-center gap-2">
															{#if milestone.status === 'not_started'}
																<Clock class="size-4" />
															{:else if milestone.status === 'in_progress'}
																<TrendingUp class="size-4" />
															{:else if milestone.status === 'completed'}
																<CircleCheck class="size-4" />
															{:else}
																<TriangleAlert class="size-4" />
															{/if}
															<h4 class="font-semibold">{milestone.name}</h4>
														</div>
														<p class="text-sm text-muted-foreground">{milestone.description}</p>
													</div>
													<Badge variant={getMilestoneStatusBadgeVariant(milestone.status)}>
														{getMilestoneStatusLabel(milestone.status)}
													</Badge>
												</div>

												<div class="mb-3">
													<div class="mb-1 flex items-center justify-between text-sm">
														<span class="text-muted-foreground">Progress</span>
														<span class="font-medium">{milestone.completion_percentage}%</span>
													</div>
													<Progress value={milestone.completion_percentage} class="h-2" />
												</div>

												<div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
													<div>
														<div class="text-xs text-muted-foreground">Planned Start</div>
														<div class="font-medium">{formatDate(milestone.planned_start)}</div>
													</div>
													<div>
														<div class="text-xs text-muted-foreground">Planned End</div>
														<div class="font-medium">{formatDate(milestone.planned_end)}</div>
													</div>
													<div>
														<div class="text-xs text-muted-foreground">Owner</div>
														<div class="font-medium">{milestone.owner}</div>
													</div>
													<div>
														<div class="text-xs text-muted-foreground">Budget</div>
														<div class="font-medium">
															{formatCurrency(milestone.budget_allocation)}
														</div>
													</div>
												</div>

												{#if milestone.deliverables && milestone.deliverables.length > 0}
													<div class="mt-3 border-t pt-3">
														<div class="mb-2 text-xs font-medium text-muted-foreground">
															Deliverables
														</div>
														<ul class="space-y-1 text-sm">
															{#each milestone.deliverables as deliverable}
																<li class="flex items-start gap-2">
																	<CircleCheck class="mt-0.5 size-4 shrink-0 text-primary" />
																	<span>{deliverable}</span>
																</li>
															{/each}
														</ul>
													</div>
												{/if}
											</div>
										{/each}
									</div>
								{:else}
									<div class="py-8 text-center text-muted-foreground">No milestones defined</div>
								{/if}
							</Card.CardContent>
						</Tabs.Content>

						<!-- Delays Tab -->
						<Tabs.Content value="delays">
							<Card.CardContent>
								{#if project.delays && project.delays.length > 0}
									<div class="space-y-6">
										{#each project.delays as delay (delay.id)}
											<div class="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
												<div class="mb-3 flex items-start justify-between">
													<div class="flex-1">
														<div class="mb-1 flex items-center gap-2">
															<TriangleAlert class="size-5 text-destructive" />
															<h4 class="font-semibold">{delay.title}</h4>
														</div>
														<div class="text-sm text-muted-foreground">
															Reported on {formatDate(delay.reported_date)} by {delay.reported_by}
														</div>
													</div>
													<Badge variant={getDelaySeverityBadgeVariant(delay.severity)}>
														{delay.severity.toUpperCase()}
													</Badge>
												</div>

												<div class="mb-3 space-y-2 text-sm">
													<div>
														<span class="font-medium">Root Cause:</span>
														<span class="text-muted-foreground"> {delay.root_cause}</span>
													</div>
													<div>
														<span class="font-medium">Impact:</span>
														<span class="text-muted-foreground"> {delay.beneficiary_impact}</span>
													</div>
													<div>
														<span class="font-medium">Responsible Party:</span>
														<span class="text-muted-foreground"> {delay.responsible_party}</span>
													</div>
												</div>

												<div class="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
													<div>
														<div class="text-xs text-muted-foreground">Est. Duration</div>
														<div class="font-medium">{delay.duration_days_estimated} days</div>
													</div>
													<div>
														<div class="text-xs text-muted-foreground">Schedule Impact</div>
														<div class="font-medium">{delay.schedule_impact_days} days</div>
													</div>
													<div>
														<div class="text-xs text-muted-foreground">Cost Impact</div>
														<div class="font-medium">{formatCurrency(delay.cost_impact)}</div>
													</div>
													<div>
														<div class="text-xs text-muted-foreground">Resolution Target</div>
														<div class="font-medium">
															{formatDate(delay.resolution_target_date)}
														</div>
													</div>
												</div>

												<!-- Recovery Actions -->
												{#if project.recovery_actions}
													{@const relatedActions = project.recovery_actions.filter(
														(a) => a.delay_id === delay.id
													)}
													{#if relatedActions.length > 0}
														<div class="mt-4 border-t pt-4">
															<div class="mb-3 font-medium">Recovery Actions:</div>
															<div class="space-y-3">
																{#each relatedActions as action (action.id)}
																	<div class="rounded-lg border bg-card p-3">
																		<div class="mb-2 flex items-start justify-between">
																			<div class="flex-1 font-medium">{action.action}</div>
																			<Badge
																				variant={getRecoveryActionStatusBadgeVariant(action.status)}
																			>
																				{getRecoveryActionStatusLabel(action.status)}
																			</Badge>
																		</div>
																		<p class="mb-2 text-sm text-muted-foreground">
																			{action.description}
																		</p>
																		<div class="mb-2">
																			<div class="mb-1 flex items-center justify-between text-xs">
																				<span class="text-muted-foreground">Progress</span>
																				<span>{action.progress_percentage}%</span>
																			</div>
																			<Progress value={action.progress_percentage} class="h-1.5" />
																		</div>
																		<div class="grid grid-cols-2 gap-2 text-xs">
																			<div>
																				<span class="text-muted-foreground">Owner:</span>
																				{action.owner}
																			</div>
																			<div>
																				<span class="text-muted-foreground">Target:</span>
																				{formatDate(action.target_completion)}
																			</div>
																		</div>
																	</div>
																{/each}
															</div>
														</div>
													{/if}
												{/if}
											</div>
										{/each}
									</div>
								{:else}
									<div class="py-8 text-center text-muted-foreground">
										<CircleCheck class="mx-auto mb-2 size-12 text-green-600" />
										<p>No delays reported for this project</p>
									</div>
								{/if}
							</Card.CardContent>
						</Tabs.Content>
					</Tabs.Root>
				</Card.Card>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Progress Card -->
				<Card.Card>
					<Card.CardHeader>
						<Card.CardTitle class="text-lg">Overall Progress</Card.CardTitle>
					</Card.CardHeader>
					<Card.CardContent>
						<div class="mb-6 text-center">
							<div class="mb-2 text-5xl font-bold text-primary">
								{project.completion_percentage}%
							</div>
							<div class="text-sm text-muted-foreground">Complete</div>
						</div>
						<Progress value={project.completion_percentage} class="h-3" />
					</Card.CardContent>
				</Card.Card>

				<!-- Key Information -->
				<Card.Card>
					<Card.CardHeader>
						<Card.CardTitle class="text-lg">Key Information</Card.CardTitle>
					</Card.CardHeader>
					<Card.CardContent class="space-y-4">
						<div>
							<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<DollarSign class="size-3" />
								Budget
							</div>
							<div class="font-semibold">{formatCurrency(project.budget)}</div>
						</div>
						<Separator />
						<div>
							<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<Users class="size-3" />
								Beneficiaries
							</div>
							<div class="font-semibold">{formatNumber(project.beneficiaries)} people</div>
						</div>
						<Separator />
						<div>
							<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<Building2 class="size-3" />
								Partner Agency
							</div>
							<div class="font-semibold">
								{project.implementing_partner || 'Provincial Governor\'s Office - CATCH-UP'}
							</div>
						</div>
						<Separator />
						<div>
							<div class="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
								<Calendar class="size-3" />
								Project Year
							</div>
							<div class="font-semibold">{project.project_year}</div>
						</div>
					</Card.CardContent>
				</Card.Card>

				<!-- Accountability -->
				{#if accountability}
					<Card.Card>
						<Card.CardHeader>
							<Card.CardTitle class="text-lg">Accountability</Card.CardTitle>
						</Card.CardHeader>
						<Card.CardContent class="space-y-3 text-sm">
							<div>
								<div class="text-xs text-muted-foreground">Project Manager</div>
								<div class="font-medium">{accountability.project_manager}</div>
							</div>
							<div>
								<div class="text-xs text-muted-foreground">Technical Lead</div>
								<div class="font-medium">{accountability.technical_lead}</div>
							</div>
							<div>
								<div class="text-xs text-muted-foreground">Contractor</div>
								<div class="font-medium">{accountability.contractor}</div>
							</div>
							<div>
								<div class="text-xs text-muted-foreground">PM Agency</div>
								<div class="font-medium">{accountability.pm_agency}</div>
							</div>
						</Card.CardContent>
					</Card.Card>
				{/if}

				<!-- Sitio Link -->
				<Card.Card>
					<Card.CardHeader>
						<Card.CardTitle class="text-lg">Location</Card.CardTitle>
					</Card.CardHeader>
					<Card.CardContent>
						<Button
							href={isAdminView
								? `/admin/sitios/${project.sitio_id}`
								: `/sitios/${project.sitio_id}`}
							variant="outline"
							class="w-full"
						>
							<MapPin class="mr-2 size-4" />
							View Sitio Profile
						</Button>
					</Card.CardContent>
				</Card.Card>
			</div>
		</div>
	</div>
</div>
