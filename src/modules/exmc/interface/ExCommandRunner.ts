import { CommandResult } from '@minecraft/server';

export interface ExCommandNativeRunner{
	runCommandAsync(str:string): Promise<any>;
	runCommand(str:string): CommandResult;
}