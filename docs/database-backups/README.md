# Database Backups

This directory contains database state backups for the Kusina de Amadeo project. Each backup includes the complete state of:
- Tables
- Enums
- Functions
- Triggers
- Contents
- Storage

## Backup Structure
```
database-backups/
├── README.md                    # This documentation file
├── current/                     # Latest database state
│   ├── schema.json             # Database schema (tables, enums, functions, triggers)
│   ├── contents.json           # Table contents
│   └── storage.json            # Storage bucket contents
└── history/                    # Historical backups
    └── YYYY-MM-DD-HHMMSS/     # Timestamped backups
```

## Backup Process
1. Database state is exported from the admin panel
2. State is organized into separate files for better management
3. Backup is timestamped and stored
4. Documentation is updated

## Latest Backup
- **Date**: 2024-02-08
- **Source**: Admin Panel Database State Export
- **Format**: JSON
- **Location**: `./current/`

## Important Notes
- All backups are in JSON format for compatibility
- Each backup contains the complete database state
- Storage information includes bucket details and object metadata
- Backups should be performed regularly through the admin panel
