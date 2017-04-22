export class ComputerComponent {
    id: number;
    name: string;
    desc: string;
    price: number;
    type: ComputerComponentType;
}

export enum ComputerComponentType {
    CPU,
    GPU,
    RAM,
    HDD
}
