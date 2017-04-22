export class ComputerComponent {
    key: string;
    name: string;
    desc: string;
    price: number;
    level: number;
    type: ComputerComponentType;
}

export enum ComputerComponentType {
    CPU,
    GPU,
    RAM,
    HDD
}
