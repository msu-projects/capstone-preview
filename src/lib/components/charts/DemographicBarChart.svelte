<script lang="ts">
	import { scaleBand } from 'd3-scale';
	import { Axis, Bars, Chart, Svg } from 'layerchart';

	interface ChartDataItem {
		label: string;
		value: number;
		color?: string;
	}

	interface Props {
		data: ChartDataItem[];
		orientation?: 'horizontal' | 'vertical';
		height?: number;
	}

	const { data, orientation = 'horizontal', height = 200 }: Props = $props();
</script>

<div class="h-full w-full">
	<Chart
		{data}
		x={orientation === 'horizontal' ? 'value' : 'label'}
		xScale={orientation === 'horizontal' ? undefined : scaleBand().padding(0.3)}
		xDomain={orientation === 'horizontal' ? [0, null] : undefined}
		xNice={orientation === 'horizontal'}
		y={orientation === 'horizontal' ? 'label' : 'value'}
		yScale={orientation === 'horizontal' ? scaleBand().padding(0.3) : undefined}
		yDomain={orientation === 'vertical' ? [0, null] : undefined}
		yNice={orientation === 'vertical'}
		c="label"
		cRange={data.map((d) => d.color || 'hsl(217, 91%, 60%)')}
		padding={{
			left: orientation === 'horizontal' ? 60 : 20,
			bottom: orientation === 'vertical' ? 36 : 20,
			right: 20,
			top: 10
		}}
	>
		<Svg>
			<Axis
				placement={orientation === 'horizontal' ? 'left' : 'bottom'}
				grid={false}
				rule={false}
				tickLength={0}
				tickLabelProps={{
					class: 'text-sm font-medium fill-slate-700'
				}}
			/>
			<Axis
				placement={orientation === 'horizontal' ? 'bottom' : 'left'}
				grid={false}
				rule={false}
			/>
			<Bars radius={6} strokeWidth={0} class="transition-colors" />
		</Svg>
	</Chart>
</div>
