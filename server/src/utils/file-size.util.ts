import { FileSizeI } from "../interfaces/file-size";

const convertFileSize: FileSizeI = (size, unit) => {
	switch (unit) {
		case "kb":
			return size * 1024;
		case "mb":
			return size * 1024 * 1024;
		case "gb":
			return size * 1024 * 1024 * 1024;
		default:
			throw new Error("Invalid unit type. Use 'kb', 'mb', or 'gb'");
	}
};

export { convertFileSize };
