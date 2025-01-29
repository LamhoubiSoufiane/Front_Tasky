export const mockTasks = [
    {
        id: 1,
        nom: "Réunion client",
        description: "Réunion avec le client pour le projet X",
        startDate: new Date("2025-01-23"),
        endDate: new Date("2025-01-23"),
        priority: "NORMALE",
        statut: "AFAIRE",
        member: {
            id: 1,
            name: "John Doe"
        },
        location: {
            id: 1,
            latitude: 33.5731104,  // Casablanca
            longitude: -7.5898434,
            name: "Bureau principal"
        },
        projet: {
            id: 1,
            name: "Projet X"
        }
    },
    {
        id: 2,
        nom: "Maintenance serveur",
        description: "Maintenance des serveurs du datacenter",
        startDate: new Date("2025-01-24"),
        endDate: new Date("2025-01-24"),
        priority: "URGENT",
        statut: "ENCOURS",
        member: {
            id: 2,
            name: "Jane Smith"
        },
        location: {
            id: 2,
            latitude: 33.5933353,
            longitude: -7.6321945,
            name: "Datacenter"
        },
        projet: {
            id: 1,
            name: "Projet X"
        }
    }
];
