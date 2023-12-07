import { Box } from '@rocket.chat/fuselage';
import type { FC } from 'react';
import React, { memo } from 'react';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

import SidebarItemsAssembler from '../../../components/Sidebar/SidebarItemsAssembler';
import { subscribeToAdminSidebarItems, getAdminSidebarItems } from '../sidebarItems';

type AdminSidebarPagesProps = {
	currentPath: string;
};

const AdminSidebarPages: FC<AdminSidebarPagesProps> = ({ currentPath }) => {
	const items = useSyncExternalStore(subscribeToAdminSidebarItems, getAdminSidebarItems);

	return (
		<Box display='flex' flexDirection='column' flexShrink={0} pb={8}>
			<SidebarItemsAssembler items={items} currentPath={currentPath} />
		</Box>
	);
};

export default memo(AdminSidebarPages);
