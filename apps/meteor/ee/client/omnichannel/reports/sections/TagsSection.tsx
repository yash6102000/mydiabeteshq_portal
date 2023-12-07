import React from 'react';

import { BarChart, ReportCard } from '../components';
import { useTagsSection } from '../hooks';
import { ellipsis } from '../utils/ellipsis';

export const TagsSection = () => {
	const { data, ...config } = useTagsSection();

	return (
		<ReportCard {...config} minHeight={360}>
			<BarChart
				data={data}
				direction='horizontal'
				height={360}
				margins={{ left: 90, top: 30, right: 8 }}
				axis={{
					axisLeft: {
						tickSize: 0,
						tickRotation: 0,
						format: (v) => ellipsis(v, 10),
					},
					axisTop: {
						tickSize: 0,
						tickRotation: 0,
						tickValues: 4,
						format: (v) => ellipsis(v, 10),
					},
				}}
			/>
		</ReportCard>
	);
};
