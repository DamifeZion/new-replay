export interface ApiResponseI<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: any;
}
