export type Sesame = {
  "metadata": { "address": "2GTUkXFnABGVHFMqT1tVofBLPrBTAxzjb4Z2rpeMGsJG" },
  "version": "0.1.0",
  "name": "sesame",
  "instructions": [
    {
      "name": "createOrganizer",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "organizer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        }
      ]
    },
    {
      "name": "createEvent",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donateTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "organizer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityIssuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityDelete",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityCheckIn",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        },
        {
          "name": "ticketsLimit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "ticketIssue",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "ticketDelete",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "ticketCheckIn",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "ticketMint",
      "accounts": [
        {
          "name": "nftOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOrganizer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "organizer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateEvent",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityIssuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityDelete",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityCheckIn",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "eventNum",
          "type": "u32"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        },
        {
          "name": "ticketsLimit",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "ticketAuthorityIssuer",
            "type": "publicKey"
          },
          {
            "name": "ticketAuthorityDelete",
            "type": "publicKey"
          },
          {
            "name": "ticketAuthorityCheckIn",
            "type": "publicKey"
          },
          {
            "name": "ticketsLimit",
            "type": "u16"
          },
          {
            "name": "ticketsIssued",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "timezone",
            "type": "i16"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "locationType",
            "type": {
              "defined": "LocationType"
            }
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "artwork",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "organizer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "type": "u32"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": {
              "defined": "TicketState"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "LocationType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TXT"
          },
          {
            "name": "GPS"
          },
          {
            "name": "URL"
          }
        ]
      }
    },
    {
      "name": "TicketState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Initial"
          },
          {
            "name": "CheckedIn"
          },
          {
            "name": "Minted"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EventCreated",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OrganizerCreated",
      "fields": [
        {
          "name": "organizer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TicketCheckedIn",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TicketDeleted",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TicketIssued",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TicketNFTMinted",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        },
        {
          "name": "nftAccount",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OverflowError",
      "msg": "Overflow Error"
    },
    {
      "code": 6001,
      "name": "NotAuthorized",
      "msg": "Not authorized to perform this action"
    },
    {
      "code": 6002,
      "name": "NoMoreTicketsLeft",
      "msg": "No more tickets may be issued"
    },
    {
      "code": 6003,
      "name": "TicketAlreadyCheckedIn",
      "msg": "Ticket has already checked in"
    },
    {
      "code": 6004,
      "name": "TicketLimitTooSmall",
      "msg": "Ticket limit is less than the number of tickets already issued"
    },
    {
      "code": 6005,
      "name": "TicketWasNotCheckedIn",
      "msg": "Can not mint NFT for a ticket that was not checked in"
    },
    {
      "code": 6006,
      "name": "InvalidTicketAuthorityIssuer",
      "msg": "The event creator must not be the ticket issue authority"
    },
    {
      "code": 6007,
      "name": "InvalidTicketAuthorityCheckIn",
      "msg": "The event creator must not be the ticket check in authority"
    },
    {
      "code": 6008,
      "name": "InvalidTicketAuthorityDelete",
      "msg": "The event creator must not be the ticket delete authority"
    }
  ]
};

export const IDL: Sesame = {
  "version": "0.1.0",
  "name": "sesame",
  "instructions": [
    {
      "name": "createOrganizer",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "organizer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        }
      ]
    },
    {
      "name": "createEvent",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "donateTo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "organizer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityIssuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityDelete",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityCheckIn",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        },
        {
          "name": "ticketsLimit",
          "type": "u16"
        }
      ]
    },
    {
      "name": "ticketIssue",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "ticketDelete",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "ticketCheckIn",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "ticketMint",
      "accounts": [
        {
          "name": "nftOwner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "ticketOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticket",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "seatId",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateOrganizer",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "organizer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateEvent",
      "accounts": [
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityIssuer",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityDelete",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "ticketAuthorityCheckIn",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "eventNum",
          "type": "u32"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "website",
          "type": "string"
        },
        {
          "name": "ticketsLimit",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "ticketAuthorityIssuer",
            "type": "publicKey"
          },
          {
            "name": "ticketAuthorityDelete",
            "type": "publicKey"
          },
          {
            "name": "ticketAuthorityCheckIn",
            "type": "publicKey"
          },
          {
            "name": "ticketsLimit",
            "type": "u16"
          },
          {
            "name": "ticketsIssued",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "timezone",
            "type": "i16"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          },
          {
            "name": "locationType",
            "type": {
              "defined": "LocationType"
            }
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "artwork",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "organizer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "type": "u32"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "website",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "ticket",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "state",
            "type": {
              "defined": "TicketState"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "LocationType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TXT"
          },
          {
            "name": "GPS"
          },
          {
            "name": "URL"
          }
        ]
      }
    },
    {
      "name": "TicketState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Initial"
          },
          {
            "name": "CheckedIn"
          },
          {
            "name": "Minted"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "EventCreated",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "OrganizerCreated",
      "fields": [
        {
          "name": "organizer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TicketCheckedIn",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TicketDeleted",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TicketIssued",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "TicketNFTMinted",
      "fields": [
        {
          "name": "event",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "ticket",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "seatId",
          "type": "string",
          "index": false
        },
        {
          "name": "nftAccount",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OverflowError",
      "msg": "Overflow Error"
    },
    {
      "code": 6001,
      "name": "NotAuthorized",
      "msg": "Not authorized to perform this action"
    },
    {
      "code": 6002,
      "name": "NoMoreTicketsLeft",
      "msg": "No more tickets may be issued"
    },
    {
      "code": 6003,
      "name": "TicketAlreadyCheckedIn",
      "msg": "Ticket has already checked in"
    },
    {
      "code": 6004,
      "name": "TicketLimitTooSmall",
      "msg": "Ticket limit is less than the number of tickets already issued"
    },
    {
      "code": 6005,
      "name": "TicketWasNotCheckedIn",
      "msg": "Can not mint NFT for a ticket that was not checked in"
    },
    {
      "code": 6006,
      "name": "InvalidTicketAuthorityIssuer",
      "msg": "The event creator must not be the ticket issue authority"
    },
    {
      "code": 6007,
      "name": "InvalidTicketAuthorityCheckIn",
      "msg": "The event creator must not be the ticket check in authority"
    },
    {
      "code": 6008,
      "name": "InvalidTicketAuthorityDelete",
      "msg": "The event creator must not be the ticket delete authority"
    }
  ]
};
