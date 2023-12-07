import { css } from '@rocket.chat/css-in-js';
import { Box, IconButton, Palette, Throbber } from '@rocket.chat/fuselage';
import React, { useRef, useState } from 'react';
import { FocusScope } from 'react-aria';
import { createPortal } from 'react-dom';
import { Keyboard, Navigation, Zoom, A11y } from 'swiper';
import type { SwiperRef } from 'swiper/react';
import { type SwiperClass, Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/swiper.css';
import 'swiper/modules/navigation/navigation.min.css';
import 'swiper/modules/keyboard/keyboard.min.css';
import 'swiper/modules/zoom/zoom.min.css';

import ImageGalleryLoader from './ImageGalleryLoader';
import { useImageGallery } from './hooks/useImageGallery';

const swiperStyle = css`
	.swiper {
		width: 100%;
		height: 100%;
	}
	.swiper-container {
		position: absolute;
		z-index: 99;
		top: 0;

		overflow: hidden;

		width: 100%;
		height: 100%;

		background-color: var(--rcx-color-surface-overlay, rgba(0, 0, 0, 0.6));
	}

	.rcx-swiper-close-button,
	.rcx-swiper-prev-button,
	.rcx-swiper-next-button {
		color: var(--rcx-color-font-pure-white, #ffffff) !important;
	}

	.rcx-swiper-close-button {
		position: absolute;
		z-index: 10;
		top: 10px;
		right: 10px;
	}

	.rcx-swiper-prev-button,
	.rcx-swiper-next-button {
		position: absolute;
		z-index: 10;
		top: 50%;

		cursor: pointer;
	}

	.rcx-swiper-prev-button.swiper-button-disabled,
	.rcx-swiper-next-button.swiper-button-disabled {
		cursor: auto;
		pointer-events: none;

		opacity: 0.35;
	}

	.rcx-swiper-prev-button.swiper-button-hidden,
	.rcx-swiper-next-button.swiper-button-hidden {
		cursor: auto;
		pointer-events: none;

		opacity: 0;
	}

	.rcx-swiper-prev-button,
	.swiper-rtl .rcx-swiper-next-button {
		right: auto;
		left: 10px;
	}

	.rcx-swiper-next-button,
	.swiper-rtl .rcx-swiper-prev-button {
		right: 10px;
		left: auto;
	}

	.rcx-lazy-preloader {
		position: absolute;
		z-index: -1;
		left: 50%;
		top: 50%;

		transform: translate(-50%, -50%);

		color: ${Palette.text['font-pure-white']};
	}
`;

const ImageGallery = () => {
	const swiperRef = useRef<SwiperRef>(null);
	const [, setSwiperInst] = useState<SwiperClass>();

	const { isLoading, loadMore, images, onClose } = useImageGallery();

	if (isLoading) {
		return <ImageGalleryLoader onClose={onClose} />;
	}

	return createPortal(
		<FocusScope contain restoreFocus autoFocus>
			<Box className={swiperStyle}>
				<div className='swiper-container'>
					<IconButton icon='cross' aria-label='Close gallery' className='rcx-swiper-close-button' onClick={onClose} />
					<IconButton icon='chevron-right' className='rcx-swiper-prev-button' />
					<IconButton icon='chevron-left' className='rcx-swiper-next-button' />
					<Swiper
						ref={swiperRef}
						navigation={{
							nextEl: '.rcx-swiper-next-button',
							prevEl: '.rcx-swiper-prev-button',
						}}
						keyboard
						zoom
						lazyPreloaderClass='rcx-lazy-preloader'
						runCallbacksOnInit
						onKeyPress={(_, keyCode) => String(keyCode) === '27' && onClose()}
						modules={[Navigation, Zoom, Keyboard, A11y]}
						onInit={(swiper) => setSwiperInst(swiper)}
						onReachEnd={loadMore}
					>
						{images?.map(({ _id, url }) => (
							<SwiperSlide key={_id}>
								<div className='swiper-zoom-container'>
									<img src={url} loading='lazy' />
									<div className='rcx-lazy-preloader'>
										<Throbber inheritColor />
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</Box>
		</FocusScope>,
		document.body,
	);
};

export default ImageGallery;
