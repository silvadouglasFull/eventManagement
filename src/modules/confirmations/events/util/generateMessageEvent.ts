
export class GenerateMessageEvent {
    public static getStatusMessage(status: number): string {
        const statusMessages: Record<number, string> = {
            1: 'Sua presença foi confirmada!',
            2: 'Sua presença foi recusada.',
            3: 'Aguardando sua resposta.'
        };
        return statusMessages[status] || statusMessages[3]
    }
}