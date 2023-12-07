import React, { type ReactNode, useEffect, useState } from 'react';

import ImageGallery from '../components/ImageGallery/ImageGallery';
import { ImageGalleryContext } from '../contexts/ImageGalleryContext';

type ImageGalleryProviderProps = {
	children: ReactNode;
};

const ImageGalleryProvider = ({ children }: ImageGalleryProviderProps) => {
	const [imageId, setImageId] = useState<string>();

	useEffect(() => {
		document.addEventListener('click', (event: Event) => {
			const target = event?.target as HTMLElement | null;
			if (target?.classList.contains('gallery-item')) {
				return setImageId(target.dataset.id || target?.parentElement?.parentElement?.dataset.id);
			}

			if (target?.classList.contains('gallery-item-container')) {
				return setImageId(target.dataset.id);
			}
			if (
				target?.classList.contains('gallery-item') &&
				target?.parentElement?.parentElement?.classList.contains('gallery-item-container')
			) {
				return setImageId(target.dataset.id || target?.parentElement?.parentElement?.dataset.id);
			}

			if (target?.classList.contains('rcx-avatar__element') && target?.parentElement?.classList.contains('gallery-item')) {
				return setImageId(target.dataset.id || target?.parentElement?.parentElement?.dataset.id);
			}
		});
	}, []);

	return (
		<ImageGalleryContext.Provider value={{ imageId: imageId || '', isOpen: !!imageId, onClose: () => setImageId(undefined) }}>
			{children}
			{!!imageId && <ImageGallery />}
		</ImageGalleryContext.Provider>
	);
};

export default ImageGalleryProvider;
