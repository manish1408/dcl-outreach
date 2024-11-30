export const LoanAutomationFileData =
    [
        {
            type:'proof identify',
            name: 'adharCard',
            extractionId: '-OB5b16azjOUXCOFPqqU',
            batchId: 'b9dAUzUVlw'
        },
        {
            type:'proof identify',
            name: 'passport',
            extractionId: '-OAoMwXvraKgiMOF8LkS',
            batchId: 'j4x5El72g8'
        },
        {           
             type:'proof identify',
            name: 'drivingLicense',
            extractionId: '',
            batchId: ''
        },
        {
            type:'pan card',
            name: 'Pan Card',
            extractionId: '-OAlacFVnxyZ8NW8WwSY',
            batchId: '1xt4WQ5Ysv'
        },
        {
            type:'bank statement',
            name: 'Bank Statement',
            extractionId: '',
            batchId: ''
        },

        {
            type:'proof address',
            name: 'adharCard',
            extractionId: '-OB5b16azjOUXCOFPqqU',
            batchId: '9rxCubDfyE'
        },
        {
            type:'proof address',
            name: 'passport',
            extractionId: '-OAoMwXvraKgiMOF8LkS',
            batchId: 'j4x5El72g8'
        },

        {
            type:'proof address',
            name: 'electricityBill',
            extractionId: '',
            batchId: ''
        },
    ]

    export enum FileType {
        Identify = "proof identify",
        PanCard = "pan card",
        BankStatement = "bank statement",
        ProofAddress = "proof address",
      }