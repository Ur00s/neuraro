export class Layer {
    public numberOfNeurons: number = 2;
    public activation: string = 'relu';

    constructor(numberOfNeurons: number, activation: string) {
        this.numberOfNeurons = numberOfNeurons;
        this.activation = activation;
    }
}