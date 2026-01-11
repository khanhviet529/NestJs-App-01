import * as bcrypt from 'bcrypt';
const ROUNDS = 10;

export const hashMake = async (value: string): Promise<string> => {
	const hash = await bcrypt.hash(value, ROUNDS);
	return hash;
};

export const hashCompare = async (value: string, hash: string): Promise<boolean> => {
	return await bcrypt.compare(value, hash);
};