// In-memory Canvas and ImageData Mock for Pixel Level Comparisons
export function createMockCanvas(width: number, height: number) {
	const pixelBuffer = new Uint8ClampedArray(width * height * 4);
	const data32 = new Uint32Array(pixelBuffer.buffer);

	const context = {
		globalCompositeOperation: "source-over",
		width,
		height,
		drawImage(
			img: {
				_mockData: ArrayBufferView;
				naturalHeight: number;
				naturalWidth: number;
			},
			dx = 0,
			dy = 0,
		) {
			if (img?._mockData) {
				const srcData = img._mockData;
				const src32 = new Uint32Array(srcData.buffer);
				for (let y = 0; y < img.naturalHeight; y++) {
					for (let x = 0; x < img.naturalWidth; x++) {
						const destX = dx + x;
						const destY = dy + y;
						if (destX < width && destY < height) {
							const destIdx = destY * width + destX;
							const srcIdx = y * img.naturalWidth + x;
							data32[destIdx] = src32[srcIdx];
						}
					}
				}
			}
		},
		clearRect(x: number, y: number, w: number, h: number) {
			for (let cy = y; cy < y + h && cy < height; cy++) {
				for (let cx = x; cx < x + w && cx < width; cx++) {
					data32[cy * width + cx] = 0;
				}
			}
		},
		getImageData(_sx: number, _sy: number, sw: number, sh: number) {
			return {
				data: pixelBuffer,
				width: sw,
				height: sh,
			};
		},
		putImageData(
			imgData: { data: ArrayLike<number> },
			_dx: number,
			_dy: number,
		) {
			pixelBuffer.set(imgData.data);
		},
	};

	return {
		width,
		height,
		getContext: (_p0?: string) => context,
		toDataURL: (type?: string) => `data:${type};base64,mockCanvasData`,
		_pixelBuffer: pixelBuffer,
		_data32: data32,
	};
}
