type SupportedImage = {
	name: string;
	type: string;
	acceptedTypes: string[];
	extension: string;
};

export const SUPPORTED_IMAGES: SupportedImage[] = [
	{
		name: "PNG",
		type: "image/png",
		acceptedTypes: ["image/png"],
		extension: "png",
	},
	{
		name: "JPEG",
		type: "image/jpeg",
		acceptedTypes: ["image/jpeg", "image/jpg"],
		extension: "jpeg",
	},
	{
		name: "WEBP",
		type: "image/webp",
		acceptedTypes: ["image/webp"],
		extension: "webp",
	},
	{
		name: "SVG",
		type: "image/svg+xml",
		acceptedTypes: ["image/svg+xml"],
		extension: "svg",
	},
];

export const ACCEPTED_TYPES = SUPPORTED_IMAGES.map((image) => image.acceptedTypes).flat();
