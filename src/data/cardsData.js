export const chanceCards = [
    { id: 1, text: "Speeding fine. Pay ₹150.", type: "pay", amount: 150 },
    { id: 2, text: "You have won a crossword competition. Collect ₹1000.", type: "collect", amount: 1000 },
    { id: 3, text: "Advance to GO. Collect ₹2000.", type: "move", position: 0 },
    { id: 4, text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect ₹200.", type: "move", position: 10 },
    { id: 5, text: "Bank pays you dividend of ₹500.", type: "collect", amount: 500 },
    { id: 6, text: "Get out of Jail free. This card may be kept until needed.", type: "keep", subtype: "out_of_jail" },
    { id: 7, text: "Make general repairs on all your property. For each house pay ₹250. For each hotel ₹1000.", type: "pay_per_building", house: 250, hotel: 1000 },
    { id: 8, text: "Pay poor tax of ₹150.", type: "pay", amount: 150 },
    { id: 9, text: "Take a trip to Mumbai. If you pass GO, collect ₹2000.", type: "move", position: 39 },
    { id: 10, text: "Your building loan matures. Collect ₹1500.", type: "collect", amount: 1500 }
];

export const communityChestCards = [
    { id: 1, text: "Advance to GO. Collect ₹2000.", type: "move", position: 0 },
    { id: 2, text: "Bank error in your favor. Collect ₹2000.", type: "collect", amount: 2000 },
    { id: 3, text: "Doctor's fees. Pay ₹500.", type: "pay", amount: 500 },
    { id: 4, text: "From sale of stock you get ₹500.", type: "collect", amount: 500 },
    { id: 5, text: "Get out of Jail free. This card may be kept until needed.", type: "keep", subtype: "out_of_jail" },
    { id: 6, text: "Go to Jail. Go directly to Jail. Do not pass GO, do not collect ₹200.", type: "move", position: 10 },
    { id: 7, text: "Holiday fund matures. Receive ₹1000.", type: "collect", amount: 1000 },
    { id: 8, text: "Income tax refund. Collect ₹200.", type: "collect", amount: 200 },
    { id: 9, text: "It is your birthday. Collect ₹100 from every player.", type: "collect_from_players", amount: 100 },
    { id: 10, text: "Life insurance matures. Collect ₹1000.", type: "collect", amount: 1000 },
    { id: 11, text: "Pay hospital fees of ₹1000.", type: "pay", amount: 1000 },
    { id: 12, text: "Pay school fees of ₹500.", type: "pay", amount: 500 },
    { id: 13, text: "Receive ₹250 consultancy fee.", type: "collect", amount: 250 },
    { id: 14, text: "You are assessed for street repairs. ₹400 per house, ₹1150 per hotel.", type: "pay_per_building", house: 400, hotel: 1150 },
    { id: 15, text: "You have won second prize in a beauty contest. Collect ₹100.", type: "collect", amount: 100 },
    { id: 16, text: "You inherit ₹1000.", type: "collect", amount: 1000 }
];
