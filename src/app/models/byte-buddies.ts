import { Buddy } from './buddy';
import { ComputerComponent } from './computer-component';
import { Stat } from './stat';

export class ByteBuddies {
    byteCoins: number;
    goldenBits: number;
    buddies: Buddy[];
    ssdBuddies: Buddy[];
    achievements: number[];
    stats: Stat[];
    hdd: ComputerComponent;
    ram: ComputerComponent;
    cpu: ComputerComponent;
    gpu: ComputerComponent;
}
